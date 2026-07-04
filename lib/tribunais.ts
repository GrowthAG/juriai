/**
 * Tribunais brasileiros aceitos pela consulta DataJud/CNJ, agrupados por ramo
 * da Justiça. A sigla e a chave usada pela API pública do CNJ (ex.: "TJSP").
 *
 * A ordem dos grupos segue a relevancia para o B2B civel: Justica Estadual
 * primeiro (onde mora a maioria dos contratos e cobrancas), depois Federal,
 * Trabalho e os Tribunais Superiores.
 */

export type TribunalGroup = {
  label: string;
  domains: string[]; // dominios do caso em que este grupo faz sentido
  tribunais: { sigla: string; nome: string }[];
};

export const TRIBUNAL_GROUPS: TribunalGroup[] = [
  {
    label: "Justiça Estadual",
    domains: ["CIVIL", "CONSUMIDOR", "FAMILIA", "PENAL"],
    tribunais: [
      { sigla: "TJSP", nome: "São Paulo" },
      { sigla: "TJRJ", nome: "Rio de Janeiro" },
      { sigla: "TJMG", nome: "Minas Gerais" },
      { sigla: "TJRS", nome: "Rio Grande do Sul" },
      { sigla: "TJPR", nome: "Paraná" },
      { sigla: "TJSC", nome: "Santa Catarina" },
      { sigla: "TJBA", nome: "Bahia" },
      { sigla: "TJDFT", nome: "Distrito Federal e Territórios" },
      { sigla: "TJGO", nome: "Goiás" },
      { sigla: "TJPE", nome: "Pernambuco" },
      { sigla: "TJCE", nome: "Ceará" },
      { sigla: "TJES", nome: "Espírito Santo" },
      { sigla: "TJPA", nome: "Pará" },
      { sigla: "TJMA", nome: "Maranhão" },
      { sigla: "TJMT", nome: "Mato Grosso" },
      { sigla: "TJMS", nome: "Mato Grosso do Sul" },
      { sigla: "TJPB", nome: "Paraíba" },
      { sigla: "TJRN", nome: "Rio Grande do Norte" },
      { sigla: "TJPI", nome: "Piauí" },
      { sigla: "TJAL", nome: "Alagoas" },
      { sigla: "TJSE", nome: "Sergipe" },
      { sigla: "TJAM", nome: "Amazonas" },
      { sigla: "TJRO", nome: "Rondônia" },
      { sigla: "TJAC", nome: "Acre" },
      { sigla: "TJAP", nome: "Amapá" },
      { sigla: "TJRR", nome: "Roraima" },
      { sigla: "TJTO", nome: "Tocantins" },
    ],
  },
  {
    label: "Justiça Federal",
    domains: ["CIVIL", "TRIBUTARIO", "CONSUMIDOR"],
    tribunais: [
      { sigla: "TRF1", nome: "1ª Região (DF, MG, GO, TO, BA, PI, MA, PA, AM, AC, RO, RR, AP)" },
      { sigla: "TRF2", nome: "2ª Região (RJ, ES)" },
      { sigla: "TRF3", nome: "3ª Região (SP, MS)" },
      { sigla: "TRF4", nome: "4ª Região (RS, PR, SC)" },
      { sigla: "TRF5", nome: "5ª Região (PE, CE, AL, PB, RN, SE)" },
      { sigla: "TRF6", nome: "6ª Região (MG)" },
    ],
  },
  {
    label: "Justiça do Trabalho",
    domains: ["TRABALHISTA"],
    tribunais: [
      { sigla: "TRT1", nome: "1ª Região (RJ)" },
      { sigla: "TRT2", nome: "2ª Região (São Paulo, capital e Grande SP)" },
      { sigla: "TRT3", nome: "3ª Região (MG)" },
      { sigla: "TRT4", nome: "4ª Região (RS)" },
      { sigla: "TRT5", nome: "5ª Região (BA)" },
      { sigla: "TRT6", nome: "6ª Região (PE)" },
      { sigla: "TRT7", nome: "7ª Região (CE)" },
      { sigla: "TRT8", nome: "8ª Região (PA, AP)" },
      { sigla: "TRT9", nome: "9ª Região (PR)" },
      { sigla: "TRT10", nome: "10ª Região (DF, TO)" },
      { sigla: "TRT11", nome: "11ª Região (AM, RR)" },
      { sigla: "TRT12", nome: "12ª Região (SC)" },
      { sigla: "TRT13", nome: "13ª Região (PB)" },
      { sigla: "TRT14", nome: "14ª Região (RO, AC)" },
      { sigla: "TRT15", nome: "15ª Região (interior de SP, Campinas)" },
      { sigla: "TRT16", nome: "16ª Região (MA)" },
      { sigla: "TRT17", nome: "17ª Região (ES)" },
      { sigla: "TRT18", nome: "18ª Região (GO)" },
      { sigla: "TRT19", nome: "19ª Região (AL)" },
      { sigla: "TRT20", nome: "20ª Região (SE)" },
      { sigla: "TRT21", nome: "21ª Região (RN)" },
      { sigla: "TRT22", nome: "22ª Região (PI)" },
      { sigla: "TRT23", nome: "23ª Região (MT)" },
      { sigla: "TRT24", nome: "24ª Região (MS)" },
    ],
  },
  {
    label: "Tribunais Superiores",
    domains: ["CIVIL", "CONSUMIDOR", "TRABALHISTA", "PENAL", "TRIBUTARIO", "FAMILIA"],
    tribunais: [
      { sigla: "STJ", nome: "Superior Tribunal de Justiça" },
      { sigla: "TST", nome: "Tribunal Superior do Trabalho" },
      { sigla: "STF", nome: "Supremo Tribunal Federal" },
    ],
  },
];

/**
 * Retorna os grupos de tribunais ordenados pela relevancia para o dominio do
 * caso: o ramo que casa com o dominio vem primeiro, o resto segue depois.
 * Assim um caso trabalhista abre com os TRTs no topo, um civel com os TJs.
 */
export function tribunalGroupsForDomain(domain: string): TribunalGroup[] {
  const relevant = TRIBUNAL_GROUPS.filter((g) => g.domains.includes(domain));
  const rest = TRIBUNAL_GROUPS.filter((g) => !g.domains.includes(domain));
  return [...relevant, ...rest];
}
