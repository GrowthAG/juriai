import { NextRequest, NextResponse } from "next/server";
import { checkQuota, incrementQuota } from "@/lib/quotas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCnpj = searchParams.get("cnpj") || "";
    const clean = rawCnpj.replace(/\D/g, "");

    if (clean.length !== 14) {
      return NextResponse.json(
        { error: "CNPJ inválido. Digite os 14 dígitos numéricos." },
        { status: 400 }
      );
    }

    // Verificacao segura de Quota Beta (Fail-open: nunca derruba a consulta)
    let quotaCheck: { allowed: boolean; current: number; limit: number; isUnlimited: boolean; message?: string } = {
      allowed: true,
      current: 0,
      limit: 30,
      isUnlimited: true,
    };
    try {
      const res = await checkQuota("intel_searches");
      quotaCheck = res;
      if (!quotaCheck.allowed) {
        return NextResponse.json(
          {
            error: quotaCheck.message || "Limite de consultas do Programa Pioneiro atingido.",
            quotaExceeded: true,
            current: quotaCheck.current,
            limit: quotaCheck.limit,
          },
          { status: 429 }
        );
      }
    } catch (e) {
      console.warn("[Quota Check Warning]", e);
    }

    const masked = clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

    // Tentativa 1: BrasilAPI
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
        signal: controller.signal,
        headers: { "User-Agent": "JuriAI-LegalIntelligence/3.0" },
        next: { revalidate: 3600 },
      });
      clearTimeout(timeout);

      if (resp.ok) {
        const data = await resp.json();
        const end = `${data.descricao_tipo_de_logradouro || data.logradouro || "Rua"} ${data.logradouro || ""}, ${data.numero || "s/n"}${data.complemento ? ` (${data.complemento})` : ""}, Bairro ${data.bairro || "Centro"}, CEP ${data.cep || ""}, ${data.municipio || ""}/${data.uf || ""}`.replace(/\s+/g, " ").trim();
        const qsa = Array.isArray(data.qsa) ? data.qsa : [];
        const adminNames = qsa.map((s: any) => s.nome_socio).slice(0, 2).join(" e ") || "seus administradores legais";
        const qualif = `${data.razao_social}, pessoa jurídica de direito privado inscrita no CNPJ sob o nº ${masked}, com sede na ${end}, representada por ${adminNames}`;

        let newCount = quotaCheck.current + 1;
        try {
          newCount = await incrementQuota("intel_searches");
        } catch (e) {}

        return NextResponse.json({
          provider: "brasilapi",
          razao_social: data.razao_social,
          nome_fantasia: data.nome_fantasia || "-",
          cnpj_formatado: masked,
          situacao: data.descricao_situacao_cadastral || "ATIVA",
          abertura: data.data_inicio_atividade || "-",
          capital_social: Number(data.capital_social || 0),
          cnae: `${data.cnae_fiscal || ""} - ${data.cnae_fiscal_descricao || ""}`,
          natureza: data.natureza_juridica || "-",
          endereco: end,
          qsa: qsa.map((s: any) => ({
            nome_socio: s.nome_socio,
            qualificacao_socio: s.qualificacao_socio || s.qualificacao_representante_legal || "Sócio / Administrador",
            faixa_etaria: s.faixa_etaria || "-",
            data_entrada_sociedade: s.data_entrada_sociedade || "-",
          })),
          qualificacao: qualif,
          is_jec: (data.porte === "MICRO EMPRESA" || data.porte === "EMPRESA DE PEQUENO PORTE" || data.codigo_porte === 1 || data.codigo_porte === 3 || data.opcao_pelo_simples === true),
          quota: {
            current: newCount,
            limit: quotaCheck.limit,
            isUnlimited: quotaCheck.isUnlimited,
          }
        });
      }
    } catch (err) {
      console.warn("[CNPJ Provider 1: BrasilAPI timeout/error]", err);
    }

    // Tentativa 2: Minha Receita
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch(`https://minhareceita.org/${clean}`, {
        signal: controller.signal,
        headers: { "User-Agent": "JuriAI-LegalIntelligence/3.0" },
        next: { revalidate: 3600 },
      });
      clearTimeout(timeout);

      if (resp.ok) {
        const data = await resp.json();
        const end = `${data.descricao_tipo_de_logradouro || data.logradouro || "Rua"} ${data.logradouro || ""}, ${data.numero || "s/n"}${data.complemento ? ` (${data.complemento})` : ""}, Bairro ${data.bairro || "Centro"}, CEP ${data.cep || ""}, ${data.municipio || ""}/${data.uf || ""}`.replace(/\s+/g, " ").trim();
        const qsa = Array.isArray(data.qsa) ? data.qsa : [];
        const adminNames = qsa.map((s: any) => s.nome_socio).slice(0, 2).join(" e ") || "seus administradores legais";
        const qualif = `${data.razao_social}, pessoa jurídica de direito privado inscrita no CNPJ sob o nº ${masked}, com sede na ${end}, representada por ${adminNames}`;

        let newCount = quotaCheck.current + 1;
        try {
          newCount = await incrementQuota("intel_searches");
        } catch (e) {}

        return NextResponse.json({
          provider: "minhareceita",
          razao_social: data.razao_social,
          nome_fantasia: data.nome_fantasia || "-",
          cnpj_formatado: masked,
          situacao: data.descricao_situacao_cadastral || "ATIVA",
          abertura: data.data_inicio_atividade || "-",
          capital_social: Number(data.capital_social || 0),
          cnae: `${data.cnae_fiscal || ""} - ${data.cnae_fiscal_descricao || ""}`,
          natureza: data.natureza_juridica || "-",
          endereco: end,
          qsa: qsa.map((s: any) => ({
            nome_socio: s.nome_socio,
            qualificacao_socio: s.qualificacao_socio || "Sócio / Administrador",
            faixa_etaria: s.faixa_etaria || "-",
            data_entrada_sociedade: s.data_entrada_sociedade || "-",
          })),
          qualificacao: qualif,
          is_jec: (data.porte === "MICRO EMPRESA" || data.porte === "EMPRESA DE PEQUENO PORTE" || data.opcao_pelo_simples === true),
          quota: {
            current: newCount,
            limit: quotaCheck.limit,
            isUnlimited: quotaCheck.isUnlimited,
          }
        });
      }
    } catch (err) {
      console.warn("[CNPJ Provider 2: MinhaReceita timeout/error]", err);
    }

    // Tentativa 3: ReceitaWS
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch(`https://receitaws.com.br/v1/cnpj/${clean}`, {
        signal: controller.signal,
        headers: { "User-Agent": "JuriAI-LegalIntelligence/3.0" },
        next: { revalidate: 3600 },
      });
      clearTimeout(timeout);

      if (resp.ok) {
        const data = await resp.json();
        if (data.status !== "ERROR") {
          const end = `${data.logradouro || "Rua"}, ${data.numero || "s/n"}${data.complemento ? ` (${data.complemento})` : ""}, Bairro ${data.bairro || "Centro"}, CEP ${data.cep || ""}, ${data.municipio || ""}/${data.uf || ""}`.replace(/\s+/g, " ").trim();
          const qsa = Array.isArray(data.qsa) ? data.qsa : [];
          const adminNames = qsa.map((s: any) => s.nome).slice(0, 2).join(" e ") || "seus administradores legais";
          const qualif = `${data.nome}, pessoa jurídica de direito privado inscrita no CNPJ sob o nº ${masked}, com sede na ${end}, representada por ${adminNames}`;

          let newCount = quotaCheck.current + 1;
          try {
            newCount = await incrementQuota("intel_searches");
          } catch (e) {}

          return NextResponse.json({
            provider: "receitaws",
            razao_social: data.nome,
            nome_fantasia: data.fantasia || "-",
            cnpj_formatado: masked,
            situacao: data.situacao || "ATIVA",
            abertura: data.abertura || "-",
            capital_social: parseFloat((data.capital_social || "0").replace(/[^0-9.-]+/g, "")) || 0,
            cnae: `${data.atividade_principal?.[0]?.code || ""} - ${data.atividade_principal?.[0]?.text || ""}`,
            natureza: data.natureza_juridica || "-",
            endereco: end,
            qsa: qsa.map((s: any) => ({
              nome_socio: s.nome,
              qualificacao_socio: s.qual || "Sócio / Administrador",
              faixa_etaria: "-",
              data_entrada_sociedade: "-",
            })),
            qualificacao: qualif,
            is_jec: (data.porte === "MICRO EMPRESA" || data.porte === "EMPRESA DE PEQUENO PORTE" || data.simples?.optante === true),
            quota: {
              current: newCount,
              limit: quotaCheck.limit,
              isUnlimited: quotaCheck.isUnlimited,
            }
          });
        }
      }
    } catch (err) {
      console.warn("[CNPJ Provider 3: ReceitaWS timeout/error]", err);
    }

    return NextResponse.json(
      { error: "CNPJ não localizado na base pública da Receita Federal ou servidores indisponíveis no momento." },
      { status: 404 }
    );
  } catch (globalErr: any) {
    console.error("[CNPJ Global Error]", globalErr);
    return NextResponse.json(
      { error: "Falha temporária ao consultar base cadastral. Tente novamente." },
      { status: 500 }
    );
  }
}
