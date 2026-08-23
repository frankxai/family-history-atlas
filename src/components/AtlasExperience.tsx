"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleHelp,
  Clock3,
  Code2,
  Compass,
  FileSearch,
  Fingerprint,
  Github,
  Menu,
  Network,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type {
  AtlasSceneLink,
  AtlasSceneNode,
  AtlasStoryDocument,
  EvidenceConclusion,
  LayoutPoint,
} from "../atlas/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const evidenceLabels: Record<EvidenceConclusion, string> = {
  lead: "Research lead",
  supported: "Supported",
  strongly_supported: "Strongly supported",
  contradicted: "Contradicted",
  unresolved: "Unresolved",
};

const deployUrl =
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffrankxai%2Ffamily-history-atlas&project-name=family-history-atlas&repository-name=family-history-atlas";

type LayoutMode = "wide" | "compact";

function edgePath(from: LayoutPoint, to: LayoutPoint, kind: AtlasSceneLink["kind"]): string {
  if (kind === "partner" || kind === "chosen_family") {
    return `M ${from.x} ${from.y} C ${(from.x + to.x) / 2} ${from.y - 28}, ${(from.x + to.x) / 2} ${to.y - 28}, ${to.x} ${to.y}`;
  }
  const midpoint = from.y + (to.y - from.y) * 0.54;
  return `M ${from.x} ${from.y} C ${from.x} ${midpoint}, ${to.x} ${midpoint}, ${to.x} ${to.y}`;
}

function AtlasMap({
  document,
  mode,
  selectedId,
  onSelect,
}: Readonly<{
  document: AtlasStoryDocument;
  mode: LayoutMode;
  selectedId: string;
  onSelect: (id: string) => void;
}>) {
  const nodeById = useMemo(
    () => new Map(document.nodes.map((node) => [node.presentationId, node])),
    [document.nodes],
  );
  const width = mode === "wide" ? 1000 : 320;
  const height =
    mode === "wide" ? 650 : Math.max(600, ...document.nodes.map((node) => node.layout.compact.y + 80));

  return (
    <div
      className={`atlas-map atlas-map--${mode}`}
      style={{ "--atlas-ratio": `${width} / ${height}` } as React.CSSProperties}
      aria-label={`${document.title} interactive family tree`}
    >
      <div className="atlas-orbit atlas-orbit--one" aria-hidden="true" />
      <div className="atlas-orbit atlas-orbit--two" aria-hidden="true" />
      <svg
        className="atlas-links"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id={`soft-glow-${mode}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {document.links.map((link) => {
          const from = nodeById.get(link.fromPresentationId);
          const to = nodeById.get(link.toPresentationId);
          if (!from || !to) return null;
          return (
            <path
              key={`${mode}-${link.id}`}
              className={`atlas-edge atlas-edge--${link.kind} atlas-edge--${link.evidence}`}
              data-from={link.fromPresentationId}
              data-to={link.toPresentationId}
              d={edgePath(from.layout[mode], to.layout[mode], link.kind)}
              pathLength="1"
              filter={`url(#soft-glow-${mode})`}
            />
          );
        })}
      </svg>

      {document.nodes.map((node) => {
        const point = node.layout[mode];
        const left = `${(point.x / width) * 100}%`;
        const top = `${(point.y / height) * 100}%`;
        const isSelected = node.presentationId === selectedId;
        return (
          <button
            key={`${mode}-${node.presentationId}`}
            type="button"
            className={`atlas-node atlas-node--${node.accent ?? "copper"} ${isSelected ? "is-selected" : ""}`}
            data-node-id={node.presentationId}
            data-generation={point.generation}
            style={{ left, top }}
            aria-pressed={isSelected}
            aria-label={`${node.displayName}, ${node.years}, ${evidenceLabels[node.evidence]}`}
            onClick={() => onSelect(node.presentationId)}
          >
            <span className="atlas-node__ring" aria-hidden="true" />
            <span className="atlas-node__initials" aria-hidden="true">
              {node.displayName
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </span>
            <span className="atlas-node__label">
              <span>{node.displayName}</span>
              <small>{node.years}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function EvidenceMark({ status }: Readonly<{ status: EvidenceConclusion }>) {
  return (
    <span className={`evidence-mark evidence-mark--${status}`}>
      <span aria-hidden="true" />
      {evidenceLabels[status]}
    </span>
  );
}

function NodeDossier({ node }: Readonly<{ node: AtlasSceneNode }>) {
  return (
    <aside className="node-dossier" aria-live="polite">
      <div className="node-dossier__topline">
        <span>Selected life</span>
        <EvidenceMark status={node.evidence} />
      </div>
      <h3>{node.displayName}</h3>
      <p className="node-dossier__meta">
        {node.years} · {node.role}
      </p>
      <p>{node.summary}</p>
      <div className="node-dossier__footer">
        <span>{node.place ?? "Place withheld"}</span>
        <span>{node.sourceCount} source {node.sourceCount === 1 ? "record" : "records"}</span>
      </div>
    </aside>
  );
}

export function AtlasExperience({
  document,
  instanceLabel = "Open-source showcase",
}: Readonly<{
  document: AtlasStoryDocument;
  instanceLabel?: string;
}>) {
  const rootRef = useRef<HTMLElement>(null);
  const [selectedId, setSelectedId] = useState(document.nodes[0]?.presentationId ?? "");
  const [activeChapter, setActiveChapter] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const selectedNode =
    document.nodes.find((node) => node.presentationId === selectedId) ?? document.nodes[0];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const media = gsap.matchMedia();

      media.add(
        {
          wide: "(min-width: 900px)",
          compact: "(max-width: 899px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { wide, reduce } = context.conditions as {
            wide: boolean;
            compact: boolean;
            reduce: boolean;
          };

          gsap.set(".hero-reveal", { autoAlpha: 1 });

          if (reduce) {
            gsap.set(".atlas-node, .atlas-edge, .reveal-block", { clearProps: "all" });
            return;
          }

          gsap.from(".hero-reveal", {
            y: 26,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.11,
            ease: "power3.out",
          });

          gsap.to(".scroll-progress__fill", {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.2,
            },
          });

          if (wide) {
            const world = root.querySelector<HTMLElement>(".atlas-stage__world");
            const nodes = gsap.utils.toArray<HTMLElement>(".atlas-map--wide .atlas-node");
            const edges = gsap.utils.toArray<SVGPathElement>(".atlas-map--wide .atlas-edge");
            gsap.set(nodes, { autoAlpha: 0.24, scale: 0.92 });
            gsap.set(edges, { strokeDashoffset: 1 });

            document.chapters.forEach((chapter, index) => {
              const chapterElement = root.querySelector<HTMLElement>(`[data-chapter="${chapter.id}"]`);
              if (!chapterElement || !world) return;

              ScrollTrigger.create({
                trigger: chapterElement,
                start: "top 62%",
                end: "bottom 38%",
                onToggle: ({ isActive }) => {
                  if (!isActive) return;
                  setActiveChapter(index);
                  gsap.to(world, {
                    xPercent: chapter.camera.xPercent,
                    yPercent: chapter.camera.yPercent,
                    scale: chapter.camera.scale,
                    duration: 0.7,
                    ease: "power3.inOut",
                    overwrite: "auto",
                  });
                  gsap.to(nodes, {
                    autoAlpha: 0.2,
                    scale: 0.92,
                    duration: 0.35,
                    overwrite: "auto",
                  });
                  const activeNodes = chapter.nodeIds
                    .map((id) => root.querySelector<HTMLElement>(`.atlas-map--wide [data-node-id="${id}"]`))
                    .filter(Boolean);
                  gsap.to(activeNodes, {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.55,
                    stagger: 0.05,
                    ease: "power2.out",
                    overwrite: "auto",
                  });
                  gsap.to(edges, {
                    strokeDashoffset: index === 0 ? 0.45 : 0,
                    duration: 0.8,
                    stagger: 0.012,
                    ease: "power2.out",
                  });
                },
              });
            });
          } else {
            gsap.set(".atlas-map--compact .atlas-node", { autoAlpha: 0, y: 24 });
            ScrollTrigger.batch(".atlas-map--compact .atlas-node", {
              start: "top 88%",
              once: true,
              batchMax: 3,
              onEnter: (batch) =>
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.6,
                  stagger: 0.08,
                  ease: "power3.out",
                }),
            });
          }

          ScrollTrigger.batch(".reveal-block", {
            start: "top 86%",
            once: true,
            onEnter: (batch) =>
              gsap.from(batch, {
                y: 28,
                autoAlpha: 0,
                duration: 0.7,
                stagger: 0.08,
                ease: "power3.out",
              }),
          });
        },
      );

      return () => media.revert();
    },
    { scope: rootRef, dependencies: [document] },
  );

  return (
    <main ref={rootRef} className="site-shell">
      <a className="skip-link" href="#atlas-story">
        Skip to the family story
      </a>
      <div className="scroll-progress" aria-hidden="true">
        <span className="scroll-progress__fill" />
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Family History Atlas home">
          <span className="brand__mark" aria-hidden="true">
            <Network size={19} strokeWidth={1.6} />
          </span>
          <span>
            Family History <strong>Atlas</strong>
          </span>
        </a>
        <nav className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
          <a href="#atlas-story" onClick={() => setMenuOpen(false)}>
            Experience
          </a>
          <a href="#evidence" onClick={() => setMenuOpen(false)}>
            Evidence
          </a>
          <a href="#build" onClick={() => setMenuOpen(false)}>
            Build yours
          </a>
          <a
            className="nav-github"
            href="https://github.com/frankxai/family-history-atlas"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={16} /> GitHub
          </a>
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <section id="top" className="hero-section">
        <div className="hero-texture" aria-hidden="true">
          <Image
            src="/images/archive-thread.png"
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-kicker hero-reveal">
            <span className="status-dot" />
            {instanceLabel} · synthetic data only
          </div>
          <h1 className="hero-reveal">
            Every branch has a story.
            <span>Every story keeps its source.</span>
          </h1>
          <p className="hero-lede hero-reveal">
            A cinematic, evidence-aware family tree for people, places, memories, and the questions that
            history leaves open.
          </p>
          <div className="hero-actions hero-reveal">
            <a className="button button--primary" href="#atlas-story">
              Enter the atlas <ArrowDown size={17} />
            </a>
            <a
              className="button button--quiet"
              href="https://github.com/frankxai/family-history-atlas"
              target="_blank"
              rel="noreferrer"
            >
              View source <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className="hero-proof hero-reveal" aria-label="Product principles">
          <div>
            <ShieldCheck aria-hidden="true" />
            <span>Privacy before layout</span>
          </div>
          <div>
            <Fingerprint aria-hidden="true" />
            <span>Claims keep provenance</span>
          </div>
          <div>
            <Sparkles aria-hidden="true" />
            <span>Motion respects access</span>
          </div>
        </div>
        <div className="hero-scroll-cue" aria-hidden="true">
          <span />
          Scroll to unfold
        </div>
      </section>

      <section className="first-read">
        <p>Not a database dressed as a tree.</p>
        <h2>A family history should feel alive without pretending uncertainty is certainty.</h2>
        <div className="first-read__grid">
          <article className="reveal-block">
            <span>01</span>
            <Network />
            <h3>See relationships</h3>
            <p>Parenthood, partnership, adoption, guardianship, and chosen family keep their meaning.</p>
          </article>
          <article className="reveal-block">
            <span>02</span>
            <FileSearch />
            <h3>Follow the evidence</h3>
            <p>Each line can carry source strength, conflict, and the next question worth researching.</p>
          </article>
          <article className="reveal-block">
            <span>03</span>
            <Compass />
            <h3>Travel through time</h3>
            <p>Stories, dates, and reviewed places become a scroll journey that works on every screen.</p>
          </article>
        </div>
      </section>

      <section id="atlas-story" className="atlas-story">
        <div className="atlas-story__intro reveal-block">
          <p className="section-kicker">The living atlas</p>
          <h2>Scroll through four generations of a fictional family.</h2>
          <p>
            Select any person to read the projected dossier. The visual receives only public-safe scene data;
            the hidden living test record never reaches layout or motion.
          </p>
        </div>

        <div className="atlas-story__wide">
          <div className="atlas-stage">
            <div className="atlas-stage__chrome">
              <span>{document.title}</span>
              <span>
                Scene {String(activeChapter + 1).padStart(2, "0")} / {String(document.chapters.length).padStart(2, "0")}
              </span>
            </div>
            <div className="atlas-stage__world">
              <AtlasMap
                document={document}
                mode="wide"
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
            {selectedNode ? <NodeDossier node={selectedNode} /> : null}
          </div>

          <div className="chapter-rail">
            {document.chapters.map((chapter, index) => (
              <article
                key={chapter.id}
                className={index === activeChapter ? "story-chapter is-active" : "story-chapter"}
                data-chapter={chapter.id}
              >
                <p>{chapter.eyebrow}</p>
                <h3>{chapter.title}</h3>
                <div className="chapter-rule" aria-hidden="true">
                  <span />
                </div>
                <p className="story-chapter__copy">{chapter.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="atlas-story__compact">
          <AtlasMap
            document={document}
            mode="compact"
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          {selectedNode ? <NodeDossier node={selectedNode} /> : null}
          <div className="compact-chapters">
            {document.chapters.map((chapter) => (
              <article key={chapter.id} className="reveal-block">
                <p>{chapter.eyebrow}</p>
                <h3>{chapter.title}</h3>
                <p>{chapter.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="timeline-section">
        <div className="timeline-heading reveal-block">
          <p className="section-kicker">Time and place</p>
          <h2>A tree becomes history when events enter the frame.</h2>
        </div>
        <div className="timeline-track">
          {document.events.map((event, index) => (
            <article key={event.id} className="timeline-event reveal-block">
              <div className="timeline-event__year">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{event.year}</strong>
              </div>
              <div>
                <EvidenceMark status={event.evidence} />
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <span className="timeline-event__place">
                  <Compass size={14} /> {event.place}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="evidence" className="evidence-section">
        <div className="evidence-backdrop" aria-hidden="true">
          <Image src="/images/evidence-table.png" alt="" fill sizes="100vw" />
        </div>
        <div className="evidence-copy reveal-block">
          <p className="section-kicker">The evidence desk</p>
          <h2>Research stays visible—even where the answer does not.</h2>
          <p>
            A source count is not a confidence score. Independent records, informant quality, conflicts, and
            negative searches all matter. Family History Atlas makes that texture readable.
          </p>
          <div className="evidence-legend">
            <EvidenceMark status="strongly_supported" />
            <EvidenceMark status="supported" />
            <EvidenceMark status="unresolved" />
            <EvidenceMark status="contradicted" />
          </div>
        </div>

        <div className="research-ledger">
          <div className="research-ledger__header">
            <span>Open research ledger</span>
            <span>{document.researchQuestions.length} questions</span>
          </div>
          {document.researchQuestions.map((question, index) => (
            <article key={question.id} className="research-card reveal-block">
              <div className="research-card__index">RQ {String(index + 1).padStart(2, "0")}</div>
              <div>
                <span className={`research-status research-status--${question.status}`}>
                  {question.status.replace("_", " ")}
                </span>
                <h3>{question.question}</h3>
                <p>{question.nextAction}</p>
              </div>
              <CircleHelp aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="privacy-section">
        <div className="privacy-seal reveal-block">
          <div className="privacy-seal__orb">
            <ShieldCheck aria-hidden="true" />
          </div>
          <span>Public-safe projection</span>
        </div>
        <div className="privacy-copy reveal-block">
          <p className="section-kicker">Privacy is geometry</p>
          <h2>Hidden people are removed before the tree is laid out.</h2>
          <p>
            Otherwise spacing, counts, camera paths, and edge shapes could reveal that a private branch exists.
            The engine tests for non-interference: changing a hidden living record must not alter the public scene.
          </p>
          <ul>
            <li><Check /> Living and uncertain-living records are excluded from the public template.</li>
            <li><Check /> Kinship never grants access; authorization is a separate graph.</li>
            <li><Check /> GEDCOM import is a quarantined proposal, never an automatic merge.</li>
          </ul>
        </div>
      </section>

      <section id="build" className="build-section">
        <div className="build-heading reveal-block">
          <p className="section-kicker">Make it yours</p>
          <h2>One public engine. A private instance for every family.</h2>
          <p>
            Start with the synthetic showcase, then connect deployment-owned identity, policy, encrypted storage,
            audit, export, and restore adapters before introducing real family records.
          </p>
        </div>
        <div className="build-grid">
          <article className="build-card build-card--featured reveal-block">
            <div className="build-card__icon"><Sparkles /></div>
            <p>Recommended</p>
            <h3>Deploy the visual template</h3>
            <p>Zero configuration for the public synthetic experience, with automatic preview deployments.</p>
            <a className="button button--light" href={deployUrl} target="_blank" rel="noreferrer">
              Deploy with Vercel <ArrowUpRight size={16} />
            </a>
          </article>
          <article className="build-card reveal-block">
            <div className="build-card__icon"><Code2 /></div>
            <p>Own the code</p>
            <h3>Fork and compose</h3>
            <p>Use the scene engine and React experience from one pinned release. Keep private adapters separate.</p>
            <a href="https://github.com/frankxai/family-history-atlas" target="_blank" rel="noreferrer">
              Open GitHub <ArrowUpRight size={15} />
            </a>
          </article>
          <article className="build-card reveal-block">
            <div className="build-card__icon"><Clock3 /></div>
            <p>Coming next</p>
            <h3>Local GEDCOM review</h3>
            <p>Inspect a preserved file locally, surface privacy risks, and stage claims for human review.</p>
            <span className="build-card__note">No upload · no silent persistence</span>
          </article>
        </div>
      </section>

      <section className="closing-section">
        <BookOpen aria-hidden="true" />
        <p>Family history is not a finished tree.</p>
        <h2>It is a living practice of memory, evidence, care, and consent.</h2>
        <a className="button button--primary" href="#top">
          Return to the beginning <ArrowUpRight size={16} />
        </a>
      </section>

      <footer className="site-footer">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true"><Network size={18} /></span>
          <span>Family History <strong>Atlas</strong></span>
        </div>
        <p>{document.provenanceNote}</p>
        <div>
          <a href="https://github.com/frankxai/family-history-atlas">Source</a>
          <a href="https://github.com/frankxai/family-history-atlas/blob/main/SECURITY.md">Security</a>
          <span>MIT licensed</span>
        </div>
      </footer>
    </main>
  );
}
