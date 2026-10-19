"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CircleHelp } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Log error.digest to console only; never render the error message or stack to users.
    if (error.digest) {
      console.error(error.digest);
    } else {
      console.error("An unexpected error occurred");
    }
    headingRef.current?.focus();
  }, [error]);

  return (
    <main className="site-shell closing-section">
      <CircleHelp aria-hidden="true" />
      <p>System error</p>
      <h2 ref={headingRef} tabIndex={-1} style={{ outline: "none" }}>
        Something went wrong loading this family history.
      </h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button className="button button--primary" onClick={() => reset()}>
          Try again
        </button>
        <Link className="button button--quiet" href="/">
          Go home
        </Link>
      </div>
    </main>
  );
}
