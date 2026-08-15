import type { Metadata } from "next";
import CmsContentPage from "@/components/marketing/CmsContentPage";
import { fetchPublicApi } from "@/lib/api-helpers";
import type { CmsPageData } from "@/lib/catalog-types";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPublicApi<CmsPageData>("/pages/faq");
  return {
    title: page?.meta_title ?? page?.title ?? "FAQ | Oknitech Serve",
    description: page?.meta_description ?? "Frequently asked questions.",
  };
}

export default function FaqPage() {
  return <CmsContentPage slug="faq" fallbackTitle="FAQ" />;
}
