'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { TimeEntryReport } from '@/app/actions/reports';

interface ReportTableProps {
  entries: TimeEntryReport[];
  labels: {
    details: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
    worker: string;
    project: string;
    task: string;
    notes: string;
    noResults: string;
    noResultsDesc: string;
    exportCSV: string;
    hours: string;
    minutes: string;
  };
}

export function ReportTable({ entries, labels }: ReportTableProps) {
  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function formatTime(date: Date) {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDuration(minutes: number | null) {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  function exportToCSV() {
    const headers = [
      labels.date,
      labels.startTime,
      labels.endTime,
      labels.duration,
      labels.worker,
      labels.project,
      labels.task,
      labels.notes,
    ];

    const rows = entries.map(entry => [
      formatDate(entry.startTime),
      formatTime(entry.startTime),
      entry.endTime ? formatTime(entry.endTime) : '-',
      formatDuration(entry.duration),
      entry.user.name || entry.user.email,
      entry.project.name,
      entry.task.name,
      entry.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-2">📊</div>
            <p className="font-medium">{labels.noResults}</p>
            <p className="text-sm mt-1">{labels.noResultsDesc}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{labels.details}</CardTitle>
          <Button onClick={exportToCSV} variant="secondary" size="sm">
            {labels.exportCSV}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-sm">{labels.date}</th>
                <th className="text-left py-3 px-4 font-medium text-sm">{labels.startTime}</th>
                <th className="text-left py-3 px-4 font-medium text-sm">{labels.endTime}</th>
                <th className="text-left py-3 px-4 font-medium text-sm">{labels.duration}</th>
                <th className="text-left py-3 px-4 font-medium text-sm">{labels.worker}</th>
                <th className="text-left py-3 px-4 font-medium text-sm">{labels.project}</th>
                <th className="text-left py-3 px-4 font-medium text-sm">{labels.task}</th>
                <th className="text-left py-3 px-4 font-medium text-sm">{labels.notes}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm">{formatDate(entry.startTime)}</td>
                  <td className="py-3 px-4 text-sm">{formatTime(entry.startTime)}</td>
                  <td className="py-3 px-4 text-sm">
                    {entry.endTime ? formatTime(entry.endTime) : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">
                    {formatDuration(entry.duration)}
                  </td>
                  <td className="py-3 px-4 text-sm">{entry.user.name || entry.user.email}</td>
                  <td className="py-3 px-4 text-sm">{entry.project.name}</td>
                  <td className="py-3 px-4 text-sm">{entry.task.name}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                    {entry.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
