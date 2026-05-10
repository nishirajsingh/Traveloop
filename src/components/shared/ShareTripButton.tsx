"use client";

import { useState } from "react";
import { Share2, Copy, Check, X, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ShareTripButtonProps {
  publicUrl: string;
  slug: string;
}

export function ShareTripButton({ publicUrl, slug }: ShareTripButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-xl hover:bg-[var(--color-primary)]/20 transition-all"
      >
        <Share2 className="w-3.5 h-3.5" /> Share
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="relative surface rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-[var(--color-text)] tracking-tight">Share Trip</h3>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">Anyone with this link can view your itinerary</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* URL display */}
            <div className="surface-2 rounded-xl p-3 mb-4">
              <p className="section-label mb-1.5">Public link</p>
              <div className="flex items-center gap-2">
                <p className="text-sm mono text-[var(--color-text)] flex-1 truncate">{publicUrl}</p>
              </div>
            </div>

            {/* Slug info */}
            <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
              <div className="w-6 h-6 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
                <Share2 className="w-3 h-3 text-[var(--color-primary)]" />
              </div>
              <p className="text-xs text-[var(--color-primary)]">
                Readable URL: <span className="font-bold mono">/{slug}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={copy}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                    : "btn-primary"
                }`}
              >
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
              </button>
              <Link
                href={publicUrl}
                target="_blank"
                className="btn-ghost px-4 py-2.5 flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Preview
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
