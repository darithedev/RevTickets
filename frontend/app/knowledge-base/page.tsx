'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Table, TableHead, TableHeadCell, TableRow, TableCell, TableBody, Alert } from 'flowbite-react';
import { Plus, BookOpen, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout, ProtectedRoute } from '../../src/app/shared/components';
import { LoadingSpinner } from '../../src/app/shared/components';
import { articlesApi } from '../../src/lib/api';
import { formatFullDateTime } from '../../src/lib/utils';
import { useAuth } from '../../src/contexts/AuthContext';
import type { Article } from '../../src/app/shared/types';
import { getRichTextDisplay } from '../../src/lib/utils';

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchArticles = useCallback(async (retry = 0) => {
    try {
      setLoading(true);
      setError(null);
      const data = await articlesApi.getAll();
      setArticles(data);
      setRetryCount(0);
    } catch (err: any) {
      console.error('Failed to fetch articles:', err);

      // Implement retry with exponential backoff
      if (retry < MAX_RETRIES) {
        const delay = Math.pow(2, retry) * 1000; // 1s, 2s, 4s
        setRetryCount(retry + 1);
        setError(`Loading articles... (Retry ${retry + 1}/${MAX_RETRIES})`);

        setTimeout(() => {
          fetchArticles(retry + 1);
        }, delay);
      } else {
        setError('Failed to load articles. The search index may need to be rebuilt. Please try again later.');
        setRetryCount(0);
      }
    } finally {
      if (retryCount === 0 || retryCount >= MAX_RETRIES) {
        setLoading(false);
      }
    }
  }, [retryCount]);

  const handleRetry = () => {
    setError(null);
    fetchArticles(0);
  };

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleArticleClick = (articleId: string) => {
    router.push(`/knowledge-base/${articleId}`);
  };

  const filteredArticles = articles;

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <LoadingSpinner text="Loading knowledge base..." />
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
              <p className="text-gray-600 dark:text-gray-400">Browse helpful articles and documentation</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Only show create button for agents */}
              {user?.role === 'agent' && (
                <Link href="/knowledge-base/create">
                  <Button className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500">
                    <Plus className="h-4 w-4 mr-2" />
                    New Article
                  </Button>
                </Link>
              )}
            </div>
          </div>


          {/* Error Alert */}
          {error && !loading && (
            <Alert color="warning" className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
                <Button
                  size="xs"
                  color="warning"
                  onClick={handleRetry}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </div>
            </Alert>
          )}

          {/* Articles Table */}
          <Card>
            {filteredArticles.length === 0 && !error ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No articles yet</h3>
                  <p className="text-sm">Articles will appear here once they are created</p>
                  {user?.role === 'agent' && (
                    <Link href="/knowledge-base/create">
                      <Button className="mt-4 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Article
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeadCell>Article</TableHeadCell>
                      <TableHeadCell>Category</TableHeadCell>
                      <TableHeadCell>Created</TableHeadCell>
                      <TableHeadCell>Updated</TableHeadCell>
                      <TableHeadCell>
                        <span className="sr-only">Actions</span>
                      </TableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody className="divide-y">
                    {filteredArticles.map((article) => (
                      <TableRow
                        key={article.id}
                        className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          <div>
                            <button
                              onClick={() => handleArticleClick(article.id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-left"
                            >
                              <div className="font-medium">{article.title}</div>
                            </button>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md truncate">
                              {getRichTextDisplay(article.content).substring(0, 100)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {article.category?.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {article.subCategory?.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span className="whitespace-nowrap">
                              {formatFullDateTime(article.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span className="whitespace-nowrap">
                              {formatFullDateTime(article.updatedAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="xs"
                            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white"
                            onClick={() => handleArticleClick(article.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>

        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}