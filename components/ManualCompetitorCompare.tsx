"use client";

import { useState } from "react";
import type { AuditReport } from "../lib/audit-types";
import { Button } from "./ui/Button";

type CompareResult = {
  siteA: AuditReport;
  siteB: AuditReport;
};

export default function ManualCompetitorCompare() {
  const [siteA, setSiteA] = useState("");
  const [siteB, setSiteB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);

  const runCompare = async () => {
    const a = siteA.trim();
    const b = siteB.trim();
    if (!a || !b) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const [resA, resB] = await Promise.all([
        fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: a, enrichCompetitors: false, enrichAi: false, strictDb: false }),
        }),
        fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: b, enrichCompetitors: false, enrichAi: false, strictDb: false }),
        }),
      ]);

      const jsonA = (await resA.json()) as (AuditReport & { message?: string; status?: string });
      const jsonB = (await resB.json()) as (AuditReport & { message?: string; status?: string });

      if (!resA.ok || !resB.ok) {
        throw new Error(jsonA.message || jsonB.message || "Unable to compare these sites right now");
      }

      setResult({ siteA: jsonA, siteB: jsonB });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  const rows = result
    ? [
        { label: "Overall", a: result.siteA.scores.overall, b: result.siteB.scores.overall },
        { label: "UI/UX", a: result.siteA.scores.uiux, b: result.siteB.scores.uiux },
        { label: "Performance", a: result.siteA.scores.performance, b: result.siteB.scores.performance },
        { label: "Mobile", a: result.siteA.scores.mobile, b: result.siteB.scores.mobile },
        { label: "Accessibility", a: result.siteA.scores.accessibility, b: result.siteB.scores.accessibility },
        { label: "SEO", a: result.siteA.scores.seo, b: result.siteB.scores.seo },
        { label: "Lead Conversion", a: result.siteA.scores.leadConversion, b: result.siteB.scores.leadConversion },
      ]
    : [];

  return (
    <section className="mb-10 rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-bold text-foreground">Manual Competitor Compare (Site A vs Site B)</h3>
      <p className="mt-1 text-sm text-muted-foreground">Enter your site and any competitor URL. The system audits both and shows a side-by-side table.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          value={siteA}
          onChange={(e) => setSiteA(e.target.value)}
          placeholder="Site A URL (your site)"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-foreground"
        />
        <input
          value={siteB}
          onChange={(e) => setSiteB(e.target.value)}
          placeholder="Site B URL (competitor)"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-foreground"
        />
      </div>

      <div className="mt-4">
        <Button onClick={runCompare} disabled={loading || !siteA.trim() || !siteB.trim()} isLoading={loading}>
          Compare Sites
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      {result ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">Site A</th>
                <th className="px-4 py-3">Site B</th>
                <th className="px-4 py-3">Delta (A-B)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium">{r.label}</td>
                  <td className="px-4 py-3">{r.a}</td>
                  <td className="px-4 py-3">{r.b}</td>
                  <td className={`px-4 py-3 font-semibold ${(r.a - r.b) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>{r.a - r.b}</td>
                </tr>
              ))}
              <tr className="border-t border-border/70 bg-secondary/20">
                <td className="px-4 py-3 font-medium">City / District / Country</td>
                <td className="px-4 py-3 text-xs">{result.siteA.targetLocation?.city || "-"} / {result.siteA.targetLocation?.district || "-"} / {result.siteA.targetLocation?.country || "-"}</td>
                <td className="px-4 py-3 text-xs">{result.siteB.targetLocation?.city || "-"} / {result.siteB.targetLocation?.district || "-"} / {result.siteB.targetLocation?.country || "-"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">Location context</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
