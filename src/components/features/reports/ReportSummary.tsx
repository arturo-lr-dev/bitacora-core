'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface ReportSummaryProps {
  summary: {
    totalEntries: number;
    totalHours: number;
    byUser: Array<{
      user: { id: string; name: string | null; email: string };
      totalMinutes: number;
      entriesCount: number;
    }>;
    byProject: Array<{
      project: { id: string; name: string; clientName: string | null; hourlyRate: number | null };
      totalMinutes: number;
      entriesCount: number;
      estimatedCost: number;
    }>;
  };
  labels: {
    summary: string;
    totalEntries: string;
    totalHours: string;
    byUser: string;
    byProject: string;
    entries: string;
    hours: string;
    estimatedCost: string;
  };
}

export function ReportSummary({ summary, labels }: ReportSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Totales */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{labels.totalEntries}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.totalEntries}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{labels.totalHours}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.totalHours.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Por Usuario */}
      {summary.byUser.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{labels.byUser}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.byUser.map(item => (
                <div key={item.user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{item.user.name || item.user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.entriesCount} {labels.entries}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{(item.totalMinutes / 60).toFixed(2)} {labels.hours}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Por Proyecto */}
      {summary.byProject.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{labels.byProject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.byProject.map(item => (
                <div key={item.project.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{item.project.name}</p>
                      {item.project.clientName && (
                        <p className="text-sm text-muted-foreground">{item.project.clientName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{(item.totalMinutes / 60).toFixed(2)} {labels.hours}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.entriesCount} {labels.entries}
                      </p>
                    </div>
                  </div>
                  {item.estimatedCost > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-sm">
                        <span className="text-muted-foreground">{labels.estimatedCost}: </span>
                        <span className="font-semibold">€{item.estimatedCost.toFixed(2)}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
