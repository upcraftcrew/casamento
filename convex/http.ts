import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

type AsaasWebhookBody = {
  id?: string;
  event?: string;
  payment?: {
    id?: string;
    status?: string;
  };
};

http.route({
  path: "/asaas-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
    const receivedToken = request.headers.get("asaas-access-token");
    if (expectedToken && receivedToken !== expectedToken) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: AsaasWebhookBody;
    try {
      body = (await request.json()) as AsaasWebhookBody;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const eventId = body.id;
    const event = body.event;
    const asaasPaymentId = body.payment?.id;

    if (!eventId || !event) {
      return new Response("Missing event id/type", { status: 400 });
    }

    const { duplicate } = await ctx.runMutation(
      internal.checkout.recordWebhookEvent,
      {
        eventId,
        event,
        asaasPaymentId,
      }
    );

    if (duplicate) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!asaasPaymentId) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      await ctx.runMutation(internal.checkout.markPaidByAsaasId, {
        asaasPaymentId,
      });
    } else if (
      event === "PAYMENT_DELETED" ||
      event === "PAYMENT_REFUNDED" ||
      event === "PAYMENT_CHARGEBACK_REQUESTED" ||
      event === "PAYMENT_OVERDUE"
    ) {
      await ctx.runMutation(internal.checkout.cancelByAsaasId, {
        asaasPaymentId,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
