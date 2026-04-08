import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Toaster } from '@/components/ui/sonner';
import { TaskList } from '@/components/TaskList/TaskList';
import { Dashboard } from '@/components/Dashboard/Dashboard';
import * as React from "react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-4 sm:gap-6">
          <span className="text-base font-bold sm:text-lg">Task Manager</span>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <ClipboardDocumentListIcon className="size-4" />
            Tasks
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <ChartBarIcon className="size-4" />
            Dashboard
          </NavLink>
        </div>
      </nav>
      <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-4xl px-3 py-4 sm:px-4 sm:py-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
