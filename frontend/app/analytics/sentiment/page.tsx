'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Select, Badge } from 'flowbite-react';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3, RefreshCw } from 'lucide-react';
import { MainLayout, ProtectedRoute } from '../../../src/app/shared/components';
import { LoadingSpinner } from '../../../src/app/shared/components';
import { SentimentIndicator, SentimentScoreBar } from '../../../src/app/shared/components/SentimentIndicator';
import { sentimentApi, SentimentAnalyticsResponse } from '../../../src/lib/api/sentiment';
import { categoriesApi } from '../../../src/lib/api';
import type { Category } from '../../../src/app/shared/types';

export default function SentimentAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<SentimentAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sentimentApi.getAnalytics({
        days,
        category_id: categoryId || undefined,
      });
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch sentiment analytics:', err);
      setError('Failed to load sentiment analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [days, categoryId]);

  const fetchCategories = async () => {
    try {
      const cats = await categoriesApi.getAll();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getSentimentFromScore = (score: number): 'positive' | 'neutral' | 'negative' => {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  };

  return (
    <ProtectedRoute allowedRoles={['agent', 'admin']}>
      <MainLayout>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sentiment Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor customer sentiment trends and identify areas for improvement
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Period:
                </label>
                <Select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-32"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category:
                </label>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-48"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                size="sm"
                color="gray"
                onClick={fetchAnalytics}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-96">
              <LoadingSpinner text="Loading sentiment analytics..." />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-500">{error}</p>
              <Button className="mt-4" onClick={fetchAnalytics}>
                Try Again
              </Button>
            </div>
          ) : analytics ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Overall Sentiment
                      </p>
                      <div className="mt-2">
                        <SentimentIndicator
                          sentiment={getSentimentFromScore(analytics.average_score)}
                          score={analytics.average_score}
                          showDetails
                          size="lg"
                        />
                      </div>
                    </div>
                    {analytics.average_score > 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    ) : analytics.average_score < 0 ? (
                      <TrendingDown className="h-8 w-8 text-red-500" />
                    ) : (
                      <BarChart3 className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                </Card>

                <Card>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tickets Analyzed
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {analytics.sentiments_analyzed}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    of {analytics.total_tickets} total
                  </p>
                </Card>

                <Card>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Escalation Rate
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {(analytics.escalation_rate * 100).toFixed(1)}%
                  </p>
                  {analytics.escalation_rate > 0.3 && (
                    <Badge color="failure" className="mt-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      High
                    </Badge>
                  )}
                </Card>

                <Card>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Score Range
                  </p>
                  <div className="mt-3">
                    <SentimentScoreBar score={analytics.average_score} />
                  </div>
                </Card>
              </div>

              {/* Sentiment Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Sentiment Distribution
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Positive
                        </span>
                        <span className="text-sm font-medium">
                          {analytics.sentiment_distribution.positive} (
                          {formatPercentage(
                            analytics.sentiment_distribution.positive,
                            analytics.sentiments_analyzed
                          )}
                          )
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{
                            width:
                              analytics.sentiments_analyzed > 0
                                ? `${(analytics.sentiment_distribution.positive / analytics.sentiments_analyzed) * 100}%`
                                : '0%',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Neutral
                        </span>
                        <span className="text-sm font-medium">
                          {analytics.sentiment_distribution.neutral} (
                          {formatPercentage(
                            analytics.sentiment_distribution.neutral,
                            analytics.sentiments_analyzed
                          )}
                          )
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-gray-500 rounded-full transition-all duration-300"
                          style={{
                            width:
                              analytics.sentiments_analyzed > 0
                                ? `${(analytics.sentiment_distribution.neutral / analytics.sentiments_analyzed) * 100}%`
                                : '0%',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-red-600 dark:text-red-400">
                          Negative
                        </span>
                        <span className="text-sm font-medium">
                          {analytics.sentiment_distribution.negative} (
                          {formatPercentage(
                            analytics.sentiment_distribution.negative,
                            analytics.sentiments_analyzed
                          )}
                          )
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-red-500 rounded-full transition-all duration-300"
                          style={{
                            width:
                              analytics.sentiments_analyzed > 0
                                ? `${(analytics.sentiment_distribution.negative / analytics.sentiments_analyzed) * 100}%`
                                : '0%',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Common Emotions
                  </h3>
                  {analytics.common_emotions.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.common_emotions.map((emotion) => (
                        <div key={emotion.emotion} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {emotion.emotion}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${Math.min((emotion.count / analytics.sentiments_analyzed) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">
                              {emotion.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No emotion data available
                    </p>
                  )}
                </Card>
              </div>

              {/* Daily Trends */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Daily Sentiment Trends
                </h3>
                {analytics.daily_trends.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                            Date
                          </th>
                          <th className="text-center py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                            Tickets
                          </th>
                          <th className="text-center py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
                            Avg Score
                          </th>
                          <th className="text-center py-2 px-3 font-medium text-green-500">
                            Positive
                          </th>
                          <th className="text-center py-2 px-3 font-medium text-gray-500">
                            Neutral
                          </th>
                          <th className="text-center py-2 px-3 font-medium text-red-500">
                            Negative
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.daily_trends.map((day) => (
                          <tr
                            key={day.date}
                            className="border-b border-gray-100 dark:border-gray-800"
                          >
                            <td className="py-2 px-3 text-gray-900 dark:text-white">
                              {new Date(day.date).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-3 text-center">{day.count}</td>
                            <td className="py-2 px-3 text-center">
                              <SentimentIndicator
                                sentiment={getSentimentFromScore(day.average_score)}
                                score={day.average_score}
                                size="sm"
                              />
                            </td>
                            <td className="py-2 px-3 text-center text-green-600 dark:text-green-400">
                              {day.distribution.positive}
                            </td>
                            <td className="py-2 px-3 text-center text-gray-600 dark:text-gray-400">
                              {day.distribution.neutral}
                            </td>
                            <td className="py-2 px-3 text-center text-red-600 dark:text-red-400">
                              {day.distribution.negative}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No trend data available for the selected period
                  </p>
                )}
              </Card>
            </>
          ) : null}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
