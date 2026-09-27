import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, listId, apiKey } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const brevoApiKey = apiKey || process.env.BREVO_API_KEY;

    if (!brevoApiKey) {
      return NextResponse.json({
        success: true,
        brevoSynced: false,
        message: "Subscriber recorded locally. Brevo API key not yet configured."
      });
    }

    // Call Brevo v3 Contacts API
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        email,
        listIds: listId ? [parseInt(listId)] : [],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn("Brevo API warning:", errorData);
      return NextResponse.json({
        success: true,
        brevoSynced: false,
        error: errorData.message || "Brevo sync warning"
      });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      brevoSynced: true,
      data
    });
  } catch (err: any) {
    console.error("Brevo API endpoint error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
