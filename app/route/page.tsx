"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function RouteRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const venue = searchParams.get("venue");
    const target = venue ? `/arrival?venue=${encodeURIComponent(venue)}` : "/arrival";
    router.replace(target);
  }, [searchParams, router]);

  return null;
}

export default function RoutePage() {
  return (
    <Suspense>
      <RouteRedirect />
    </Suspense>
  );
}
