import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

const PER_PAGE_OPTIONS = [10, 15, 25, 50];

function getPageNumbers(current: number, last: number): (number | '...')[] {
  if (last <= 5) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < last - 2) pages.push('...');

  pages.push(last);
  return pages;
}

export function Pagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
}: PaginationProps) {
  const pages = getPageNumbers(currentPage, lastPage);

  return (
    <div className="flex flex-col items-center gap-3 border-t pt-4 sm:flex-row sm:justify-between">
      {/* Per page selector */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span>Items per page</span>
      </div>

      {/* Page info */}
      <span className="text-xs text-muted-foreground sm:text-sm">
        Page {currentPage} of {lastPage}
        <span className="ml-2 text-muted-foreground/70">
          ({total} {total === 1 ? 'task' : 'tasks'} total)
        </span>
      </span>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <ChevronDoubleLeftIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="size-3.5" />
        </Button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-1 text-sm text-muted-foreground">...</span>
          ) : (
            <Button
              key={p}
              variant={p === currentPage ? 'default' : 'outline'}
              size="icon"
              className="size-8 text-xs"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRightIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(lastPage)}
          aria-label="Last page"
        >
          <ChevronDoubleRightIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
