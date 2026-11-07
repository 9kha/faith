"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800 border-green-200",
  SOLD: "bg-red-100 text-red-800 border-red-200",
  BLOCKED: "bg-gray-100 text-gray-800 border-gray-200",
  HOLD: "bg-yellow-100 text-yellow-800 border-yellow-200",
  RENTED: "bg-blue-100 text-blue-800 border-blue-200",
};

type UnitRow = {
  id: string;
  unitNo: string;
  floor: number | null;
  bhk: string | null;
  area: number | null;
  price: number | null;
  status: string;
  tower: { name: string } | null;
};

type ProjectRow = {
  id: string;
  name: string;
  slug: string;
};

export default function InventoryPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/projects?limit=100");
        const data = await res.json();
        if (mounted) setProjects(data.projects || []);
      } catch {
        if (mounted) setProjects([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(
          `/api/inventory?projectId=${encodeURIComponent(selectedProject)}`
        );
        const data = await res.json();
        if (mounted) setUnits(data.units || []);
      } catch {
        if (mounted) setUnits([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedProject]);

  const towers = [...new Set(units.map((u) => u.tower?.name).filter(Boolean))];

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
          <h1 className="text-2xl font-bold">Unit Inventory</h1>
          <p className="text-muted-foreground">
            Manage unit-level inventory with color-coded status
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.map((p) => (
                <Button
                  key={p.id}
                  onClick={() => setSelectedProject(p.id)}
                  variant={selectedProject === p.id ? "default" : "outline"}
                  className="w-full justify-start"
                >
                  {p.name}
                </Button>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No projects found. Create a project first.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedProject && (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Unit Status</CardTitle>
              <div className="flex gap-1">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <Badge key={status} variant="secondary" className={color}>
                    {status}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {towers.map((towerName) => {
                  const towerUnits = units.filter(
                    (u) => u.tower?.name === towerName
                  );
                  return (
                    <Card key={towerName} className="p-3">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">
                          {towerName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2">
                        <div className="grid grid-cols-2 gap-1">
                          {towerUnits.map((u) => (
                            <div
                              key={u.id}
                              className={`${
                                STATUS_COLORS[u.status] || "bg-gray-100"
                              } rounded border text-xs text-center py-2 px-1 cursor-pointer`}
                              title={`${u.unitNo} - ${u.bhk} - ${u.area} sq ft - ₹${u.price || 0}`}
                            >
                              <div className="font-bold">{u.unitNo}</div>
                              <div className="text-[10px] opacity-80">
                                {u.bhk}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {towers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No units found for this project.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
