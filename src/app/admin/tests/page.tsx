// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Trash2, ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TestResult {
  testCaseId: string;
  testCaseName: string;
  status: 'passed' | 'failed';
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
planets?: Array<{
    planet: string;
    expected: number;
    actual: number;
    difference: number;
    tolerance: number;
    passed: boolean;
  }>;
  ascendant?: {
    expected: number;
    actual: number;
    difference: number;
    tolerance: number;
    passed: boolean;
  };
  dasha?: {
    expectedMahadasha: string;
    actualMahadasha: string;
    passed: boolean;
  };

}

interface TestRun {
  id: string;
  run_at: string;
  status: string;
  differences: any;
  test_case_id: string;
  test_cases?: { name: string } | { name: string }[];

}

export default function AdminTestsPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0, executionTime: 0 });
  const [history, setHistory] = useState<TestRun[]>([]);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('test_case_runs')
        .select('id, run_at, status, differences, test_case_id')
        .order('run_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data as any || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function runTests() {
    setIsRunning(true);
    setProgress(0);
    setCurrentTest('');
    setResults([]);
    setSummary({ total: 0, passed: 0, failed: 0, executionTime: 0 });

    try {
      const eventSource = new EventSource('/api/test/run-calculations');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'started':
            setCurrentTest('Initializing...');
            break;

          case 'progress':
            setProgress((data.current / data.total) * 100);
            setCurrentTest('Running ' + data.current + '/' + data.total + ': ' + data.testName);
            break;

          case 'test_result':
            setResults((prev) => [
              ...prev,
              {
                testCaseId: data.testId,
                testCaseName: data.testName,
                status: data.status,
                summary: data.summary || { totalChecks: 0, passedChecks: 0, failedChecks: 0 },
      planets: data.planets,
      ascendant: data.ascendant,
      dasha: data.dasha,
              },
            ]);
            break;

          case 'completed':
            setSummary(data.summary);
            setProgress(100);
            setCurrentTest('Completed!');
            setIsRunning(false);
            eventSource.close();
            setTimeout(() => fetchHistory(), 500);
            break;

          case 'error':
            console.error('Test error:', data.message);
            setCurrentTest('Error: ' + data.message);
            setIsRunning(false);
            eventSource.close();
            break;
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setIsRunning(false);
        setCurrentTest('Connection error');
        eventSource.close();
      };

    } catch (error) {
      console.error('Failed to start tests:', error);
      setIsRunning(false);
    }
  }

  async function deleteAllRuns() {
    if (!confirm('Are you sure you want to delete all test run history?')) {
      return;
    }

    try {
      const response = await fetch('/api/test/delete-runs', {
        method: 'DELETE',
      });

      if (response.ok) {
        setHistory([]);
        alert('All test runs deleted successfully');
      } else {
        alert('Failed to delete test runs');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete test runs');
    }
  }

  function toggleExpand(testId: string) {
    setExpandedTests((prev) => {
      const next = new Set(prev);
      if (next.has(testId)) {
        next.delete(testId);
      } else {
        next.add(testId);
      }
      return next;
    });
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  function formatDuration(ms: number) {
    return (ms / 1000).toFixed(1) + 's';
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Automation Dashboard</h1>
        <p className="text-muted-foreground">
          Run calculation tests to verify accuracy against reference data
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={runTests} disabled={isRunning} size="lg">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run All Tests
            </>
          )}
        </Button>

        <Button
          onClick={deleteAllRuns}
          variant="outline"
          size="lg"
          disabled={isRunning || history.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete All Runs
        </Button>
      </div>

      {isRunning && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Running Tests...</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">{currentTest}</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Latest Run Results</CardTitle>
            <CardDescription>
              {summary.total > 0 && (
                <>
                  {summary.passed}/{summary.total} passed • {formatDuration(summary.executionTime)}
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result.testCaseId} className="border rounded-lg p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(result.testCaseId)}
                  >
                    <div className="flex items-center gap-3">
                      {result.status === 'passed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{result.testCaseName}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.summary.passedChecks}/{result.summary.totalChecks} checks passed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                        {result.status.toUpperCase()}
                      </Badge>
                      {expandedTests.has(result.testCaseId) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {expandedTests.has(result.testCaseId) && result.planets && (
  <div className="mt-4 pl-8 space-y-4">
    {/* Failed Checks */}
    {result.planets.filter(p => !p.passed).length > 0 && (
      <div>
        <p className="font-semibold text-red-600 mb-2">❌ Failures:</p>
        <div className="space-y-1">
          {result.planets.filter(p => !p.passed).map(planet => (
            <div key={planet.planet} className="text-sm">
              <span className="font-medium">{planet.planet}:</span> Expected {planet.expected.toFixed(2)}°, Got {planet.actual.toFixed(2)}°, 
              <span className="text-red-600 font-semibold"> Diff: {planet.difference.toFixed(2)} arcmin</span> (tolerance: {planet.tolerance})
            </div>
          ))}
        </div>
      </div>
    )}
    
    {result.ascendant && !result.ascendant.passed && (
      <div>
        <p className="font-semibold text-red-600 mb-2">❌ Ascendant Failed:</p>
        <div className="text-sm">
          Expected {result.ascendant.expected.toFixed(2)}°, Got {result.ascendant.actual.toFixed(2)}°,
          <span className="text-red-600 font-semibold"> Diff: {result.ascendant.difference.toFixed(2)} arcmin</span>
        </div>
      </div>
    )}

    {/* Passed Checks */}
    {result.planets.filter(p => p.passed).length > 0 && (
      <div>
        <p className="font-semibold text-green-600 mb-2">✅ Passed:</p>
        <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
          {result.planets.filter(p => p.passed).map(planet => (
            <div key={planet.planet}>
              {planet.planet}: {planet.difference.toFixed(2)} arcmin
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
                   
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test History (Last 10 Runs)</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No test runs yet. Click &quot;Run All Tests&quot; to start.
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">Test Run</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(run.run_at)}}
                    </p>
                  </div>
                  <Badge variant={run.status === 'passed' ? 'default' : 'destructive'}>
                    {run.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
