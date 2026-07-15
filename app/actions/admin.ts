"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActorContext } from "@/lib/actor-context";
import { prisma } from "@/lib/prisma";
import { storeUpload } from "@/lib/uploads";
import {
  getSessionUserId,
  setSession,
  clearSession,
  setImpersonator,
  getImpersonatorUserId,
  clearImpersonator,
  DEV_ADMIN_SENTINEL,
} from "@/lib/session";
import {
  createStripePlan,
  isStripeConfigured,
  StripeConfigError,
  StripeUpstreamError,
} from "@/lib/stripe";
import {
  validateWorkspaceLlmConfig,
  type WorkspaceLlmRegistryConfig,
} from "@/lib/llm-registry";

type AdminWorkspace = {
  id: string;
  name: string;
  parentWorkspaceId: string | null;
  createdAt: Date;
  llmProvider: string | null;
  llmRegion: string | null;
  llmProjectId: string | null;
  llmModel: string | null;
  userCount: bigint | number | null;
  caseCount: bigint | number | null;
  planName: string | null;
  subscriptionStatus: string | null;
};

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isSuperAdmin: boolean;
  workspaceId: string;
  workspaceName: string;
};

type AdminPlan = {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number | null;
  maxWorkspaces: number | null;
  maxUsers: number | null;
  maxCases: number | null;
  active: boolean;
  stripeProductId: string | null;
  stripeMonthlyPriceId: string | null;
  stripeYearlyPriceId: string | null;
  subscriptionCount: bigint | number | null;
};

type AdminContext = Awaited<ReturnType<typeof getActorContext>>;

const ONBOARDING_DOMAINS = [
  "CIVIL",
  "TRABALHISTA",
  "PENAL",
  "CONSUMIDOR",
  "TRIBUTARIO",
  "FAMILIA",
  "ADMINISTRATIVO",
] as const;

const FIRM_SIZES = new Set(["1", "2-5", "6-15", "16-30", "30+"]);
const DEADLINE_CONTROLS = new Set([
  "planilha",
  "agenda",
  "software",
  "nada",
]);
const LOGO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
]);
const LETTERHEAD_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

class AdminInputError extends Error {}

async function requireAdmin() {
  const context = await getActorContext();
  if (context.workspaceRole !== "WORKSPACE_ADMIN" && !context.isSuperAdmin) {
    throw new Error("Acesso administrativo necessário.");
  }
  return context;
}

async function requireMasterAdmin() {
  const context = await requireAdmin();
  if (context.workspaceKind !== "MASTER") {
    throw new Error(
      "Apenas uma conta mestre pode criar escritórios subordinados.",
    );
  }
  return context;
}

async function requireSuperAdmin() {
  const context = await requireAdmin();
  if (!context.isSuperAdmin) {
    throw new Error("Acesso de super admin necessário.");
  }
  return context;
}

async function assertCanManageWorkspace(context: AdminContext, workspaceId: string) {
  if (context.isSuperAdmin) return;

  const rows = await prisma.$queryRaw<Array<{ allowed: bigint | number }>>`
    SELECT COUNT(*) AS "allowed"
    FROM "Workspace"
    WHERE "id" = ${workspaceId}
      AND ("id" = ${context.workspaceId} OR "parentWorkspaceId" = ${context.workspaceId})
  `;

  if (Number(rows[0]?.allowed ?? 0) === 0) {
    throw new Error("Escritório fora do escopo do administrador.");
  }
}

function validateOptionalColor(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) return null;
  if (!HEX_COLOR_PATTERN.test(normalized)) {
    throw new AdminInputError(
      `${label} deve usar o formato hexadecimal #RRGGBB.`,
    );
  }
  return normalized.toLowerCase();
}

function validateUpload(
  value: FormDataEntryValue | null,
  options: {
    label: string;
    allowedTypes: Set<string>;
    maxBytes: number;
  },
) {
  if (!(value instanceof File) || value.size === 0) return null;
  if (!options.allowedTypes.has(value.type)) {
    throw new AdminInputError(`Formato inválido para ${options.label}.`);
  }
  if (value.size > options.maxBytes) {
    const maxMb = Math.round(options.maxBytes / 1024 / 1024);
    throw new AdminInputError(
      `${options.label} deve ter no máximo ${maxMb} MB.`,
    );
  }
  return value;
}

export async function getAdminOverview() {
  const context = await requireAdmin();

  const rows = await prisma.$queryRaw<
    Array<{
      workspaces: bigint | number;
      subWorkspaces: bigint | number;
      users: bigint | number;
      plans: bigint | number;
    }>
  >`
    SELECT
      (SELECT COUNT(*) FROM "Workspace") AS "workspaces",
      (SELECT COUNT(*) FROM "Workspace" WHERE "parentWorkspaceId" = ${context.workspaceId}) AS "subWorkspaces",
      (SELECT COUNT(*) FROM "User") AS "users",
      (SELECT COUNT(*) FROM "SubscriptionPlan") AS "plans"
  `;

  const row = rows[0];
  return {
    isSuperAdmin: context.isSuperAdmin,
    workspaceName: context.workspaceName,
    stripeConfigured: isStripeConfigured(),
    counts: {
      workspaces: Number(row?.workspaces ?? 0),
      subWorkspaces: Number(row?.subWorkspaces ?? 0),
      users: Number(row?.users ?? 0),
      plans: Number(row?.plans ?? 0),
    },
  };
}

export async function listAdminWorkspaces() {
  const context = await requireAdmin();
  const rows = context.isSuperAdmin
    ? await prisma.$queryRaw<AdminWorkspace[]>`
        SELECT
          w."id",
          w."name",
          w."parentWorkspaceId",
          w."createdAt",
          w."llmProvider",
          w."llmRegion",
          w."llmProjectId",
          w."llmModel",
          (SELECT COUNT(*) FROM "User" u WHERE u."workspaceId" = w."id") AS "userCount",
          (SELECT COUNT(*) FROM "Case" c WHERE c."workspaceId" = w."id") AS "caseCount",
          sp."name" AS "planName",
          ws."status" AS "subscriptionStatus"
        FROM "Workspace" w
        LEFT JOIN "WorkspaceSubscription" ws ON ws."workspaceId" = w."id"
        LEFT JOIN "SubscriptionPlan" sp ON sp."id" = ws."planId"
        ORDER BY w."createdAt" DESC
      `
    : await prisma.$queryRaw<AdminWorkspace[]>`
        SELECT
          w."id",
          w."name",
          w."parentWorkspaceId",
          w."createdAt",
          w."llmProvider",
          w."llmRegion",
          w."llmProjectId",
          w."llmModel",
          (SELECT COUNT(*) FROM "User" u WHERE u."workspaceId" = w."id") AS "userCount",
          (SELECT COUNT(*) FROM "Case" c WHERE c."workspaceId" = w."id") AS "caseCount",
          sp."name" AS "planName",
          ws."status" AS "subscriptionStatus"
        FROM "Workspace" w
        LEFT JOIN "WorkspaceSubscription" ws ON ws."workspaceId" = w."id"
        LEFT JOIN "SubscriptionPlan" sp ON sp."id" = ws."planId"
        WHERE w."id" = ${context.workspaceId}
           OR w."parentWorkspaceId" = ${context.workspaceId}
        ORDER BY w."createdAt" DESC
      `;

  return rows;
}

export async function listAdminUsers() {
  const context = await requireAdmin();
  return context.isSuperAdmin
    ? prisma.$queryRaw<AdminUser[]>`
        SELECT
          u."id",
          u."email",
          u."name",
          u."role"::text AS "role",
          u."isSuperAdmin",
          u."workspaceId",
          w."name" AS "workspaceName"
        FROM "User" u
        JOIN "Workspace" w ON w."id" = u."workspaceId"
        ORDER BY u."createdAt" DESC
      `
    : prisma.$queryRaw<AdminUser[]>`
        SELECT
          u."id",
          u."email",
          u."name",
          u."role"::text AS "role",
          u."isSuperAdmin",
          u."workspaceId",
          w."name" AS "workspaceName"
        FROM "User" u
        JOIN "Workspace" w ON w."id" = u."workspaceId"
        WHERE w."id" = ${context.workspaceId}
           OR w."parentWorkspaceId" = ${context.workspaceId}
        ORDER BY u."createdAt" DESC
      `;
}

export async function listAdminPlans() {
  await requireAdmin();
  return prisma.$queryRaw<AdminPlan[]>`
    SELECT
      sp."id",
      sp."name",
      sp."description",
      sp."currency",
      sp."monthlyPriceCents",
      sp."yearlyPriceCents",
      sp."maxWorkspaces",
      sp."maxUsers",
      sp."maxCases",
      sp."active",
      sp."stripeProductId",
      sp."stripeMonthlyPriceId",
      sp."stripeYearlyPriceId",
      (
        SELECT COUNT(*)
        FROM "WorkspaceSubscription" ws
        WHERE ws."planId" = sp."id"
      ) AS "subscriptionCount"
    FROM "SubscriptionPlan" sp
    ORDER BY sp."createdAt" DESC
  `;
}

export async function createSubWorkspace(formData: FormData) {
  try {
    const created = await createSubWorkspaceOrThrow(formData);
    return { ok: true as const, ...created };
  } catch (error) {
    if (error instanceof AdminInputError) {
      return { ok: false as const, message: error.message };
    }
    throw error;
  }
}

async function createSubWorkspaceOrThrow(formData: FormData) {
  const context = await requireMasterAdmin();
  const name = String(formData.get("name") || "").trim();
  const adminEmail = String(formData.get("adminEmail") || "").trim().toLowerCase();
  const adminName = String(formData.get("adminName") || "").trim();
  let aiConfig: WorkspaceLlmRegistryConfig;
  try {
    aiConfig = validateWorkspaceLlmConfig({
      llmProvider: String(formData.get("llmProvider") || ""),
      llmModel: String(formData.get("llmModel") || ""),
    });
  } catch (error) {
    throw new AdminInputError(
      error instanceof Error ? error.message : "Configuração de IA inválida.",
    );
  }
  const llmProvider = aiConfig.llmProvider;
  const llmModel = aiConfig.llmModel;
  const llmRegion = String(formData.get("llmRegion") || "").trim() || null;
  const llmProjectId = String(formData.get("llmProjectId") || "").trim() || null;

  // Identidade visual + qualificação coletadas no onboarding
  const brandPrimaryColor = validateOptionalColor(
    String(formData.get("brandPrimaryColor") || ""),
    "Cor primária",
  );
  const brandSecondaryColor = validateOptionalColor(
    String(formData.get("brandSecondaryColor") || ""),
    "Cor secundária",
  );
  const firmSize = String(formData.get("firmSize") || "").trim();
  const deadlineControl = String(
    formData.get("deadlineControl") || "",
  ).trim();
  const mainBottleneck = String(
    formData.get("mainBottleneck") || "",
  ).trim();

  const allowedDomains = new Set<string>(ONBOARDING_DOMAINS);
  const selectedDomains = new Set(
    formData
      .getAll("domains")
      .map((domain) => String(domain).trim().toUpperCase())
      .filter((domain) => allowedDomains.has(domain)),
  );
  const domains = [...selectedDomains];
  // A whitelist acima garante que só constantes do enum entram aqui: sem injeção.
  const domainsArrayLiteral = `ARRAY[${domains
    .map((d) => `'${d}'`)
    .join(",")}]::"LegalDomain"[]`;

  const logoFile = validateUpload(formData.get("logo"), {
    label: "o logo",
    allowedTypes: LOGO_TYPES,
    maxBytes: 5 * 1024 * 1024,
  });
  const letterheadFile = validateUpload(formData.get("letterhead"), {
    label: "o papel timbrado",
    allowedTypes: LETTERHEAD_TYPES,
    maxBytes: 10 * 1024 * 1024,
  });

  if (name.length < 2 || name.length > 120) {
    throw new AdminInputError(
      "O nome do escritório deve ter entre 2 e 120 caracteres.",
    );
  }
  if (adminName.length < 2 || adminName.length > 120) {
    throw new AdminInputError("Informe o nome do administrador.");
  }
  if (adminEmail.length > 254 || !EMAIL_PATTERN.test(adminEmail)) {
    throw new AdminInputError(
      "Informe um e-mail válido para o administrador.",
    );
  }
  if (domains.length === 0) {
    throw new AdminInputError("Selecione ao menos uma área de atuação.");
  }
  if (!FIRM_SIZES.has(firmSize)) {
    throw new AdminInputError("Selecione o porte do escritório.");
  }
  if (!DEADLINE_CONTROLS.has(deadlineControl)) {
    throw new AdminInputError(
      "Selecione como o escritório controla prazos.",
    );
  }
  if (!mainBottleneck || mainBottleneck.length > 1000) {
    throw new AdminInputError(
      "Descreva o principal gargalo em até 1.000 caracteres.",
    );
  }

  const created = await prisma.$transaction(async (tx) => {
    const [existingUser, existingWorkspace] = await Promise.all([
      tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "User"
        WHERE LOWER("email") = ${adminEmail}
        LIMIT 1
      `,
      tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "Workspace"
        WHERE "parentWorkspaceId" = ${context.workspaceId}
          AND LOWER("name") = ${name.toLowerCase()}
        LIMIT 1
      `,
    ]);

    if (existingUser.length > 0) {
      throw new AdminInputError(
        "Já existe um usuário com esse e-mail. Use outro e-mail para o novo administrador.",
      );
    }
    if (existingWorkspace.length > 0) {
      throw new AdminInputError("Já existe um escritório com esse nome.");
    }

    const workspaceRows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO "Workspace" (
        "id",
        "name",
        "createdAt",
        "updatedAt",
        "activeDomains",
        "parentWorkspaceId",
        "llmProvider",
        "llmRegion",
        "llmProjectId",
        "llmModel",
        "brandPrimaryColor",
        "brandSecondaryColor",
        "firmSize",
        "deadlineControl",
        "mainBottleneck"
      ) VALUES (
        gen_random_uuid()::text,
        $1,
        NOW(),
        NOW(),
        ${domainsArrayLiteral},
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11
      )
      RETURNING "id"`,
      name,
      context.workspaceId,
      llmProvider,
      llmRegion,
      llmProjectId,
      llmModel,
      brandPrimaryColor,
      brandSecondaryColor,
      firmSize,
      deadlineControl,
      mainBottleneck,
    );

    const workspaceId = workspaceRows[0]?.id;
    if (!workspaceId) throw new Error("Falha ao criar escritório.");

    const userRows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO "User" (
        "id",
        "email",
        "name",
        "role",
        "isSuperAdmin",
        "createdAt",
        "updatedAt",
        "workspaceId"
      ) VALUES (
        gen_random_uuid()::text,
        $1,
        $2,
        'WORKSPACE_ADMIN'::"Role",
        false,
        NOW(),
        NOW(),
        $3
      )
      RETURNING "id"`,
      adminEmail,
      adminName,
      workspaceId,
    );

    const userId = userRows[0]?.id;
    if (!userId) throw new Error("Falha ao criar usuário admin.");

    await tx.$executeRawUnsafe(
      `INSERT INTO "Membership" ("workspaceId", "userId", "role", "createdAt", "updatedAt")
       VALUES ($1, $2, 'OWNER'::"MembershipRole", NOW(), NOW())
       ON CONFLICT ("workspaceId", "userId") DO UPDATE SET
         "role" = 'OWNER'::"MembershipRole",
         "updatedAt" = NOW()`,
      workspaceId,
      userId,
    );

    return { workspaceId };
  });

  // Anexos de marca (logo, papel timbrado): gravados fora da transação porque
  // dependem do id já persistido. Reaproveita o mesmo storeUpload das provas.
  const fileUpdates: string[] = [];
  const fileParams: unknown[] = [];
  const uploadWarnings: string[] = [];
  if (logoFile) {
    try {
      const stored = await storeUpload(logoFile, created.workspaceId);
      fileParams.push(stored.storagePath);
      fileUpdates.push(`"logoPath" = $${fileParams.length}`);
    } catch (error) {
      console.error("Falha ao armazenar logo do escritório", error);
      uploadWarnings.push("Não foi possível salvar o logo.");
    }
  }
  if (letterheadFile) {
    try {
      const stored = await storeUpload(letterheadFile, created.workspaceId);
      fileParams.push(stored.storagePath);
      fileUpdates.push(`"letterheadPath" = $${fileParams.length}`);
    } catch (error) {
      console.error("Falha ao armazenar papel timbrado do escritório", error);
      uploadWarnings.push("Não foi possível salvar o papel timbrado.");
    }
  }
  if (fileUpdates.length > 0) {
    try {
      fileParams.push(created.workspaceId);
      await prisma.$executeRawUnsafe(
        `UPDATE "Workspace" SET ${fileUpdates.join(", ")}, "updatedAt" = NOW() WHERE "id" = $${fileParams.length}`,
        ...fileParams,
      );
    } catch (error) {
      console.error("Falha ao vincular anexos ao escritório", error);
      uploadWarnings.push(
        "Os arquivos foram recebidos, mas não puderam ser vinculados ao escritório.",
      );
    }
  }

  revalidatePath("/admin/subcontas");
  revalidatePath("/admin");

  return {
    workspaceId: created.workspaceId,
    warning: uploadWarnings.length > 0 ? uploadWarnings.join(" ") : null,
  };
}

export async function updateWorkspaceAiConfig(formData: FormData) {
  const context = await requireAdmin();
  const workspaceId = String(formData.get("workspaceId") || "").trim();
  const llmRegion = formData.has("llmRegion")
    ? String(formData.get("llmRegion") || "").trim() || null
    : undefined;
  const llmProjectId = formData.has("llmProjectId")
    ? String(formData.get("llmProjectId") || "").trim() || null
    : undefined;

  if (!workspaceId) {
    throw new Error("Escritório é obrigatório.");
  }

  await assertCanManageWorkspace(context, workspaceId);

  const current = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      llmProvider: true,
      llmRegion: true,
      llmProjectId: true,
      llmModel: true,
    },
  });
  if (!current) {
    throw new Error("Escritório não encontrado.");
  }

  let aiConfig: WorkspaceLlmRegistryConfig;
  try {
    aiConfig = validateWorkspaceLlmConfig({
      llmProvider: formData.has("llmProvider")
        ? String(formData.get("llmProvider") || "")
        : undefined,
      llmModel: formData.has("llmModel")
        ? String(formData.get("llmModel") || "")
        : undefined,
      current: {
        llmProvider: current.llmProvider,
        llmModel: current.llmModel,
      },
    });
  } catch (error) {
    throw new AdminInputError(
      error instanceof Error ? error.message : "Configuração de IA inválida.",
    );
  }

  await prisma.$executeRawUnsafe(
    `UPDATE "Workspace"
     SET
       "llmProvider" = $1,
       "llmRegion" = $2,
       "llmProjectId" = $3,
       "llmModel" = $4,
       "updatedAt" = NOW()
     WHERE "id" = $5`,
    aiConfig.llmProvider,
    llmRegion === undefined ? current.llmRegion : llmRegion,
    llmProjectId === undefined ? current.llmProjectId : llmProjectId,
    aiConfig.llmModel,
    workspaceId,
  );

  revalidatePath(`/admin/subcontas/${workspaceId}`);
  revalidatePath("/admin/subcontas");
  revalidatePath("/admin");
}

export async function createWorkspaceUser(formData: FormData) {
  const context = await requireAdmin();
  const workspaceId = String(formData.get("workspaceId") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "LIMITED_USER").trim();
  const membershipRole = String(formData.get("membershipRole") || "VIEWER").trim();
  const isSuperAdmin = context.isSuperAdmin && formData.get("isSuperAdmin") === "on";

  if (!workspaceId || !email) {
    throw new Error("Escritório e e-mail são obrigatórios.");
  }

  await assertCanManageWorkspace(context, workspaceId);

  await prisma.$transaction(async (tx) => {
    const userRows = await tx.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO "User" (
        "id",
        "email",
        "name",
        "role",
        "isSuperAdmin",
        "createdAt",
        "updatedAt",
        "workspaceId"
      ) VALUES (
        gen_random_uuid()::text,
        $1,
        $2,
        $3::"Role",
        $4,
        NOW(),
        NOW(),
        $5
      )
      ON CONFLICT ("email") DO UPDATE SET
        "name" = EXCLUDED."name",
        "role" = EXCLUDED."role",
        "isSuperAdmin" = EXCLUDED."isSuperAdmin",
        "workspaceId" = EXCLUDED."workspaceId",
        "updatedAt" = NOW()
      RETURNING "id"`,
      email,
      name || email,
      role,
      isSuperAdmin,
      workspaceId,
    );

    const userId = userRows[0]?.id;
    if (!userId) throw new Error("Falha ao criar usuário.");

    await tx.$executeRawUnsafe(
      `INSERT INTO "Membership" ("workspaceId", "userId", "role", "createdAt", "updatedAt")
       VALUES ($1, $2, $3::"MembershipRole", NOW(), NOW())
       ON CONFLICT ("workspaceId", "userId") DO UPDATE SET
         "role" = EXCLUDED."role",
         "updatedAt" = NOW()`,
      workspaceId,
      userId,
      membershipRole,
    );
  });

  revalidatePath("/admin/subcontas");
}

export async function createBillingPlan(formData: FormData) {
  await requireSuperAdmin();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const currency = String(formData.get("currency") || "brl").trim().toLowerCase();
  const monthlyPriceCents = moneyToCents(String(formData.get("monthlyPrice") || ""));
  const yearlyPriceCents = optionalMoneyToCents(String(formData.get("yearlyPrice") || ""));
  const maxWorkspaces = optionalInteger(String(formData.get("maxWorkspaces") || ""));
  const maxUsers = optionalInteger(String(formData.get("maxUsers") || ""));
  const maxCases = optionalInteger(String(formData.get("maxCases") || ""));

  if (!name || monthlyPriceCents === null) {
    throw new Error("Nome e preço mensal são obrigatórios.");
  }

  let stripeProductId: string | null = null;
  let stripeMonthlyPriceId: string | null = null;
  let stripeYearlyPriceId: string | null = null;

  if (isStripeConfigured()) {
    try {
      const stripe = await createStripePlan({
        name,
        description,
        currency,
        monthlyPriceCents,
        yearlyPriceCents,
      });
      stripeProductId = stripe.productId;
      stripeMonthlyPriceId = stripe.monthlyPriceId;
      stripeYearlyPriceId = stripe.yearlyPriceId;
    } catch (error) {
      if (error instanceof StripeConfigError || error instanceof StripeUpstreamError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO "SubscriptionPlan" (
      "id",
      "name",
      "description",
      "currency",
      "monthlyPriceCents",
      "yearlyPriceCents",
      "maxWorkspaces",
      "maxUsers",
      "maxCases",
      "active",
      "stripeProductId",
      "stripeMonthlyPriceId",
      "stripeYearlyPriceId",
      "createdAt",
      "updatedAt"
    ) VALUES (
      gen_random_uuid()::text,
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      true,
      $9,
      $10,
      $11,
      NOW(),
      NOW()
    )`,
    name,
    description || null,
    currency,
    monthlyPriceCents,
    yearlyPriceCents,
    maxWorkspaces,
    maxUsers,
    maxCases,
    stripeProductId,
    stripeMonthlyPriceId,
    stripeYearlyPriceId,
  );

  revalidatePath("/admin/planos");
  revalidatePath("/admin");
}

export async function assignPlanToWorkspace(formData: FormData) {
  await requireSuperAdmin();
  const workspaceId = String(formData.get("workspaceId") || "").trim();
  const planId = String(formData.get("planId") || "").trim() || null;
  const status = String(formData.get("status") || "trialing").trim();

  if (!workspaceId) {
    throw new Error("Escritório é obrigatório.");
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO "WorkspaceSubscription" (
      "id",
      "status",
      "workspaceId",
      "planId",
      "createdAt",
      "updatedAt"
    ) VALUES (
      gen_random_uuid()::text,
      $1,
      $2,
      $3,
      NOW(),
      NOW()
    )
    ON CONFLICT ("workspaceId") DO UPDATE SET
      "status" = EXCLUDED."status",
      "planId" = EXCLUDED."planId",
      "updatedAt" = NOW()`,
    status,
    workspaceId,
    planId,
  );

  revalidatePath("/admin/planos");
  revalidatePath("/admin/subcontas");
}

function moneyToCents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

function optionalMoneyToCents(value: string) {
  if (!value.trim()) return null;
  return moneyToCents(value);
}

function optionalInteger(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

// ── Detalhe do escritório + acesso (impersonation) ─────────────

type WorkspaceDetail = {
  id: string;
  name: string;
  kind: string;
  llmProvider: string | null;
  llmRegion: string | null;
  llmProjectId: string | null;
  llmModel: string | null;
  brandPrimaryColor: string | null;
  brandSecondaryColor: string | null;
  logoPath: string | null;
  letterheadPath: string | null;
  firmSize: string | null;
  deadlineControl: string | null;
  mainBottleneck: string | null;
  planName: string | null;
  subscriptionStatus: string | null;
  userCount: bigint | number | null;
  caseCount: bigint | number | null;
};

type WorkspaceMember = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isSuperAdmin: boolean;
  membershipRole: string | null;
};

export async function getWorkspaceDetail(workspaceId: string) {
  const context = await requireAdmin();
  await assertCanManageWorkspace(context, workspaceId);

  const wsRows = await prisma.$queryRawUnsafe<WorkspaceDetail[]>(
    `SELECT
       w."id", w."name", w."kind",
       w."llmProvider", w."llmRegion", w."llmProjectId", w."llmModel",
       w."brandPrimaryColor", w."brandSecondaryColor",
       w."logoPath", w."letterheadPath",
       w."firmSize", w."deadlineControl", w."mainBottleneck",
       sp."name" AS "planName",
       ws."status" AS "subscriptionStatus",
       (SELECT COUNT(*) FROM "User" u WHERE u."workspaceId" = w."id") AS "userCount",
       (SELECT COUNT(*) FROM "Case" c WHERE c."workspaceId" = w."id") AS "caseCount"
     FROM "Workspace" w
     LEFT JOIN "WorkspaceSubscription" ws ON ws."workspaceId" = w."id"
     LEFT JOIN "SubscriptionPlan" sp ON sp."id" = ws."planId"
     WHERE w."id" = $1
     LIMIT 1`,
    workspaceId,
  );

  const workspace = wsRows[0];
  if (!workspace) throw new Error("Escritório não encontrado.");

  const members = await prisma.$queryRawUnsafe<WorkspaceMember[]>(
    `SELECT
       u."id", u."email", u."name", u."role", u."isSuperAdmin",
       m."role" AS "membershipRole"
     FROM "User" u
     LEFT JOIN "Membership" m ON m."userId" = u."id" AND m."workspaceId" = u."workspaceId"
     WHERE u."workspaceId" = $1
     ORDER BY u."createdAt" ASC`,
    workspaceId,
  );

  return { workspace, members };
}

export async function enterWorkspace(formData: FormData) {
  const context = await requireAdmin();
  const workspaceId = String(formData.get("workspaceId") || "").trim();
  if (!workspaceId) throw new Error("Escritório é obrigatório.");

  await assertCanManageWorkspace(context, workspaceId);

  // Acha um usuário do escritório alvo pra assumir (preferência: admin do escritório).
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT "id" FROM "User"
     WHERE "workspaceId" = $1
     ORDER BY CASE WHEN "role" = 'WORKSPACE_ADMIN' THEN 0 ELSE 1 END, "createdAt" ASC
     LIMIT 1`,
    workspaceId,
  );
  const targetUserId = rows[0]?.id;
  if (!targetUserId) {
    throw new Error(
      "Esse escritório ainda não tem nenhum usuário para acessar. Crie um membro primeiro.",
    );
  }

  const current = await getSessionUserId();
  await setImpersonator(current ?? DEV_ADMIN_SENTINEL);
  await setSession(targetUserId);
  redirect("/workspace");
}

export async function exitImpersonation() {
  const original = await getImpersonatorUserId();
  await clearImpersonator();
  if (original && original !== DEV_ADMIN_SENTINEL) {
    await setSession(original);
  } else {
    await clearSession();
  }
  redirect("/admin/subcontas");
}
