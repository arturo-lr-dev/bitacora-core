'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { stopTimeEntry } from '@/app/actions/timetrack';

interface ActiveTimerProps {
  entryId: string;
  projectName: string;
  taskName: string;
  startTime: Date;
  notes?: string | null;
  labels: {
    activeEntry: string;
    workingOn: string;
    duration: string;
    notes: string;
    stopWork: string;
  };
}

export function ActiveTimer({
  entryId,
  projectName,
  taskName,
  startTime,
  notes,
  labels
}: ActiveTimerProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Actualizar el tiempo actual cada segundo
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function handleStop() {
    setIsLoading(true);
    await stopTimeEntry(entryId);
    router.refresh();
  }

  // Calcular el tiempo transcurrido basándose en la diferencia real entre fechas
  const start = new Date(startTime).getTime();
  const now = currentTime.getTime();
  const elapsedSeconds = Math.floor((now - start) / 1000);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <Card className="border-green-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          {labels.activeEntry}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{labels.workingOn}</p>
          <p className="font-medium">{projectName} - {taskName}</p>
        </div>

        {notes && (
          <div>
            <p className="text-sm text-muted-foreground">{labels.notes}</p>
            <p className="text-sm">{notes}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-1">{labels.duration}</p>
          <p className="text-3xl font-mono font-bold">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleStop}
          disabled={isLoading}
          className="w-full"
        >
          ⏹️ {labels.stopWork}
        </Button>
      </CardContent>
    </Card>
  );
}
