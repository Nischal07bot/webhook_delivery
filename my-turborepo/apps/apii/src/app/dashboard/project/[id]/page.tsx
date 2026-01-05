'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchapi } from '@/src/lib/api';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const projects = await fetchapi('/api/projects', { method: 'GET' });
      const foundProject = projects.find((p: Project) => p.id === projectId);
      
      if (!foundProject) {
        setError('Project not found');
        return;
      }
      
      setProject(foundProject);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load project');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 dark:from-zinc-900 dark:to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 dark:from-zinc-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Project not found'}</p>
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Projects
          </Link>
        </nav>

        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {project.name}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Created {formatDate(project.createdAt)}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800">
          <nav className="flex gap-8">
            <Link
              href={`/dashboard/project/${projectId}`}
              className="pb-4 px-1 border-b-2 border-blue-700 dark:border-blue-400 text-blue-700 dark:text-blue-400 font-medium"
            >
              Overview
            </Link>
            <Link
              href={`/dashboard/project/${projectId}/webhooks`}
              className="pb-4 px-1 border-b-2 border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
            >
              Webhooks
            </Link>
            <Link
              href={`/dashboard/project/${projectId}/deliveries`}
              className="pb-4 px-1 border-b-2 border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
            >
              Deliveries
            </Link>
          </nav>
        </div>

        {/* API Key Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              API Key
            </h2>
            <button
              onClick={() => setApiKeyVisible(!apiKeyVisible)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {apiKeyVisible ? 'Hide' : 'Show'} API Key
            </button>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 flex items-center justify-between gap-4">
            <code className="flex-1 font-mono text-sm text-zinc-900 dark:text-zinc-100 break-all">
              {apiKeyVisible ? project.apiKey : 'sk_' + '•'.repeat(48)}
            </code>
            <button
              onClick={() => copyToClipboard(project.apiKey)}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Use this API key to authenticate requests to the Webhook Delivery API. Keep it secure and never share it publicly.
          </p>
        </div>

        {/* Quick Start Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Quick Start
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                1. Create a Webhook Endpoint
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                Add a webhook endpoint to receive events.
              </p>
              <Link
                href={`/dashboard/project/${projectId}/webhooks`}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                Go to Webhooks →
              </Link>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                2. Send Events
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                Use the API to send events that will be delivered to your webhooks.
              </p>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 mt-2">
                <code className="text-xs text-zinc-900 dark:text-zinc-100 font-mono">
                  POST /api/events<br />
                  Authorization: Bearer {project.apiKey.substring(0, 20)}...
                </code>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                3. Monitor Deliveries
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                Track the status of your webhook deliveries.
              </p>
              <Link
                href={`/dashboard/project/${projectId}/deliveries`}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View Deliveries →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

