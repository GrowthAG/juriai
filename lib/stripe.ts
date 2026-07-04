type StripeProduct = {
  id: string;
  object: "product";
  name: string;
  active: boolean;
};

type StripePrice = {
  id: string;
  object: "price";
  currency: string;
  unit_amount: number | null;
  recurring: {
    interval: "day" | "week" | "month" | "year";
    interval_count: number;
  } | null;
};

export type StripePlanResult = {
  productId: string;
  monthlyPriceId: string;
  yearlyPriceId: string | null;
};

const STRIPE_API_BASE = "https://api.stripe.com/v1";

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function createStripePlan(input: {
  name: string;
  description?: string | null;
  currency: string;
  monthlyPriceCents: number;
  yearlyPriceCents?: number | null;
}): Promise<StripePlanResult> {
  const product = await stripeRequest<StripeProduct>("/products", {
    name: input.name,
    description: input.description || "",
    "metadata[juriai_object]": "subscription_plan",
  });

  const monthlyPrice = await createStripePrice({
    productId: product.id,
    currency: input.currency,
    amountCents: input.monthlyPriceCents,
    interval: "month",
  });

  const yearlyPrice = input.yearlyPriceCents
    ? await createStripePrice({
        productId: product.id,
        currency: input.currency,
        amountCents: input.yearlyPriceCents,
        interval: "year",
      })
    : null;

  return {
    productId: product.id,
    monthlyPriceId: monthlyPrice.id,
    yearlyPriceId: yearlyPrice?.id ?? null,
  };
}

async function createStripePrice(input: {
  productId: string;
  currency: string;
  amountCents: number;
  interval: "month" | "year";
}) {
  return stripeRequest<StripePrice>("/prices", {
    product: input.productId,
    currency: input.currency,
    unit_amount: String(input.amountCents),
    "recurring[interval]": input.interval,
    "metadata[juriai_object]": "subscription_price",
  });
}

async function stripeRequest<T>(path: string, params: Record<string, string>) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new StripeConfigError("STRIPE_SECRET_KEY não configurada.");
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
    cache: "no-store",
  });

  const json = await response.json();
  if (!response.ok) {
    const message =
      typeof json?.error?.message === "string"
        ? json.error.message
        : `Stripe retornou HTTP ${response.status}.`;
    throw new StripeUpstreamError(message);
  }

  return json as T;
}

export class StripeConfigError extends Error {
  status = 500;
}

export class StripeUpstreamError extends Error {
  status = 502;
}
