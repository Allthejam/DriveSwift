import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { instructorId, email, returnUrl } = body;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: "Stripe API Key not yet set in environment variables (STRIPE_SECRET_KEY). Simulated Stripe Connect flow active."
      });
    }

    // Call Stripe API to create Express Connect Account Link
    const response = await fetch("https://api.stripe.com/v1/accounts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        type: "express",
        country: "GB",
        email: email || "",
        "capabilities[card_payments][requested]": "true",
        "capabilities[transfers][requested]": "true",
      }),
    });

    const accountData = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: accountData.error?.message || "Stripe account creation failed" }, { status: 400 });
    }

    // Generate Account Link for onboarding
    const linkResponse = await fetch("https://api.stripe.com/v1/account_links", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        account: accountData.id,
        refresh_url: returnUrl || "http://localhost:9005/profile",
        return_url: returnUrl || "http://localhost:9005/profile",
        type: "account_onboarding",
      }),
    });

    const linkData = await linkResponse.json();

    return NextResponse.json({
      success: true,
      configured: true,
      accountId: accountData.id,
      url: linkData.url,
    });
  } catch (err: any) {
    console.error("Stripe Connect API Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
