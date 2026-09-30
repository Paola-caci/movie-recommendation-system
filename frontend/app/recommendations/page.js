// app/recommendations/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { getPopularTags, getSimilarMovies, API_URL } from "../api/api.js";
import MovieCard from "../components/MovieCard";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [popularTags, setPopularTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [userId, setUserId] = useState(3);
  const [algorithm, setAlgorithm] = useState("popular");
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "";

      switch (algorithm) {
        case "hybrid":
          url = `${API_URL}/api/v1/recommend/hybrid/${userId}`;
          break;
        case "tag-based":
          url = `${API_URL}/api/v1/recommend/tag-based/${userId}`;
          break;
        case "popular":
        default:
          url = `${API_URL}/api/v1/recommend/popular`;
          break;
      }

      console.log("Fetching from:", url);

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      setRecommendations(data.recommendations || []);

      // Merr popular tags nga backend
      const tagsData = await getPopularTags(15);
      setPopularTags(tagsData.popular_tags || []);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Failed to load data: ${err.message}`);
      setRecommendations([]);
      setPopularTags([]);
    } finally {
      setLoading(false);
    }
  }, [userId, algorithm]);

  // --- Ngarko kur ndryshon userId ose algoritmi ---
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- Ngarko filmat e ngjashëm kur klikohet një film ---
  useEffect(() => {
    if (selectedMovieId) fetchSimilarMovies(selectedMovieId);
  }, [selectedMovieId]);

  const fetchSimilarMovies = async (movieId) => {
    try {
      const data = await getSimilarMovies(movieId, 5);
      setSimilarMovies(data.similar_movies || []);
    } catch (err) {
      console.error("Error fetching similar movies:", err);
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTags(selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    );
  };

  const handleAlgorithmChange = (newAlgorithm) => {
    setAlgorithm(newAlgorithm);
    setSelectedMovieId(null);
    setSimilarMovies([]);
  };

  const handleMovieClick = (movieId) => setSelectedMovieId(movieId);

  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case "hybrid":
        return "Kombinon TF-IDF (për zhanre/tag-e) me SVD për rekomandime më të sakta";
      case "tag-based":
        return "Përdor tag-et e filmave dhe preferencat tuaja për të gjetur filmat më të ngjashëm";
      case "popular":
      default:
        return "Rekomandon filmat më të popullarë bazuar në numrin dhe mesataren e vlerësimeve";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            🎬 Movie Recommendation System
          </h1>
          <p className="text-gray-400">Discover your next favorite movie with AI-powered recommendations</p>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Controls */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Controls</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">User ID</label>
                  <input
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Algorithm</label>
                  <select
                    value={algorithm}
                    onChange={(e) => handleAlgorithmChange(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="popular">🎯 Popular Movies</option>
                    <option value="hybrid">🤖 Hybrid Recommendations</option>
                    <option value="tag-based">🏷️ Tag-Based</option>
                  </select>
                </div>

                <button
                  onClick={fetchAllData}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-4 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Refresh Data"}
                </button>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Popular Tags</h3>
                <span className="text-sm text-gray-400">{popularTags.length} tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tagObj, index) => (
                  <button
                    key={index}
                    onClick={() => handleTagClick(tagObj.tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tagObj.tag)
                        ? "bg-yellow-400 text-gray-900 font-bold"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      }`}
                    title={`Used ${tagObj.count || 0} times`}
                  >
                    #{tagObj.tag} ({tagObj.count})
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Algorithm Info */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-xl mb-8 border border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {algorithm === "hybrid" ? "🤖 Hybrid Recommendations" :
                      algorithm === "tag-based" ? "🏷️ Tag-Based Recommendations" :
                        "🎯 Popular Movies"}
                  </h2>
                  <p className="text-gray-300">{getAlgorithmDescription()}</p>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 text-3xl font-bold">{recommendations.length}</div>
                  <div className="text-gray-400 text-sm">movies recommended</div>
                </div>
              </div>
            </div>

            {/* Recommendations Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                <p className="text-gray-400 mt-4">Loading recommendations from backend...</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendations.map((movie) => (
                  <MovieCard
                    key={movie.movieId}
                    movie={movie}
                    onClick={() => handleMovieClick(movie.movieId)}
                    isSelected={selectedMovieId === movie.movieId}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
                <div className="text-5xl mb-4">🎬</div>
                <h3 className="text-2xl font-bold text-white mb-3">No Recommendations Found</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {error ? "Could not connect to the recommendation server." : "Try changing the user ID or algorithm."}
                </p>
                <button
                  onClick={() => handleAlgorithmChange("popular")}
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Show Popular Movies
                </button>
              </div>
            )}

            {/* Similar Movies */}
            {selectedMovieId && similarMovies.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-white mb-6">🎭 Movies Similar to Selected Film</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarMovies.map((movie) => (
                    <div
                      key={movie.movieId}
                      className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                      onClick={() => handleMovieClick(movie.movieId)}
                    >
                      <h4 className="font-bold text-white">{movie.title}</h4>
                      <p className="text-gray-400 text-sm mb-2">{movie.genres}</p>
                      {movie.similarity_score && (
                        <p className="text-green-400 text-sm">
                          Similarity: {(movie.similarity_score * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Connected to: {API_URL}</p>
          <p className="mt-2">Powered by FastAPI + Scikit-learn • Next.js Frontend</p>
        </div>
      </div>
    </div>
  );
}
