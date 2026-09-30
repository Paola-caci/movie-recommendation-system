# ml-backend/scripts/train_model.py
import sys
import os

# Shto folderin scripts në path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from recommender import MovieRecommender

def main():
    """Funksioni kryesor për trajnimin e modelit"""
    print("=" * 60)
    print("🎬 MOVIE RECOMMENDATION SYSTEM - MODEL TRAINING")
    print("=" * 60)
    
    # Krijo rekomanduesin
    recommender = MovieRecommender()
    
    # 1. Ngarko të dhënat
    print("\n📥 STEP 1: Loading data...")
    recommender.load_data("../data")
    
    # 2. Përpunim të dhënash
    print("\n🔄 STEP 2: Preprocessing data...")
    recommender.preprocess_data()
    
    # 3. Train modelet
    print("\n🧠 STEP 3: Training models...")
    recommender.train_hybrid()
    
    # 4. Test rekomandimet
    print("\n✅ STEP 4: Testing recommendations...")
    
    # Test 1: Rekomandime për përdoruesin 1
    print("\n🎯 Test 1: Hybrid recommendations for user 1")
    recommendations = recommender.get_hybrid_recommendations(1, 5)
    
    for i, rec in enumerate(recommendations, 1):
        print(f"  {i}. {rec['title']}")
        print(f"     Genres: {rec['genres']}")
        print(f"     Score: {rec['score']:.3f}")
        print(f"     Type: {rec['type']}")
        print()
    
    # Test 2: Film të ngjashëm me Toy Story
    print("🎯 Test 2: Movies similar to 'Toy Story'")
    similar = recommender.get_content_recommendations(1, 3)
    
    for i, rec in enumerate(similar, 1):
        print(f"  {i}. {rec['title']}")
        print(f"     Similarity: {rec['similarity_score']:.3f}")
        print()
    
    # Test 3: Film të popullarë
    print("🎯 Test 3: Popular movies")
    popular = recommender.get_popular_movies(3)
    
    for i, rec in enumerate(popular, 1):
        print(f"  {i}. {rec['title']}")
        print(f"     Avg Rating: {rec['rating_mean']:.1f} ({rec['rating_count']} ratings)")
        print()
    
    # 5. Ruaj modelet
    print("\n💾 STEP 5: Saving models...")
    recommender.save_models("../models")
    
    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()