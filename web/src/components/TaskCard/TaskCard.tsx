import { useState, useCallback, useRef, useEffect } from 'react';
import { TrashIcon, PencilIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm/TaskForm';
import type { Task, TaskStatus, CreateTaskDto } from '@/types/task.types';
import { formatDate } from '@/utils/formatDate';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onEdit: (id: number, dto: CreateTaskDto) => Promise<void>;
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

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
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

  const handleEdit = async (dto: CreateTaskDto) => {
    await onEdit(task.id, dto);
    setShowEditDialog(false);
  };

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  return (
    <>
      <div className="rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-card-foreground truncate sm:text-base">{task.title}</h3>
            {task.description && (
              <p
                ref={descRef}
                className={`mt-1 text-xs text-muted-foreground sm:text-sm ${expanded ? '' : 'line-clamp-2'}`}
              >
                {task.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditDialog(true)}
              aria-label="Edit task"
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <PencilIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              aria-label="Delete task"
              className="size-8 text-muted-foreground hover:text-destructive"
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between sm:mt-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm task={task} onSubmit={handleEdit} onCancel={() => setShowEditDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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
