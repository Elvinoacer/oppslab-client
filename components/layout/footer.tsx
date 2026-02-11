// =============================================================================
// Footer Component
// =============================================================================

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                Opps<span className="text-blue-600">Lab</span>
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Discover scholarships, grants, internships, and opportunities tailored for you.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Browse</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/opportunities" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  All Opportunities
                </Link>
              </li>
              <li>
                <Link href="/categories/scholarships" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  Scholarships
                </Link>
              </li>
              <li>
                <Link href="/categories/internships" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/categories/grants" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  Grants
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  Application Guides
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} OppsLab. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
