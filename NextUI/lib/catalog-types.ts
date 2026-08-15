export interface CatalogService {
  id: number;
  category_id?: number;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  price: number | string;
  duration_minutes?: number | null;
  image?: string | null;
  is_featured?: boolean;
  status?: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
  } | null;
}

export interface CatalogReview {
  id: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
  created_at?: string;
  user?: {
    id: number;
    first_name?: string;
    last_name?: string;
  } | null;
}

export interface CmsPageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface BrandingSettings {
  brand_name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  currency?: string;
  support_email?: string;
  support_phone?: string;
  timezone?: string;
}
