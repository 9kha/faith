"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Home,
  Layout,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LISTING_TYPES: Record<string, { label: string; icon: typeof Home }> = {
  SALE: { label: "For Sale", icon: Home },
  RENT: { label: "For Rent", icon: Home },
};

type PropertyCardData = {
  id: string;
  title: string;
  slug: string;
  listingType: string;
  category: string;
  bhk: string | null;
  area: number | null;
  price: number | null;
  rent: number | null;
  city: string;
  locality: string;
  status: string;
  featured: boolean;
  imageUrl: string | null;
};

function ListingsPageContent({
  listingType = "SALE",
}: {
  listingType?: string;
}) {
  const searchParams = useSearchParams();
  const urlCity = searchParams.get("city") || searchParams.get("location") || "";
  const urlBhk = searchParams.get("bhk") || "";
  const urlType = searchParams.get("type") || searchParams.get("category") || "";
  const urlBudget = searchParams.get("budget") || "";

  let initialBudgetMin = "";
  let initialBudgetMax = "";
  if (urlBudget.includes("-")) {
    const [min, max] = urlBudget.split("-");
    initialBudgetMin = min || "";
    initialBudgetMax = max || "";
  } else if (urlBudget.endsWith("+")) {
    initialBudgetMin = urlBudget.replace("+", "");
  }

  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    location: urlCity,
    budgetMin: initialBudgetMin,
    budgetMax: initialBudgetMax,
    bhk: urlBhk,
    category: urlType ? urlType.toUpperCase() : "",
    status: "",
    furnishing: "",
    amenities: "",
    builder: "",
    reraOnly: false,
    keyword: "",
  });

  const PAGE_SIZE = 12;

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        listingType,
        page: String(page),
        limit: String(PAGE_SIZE),
        ...(filters.location ? { location: filters.location, city: filters.location } : {}),
        ...(filters.budgetMin ? { priceMin: filters.budgetMin } : {}),
        ...(filters.budgetMax ? { priceMax: filters.budgetMax } : {}),
        ...(filters.bhk ? { bhk: filters.bhk } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.builder ? { builder: filters.builder } : {}),
        ...(filters.reraOnly ? { reraOnly: "true" } : {}),
        ...(filters.keyword ? { keyword: filters.keyword } : {}),
      });
      const res = await fetch(`/api/properties/search?${params}`);
      const data = await res.json();
      setProperties(data.properties || []);
      setTotal(data.total || 0);
    } catch {
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [listingType, page, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProperties();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProperties]);

  const updateFilters = (updates: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const priceLabel = listingType === "RENT" ? "Rent (₹/mo)" : "Price (₹)";

  return (
    <div className="mx-auto max-w-[1720px] space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
            {listingType === "RENT" ? "Properties for Rent" : "Properties for Sale"}
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Find your perfect {listingType === "RENT" ? "rental" : "home"} in {filters.location || "Central India"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => updateFilters({ reraOnly: !filters.reraOnly })}>
            {filters.reraOnly ? "✓ RERA Verified Only" : "Filter: RERA Verified"}
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-card dark:bg-slate-900/90 dark:border-slate-800">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Location</label>
            <Input
              placeholder="City, locality or pincode"
              value={filters.location}
              onChange={(e) => updateFilters({ location: e.target.value })}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{priceLabel} Min</label>
            <Input
              type="number"
              placeholder="Min"
              value={filters.budgetMin}
              onChange={(e) => updateFilters({ budgetMin: e.target.value })}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{priceLabel} Max</label>
            <Input
              type="number"
              placeholder="Max"
              value={filters.budgetMax}
              onChange={(e) => updateFilters({ budgetMax: e.target.value })}
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">BHK</label>
            <Select value={filters.bhk} onValueChange={(v) => updateFilters({ bhk: v as string })}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Any BHK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="1 BHK">1 BHK</SelectItem>
                <SelectItem value="2 BHK">2 BHK</SelectItem>
                <SelectItem value="3 BHK">3 BHK</SelectItem>
                <SelectItem value="4 BHK">4 BHK</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Category</label>
            <Select value={filters.category} onValueChange={(v) => updateFilters({ category: v as string })}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Any Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="FLAT">Flat / Apartment</SelectItem>
                <SelectItem value="VILLA">Villa</SelectItem>
                <SelectItem value="PLOT">Plot</SelectItem>
                <SelectItem value="SHOP">Shop</SelectItem>
                <SelectItem value="OFFICE">Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Status</label>
            <Select value={filters.status} onValueChange={(v) => updateFilters({ status: v as string })}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Any Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
                <SelectItem value="RENTED">Rented</SelectItem>
                <SelectItem value="UNDER_OFFER">Under Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={() => {
              updateFilters({
                location: "",
                budgetMin: "",
                budgetMax: "",
                bhk: "",
                category: "",
                status: "",
                furnishing: "",
                amenities: "",
                builder: "",
                reraOnly: false,
                keyword: "",
              });
            }}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {total} {total === 1 ? "property" : "properties"} found
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">View:</span>
          <div className="flex rounded-md border border-input bg-background dark:border-slate-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs ${
                viewMode === "grid" ? "bg-primary text-primary-foreground font-semibold" : "text-gray-600 dark:text-slate-400 hover:bg-muted dark:hover:bg-slate-800"
              }`}
            >
              <Home className="mr-1 h-3 w-3" /> Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs ${
                viewMode === "list" ? "bg-primary text-primary-foreground font-semibold" : "text-gray-600 dark:text-slate-400 hover:bg-muted dark:hover:bg-slate-800"
              }`}
            >
              <Layout className="mr-1 h-3 w-3" /> List
            </button>
          </div>
        </div>
      </div>

      {/* Grid / List View */}
      <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
        {properties.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <Home className="h-12 w-12 text-gray-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No properties found</h3>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Try adjusting your filters or search for a different location.
            </p>
            <Button className="mt-4" onClick={() => updateFilters({ location: "", budgetMin: "", budgetMax: "", bhk: "", category: "", status: "", reraOnly: false, keyword: "" })}>
              Reset Filters
            </Button>
          </div>
        ) : (
          properties.map((p) => (
            <PropertyListingCard key={p.id} property={p} listingType={listingType} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Prev
          </Button>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function PropertyListingCard({ property, listingType }: { property: PropertyCardData; listingType: string }) {
  const price = listingType === "RENT" ? property.rent : property.price;
  const priceLabel = listingType === "RENT" ? "₹/mo" : "Cr";

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 dark:bg-slate-900/90 dark:border-slate-800">
      <div className="relative h-48 overflow-hidden">
        {property.imageUrl ? (
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="h-full w-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-300 dark:text-slate-600" />
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-primary text-white text-xs">
          {property.status}
        </Badge>
        {property.featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-semibold">
            Featured
          </Badge>
        )}
      </div>
      <div className="p-4">
        <Link href={`/properties/${property.slug}`} className="block">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors mb-1">
            {property.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">{property.city}, {property.locality}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
            {property.bhk && <span>{property.bhk}</span>}
            <span>•</span>
            {property.area && <span>{property.area} sq ft</span>}
            <span>•</span>
            <span>{property.category}</span>
          </div>
        </Link>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="font-bold text-gray-900 dark:text-white text-lg">
            ₹{price ? (price / 10000000).toFixed(1) : 0}{priceLabel}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default function ListingsPage(props: { listingType?: string }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center text-muted-foreground text-sm font-medium">
          Loading properties...
        </div>
      }
    >
      <ListingsPageContent {...props} />
    </Suspense>
  );
}
