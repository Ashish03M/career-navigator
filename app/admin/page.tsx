"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Plus, Pencil, Trash2, Save, GripVertical,
    BookOpen, Loader2, CheckCircle2, AlertCircle,
    ChevronDown, ChevronUp, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Chapter } from "@/lib/bootcampData";
import type { SyllabusData, Subject, SubjectCategory } from "@/lib/syllabusTypes";

// ─── Helpers ────────────────────────────────────────────────────────────────

const EMPTY_CHAPTER: Chapter = {
    id: "",
    title: "",
    subjectId: "",
    durationWeeks: 1,
    isProject: false,
    isInternship: false,
    topics: [],
};

const SUBJECT_COLORS: Record<string, string> = {
    "sub-python": "bg-blue-100 text-blue-800",
    "sub-sql": "bg-cyan-100 text-cyan-800",
    "sub-math": "bg-indigo-100 text-indigo-800",
    "sub-ml": "bg-green-100 text-green-800",
    "sub-dl": "bg-purple-100 text-purple-800",
    "sub-nlp": "bg-pink-100 text-pink-800",
    "sub-genai": "bg-amber-100 text-amber-800",
    "sub-career": "bg-slate-100 text-slate-800",
};



const CATEGORIES: { value: SubjectCategory; label: string }[] = [
    { value: "foundation", label: "Foundation" },
    { value: "core-ai", label: "Core AI" },
    { value: "specialization", label: "Specialization" },
    { value: "career", label: "Career" },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const [data, setData] = useState<SyllabusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [dirty, setDirty] = useState(false);

    // Chapter dialog
    const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter>(EMPTY_CHAPTER);
    const [isNewChapter, setIsNewChapter] = useState(true);
    const [topicsText, setTopicsText] = useState("");

    // Delete confirmation (chapters)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [chapterToDelete, setChapterToDelete] = useState<string>("");

    // Delete confirmation (subjects)
    const [subjectDeleteDialogOpen, setSubjectDeleteDialogOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<string>("");



    // Subject editing (UI labeled as "Module")
    const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject>({
        id: "",
        name: "",
        displayName: "",
        color: "bg-slate-50 border-slate-200",
        category: "foundation",
        chapterIds: []
    });
    const [isNewSubject, setIsNewSubject] = useState(true);
    const [quickChapterTitle, setQuickChapterTitle] = useState("");

    // ── Navigation State ──
    const [activeTab, setActiveTab] = useState("subjects");
    const [highlightedChapterId, setHighlightedChapterId] = useState<string | null>(null);

    // ── Data Loading ──

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("/api/syllabus");
            if (res.ok) {
                const d: SyllabusData = await res.json();
                setData(d);
            } else {
                console.error(JSON.stringify({ event: "admin:load_failed", status: res.status }));
            }
        } catch (err) {
            console.error(JSON.stringify({ event: "admin:load_error", error: err instanceof Error ? err.message : String(err) }));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Warn on unsaved changes before leaving
    useEffect(() => {
        if (!dirty) return;
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    // Helper: resolve subject name by id
    function getSubjectName(subjectId: string): string {
        return data?.subjects.find(s => s.id === subjectId)?.name ?? subjectId;
    }

    // ── Save ──

    async function handleSave() {
        if (!data) return;
        setSaving(true);
        setSaveStatus("idle");

        try {
            const res = await fetch("/api/syllabus", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setSaveStatus("success");
                setDirty(false);
                setTimeout(() => setSaveStatus("idle"), 2000);
            } else if (res.status === 401) {
                window.location.href = "/admin/login";
                return;
            } else {
                setSaveStatus("error");
            }
        } catch {
            setSaveStatus("error");
        } finally {
            setSaving(false);
        }
    }

    // ── Chapter CRUD ──

    function openNewChapter() {
        // Auto-increment logic
        const maxNum = (data?.chapters ?? []).reduce((max, ch) => {
            const num = parseInt(ch.id.replace(/\D/g, "")) || 0;
            return num > max ? num : max;
        }, 0);

        setEditingChapter({
            ...EMPTY_CHAPTER,
            id: `ch${maxNum + 1}`,
            subjectId: data?.subjects[0]?.id ?? ""
        });
        setTopicsText("");
        setIsNewChapter(true);
        setChapterDialogOpen(true);
    }

    function openEditChapter(ch: Chapter) {
        setEditingChapter({ ...ch });
        setTopicsText(ch.topics.join("\n"));
        setIsNewChapter(false);
        setChapterDialogOpen(true);
    }

    function saveChapter() {
        if (!data || !editingChapter.id || !editingChapter.title) return;
        const topics = topicsText.split("\n").map(t => t.trim()).filter(Boolean);
        const ch = { ...editingChapter, topics };

        if (isNewChapter) {
            setData({ ...data, chapters: [...data.chapters, ch] });
        } else {
            setData({
                ...data,
                chapters: data.chapters.map(c => c.id === ch.id ? ch : c),
            });
        }

        setDirty(true);
        setChapterDialogOpen(false);
    }

    function confirmDelete(id: string) {
        setChapterToDelete(id);
        setDeleteDialogOpen(true);
    }

    function executeDelete() {
        if (!data) return;
        setData({
            ...data,
            chapters: data.chapters.filter(ch => ch.id !== chapterToDelete),
            subjects: data.subjects.map(s => ({
                ...s,
                chapterIds: s.chapterIds.filter(id => id !== chapterToDelete),
            })),
        });
        setDirty(true);
        setDeleteDialogOpen(false);
    }

    function moveChapter(index: number, direction: "up" | "down") {
        if (!data) return;
        const chs = [...data.chapters];
        const swap = direction === "up" ? index - 1 : index + 1;
        if (swap < 0 || swap >= chs.length) return;
        [chs[index], chs[swap]] = [chs[swap], chs[index]];
        setData({ ...data, chapters: chs });
        setDirty(true);
    }

    function moveSubject(index: number, direction: "up" | "down") {
        if (!data) return;
        const subs = [...data.subjects];
        const swap = direction === "up" ? index - 1 : index + 1;
        if (swap < 0 || swap >= subs.length) return;
        [subs[index], subs[swap]] = [subs[swap], subs[index]];
        setData({ ...data, subjects: subs });
        setDirty(true);
    }

    // ── Subject CRUD (UI: Module) ──

    function openNewSubject() {
        setEditingSubject({
            id: "",
            name: "",
            displayName: "",
            color: "bg-slate-50 border-slate-200",
            category: "foundation",
            chapterIds: []
        });
        setIsNewSubject(true);
        setSubjectDialogOpen(true);
    }

    function openEditSubject(sub: Subject) {
        setEditingSubject({ ...sub });
        setIsNewSubject(false);
        setSubjectDialogOpen(true);
    }

    function saveSubject() {
        if (!data || !editingSubject.id || !editingSubject.name) return;
        if (isNewSubject) {
            setData({ ...data, subjects: [...data.subjects, editingSubject] });
        } else {
            setData({
                ...data,
                subjects: data.subjects.map(s => s.id === editingSubject.id ? editingSubject : s),
            });
        }
        setDirty(true);
        setSubjectDialogOpen(false);
    }

    function confirmDeleteSubject(subjectId: string) {
        setSubjectToDelete(subjectId);
        setSubjectDeleteDialogOpen(true);
    }

    function executeDeleteSubject() {
        if (!data) return;
        setData({
            ...data,
            subjects: data.subjects.filter(s => s.id !== subjectToDelete),
        });
        setDirty(true);
        setSubjectDeleteDialogOpen(false);
    }

    function handleQuickAddChapter() {
        if (!data || !quickChapterTitle.trim()) return;
        const maxNum = data.chapters.reduce((max, ch) => {
            const num = parseInt(ch.id.replace(/\D/g, "")) || 0;
            return num > max ? num : max;
        }, 0);
        const newId = `ch${maxNum + 1}`;
        const newChapter: Chapter = {
            id: newId,
            title: quickChapterTitle.trim(),
            subjectId: editingSubject.id,
            durationWeeks: 1,
            isProject: false,
            topics: [],
        };

        setData(prev => prev ? ({
            ...prev,
            chapters: [...prev.chapters, newChapter]
        }) : null);

        setEditingSubject(prev => ({
            ...prev,
            chapterIds: [...prev.chapterIds, newId]
        }));

        setQuickChapterTitle("");
        setDirty(true);
    }



    // ── Navigation ──

    function navigateToChapter(chapterId: string) {
        setActiveTab("chapters");
        // Allow tab switch to render
        setTimeout(() => {
            const row = document.getElementById(`row-${chapterId}`);
            if (row) {
                row.scrollIntoView({ behavior: "smooth", block: "center" });
                setHighlightedChapterId(chapterId);
                // Remove highlight after animation
                setTimeout(() => setHighlightedChapterId(null), 2000);
            }
        }, 100);
    }

    // ── Render ──

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-slate-600">Failed to load syllabus data.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with save */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">Syllabus Manager</h1>
                    <p className="text-slate-500 text-sm mt-1">{data.subjects.length} subjects • {data.chapters.length} chapters</p>
                </div>
                <div className="flex items-center gap-3">
                    {dirty && (
                        <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>
                    )}
                    {saveStatus === "success" && (
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Saved
                        </span>
                    )}
                    {saveStatus === "error" && (
                        <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> Save failed
                        </span>
                    )}
                    <Button onClick={handleSave} disabled={saving || !dirty}>
                        {saving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100/80 p-1 border border-slate-200 shadow-sm">
                    <TabsTrigger value="subjects" className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200">
                        <FolderOpen className="w-4 h-4 mr-2" /> Subjects
                    </TabsTrigger>
                    <TabsTrigger value="chapters" className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200">
                        <BookOpen className="w-4 h-4 mr-2" /> Chapters
                    </TabsTrigger>
                </TabsList>

                {/* ─── Modules Tab (Actually Subjects) ─── */}
                <TabsContent value="subjects" className="mt-6 space-y-6 focus-visible:outline-none focus-visible:ring-0">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {data.subjects.length} Subject Areas
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Each subject groups chapters by topic.</p>
                        </div>
                        <Button onClick={openNewSubject} size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                            <Plus className="w-4 h-4 mr-1" /> Add Subject
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {data.subjects.map(sub => {
                            const subChapters = sub.chapterIds
                                .map(id => data.chapters.find(ch => ch.id === id))
                                .filter(Boolean);
                            return (
                                <div key={sub.id} className={`bg-white rounded-xl border border-slate-200 border-l-4 ${sub.color || "border-l-slate-300"} p-5 flex gap-4`}>
                                    {/* Vertical Reorder Controls */}
                                    <div className="flex flex-col items-center justify-center gap-0.5 pr-2 border-r border-slate-100">
                                        <button
                                            onClick={() => {
                                                const idx = data.subjects.findIndex(s => s.id === sub.id);
                                                moveSubject(idx, "up");
                                            }}
                                            disabled={data.subjects.findIndex(s => s.id === sub.id) === 0}
                                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-20"
                                            aria-label="Move up"
                                        >
                                            <ChevronUp className="w-4 h-4 text-slate-400" />
                                        </button>
                                        <GripVertical className="w-4 h-4 text-slate-300" />
                                        <button
                                            onClick={() => {
                                                const idx = data.subjects.findIndex(s => s.id === sub.id);
                                                moveSubject(idx, "down");
                                            }}
                                            disabled={data.subjects.findIndex(s => s.id === sub.id) === data.subjects.length - 1}
                                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-20"
                                            aria-label="Move down"
                                        >
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                                    <Badge variant="secondary" className={SUBJECT_COLORS[sub.id] || ""}>{sub.name}</Badge>
                                                    <span className="text-sm font-medium text-slate-700">{sub.displayName}</span>
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-1">{sub.chapterIds.length} chapters</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="outline" size="sm" onClick={() => openEditSubject(sub)}>
                                                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => confirmDeleteSubject(sub.id)}
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {subChapters.map(ch => ch && (
                                                <Badge
                                                    key={ch.id}
                                                    variant="secondary"
                                                    onClick={() => navigateToChapter(ch.id)}
                                                    className={`text-xs ${SUBJECT_COLORS[sub.id] || ""} cursor-pointer hover:opacity-80 hover:ring-2 hover:ring-offset-1 transition-all`}
                                                    title="Click to view chapter details"
                                                >
                                                    {ch.title}
                                                </Badge>
                                            ))}
                                            {subChapters.length === 0 && (
                                                <span className="text-xs text-slate-400 italic">No chapters assigned</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* ─── Chapters Tab ─── */}
                <TabsContent value="chapters" className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-slate-500">{data.chapters.length} chapters total</p>
                        <Button onClick={openNewChapter} size="sm">
                            <Plus className="w-4 h-4 mr-1" /> Add Chapter
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-4 py-3 w-10"></th>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Subject</th>
                                    <th className="px-4 py-3 text-center">Weeks</th>
                                    <th className="px-4 py-3 text-center">Project</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.chapters.map((ch, idx) => (
                                    <tr
                                        key={ch.id}
                                        id={`row-${ch.id}`}
                                        className={`border-b border-slate-100 last:border-0 transition-colors duration-500 ${highlightedChapterId === ch.id ? "bg-yellow-50" : "hover:bg-slate-50/50"}`}
                                    >
                                        <td className="px-2 py-3">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <button
                                                    onClick={() => moveChapter(idx, "up")}
                                                    disabled={idx === 0}
                                                    className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-20"
                                                    aria-label="Move up"
                                                >
                                                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                                </button>
                                                <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                                                <button
                                                    onClick={() => moveChapter(idx, "down")}
                                                    disabled={idx === data.chapters.length - 1}
                                                    className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-20"
                                                    aria-label="Move down"
                                                >
                                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{ch.id}</td>
                                        <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">{ch.title}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary" className={SUBJECT_COLORS[ch.subjectId] || ""}>
                                                {getSubjectName(ch.subjectId)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-600">{ch.durationWeeks}</td>
                                        <td className="px-4 py-3 text-center">
                                            {ch.isProject ? (
                                                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                                            ) : (
                                                <span className="inline-block w-2 h-2 rounded-full bg-slate-200" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEditChapter(ch)}
                                                    className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                                    aria-label="Edit chapter"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(ch.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                                    aria-label="Delete chapter"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* ─── Chapter Dialog ─── */}
            <Dialog open={chapterDialogOpen} onOpenChange={setChapterDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isNewChapter ? "Add Chapter" : "Edit Chapter"}</DialogTitle>
                        <DialogDescription>
                            {isNewChapter ? "Create a new chapter in the syllabus." : `Editing chapter ${editingChapter.id}`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ch-id">Chapter ID</Label>
                                <Input
                                    id="ch-id"
                                    value={editingChapter.id}
                                    onChange={e => setEditingChapter({ ...editingChapter, id: e.target.value })}
                                    placeholder="ch44"
                                    disabled={!isNewChapter}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ch-duration">Duration (weeks)</Label>
                                <Input
                                    id="ch-duration"
                                    type="number"
                                    step="0.1"
                                    min="0.5"
                                    value={editingChapter.durationWeeks}
                                    onChange={e => setEditingChapter({ ...editingChapter, durationWeeks: parseFloat(e.target.value) || 0.5 })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ch-title">Title</Label>
                            <Input
                                id="ch-title"
                                value={editingChapter.title}
                                onChange={e => setEditingChapter({ ...editingChapter, title: e.target.value })}
                                placeholder="43. Advanced RAG Patterns"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Select
                                    value={editingChapter.subjectId}
                                    onValueChange={v => setEditingChapter({ ...editingChapter, subjectId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data.subjects.map(sub => (
                                            <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Is Project?</Label>
                                <Select
                                    value={editingChapter.isProject ? "yes" : "no"}
                                    onValueChange={v => setEditingChapter({ ...editingChapter, isProject: v === "yes" })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no">No</SelectItem>
                                        <SelectItem value="yes">Yes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Is Internship?</Label>
                                <Select
                                    value={editingChapter.isInternship ? "yes" : "no"}
                                    onValueChange={v => setEditingChapter({ ...editingChapter, isInternship: v === "yes" })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no">No</SelectItem>
                                        <SelectItem value="yes">Yes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ch-topics">Topics (one per line)</Label>
                            <Textarea
                                id="ch-topics"
                                value={topicsText}
                                onChange={e => setTopicsText(e.target.value)}
                                rows={6}
                                placeholder={"Introduction to topic\nCore concepts\nHands-on project"}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setChapterDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={saveChapter} disabled={!editingChapter.id || !editingChapter.title}>
                            {isNewChapter ? "Add Chapter" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Delete Confirmation ─── */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Chapter</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{chapterToDelete}</strong>? This will also remove it from any phases and modules. This action cannot be undone after saving.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={executeDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Subject Dialog (UI: Module) ─── */}
            <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            {isNewSubject ? "Add New Subject" : "Edit Subject"}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Subjects are high-level buckets like &ldquo;Python&rdquo; or &ldquo;ML&rdquo;.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject-name">Subject Name (Reference)</Label>
                                <Input
                                    id="subject-name"
                                    value={editingSubject.name}
                                    onChange={e => setEditingSubject({ ...editingSubject, name: e.target.value })}
                                    placeholder="Python"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject-display">Display Name (Phase Title)</Label>
                                <Input
                                    id="subject-display"
                                    value={editingSubject.displayName}
                                    onChange={e => setEditingSubject({ ...editingSubject, displayName: e.target.value })}
                                    placeholder="Module 1: Python Basics"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={editingSubject.category}
                                    onValueChange={(v: SubjectCategory) => setEditingSubject({ ...editingSubject, category: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject-color">Color Classes</Label>
                                <Input
                                    id="subject-color"
                                    value={editingSubject.color || ""}
                                    onChange={e => setEditingSubject({ ...editingSubject, color: e.target.value })}
                                    placeholder="bg-slate-50 border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <Label>Quick Add Topic</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter new topic title..."
                                    value={quickChapterTitle}
                                    onChange={e => setQuickChapterTitle(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleQuickAddChapter();
                                        }
                                    }}
                                />
                                <Button
                                    onClick={handleQuickAddChapter}
                                    disabled={!quickChapterTitle.trim()}
                                    type="button"
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Assign Chapters</Label>
                            <p className="text-xs text-slate-500 mb-2">Click chapters to toggle assignment.</p>
                            <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-2">
                                {data.chapters.map(ch => {
                                    const selected = editingSubject.chapterIds.includes(ch.id);
                                    return (
                                        <button
                                            key={ch.id}
                                            onClick={() => {
                                                const ids = selected
                                                    ? editingSubject.chapterIds.filter(id => id !== ch.id)
                                                    : [...editingSubject.chapterIds, ch.id];
                                                setEditingSubject({ ...editingSubject, chapterIds: ids });
                                            }}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${selected
                                                ? "bg-blue-50 border border-blue-200 text-blue-800"
                                                : "hover:bg-slate-50 text-slate-600 border border-transparent"
                                                }`}
                                        >
                                            {selected ? (
                                                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                                            ) : (
                                                <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                                            )}
                                            <span className="font-mono text-xs text-slate-400 w-8">{ch.id}</span>
                                            <span className="truncate">{ch.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-slate-50/50 p-4 rounded-b-2xl border-t border-slate-100">
                        <Button variant="ghost" onClick={() => setSubjectDialogOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={saveSubject} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 shadow-md">
                            {isNewSubject ? "Create Subject" : "Update Subject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Subject Delete Confirmation ─── */}
            <Dialog open={subjectDeleteDialogOpen} onOpenChange={setSubjectDeleteDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Subject</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{data.subjects.find(s => s.id === subjectToDelete)?.name ?? subjectToDelete}</strong>? This action cannot be undone after saving.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSubjectDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={executeDeleteSubject}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
