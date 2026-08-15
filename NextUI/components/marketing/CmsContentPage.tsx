import MarketingLayout from "@/components/marketing/MarketingLayout";
import { fetchPublicApi } from "@/lib/api-helpers";
import type { CmsPageData } from "@/lib/catalog-types";

export default async function CmsContentPage({
  slug,
  fallbackTitle,
}: {
  slug: string;
  fallbackTitle: string;
}) {
  const page = await fetchPublicApi<CmsPageData>(`/pages/${slug}`);
  const title = page?.title ?? fallbackTitle;
  const html = page?.content ?? `<p>Content for ${fallbackTitle} will appear here once published in CMS.</p>`;

  return (
    <MarketingLayout>
      <section className="bg-gradient-to-b from-surface-container-low to-background py-xxl">
        <div className="mx-auto max-w-3xl px-margin-mobile md:px-margin-desktop">
          <h1 className="mb-xl font-display text-[2rem] font-bold tracking-tight text-on-surface md:text-headline-lg">
            {title}
          </h1>
          <article
            className="prose prose-neutral max-w-none space-y-4 text-body-md text-on-surface-variant [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-headline-sm [&_h3]:text-on-surface [&_p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </section>
    </MarketingLayout>
  );
}
