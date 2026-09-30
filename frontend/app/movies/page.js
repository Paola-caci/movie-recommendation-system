"use client";

import { useState, useEffect } from "react";
import MovieSearch from "../components/MovieSearch";
import MovieCard from "../components/MovieCard";

export default function MoviesPage() {
  const [query, setQuery] = useState("popular");
  const [movies, setMovies] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


  // Fetch movies SPA-style
const fetchMovies = async (q, p = 1) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/movies?q=${encodeURIComponent(q)}&page=${p}&per_page=12`
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    console.log("Movies API:", data);

    setMovies(data.results || []);
    setTotalResults(data.total_results || 0);
    setTotalPages(data.total_pages || 1);
    setPage(p);
  } catch (err) {
    console.error("Fetch error:", err);
    setMovies([]);
    setTotalResults(0);
    setTotalPages(1);
  }
};

  const handleSearchResults = (results, total, pages) => {
    setMovies(results);
    setTotalResults(total);
    setTotalPages(pages);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchMovies(query, newPage);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-yellow-400 mb-3">🎬 Discover Movies</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Browse and search movies from our movie database.
        </p>
      </div>

      {/* Search */}
      <MovieSearch initialQuery={query} onResults={handleSearchResults} />

      {/* Movies Grid */}
      {movies.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-white mb-3">No movies found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id ?? movie.movieId} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded ${page === 1 ? "bg-gray-700 text-gray-400" : "bg-gray-800 hover:bg-gray-700"}`}
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-gray-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded ${page === totalPages ? "bg-gray-700 text-gray-400" : "bg-gray-800 hover:bg-gray-700"}`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
