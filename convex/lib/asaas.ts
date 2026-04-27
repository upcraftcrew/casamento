const SANDBOX_BASE = "https://api-sandbox.asaas.com/v3";
const PROD_BASE = "https://api.asaas.com/v3";

function getBaseUrl(): string {
  const env = (process.env.ASAAS_ENV ?? "sandbox").toLowerCase();
  return env === "production" || env === "prod" ? PROD_BASE : SANDBOX_BASE;
}

function getApiKey(): string {
  const key = process.env.ASAAS_API_KEY;
  if (!key) {
    throw new Error(
      "ASAAS_API_KEY não está configurada no ambiente do Convex."
    );
  }
  return key;
}

async function asaasFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: getApiKey(),
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      (data &&
        typeof data === "object" &&
        "errors" in data &&
        JSON.stringify((data as { errors: unknown }).errors)) ||
      `Asaas ${res.status}`;
    throw new Error(`Falha na API do Asaas: ${message}`);
  }

  return data as T;
}

export type AsaasCustomer = {
  id: string;
  name: string;
  email?: string;
  cpfCnpj?: string;
};

export type AsaasPayment = {
  id: string;
  status: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  value: number;
  netValue?: number;
  billingType: string;
  dueDate: string;
};

export type AsaasPixQrCode = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

export async function createCustomer(args: {
  name: string;
  email?: string;
  cpfCnpj: string;
  phone?: string;
}): Promise<AsaasCustomer> {
  return await asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: args.name,
      email: args.email,
      cpfCnpj: args.cpfCnpj.replace(/\D/g, ""),
      phone: args.phone?.replace(/\D/g, ""),
    }),
  });
}

export async function createPayment(args: {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD";
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
}): Promise<AsaasPayment> {
  return await asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify(args),
  });
}

export async function getPixQrCode(
  paymentId: string
): Promise<AsaasPixQrCode> {
  return await asaasFetch<AsaasPixQrCode>(
    `/payments/${paymentId}/pixQrCode`,
    { method: "GET" }
  );
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
