/* eslint-disable no-console */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Play, Trash2, ChevronDown, ChevronRight, CheckCircle2, XCircle, Lock } from 'lucide-react';

const SESSION_TOKEN_KEY = 'admin_token';

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
    nodeMode?: 'TRUE' | 'MEAN';
    trueDifference?: number;
    meanDifference?: number;
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
}

// ─── Token Gate ───────────────────────────────────────────────────────────────

function TokenGate({ onAuthenticated }: { onAuthenticated: (token: string) => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  async function handleSubmit() {
    if (!input.trim()) return;
    setChecking(true);
    setError('');

    // Validate by pinging the history endpoint — if 200, token is good
    try {
      const res = await fetch(`/api/test/history?token=${encodeURIComponent(input.trim())}`);
      if (res.ok) {
        sessionStorage.setItem(SESSION_TOKEN_KEY, input.trim());
        onAuthenticated(input.trim());
      } else {
        setError('Invalid token. Check ADMIN_SECRET_TOKEN on the server.');
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Enter the admin token to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="token">Admin Token</Label>
            <Input
              id="token"
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter token..."
              className="mt-1"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSubmit} disabled={checking || !input.trim()} className="w-full">
            {checking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {checking ? 'Verifying...' : 'Enter'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function TestDashboard({ token }: { token: string }) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/test/history?token=${encodeURIComponent(token)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setHistory(json.data || []);
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
      // Pass token as query param — EventSource cannot set custom headers
      const eventSource = new EventSource(
        `/api/test/run-calculations?token=${encodeURIComponent(token)}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'started':
            setCurrentTest('Initializing...');
            break;

          case 'progress':
            setProgress((data.current / data.total) * 100);
            setCurrentTest(`Running ${data.current}/${data.total}: ${data.testName}`);
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
            setCurrentTest(`Error: ${data.message}`);
            setIsRunning(false);
            eventSource.close();
            break;
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setIsRunning(false);
        setCurrentTest('Connection error — check server logs');
        eventSource.close();
      };
    } catch (error) {
      console.error('Failed to start tests:', error);
      setIsRunning(false);
    }
  }

  async function deleteAllRuns() {
    if (!confirm('Are you sure you want to delete all test run history?')) return;

    try {
      const response = await fetch('/api/test/delete-runs', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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
      if (next.has(testId)) next.delete(testId);
      else next.add(testId);
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
            {/* Rahu/Ketu Mode Summary */}
            {(() => {
              const rahuResults = results.flatMap(r => r.planets?.filter(p => p.planet === 'Rahu' && p.nodeMode) || []);
              const ketuResults = results.flatMap(r => r.planets?.filter(p => p.planet === 'Ketu' && p.nodeMode) || []);
              const trueCount = rahuResults.filter(p => p.nodeMode === 'TRUE').length + ketuResults.filter(p => p.nodeMode === 'TRUE').length;
              const meanCount = rahuResults.filter(p => p.nodeMode === 'MEAN').length + ketuResults.filter(p => p.nodeMode === 'MEAN').length;
              const noModeCount = results.flatMap(r => r.planets?.filter(p => (p.planet === 'Rahu' || p.planet === 'Ketu') && !p.nodeMode) || []).length;

              if (trueCount + meanCount + noModeCount === 0) return null;

              return (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">🔍 Rahu/Ketu Node Mode Analysis</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{trueCount}</div>
                      <div className="text-muted-foreground">TRUE_NODE matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{meanCount}</div>
                      <div className="text-muted-foreground">MEAN_NODE matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{noModeCount}</div>
                      <div className="text-muted-foreground">No mode data</div>
                    </div>
                  </div>
                  {noModeCount > 0 && (
                    <p className="mt-2 text-xs text-orange-700 dark:text-orange-400">
                      ⚠️ Some tests missing rahuKetuModes — check if API is returning this field
                    </p>
                  )}
                  {meanCount > trueCount && trueCount + meanCount > 0 && (
                    <p className="mt-2 text-sm text-purple-700 dark:text-purple-400 font-medium">
                      📊 Test data appears to use MEAN_NODE values (Jagannatha Hora default)
                    </p>
                  )}
                  {trueCount > meanCount && trueCount + meanCount > 0 && (
                    <p className="mt-2 text-sm text-green-700 dark:text-green-400 font-medium">
                      📊 Test data appears to use TRUE_NODE values
                    </p>
                  )}
                </div>
              );
            })()}

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
                      {result.planets.filter(p => !p.passed).length > 0 && (
                        <div>
                          <p className="font-semibold text-red-600 mb-2">❌ Failed Planets:</p>
                          <div className="space-y-2">
                            {result.planets.filter(p => !p.passed).map(planet => (
                              <div key={planet.planet} className="text-sm border-l-2 border-red-300 pl-3 py-1">
                                <div>
                                  <span className="font-medium">{planet.planet}:</span> Expected {planet.expected.toFixed(3)}°, Got {planet.actual.toFixed(3)}°
                                  <span className="text-red-600 font-semibold ml-2">Diff: {planet.difference.toFixed(2)}&apos;</span>
                                  <span className="text-muted-foreground ml-1">(tol: {planet.tolerance}&apos;)</span>
                                </div>
                                {(planet.planet === 'Rahu' || planet.planet === 'Ketu') && planet.nodeMode && (
                                  <div className="mt-1 text-xs bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                                    <span className="font-semibold">Mode Used: {planet.nodeMode}_NODE</span>
                                    <span className="ml-3">TRUE: {planet.trueDifference?.toFixed(2)}&apos;</span>
                                    <span className="ml-2">MEAN: {planet.meanDifference?.toFixed(2)}&apos;</span>
                                    {planet.trueDifference !== undefined && planet.meanDifference !== undefined && (
                                      <span className="ml-2 text-blue-600">
                                        ({planet.meanDifference < planet.trueDifference ? 'MEAN is closer' : 'TRUE is closer'})
                                      </span>
                                    )}
                                  </div>
                                )}
                                {(planet.planet === 'Rahu' || planet.planet === 'Ketu') && !planet.nodeMode && (
                                  <div className="mt-1 text-xs bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-orange-700">
                                    ⚠️ No TRUE/MEAN comparison data — rahuKetuModes may be missing from API response
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.ascendant && !result.ascendant.passed && (
                        <div>
                          <p className="font-semibold text-red-600 mb-2">❌ Ascendant Failed:</p>
                          <div className="text-sm">
                            Expected {result.ascendant.expected.toFixed(2)}°, Got {result.ascendant.actual.toFixed(2)}°
                            <span className="text-red-600 font-semibold"> Diff: {result.ascendant.difference.toFixed(2)} arcmin</span>
                            {' '}(tolerance: {result.ascendant.tolerance})
                          </div>
                        </div>
                      )}

                      {result.dasha && !result.dasha.passed && (
                        <div>
                          <p className="font-semibold text-red-600 mb-2">❌ Dasha Failed:</p>
                          <div className="text-sm">
                            Expected: <span className="font-medium">{result.dasha.expectedMahadasha}</span>,{' '}
                            Got: <span className="font-medium text-red-600">{result.dasha.actualMahadasha || 'Unknown'}</span>
                          </div>
                        </div>
                      )}

                      {result.planets.filter(p => p.passed).length > 0 && (
                        <div>
                          <p className="font-semibold text-green-600 mb-2">✅ Passed Planets:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {result.planets.filter(p => p.passed).map(planet => (
                              <div key={planet.planet} className="text-muted-foreground">
                                <span className="font-medium text-foreground">{planet.planet}:</span> {planet.difference.toFixed(2)}&apos;
                                {(planet.planet === 'Rahu' || planet.planet === 'Ketu') && planet.nodeMode && (
                                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-400">
                                    {planet.nodeMode}_NODE
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.ascendant && result.ascendant.passed && (
                        <div className="text-sm text-muted-foreground">
                          ✅ Ascendant: {result.ascendant.difference.toFixed(2)} arcmin
                        </div>
                      )}

                      {result.dasha && result.dasha.passed && (
                        <div className="text-sm text-muted-foreground">
                          ✅ Dasha: {result.dasha.actualMahadasha} (correct)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test History (Last 20 Runs)</CardTitle>
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
                    <p className="text-sm text-muted-foreground">{formatDate(run.run_at)}</p>
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

// ─── Page Entry Point ─────────────────────────────────────────────────────────

export default function AdminTestsPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated in this session
    const stored = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (stored) setToken(stored);
  }, []);

  if (!token) {
    return <TokenGate onAuthenticated={setToken} />;
  }

  return <TestDashboard token={token} />;
}
