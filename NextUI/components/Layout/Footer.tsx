"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {year} {process.env.NEXT_PUBLIC_APP_NAME ?? "My App"}. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
              Home
            </Link>
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
