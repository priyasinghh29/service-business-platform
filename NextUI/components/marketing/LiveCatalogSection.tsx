"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPublicApi, formatMoney } from "@/lib/api-helpers";
import type { CatalogService } from "@/lib/catalog-types";

interface PaginatedServices {
  data: CatalogService[];
}

interface CatalogCategory {
  id: number;
  name: string;
  slug: string;
  services_count?: number;
}

export default function LiveCatalogSection() {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cats = await fetchPublicApi<CatalogCategory[]>("/categories");
      if (!cancelled && Array.isArray(cats)) setCategories(cats);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const params = new URLSearchParams({ per_page: "24" });
      if (category !== "all") params.set("category", category);

      let page: PaginatedServices | CatalogService[] | null = null;
      if (query.trim()) {
        params.set("q", query.trim());
        page = await fetchPublicApi<PaginatedServices | CatalogService[]>(
          `/services/search?${params.toString()}`
        );
      } else {
        page = await fetchPublicApi<PaginatedServices | CatalogService[]>(
          `/services?${params.toString()}`
        );
      }

      if (cancelled) return;
      const list = Array.isArray(page) ? page : Array.isArray(page?.data) ? page.data : [];
      setServices(list);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [category, query]);

  return (
    <section id="live-catalog" className="scroll-mt-24 py-xxl">
      <div className="mx-auto max-w-7xl px-margin-mobile md:px-margin-desktop">
        <div className="mb-xxl text-center">
          <h2 className="mb-sm font-display text-headline-lg text-on-surface">Live Service Catalog</h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            Filter by category or search bookable services with current pricing.
          </p>
        </div>

        <div className="mb-xl flex flex-col gap-md md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-sm">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`rounded-lg px-md py-sm text-label-md font-medium transition-colors ${
                category === "all"
                  ? "bg-primary-container text-on-primary"
                  : "border border-outline-variant text-on-surface hover:bg-surface-container-low"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.slug)}
                className={`rounded-lg px-md py-sm text-label-md font-medium transition-colors ${
                  category === cat.slug
                    ? "bg-primary-container text-on-primary"
                    : "border border-outline-variant text-on-surface hover:bg-surface-container-low"
                }`}
              >
                {cat.name}
                {typeof cat.services_count === "number" ? ` (${cat.services_count})` : ""}
              </button>
            ))}
          </div>
          <form
            className="flex w-full gap-sm md:max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(searchInput);
            }}
          >
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search services…"
              className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm outline-none focus:border-primary-container"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-primary-container px-md py-sm text-label-md font-medium text-on-primary hover:opacity-90"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <p className="text-center text-body-md text-on-surface-variant">Loading catalog…</p>
        ) : services.length === 0 ? (
          <p className="text-center text-body-md text-on-surface-variant">No matching services.</p>
        ) : (
          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-sm"
              >
                {service.category?.name && (
                  <span className="mb-md text-label-sm font-bold uppercase tracking-wide text-primary">
                    {service.category.name}
                  </span>
                )}
                <h3 className="mb-sm font-display text-headline-sm text-on-surface">{service.name}</h3>
                <p className="mb-lg flex-1 text-body-sm text-on-surface-variant">
                  {service.short_description || "Professional service engagement."}
                </p>
                <div className="mb-lg flex items-baseline justify-between gap-2">
                  <span className="font-display text-headline-sm text-primary">
                    {formatMoney(service.price)}
                  </span>
                  {service.duration_minutes ? (
                    <span className="text-label-sm text-on-surface-variant">
                      {service.duration_minutes} min
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-sm">
                  <Link
                    href={`/services/${service.slug}`}
                    className="flex-1 rounded-lg border border-outline-variant px-md py-sm text-center text-label-md font-medium text-on-surface hover:bg-surface-container-low"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/book/${service.slug}`}
                    className="flex-1 rounded-lg bg-primary-container px-md py-sm text-center text-label-md font-medium text-on-primary hover:opacity-90"
                  >
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
