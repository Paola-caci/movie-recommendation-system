"use client";

const PLACEHOLDER_COLORS = [
  "bg-gradient-to-br from-blue-900/30 to-blue-700/20",
  "bg-gradient-to-br from-purple-900/30 to-purple-700/20",
  "bg-gradient-to-br from-red-900/30 to-red-700/20",
  "bg-gradient-to-br from-green-900/30 to-green-700/20",
];

export default function MovieCard({ movie, onClick, isSelected = false }) {
  if (!movie) return null;

  // -----------------------------
  // Background color (stable)
  // -----------------------------
  const id = movie.movieId ?? movie.id ?? 0;
  const colorIndex = typeof id === "number" ? id % PLACEHOLDER_COLORS.length : 0;
  const bgColor = PLACEHOLDER_COLORS[colorIndex];

  // -----------------------------
  // Year from title
  // -----------------------------
  const yearMatch = typeof movie.title === "string" ? movie.title.match(/\((\d{4})\)/) : null;
  const year = yearMatch ? yearMatch[1] : "N/A";

  // -----------------------------
  // Genres
  // -----------------------------
  const genres = typeof movie.genres === "string" ? movie.genres.split("|").slice(0, 2) : [];

  // -----------------------------
  // Score handling
  // -----------------------------
  const rawScore = Number(movie.score) || Number(movie.similarity_score) || Number(movie.predicted_rating) || 0;
  const displayScore = Math.max(0, Math.min(rawScore, 1));

  // -----------------------------
  // Ratings (optional)
  // -----------------------------
  const rating = typeof movie.rating_mean === "number" ? movie.rating_mean : 0;
  const ratingCount = typeof movie.rating_count === "number" ? movie.rating_count : 0;

  return (
    <div
      className={`rounded-xl overflow-hidden shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col border-2 ${
        isSelected ? "border-yellow-400" : "border-gray-700 hover:border-gray-600"
      }`}
      onClick={() => onClick?.(id)}
    >
      {/* Poster Placeholder */}
      <div className={`relative h-48 w-full ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-4xl mb-2">🎬</div>
          <p className="text-white/80 text-sm font-medium">MOVIE</p>
        </div>

        {/* Score badge */}
        {displayScore > 0 && (
          <div className="absolute top-3 right-3 bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
            <span className="text-yellow-400 font-bold text-sm">
              {(displayScore * 10).toFixed(1)}
            </span>
          </div>
        )}

        {/* Rating badge */}
        {rating > 0 && (
          <div className="absolute bottom-3 left-3 bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
            <span className="text-yellow-400 mr-1 text-xs">★</span>
            <span className="text-white font-bold text-xs">{rating.toFixed(1)}</span>
            {ratingCount > 0 && (
              <span className="text-gray-400 text-xs ml-2">({ratingCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Movie info */}
      <div className="p-4 bg-gray-800 flex-1 flex flex-col">
        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
          {movie.title || "Untitled movie"}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-400 text-sm">{year}</span>
          {movie.type && (
            <span className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">{movie.type}</span>
          )}
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {genres.map((genre, index) => (
                <span key={`${genre}-${index}`} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Extra info */}
        <div className="mt-auto pt-3 border-t border-gray-700">
          {typeof movie.similarity_score === "number" && (
            <p className="text-green-400 text-sm">
              Similarity: {(movie.similarity_score * 100).toFixed(1)}%
            </p>
          )}

          {typeof movie.predicted_rating === "number" && (
            <p className="text-blue-400 text-sm">
              Predicted rating: {movie.predicted_rating.toFixed(1)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
