'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { uploadTaskAttachment } from '@/app/actions/attachments';

interface Project {
  id: string;
  name: string;
  tasks: {
    id: string;
    name: string;
  }[];
}

interface TaskFileUploadProps {
  projects: Project[];
  labels: {
    title: string;
    selectProject: string;
    selectTask: string;
    selectFiles: string;
    upload: string;
    uploadSuccess: string;
    uploadError: string;
    maxFileSize: string;
  };
}

export function TaskFileUpload({ projects, labels }: TaskFileUploadProps) {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const availableTasks = selectedProject?.tasks || [];

  function handleProjectChange(projectId: string) {
    setSelectedProjectId(projectId);
    setSelectedTaskId('');
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  }

  function removeFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (!selectedTaskId || selectedFiles.length === 0) return;

    setIsUploading(true);
    setMessage(null);

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadTaskAttachment(selectedTaskId, formData);

        if (!result.success) {
          setMessage({ type: 'error', text: result.error });
          setIsUploading(false);
          return;
        }
      }

      setMessage({ type: 'success', text: labels.uploadSuccess });
      setSelectedFiles([]);
      setSelectedTaskId('');
      setSelectedProjectId('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: labels.uploadError });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de Proyecto */}
        <div>
          <Label>{labels.selectProject}</Label>
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">-- {labels.selectProject} --</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Tarea */}
        {selectedProjectId && (
          <div>
            <Label>{labels.selectTask}</Label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={availableTasks.length === 0}
            >
              <option value="">-- {labels.selectTask} --</option>
              {availableTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Selector de Archivos */}
        {selectedTaskId && (
          <div>
            <Label>{labels.selectFiles}</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                {labels.selectFiles}
              </Button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                  >
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-3 text-destructive hover:text-destructive/80"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              {labels.maxFileSize}
            </p>
          </div>
        )}

        {/* Botón de Subida */}
        {selectedFiles.length > 0 && (
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? '...' : labels.upload}
          </Button>
        )}

        {/* Mensajes */}
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
