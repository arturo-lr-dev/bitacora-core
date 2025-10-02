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
        <div className="text-center py-12 text-muted-foreground">
          <p>{labels.loading}</p>
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
