"use client";

import { useState } from "react";
import {
  Video,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  MoveUp,
  MoveDown,
  Eye,
  Film,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  processVideoUrl,
  type VideoPlatform,
  type VideoFormat,
} from "@/lib/video-utils";
import { defaultHomeVideos, type HomeVideoItem } from "@/lib/settings";

interface HomeVideosManagerProps {
  initialVideos?: HomeVideoItem[];
  onSaveSuccess?: () => void;
  onFieldChange?: (key: string, value: string) => void;
}

export function HomeVideosManager({
  initialVideos,
  onSaveSuccess,
  onFieldChange,
}: HomeVideosManagerProps) {
  const [videos, setVideos] = useState<HomeVideoItem[]>(
    initialVideos && initialVideos.length > 0 ? initialVideos : defaultHomeVideos
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for creating / editing
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formPlatform, setFormPlatform] = useState<VideoPlatform>("youtube");
  const [formFormat, setFormFormat] = useState<VideoFormat>("short");
  const [formCategory, setFormCategory] = useState("WALKTHROUGH");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formDuration, setFormDuration] = useState("0:45");
  const [formProject, setFormProject] = useState("");
  const [formBuilder, setFormBuilder] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // When URL changes, auto-detect platform & format
  const handleUrlChange = (val: string) => {
    setFormUrl(val);
    const proc = processVideoUrl(val);
    setFormPlatform(proc.platform);
    setFormFormat(proc.format);
    if (!formThumbnail) {
      setFormThumbnail(proc.defaultThumbnail);
    }
  };

  const startEdit = (vid: HomeVideoItem) => {
    setEditingId(vid.id);
    setFormTitle(vid.title);
    setFormUrl(vid.url);
    setFormPlatform(vid.platform);
    setFormFormat(vid.format);
    setFormCategory(vid.category || "WALKTHROUGH");
    setFormThumbnail(vid.thumbnail || "");
    setFormDuration(vid.duration || "");
    setFormProject(vid.projectName || "");
    setFormBuilder(vid.builderName || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormTitle("");
    setFormUrl("");
    setFormPlatform("youtube");
    setFormFormat("short");
    setFormCategory("WALKTHROUGH");
    setFormThumbnail("");
    setFormDuration("0:45");
    setFormProject("");
    setFormBuilder("");
  };

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) {
      alert("Title and Video URL are required.");
      return;
    }

    const proc = processVideoUrl(formUrl, formFormat, formPlatform);
    const finalThumb = formThumbnail.trim() || proc.defaultThumbnail;

    if (editingId) {
      // Update existing
      setVideos((prev) =>
        prev.map((v) =>
          v.id === editingId
            ? {
                ...v,
                title: formTitle.trim(),
                url: formUrl.trim(),
                embedUrl: proc.embedUrl,
                platform: proc.platform,
                format: formFormat,
                category: formCategory,
                thumbnail: finalThumb,
                duration: formDuration.trim() || undefined,
                projectName: formProject.trim() || undefined,
                builderName: formBuilder.trim() || undefined,
              }
            : v
        )
      );
      setEditingId(null);
    } else {
      // Add new
      const newItem: HomeVideoItem = {
        id: `video-${Date.now()}`,
        title: formTitle.trim(),
        url: formUrl.trim(),
        embedUrl: proc.embedUrl,
        platform: proc.platform,
        format: formFormat,
        category: formCategory,
        thumbnail: finalThumb,
        duration: formDuration.trim() || undefined,
        projectName: formProject.trim() || undefined,
        builderName: formBuilder.trim() || undefined,
      };
      setVideos((prev) => [newItem, ...prev]);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this video from Home Page reel?")) {
      setVideos((prev) => prev.filter((v) => v.id !== id));
      if (editingId === id) cancelEdit();
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= videos.length) return;
    const next = [...videos];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    setVideos(next);
  };

  const handleSaveToDatabase = async () => {
    setSaving(true);
    try {
      const jsonStr = JSON.stringify(videos);
      onFieldChange?.("home.videos", jsonStr);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            key: "home.videos",
            value: jsonStr,
            group: "SYSTEM",
          },
        ]),
      });

      if (!res.ok) throw new Error("Failed to save home videos");

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      onSaveSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to save home videos. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset Home Page videos back to sample showcase defaults?")) {
      setVideos(defaultHomeVideos);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Save Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <span>Home Page Videos & Shorts Reel Manager</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add, edit, reorder, or delete YouTube videos, YouTube shorts, Facebook videos, and Facebook reels shown on the public Home Page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset Defaults
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveToDatabase}
            disabled={saving}
            className="bg-primary text-primary-foreground font-semibold shadow-xs text-xs"
          >
            {saving ? (
              <span>Saving...</span>
            ) : savedSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1" /> Saved!
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1" /> Save All to Database ({videos.length})
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Form: Add / Edit Video */}
        <div className="lg:col-span-5">
          <Card className="sticky top-20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{editingId ? "Edit Video" : "Add New Video / Short"}</span>
                {editingId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={cancelEdit}
                    className="text-xs text-muted-foreground"
                  >
                    Cancel Edit
                  </Button>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Supports YouTube watch, shorts, youtu.be, and Facebook video / reel URLs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddOrUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Video Title *</Label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Luxury 3 BHK Sample Flat Walkthrough"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Video or Reel URL *</Label>
                  <Input
                    value={formUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://youtube.com/shorts/... or https://facebook.com/reel/..."
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Paste a YouTube link or Facebook reel. Format is auto-detected.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Platform</Label>
                    <select
                      value={formPlatform}
                      onChange={(e) => setFormPlatform(e.target.value as VideoPlatform)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="facebook">Facebook</option>
                      <option value="direct">Direct MP4 URL</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Format Aspect</Label>
                    <select
                      value={formFormat}
                      onChange={(e) => setFormFormat(e.target.value as VideoFormat)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    >
                      <option value="short">Short / Reel (Vertical 9:16)</option>
                      <option value="video">Standard Video (16:9)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Category</Label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    >
                      <option value="WALKTHROUGH">Walkthrough</option>
                      <option value="DRONE">Drone View</option>
                      <option value="SAMPLE_FLAT">Sample Flat</option>
                      <option value="PROMO">Promotional</option>
                      <option value="INTERVIEW">Builder Interview</option>
                      <option value="REVIEW">Client Review</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Duration Display</Label>
                    <Input
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="e.g. 0:45 or 1:20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Thumbnail Image URL</Label>
                  <Input
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    placeholder="https://... (auto-fetched for YouTube)"
                  />
                  {formThumbnail && (
                    <div className="mt-1 flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formThumbnail}
                        alt="Preview"
                        className="h-10 w-16 object-cover rounded border"
                      />
                      <span className="text-[11px] text-muted-foreground truncate">
                        Thumbnail preview loaded
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Project Name (Optional)</Label>
                    <Input
                      value={formProject}
                      onChange={(e) => setFormProject(e.target.value)}
                      placeholder="e.g. Evara 27-Acre Township"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Builder Name (Optional)</Label>
                    <Input
                      value={formBuilder}
                      onChange={(e) => setFormBuilder(e.target.value)}
                      placeholder="e.g. Shree Group"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-xs font-bold gap-1 mt-2"
                >
                  {editingId ? (
                    <>
                      <Check className="h-4 w-4" /> Update Video
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Add Video to Reel
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right List: Existing Videos */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
            <span>Current Home Page Videos ({videos.length})</span>
            <span>Drag / Move to reorder</span>
          </div>

          {videos.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              No videos added yet. Use the form on the left to add YouTube and Facebook videos/shorts.
            </div>
          ) : (
            videos.map((vid, idx) => (
              <div
                key={vid.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border bg-card hover:border-primary/40 transition-colors shadow-xs"
              >
                {/* Thumbnail & Badges */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-16 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={vid.thumbnail || "/images/property-1.jpg"}
                      alt={vid.title}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute bottom-1 left-1 text-[8px] font-bold px-1 rounded text-white ${
                        vid.platform === "facebook" ? "bg-blue-600" : "bg-red-600"
                      }`}
                    >
                      {vid.format === "short" ? "Short" : "Video"}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-primary uppercase">
                        {vid.category || "Walkthrough"}
                      </span>
                      {vid.duration && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          • {vid.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold truncate text-foreground">
                      {vid.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {vid.projectName || vid.builderName || vid.url}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, "up")}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Move Up"
                  >
                    <MoveUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={idx === videos.length - 1}
                    onClick={() => moveItem(idx, "down")}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Move Down"
                  >
                    <MoveDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(vid)}
                    className="h-7 w-7 text-muted-foreground hover:text-blue-500"
                    title="Edit Video"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(vid.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                    title="Delete Video"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
