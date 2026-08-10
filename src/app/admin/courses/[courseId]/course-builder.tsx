"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  Youtube,
} from "lucide-react";

import type { Course, Lesson, Module } from "@/lib/types";
import { extractYouTubeId, formatDuration } from "@/lib/youtube";
import { createClient } from "@/lib/supabase/client";
import { createModule, deleteModule, reorderModules, updateModule, type ModuleInput } from "@/lib/data/modules";
import {
  createLesson,
  deleteLesson,
  reorderLessons,
  updateLesson,
  type LessonInput,
} from "@/lib/data/lessons";
import { notify } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { RichText } from "@/components/shared/rich-text";
import { SortableList, SortableItem, DragHandle } from "@/components/admin/sortable-list";
import { CourseDetailsForm } from "./course-details-form";
import { ModuleDialog, type ModuleDraft } from "./module-dialog";
import { LessonDialog, type LessonDraft } from "./lesson-dialog";

export type ModuleWithLessons = Module & { lessons: Lesson[] };

interface ModuleDialogState {
  open: boolean;
  moduleId: string | null; // null = creating
}

interface LessonDialogState {
  open: boolean;
  moduleId: string | null;
  lessonId: string | null; // null = creating
}

const emptyModuleDraft: ModuleDraft = { title: "", description: "" };
const emptyLessonDraft: LessonDraft = {
  title: "",
  description: "",
  notes: "",
  youtubeVideoId: "",
  durationSeconds: 0,
  published: false,
  objectives: [],
};

export function CourseBuilder({ course, initialModules }: { course: Course; initialModules: ModuleWithLessons[] }) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const [modules, setModules] = React.useState<ModuleWithLessons[]>(initialModules);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(initialModules.map((m) => m.id))
  );
  const [moduleDialog, setModuleDialog] = React.useState<ModuleDialogState>({ open: false, moduleId: null });
  const [lessonDialog, setLessonDialog] = React.useState<LessonDialogState>({
    open: false,
    moduleId: null,
    lessonId: null,
  });

  const toggleExpanded = (moduleId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  // ---- Modules ----

  const editingModule = moduleDialog.moduleId ? modules.find((m) => m.id === moduleDialog.moduleId) : undefined;
  const moduleDialogInitialValues: ModuleDraft = editingModule
    ? { title: editingModule.title, description: editingModule.description }
    : emptyModuleDraft;

  const handleModuleSubmit = async (values: ModuleDraft) => {
    if (!values.title.trim()) {
      notify.error("Title is required");
      return;
    }
    try {
      if (moduleDialog.moduleId) {
        const target = modules.find((m) => m.id === moduleDialog.moduleId);
        if (!target) return;
        const input: ModuleInput = { courseId: course.id, title: values.title, description: values.description, order: target.order };
        const updated = await updateModule(supabase, target.id, input);
        setModules((prev) => prev.map((m) => (m.id === target.id ? { ...m, ...updated } : m)));
        notify.success("Module saved");
      } else {
        const input: ModuleInput = {
          courseId: course.id,
          title: values.title,
          description: values.description,
          order: modules.length + 1,
        };
        const created = await createModule(supabase, input);
        setModules((prev) => [...prev, { ...created, lessons: [] }]);
        setExpandedIds((prev) => new Set(prev).add(created.id));
        notify.success("Module added");
      }
      setModuleDialog({ open: false, moduleId: null });
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save module", error instanceof Error ? error.message : undefined);
    }
  };

  const handleDeleteModule = async (courseModule: ModuleWithLessons) => {
    if (!window.confirm(`Delete "${courseModule.title}"? This also removes its lessons. This can't be undone.`)) return;
    try {
      await deleteModule(supabase, courseModule.id);
      setModules((prev) => prev.filter((m) => m.id !== courseModule.id));
      notify.success("Module deleted");
      router.refresh();
    } catch (error) {
      notify.error(`Couldn't delete ${courseModule.title}`, error instanceof Error ? error.message : undefined);
    }
  };

  const handleReorderModules = async (next: ModuleWithLessons[]) => {
    const previous = modules;
    setModules(next);
    try {
      await reorderModules(supabase, next.map((m) => m.id));
    } catch (error) {
      setModules(previous);
      notify.error("Couldn't reorder modules", error instanceof Error ? error.message : undefined);
    }
  };

  // ---- Lessons ----

  const lessonDialogModule = lessonDialog.moduleId ? modules.find((m) => m.id === lessonDialog.moduleId) : undefined;
  const editingLesson =
    lessonDialogModule && lessonDialog.lessonId
      ? lessonDialogModule.lessons.find((l) => l.id === lessonDialog.lessonId)
      : undefined;
  const lessonDialogInitialValues: LessonDraft = editingLesson
    ? {
        title: editingLesson.title,
        description: editingLesson.description,
        notes: editingLesson.notes ?? "",
        youtubeVideoId: editingLesson.video.youtubeVideoId,
        durationSeconds: editingLesson.video.durationSeconds,
        published: editingLesson.published,
        objectives: editingLesson.objectives ?? [],
      }
    : emptyLessonDraft;

  const handleLessonSubmit = async (values: LessonDraft) => {
    const moduleId = lessonDialog.moduleId;
    const courseModule = modules.find((m) => m.id === moduleId);
    if (!courseModule) return;
    const videoId = extractYouTubeId(values.youtubeVideoId);
    if (!values.title.trim() || !videoId.trim()) {
      notify.error("Title and YouTube video ID are required");
      return;
    }
    try {
      if (lessonDialog.lessonId) {
        const target = courseModule.lessons.find((l) => l.id === lessonDialog.lessonId);
        if (!target) return;
        const input: LessonInput = {
          moduleId: courseModule.id,
          courseId: course.id,
          title: values.title,
          description: values.description,
          notes: values.notes || undefined,
          order: target.order,
          published: values.published,
          youtubeVideoId: videoId,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          durationSeconds: values.durationSeconds,
          objectives: values.objectives.map((o) => o.trim()).filter(Boolean),
        };
        const updated = await updateLesson(supabase, target.id, input);
        setModules((prev) =>
          prev.map((m) =>
            m.id === courseModule.id ? { ...m, lessons: m.lessons.map((l) => (l.id === target.id ? updated : l)) } : m
          )
        );
        notify.success("Lesson saved");
      } else {
        const input: LessonInput = {
          moduleId: courseModule.id,
          courseId: course.id,
          title: values.title,
          description: values.description,
          notes: values.notes || undefined,
          order: courseModule.lessons.length + 1,
          published: values.published,
          youtubeVideoId: videoId,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          durationSeconds: values.durationSeconds,
          objectives: values.objectives.map((o) => o.trim()).filter(Boolean),
        };
        const created = await createLesson(supabase, input);
        setModules((prev) => prev.map((m) => (m.id === courseModule.id ? { ...m, lessons: [...m.lessons, created] } : m)));
        notify.success("Lesson added");
      }
      setLessonDialog({ open: false, moduleId: null, lessonId: null });
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save lesson", error instanceof Error ? error.message : undefined);
    }
  };

  const handleDeleteLesson = async (courseModule: ModuleWithLessons, lesson: Lesson) => {
    if (!window.confirm(`Delete "${lesson.title}"? This can't be undone.`)) return;
    try {
      await deleteLesson(supabase, lesson.id);
      setModules((prev) =>
        prev.map((m) => (m.id === courseModule.id ? { ...m, lessons: m.lessons.filter((l) => l.id !== lesson.id) } : m))
      );
      notify.success("Lesson deleted");
      router.refresh();
    } catch (error) {
      notify.error(`Couldn't delete ${lesson.title}`, error instanceof Error ? error.message : undefined);
    }
  };

  const handleToggleLessonPublished = async (courseModule: ModuleWithLessons, lesson: Lesson) => {
    const next = !lesson.published;
    setModules((prev) =>
      prev.map((m) =>
        m.id === courseModule.id
          ? { ...m, lessons: m.lessons.map((l) => (l.id === lesson.id ? { ...l, published: next } : l)) }
          : m
      )
    );
    try {
      const input: LessonInput = {
        moduleId: lesson.moduleId,
        courseId: lesson.courseId,
        title: lesson.title,
        description: lesson.description,
        notes: lesson.notes,
        order: lesson.order,
        published: next,
        youtubeVideoId: lesson.video.youtubeVideoId,
        thumbnailUrl: lesson.video.thumbnailUrl,
        durationSeconds: lesson.video.durationSeconds,
        objectives: lesson.objectives ?? [],
      };
      await updateLesson(supabase, lesson.id, input);
      router.refresh();
    } catch (error) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === courseModule.id
            ? { ...m, lessons: m.lessons.map((l) => (l.id === lesson.id ? { ...l, published: !next } : l)) }
            : m
        )
      );
      notify.error("Couldn't update status", error instanceof Error ? error.message : undefined);
    }
  };

  const handleReorderLessons = async (courseModule: ModuleWithLessons, nextLessons: Lesson[]) => {
    const previous = modules;
    setModules((prev) => prev.map((m) => (m.id === courseModule.id ? { ...m, lessons: nextLessons } : m)));
    try {
      await reorderLessons(supabase, nextLessons.map((l) => l.id));
    } catch (error) {
      setModules(previous);
      notify.error("Couldn't reorder lessons", error instanceof Error ? error.message : undefined);
    }
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div>
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to courses
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-foreground">{course.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {modules.length} modules &middot; {totalLessons} lessons — manage the full course structure below.
          </p>
        </div>
        {course.published && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer">
              View on site
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-8 space-y-8">
        <CourseDetailsForm course={course} />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Modules</h2>
            <Button size="sm" onClick={() => setModuleDialog({ open: true, moduleId: null })}>
              <Plus className="size-4" aria-hidden="true" />
              Add module
            </Button>
          </div>

          <div className="mt-4">
            {modules.length === 0 ? (
              <EmptyState title="No modules yet" description="Add the first module to start building this course." />
            ) : (
              <SortableList items={modules} onReorder={handleReorderModules} className="space-y-3">
                {(courseModule, index) => (
                  <SortableItem key={courseModule.id} id={courseModule.id}>
                    {(drag) => (
                      <Card className="overflow-hidden">
                        <div className="flex items-center gap-2 p-4">
                          <DragHandle {...drag} />
                          <button
                            type="button"
                            onClick={() => toggleExpanded(courseModule.id)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                            aria-expanded={expandedIds.has(courseModule.id)}
                          >
                            {expandedIds.has(courseModule.id) ? (
                              <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                            )}
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary-text">
                              {index + 1}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-foreground">{courseModule.title}</span>
                              <span className="block text-xs text-muted-foreground">
                                {courseModule.lessons.length} {courseModule.lessons.length === 1 ? "lesson" : "lessons"}
                              </span>
                            </span>
                          </button>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setModuleDialog({ open: true, moduleId: courseModule.id })}
                              aria-label={`Edit ${courseModule.title}`}
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteModule(courseModule)}
                              aria-label={`Delete ${courseModule.title}`}
                            >
                              <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>

                        {expandedIds.has(courseModule.id) && (
                          <CardContent className="border-t border-border pt-4">
                            {courseModule.description && (
                              <RichText html={courseModule.description} className="mb-4 text-sm text-muted-foreground" />
                            )}

                            {courseModule.lessons.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No lessons yet in this module.</p>
                            ) : (
                              <SortableList
                                items={courseModule.lessons}
                                onReorder={(next) => handleReorderLessons(courseModule, next)}
                                className="space-y-2"
                              >
                                {(lesson, lessonIndex) => (
                                  <SortableItem key={lesson.id} id={lesson.id}>
                                    {(lessonDrag) => (
                                      <div className="flex items-center gap-2 rounded-xl border border-border p-2.5">
                                        <DragHandle {...lessonDrag} />
                                        <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
                                          {lessonIndex + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                          <span className="block truncate text-sm font-medium text-foreground">
                                            {lesson.title}
                                          </span>
                                          <span className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                              <Youtube className="size-3 text-destructive" aria-hidden="true" />
                                              {lesson.video.youtubeVideoId || "—"}
                                            </span>
                                            <span>{formatDuration(lesson.video.durationSeconds)}</span>
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleToggleLessonPublished(courseModule, lesson)}
                                          className="shrink-0"
                                        >
                                          <Badge variant={lesson.published ? "success" : "outline"}>
                                            {lesson.published ? "Published" : "Draft"}
                                          </Badge>
                                        </button>
                                        <div className="flex shrink-0 items-center gap-1">
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() =>
                                              setLessonDialog({ open: true, moduleId: courseModule.id, lessonId: lesson.id })
                                            }
                                            aria-label={`Edit ${lesson.title}`}
                                          >
                                            <Pencil className="size-4" aria-hidden="true" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDeleteLesson(courseModule, lesson)}
                                            aria-label={`Delete ${lesson.title}`}
                                          >
                                            <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </SortableItem>
                                )}
                              </SortableList>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3"
                              onClick={() => setLessonDialog({ open: true, moduleId: courseModule.id, lessonId: null })}
                            >
                              <Plus className="size-4" aria-hidden="true" />
                              Add lesson
                            </Button>
                          </CardContent>
                        )}
                      </Card>
                    )}
                  </SortableItem>
                )}
              </SortableList>
            )}
          </div>
        </div>
      </div>

      <ModuleDialog
        open={moduleDialog.open}
        onOpenChange={(open) => setModuleDialog((prev) => ({ ...prev, open }))}
        title={moduleDialog.moduleId ? "Edit module" : "New module"}
        initialValues={moduleDialogInitialValues}
        onSubmit={handleModuleSubmit}
        submitLabel="Save module"
      />

      <LessonDialog
        open={lessonDialog.open}
        onOpenChange={(open) => setLessonDialog((prev) => ({ ...prev, open }))}
        title={lessonDialog.lessonId ? "Edit lesson" : "New lesson"}
        initialValues={lessonDialogInitialValues}
        onSubmit={handleLessonSubmit}
        submitLabel="Save lesson"
      />
    </div>
  );
}
