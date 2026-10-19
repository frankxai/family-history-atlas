import { Network, Github, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Family History Atlas home">
          <span className="brand__mark" aria-hidden="true">
            <Network size={19} strokeWidth={1.6} />
          </span>
          <span>
            Family History <strong>Atlas</strong>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/#atlas-story">Experience</Link>
          <Link href="/#evidence">Evidence</Link>
          <Link href="/#build">Build yours</Link>
          <a
            className="nav-github"
            href="https://github.com/frankxai/family-history-atlas"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={16} /> GitHub
          </a>
        </nav>
      </header>
      <section className="closing-section">
        <Network size={32} />
        <p>404</p>
        <h1>Page not found</h1>
        <div style={{ marginTop: "1rem", color: "var(--parchment-300)" }}>
          The page you are looking for does not exist or has been moved.
        </div>
        <Link className="button button--primary" href="/">
          Return to home <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
