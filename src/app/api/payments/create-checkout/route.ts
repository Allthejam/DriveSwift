import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pupilId, instructorId, instructorStripeAccountId, amount, description, successUrl, cancelUrl } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: "Stripe API Key not yet configured in environment variables. Simulated checkout active."
      });
    }

    // Amount in pence (GBP)
    const amountInPence = Math.round(amount * 100);

    const params = new URLSearchParams({
      "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": "gbp",
      "line_items[0][price_data][product_data][name]": description || "Driving Lesson Booking",
      "line_items[0][price_data][unit_amount]": amountInPence.toString(),
      "line_items[0][quantity]": "1",
      "mode": "payment",
      "success_url": successUrl || "http://localhost:9005/pupil-dashboard?payment=success",
      "cancel_url": cancelUrl || "http://localhost:9005/pupil-dashboard?payment=cancelled",
    });

    // If instructor has a connected Stripe account, direct funds to them
    if (instructorStripeAccountId) {
      params.append("payment_intent_data[transfer_data][destination]", instructorStripeAccountId);
      // Optional: Add platform application fee (e.g. 1% platform fee)
      // params.append("payment_intent_data[application_fee_amount]", Math.round(amountInPence * 0.01).toString());
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const sessionData = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: sessionData.error?.message || "Checkout session creation failed" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      configured: true,
      sessionId: sessionData.id,
      url: sessionData.url,
    });
  } catch (err: any) {
    console.error("Stripe Checkout Session Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
