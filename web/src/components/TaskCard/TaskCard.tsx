import { useState, useCallback, useRef, useEffect } from 'react';
import { TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Task, TaskStatus } from '@/types/task.types';
import { formatDate } from '@/utils/formatDate';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-orange-100 text-orange-800' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-800' },
};

const priorityConfig = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-800' },
  high: { label: 'High', className: 'bg-red-100 text-red-800' },
} as const;

const nextStatus: Record<TaskStatus, TaskStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
};

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = descRef.current;
    if (el) setIsClamped(el.scrollHeight > el.clientHeight);
  }, [task.description]);

  const handleStatusToggle = useCallback(() => {
    onStatusChange(task.id, nextStatus[task.status]);
  }, [task.id, task.status, onStatusChange]);

  const handleConfirmDelete = useCallback(() => {
    onDelete(task.id);
    setShowDeleteDialog(false);
  }, [task.id, onDelete]);

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  return (
    <>
      <div className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-card-foreground truncate">{task.title}</h3>
            {task.description && (
              <p
                ref={descRef}
                className={`mt-1 text-sm text-muted-foreground ${expanded ? '' : 'line-clamp-2'}`}
              >
                {task.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            aria-label="Delete task"
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex cursor-pointer items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
              onClick={handleStatusToggle}
            >
              {status.label}
            </span>
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
          {(isClamped || expanded) && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 text-xs text-primary hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
