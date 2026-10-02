import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* =====================================================================
   RELATÓRIO APAS DISC · 12 páginas A4 (924 x 1307), 100% dirigido por dados.
   - O motor de cálculo do Lovable entrega um objeto `RelatorioDados`.
   - Imagens e logo entram por `imagens` (nomes em /public/relatorios/img/).
   - Fonte sugerida: Sora (adicione no index.html via Google Fonts).
   ===================================================================== */

export type Fator = "D" | "I" | "S" | "C";
export type Pct = Record<Fator, number>;
type Tom = "verde" | "laranja" | "vermelho" | "azul" | "escuro";

export interface Card { titulo: string; texto?: string; itens?: string[]; cor?: Tom }
export interface PaginaConteudo {
  secao: string;            // sem número: a numeração é automática
  titulo: string;
  subtitulo?: string;
  intro?: string;
  cards: Card[];
  colunas?: 1 | 2;          // 2 = grade 2x2 (ex.: Comunicação)
  destaque?: { fatores: { letra: Fator; valor: number; rotulo: string }[]; titulo: string; texto: string };
  experimento?: boolean;    // bloco "Meu experimento de 30 dias"
  nota?: { titulo?: string; texto: string };
}
export interface RelatorioDados {
  nome: string; cargo?: string; data: string;
  natural: Pct; adaptado: Pct; social: Pct; indiceAdaptacao: number;
  introducao: { titulo: string; paragrafos: string[]; citacao: string; referencia: string };
  numeros: { descricao: string; indiceTexto: string; aviso: string };
  jeitoDeAgir: {
    titulo: string; subtitulo: string; arquetipo: string; intensidade: string;
    paragrafos: string[]; destaqueTitulo: string; destaqueTexto: string; resumo: string;
  };
  paginas: Record<
    "pontosFortes" | "atencao" | "percebido" | "comunicacao" | "decisao" | "relacionamentos" | "desenvolvimento" | "destino",
    PaginaConteudo
  >;
}
export type ChaveImagem =
  | "logo" | "logoEscuro" | "capa"
  | "p02" | "p03" | "p04" | "p05" | "p06" | "p07" | "p08" | "p09" | "p10" | "p11" | "p12";
export type Imagens = Partial<Record<ChaveImagem, string>>;

const W = 924, H = 1307;
const FONT = "'Sora','Inter',system-ui,sans-serif";
const C = { vermelho: "#E11D2A", laranja: "#F59E0B", verde: "#16A34A", azul: "#06B6D4", preto: "#0B0D10", papel: "#F7F6F3" };
const FATOR_COR: Record<Fator, string> = { D: C.vermelho, I: C.laranja, S: C.verde, C: C.azul };
const FATOR_NOME: Record<Fator, string> = { D: "Dominância", I: "Influência", S: "Estabilidade", C: "Conformidade" };
const FATORES: Fator[] = ["D", "I", "S", "C"];
const TOM_BG: Record<Tom, string> = {
  verde: "linear-gradient(135deg,#16A34A,#14532D)",
  laranja: "linear-gradient(135deg,#EA7A0B,#92400E)",
  vermelho: "linear-gradient(135deg,#E11D2A,#7F0F18)",
  azul: "linear-gradient(135deg,#0EA5C0,#0A5A6B)",
  escuro: "#1F2630",
};
const TOM_COR: Record<Tom, string> = { verde: "#15803D", laranja: "#C2620A", vermelho: C.vermelho, azul: "#0B8FA8", escuro: C.preto };
const TONS: Tom[] = ["verde", "laranja", "vermelho", "azul"];

const pad = (n: number) => String(n).padStart(2, "0");
const pct = (v: number) => `${v.toFixed(1).replace(".", ",")} %`;

type Ctx = { dados: RelatorioDados; I: (k: ChaveImagem) => string };

const eyebrow: CSSProperties = { color: C.vermelho, fontSize: 15, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" };
const titleSize = (text: string, max = 54, min = 42) =>
  Math.max(min, Math.min(max, max - Math.max(0, text.length - 24) * 0.22));
const bodySize = (text: string, max = 15, min = 12.5) =>
  Math.max(min, Math.min(max, max - Math.max(0, text.length - 150) * 0.018));
const h2 = (cor: string, text?: string): CSSProperties => ({
  margin: "14px 0 6px",
  fontSize: text ? titleSize(text) : 54,
  lineHeight: 1.04,
  fontWeight: 800,
  letterSpacing: -1.5,
  color: cor,
});

/* ---------- Moldura comum (cabeçalho, rodapé, foto de fundo) ---------- */
function Moldura({ n, escuro, foto, modo = "hero", c, children }: {
  n: number; escuro?: boolean; foto?: string; modo?: "hero" | "fundo" | "suave"; c: Ctx; children: ReactNode;
}) {
  const bg = escuro ? C.preto : C.papel;
  const fg = escuro ? "#fff" : C.preto;
  const mudo = escuro ? "#AEB5BF" : "#4B5563";
  const alto = modo === "hero" ? 380 : H - 130 - 92;
  const capa = modo === "suave"
    ? `${bg}B8`
    : `linear-gradient(90deg, ${bg} 36%, ${bg}00 90%), linear-gradient(0deg, ${bg} 0%, ${bg}00 ${modo === "hero" ? 35 : 15}%)`;
  return (
    <section style={{ width: W, height: H, position: "relative", overflow: "hidden", background: bg, color: fg, fontFamily: FONT }}>
      {foto && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 130, height: alto, backgroundImage: `url(${foto})`, backgroundSize: "cover", backgroundPosition: "right center" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 130, height: alto, background: capa }} />
        </>
      )}
      <header style={{ position: "absolute", top: 0, left: 0, right: 0, height: 130, background: "linear-gradient(135deg,#0B0D10,#1B2027)", borderBottom: `3px solid ${C.vermelho}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 56px" }}>
        <img src={c.I("logo")} alt="APAS Soluções" style={{ height: 72 }} />
        <span style={{ fontSize: 14, letterSpacing: 2, fontWeight: 600, color: "#fff" }}>APAS DISC · RELATÓRIO DE PERFIL COMPORTAMENTAL</span>
      </header>
      {children}
      <footer style={{ position: "absolute", left: 56, right: 56, bottom: 0, height: 92, borderTop: `1px solid ${escuro ? "#3A424D" : "#1F2937"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, color: mudo }}>Relatório individual</div>
          <div style={{ fontSize: 17, fontWeight: 600, maxWidth: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.dados.nome}</div>
        </div>
        <div style={{ borderLeft: `1px solid ${mudo}`, paddingLeft: 16, textAlign: "right" }}>
          <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{pad(n)}</div>
          <div style={{ fontSize: 12, color: mudo }}>{c.dados.data}</div>
        </div>
      </footer>
    </section>
  );
}

/* ---------- Caixa lateral com barra vermelha ---------- */
function Nota({ titulo, texto, escuro }: { titulo?: string; texto: string; escuro?: boolean }) {
  return (
    <div style={{ borderLeft: `4px solid ${C.vermelho}`, background: escuro ? "#12161C" : "#ECEEF1", borderRadius: 10, padding: "14px 20px", flex: "none" }}>
      {titulo && <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: C.vermelho, marginBottom: 4 }}>{titulo}</div>}
      <div style={{ fontSize: 14, lineHeight: 1.5, color: escuro ? "#D5DAE0" : "#1F2937" }}>{texto}</div>
    </div>
  );
}

/* ---------- Capa ---------- */
function Capa({ c }: { c: Ctx }) {
  const { dados } = c;
  const nomeSize = dados.nome.length > 34 ? 44 : dados.nome.length > 24 ? 50 : 58;
  const discTop = dados.nome.length > 34 ? 610 : dados.nome.length > 24 ? 575 : 535;
  return (
    <section style={{ width: W, height: H, position: "relative", overflow: "hidden", background: C.preto, color: "#fff", fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${c.I("capa")})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg,${C.preto}99 0%,${C.preto}00 35%,${C.preto}00 60%,${C.preto} 92%)` }} />
      <img src={c.I("logo")} alt="APAS Soluções" style={{ position: "absolute", left: 56, top: 56, height: 150, objectFit: "contain" }} />
      <div style={{ position: "absolute", left: 56, top: 300, right: 56, maxWidth: 790 }}>
        <div style={eyebrow}>Relatório de perfil comportamental</div>
        <div style={{ maxWidth: 760, fontSize: nomeSize, lineHeight: 1.05, fontWeight: 800, letterSpacing: -1.5, marginTop: 18, overflowWrap: "anywhere" }}>{dados.nome}</div>
        <div style={{ fontSize: 30, fontWeight: 300, lineHeight: 1.25, marginTop: 10, color: "#E5E7EB" }}>Mais consciência. Melhores escolhas.<br />Grandes resultados.</div>
      </div>
      <div style={{ position: "absolute", left: 50, top: discTop, fontSize: 330, fontWeight: 900, letterSpacing: -10, color: "#FFFFFF33", lineHeight: 1 }}>DISC</div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 1005, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {FATORES.map((f) => (
          <div key={f} style={{ borderTop: `5px solid ${FATOR_COR[f]}`, background: "#0F1318E6", padding: "22px 24px", display: "flex", gap: 18, alignItems: "center" }}>
            <b style={{ fontSize: 44, color: FATOR_COR[f], lineHeight: 1 }}>{f}</b>
            <span style={{ fontSize: 20, fontWeight: 600 }}>{FATOR_NOME[f]}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 56, display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #ffffff55", paddingTop: 18 }}>
        <div><div style={{ fontSize: 15 }}>Relatório individual</div><div style={{ fontSize: 15, color: "#9CA3AF" }}>{dados.cargo}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 14 }}>{dados.data}</div></div>
      </div>
    </section>
  );
}

/* ---------- Página 2: introdução ---------- */
function Introducao({ c }: { c: Ctx }) {
  const t = c.dados.introducao;
  return (
    <Moldura n={2} foto={c.I("p02")} modo="fundo" c={c}>
      <div style={{ position: "absolute", left: 56, top: 165, width: 480, maxHeight: H - 165 - 118, overflow: "hidden" }}>
        <div style={eyebrow}>01 · Antes de olhar o resultado</div>
        <h2 style={{ ...h2(C.preto, t.titulo), fontSize: titleSize(t.titulo, 64, 48) }}>{t.titulo}</h2>
        {t.paragrafos.map((p, i) => (
          <p key={i} style={{ fontSize: i === 0 ? 20 : 18, fontWeight: i === 0 ? 700 : 400, lineHeight: 1.45, margin: "22px 0 0" }}>{p}</p>
        ))}
        <div style={{ borderLeft: `5px solid ${C.vermelho}`, padding: "10px 0 10px 18px", margin: "34px 0", fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}>“{t.citacao}”</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: "#374151" }}>{t.referencia}</div>
      </div>
    </Moldura>
  );
}

/* ---------- Página 3: perfil em números ---------- */
function Rosca({ valores }: { valores: Pct }) {
  const total = FATORES.reduce((s, f) => s + valores[f], 0) || 1;
  const r = 110, circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={330} height={330} viewBox="0 0 330 330">
      <g transform="rotate(-90 165 165)">
        {FATORES.map((f) => {
          const len = (valores[f] / total) * circ;
          const el = <circle key={f} cx={165} cy={165} r={r} fill="none" stroke={FATOR_COR[f]} strokeWidth={54} strokeDasharray={`${len - 3} ${circ - len + 3}`} strokeDashoffset={-acc} />;
          acc += len;
          return el;
        })}
      </g>
      <circle cx={165} cy={165} r={82} fill={C.preto} />
      <text x={165} y={158} textAnchor="middle" fill="#fff" fontSize={30} fontWeight={800} letterSpacing={6}>DISC</text>
      <text x={165} y={184} textAnchor="middle" fill="#D1D5DB" fontSize={13}>Perfil primário</text>
      <text x={165} y={202} textAnchor="middle" fill="#D1D5DB" fontSize={13}>e secundário</text>
    </svg>
  );
}
function BlocoBarras({ titulo, desc, v, cor }: { titulo: string; desc: string; v: Pct; cor: string }) {
  return (
    <div style={{ background: C.preto, color: "#fff", borderTop: `5px solid ${cor}`, borderRadius: 8, padding: "18px 18px 14px", width: 260 }}>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{titulo}</div>
      <div style={{ fontSize: 12, color: "#C5CAD1", minHeight: 32, marginTop: 4 }}>{desc}</div>
      {FATORES.map((f) => (
        <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <b style={{ width: 18, color: FATOR_COR[f] }}>{f}</b>
          <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#2A313A" }}>
            <div style={{ width: `${Math.min(100, v[f] * 2)}%`, height: "100%", borderRadius: 6, background: FATOR_COR[f] }} />
          </div>
          <span style={{ width: 58, textAlign: "right", fontSize: 13 }}>{pct(v[f])}</span>
        </div>
      ))}
    </div>
  );
}
function Numeros({ c }: { c: Ctx }) {
  const { dados: d } = c;
  return (
    <Moldura n={3} foto={c.I("p03")} modo="suave" c={c}>
      <div style={{ position: "absolute", left: 56, top: 160, width: 420 }}>
        <div style={eyebrow}>02 · Seu perfil em números</div>
        <h2 style={{ ...h2(C.preto, "Seu perfil em números"), fontSize: 56 }}>Seu perfil em números</h2>
        <div style={{ fontSize: 22 }}>O que o seu resultado revela</div>
        <p style={{ fontSize: 17, lineHeight: 1.5, marginTop: 20 }}>{d.numeros.descricao}</p>
      </div>
      <div style={{ position: "absolute", right: 56, top: 150 }}><Rosca valores={d.adaptado} /></div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 600, display: "flex", justifyContent: "space-between" }}>
        <BlocoBarras titulo="Natural" desc="Como tende a agir quando há mais vontade." v={d.natural} cor={C.vermelho} />
        <BlocoBarras titulo="Adaptado" desc="Como ajusta o comportamento às circunstâncias percebidas." v={d.adaptado} cor={C.laranja} />
        <BlocoBarras titulo="Social" desc="Como acredita que precisa se apresentar no ambiente." v={d.social} cor={C.verde} />
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 905, height: 190, background: C.preto, color: "#fff", borderLeft: `5px solid ${C.vermelho}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 34, padding: "0 34px" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>ÍNDICE DE ADAPTAÇÃO</div>
          <div style={{ fontSize: 100, fontWeight: 900, color: C.vermelho, lineHeight: 1 }}>{d.indiceAdaptacao.toFixed(1).replace(".", ",")}</div>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.5, color: "#D5DAE0" }}>{d.numeros.indiceTexto}</div>
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 1120, display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 10, padding: "14px 22px", fontSize: 15, boxShadow: "0 2px 10px #0000001a" }}>
        <b style={{ color: C.vermelho, fontSize: 26 }}>i</b>{d.numeros.aviso}
      </div>
    </Moldura>
  );
}

/* ---------- Página 4: jeito de agir ---------- */
function JeitoDeAgir({ c }: { c: Ctx }) {
  const j = c.dados.jeitoDeAgir;
  return (
    <Moldura n={4} foto={c.I("p04")} modo="suave" c={c}>
      <div style={{ position: "absolute", left: 56, right: 56, top: 160 }}>
        <div style={eyebrow}>03 · Seu jeito de agir</div>
        <h2 style={{ ...h2(C.preto, j.titulo), fontSize: titleSize(j.titulo, 54, 46) }}>{j.titulo}</h2>
        <div style={{ fontSize: bodySize(j.subtitulo, 22, 18), lineHeight: 1.3 }}>{j.subtitulo}</div>
        <div style={{ fontSize: 30, fontWeight: 800, margin: "30px 0 14px" }}>
          <span style={{ color: C.vermelho }}>{j.arquetipo}</span> · {j.intensidade}
        </div>
        {j.paragrafos.map((p, i) => (<p key={i} style={{ fontSize: 16, lineHeight: 1.55, margin: "0 0 16px" }}>{p}</p>))}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <Nota titulo={j.destaqueTitulo} texto={j.destaqueTexto} />
          <Nota texto={j.resumo} />
        </div>
      </div>
    </Moldura>
  );
}

/* ---------- Páginas 5 a 12: modelo genérico ---------- */
function CardLista({ card, i, escuro }: { card: Card; i: number; escuro?: boolean }) {
  const tom = card.cor ?? TONS[i % 4];
  return (
    <div style={{ display: "flex", borderRadius: 14, overflow: "hidden", flex: "1 1 0", minHeight: 0, background: escuro ? "#12171D" : "#fff", border: escuro ? "1px solid #262D36" : "none", boxShadow: escuro ? "none" : "0 2px 10px #0000001a" }}>
      <div style={{ width: 110, background: TOM_BG[tom], color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <b style={{ fontSize: 26 }}>{pad(i + 1)}</b><i style={{ width: 56, height: 2, background: "#fff", marginTop: 6 }} />
      </div>
      <div style={{ padding: "14px 22px", flex: 1, minWidth: 0, overflow: "hidden" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: bodySize(card.titulo, 20, 16), lineHeight: 1.18, fontWeight: 800, color: escuro ? "#fff" : TOM_COR[tom] }}>{card.titulo}</h3>
        {card.texto && <p style={{ margin: 0, fontSize: bodySize(card.texto), lineHeight: 1.42, color: escuro ? "#D5DAE0" : "#374151" }}>{card.texto}</p>}
        {card.itens && (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {card.itens.map((t) => (<li key={t} style={{ fontSize: bodySize(t), lineHeight: 1.5, color: escuro ? "#D5DAE0" : "#374151" }}>• {t}</li>))}
          </ul>
        )}
      </div>
    </div>
  );
}
function CardGrade({ card, i, escuro }: { card: Card; i: number; escuro?: boolean }) {
  const tom = card.cor ?? TONS[i % 4];
  const cor = tom === "escuro" ? "#9CA3AF" : escuro ? ["#4ADE80", "#FBBF24", "#F87171", "#22D3EE"][TONS.indexOf(tom)] : TOM_COR[tom];
  return (
    <div style={{ flex: "1 1 calc(50% - 7px)", minWidth: 0, borderRadius: 14, borderTop: `5px solid ${cor}`, padding: "20px 22px", background: escuro ? "#12171D" : "#fff", color: escuro ? "#D5DAE0" : "#374151", overflow: "hidden" }}>
      <h3 style={{ margin: "0 0 10px", fontSize: bodySize(card.titulo, 22, 17), lineHeight: 1.18, fontWeight: 800, color: cor }}>{card.titulo}</h3>
      <p style={{ margin: 0, fontSize: bodySize(card.texto ?? "", 16, 12.5), lineHeight: 1.48 }}>{card.texto}</p>
    </div>
  );
}
function Geral({ p, n, escuro, banner, c }: { p: PaginaConteudo; n: number; escuro?: boolean; banner?: boolean; c: Ctx }) {
  const fg = escuro ? "#fff" : C.preto;
  const k = `p${pad(n)}` as ChaveImagem;
  const intro = p.intro && (
    <p style={{ fontSize: bodySize(p.intro, 17, 14), lineHeight: 1.48, margin: banner ? "0 0 6px" : "20px 0 0", color: fg, maxWidth: banner ? undefined : 470 }}>{p.intro}</p>
  );
  return (
    <Moldura n={n} escuro={escuro} foto={banner ? undefined : c.I(k)} c={c}>
      <div style={{ position: "absolute", left: 56, top: 160, width: 540, maxHeight: 320, overflow: "hidden" }}>
        <div style={eyebrow}>{pad(n - 1)} · {p.secao}</div>
        <h2 style={{ ...h2(fg, p.titulo), fontSize: titleSize(p.titulo, 54, 44) }}>{p.titulo}</h2>
        {p.subtitulo && <div style={{ fontSize: 22, color: escuro ? "#C5CAD1" : "#4B5563" }}>{p.subtitulo}</div>}
        {!banner && intro}
      </div>
      {banner && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 56,
              top: 350,
              width: 812,
              height: 240,
              borderRadius: 14,
              overflow: "hidden",
              background: "linear-gradient(135deg, #11161D 0%, #1B222B 52%, #0E1217 100%)",
              border: "1px solid #2A313A",
            }}
          >
            <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, #C8102E55 0%, #C8102E00 70%)", left: 40, top: -95 }} />
            <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", border: "1px solid #FFFFFF18", right: 85, top: -80 }} />
            <div style={{ position: "absolute", width: 420, height: 1, background: "linear-gradient(90deg, #C8102E00, #C8102EAA, #C8102E00)", transform: "rotate(-12deg)", right: -35, top: 128 }} />
            <div style={{ position: "absolute", left: 34, bottom: 28, fontSize: 13, letterSpacing: 3, fontWeight: 700, color: "#AEB5BF", textTransform: "uppercase" }}>Intenção · impacto · percepção</div>
          </div>
        )}
      <div style={{ position: "absolute", left: 56, right: 56, top: banner ? 610 : 500, bottom: 108, display: "flex", flexDirection: "column", gap: 14 }}>
        {banner && intro}
        {p.destaque && (
          <div style={{ display: "flex", gap: 22, alignItems: "center", flex: "none", background: "#12161C", color: "#fff", borderLeft: `4px solid ${C.vermelho}`, borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", gap: 12 }}>
              {p.destaque.fatores.map((f) => (
                <div key={f.letra} style={{ textAlign: "center" }}>
                  <div style={{ width: 68, height: 68, borderRadius: 10, background: FATOR_COR[f.letra], fontSize: 36, fontWeight: 800, display: "grid", placeItems: "center" }}>{f.letra}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: FATOR_COR[f.letra], marginTop: 6 }}>{pct(f.valor)}</div>
                  <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>{f.rotulo}</div>
                </div>
              ))}
            </div>
            <div><h3 style={{ margin: "0 0 6px", fontSize: 22, color: C.vermelho }}>{p.destaque.titulo}</h3><p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "#D5DAE0" }}>{p.destaque.texto}</p></div>
          </div>
        )}
        {p.colunas === 2 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, flex: 1, minHeight: 0, alignContent: "stretch" }}>
            {p.cards.map((cd, i) => (<CardGrade key={i} card={cd} i={i} escuro={escuro} />))}
          </div>
        ) : (
          p.cards.map((cd, i) => (<CardLista key={i} card={cd} i={i} escuro={escuro} />))
        )}
        {p.experimento && (
          <div style={{ display: "flex", gap: 24, alignItems: "center", flex: "none", background: "#fff", color: C.preto, borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 26, fontWeight: 700, width: 170, lineHeight: 1.15 }}>Meu experimento de 30 dias</div>
            <div style={{ flex: 1 }}>
              {["Comportamento que quero praticar:", "Situação em que estarei vivenciando:", "Pessoa que poderá me dar retorno:", "Sinal concreto de progresso:"].map((t) => (
                <div key={t} style={{ fontSize: 13, borderBottom: "1px solid #9CA3AF", padding: "9px 0 3px", color: "#374151" }}>{t}</div>
              ))}
            </div>
          </div>
        )}
        {p.nota && <Nota titulo={p.nota.titulo} texto={p.nota.texto} escuro={escuro} />}
      </div>
    </Moldura>
  );
}

/* ---------- Dados de exemplo (usados só quando nenhum `dados` é passado) ---------- */
export const dadosExemplo: RelatorioDados = {
  nome: "Izabel Mendes da Silva", cargo: "Professor", data: "26/09/2026",
  natural: { D: 29.2, I: 30.6, S: 16.7, C: 23.6 },
  adaptado: { D: 34.2, I: 35.0, S: 11.7, C: 19.2 },
  social: { D: 41.7, I: 41.7, S: 4.2, C: 12.5 },
  indiceAdaptacao: 23.6,
  introducao: {
    titulo: "Você não é um número.",
    paragrafos: [
      "O resultado deste relatório não pretende colocar você dentro de uma caixa ou definir quem você é.",
      "Ele mostra tendências sobre a forma como você costuma agir, decidir, se comunicar e responder às situações do dia a dia.",
      "Nas páginas seguintes, você encontrará uma leitura prática do seu resultado.",
    ],
    citacao: "O autoconhecimento é o primeiro passo para escolhas mais conscientes e resultados mais consistentes.",
    referencia: "Este relatório é baseado nos estudos de William Moulton Marston em Emotions of Normal People (1928). A aplicação e a linguagem são autorais da APAS.",
  },
  numeros: {
    descricao: "O gráfico representa a distribuição dos seus comportamentos nos quatro fatores do DISC, indicando o seu perfil primário e secundário.",
    indiceTexto: "A distância entre espontaneidade e demanda percebida merece atenção. Ela pode indicar flexibilidade, mas também esforço continuado: uma hipótese para validar no seu contexto.",
    aviso: "Nenhuma perspectiva é melhor. Juntas, elas ajudam a compreender o repertório e o contexto.",
  },
  jeitoDeAgir: {
    titulo: "Seu jeito de agir", subtitulo: "Determinação e conexão em equilíbrio",
    arquetipo: "O Comunicador que Realiza", intensidade: "muito marcante",
    paragrafos: [
      "Seu resultado indica uma predominância de Influência (I), combinada com características de Dominância (D). Os dois fatores aparecem muito próximos, por isso seu repertório tende a ter mais de uma porta de entrada para responder ao ambiente.",
      "Você conquista pela presença, envolve pelas ideias e encontra caminhos para transformar paixão em movimento. Diante de obstáculos, tende a transformar rapidamente a intenção em ação.",
    ],
    destaqueTitulo: "Olhar de pessoas",
    destaqueTexto: "Você tende a deixar sua marca pela maneira como se conecta, comunica e mobiliza.",
    resumo: "Em poucas palavras: cria adesão para ideias novas.",
  },
  paginas: {
    pontosFortes: {
      secao: "Seus pontos fortes", titulo: "Seus pontos fortes", subtitulo: "Recursos que você já leva com você",
      intro: "Recursos que podem aparecer com mais naturalidade quando o contexto favorece seu repertório.",
      cards: [
        { titulo: "Facilidade para criar vínculo e confiança", texto: "Você tende a construir relações de forma natural, transmitindo segurança.", cor: "verde" },
        { titulo: "Comunicação persuasiva e acessível", texto: "Sua forma de se comunicar facilita o engajamento e a mobilização de pessoas.", cor: "verde" },
        { titulo: "Otimismo que sustenta o grupo", texto: "Você tende a manter uma visão positiva, mesmo diante de desafios.", cor: "verde" },
        { titulo: "Habilidade para articular pessoas e interesses", texto: "Você conecta pessoas, ideias e oportunidades de forma integrada.", cor: "verde" },
      ],
      nota: { titulo: "No contexto", texto: "Seu melhor desempenho pode surgir quando o ambiente permite usar sua força principal sem obrigá-la a resolver tudo sozinha." },
    },
    atencao: {
      secao: "O que pode exigir mais atenção", titulo: "O que pode exigir mais atenção", subtitulo: "Equilíbrio também é resultado",
      intro: "Todo comportamento que representa uma força também pode se tornar um excesso quando utilizado fora do contexto.",
      cards: [
        { titulo: "Vale observar", cor: "vermelho", itens: ["Pode dispersar foco entre muitas frentes.", "Risco de otimismo excessivo em prazos."] },
        { titulo: "Na sua interação com pessoas", cor: "vermelho", itens: ["Pode agir pelo entusiasmo antes de dimensionar riscos.", "Tende a abrir frentes demais."] },
        { titulo: "Isso não significa que exista algo “errado”", cor: "vermelho", texto: "Pontos de atenção são hipóteses sobre custos possíveis de uma preferência intensificada por pressão, cansaço ou conflito." },
      ],
      nota: { titulo: "Lembre-se", texto: "Esses pontos de atenção não diminuem suas qualidades. Eles ampliam a percepção sobre o seu comportamento." },
    },
    percebido: {
      secao: "Como você pode ser percebido", titulo: "Como você pode ser percebido", subtitulo: "A impressão que você provoca nos outros",
      intro: "A impressão que você provoca nos outros pode ser diferente da intenção que existe por trás do seu comportamento.",
      cards: [
        { titulo: "Como tende a agir", texto: "Você costuma agir de forma proativa, envolvendo pessoas e comunicando suas ideias com facilidade.", cor: "vermelho" },
        { titulo: "O que pode transmitir", texto: "Sua comunicação tende a ser calorosa, persuasiva e acessível.", cor: "escuro" },
        { titulo: "O que pode ampliar", texto: "Equilibrar a empolgação com a escuta ativa amplia o impacto da sua comunicação.", cor: "vermelho" },
        { titulo: "Em momentos de pressão", texto: "Sua energia pode ser percebida como impaciência ou excesso de urgência.", cor: "escuro" },
      ],
    },
    comunicacao: {
      secao: "Comunicação", titulo: "Comunicação", subtitulo: "Como você tende a se expressar",
      intro: "A forma como você se comunica é uma extensão do seu estilo comportamental.",
      colunas: 2,
      cards: [
        { titulo: "Quando está no seu melhor", texto: "Você tende a se comunicar de forma clara, aberta e envolvente, criando um ambiente de confiança.", cor: "verde" },
        { titulo: "Vale observar", texto: "Sua comunicação pode soar intensa ou rápida para algumas pessoas.", cor: "laranja" },
        { titulo: "Ponto de atenção", texto: "Pode haver tendência a interromper ou antecipar conclusões.", cor: "vermelho" },
        { titulo: "Experimente", texto: "Pratique a escuta ativa e faça perguntas abertas.", cor: "azul" },
      ],
    },
    decisao: {
      secao: "Decisão", titulo: "Decisão", subtitulo: "Como você tende a escolher",
      intro: "Como você tende a escolher e o que pode acontecer quando a decisão exige velocidade, informação, pessoas e consequência ao mesmo tempo.",
      cards: [
        { titulo: "No seu melhor", texto: "Você costuma buscar alternativas, avaliar impactos e decidir com confiança quando tem clareza sobre o objetivo.", cor: "verde" },
        { titulo: "Vale observar", texto: "Quando há muitas informações, pode ser útil desacelerar um pouco antes de concluir.", cor: "laranja" },
        { titulo: "Ponto de atenção", texto: "Pode dispersar o foco entre muitas frentes ou postergar decisões difíceis.", cor: "vermelho" },
        { titulo: "Dica", texto: "Antes de decidir, pergunte: “O que ainda preciso considerar antes de escolher?”", cor: "azul" },
      ],
    },
    relacionamentos: {
      secao: "Relacionamentos e equipe", titulo: "Relacionamentos e equipe", subtitulo: "Juntos, os resultados vão mais longe",
      intro: "Seu estilo influencia a maneira como você se conecta, lidera e participa de um grupo.",
      cards: [
        { titulo: "O que te fortalece", texto: "Na liderança, você tende a gerar conexão e influência, criando um ambiente colaborativo e motivador.", cor: "verde" },
        { titulo: "Vale observar", texto: "Sua forma de se relacionar pode ser percebida de maneira diferente da sua intenção.", cor: "laranja" },
        { titulo: "Ponto de atenção", texto: "Pode ser percebido como impaciente ou exigente quando há divergências.", cor: "vermelho" },
        { titulo: "Experimente", texto: "Invista em escuta ativa e distribua responsabilidades de forma clara.", cor: "azul" },
      ],
    },
    desenvolvimento: {
      secao: "Seu desenvolvimento", titulo: "Seu desenvolvimento", subtitulo: "Mais consciência, mais escolha",
      intro: "O desenvolvimento não exige negar o seu estilo. Exige ampliar opções para responder melhor ao que cada situação pede.",
      cards: [
        { titulo: "O que já está no seu repertório", texto: "Iniciativa, energia, comunicação e foco em resultados.", cor: "vermelho" },
        { titulo: "O que pode ser ajustado", texto: "Ajustes no ritmo e na intensidade ajudam a reduzir desgastes.", cor: "laranja" },
        { titulo: "O que pode ser ampliado", texto: "Novas formas de agir ampliam adaptação e flexibilidade.", cor: "vermelho" },
        { titulo: "O que pode gerar mais resultado", texto: "Ampliar a consciência e colocar novos comportamentos em ação.", cor: "azul" },
      ],
      experimento: true,
    },
    destino: {
      secao: "Seu perfil não é um destino", titulo: "Seu perfil não é um destino", subtitulo: "Seu resultado descreve tendências. Suas escolhas definem como você as utiliza.",
      intro: "O APAS DISC revela como você tende a agir, se comunicar, tomar decisões e se relacionar.",
      destaque: {
        fatores: [{ letra: "I", valor: 35.0, rotulo: "Influência" }, { letra: "D", valor: 34.2, rotulo: "Dominância" }],
        titulo: "O Comunicador que Realiza",
        texto: "Seu resultado sugere um repertório que combina facilidade para comunicar e influenciar com energia para agir e buscar resultados.",
      },
      cards: [
        { titulo: "O que levar com você", texto: "Os quatro fatores DISC fazem parte do seu repertório.", cor: "verde" },
        { titulo: "O próximo passo", texto: "Valide estas hipóteses em uma devolutiva e escolha uma ação simples para os próximos 30 dias.", cor: "laranja" },
        { titulo: "Uma mensagem final", texto: "O seu perfil não determina o seu comportamento. Ele é um ponto de partida para maior consciência.", cor: "azul" },
      ],
      nota: { texto: "O APAS DISC é uma ferramenta de análise de tendências comportamentais e não constitui diagnóstico psicológico, clínico ou psiquiátrico." },
    },
  },
};

/* ---------- Componente principal ---------- */
export default function RelatorioDISC({ dados, imagens = {} }: { dados: RelatorioDados; imagens?: Imagens }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setS(Math.min(1, el.clientWidth / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const I = (k: ChaveImagem) =>
    imagens[k] ??
    (k === "logo" ? "/apas-logo.svg" :
      k === "logoEscuro" ? "/apas-logo-dark.svg" :
      `/relatorios/img/${k}.png`);
  const c: Ctx = { dados, I };
  const p = dados.paginas;

  const paginas: ReactNode[] = [
    <Capa c={c} />,
    <Introducao c={c} />,
    <Numeros c={c} />,
    <JeitoDeAgir c={c} />,
    <Geral p={p.pontosFortes} n={5} c={c} />,
    <Geral p={p.atencao} n={6} escuro c={c} />,
    <Geral p={p.percebido} n={7} banner c={c} />,
    <Geral p={p.comunicacao} n={8} escuro c={c} />,
    <Geral p={p.decisao} n={9} c={c} />,
    <Geral p={p.relacionamentos} n={10} c={c} />,
    <Geral p={p.desenvolvimento} n={11} escuro c={c} />,
    <Geral p={p.destino} n={12} c={c} />,
  ];

  return (
    <div ref={ref} style={{ width: "100%", maxWidth: W, margin: "0 auto" }}>
      {paginas.map((pg, i) => (
        <div key={i} style={{ height: H * s, marginBottom: 16 }}>
          <div style={{ width: W, height: H, transform: `scale(${s})`, transformOrigin: "top left" }}>{pg}</div>
        </div>
      ))}
    </div>
  );
}