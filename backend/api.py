# # ml-backend/scripts/api.py
# from fastapi import FastAPI, HTTPException, Query, Path
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel, Field
# from typing import List, Optional, Dict, Any
# from contextlib import asynccontextmanager
# import uvicorn
# import sys
# import os

# # Shto folderin scripts në path
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# try:
#     from recommender import MovieRecommender
#     RECOMMENDER_AVAILABLE = True
# except ImportError:
#     print("⚠️  MovieRecommender not available")
#     RECOMMENDER_AVAILABLE = False

# # ==================== PYDANTIC MODELS ====================

# class Movie(BaseModel):
#     """Model për një film"""
#     movieId: int
#     title: str
#     genres: str

# class MovieWithScore(Movie):
#     """Model për film me score"""
#     score: float = Field(..., description="Recommendation score")
#     type: Optional[str] = Field(None, description="Recommendation type")

# class MovieWithSimilarity(Movie):
#     """Model për film me similarity score"""
#     similarity_score: float

# class MovieWithRating(Movie):
#     """Model për film me rating info"""
#     rating_mean: float
#     rating_count: int

# class RecommendationRequest(BaseModel):
#     """Request për rekomandime"""
#     user_id: int = Field(..., ge=1, description="User ID")
#     n_recommendations: int = Field(10, ge=1, le=50, description="Number of recommendations")
#     algorithm: str = Field("hybrid", description="Algorithm: hybrid, collaborative, content, popular")

# class RecommendationResponse(BaseModel):
#     """Response për rekomandime"""
#     success: bool
#     user_id: Optional[int] = None
#     algorithm: str
#     count: int
#     recommendations: List[Dict[str, Any]]
#     message: Optional[str] = None

# class HealthResponse(BaseModel):
#     """Health check response"""
#     status: str
#     service: str
#     version: str
#     models_loaded: bool
#     data_stats: Optional[Dict[str, int]] = None

# class ErrorResponse(BaseModel):
#     """Error response"""
#     success: bool = False
#     error: str
#     detail: Optional[str] = None

# # ==================== LIFESPAN MANAGEMENT ====================

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """Manage application startup and shutdown"""
#     print("=" * 60)
#     print("🎬 MOVIE RECOMMENDATION API")
#     print("=" * 60)
    
#     # Startup
#     if RECOMMENDER_AVAILABLE:
#         app.state.recommender = MovieRecommender()
        
#         try:
#             # Provo të ngarkosh modelet e ruajtur
#             model_path = "../models"
#             if os.path.exists(model_path):
#                 print("📂 Loading saved models...")
#                 # Nëse ke metodë save/load në recommender
#                 # app.state.recommender.load_models(model_path)
            
#             # Ngarko të dhënat
#             print("📥 Loading data...")
#             app.state.recommender.load_data("../data")
            
#             print("🔄 Preprocessing data...")
#             app.state.recommender.preprocess_data()
            
#             print("🧠 Training models...")
#             app.state.recommender.train_hybrid()
            
#             print("✅ Models ready!")
            
#             # Printo statistika
#             if app.state.recommender.movies_df is not None:
#                 print(f"📊 Movies: {len(app.state.recommender.movies_df)}")
#             if app.state.recommender.ratings_df is not None:
#                 print(f"⭐ Ratings: {len(app.state.recommender.ratings_df)}")
            
#         except Exception as e:
#             print(f"⚠️  Error during startup: {e}")
#             print("Using sample data...")
#     else:
#         app.state.recommender = None
#         print("⚠️  Running in mock mode")
    
#     print("=" * 60)
#     print("📚 Docs: http://localhost:8000/docs")
#     print("=" * 60)
    
#     yield
    
#     # Shutdown
#     print("\n👋 Shutting down...")

# # ==================== CREATE APP ====================

# app = FastAPI(
#     title="🎬 Movie Recommendation API",
#     description="Advanced movie recommendation system using hybrid ML algorithms",
#     version="2.1.0",
#     lifespan=lifespan,
#     docs_url="/docs",
#     redoc_url="/redoc"
# )

# # CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ==================== HELPER FUNCTIONS ====================

# def get_recommender():
#     """Get recommender instance"""
#     if not RECOMMENDER_AVAILABLE or app.state.recommender is None:
#         return None
#     return app.state.recommender

# def create_mock_recommendations(n: int = 5):
#     """Create mock recommendations"""
#     return [
#         {"movieId": 1, "title": "Toy Story (1995)", "genres": "Animation|Comedy", "score": 0.95},
#         {"movieId": 2, "title": "Jumanji (1995)", "genres": "Adventure|Fantasy", "score": 0.88},
#         {"movieId": 3, "title": "Heat (1995)", "genres": "Crime|Thriller", "score": 0.82},
#         {"movieId": 4, "title": "GoldenEye (1995)", "genres": "Action|Adventure", "score": 0.79},
#         {"movieId": 5, "title": "Sabrina (1995)", "genres": "Comedy|Romance", "score": 0.75},
#     ][:n]

# # ==================== ROUTES ====================

# @app.get("/", tags=["Info"])
# async def root():
#     """Welcome endpoint"""
#     return {
#         "message": "🎬 Movie Recommendation API",
#         "version": "2.1.0",
#         "status": "online",
#         "documentation": "/docs",
#         "endpoints": {
#             "health": "/health",
#             "recommendations": {
#                 "hybrid": "/api/v1/recommend/hybrid/{user_id}",
#                 "collaborative": "/api/v1/recommend/collaborative/{user_id}",
#                 "content": "/api/v1/recommend/content/{user_id}",
#                 "popular": "/api/v1/recommend/popular"
#             },
#             "movies": {
#                 "similar": "/api/v1/movies/{movie_id}/similar",
#                 "details": "/api/v1/movies/{movie_id}"
#             }
#         }
#     }

# @app.get("/health", response_model=HealthResponse, tags=["Info"])
# async def health_check():
#     """Health check endpoint"""
#     recommender = get_recommender()
    
#     data_stats = None
#     if recommender:
#         data_stats = {
#             "movies": len(recommender.movies_df) if recommender.movies_df is not None else 0,
#             "ratings": len(recommender.ratings_df) if recommender.ratings_df is not None else 0,
#             "tags": len(recommender.tags_df) if recommender.tags_df is not None else 0
#         }
    
#     return {
#         "status": "healthy",
#         "service": "movie-recommendation",
#         "version": "2.1.0",
#         "models_loaded": recommender is not None,
#         "data_stats": data_stats
#     }

# # ==================== RECOMMENDATION ENDPOINTS ====================

# @app.get("/api/v1/recommend/hybrid/{user_id}", 
#          response_model=RecommendationResponse,
#          tags=["Recommendations"])
# async def get_hybrid_recommendations(
#     user_id: int = Path(..., ge=1, description="User ID"),
#     n: int = Query(10, ge=1, le=50, description="Number of recommendations")
# ):
#     """
#     Get hybrid recommendations for a user.
#     Combines collaborative filtering and content-based filtering.
#     """
#     try:
#         recommender = get_recommender()
        
#         if not recommender:
#             return {
#                 "success": True,
#                 "user_id": user_id,
#                 "algorithm": "hybrid (mock)",
#                 "count": n,
#                 "recommendations": create_mock_recommendations(n),
#                 "message": "Using mock data"
#             }
        
#         recommendations = recommender.get_hybrid_recommendations(user_id, n)
        
#         return {
#             "success": True,
#             "user_id": user_id,
#             "algorithm": "hybrid",
#             "count": len(recommendations),
#             "recommendations": recommendations
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/api/v1/recommend/collaborative/{user_id}",
#          response_model=RecommendationResponse,
#          tags=["Recommendations"])
# async def get_collaborative_recommendations(
#     user_id: int = Path(..., ge=1, description="User ID"),
#     n: int = Query(10, ge=1, le=50, description="Number of recommendations")
# ):
#     """
#     Get collaborative filtering recommendations.
#     Based on similar users' preferences.
#     """
#     try:
#         recommender = get_recommender()
        
#         if not recommender:
#             return {
#                 "success": True,
#                 "user_id": user_id,
#                 "algorithm": "collaborative (mock)",
#                 "count": n,
#                 "recommendations": create_mock_recommendations(n)
#             }
        
#         recommendations = recommender.get_collaborative_recommendations(user_id, n)
        
#         return {
#             "success": True,
#             "user_id": user_id,
#             "algorithm": "collaborative",
#             "count": len(recommendations),
#             "recommendations": recommendations
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/api/v1/recommend/popular",
#          response_model=RecommendationResponse,
#          tags=["Recommendations"])
# async def get_popular_movies(
#     n: int = Query(10, ge=1, le=50, description="Number of movies")
# ):
#     """
#     Get most popular movies.
#     Based on rating count and average rating.
#     """
#     try:
#         recommender = get_recommender()
        
#         if not recommender:
#             mock_popular = [
#                 {"movieId": 1, "title": "Shawshank Redemption (1994)", "genres": "Drama", "score": 4.5},
#                 {"movieId": 2, "title": "The Godfather (1972)", "genres": "Crime|Drama", "score": 4.4},
#                 {"movieId": 3, "title": "Dark Knight (2008)", "genres": "Action|Drama", "score": 4.3},
#             ]
#             return {
#                 "success": True,
#                 "algorithm": "popular (mock)",
#                 "count": len(mock_popular),
#                 "recommendations": mock_popular[:n]
#             }
        
#         recommendations = recommender.get_popular_movies(n)
        
#         return {
#             "success": True,
#             "algorithm": "popular",
#             "count": len(recommendations),
#             "recommendations": recommendations
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # ==================== MOVIE ENDPOINTS ====================

# @app.get("/api/v1/movies/{movie_id}/similar",
#          tags=["Movies"])
# async def get_similar_movies(
#     movie_id: int = Path(..., ge=1, description="Movie ID"),
#     n: int = Query(5, ge=1, le=20, description="Number of similar movies")
# ):
#     """
#     Get movies similar to the specified movie.
#     Based on content similarity (genres, tags).
#     """
#     try:
#         recommender = get_recommender()
        
#         if not recommender:
#             return {
#                 "success": True,
#                 "movie_id": movie_id,
#                 "similar_movies": create_mock_recommendations(n),
#                 "message": "Using mock data"
#             }
        
#         similar = recommender.get_content_recommendations(movie_id, n)
        
#         return {
#             "success": True,
#             "movie_id": movie_id,
#             "count": len(similar),
#             "similar_movies": similar
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/api/v1/movies/{movie_id}",
#          tags=["Movies"])
# async def get_movie_details(
#     movie_id: int = Path(..., ge=1, description="Movie ID")
# ):
#     """Get details for a specific movie"""
#     try:
#         recommender = get_recommender()
        
#         if not recommender or recommender.movies_df is None:
#             raise HTTPException(status_code=404, detail="Movie not found")
        
#         movie = recommender.movies_df[recommender.movies_df.movieId == movie_id]
        
#         if movie.empty:
#             raise HTTPException(status_code=404, detail="Movie not found")
        
#         movie_data = movie.iloc[0]
        
#         # Get rating stats
#         ratings = recommender.ratings_df[recommender.ratings_df.movieId == movie_id]
        
#         return {
#             "success": True,
#             "movie": {
#                 "movieId": int(movie_data.movieId),
#                 "title": movie_data.title,
#                 "genres": movie_data.genres,
#                 "rating_count": len(ratings),
#                 "rating_mean": float(ratings.rating.mean()) if len(ratings) > 0 else None
#             }
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # ==================== STATS ENDPOINTS ====================

# @app.get("/api/v1/stats/overview", tags=["Statistics"])
# async def get_stats_overview():
#     """Get overview statistics"""
#     try:
#         recommender = get_recommender()
        
#         if not recommender:
#             return {
#                 "success": True,
#                 "stats": {"message": "No data available"}
#             }
        
#         stats = {
#             "total_movies": len(recommender.movies_df) if recommender.movies_df is not None else 0,
#             "total_ratings": len(recommender.ratings_df) if recommender.ratings_df is not None else 0,
#             "total_tags": len(recommender.tags_df) if recommender.tags_df is not None else 0,
#         }
        
#         if recommender.ratings_df is not None and not recommender.ratings_df.empty:
#             stats["total_users"] = recommender.ratings_df.userId.nunique()
#             stats["avg_rating"] = float(recommender.ratings_df.rating.mean())
#             stats["ratings_per_user"] = float(recommender.ratings_df.groupby("userId").size().mean())
        
#         return {
#             "success": True,
#             "stats": stats
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # ==================== ERROR HANDLERS ====================

# @app.exception_handler(404)
# async def not_found_handler(request, exc):
#     return JSONResponse(
#         status_code=404,
#         content={"success": False, "error": "Not found", "detail": str(exc)}
#     )

# @app.exception_handler(500)
# async def internal_error_handler(request, exc):
#     return JSONResponse(
#         status_code=500,
#         content={"success": False, "error": "Internal server error", "detail": str(exc)}
#     )

# # ==================== RUN SERVER ====================

# if __name__ == "__main__":
#     uvicorn.run(
#         "api:app",
#         host="127.0.0.1",
#         port=8001,
#         reload=True,
#         log_level="info"
#     )