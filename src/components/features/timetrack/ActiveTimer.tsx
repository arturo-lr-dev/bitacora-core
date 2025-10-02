'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { stopTimeEntry, updateStartTime } from '@/app/actions/timetrack';

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
    adjustTime: string;
    adjustStartTime: string;
    save: string;
    cancel: string;
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
  const [showAdjustTime, setShowAdjustTime] = useState(false);
  const [adjustedTime, setAdjustedTime] = useState('');

  useEffect(() => {
    // Actualizar el tiempo actual cada segundo
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Inicializar el input con la hora de inicio actual
    const start = new Date(startTime);
    const hours = String(start.getHours()).padStart(2, '0');
    const minutes = String(start.getMinutes()).padStart(2, '0');
    setAdjustedTime(`${hours}:${minutes}`);
  }, [startTime]);

  async function handleStop() {
    setIsLoading(true);
    await stopTimeEntry(entryId);
    router.refresh();
  }

  async function handleSaveAdjustedTime() {
    setIsLoading(true);

    // Parsear la hora ingresada
    const [hours, minutes] = adjustedTime.split(':').map(Number);

    // Crear nueva fecha con la hora ajustada pero la fecha de hoy
    const newStartTime = new Date();
    newStartTime.setHours(hours, minutes, 0, 0);

    const result = await updateStartTime(entryId, newStartTime);

    if (result.success) {
      setShowAdjustTime(false);
      router.refresh();
    } else {
      alert(result.error);
    }

    setIsLoading(false);
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

        {!showAdjustTime ? (
          <div className="space-y-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAdjustTime(true)}
              disabled={isLoading}
              className="w-full"
            >
              🕐 {labels.adjustTime}
            </Button>
            <Button
              variant="primary"
              onClick={handleStop}
              disabled={isLoading}
              className="w-full"
            >
              ⏹️ {labels.stopWork}
            </Button>
          </div>
        ) : (
          <div className="border-t pt-4 space-y-3">
            <div>
              <Label htmlFor="adjustTime">{labels.adjustStartTime}</Label>
              <Input
                id="adjustTime"
                type="time"
                value={adjustedTime}
                onChange={(e) => setAdjustedTime(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hora actual de inicio: {new Date(startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAdjustTime(false)}
                disabled={isLoading}
                className="flex-1"
              >
                {labels.cancel}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAdjustedTime}
                disabled={isLoading}
                className="flex-1"
              >
                {labels.save}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
