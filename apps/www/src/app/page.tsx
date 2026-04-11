"use client";

import { ArrowRightIcon, Check, Copy } from "lucide-react";
import type { ReactNode, Ref, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import ModeToggle from "@/components/mode-toggle/mode-toggle";
import { Button } from "@/components/ui/button";

function CodeBlock({ code, ref }: { code: string; ref?: Ref<HTMLDivElement> }) {
  const [flash, setFlash] = useState(false);

  return (
    <div
      ref={ref}
      className={`flex items-center justify-between gap-2 bg-muted border border-dashed px-3 py-2 font-mono text-xs hover:border-foreground/30 transition-colors ${flash ? "border-foreground/50" : "border-border"}`}
    >
      <code className="text-foreground truncate">{code}</code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setFlash(true);
          setTimeout(() => setFlash(false), 300);
        }}
        className="text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-95 cursor-pointer"
      >
        {flash ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}

function CornerBrackets() {
  return (
    <>
      <span className="absolute h-2.5 w-2.5 border-foreground/30 group-hover:border-foreground border-b border-r bottom-0 right-0 transition-colors duration-300" />
      <span className="absolute h-2.5 w-2.5 border-foreground/30 group-hover:border-foreground border-b border-l bottom-0 left-0 transition-colors duration-300" />
      <span className="absolute h-2.5 w-2.5 border-foreground/30 group-hover:border-foreground border-t border-r top-0 right-0 transition-colors duration-300" />
      <span className="absolute h-2.5 w-2.5 border-foreground/30 group-hover:border-foreground border-t border-l top-0 left-0 transition-colors duration-300" />
    </>
  );
}

function StepCard({
  index,
  label,
  title,
  children,
  centered,
  topExtra,
  bottomExtra,
}: {
  index: number;
  label: string;
  title: string;
  children: ReactNode;
  centered?: boolean;
  topExtra?: ReactNode;
  bottomExtra?: ReactNode;
}) {
  return (
    <div className="bg-background relative group overflow-hidden  flex flex-col transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:group-hover:shadow-[0_2px_8px_rgba(255,255,255,0.02)]">
      <div className="absolute top-2 right-2 size-5 rounded-full border border-border bg-background text-[8px] flex items-center justify-center font-mono z-10">
        {index + 1}
      </div>
      <div className="absolute top-0 left-0 right-0 px-4 pt-0.5 pointer-events-none z-[1]">
        <span className="text-[8px] font-mono text-muted-foreground">
          Step {index + 1} - {label}
        </span>
        <h2 className="text-sm font-pixel-square tracking-tight text-foreground -mt-0.5 mb-0">
          {title}
        </h2>
      </div>
      {centered ? (
        <div className="p-4 pt-10 mt-2 flex-1 grid grid-rows-[1fr_auto_1fr]">
          <div className="flex flex-col justify-end">{topExtra}</div>
          <div className="flex flex-col gap-2">{children}</div>
          {bottomExtra && <div className="self-start mt-2">{bottomExtra}</div>}
        </div>
      ) : (
        <div className="p-4 pt-10 flex flex-col flex-1">
          <div className="flex-1 flex flex-col justify-center gap-2">
            {children}
          </div>
        </div>
      )}
      <CornerBrackets />
    </div>
  );
}

function LaunchCard({ codeBlockRef }: { codeBlockRef?: Ref<HTMLDivElement> }) {
  return (
    <StepCard
      index={1}
      label="Launch"
      title="Run the generated backend"
      centered
      bottomExtra={
        <a
          href="https://github.com/advtszn/create-magicwand"
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-fit group/cta inline-block"
        >
          <Button
            variant="outline"
            className="rounded-none cursor-pointer relative overflow-hidden focus-visible:ring-0 h-8 px-3 py-1 border-dashed"
          >
            <span className="shine absolute -top-1/2 -left-full h-[200%] w-3/4 skew-x-[-20deg] bg-linear-to-r from-transparent via-white/40 to-transparent pointer-events-none z-20" />
            <span className="text-[9px] font-medium text-foreground flex items-center gap-1.5 group-hover/cta:gap-2.5 transition-all duration-300">
              View on GitHub
              <ArrowRightIcon className="size-3 w-0 opacity-0 group-hover/cta:w-3 group-hover/cta:opacity-100 transition-all duration-200" />
            </span>
          </Button>
          <span className="absolute h-2.5 w-2.5 border-foreground/30 group-hover/cta:border-foreground border-b border-r bottom-0 right-0 transition-colors duration-300" />
          <span className="absolute h-2.5 w-2.5 border-foreground/30 group-hover/cta:border-foreground border-b border-l bottom-0 left-0 transition-colors duration-300" />
          <span className="absolute h-2.5 w-2.5 border-foreground/30 group-hover/cta:border-foreground border-t border-r top-0 right-0 transition-colors duration-300" />
          <span className="absolute h-2.5 w-2.5 border-foreground/30 group-hover/cta:border-foreground border-t border-l top-0 left-0 transition-colors duration-300" />
        </a>
      }
    >
      <CodeBlock ref={codeBlockRef} code="cd my-api && bun run dev:http" />
    </StepCard>
  );
}

type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  cx: number;
  cy: number;
};

function getRect(el: HTMLElement, container: HTMLElement): Rect {
  const er = el.getBoundingClientRect();
  const cr = container.getBoundingClientRect();
  const left = er.left - cr.left;
  const top = er.top - cr.top;
  const right = left + er.width;
  const bottom = top + er.height;
  return {
    left,
    top,
    right,
    bottom,
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
  };
}

function GridConnectors({
  containerRef,
  refs,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  refs: readonly [
    RefObject<HTMLDivElement | null>,
    RefObject<HTMLDivElement | null>,
  ];
}) {
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const els = refs.map((r) => r.current);
      const [leftEl, rightEl] = els;
      if (!leftEl || !rightEl) return;
      const rects = [getRect(leftEl, container), getRect(rightEl, container)];

      setLines([
        {
          x1: rects[0].right,
          y1: rects[0].cy,
          x2: rects[1].left,
          y2: rects[1].cy,
        },
      ]);
    };

    requestAnimationFrame(update);

    const ro = new ResizeObserver(update);
    ro.observe(container);
    refs.forEach((nodeRef) => {
      if (nodeRef.current) ro.observe(nodeRef.current);
    });
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [refs, containerRef]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 z-10 pointer-events-none overflow-visible hidden md:block"
      width="100%"
      height="100%"
    >
      <title>Grid connectors</title>
      {lines.map((line) => (
        <g key={`connector-${line.x1}-${line.y1}-${line.x2}-${line.y2}`}>
          <line
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <circle
            cx={line.x1}
            cy={line.y1}
            r={4}
            fill="var(--background)"
            stroke="var(--border)"
            strokeWidth={1}
          />
          <circle
            cx={line.x2}
            cy={line.y2}
            r={4}
            fill="var(--background)"
            stroke="var(--border)"
            strokeWidth={1}
          />
        </g>
      ))}
    </svg>
  );
}

export default function DocsPage() {
  const gridRef = useRef<HTMLDivElement>(null);
  const ref0 = useRef<HTMLDivElement>(null);
  const ref1 = useRef<HTMLDivElement>(null);
  const nodeRefs = [ref0, ref1] as const;

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col mx-auto max-w-7xl border-x">
      <nav className="relative px-4 py-4 font-pixel-square flex items-center justify-between">
        <a href="/" className="hover:opacity-80 transition-opacity">
          magicwand
        </a>
        <div className="z-10 absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 size-2.5 rounded-full border border-border bg-background" />
        <div className="z-10 absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 size-2.5 rounded-full border border-border bg-background" />
        <div className="border-b absolute bottom-0 left-1/2 -translate-x-1/2 w-screen" />
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 overflow-hidden">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">
              Magicwand CLI
            </span>
            <h1 className="text-2xl font-pixel-square mt-1">
              Scaffold layered DDD backends in 2 steps
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
              Generate a pragmatic DDD backend with domain, application,
              infrastructure, and HTTP layers already in place.
            </p>
          </div>

          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border relative"
          >
            <StepCard
              index={0}
              label="Scaffold"
              title="Generate your API"
              centered
            >
              <CodeBlock ref={ref0} code="bunx create-magicwand my-api" />
            </StepCard>

            <LaunchCard codeBlockRef={ref1} />

            <GridConnectors containerRef={gridRef} refs={nodeRefs} />
          </div>
        </div>
      </main>

      <footer className="relative px-4 py-4 font-pixel-square">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            credits:{" "}
            <a
              href="https://akira.sachi.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              akira.sachi.dev
            </a>
          </span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a
              href="https://github.com/advtszn/create-magicwand"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              github
            </a>
            <span className="text-3xl leading-none">&middot;</span>
            <a
              href="https://www.npmjs.com/package/create-magicwand"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline underline-offset-4 transition-colors"
            >
              npm
            </a>
          </div>
          <ModeToggle />
        </div>
        <div className="z-10 absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 size-2.5 rounded-full border border-border bg-background" />
        <div className="z-10 absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 size-2.5 rounded-full border border-border bg-background" />
        <div className="border-t absolute top-0 left-1/2 -translate-x-1/2 w-screen" />
      </footer>
    </div>
  );
}
