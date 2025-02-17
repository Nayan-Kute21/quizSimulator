'use client';
import React from 'react';
import { openDB } from 'idb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type QuizAttempt = {
    id?: number;
    playerName: string;
    date: string;
    score: number;
    totalQuestions: number;
  };


export default function HistoryPage() {
    const [attempts, setAttempts] = React.useState<QuizAttempt[]>([]);
    const backgroundStyle = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      };
      
    React.useEffect(() => {
      const loadAttempts = async () => {
        try {
          const db = await openDB<QuizAttempt>('quizDB', 1);
          const allAttempts = await db.getAll('attempts');
          // Sort attempts by date in descending order (newest first)
          const sortedAttempts = allAttempts.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setAttempts(sortedAttempts);
        } catch (error) {
          console.error('Error loading attempts:', error);
        }
      };
  
      loadAttempts();
    }, []);

      
          return (
              <div className="min-h-screen" style={backgroundStyle}>
                <div className="container mx-auto px-4 py-12">
                  <Card className="max-w-5xl mx-auto border-none shadow-2xl backdrop-blur-sm bg-white/90">
                    <CardHeader className="p-6 border-b border-gray-100/20">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-3xl font-bold text-gray-800">📊 Quiz History</CardTitle>
                          <p className="text-gray-600">Track your progress and improvement</p>
                        </div>
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl px-6 py-6" 
                          asChild
                        >
                          <Link href="/">Take New Quiz</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {attempts.length > 0 ? (
                        <div className="rounded-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-blue-50/50">
                                <TableHead className="font-semibold text-gray-700 py-4">Player</TableHead>
                                <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                                <TableHead className="font-semibold text-gray-700">Score</TableHead>
                                <TableHead className="font-semibold text-gray-700">Performance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {attempts.map((attempt: QuizAttempt) => {
                                const percentage = (attempt.score / attempt.totalQuestions) * 100;
                                const getPerformanceColor = (percentage: number) => {
                                  if (percentage >= 80) return 'text-green-600 bg-green-50/80 border border-green-200';
                                  if (percentage >= 60) return 'text-yellow-600 bg-yellow-50/80 border border-yellow-200';
                                  return 'text-red-600 bg-red-50/80 border border-red-200';
                                };
            
                                return (
                                  <TableRow 
                                    key={attempt.id}
                                    className="hover:bg-blue-50/30 transition-colors"
                                  >
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                          <span className="text-white font-semibold">
                                            {attempt.playerName.charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                        <span className="font-medium text-gray-700">{attempt.playerName}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                      {new Date(attempt.date).toLocaleDateString('en-US', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <span className="font-bold text-blue-600 text-lg">
                                          {attempt.score}
                                        </span>
                                        <span className="text-gray-500">
                                          /{attempt.totalQuestions}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getPerformanceColor(percentage)}`}>
                                        {percentage.toFixed(1)}%
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-16 px-4">
                          <div className="mb-4">
                            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                              <svg
                                className="h-10 w-10 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Quiz History Yet</h3>
                          <p className="text-gray-600 mb-8">Take your first quiz to start tracking your progress!</p>
                          <Button 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl px-8 py-6"
                            asChild
                          >
                            <Link href="/">Start Your First Quiz</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
          );
      }