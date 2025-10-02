'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { assignWorkerToProject, removeWorkerFromProject, getWorkers } from '@/app/actions/projects';

interface Worker {
  id: string;
  email: string;
  name: string | null;
}

interface Assignment {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface WorkerAssignmentsProps {
  projectId: string;
  assignments: Assignment[];
  labels: {
    workers: string;
    assignWorker: string;
    selectWorker: string;
    searchWorkers: string;
    noWorkersFound: string;
    workersSelected: string;
    remove: string;
  };
}

export function WorkerAssignments({ projectId, assignments, labels }: WorkerAssignmentsProps) {
  const router = useRouter();
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadWorkers() {
      const workers = await getWorkers();
      setAvailableWorkers(workers);
    }
    loadWorkers();
  }, []);

  useEffect(() => {
    setSelectedWorkerIds(assignments.map(a => a.user.id));
  }, [assignments]);

  async function handleSave() {
    setIsLoading(true);

    const assignedWorkerIds = assignments.map(a => a.user.id);

    // Agregar nuevos workers
    const workersToAdd = selectedWorkerIds.filter(id => !assignedWorkerIds.includes(id));
    for (const workerId of workersToAdd) {
      await assignWorkerToProject(projectId, workerId);
    }

    // Eliminar workers deseleccionados
    const workersToRemove = assignedWorkerIds.filter(id => !selectedWorkerIds.includes(id));
    for (const workerId of workersToRemove) {
      await removeWorkerFromProject(projectId, workerId);
    }

    setIsLoading(false);
    router.refresh();
  }

  function toggleWorker(workerId: string) {
    setSelectedWorkerIds(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  }

  const filteredWorkers = availableWorkers.filter(worker => {
    const searchLower = searchQuery.toLowerCase();
    return (
      worker.name?.toLowerCase().includes(searchLower) ||
      worker.email.toLowerCase().includes(searchLower)
    );
  });

  const hasChanges = JSON.stringify(selectedWorkerIds.sort()) !== JSON.stringify(assignments.map(a => a.user.id).sort());

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder={labels.searchWorkers}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
      />

      <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
        {filteredWorkers.length > 0 ? (
          filteredWorkers.map(worker => (
            <label
              key={worker.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={selectedWorkerIds.includes(worker.id)}
                onChange={() => toggleWorker(worker.id)}
                disabled={isLoading}
                className="w-4 h-4 rounded border-input"
              />
              <div className="flex-1">
                <span className="text-sm font-medium">
                  {worker.name || worker.email}
                </span>
                {worker.name && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {worker.email}
                  </span>
                )}
              </div>
            </label>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {labels.noWorkersFound}
          </p>
        )}
      </div>

      {selectedWorkerIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedWorkerIds.length} {labels.workersSelected}
        </p>
      )}

      {hasChanges && (
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      )}
    </div>
  );
}
