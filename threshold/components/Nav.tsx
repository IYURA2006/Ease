"use client";

import Link from "next/link";
import { useState } from "react";
import { OrganiserDrawer } from "./OrganiserDrawer";

function DoorwayIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4" />
      <path d="M9 12h6" />
      <path d="M12 9v6" />
    </svg>
  );
}

export function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header
        className="no-print sticky top-0 z-40 border-b border-stone-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        role="banner"
      >
        <nav
          className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
          aria-label="Main navigation"
        >
          <Link
            href="/discover"
            className="flex items-center gap-2 text-text-primary hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded"
            aria-label="Threshold home"
          >
            <DoorwayIcon />
            <span className="font-playfair text-xl font-semibold tracking-tight">
              THRESHOLD
            </span>
          </Link>

          <div className="flex items-center gap-6" role="menubar">
            <Link
              href="/discover"
              className="text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded text-sm font-medium"
              role="menuitem"
            >
              Discover
            </Link>
            <Link
              href="/captions"
              className="text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded text-sm font-medium"
              role="menuitem"
            >
              Captions
            </Link>
            <Link
              href="/route"
              className="text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 rounded text-sm font-medium"
              role="menuitem"
            >
              Safe Route
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2"
            aria-label="Submit your show for a sensory passport"
          >
            Submit Your Show
          </button>
        </nav>
      </header>

      <OrganiserDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
