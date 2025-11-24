'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Table, TableHead, TableHeadCell, TableRow, TableCell, TableBody, TextInput, Alert } from 'flowbite-react';
import { Plus, BookOpen, Calendar, Search, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout, ProtectedRoute } from '../../src/app/shared/components';
import { LoadingSpinner } from '../../src/app/shared/components';
import { articlesApi } from '../../src/lib/api';
import { formatFullDateTime } from '../../src/lib/utils';
import { useAuth } from '../../src/contexts/AuthContext';
import { useDebounceSearch } from '../../src/app/shared/hooks/useDebounceSearch';
import type { Article } from '../../src/app/shared/types';
import { getRichTextDisplay } from '../../src/lib/utils';

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use the debounced search hook
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    isSearching,
    error: searchError,
    hasSearched,
    clearSearch,
  } = useDebounceSearch({
    searchFn: (q) => articlesApi.search({ q }),
    delay: 300,
    minLength: 2, // Require at least 2 characters
  });

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await articlesApi.getAll();
      setArticles(data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleArticleClick = (articleId: string) => {
    router.push(`/knowledge-base/${articleId}`);
  };

  // Show search results when searching, all articles otherwise
  const displayArticles = hasSearched ? searchResults : articles;
  const showingSearchResults = hasSearched && searchQuery.trim().length >= 2;

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

          {/* Search Interface */}
          <Card>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <TextInput
                type="text"
                placeholder="Search knowledge base articles... (min 2 characters)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Search Status */}
            {isSearching && (
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-500 border-t-transparent mr-2"></div>
                Searching...
              </div>
            )}
            
            {/* Search Error */}
            {searchError && (
              <Alert color="failure" icon={AlertCircle} className="mt-2">
                <span className="font-medium">Search failed:</span> {searchError}
              </Alert>
            )}
            
            {/* Search Results Info */}
            {showingSearchResults && !isSearching && !searchError && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Found {searchResults.length} article{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                <button
                  onClick={clearSearch}
                  className="ml-2 text-orange-600 hover:text-orange-700 underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </Card>


          {/* Articles Table */}
          <Card>
            {displayArticles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  {showingSearchResults ? (
                    <>
                      <h3 className="text-lg font-medium mb-2">No articles found</h3>
                      <p className="text-sm">No articles match your search for &ldquo;{searchQuery}&rdquo;</p>
                      <button
                        onClick={clearSearch}
                        className="mt-4 text-orange-600 hover:text-orange-700 underline"
                      >
                        Clear search to see all articles
                      </button>
                    </>
                  ) : (
                    <>
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
                    </>
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
                    {displayArticles.map((article) => (
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