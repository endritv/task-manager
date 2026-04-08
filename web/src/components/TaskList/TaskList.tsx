import { useState, useMemo, useCallback } from 'react';
import { PlusIcon, MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskCard } from '@/components/TaskCard/TaskCard';
import { TaskForm } from '@/components/TaskForm/TaskForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useTasks } from '@/hooks/useTasks';
import type { TaskStatus } from '@/types/task.types';

const statusLabels: Record<string, string> = {
  all: 'All Status',
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const sortLabels: Record<string, string> = {
  '-created_at': 'Newest First',
  created_at: 'Oldest First',
  '-priority': 'Priority (High)',
  priority: 'Priority (Low)',
  title: 'Title (A-Z)',
  '-due_date': 'Due Date (Latest)',
  due_date: 'Due Date (Earliest)',
};

export function TaskList() {
  const {
    tasks,
    meta,
    loading,
    error,
    page,
    setPage,
    sortBy,
    setSortBy,
    direction,
    setDirection,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) &&
          (statusFilter === 'all' || t.status === statusFilter)
      ),
    [tasks, search, statusFilter]
  );

  const handleStatusChange = useCallback(
    async (id: number, status: TaskStatus) => {
      await updateTask(id, { status });
    },
    [updateTask]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteTask(id);
    },
    [deleteTask]
  );

  const handleCreate = async (dto: Parameters<typeof createTask>[0]) => {
    await createTask(dto);
    setShowForm(false);
  };

  const handleSortChange = (value: string) => {
    if (value.startsWith('-')) {
      setSortBy(value.slice(1));
      setDirection('desc');
    } else {
      setSortBy(value);
      setDirection('asc');
    }
    setPage(1);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <ExclamationTriangleIcon className="size-10 text-muted-foreground" />
        <p className="mt-3 font-medium">Unable to connect</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Make sure the API server is running on port 8000
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <Button onClick={() => setShowForm(true)}>
          <PlusIcon className="mr-2 size-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(val) => {
            if (!val) return;
            setStatusFilter(val as TaskStatus | 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-35">
            <SelectValue>{statusLabels[statusFilter]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={direction === 'desc' ? `-${sortBy}` : sortBy}
          onValueChange={(val) => { if (val) handleSortChange(val); }}
        >
          <SelectTrigger className="w-40">
            <SelectValue>{sortLabels[direction === 'desc' ? `-${sortBy}` : sortBy]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_at">Newest First</SelectItem>
            <SelectItem value="created_at">Oldest First</SelectItem>
            <SelectItem value="-priority">Priority (High)</SelectItem>
            <SelectItem value="priority">Priority (Low)</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
            <SelectItem value="-due_date">Due Date (Latest)</SelectItem>
            <SelectItem value="due_date">Due Date (Earliest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-4 w-2/5" />
                </div>
                <Skeleton className="size-8 shrink-0 rounded-md" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {search || statusFilter !== 'all'
              ? 'No tasks match your filters'
              : 'No tasks yet. Create your first one!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.last_page}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
