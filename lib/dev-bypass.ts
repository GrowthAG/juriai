/* Segunda trava explícita para qualquer bypass de autenticação em
 * desenvolvimento (guard de rota em proxy.ts, contexto sintético de super
 * admin em lib/actor-context.ts, botão de login sem senha em
 * app/actions/auth.ts).
 *
 * NODE_ENV=development sozinho não basta: um ambiente mal configurado fora da
 * máquina do desenvolvedor (staging, container, variável esquecida) também
 * pode ter NODE_ENV=development, e isso liberaria acesso de super admin sem
 * login nenhum. Por isso o bypass exige as DUAS condições ao mesmo tempo. */
export function isDevBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.JURIAI_ALLOW_DEV_BYPASS === "true"
  );
}

/* Checagem best-effort por host — não é fronteira de segurança forte (o
 * cabeçalho Host pode ser forjado pelo cliente), só uma camada extra de
 * defesa em profundidade específica do middleware, onde o request já está
 * disponível de graça. Não é replicada em Server Actions/Components porque
 * exigiria ler headers() em cada call site para o mesmo ganho marginal. */
export function isLocalhostHost(host: string | null): boolean {
  if (!host) return false;
  const hostname = host.split(":")[0];
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}
