'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { ProjectModal } from './ProjectModal';

interface Assignment {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface ProjectWithAssignments extends Project {
  assignments?: Assignment[];
}

interface ProjectDetailHeaderProps {
  project: ProjectWithAssignments;
  editLabel: string;
  statusColors: Record<string, string>;
  statusLabel: string;
}

export function ProjectDetailHeader({
  project,
  editLabel,
  statusColors,
  statusLabel
}: ProjectDetailHeaderProps) {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);

  function handleCloseModal() {
    setShowEditModal(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <span
            className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
              statusColors[project.status]
            }`}
          >
            {statusLabel}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowEditModal(true)}
        >
          ✏️ {editLabel}
        </Button>
      </div>

      {project.description && (
        <p className="text-muted-foreground mt-4">{project.description}</p>
      )}

      {showEditModal && (
        <ProjectModal
          project={project}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
