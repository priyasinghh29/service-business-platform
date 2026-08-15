import type { Metadata } from "next";
import CmsContentPage from "@/components/marketing/CmsContentPage";
import { fetchPublicApi } from "@/lib/api-helpers";
import type { CmsPageData } from "@/lib/catalog-types";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPublicApi<CmsPageData>("/pages/privacy-policy");
  return {
    title: page?.meta_title ?? page?.title ?? "Privacy Policy | Oknitech Serve",
    description: page?.meta_description ?? "Privacy policy for Oknitech Serve.",
  };
}

export default function PrivacyPolicyPage() {
  return <CmsContentPage slug="privacy-policy" fallbackTitle="Privacy Policy" />;
}
