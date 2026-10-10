/** Technical report-local wording only; never consumed by another report. */
export const TECHNICAL_NARRATIVE_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  [" Seu resultado registra [\\d,.]+% em [^.]+\\.", ""],
  [" Os dois fatores principais aparecem em [\\d,.]+% e com uma diferença de [\\d,.]+% pontos\\.", ""],
  [" Em [\\d,.]+% de ([DISC]) e [\\d,.]+% de ([DISC]), a leitura combina", " A leitura de $1 e $2 combina"],
  [", registrada em [\\d,.]+%, enquanto (.*?) aparece em [\\d,.]+%\\.", ", enquanto $1 oferece um recurso complementar."],
  ["Com [\\d,.]+% em ([DISC]), (.*?) costuma entrar primeiro", "$2 costuma entrar primeiro"],
  ["Os [\\d,.]+% de ([DISC]) acrescentam", "O fator $1 acrescenta"],
  [" \\([\\d,.]+%\\)", ""],
  ["Com [\\d,.]+% em ([^,]+), escolha", "Com $1 no repertório, escolha"],
  ["Com [\\d,.]+% em ([^,]+), observe", "Com $1 no repertório, observe"],
  ["A diferença de [\\d,.]+% pontos entre ([DISC]) e ([DISC]) mostra onde experimentar equilíbrio:", "A relação entre $1 e $2 indica uma oportunidade de equilíbrio:"],
  ["Como (.*?) está em [\\d,.]+% e (.*?) em [\\d,.]+%, ajuste", "Ao combinar $1 e $2, ajuste"],
  ["A diferença de [\\d,.]+% pontos entre os dois fatores principais ajuda", "A relação entre os dois fatores principais ajuda"],
  ["A intensidade de [\\d,.]+% em ([DISC]) sugere", "A presença de $1 no repertório sugere"],
  ["A presença de ([DISC]) em [\\d,.]+% indica", "A presença de $1 indica"],
];

export const TECHNICAL_PROFILE_CLOSING = "A relação entre os fatores deve ser validada no contexto da pessoa avaliada.";