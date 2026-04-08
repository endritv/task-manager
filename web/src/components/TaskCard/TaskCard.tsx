import { useCallback } from 'react';
import { TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Task, TaskStatus } from '@/types/task.types';
import { formatDate } from '@/utils/formatDate';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
}

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  in_progress: { label: 'In Progress', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
};

const priorityConfig = {
  low: { label: 'Low', className: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', className: 'bg-red-100 text-red-800' },
} as const;

const nextStatus: Record<TaskStatus, TaskStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
};

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const handleStatusToggle = useCallback(() => {
    onStatusChange(task.id, nextStatus[task.status]);
  }, [task.id, task.status, onStatusChange]);

  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-card-foreground truncate">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label="Delete task"
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge
          variant={status.variant}
          className="cursor-pointer"
          onClick={handleStatusToggle}
        >
          {status.label}
        </Badge>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priority.className}`}>
          {priority.label}
        </span>
        {task.dueDate && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarIcon className="size-3" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
