'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchapi, fetchapiWithAuth } from '@/src/lib/api';
import Link from 'next/link';

interface Delivery {
  id: string;
  eventId: string;
  webhookId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'RETRYING' | 'DEAD';
  attempt: number;
  responseCode?: number;
  error?: string;
  createdAt: string;
  event: {
    id: string;
    type: string;
    payload: any;
    createdAt: string;
  };
  webhook: {
    id: string;
    url: string;
  };
}

interface Project {
  id: string;
  name: string;
  apiKey: string;
}

type DeliveryStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'RETRYING' | 'DEAD' | 'ALL';

export default function DeliveriesPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus>('ALL');
  const [replayingId, setReplayingId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (project) {
      loadDeliveries();
    }
  }, [project, statusFilter]);

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

  const loadDeliveries = async () => {
    if (!project) return;
    
    try {
      setIsLoading(true);
      const url = statusFilter === 'ALL' 
        ? '/api/deliveries' 
        : `/api/deliveries?status=${statusFilter}`;
      
      const data = await fetchapiWithAuth(url, project.apiKey, { method: 'GET' });
      setDeliveries(data.deliveries || []);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load deliveries');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplay = async (deliveryId: string) => {
    if (!project) return;
    
    try {
      setReplayingId(deliveryId);
      await fetchapiWithAuth(`/api/deliveries/${deliveryId}/replay`, project.apiKey, {
        method: 'POST',
      });
      
      // Reload deliveries after replay
      await loadDeliveries();
    } catch (err: any) {
      setError(err.message || 'Failed to replay delivery');
    } finally {
      setReplayingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'FAILED':
      case 'DEAD':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'RETRYING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'PENDING':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const statusCounts = {
    ALL: deliveries.length,
    PENDING: deliveries.filter(d => d.status === 'PENDING').length,
    SUCCESS: deliveries.filter(d => d.status === 'SUCCESS').length,
    FAILED: deliveries.filter(d => d.status === 'FAILED').length,
    RETRYING: deliveries.filter(d => d.status === 'RETRYING').length,
    DEAD: deliveries.filter(d => d.status === 'DEAD').length,
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Deliveries
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Monitor webhook delivery status for {project.name}
          </p>
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
              className="pb-4 px-1 border-b-2 border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
            >
              Webhooks
            </Link>
            <Link
              href={`/dashboard/project/${projectId}/deliveries`}
              className="pb-4 px-1 border-b-2 border-blue-700 dark:border-blue-400 text-blue-700 dark:text-blue-400 font-medium"
            >
              Deliveries
            </Link>
          </nav>
        </div>

        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'SUCCESS', 'FAILED', 'RETRYING', 'DEAD'] as DeliveryStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-700 text-white'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {status} {statusCounts[status] > 0 && `(${statusCounts[status]})`}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Deliveries List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : deliveries.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No deliveries found
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {statusFilter === 'ALL' 
                ? 'Deliveries will appear here once you start sending events'
                : `No ${statusFilter.toLowerCase()} deliveries found`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                      {delivery.responseCode && (
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          HTTP {delivery.responseCode}
                        </span>
                      )}
                      {delivery.attempt > 1 && (
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          Attempt {delivery.attempt}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      {formatDate(delivery.createdAt)}
                    </p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-2">
                      Event: <span className="font-mono text-xs">{delivery.event.type}</span>
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      Webhook: <span className="font-mono text-xs">{delivery.webhook.url}</span>
                    </p>
                    {delivery.error && (
                      <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Error:</p>
                        <p className="text-xs text-red-600 dark:text-red-300 font-mono break-all">
                          {delivery.error}
                        </p>
                      </div>
                    )}
                  </div>
                  {delivery.status === 'DEAD' && (
                    <button
                      onClick={() => handleReplay(delivery.id)}
                      disabled={replayingId === delivery.id}
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {replayingId === delivery.id ? 'Replaying...' : 'Replay'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

