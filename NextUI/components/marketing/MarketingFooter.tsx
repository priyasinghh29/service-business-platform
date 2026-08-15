import Link from "next/link";
import Logo from "@/components/marketing/Logo";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-gutter px-4 py-12 sm:grid-cols-2 sm:px-6 sm:py-16 lg:grid-cols-4 lg:px-10 lg:py-xxl">
        <div>
          <Logo size="footer" />
          <p className="mb-xl mt-lg text-body-sm text-on-surface-variant">
            Elevating professional services through digital innovation and institutional trust.
          </p>
        </div>

        <div>
          <h4 className="mb-lg text-label-md font-bold text-on-background">Platform</h4>
          <ul className="space-y-sm text-body-sm text-on-surface-variant">
            <li>
              <Link href="/services" className="transition-colors hover:text-primary">
                Services
              </Link>
            </li>
            <li>
              <Link href="/industries" className="transition-colors hover:text-primary">
                Industries
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition-colors hover:text-primary">
                About
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition-colors hover:text-primary">
                Portal Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-lg text-label-md font-bold text-on-background">Legal</h4>
          <ul className="space-y-sm text-body-sm text-on-surface-variant">
            <li>
              <Link href="/privacy-policy" className="transition-colors hover:text-primary">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="transition-colors hover:text-primary">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/faq" className="transition-colors hover:text-primary">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-lg text-label-md font-bold text-on-background">Contact Us</h4>
          <ul className="space-y-sm text-body-sm text-on-surface-variant">
            <li className="flex items-center gap-xs">
              
              info@oknitech.serve
            </li>
            <li className="flex items-center gap-xs">
              
              +1 (800) 555-0123
            </li>
            <li className="flex items-center gap-xs">
              
              500 Modern Ave, Tech City
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-outline-variant/30 py-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-body-sm text-on-surface-variant sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <span>© {new Date().getFullYear()} Oknitech Serve. All rights reserved.</span>
          <div className="flex gap-lg">
            <Link href="/support" className="hover:text-primary">
              Support
            </Link>
            <Link href="/about" className="hover:text-primary">
              Careers
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
