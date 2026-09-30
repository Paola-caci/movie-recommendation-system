from fastapi import FastAPI, HTTPException, Path, Query
from fastapi.middleware.cors import CORSMiddleware
from recommender import MovieRecommender

app = FastAPI(title="Movie Recommendation API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # frontend
    allow_methods=["*"],
    allow_headers=["*"]
)

# Inicjalizo Recommender
recommender = MovieRecommender()
recommender.load_data("./data")
recommender.preprocess_data()

# --- Endpoints ---
@app.get("/movies")
def get_movies(q: str = "popular", page: int = 1, per_page: int = 12):
    if q == "popular":
        movies = recommender.get_popular_movies(n=100)
    else:
        movies = [
            m for m in recommender.movies_df.to_dict(orient="records")
            if q.lower() in m["title"].lower()
        ]

    total_results = len(movies)
    total_pages = (total_results + per_page - 1) // per_page

    start = (page - 1) * per_page
    end = start + per_page
    results = movies[start:end]

    return {
        "results": results,
        "total_results": total_results,
        "total_pages": total_pages
    }

@app.get("/api/v1/recommend/popular")
def popular_movies(n: int = Query(10, ge=1, le=50)):
    recs = recommender.get_popular_movies(n)
    return {"success": True, "algorithm": "popular", "count": len(recs), "recommendations": recs}

@app.get("/api/v1/recommend/hybrid/{user_id}")
def hybrid_recommend(user_id: int = Path(..., ge=1), n: int = Query(10, ge=1, le=50)):
    try:
        recs = recommender.get_hybrid_recommendations(user_id, n)
        return {"success": True, "algorithm": "hybrid", "user_id": user_id, "count": len(recs), "recommendations": recs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/recommend/tag-based/{user_id}")
def tag_based_recommend(user_id: int = Path(..., ge=1), n: int = Query(10, ge=1, le=50)):
    try:
        recs = recommender.get_tag_based_recommendations(user_id, n)
        return {"success": True, "algorithm": "tag-based", "user_id": user_id, "count": len(recs), "recommendations": recs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/movies/{movie_id}/similar")
def similar_movies(movie_id: int = Path(..., ge=1), n: int = Query(5, ge=1, le=20)):
    recs = recommender.get_content_recommendations(movie_id, n)
    return {"success": True, "movie_id": movie_id, "count": len(recs), "similar_movies": recs}

# -------------------------
# Endpoint për Popular Tags
# -------------------------
@app.get("/api/v1/popular-tags")
def popular_tags(limit: int = 15):
    """
    Return top popular tags with counts
    """
    if recommender.tags_df is None or recommender.tags_df.empty:
        return {"popular_tags": []}

    tags_list = recommender.get_popular_tags(limit)
    return {"popular_tags": tags_list}
