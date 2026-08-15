import type { Metadata } from "next";
import CmsContentPage from "@/components/marketing/CmsContentPage";
import { fetchPublicApi } from "@/lib/api-helpers";
import type { CmsPageData } from "@/lib/catalog-types";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPublicApi<CmsPageData>("/pages/terms-and-conditions");
  return {
    title: page?.meta_title ?? page?.title ?? "Terms & Conditions | Oknitech Serve",
    description: page?.meta_description ?? "Terms of use for Oknitech Serve.",
  };
}

export default function TermsPage() {
  return <CmsContentPage slug="terms-and-conditions" fallbackTitle="Terms & Conditions" />;
}
