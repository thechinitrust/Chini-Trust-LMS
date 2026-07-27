"use client";

import * as React from "react";

import type { QuizAttempt } from "@/lib/types";
import {
  getProgressForUser,
  getQuizAttemptsForUser,
  getLessonsForCourse,
} from "@/lib/mock-data";

/**
 * Client-side progress overlay on top of the static mock data, persisted to
 * localStorage so lesson completion and quiz attempts feel real in a demo
 * session even without a backend.
 *
 * TODO(supabase): replace with writes to the `progress` and `quiz_attempts`
 * tables (see docs/supabase-schema.md) and drop this hook — server state
 * becomes the single source of truth.
 */

interface LocalProgressState {
  completedLessonIds: string[];
  quizAttempts: QuizAttempt[];
}

const STORAGE_KEY = "neurobridge.local-progress";

function readStorage(): LocalProgressState {
  if (typeof window === "undefined") return { completedLessonIds: [], quizAttempts: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedLessonIds: [], quizAttempts: [] };
    const parsed = JSON.parse(raw);
    return {
      completedLessonIds: parsed.completedLessonIds ?? [],
      quizAttempts: parsed.quizAttempts ?? [],
    };
  } catch {
    return { completedLessonIds: [], quizAttempts: [] };
  }
}

export function useLocalProgress(userId: string) {
  const [state, setState] = React.useState<LocalProgressState>({ completedLessonIds: [], quizAttempts: [] });
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setState(readStorage());
    setHydrated(true);
  }, []);

  const persist = (next: LocalProgressState) => {
    setState(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const baseCompleted = React.useMemo(
    () => new Set(getProgressForUser(userId).filter((p) => p.completed).map((p) => p.lessonId)),
    [userId]
  );

  const completedLessonIds = React.useMemo(() => {
    const combined = new Set(baseCompleted);
    state.completedLessonIds.forEach((id) => combined.add(id));
    return combined;
  }, [baseCompleted, state.completedLessonIds]);

  const markLessonComplete = React.useCallback(
    (lessonId: string) => {
      if (completedLessonIds.has(lessonId)) return;
      persist({ ...state, completedLessonIds: [...state.completedLessonIds, lessonId] });
    },
    [state, completedLessonIds]
  );

  const courseProgressPercent = React.useCallback(
    (courseId: string) => {
      const lessons = getLessonsForCourse(courseId);
      if (lessons.length === 0) return 0;
      const done = lessons.filter((l) => completedLessonIds.has(l.id)).length;
      return Math.round((done / lessons.length) * 100);
    },
    [completedLessonIds]
  );

  const allQuizAttempts = React.useMemo(
    () => [...getQuizAttemptsForUser(userId), ...state.quizAttempts],
    [userId, state.quizAttempts]
  );

  const recordQuizAttempt = React.useCallback(
    (attempt: QuizAttempt) => {
      persist({ ...state, quizAttempts: [...state.quizAttempts, attempt] });
    },
    [state]
  );

  const getLatestAttempt = React.useCallback(
    (quizId: string) =>
      allQuizAttempts
        .filter((a) => a.quizId === quizId)
        .sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime())[0],
    [allQuizAttempts]
  );

  return {
    hydrated,
    completedLessonIds,
    isLessonCompleted: (lessonId: string) => completedLessonIds.has(lessonId),
    markLessonComplete,
    courseProgressPercent,
    quizAttempts: allQuizAttempts,
    recordQuizAttempt,
    getLatestAttempt,
  };
}
