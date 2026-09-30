// app/api/tags/route.js
import { NextResponse } from "next/server";

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8080";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = Number(searchParams.get("userId") || 1);
    const type = searchParams.get("type") || "popular"; 
    // type: popular | user | movie

    let endpoint;

    if (type === "user") {
      endpoint = `${ML_API_URL}/users/${userId}/tags`;
    } else if (type === "movie") {
      const movieId = Number(searchParams.get("movieId") || 1);
      endpoint = `${ML_API_URL}/movies/${movieId}/tags`;
    } else {
      endpoint = `${ML_API_URL}/tags/popular?limit=20`;
    }

    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ML API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      ...data
    });

  } catch (error) {
    console.error("❌ Tags API error:", error.message);

    // -----------------------------
    // FALLBACK DATA (SAFE)
    // -----------------------------
    return NextResponse.json({
      success: false,
      message: "Using fallback tag data",
      popular_tags: [
        { tag: "comedy", count: 1500 },
        { tag: "action", count: 1200 },
        { tag: "drama", count: 1000 },
        { tag: "romance", count: 800 },
        { tag: "sci-fi", count: 600 },
        { tag: "animation", count: 500 },
        { tag: "adventure", count: 450 },
        { tag: "fantasy", count: 400 }
      ],
      user_tags: ["comedy", "action", "funny", "classic"]
    });
  }
}
