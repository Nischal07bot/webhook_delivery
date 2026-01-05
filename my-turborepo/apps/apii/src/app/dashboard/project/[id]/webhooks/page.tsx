'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchapi } from '@/src/lib/api';
import Link from 'next/link';

interface Webhook {
  id: string;
  url: string;
  secret: string;
  isActive: boolean;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  apiKey: string;
}

export default function WebhooksPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [secretVisible, setSecretVisible] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadWebhooks();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const projects = await fetchapi('/api/projects', { method: 'GET' });
      const foundProject = projects.find((p: Project) => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
      }
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/login');
      }
    }
  };

  const loadWebhooks = async () => {
    try {
      setIsLoading(true);
      const data = await fetchapi(`/api/webhooks?projectId=${projectId}`, { method: 'GET' });
      setWebhooks(data);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load webhooks');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWebhook = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!webhookUrl.trim()) {
      setError('Webhook URL is required');
      return;
    }

    // Basic URL validation
    try {
      new URL(webhookUrl.trim());
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsCreating(true);

    try {
      const newWebhook = await fetchapi('/api/webhooks', {
        method: 'POST',
        body: JSON.stringify({ projectId, url: webhookUrl.trim() }),
      });
      
      setWebhooks([...webhooks, { ...newWebhook, isActive: true, createdAt: new Date().toISOString() }]);
      setWebhookUrl('');
      setShowCreateModal(false);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/login');
      } else {
        setError(err.message || 'Failed to create webhook');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [id]: true });
      setTimeout(() => {
        setCopied({ ...copied, [id]: false });
      }, 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied({ ...copied, [id]: true });
      setTimeout(() => {
        setCopied({ ...copied, [id]: false });
      }, 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 dark:from-zinc-900 dark:to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
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
            ← Projects
          </Link>
          <span className="mx-2 text-zinc-400">/</span>
          <Link
            href={`/dashboard/project/${projectId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {project.name}
          </Link>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Webhooks
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage webhook endpoints for {project.name}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            + Add Webhook
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800">
          <nav className="flex gap-8">
            <Link
              href={`/dashboard/project/${projectId}`}
              className="pb-4 px-1 border-b-2 border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
            >
              Overview
            </Link>
            <Link
              href={`/dashboard/project/${projectId}/webhooks`}
              className="pb-4 px-1 border-b-2 border-blue-700 dark:border-blue-400 text-blue-700 dark:text-blue-400 font-medium"
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Webhooks List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : webhooks.length === 0 ? (
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
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No webhooks yet
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Create your first webhook endpoint to start receiving events
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Add Webhook
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {webhook.url}
                      </h3>
                      {webhook.isActive ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 text-xs font-medium rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Created {formatDate(webhook.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Webhook Secret
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSecretVisible({ ...secretVisible, [webhook.id]: !secretVisible[webhook.id] })}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {secretVisible[webhook.id] ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(webhook.secret, webhook.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {copied[webhook.id] ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <code className="block font-mono text-sm text-zinc-900 dark:text-zinc-100 break-all">
                    {secretVisible[webhook.id] ? webhook.secret : 'whsec_' + '•'.repeat(48)}
                  </code>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Use this secret to verify webhook signatures
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Webhook Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Add Webhook Endpoint
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setWebhookUrl('');
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

              <form onSubmit={handleCreateWebhook} className="space-y-4">
                <div>
                  <label
                    htmlFor="webhookUrl"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Webhook URL
                  </label>
                  <input
                    id="webhookUrl"
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/webhook"
                    disabled={isCreating}
                    autoFocus
                    required
                  />
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    The URL where webhook events will be delivered
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                      setWebhookUrl('');
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
                    {isCreating ? 'Creating...' : 'Create Webhook'}
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

