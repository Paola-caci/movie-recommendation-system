// app/page.js
import Link from "next/link";
import MovieCard from "./components/MovieCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const metadata = {
  title: "NextMovies | Discover Your Next Favorite Film",
  description: "Explore movies, get personalized recommendations, and discover new films with NextMovies.",
};

export default async function HomePage() {
  // -----------------------------
  // Fetch featured movies nga API
  // -----------------------------
  let featuredMovies = [];
  try {
    const res = await fetch(`${API_BASE_URL}/movies?limit=6`, {
      next: { revalidate: 60 }, // cache 1 minut
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();
    featuredMovies = data.results || [];
  } catch (err) {
    console.error("Failed to fetch movies:", err);
    // fallback statik
    featuredMovies = [
      { id: 1, title: "Inception", poster_path: null, release_date: "2010-07-16", vote_average: 8.3, overview: "A thief who steals corporate secrets through dream-sharing technology." },
      { id: 2, title: "The Dark Knight", poster_path: null, release_date: "2008-07-18", vote_average: 8.5, overview: "Batman faces the Joker, a criminal mastermind seeking to undermine order." },
      { id: 3, title: "Parasite", poster_path: null, release_date: "2019-05-30", vote_average: 8.5, overview: "A poor family schemes to become employed by a wealthy family." },
    ];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-6">
          🎬 Welcome to NextMovies
        </h1>
        <p className="text-gray-300 text-xl max-w-3xl mx-auto mb-8">
          Discover movies, explore details, and get personalized recommendations —
          all powered by Next.js and AI-driven algorithms.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/movies"
            className="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-yellow-300 transition-colors text-lg"
          >
            Browse Movies
          </Link>
          <Link
            href="/recommendations"
            className="bg-gray-800 text-white font-bold px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors text-lg border border-gray-700"
          >
            Get Recommendations
          </Link>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Featured Movies</h2>
          <Link
            href="/movies"
            className="text-yellow-400 hover:text-yellow-300 font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredMovies.map(movie => (
            <MovieCard key={movie.id || movie.movieId} movie={movie} />
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Why Choose NextMovies?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 text-center">
            <div className="text-yellow-400 text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered Recommendations</h3>
            <p className="text-gray-400">
              Personalized movie suggestions using collaborative filtering and SVD to predict what you will love.
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 text-center">
            <div className="text-yellow-400 text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">Content-Based Discovery</h3>
            <p className="text-gray-400">
              Find movies similar to your favorites with TF-IDF and cosine similarity applied on genres and tags.
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 text-center">
            <div className="text-yellow-400 text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-3">Hybrid System</h3>
            <p className="text-gray-400">
              Combines collaborative and tag-based recommendations for accurate suggestions tailored to your taste.
            </p>
          </div>
        </div>
      </section>


      {/* Quick Links */}
      <section className="bg-gray-900/30 p-8 rounded-xl border border-gray-800">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Explore More</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-800/50 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">About NextMovies</h3>
            <p className="text-gray-400 mb-4">
              Learn about our technology stack, mission, and how our recommendation system works.
            </p>
            <Link
              href="/about"
              className="inline-block text-yellow-400 hover:text-yellow-300 font-medium"
            >
              Learn More →
            </Link>
          </div>

          <div className="p-6 bg-gray-800/50 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">How It Works</h3>
            <p className="text-gray-400 mb-4">
              Discover how we use TF-IDF, SVD, and cosine similarity to find movies you will love.
            </p>
            <Link
              href="/recommendations"
              className="inline-block text-yellow-400 hover:text-yellow-300 font-medium"
            >
              See Recommendations →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
