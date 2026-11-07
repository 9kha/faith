"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type BuilderData = {
  id: string;
  name: string;
  slug: string;
  about: string | null;
  reraNo: string | null;
  website: string | null;
  contactName: string | null;
  contactPhone: string | null;
  status: string;
  featured: boolean;
  logoUrl: string | null;
  projectCount: number;
};

export default function BuildersPage() {
  const [builders, setBuilders] = useState<BuilderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/builders?search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (mounted) {
          setBuilders(data.builders || []);
        }
      } catch {
        if (mounted) setBuilders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [search]);

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
          <h1 className="text-3xl font-serif font-bold text-gray-900">Builders</h1>
          <p className="text-gray-600 mt-1">
            Explore projects from verified RERA-registered builders
          </p>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search builders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {builders.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No builders found</h3>
          </div>
        ) : (
          builders.map((b) => (
            <BuilderCard key={b.id} builder={b} />
          ))
        )}
      </div>
    </div>
  );
}

function BuilderCard({ builder }: { builder: BuilderData }) {
  return (
    <Link href={`/builders/${builder.slug}`} className="block">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="relative h-48 overflow-hidden">
          {builder.logoUrl ? (
            <Image
              src={builder.logoUrl}
              alt={builder.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
              <Building2 className="h-12 w-12 text-gray-300" />
            </div>
          )}
          <Badge className="absolute top-2 right-2 bg-gray-100 text-gray-700 text-xs">
            {builder.status}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
            {builder.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{builder.projectCount} project(s)</p>
          {builder.reraNo && (
            <p className="text-xs text-primary mt-1">RERA: {builder.reraNo}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
