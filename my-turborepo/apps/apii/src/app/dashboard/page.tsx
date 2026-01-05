'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { fetchapi } from '@/src/lib/api';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await fetchapi('/api/projects', { method: 'GET' });
      setProjects(data);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load projects');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    setIsCreating(true);

    try {
      const newProject = await fetchapi('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: projectName.trim() }),
      });
      
      setProjects([newProject, ...projects]);
      setProjectName('');
      setShowCreateModal(false);
      // Redirect to project page
      router.push(`/dashboard/project/${newProject.id}`);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/login');
      } else {
        setError(err.message || 'Failed to create project');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 dark:from-zinc-900 dark:to-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              Webhook Delivery
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-zinc-700 dark:text-zinc-300 font-medium hover:text-blue-600 dark:hover:text-blue-400"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  try {
                    await fetchapi('/api/auth/logout', { method: 'POST' });
                    router.push('/login');
                  } catch (err) {
                    router.push('/login');
                  }
                }}
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Projects</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Manage your webhook delivery projects
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            + New Project
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-12 text-center border border-zinc-200 dark:border-zinc-800">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No projects yet
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Get started by creating your first project
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/project/${project.id}`}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow hover:shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 transition-all hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {project.name}
                  </h3>
                  <svg
                    className="h-5 w-5 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  Created {formatDate(project.createdAt)}
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">
                    {project.apiKey}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Create New Project
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setProjectName('');
                  }}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Project Name
                  </label>
                  <input
                    id="projectName"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My Awesome Project"
                    disabled={isCreating}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                      setProjectName('');
                    }}
                    className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreating ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

