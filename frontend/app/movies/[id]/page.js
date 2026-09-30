import Link from "next/link";
import Image from "next/image";
import MovieCard from "@/app/components/MovieCard";

const API_BASE_URL = "http://localhost:8000/api";

export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const res = await fetch(`${API_BASE_URL}/movies/${id}`);
    const movie = await res.json();

    return {
      title: `${movie.title} | NextMovies`,
      description: movie.overview?.substring(0, 160) || "Movie details page",
    };
  } catch {
    return {
      title: "Movie Details | NextMovies",
      description: "Movie details page",
    };
  }
}

export default async function MovieDetails({ params }) {
  const { id } = params;

  try {
    const res = await fetch(`${API_BASE_URL}/movies/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Movie not found");

    const movie = await res.json();

    const runtime = movie.runtime
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : "N/A";

    const releaseDate = movie.releaseDate
      ? new Date(movie.releaseDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Unknown";

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Backdrop */}
        <div className="relative h-72 overflow-hidden">
          <Image
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="w-64 h-96 relative rounded-xl overflow-hidden shadow-xl">
              <Image
                src={movie.posterUrl || "/no-poster.jpg"}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{movie.title}</h1>

              <div className="flex gap-4 text-gray-300 mb-4">
                <span>⭐ {movie.rating}</span>
                <span>{releaseDate}</span>
                <span>{runtime}</span>
              </div>

              <div className="flex gap-2 mb-6">
                {movie.genres?.map((g, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed mb-8">
                {movie.overview}
              </p>

              {/* Cast */}
              {movie.cast?.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-xl font-bold mb-4">Cast</h3>
                  <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {movie.cast.map((c, i) => (
                      <li key={i} className="text-sm text-gray-300">
                        <strong>{c.name}</strong>
                        <br />
                        <span className="text-gray-400">{c.character}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {movie.recommendations?.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {movie.recommendations.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </div>
          )}

          {/* Back */}
          <div className="mt-12 pb-12">
            <Link
              href="/movies"
              className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
            >
              ← Back to Movies
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Movie not found
          </h2>
          <Link href="/movies" className="text-yellow-400">
            ← Back to Movies
          </Link>
        </div>
      </div>
    );
  }
}
