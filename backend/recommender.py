import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from scipy.sparse import csr_matrix


class MovieRecommender:

    def __init__(self):
        # DataFrames
        self.movies_df = None
        self.ratings_df = None
        self.tags_df = None

        # Content-based
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.movie_similarity = None

        # Collaborative
        self.svd_model = None
        self.user_factors = None
        self.item_factors = None
        self.sparse_user_item = None
        self.user_to_idx = None
        self.movie_to_idx = None

    # ------------------------------
    # Load CSV Data
    # ------------------------------
    def load_data(self, data_path: str = "./data"):
        self.movies_df = pd.read_csv(f"{data_path}/movies.csv")
        self.ratings_df = pd.read_csv(f"{data_path}/ratings.csv")
        self.tags_df = pd.read_csv(f"{data_path}/tags.csv")
        print("✅ Data loaded")

    # ------------------------------
    # Preprocess Collaborative
    # ------------------------------
    def preprocess_data(self):
        users = self.ratings_df["userId"].unique()
        movies = self.ratings_df["movieId"].unique()

        self.user_to_idx = {u: i for i, u in enumerate(users)}
        self.movie_to_idx = {m: i for i, m in enumerate(movies)}

        user_idx = self.ratings_df["userId"].map(self.user_to_idx)
        movie_idx = self.ratings_df["movieId"].map(self.movie_to_idx)

        self.sparse_user_item = csr_matrix(
            (self.ratings_df["rating"], (user_idx, movie_idx)),
            shape=(len(users), len(movies))
        )

    # ------------------------------
    # Content-Based
    # ------------------------------
    def train_content_based(self):
        texts = []

        for _, m in self.movies_df.iterrows():
            tags = self.tags_df[self.tags_df.movieId == m.movieId]["tag"].tolist()
            texts.append(m.genres + " " + " ".join(tags))

        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000)
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(texts)
        self.movie_similarity = cosine_similarity(self.tfidf_matrix)

    # ------------------------------
    # Collaborative
    # ------------------------------
    def train_collaborative(self, n_components: int = 20):
        if self.sparse_user_item is None:
            self.preprocess_data()

        n_components = min(n_components, min(self.sparse_user_item.shape) - 1)
        self.svd_model = TruncatedSVD(n_components=n_components, random_state=42)
        self.user_factors = self.svd_model.fit_transform(self.sparse_user_item)
        self.item_factors = self.svd_model.components_.T

    # ------------------------------
    # Popular Movies
    # ------------------------------
    def get_popular_movies(self, n: int = 10):
        stats = self.ratings_df.groupby("movieId").agg(
            count=("rating", "count"),
            mean=("rating", "mean")
        ).reset_index()

        popular = stats.sort_values(["count", "mean"], ascending=False).head(n)
        return popular.merge(self.movies_df, on="movieId").to_dict(orient="records")

    # ------------------------------
    # Popular Tags
    # ------------------------------
    def get_popular_tags(self, limit: int = 15):
      tag_counts = self.tags_df["tag"].value_counts().head(limit)
      df = tag_counts.reset_index()
      df.columns = ["tag", "count"]  
      return df.to_dict(orient="records")

    # ------------------------------
    # Tag-Based Recommendations
    # ------------------------------
    def get_tag_based_recommendations(self, user_id: int, n: int = 10):
        if self.tags_df is None or self.movies_df is None or self.ratings_df is None:
            return []

        user_tags = self.tags_df[self.tags_df.userId == user_id]

        # fallback: collaborative
        if user_tags.empty:
            return self.get_collaborative_recommendations(user_id, n)

        seen_movies = set(self.ratings_df[self.ratings_df.userId == user_id].movieId)
        tag_weights = user_tags["tag"].value_counts().to_dict()
        movie_scores = {}

        for _, row in self.tags_df.iterrows():
            movie_id = row["movieId"]
            tag = row["tag"]

            if movie_id in seen_movies:
                continue

            if tag in tag_weights:
                movie_scores[movie_id] = movie_scores.get(movie_id, 0) + tag_weights[tag]

        if not movie_scores:
            return self.get_collaborative_recommendations(user_id, n)

        sorted_movies = sorted(movie_scores.items(), key=lambda x: x[1], reverse=True)
        results = []

        for movie_id, score in sorted_movies[:n]:
            movie = self.movies_df[self.movies_df.movieId == movie_id]
            if not movie.empty:
                m = movie.iloc[0]
                results.append({
                    "movieId": int(movie_id),
                    "title": m.title,
                    "genres": m.genres,
                    "score": float(score),
                    "reason": "based on your tags"
                })

        return results

    # ------------------------------
    # Collaborative Recommendations
    # ------------------------------
    def get_collaborative_recommendations(self, user_id: int, n: int = 10):
        if self.user_factors is None or self.item_factors is None:
            self.train_collaborative()

        if user_id not in self.user_to_idx:
            return self.get_popular_movies(n)

        uidx = self.user_to_idx[user_id]
        scores = np.dot(self.user_factors[uidx], self.item_factors.T)
        seen_movies = set(self.ratings_df[self.ratings_df.userId == user_id].movieId)

        recs = []
        for movie_id, midx in self.movie_to_idx.items():
            if movie_id not in seen_movies:
                movie = self.movies_df[self.movies_df.movieId == movie_id].iloc[0]
                recs.append({
                    "movieId": int(movie_id),
                    "title": movie.title,
                    "genres": movie.genres,
                    "predicted_rating": float(scores[midx])
                })

        return sorted(recs, key=lambda x: x["predicted_rating"], reverse=True)[:n]

    # ------------------------------
    # Hybrid Recommendations
    # ------------------------------
    def get_hybrid_recommendations(self, user_id: int, n: int = 10):
        # 1️⃣ Collaborative
        collab = self.get_collaborative_recommendations(user_id, n*2)
        collab_dict = {r["movieId"]: r for r in collab}

        # 2️⃣ Tag-based
        tag_based = self.get_tag_based_recommendations(user_id, n*2)
        tag_dict = {r["movieId"]: r for r in tag_based}

        # 3️⃣ Combine scores
        combined = {}
        for mid, r in collab_dict.items():
            combined[mid] = {
                "movieId": mid,
                "title": r["title"],
                "genres": r["genres"],
                "score": r.get("predicted_rating", 0) * 0.6,
                "type": "collaborative"
            }

        for mid, r in tag_dict.items():
            if mid in combined:
                combined[mid]["score"] += r.get("score", 0) * 0.4
                combined[mid]["type"] = "hybrid"
            else:
                combined[mid] = {
                    "movieId": mid,
                    "title": r["title"],
                    "genres": r["genres"],
                    "score": r.get("score", 0) * 0.4,
                    "type": "content"
                }

        seen_movies = set(self.ratings_df[self.ratings_df.userId == user_id].movieId)
        for m in seen_movies:
            combined.pop(m, None)

        return sorted(combined.values(), key=lambda x: x["score"], reverse=True)[:n]

    # ------------------------------
    # Content-Based Recommendations
    # ------------------------------
    def get_content_recommendations(self, movie_id: int, n: int = 5):
        # Siguro që modeli content-based të jetë trajnuar
        if self.movie_similarity is None:
            self.train_content_based()

        # Kontrollo nëse movie_id ekziston
        if movie_id not in self.movies_df.movieId.values:
            print(f" Movie ID {movie_id} nuk ekziston në movies_df")
            return []

        idx = self.movies_df[self.movies_df.movieId == movie_id].index[0]
        scores = list(enumerate(self.movie_similarity[idx]))
        scores = sorted(scores, key=lambda x: x[1], reverse=True)[1:n + 1]

        return [{
            "movieId": int(self.movies_df.iloc[i].movieId),
            "title": self.movies_df.iloc[i].title,
            "genres": self.movies_df.iloc[i].genres,
            "similarity_score": float(score)
        } for i, score in scores]

    # ------------------------------
    # Helpers
    # ------------------------------
    def _min_max_normalize(self, values):
        if not values:
            return []

        min_v, max_v = min(values), max(values)
        if max_v - min_v == 0:
            return [0.0] * len(values)

        return [(v - min_v) / (max_v - min_v) for v in values]
