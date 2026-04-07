import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, FileText, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { AppFooter } from "../components/AppFooter";
import { PageHeader } from "../components/PageHeader";
import { PageClock } from "../components/PageClock";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  PREPARATION_CATEGORIES,
  PREPARATION_CATEGORY_MAP,
  PREPARATION_CATEGORY_NAMES,
} from "../data/topicCatalog";
import { API_BASE } from "../lib/api";

const ADMIN_EMAILS = [
  "adityakanaujiya81@gmail.com",
  "aarzoosingh0906@gmail.com",
];

const emptyForm = {
  title: "",
  category: PREPARATION_CATEGORY_NAMES[0],
  summary: "",
  tags: "",
  pdfName: "",
  pdfDataUrl: "",
  pdfSize: 0,
};

const CATEGORY_ICONS = Object.fromEntries(
  PREPARATION_CATEGORIES.map((category) => [
    category.name,
    category.cardIcon || BookOpen,
  ]),
);

const CATEGORY_THEMES = Object.fromEntries(
  PREPARATION_CATEGORIES.map((category) => [
    category.name,
    category.theme || ["#0f766e", "#14b8a6"],
  ]),
);

const CATEGORY_STICKERS = {
  DSA: "🧩",
  HR: "💼",
  "Project Ideas": "🚀",
  MERN: "🌐",
  Java: "☕",
  JavaScript: "✨",
  C: "💻",
  "Important Programs": "📘",
};

const formatFileSize = (bytes = 0) => {
  if (!bytes) {
    return "0 KB";
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(2)} MB`;
};

const normalizeValue = (value = "") => `${value}`.trim().toLowerCase();

const createPdfObjectUrl = (pdfDataUrl = "") => {
  if (!pdfDataUrl || !pdfDataUrl.startsWith("data:application/pdf;base64,")) {
    return "";
  }

  try {
    const base64 = pdfDataUrl.split(",")[1] || "";
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    const pdfBlob = new Blob([bytes], { type: "application/pdf" });
    return URL.createObjectURL(pdfBlob);
  } catch {
    return "";
  }
};

const noteMatchesSearch = (note, query) => {
  const normalizedQuery = normalizeValue(query);

  if (!normalizedQuery) {
    return true;
  }

  return [
    note.title,
    note.category,
    note.summary,
    note.pdfName,
    ...(note.tags || []),
  ].some((value) => normalizeValue(value).includes(normalizedQuery));
};

export const Preparation = () => {
  const { user, updateUser } = useAuth();
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedNotePreviewUrl, setSelectedNotePreviewUrl] = useState("");
  const noteViewerRef = useRef(null);

  const isAdmin =
    user?.role === "admin" && ADMIN_EMAILS.includes((user?.email || "").toLowerCase());
  const isSelectedNoteCompleted = (selectedNote?.completedBy || []).some(
    (entry) => `${entry.user}` === `${user?._id}`,
  );

  const fetchNotes = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/preparation/notes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load notes");
      }

      setAllNotes(data);
      setSelectedNote((current) => {
        if (!data.length) {
          return null;
        }

        if (current) {
          return data.find((note) => note._id === current._id) || data[0];
        }

        return data[0];
      });
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load notes");
      setAllNotes([]);
      setSelectedNote(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchNotes();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!selectedNote?.pdfDataUrl) {
      setSelectedNotePreviewUrl("");
      return undefined;
    }

    const nextPreviewUrl = createPdfObjectUrl(selectedNote.pdfDataUrl);
    setSelectedNotePreviewUrl(nextPreviewUrl);

    return () => {
      if (nextPreviewUrl) {
        URL.revokeObjectURL(nextPreviewUrl);
      }
    };
  }, [selectedNote?.pdfDataUrl]);

  useEffect(() => {
    if (!selectedNote?._id) {
      return;
    }

    const scrollTarget = window.setTimeout(() => {
      noteViewerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);

    return () => window.clearTimeout(scrollTarget);
  }, [selectedNote?._id]);

  const filteredNotes = useMemo(
    () => allNotes.filter((note) => noteMatchesSearch(note, search)),
    [allNotes, search],
  );

  const hasActiveSearch = search.trim().length > 0;

  const groupedCategoryCounts = useMemo(
    () =>
      PREPARATION_CATEGORY_NAMES.map((category) => ({
        category,
        count: allNotes.filter((note) => note.category === category).length,
        matchCount: filteredNotes.filter((note) => note.category === category).length,
      })),
    [allNotes, filteredNotes],
  );

  const groupedNotes = useMemo(
    () =>
      PREPARATION_CATEGORY_NAMES.reduce((accumulator, category) => {
        accumulator[category] = allNotes.filter((note) => note.category === category);
        return accumulator;
      }, {}),
    [allNotes],
  );

  const filteredGroupedNotes = useMemo(
    () =>
      PREPARATION_CATEGORY_NAMES.reduce((accumulator, category) => {
        accumulator[category] = filteredNotes.filter(
          (note) => note.category === category,
        );
        return accumulator;
      }, {}),
    [filteredNotes],
  );

  useEffect(() => {
    if (!filteredNotes.length) {
      return;
    }

    const selectedStillVisible = filteredNotes.some(
      (note) => note._id === selectedNote?._id,
    );

    if (!selectedStillVisible) {
      if (selectedCategory) {
        const firstMatchInCategory = filteredGroupedNotes[selectedCategory]?.[0];
        if (firstMatchInCategory) {
          setSelectedNote(firstMatchInCategory);
          return;
        }
      }

      setSelectedNote(filteredNotes[0]);
    }
  }, [filteredNotes, filteredGroupedNotes, selectedCategory, selectedNote]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory((current) => {
      const nextCategory = current === category ? null : category;
      if (nextCategory) {
        const nextNotes =
          filteredGroupedNotes[nextCategory]?.length
            ? filteredGroupedNotes[nextCategory]
            : groupedNotes[nextCategory] || [];
        if (nextNotes.length) {
          setSelectedNote(nextNotes[0]);
        }
      }
      return nextCategory;
    });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingNoteId(null);
  };

  const handleEdit = (note) => {
    setEditingNoteId(note._id);
    setFormData({
      title: note.title,
      category: note.category,
      summary: note.summary || "",
      tags: (note.tags || []).join(", "),
      pdfName: note.pdfName || "",
      pdfDataUrl: "",
      pdfSize: note.pdfSize || 0,
    });
  };

  const handlePdfUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF format notes are allowed.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("PDF size should be under 15 MB.");
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = () => {
      setFormData((current) => ({
        ...current,
        pdfName: file.name,
        pdfDataUrl: fileReader.result,
        pdfSize: file.size,
      }));
      setError("");
    };

    fileReader.onerror = () => {
      setError("Failed to read the PDF file.");
    };

    fileReader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!editingNoteId && !formData.pdfDataUrl) {
      setSaving(false);
      setError("Please upload a PDF file.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const method = editingNoteId ? "PUT" : "POST";
      const endpoint = editingNoteId
        ? `${API_BASE}/preparation/notes/${editingNoteId}`
        : `${API_BASE}/preparation/notes`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save note");
      }

      setSuccess(
        editingNoteId
          ? "PDF note updated successfully"
          : "PDF note uploaded successfully",
      );
      const savedNote = data;
      resetForm();
      setAllNotes((currentNotes) => {
        if (editingNoteId) {
          return currentNotes.map((note) =>
            note._id === savedNote._id ? savedNote : note,
          );
        }

        return [savedNote, ...currentNotes];
      });
      setSelectedCategory(savedNote.category);
      setSelectedNote(savedNote);
      await fetchNotes();
    } catch (saveError) {
      setError(saveError.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/preparation/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete PDF note");
      }

      setSuccess("PDF note deleted successfully");
      setAllNotes((currentNotes) => {
        const remainingNotes = currentNotes.filter((note) => note._id !== noteId);
        if (selectedNote?._id === noteId) {
          setSelectedNote(remainingNotes[0] || null);
        }
        return remainingNotes;
      });
      if (selectedNote?._id === noteId) {
        setIsPdfViewerOpen(false);
      }
      setPendingDeleteNoteId(null);
      await fetchNotes();
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete PDF note");
    }
  };

  const requestDelete = (noteId) => {
    setPendingDeleteNoteId(noteId);
    setError("");
    setSuccess("Please confirm if you want to delete this PDF note.");
  };

  const cancelDelete = () => {
    setPendingDeleteNoteId(null);
    setSuccess("PDF note deletion cancelled.");
  };

  const handleCompleteNote = async () => {
    if (!selectedNote?._id) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/preparation/notes/${selectedNote._id}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to mark note as completed");
      }

      if (data.alreadyCompleted) {
        setSuccess("You already completed this note.");
        return;
      }

      setSuccess(data.message || "Note marked as completed.");
      updateUser({
        ...user,
        points: data.totalPoints ?? user?.points ?? 0,
        totalPoints: data.totalPoints ?? user?.totalPoints ?? 0,
        level: data.level ?? user?.level ?? 1,
      });
      await fetchNotes();
    } catch (completionError) {
      setError(completionError.message || "Failed to mark note as completed");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <PageClock />

          <PageHeader
            eyebrow="Preparation Hub"
            title="PDF study notes for interview preparation"
            description="Browse categorized PDFs, search material quickly, and study uploaded notes without leaving the page."
            icon={BookOpen}
            backFallbackTo="/dashboard"
          />

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {groupedCategoryCounts.map((item) => {
              const categoryMeta = PREPARATION_CATEGORY_MAP[item.category];
              const Icon = categoryMeta?.cardIcon || BookOpen;
              const VisualIcon = categoryMeta?.visualIcon || BookOpen;
              const isOpen = selectedCategory === item.category;
              const categoryNotes = groupedNotes[item.category] || [];
              const matchingCategoryNotes =
                filteredGroupedNotes[item.category] || [];
              const categoryNotesToShow =
                hasActiveSearch && matchingCategoryNotes.length
                  ? matchingCategoryNotes
                  : categoryNotes;
              const theme = categoryMeta?.theme || ["#0f766e", "#14b8a6"];

              return (
                <article
                  key={item.category}
                  className={`rounded-2xl border-2 overflow-hidden transition-all ${
                    isOpen
                      ? "shadow-xl -translate-y-1"
                      : "border-slate-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-lg"
                  }`}
                  style={{
                    borderColor: isOpen ? theme[1] : `${theme[0]}35`,
                    boxShadow: isOpen ? `0 18px 40px -24px ${theme[0]}` : undefined,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleCategorySelect(item.category)}
                    className="relative w-full min-h-[260px] overflow-hidden p-4 text-left"
                    style={{
                      background: `linear-gradient(140deg, ${theme[0]}f2, ${theme[1]}cc)`,
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at 25% 20%, rgba(255,255,255,0.16), transparent 28%), radial-gradient(circle at 78% 18%, ${theme[1]}55, transparent 35%), linear-gradient(180deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.42))`,
                      }}
                    />
                    <div className="relative flex h-full min-h-[228px] flex-col justify-between">
                      <div
                        className="inline-flex w-fit rounded-xl backdrop-blur-sm p-3 text-white"
                        style={{ backgroundColor: `${theme[1]}55` }}
                      >
                        <Icon size={24} />
                      </div>
                      <div className="pointer-events-none absolute right-4 top-20 flex justify-center">
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/30 bg-white/18 shadow-xl backdrop-blur-md"
                          style={{ boxShadow: `0 18px 40px -22px ${theme[0]}` }}
                          aria-hidden="true"
                        >
                          <VisualIcon size={30} className="text-white" />
                        </div>
                      </div>
                      <div className="pr-20">
                        <p className="text-lg font-bold text-white">
                          {item.category}
                        </p>
                        <p className="text-sm text-white/85 mt-1">
                          {item.count} PDFs
                        </p>
                        {hasActiveSearch && (
                          <p className="mt-2 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white/95 backdrop-blur-sm">
                            {item.matchCount} search matches
                          </p>
                        )}
                        <p className="text-xs text-white/75 mt-3">
                          {isOpen ? "Hide documents" : "Open documents"}
                        </p>
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div
                      className="border-t px-3 py-3 space-y-2"
                      style={{
                        borderColor: `${theme[0]}25`,
                        background: `linear-gradient(180deg, ${theme[1]}12, rgba(255,255,255,0.96))`,
                      }}
                    >
                      {hasActiveSearch && !matchingCategoryNotes.length && (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          No exact search result in this category, so showing all
                          notes here.
                        </p>
                      )}
                      {categoryNotesToShow.length ? (
                        categoryNotesToShow.map((note) => (
                          <div
                            key={note._id}
                            className={`rounded-xl border p-3 transition-all ${
                              selectedNote?._id === note._id
                                ? "bg-white dark:bg-slate-900 shadow-md"
                                : "bg-white/90 dark:bg-slate-900/85"
                            }`}
                            style={{
                              borderColor:
                                selectedNote?._id === note._id
                                  ? theme[1]
                                  : `${theme[0]}28`,
                            }}
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <button
                                type="button"
                                onClick={() => setSelectedNote(note)}
                                className="flex-1 text-left"
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                                    {note.title}
                                  </p>
                                  {(note.completedBy || []).some(
                                    (entry) => `${entry.user}` === `${user?._id}`,
                                  ) && (
                                    <span
                                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                                      style={{ backgroundColor: theme[1] }}
                                    >
                                      Completed
                                    </span>
                                  )}
                                  {hasActiveSearch &&
                                    noteMatchesSearch(note, search) && (
                                      <span
                                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                                        style={{ backgroundColor: theme[0] }}
                                      >
                                        Match
                                      </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {note.pdfName} | {formatFileSize(note.pdfSize)}
                                </p>
                                {!!note.tags?.length && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {note.tags.slice(0, 3).map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                                        style={{
                                          backgroundColor: `${theme[1]}20`,
                                          color: theme[0],
                                        }}
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </button>
                              {isAdmin && (
                                <div className="flex gap-2 self-end sm:self-auto">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(note)}
                                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => requestDelete(note._id)}
                                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-xl bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          No uploaded topics in this box yet.
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
              <Search className="text-slate-500" size={18} />
              <input
                value={search}
                onChange={handleSearch}
                placeholder="Search PDFs, topics, tags..."
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="mt-4 rounded-xl bg-slate-100 dark:bg-slate-800/70 p-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Search behavior
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Category boxes always keep their notes. Search now highlights matching
                notes without making the boxes feel empty.
              </p>
            </div>
          </section>

          <section className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 p-4 text-emerald-700 dark:text-emerald-300">
                  {success}
                </div>
              )}

              {pendingDeleteNoteId ? (
                <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="font-semibold text-red-700 dark:text-red-300">
                    Delete this PDF note permanently?
                  </p>
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    This will remove the note from the preparation hub for everyone.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(pendingDeleteNoteId)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Yes, delete note
                    </button>
                    <button
                      type="button"
                      onClick={cancelDelete}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              {isAdmin && (
                <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {editingNoteId ? "Edit PDF Note" : "Upload PDF Note"}
                    </h2>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-slate-700 dark:text-slate-300"
                    >
                      <Plus size={16} />
                      New
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      value={formData.title}
                      onChange={(event) =>
                        setFormData({ ...formData, title: event.target.value })
                      }
                      placeholder="Note title"
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <select
                      value={formData.category}
                      onChange={(event) =>
                        setFormData({ ...formData, category: event.target.value })
                      }
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {PREPARATION_CATEGORY_NAMES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <input
                      value={formData.summary}
                      onChange={(event) =>
                        setFormData({ ...formData, summary: event.target.value })
                      }
                      placeholder="Short summary"
                      className="md:col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />

                    <input
                      value={formData.tags}
                      onChange={(event) =>
                        setFormData({ ...formData, tags: event.target.value })
                      }
                      placeholder="Tags separated by commas"
                      className="md:col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />

                    <label className="md:col-span-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-6 text-center cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <Upload
                          className="text-teal-600 dark:text-teal-400"
                          size={28}
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Upload PDF only
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {formData.pdfName
                              ? `${formData.pdfName} | ${formatFileSize(
                                  formData.pdfSize,
                                )}`
                              : "Choose a PDF note up to 15 MB"}
                          </p>
                          {editingNoteId && !formData.pdfDataUrl && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              Keep current PDF or upload a new one to replace it.
                            </p>
                          )}
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={saving}
                      className="md:col-span-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold px-5 py-3"
                    >
                      {saving
                        ? "Uploading..."
                        : editingNoteId
                          ? "Update PDF Note"
                          : "Upload PDF Note"}
                    </button>
                  </form>
                </section>
              )}

              <section
                ref={noteViewerRef}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 md:p-6"
              >
                {selectedNote ? (
                  <div className="space-y-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        {(() => {
                          const Icon =
                            PREPARATION_CATEGORY_MAP[selectedNote.category]?.cardIcon ||
                            BookOpen;

                          return (
                            <div className="mb-3 inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-teal-600 dark:text-teal-400">
                              <Icon size={24} />
                            </div>
                          );
                        })()}
                        <p className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
                          {selectedNote.category}
                        </p>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                          {selectedNote.title}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-3">
                          {selectedNote.summary || selectedNote.pdfName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                          {selectedNote.pdfName} |{" "}
                          {formatFileSize(selectedNote.pdfSize)}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleCompleteNote}
                          disabled={isSelectedNoteCompleted}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <BookOpen size={18} />
                          {isSelectedNoteCompleted
                            ? "Completed"
                            : "Mark as Completed (+10 pts)"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const element =
                              document.getElementById("study-material");
                            element?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 font-semibold"
                        >
                          <FileText size={18} />
                          Start Study
                        </button>
                        <a
                          href={selectedNotePreviewUrl || "#"}
                          onClick={(event) => {
                            event.preventDefault();
                            if (selectedNotePreviewUrl) {
                              setIsPdfViewerOpen(true);
                            } else {
                              setError("This PDF preview is not available right now. Try reopening the note.");
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 text-white px-5 py-3 font-semibold"
                        >
                          Open PDF
                        </a>
                      </div>
                    </div>

                    {!!selectedNote.tags?.length && (
                      <div className="flex gap-2 flex-wrap">
                        {selectedNote.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm text-slate-700 dark:text-slate-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <article
                      id="study-material"
                      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 md:p-4"
                    >
                      <div className="mb-3 flex flex-col gap-2 rounded-2xl bg-white/90 px-4 py-3 shadow-sm dark:bg-slate-900/90 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Reading mode
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Large preview for comfortable study and easier scrolling.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedNotePreviewUrl) {
                              setIsPdfViewerOpen(true);
                            } else {
                              setError("This PDF preview is not available right now. Try reopening the note.");
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          <FileText size={16} />
                          Open Bigger View
                        </button>
                      </div>
                      <iframe
                        title={selectedNote.title}
                        src={selectedNotePreviewUrl || undefined}
                        className="w-full h-[82vh] min-h-[720px] rounded-2xl bg-white"
                      />
                    </article>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <BookOpen className="mx-auto text-slate-400" size={36} />
                    <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Select a PDF note to begin studying
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      Uploaded PDF notes will appear here automatically.
                    </p>
                  </div>
                )}
              </section>
          </section>

          <AppFooter />
        </div>
      </main>

      {isPdfViewerOpen && selectedNote && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 p-2 md:p-4">
          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 md:px-6">
              <div className="min-w-0">
                <p className="truncate text-sm uppercase tracking-[0.2em] text-teal-300">
                  Full Screen PDF Viewer
                </p>
                <h2 className="truncate text-lg font-semibold text-white">
                  {selectedNote.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfViewerOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                <X size={18} />
                Close
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-900/80 px-4 py-3 md:px-6">
              <p className="text-sm text-slate-300">
                Expanded reading mode for focused learning.
              </p>
              <button
                type="button"
                onClick={() => {
                  const element = document.documentElement;
                  if (element.requestFullscreen) {
                    element.requestFullscreen().catch(() => {});
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Browser Fullscreen
              </button>
            </div>

            <div className="flex-1 p-1 md:p-3">
              <iframe
                title={`${selectedNote.title} full screen preview`}
                src={selectedNotePreviewUrl || undefined}
                className="h-full min-h-[80vh] w-full rounded-2xl bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preparation;
