"use client";

import { useState } from "react";
import {
  Video,
  Plus,
  Trash2,
  Edit2,
  Check,
  MoveUp,
  MoveDown,
  Film,
  Play,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  processVideoUrl,
  type VideoPlatform,
  type VideoFormat,
  type VideoMediaItem,
} from "@/lib/video-utils";

interface VideoGalleryFieldProps {
  videos: VideoMediaItem[];
  onChange: (videos: VideoMediaItem[]) => void;
  title?: string;
  description?: string;
}

export function VideoGalleryField({
  videos,
  onChange,
  title = "YouTube & Facebook Videos, Shorts & Reels",
  description = "Add project walkthroughs, sample flat videos, drone elevations, YouTube shorts, and Facebook reels.",
}: VideoGalleryFieldProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formPlatform, setFormPlatform] = useState<VideoPlatform>("youtube");
  const [formFormat, setFormFormat] = useState<VideoFormat>("short");
  const [formCategory, setFormCategory] = useState("WALKTHROUGH");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formDuration, setFormDuration] = useState("0:50");

  const handleUrlChange = (val: string) => {
    setFormUrl(val);
    const proc = processVideoUrl(val);
    setFormPlatform(proc.platform);
    setFormFormat(proc.format);
    if (!formThumbnail) {
      setFormThumbnail(proc.defaultThumbnail);
    }
  };

  const startEdit = (item: VideoMediaItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormUrl(item.url);
    setFormPlatform(item.platform);
    setFormFormat(item.format);
    setFormCategory(item.category || "WALKTHROUGH");
    setFormThumbnail(item.thumbnail || "");
    setFormDuration(item.duration || "");
    setIsAdding(true);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormTitle("");
    setFormUrl("");
    setFormThumbnail("");
    setFormDuration("0:50");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) return;

    const proc = processVideoUrl(formUrl, formFormat, formPlatform);
    const finalThumb = formThumbnail.trim() || proc.defaultThumbnail;

    if (editingId) {
      const updated = videos.map((v) =>
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
            }
          : v
      );
      onChange(updated);
    } else {
      const newItem: VideoMediaItem = {
        id: `v-${Date.now()}`,
        title: formTitle.trim(),
        url: formUrl.trim(),
        embedUrl: proc.embedUrl,
        platform: proc.platform,
        format: formFormat,
        category: formCategory,
        thumbnail: finalThumb,
        duration: formDuration.trim() || undefined,
      };
      onChange([...videos, newItem]);
    }

    cancelForm();
  };

  const handleDelete = (id: string) => {
    onChange(videos.filter((v) => v.id !== id));
    if (editingId === id) cancelForm();
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= videos.length) return;
    const next = [...videos];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            <span>{title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
              {videos.length}
            </span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        {!isAdding && (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              cancelForm();
              setIsAdding(true);
            }}
            className="text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Video / Short</span>
          </Button>
        )}
      </div>

      {/* Add / Edit Form Modal/Drawer */}
      {isAdding && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground">
              {editingId ? "Edit Video Details" : "Add YouTube / Facebook Video or Short"}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={cancelForm}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Video Title *</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. 3 BHK Sample Flat Walkthrough"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Video or Reel URL *</Label>
              <Input
                value={formUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/shorts/... or https://facebook.com/reel/..."
                required
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1">
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

            <div className="space-y-1">
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

            <div className="space-y-1">
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
                <option value="CONSTRUCTION">Construction Update</option>
                <option value="INTERVIEW">Builder Interview</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Duration Display</Label>
              <Input
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                placeholder="e.g. 0:45 or 1:15"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Thumbnail URL (Optional)</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={formThumbnail}
                onChange={(e) => setFormThumbnail(e.target.value)}
                placeholder="Auto-detected for YouTube, or enter image URL"
              />
              {formThumbnail && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={formThumbnail}
                  alt="Thumb"
                  className="h-9 w-14 object-cover rounded border shrink-0"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancelForm}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              className="text-xs font-bold gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{editingId ? "Update Video" : "Save Video"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Video List */}
      {videos.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
          No video tours or shorts added yet. Click &ldquo;Add Video / Short&rdquo; above to link YouTube videos, shorts, or Facebook reels.
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {videos.map((vid, idx) => (
            <div
              key={vid.id || idx}
              className="flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-background/50 hover:border-primary/40 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative h-12 w-10 rounded overflow-hidden bg-muted shrink-0 border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vid.thumbnail || "/images/property-1.jpg"}
                    alt={vid.title}
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0.5 left-0.5 text-[7px] font-bold px-1 rounded text-white ${
                      vid.platform === "facebook" ? "bg-blue-600" : "bg-red-600"
                    }`}
                  >
                    {vid.format === "short" ? "Reel" : "Vid"}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-primary uppercase">
                    {vid.category || "Video Tour"}
                  </span>
                  <p className="text-xs font-bold truncate text-foreground">
                    {vid.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {vid.url}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, "up")}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <MoveUp className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={idx === videos.length - 1}
                  onClick={() => moveItem(idx, "down")}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <MoveDown className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => startEdit(vid)}
                  className="h-6 w-6 text-muted-foreground hover:text-blue-500"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(vid.id)}
                  className="h-6 w-6 text-muted-foreground hover:text-rose-500"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
