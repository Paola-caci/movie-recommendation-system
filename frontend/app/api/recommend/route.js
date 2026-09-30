import { NextResponse } from "next/server";

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8080";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = Number(searchParams.get("userId") || 1);
    const count = Number(searchParams.get("count") || 10);
    const algorithm = searchParams.get("algorithm") || "hybrid";

    // -----------------------------
    // Map algoritmet te endpoint-et ekzistuese
    // -----------------------------
    let endpoint = "";
    if (algorithm === "popular") {
      endpoint = `/api/v1/recommend/popular?n=${count}`;
    } else if (algorithm === "collaborative") {
      endpoint = `/api/v1/recommend/collaborative/${userId}?n=${count}`;
    } else {
      // hybrid ose default
      endpoint = `/api/v1/recommend/hybrid/${userId}?n=${count}`;
    }

    // -----------------------------
    // Call ML Backend (FastAPI)
    // -----------------------------
    const mlResponse = await fetch(`${ML_API_URL}${endpoint}`);
    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      throw new Error(`ML API failed: ${mlResponse.status} - ${errorText}`);
    }

    const mlData = await mlResponse.json();

    // -----------------------------
    // SUCCESS RESPONSE
    // -----------------------------
    return NextResponse.json({
      success: true,
      userId,
      algorithm: mlData.algorithm || algorithm,
      recommendations: mlData.recommendations
    });

  } catch (error) {
    console.error("❌ Recommendation API error:", error.message);

    // -----------------------------
    // FALLBACK (UI NEVER BREAKS)
    // -----------------------------
    return NextResponse.json({
      success: false,
      algorithm: "fallback",
      message: "Using fallback recommendations",
      recommendations: [
        {
          movieId: 1,
          title: "Toy Story (1995)",
          genres: "Adventure|Animation|Children|Comedy|Fantasy",
          score: 4.5
        },
        {
          movieId: 2,
          title: "Jumanji (1995)",
          genres: "Adventure|Children|Fantasy",
          score: 4.3
        }
      ]
    });
  }
}
