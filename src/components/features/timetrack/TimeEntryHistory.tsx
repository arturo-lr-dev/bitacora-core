'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TimeEntry, Project, Task } from '@prisma/client';

interface TimeEntryWithRelations extends TimeEntry {
  project: Project;
  task: Task;
}

interface TimeEntryHistoryProps {
  entries: TimeEntryWithRelations[];
  labels: {
    history: string;
    today: string;
    thisWeek: string;
    thisMonth: string;
    totalHours: string;
    noEntries: string;
    hours: string;
    minutes: string;
    startTime: string;
    endTime: string;
    project: string;
    task: string;
    notes: string;
  };
}

export function TimeEntryHistory({ entries, labels }: TimeEntryHistoryProps) {
  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  function formatTime(date: Date) {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  function formatDuration(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{labels.history}</CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{labels.totalHours}</p>
            <p className="text-2xl font-bold">
              {totalHours}h {remainingMinutes}m
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{labels.noEntries}</p>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium">{entry.project.name}</p>
                    <p className="text-sm text-muted-foreground">{entry.task.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium">
                      {entry.duration ? formatDuration(entry.duration) : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.startTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>🕐 {formatTime(entry.startTime)}</span>
                  {entry.endTime && <span>→ {formatTime(entry.endTime)}</span>}
                </div>

                {entry.notes && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    "{entry.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
