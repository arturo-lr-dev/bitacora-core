'use client';

import { useState, useEffect } from 'react';
import { ReportFilters } from './ReportFilters';
import { ReportSummary } from './ReportSummary';
import { ReportTable } from './ReportTable';
import { getReportData, getReportSummary } from '@/app/actions/reports';
import type { ReportFilters as Filters, TimeEntryReport } from '@/app/actions/reports';

interface ReportsClientProps {
  projects: { id: string; name: string }[];
  users: { id: string; name: string | null; email: string }[];
  tasks: { id: string; name: string; projectId: string }[];
  labels: {
    filters: string;
    startDate: string;
    endDate: string;
    project: string;
    user: string;
    task: string;
    status: string;
    allProjects: string;
    allUsers: string;
    allTasks: string;
    allStatuses: string;
    inProgress: string;
    completed: string;
    cancelled: string;
    applyFilters: string;
    clearFilters: string;
    summary: string;
    totalEntries: string;
    totalHours: string;
    byUser: string;
    byProject: string;
    entries: string;
    hours: string;
    estimatedCost: string;
    details: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
    worker: string;
    notes: string;
    noResults: string;
    noResultsDesc: string;
    exportCSV: string;
    loading: string;
    minutes: string;
  };
}

export function ReportsClient({ projects, users, tasks, labels }: ReportsClientProps) {
  const [filters, setFilters] = useState<Filters>({});
  const [entries, setEntries] = useState<TimeEntryReport[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleFilterChange(newFilters: Filters) {
    setFilters(newFilters);
    setIsLoading(true);

    try {
      const [reportData, reportSummary] = await Promise.all([
        getReportData(newFilters),
        getReportSummary(newFilters),
      ]);

      setEntries(reportData);
      setSummary(reportSummary);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    handleFilterChange({});
  }, []);

  return (
    <div className="space-y-6">
      <ReportFilters
        projects={projects}
        users={users}
        tasks={tasks}
        onFilterChange={handleFilterChange}
        labels={{
          filters: labels.filters,
          startDate: labels.startDate,
          endDate: labels.endDate,
          project: labels.project,
          user: labels.user,
          task: labels.task,
          status: labels.status,
          allProjects: labels.allProjects,
          allUsers: labels.allUsers,
          allTasks: labels.allTasks,
          allStatuses: labels.allStatuses,
          inProgress: labels.inProgress,
          completed: labels.completed,
          cancelled: labels.cancelled,
          applyFilters: labels.applyFilters,
          clearFilters: labels.clearFilters,
        }}
      />

      {isLoading ? (
        <div className="space-y-6">
          {/* Summary Skeleton */}
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(i => (
              <div key={i} className="bg-card rounded-lg border border-border p-6 overflow-hidden relative">
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-10 bg-muted rounded w-1/2" />
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/20 to-transparent" />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-card rounded-lg border border-border overflow-hidden relative">
            <div className="p-6 border-b">
              <div className="h-6 bg-muted rounded w-1/4" />
            </div>
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="h-4 bg-muted rounded flex-1" />
                  <div className="h-4 bg-muted rounded flex-1" />
                  <div className="h-4 bg-muted rounded flex-1" />
                  <div className="h-4 bg-muted rounded flex-1" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/20 to-transparent" />
          </div>
        </div>
      ) : (
        <>
          {summary && (
            <ReportSummary
              summary={summary}
              labels={{
                summary: labels.summary,
                totalEntries: labels.totalEntries,
                totalHours: labels.totalHours,
                byUser: labels.byUser,
                byProject: labels.byProject,
                entries: labels.entries,
                hours: labels.hours,
                estimatedCost: labels.estimatedCost,
              }}
            />
          )}

          <ReportTable
            entries={entries}
            labels={{
              details: labels.details,
              date: labels.date,
              startTime: labels.startTime,
              endTime: labels.endTime,
              duration: labels.duration,
              worker: labels.worker,
              project: labels.project,
              task: labels.task,
              notes: labels.notes,
              noResults: labels.noResults,
              noResultsDesc: labels.noResultsDesc,
              exportCSV: labels.exportCSV,
              hours: labels.hours,
              minutes: labels.minutes,
            }}
          />
        </>
      )}
    </div>
  );
}
