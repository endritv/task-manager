import { useState, useMemo, useCallback } from 'react';
import { PlusIcon, MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
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
import { Pagination } from '@/components/ui/pagination';
import { useTasks } from '@/hooks/useTasks';
import { getApiError } from '@/utils/getApiError';
import type { TaskStatus, CreateTaskDto } from '@/types/task.types';

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
    setPage,
    perPage,
    setPerPage,
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
      try {
        await updateTask(id, { status });
        toast.success('Status updated');
      } catch (err) {
        toast.error(getApiError(err));
      }
    },
    [updateTask]
  );

  const handleEdit = useCallback(
    async (id: number, dto: CreateTaskDto) => {
      await updateTask(id, dto);
      toast.success('Task updated');
    },
    [updateTask]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteTask(id);
        toast.success('Task deleted');
      } catch (err) {
        toast.error(getApiError(err));
      }
    },
    [deleteTask]
  );

  const handleCreate = async (dto: CreateTaskDto) => {
    await createTask(dto);
    setShowForm(false);
    toast.success('Task created');
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
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center sm:p-12">
        <ExclamationTriangleIcon className="size-10 text-muted-foreground" />
        <p className="mt-3 font-medium">Unable to connect</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Make sure the API server is running on port 8000
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Tasks</h1>
        <Button onClick={() => setShowForm(true)} size="sm" className="sm:size-default">
          <PlusIcon className="mr-1.5 size-4" />
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
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

        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              if (!val) return;
              setStatusFilter(val as TaskStatus | 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="flex-1 sm:w-[140px]">
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
            <SelectTrigger className="flex-1 sm:w-[160px]">
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
      </div>

      {/* Task List */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-3 shadow-sm sm:p-4">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="size-8 rounded-md" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between sm:mt-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="hidden h-4 w-24 sm:block" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center sm:p-12">
          <p className="text-sm text-muted-foreground sm:text-base">
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
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && (
        <Pagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
        />
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
