"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Image as ImageIcon, FileText, Search, Folder, Trash2, Loader2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type MediaItem = {
  id: string;
  url: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
  alt: string | null;
  caption: string | null;
  createdAt: string;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const uploadForm = useForm<{ alt: string; caption: string }>({
    defaultValues: { alt: "", caption: "" },
  });

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "24",
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/media?${params}`);
      const data = await res.json();
      setMedia(data.media || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setMedia([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMedia();
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadMedia, search]);

  const filtered = media;

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setUploading(true);
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await loadMedia();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media file?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadMedia();
    } catch {
      alert("Failed to delete media file");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage your images, videos, and documents</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => setUploadOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="group cursor-pointer">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              {item.mime.startsWith("image/") ? (
                <img
                  src={item.url}
                  alt={item.alt || ""}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {item.mime.startsWith("video/") ? (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  ) : (
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
              )}
              <Badge className="absolute top-2 right-2 bg-muted/50 backdrop-blur">
                {item.mime.split("/")[0].toUpperCase()}
              </Badge>
              <Button
                variant="destructive"
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                disabled={deletingId === item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDelete(item.id);
                }}
                aria-label="Delete media"
              >
                {deletingId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardContent className="p-3 pt-2">
              <p className="text-xs text-muted-foreground truncate">{item.alt}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(item.size)}</p>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Folder className="h-8 w-8 mb-2 opacity-50" />
            <p>No media found</p>
          </div>
        )}
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          <Form form={uploadForm} onSubmit={handleUpload} className="space-y-4">
              <FormField
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select file</FormLabel>
                    <FormControl>
                      <input type="file" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt text</FormLabel>
                    <FormControl>
                      <Input placeholder="Descriptive alt text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional caption" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={uploading}>
                Upload
              </Button>
          </Form>
        </DialogContent>
      </Dialog>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        label="assets"
        onChange={setPage}
      />
    </div>
  );
}
