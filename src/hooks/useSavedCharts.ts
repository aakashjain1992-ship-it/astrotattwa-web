'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface SavedChart {
  id: string;
  user_id: string;
  name: string;

  // Optional label (you asked: Friend/Family/Wife/Client etc.)
  label: string | null;

  // Birth details only (no chart payload storage)
  gender: string; // 'male' | 'female' | 'Male' | 'Female' (API can normalize)
  birth_date: string; // YYYY-MM-DD
  birth_time: string; // HH:MM or HH:MM:SS (from DB)
  birth_place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: number;

  created_at?: string;
  updated_at?: string;
}

async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function toMessage(e: unknown): string {
  if (!e) return 'Something went wrong.';
  if (typeof e === 'string') return e;
  if (typeof e === 'object' && 'message' in (e as any)) return String((e as any).message);
  return 'Something went wrong.';
}

/**
 * useSavedCharts
 *
 * Drives saved chart dropdown + actions from backend:
 * - /api/auth/me        -> determines logged-in + isAdmin
 * - GET /api/SaveChart  -> list
 * - POST /api/SaveChart -> create
 * - PATCH /api/SaveChart/:id -> update
 * - DELETE /api/SaveChart/:id -> delete
 */
export function useSavedCharts() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1) auth status (and admin flag) from /me
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (meRes.status === 401) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setCharts([]);
        return;
      }

      const me = await safeJson(meRes);
      const u = me?.user;
      setIsLoggedIn(Boolean(u));
      setIsAdmin(Boolean(u?.isAdmin)); // from DB /me

      // 2) list saved charts
      const listRes = await fetch('/api/SaveChart', { credentials: 'include' });
      if (!listRes.ok) {
        const j = await safeJson(listRes);
        throw new Error(j?.error || 'Failed to load saved charts.');
      }
      const j = await safeJson(listRes);
      setCharts((j?.charts ?? []) as SavedChart[]);
    } catch (e) {
      setError(toMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasSavedCharts = useMemo(() => charts.length > 0, [charts.length]);

  const saveChart = useCallback(async (payload: any): Promise<SavedChart> => {
    const res = await fetch('/api/SaveChart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const j = await safeJson(res);
    if (!res.ok) {
      const err: any = new Error(j?.error || 'Failed to save chart.');
      err.status = res.status;
      throw err;
    }
    return j?.chart as SavedChart;
  }, []);

  const updateChart = useCallback(async (id: string, payload: any): Promise<SavedChart> => {
    const res = await fetch(`/api/SaveChart/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const j = await safeJson(res);
    if (!res.ok) {
      const err: any = new Error(j?.error || 'Failed to update chart.');
      err.status = res.status;
      throw err;
    }
    return j?.chart as SavedChart;
  }, []);

  const deleteChart = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/SaveChart/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const j = await safeJson(res);
    if (!res.ok) {
      const err: any = new Error(j?.error || 'Failed to delete chart.');
      err.status = res.status;
      throw err;
    }
  }, []);

  return {
    isLoggedIn,
    isAdmin,
    loading,
    charts,
    hasSavedCharts,
    error,
    refresh,
    saveChart,
    updateChart,
    deleteChart,
  };
}
