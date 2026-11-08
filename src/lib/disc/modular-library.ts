import type { Dimension } from "./instrument";
import type { IntensityLevel } from "./profile-signals";
import { pickVariant } from "./text-variant";

/** Modular wording by factor × intensity level × section (never by combination). */
export const MODULAR_SECTIONS = ["comportamento", "comunicacao", "decisao", "pressao", "mudanca", "equipe", "desenvolvimento"] as const;
export type ModularSection = (typeof MODULAR_SECTIONS)[number];
export type ModularReport = "premium" | "technical";

type LibraryFile = {
  factor: Dimension;
  report: ModularReport;
  levels: Partial<Record<string, Record<ModularSection, string[]>>>;
};

const files = import.meta.glob<LibraryFile>("./modular/*.json", { eager: true, import: "default" });

const LIBRARY: Record<ModularReport, Partial<Record<Dimension, Partial<Record<string, Record<ModularSection, string[]>>>>>> = {
  premium: {},
  technical: {},
};
for (const file of Object.values(files)) {
  const target = (LIBRARY[file.report][file.factor] ??= {});
  Object.assign(target, file.levels);
}

/** Transition switch: while false, reports keep the approved combination-based text. */
export const MODULAR_NARRATIVE_ENABLED = false;

export function modularVariants(report: ModularReport, factor: Dimension, level: IntensityLevel, section: ModularSection) {
  return LIBRARY[report][factor]?.[String(level)]?.[section] ?? [];
}

export function hasModularFactor(report: ModularReport, factor: Dimension) {
  const levels = LIBRARY[report][factor];
  return !!levels && [1, 2, 3, 4, 5, 6, 7, 8].every((l) => MODULAR_SECTIONS.every((s) => (levels[String(l)]?.[s]?.length ?? 0) >= 4));
}

export function modularSnippet(
  report: ModularReport, factor: Dimension, level: IntensityLevel, section: ModularSection, assessmentId: string,
): string | null {
  const variants = modularVariants(report, factor, level, section);
  return variants.length ? pickVariant(variants, assessmentId, `${report}:${factor}:${level}:${section}`) : null;
}
