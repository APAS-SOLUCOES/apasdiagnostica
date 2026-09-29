import React from "react";
import { createRoot } from "react-dom/client";
import { DiscPremiumReportFinal } from "./components/apas/DiscPremiumReportFinal";
import type { ScoreResult } from "./lib/disc/scoring";

const percent = { D: 34, I: 28, S: 22, C: 16 } as const;
const raw = { D: 34, I: 28, S: 22, C: 16 } as const;
const vector = { percent, raw, order: ["D", "I", "S", "C"] as const };
const scores: ScoreResult = {
  scoringVersion: "apas-scoring-1.2",
  answeredItems: 24,
  totalItems: 24,
  natural: vector,
  social: vector,
  adapted: vector,
  predominant: "D",
  secondary: "I",
  combination: "DI",
  levels: { D: "alto", I: "moderado", S: "baixo", C: "baixo" },
  adaptationIndex: 12.5,
  adaptationAlert: false,
  completionPercent: 100,
  invalidAnswerCount: 0,
  primaryGap: 6,
  closeCombination: false,
  combinationLabel: "DI — D primário / I secundário",
};

const assessment = {
  id: "visual-audit",
  candidate_name: "Avaliado de Referência",
  role_title: "Professor",
  instrument_version: "APAS DISC 1.2",
  submitted_at: "2026-09-29T12:00:00Z",
  organizations: { name: "APAS Soluções" },
};

createRoot(document.getElementById("root")!).render(
  <DiscPremiumReportFinal assessment={assessment} scores={scores} />
);
