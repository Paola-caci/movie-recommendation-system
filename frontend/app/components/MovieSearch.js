"use client";

import { useState, useEffect } from "react";

export default function MovieSearch({ initialQuery = "", onResults }) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";


  // Debounce 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results SPA-style
  useEffect(() => {
    if (!debouncedQuery) return;

    const fetchMovies = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/movies?q=${encodeURIComponent(debouncedQuery)}&page=1`
        );
        const data = await res.json();
        onResults?.(data.results || [], data.total_results || 0, data.total_pages || 1);
      } catch (err) {
        console.error("Movie fetch error:", err);
        onResults?.([], 0, 1);
      }
    };

    fetchMovies();
  }, [debouncedQuery, onResults]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setDebouncedQuery(query.trim());
  };

  const quickSearch = (term) => {
    setQuery(term);
    setDebouncedQuery(term);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, genres, keywords..."
          className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 text-lg
                     focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-3 top-3 bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-lg
                     hover:bg-yellow-300 transition-colors disabled:opacity-50"
        >
          Search
        </button>
      </div>

      {/* Quick search buttons */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {["Avengers", "Star Wars", "Harry Potter", "Marvel", "DC", "Comedy", "Action"].map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => quickSearch(term)}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300"
          >
            {term}
          </button>
        ))}
      </div>
    </form>
  );
}
