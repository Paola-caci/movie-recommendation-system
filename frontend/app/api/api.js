export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// --- Popular Movies ---
export async function getPopularMovies() {
  const res = await fetch(`${API_URL}/api/v1/recommend/popular`);
  const data = await res.json();
  return { recommendations: data.recommendations || [] };
}

// --- Hybrid Recommendations ---
export async function getHybridRecommendations(userId = 1) {
  const res = await fetch(`${API_URL}/api/v1/recommend/hybrid/${userId}`);
  const data = await res.json();
  return { recommendations: data.recommendations || [] };
}

// --- Tag-Based Recommendations ---
export async function getTagBasedRecommendations(userId = 1) {
  const res = await fetch(`${API_URL}/api/v1/recommend/tag-based/${userId}`);
  const data = await res.json();
  return { recommendations: data.recommendations || [] };
}

// --- Popular Tags ---
export const getPopularTags = async (limit = 15) => {
  const res = await fetch(`${API_URL}/api/v1/popular-tags?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch popular tags");
  return await res.json();
};


// --- Similar Movies ---
export async function getSimilarMovies(movieId, limit = 5) {
  const res = await fetch(`${API_URL}/api/v1/movies/${movieId}/similar?n=${limit}`);
  const data = await res.json();
  return { similar_movies: data.similar_movies || [] };
}
