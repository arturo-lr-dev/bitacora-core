'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { startTimeEntry } from '@/app/actions/timetrack';
import { Project, Task } from '@prisma/client';

interface ProjectWithTasks extends Project {
  tasks: Task[];
}

interface StartTimeEntryProps {
  projects: ProjectWithTasks[];
  labels: {
    startWork: string;
    project: string;
    selectTask: string;
    addNotes: string;
  };
}

export function StartTimeEntry({ projects, labels }: StartTimeEntryProps) {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  async function handleStart() {
    if (!selectedProjectId || !selectedTaskId) return;

    setIsLoading(true);
    const result = await startTimeEntry(selectedProjectId, selectedTaskId, notes);

    if (result.success) {
      setSelectedProjectId('');
      setSelectedTaskId('');
      setNotes('');
      router.refresh();
    } else {
      alert(result.error);
    }

    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.startWork}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="project">{labels.project}</Label>
          <select
            id="project"
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedTaskId('');
            }}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm mt-1"
            disabled={isLoading}
          >
            <option value="">Seleccionar proyecto...</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProject && selectedProject.tasks.length > 0 && (
          <div>
            <Label htmlFor="task">{labels.selectTask}</Label>
            <select
              id="task"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm mt-1"
              disabled={isLoading}
            >
              <option value="">Seleccionar tarea...</option>
              {selectedProject.tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <Label htmlFor="notes">{labels.addNotes}</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
            placeholder="Descripción de lo que vas a trabajar..."
            disabled={isLoading}
          />
        </div>

        <Button
          variant="primary"
          onClick={handleStart}
          disabled={!selectedProjectId || !selectedTaskId || isLoading}
          className="w-full"
        >
          ▶️ {labels.startWork}
        </Button>
      </CardContent>
    </Card>
  );
}
