"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  MapPin,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Building2,
  Eye,
  Edit2,
} from "lucide-react";
import { defaultCities, type CityExplorerItem } from "@/lib/settings";

export function CityManager({
  initialCities,
  onSaveSuccess,
}: {
  initialCities?: CityExplorerItem[];
  onSaveSuccess?: () => void;
}) {
  const [cities, setCities] = useState<CityExplorerItem[]>(
    initialCities && initialCities.length > 0 ? initialCities : defaultCities
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateCity = (id: string, field: keyof CityExplorerItem, value: any) => {
    setCities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const addCity = () => {
    const id = `city-${Date.now()}`;
    const newCity: CityExplorerItem = {
      id,
      name: "Raipur",
      slug: "raipur",
      count: "50+ Properties",
      avgPrice: "₹3,500/sq ft",
      tagline: "Emerging Smart City Capital",
      description: "Thriving real estate investments and modern high-rise gated townships.",
      enabled: true,
    };
    setCities((prev) => [...prev, newCity]);
    setEditingId(id);
  };

  const removeCity = (id: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            key: "home.cities",
            value: JSON.stringify(cities),
            group: "SYSTEM",
          },
        ]),
      });

      if (!res.ok) throw new Error("Failed to save cities");

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("home-cities-updated", { detail: cities })
        );
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      onSaveSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to save city list. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Top Cities Management
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the cities displayed in the Home Page &quot;Explore Top Cities&quot; section and their dedicated landing pages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" /> Changes Saved
            </span>
          )}
          <Button onClick={addCity} variant="outline" className="gap-1.5 rounded-xl text-xs">
            <Plus className="h-4 w-4" /> Add City
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Cities
          </Button>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {cities.map((city) => {
          const isEditing = editingId === city.id;
          return (
            <Card
              key={city.id}
              className={`transition-all border ${
                city.enabled ? "border-border shadow-xs" : "border-border/50 opacity-60 bg-muted/20"
              }`}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <CardTitle className="text-base font-bold text-foreground">
                      {city.name}
                    </CardTitle>
                    <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      /{city.slug}
                    </span>
                  </div>
                  {city.tagline && (
                    <CardDescription className="text-xs font-medium text-primary">
                      {city.tagline}
                    </CardDescription>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={city.enabled}
                    onCheckedChange={(v) => updateCity(city.id, "enabled", v)}
                    title="Toggle city visibility"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingId(isEditing ? null : city.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Edit city details"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    asChild
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    title="View live city page"
                  >
                    <Link href={`/city/${city.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeCity(city.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Delete city"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Overview Badges */}
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/50">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> {city.count}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5 text-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Avg. {city.avgPrice}
                  </span>
                </div>

                {city.description && !isEditing && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {city.description}
                  </p>
                )}

                {/* Edit Form Fields */}
                {isEditing && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[11px]">City Name</Label>
                        <Input
                          value={city.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            updateCity(city.id, "name", name);
                            // Auto-generate slug if matching
                            if (!city.slug || city.slug === city.name.toLowerCase().replace(/[^a-z0-9]/g, "")) {
                              updateCity(city.id, "slug", name.toLowerCase().replace(/[^a-z0-9]/g, ""));
                            }
                          }}
                          className="h-8 text-xs"
                          placeholder="e.g. Indore"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">URL Slug</Label>
                        <Input
                          value={city.slug}
                          onChange={(e) => updateCity(city.id, "slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          className="h-8 text-xs font-mono"
                          placeholder="e.g. indore"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[11px]">Property Count Badge</Label>
                        <Input
                          value={city.count}
                          onChange={(e) => updateCity(city.id, "count", e.target.value)}
                          className="h-8 text-xs"
                          placeholder="e.g. 320+ Properties"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Avg. Price per sq ft</Label>
                        <Input
                          value={city.avgPrice}
                          onChange={(e) => updateCity(city.id, "avgPrice", e.target.value)}
                          className="h-8 text-xs"
                          placeholder="e.g. ₹4,200/sq ft"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">City Tagline / Corridor</Label>
                      <Input
                        value={city.tagline || ""}
                        onChange={(e) => updateCity(city.id, "tagline", e.target.value)}
                        className="h-8 text-xs"
                        placeholder="e.g. Commercial & IT Capital of MP"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">Short City Overview Description</Label>
                      <Textarea
                        rows={2}
                        value={city.description || ""}
                        onChange={(e) => updateCity(city.id, "description", e.target.value)}
                        className="text-xs"
                        placeholder="Brief overview of real estate growth in this city..."
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">City Banner Image URL (Optional)</Label>
                      <Input
                        value={city.imageUrl || ""}
                        onChange={(e) => updateCity(city.id, "imageUrl", e.target.value)}
                        className="h-8 text-xs"
                        placeholder="e.g. /images/indore-skyline.jpg"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingId(null)}
                        className="text-xs h-7"
                      >
                        Done Editing
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2 rounded-xl px-8">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Cities Configuration
        </Button>
      </div>
    </div>
  );
}
