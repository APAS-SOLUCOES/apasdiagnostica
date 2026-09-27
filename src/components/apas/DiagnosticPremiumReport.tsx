import type { ReportContent } from "@/lib/diagnostica/report";

type DiagnosticPremiumReportProps = {
  content: ReportContent;
  released: boolean;
};

const pageStyle = {
  width: "210mm",
  minHeight: "297mm",
  boxSizing: "border-box" as const,
  padding: "18mm",
  margin: "0 auto 8mm",
  background: "#fff",
  color: "#1b1b1b",
  overflow: "hidden",
};

const axisColor = "#b3262d";

function ScoreBar({ value }: { value: number | null }) {
  return (
    <div style={{ height: 6, background: "#e6e6e6", marginTop: 6 }}>
      <div style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%`, height: "100%", background: axisColor }} />
    </div>
  );
}

function Section({ title, body, bullets }: { title: string; body?: string; bullets?: string[] }) {
  return (
    <section style={{ marginTop: 16, breakInside: "avoid" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#222" }}>{title}</h3>
      {body && <p style={{ margin: "0 0 8px", lineHeight: 1.55 }}>{body}</p>}
      {bullets && bullets.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.55 }}>
          {bullets.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
        </ul>
      )}
    </section>
  );
}

export function DiagnosticPremiumReport({ content, released }: DiagnosticPremiumReportProps) {
  const status = released ? "Relatório liberado" : "Prévia para validação do analista";
  return (
    <article className="diagnostic-premium-report" aria-label="Relatório premium do Diagnóstico Empresarial APAS">
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        .diagnostic-premium-report { background: #262626; padding: 8mm 0; font-family: Arial, sans-serif; }
        .diagnostic-premium-report * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .diagnostic-report-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10mm; }
        .diagnostic-report-four { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4mm; }
        .diagnostic-report-card { border: 1px solid #dedede; padding: 6mm; background: #fafafa; break-inside: avoid; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          .diagnostic-premium-report { padding: 0; background: #fff; }
          .diagnostic-report-page { width: 210mm !important; height: 297mm !important; min-height: 297mm !important; max-height: 297mm !important; margin: 0 !important; break-after: page; page-break-after: always; break-inside: avoid; page-break-inside: avoid; overflow: hidden !important; }
          .diagnostic-report-page:last-child { break-after: auto; page-break-after: auto; }
        }
        @media (max-width: 760px) {
          .diagnostic-report-page { width: 100% !important; min-height: auto !important; padding: 1.25rem !important; }
          .diagnostic-report-grid, .diagnostic-report-four { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="diagnostic-report-page" style={{ ...pageStyle, background: "#171717", color: "#fff", display: "flex", flexDirection: "column" }}>
        <p style={{ color: "#d43a42", letterSpacing: 3, fontWeight: 700 }}>APAS DIAGNÓSTICA</p>
        <div style={{ marginTop: "auto" }}>
          <h1 style={{ fontSize: 38, lineHeight: 1.08, margin: 0 }}>Diagnóstico Empresarial APAS</h1>
          <p style={{ fontSize: 18, color: "#c9c9c9" }}>{content.cover.subtitle}</p>
          <p style={{ marginTop: 28, fontSize: 16 }}>{content.cover.companyName ?? "Empresa não informada"}</p>
          {content.cover.participantName && <p style={{ color: "#c9c9c9" }}>{content.cover.participantName}</p>}
          <p style={{ color: "#c9c9c9" }}>{content.cover.instrument}</p>
        </div>
        <div style={{ marginTop: "auto", borderTop: "1px solid #555", paddingTop: 12, color: "#c9c9c9", fontSize: 11 }}>
          {status} · Confidencial · {content.cover.disclaimer}
        </div>
      </section>

      <section className="diagnostic-report-page" style={pageStyle}>
        <p style={{ color: axisColor, letterSpacing: 2, fontWeight: 700 }}>VISÃO EXECUTIVA</p>
        <h2 style={{ fontSize: 30, margin: "10px 0 24px" }}>Leitura organizacional</h2>
        <div className="diagnostic-report-card" style={{ borderLeft: `4px solid ${axisColor}` }}>
          <h3 style={{ marginTop: 0 }}>{content.executiveSummary.title}</h3>
          <p style={{ lineHeight: 1.65 }}>{content.executiveSummary.body}</p>
          <ul style={{ paddingLeft: 20, lineHeight: 1.6 }}>{content.executiveSummary.bullets?.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
        <div className="diagnostic-report-grid">
          <div className="diagnostic-report-card"><strong>Estágio predominante</strong><p style={{ fontSize: 21 }}>{content.stage.predominant ?? "Não determinado"}</p></div>
          <div className="diagnostic-report-card"><strong>Estágio secundário</strong><p style={{ fontSize: 21 }}>{content.stage.secondary ?? "Não determinado"}</p></div>
          <div className="diagnostic-report-card"><strong>Confiança</strong><p style={{ fontSize: 21 }}>{content.stage.confidence}% · {content.stage.confidenceLevel}</p></div>
          <div className="diagnostic-report-card"><strong>Zona de leitura</strong><p style={{ fontSize: 21 }}>{content.stage.inTransition ? content.stage.transitionLabel ?? "Transição" : "Predominante"}</p></div>
        </div>
        {content.blockReasons.length > 0 && <div className="diagnostic-report-card" style={{ marginTop: 12 }}><strong>Validação humana obrigatória</strong><p>A leitura contém condições que exigem interpretação profissional antes da liberação.</p></div>}
      </section>

      <section className="diagnostic-report-page" style={pageStyle}>
        <p style={{ color: axisColor, letterSpacing: 2, fontWeight: 700 }}>QUATRO EIXOS</p>
        <h2 style={{ fontSize: 30, margin: "10px 0 24px" }}>Equilíbrio organizacional</h2>
        <div className="diagnostic-report-four">
          {content.axes.map((axis) => <div className="diagnostic-report-card" key={axis.code}><strong>{axis.name}</strong><p style={{ fontSize: 30, margin: "18px 0 4px", color: axisColor }}>{axis.score}</p><ScoreBar value={axis.score} /></div>)}
        </div>
        <Section title="Como ler os eixos" body="Os eixos são calculados a partir das dimensões e da matriz configurada do instrumento. Eles orientam a leitura, mas não substituem a análise dos indicadores e do contexto organizacional." />
      </section>

      <section className="diagnostic-report-page" style={pageStyle}>
        <p style={{ color: axisColor, letterSpacing: 2, fontWeight: 700 }}>MAPA DAS 10 DIMENSÕES</p>
        <h2 style={{ fontSize: 30, margin: "10px 0 22px" }}>Pontuação ponderada e faixas</h2>
        <div style={{ display: "grid", gap: 9 }}>
          {content.dimensions.map((dimension) => <div key={dimension.code} className="diagnostic-report-card" style={{ padding: "4mm 6mm" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><strong>{dimension.name}</strong><span>{dimension.score ?? "Sem dados"} · {dimension.band}</span></div><ScoreBar value={dimension.score} /></div>)}
        </div>
      </section>

      <section className="diagnostic-report-page" style={pageStyle}>
        <p style={{ color: axisColor, letterSpacing: 2, fontWeight: 700 }}>LEITURA ORGANIZACIONAL</p>
        <h2 style={{ fontSize: 30, margin: "10px 0 22px" }}>{content.stage.predominant ?? "Estágio não determinado"}</h2>
        <p style={{ fontSize: 17, lineHeight: 1.6 }}>{content.stage.inTransition ? `Zona de transição: ${content.stage.transitionLabel ?? "resultados próximos"}.` : "A leitura apresenta uma afinidade predominante entre os estágios configurados."}</p>
        {content.sections.slice(0, 1).map((section) => <Section key={section.title} {...section} />)}
        <Section title="Fatores que contribuíram para o resultado" bullets={content.sections.find((section) => section.title === "Forças identificadas")?.bullets ?? []} />
      </section>

      <section className="diagnostic-report-page" style={pageStyle}>
        <p style={{ color: axisColor, letterSpacing: 2, fontWeight: 700 }}>PADRÕES E INDICADORES</p>
        <h2 style={{ fontSize: 30, margin: "10px 0 22px" }}>Sinais encontrados pelo engine</h2>
        {content.sections.filter((section) => ["Padrões organizacionais convergentes", "Riscos e indicadores críticos", "Alertas da leitura"].includes(section.title)).map((section) => <Section key={section.title} {...section} />)}
      </section>

      <section className="diagnostic-report-page" style={pageStyle}>
        <p style={{ color: axisColor, letterSpacing: 2, fontWeight: 700 }}>RISCOS, OPORTUNIDADES E DESENVOLVIMENTO</p>
        <h2 style={{ fontSize: 30, margin: "10px 0 22px" }}>Prioridades práticas</h2>
        {content.sections.filter((section) => ["Gargalos e pontos de atenção", "Prioridades e plano de ação APAS"].includes(section.title)).map((section) => <Section key={section.title} {...section} />)}
        <Section title="Orientação de uso" body="As prioridades são derivadas das dimensões, padrões, indicadores e estágio desta aplicação. Devem ser convertidas em ações com responsáveis, prazos e evidências de acompanhamento." />
      </section>

      <section className="diagnostic-report-page" style={pageStyle}>
        <p style={{ color: axisColor, letterSpacing: 2, fontWeight: 700 }}>ENCERRAMENTO</p>
        <h2 style={{ fontSize: 30, margin: "10px 0 22px" }}>Leitura orientativa APAS</h2>
        {content.analystNotes && <Section title="Leitura do analista APAS" body={content.analystNotes} />}
        <Section title="Disclaimer metodológico" body="Este instrumento é uma ferramenta de análise organizacional. Não constitui auditoria, diagnóstico contábil, diagnóstico psicológico ou clínico, nem substitui análise profissional. A leitura deve ser interpretada dentro do contexto da organização e validada por um analista APAS." />
        <div style={{ marginTop: 40, borderTop: "2px solid #222", paddingTop: 14 }}><strong>APAS Soluções</strong><p style={{ color: "#666" }}>Diagnósticos empresariais, comportamentais e de pessoas.</p></div>
      </section>
    </article>
  );
}
