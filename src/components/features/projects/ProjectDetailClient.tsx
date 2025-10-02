'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { TaskList } from './TaskList';
import { TaskModal } from './TaskModal';

interface ProjectDetailClientProps {
  projectId: string;
  projectName: string;
  tasks: Task[];
  addTaskLabel: string;
}

export function ProjectDetailClient({
  projectId,
  projectName,
  tasks,
  addTaskLabel
}: ProjectDetailClientProps) {
  const router = useRouter();
  const [showTaskModal, setShowTaskModal] = useState(false);

  function handleRefresh() {
    router.refresh();
  }

  function handleCloseModal() {
    setShowTaskModal(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowTaskModal(true)}
        >
          + {addTaskLabel}
        </Button>
      </div>

      <TaskList tasks={tasks} onRefresh={handleRefresh} />

      {showTaskModal && (
        <TaskModal
          projectId={projectId}
          projectName={projectName}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
