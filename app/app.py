from flask import Flask, jsonify, request
import firebase_admin
from firebase_admin import credentials, db
import pandas as pd
import numpy as np
import random
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('C:/vscode projects/wandermy/app/serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://wandermy2-default-rtdb.asia-southeast1.firebasedatabase.app'
})


@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    try:
        # Retrieve `userId` from the incoming JSON request
        data = request.json
        user_id = data.get("userId")

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        # Fetch bookmarks and interactions for the user
        bookmark_ref = db.reference(f'bookmark/{user_id}')
        interaction_ref = db.reference(f'user_interactions/{user_id}')
        places_ref = db.reference('places')

        # Batch fetch user data and places
        user_bookmarks_data = bookmark_ref.get() or {}
        user_interactions_data = interaction_ref.order_by_child('timestamp').limit_to_last(30).get() or {}
        places_data = places_ref.order_by_key().get() or {}

        # Extract placeIDs from bookmarks and interactions
        user_bookmarks = [bookmark['placeID'] for bookmark in user_bookmarks_data.values()]
        user_interactions = [interaction['placeID'] for interaction in user_interactions_data.values()]
        all_user_places = set(user_bookmarks + user_interactions)

        # Debugging: Log all user places
        print("All User Places (Bookmarked + Interacted):", all_user_places)

        # Handle case when no bookmarks or interactions are found
        if not all_user_places:
            print(f"No bookmarks or interactions found for user ID: {user_id}. Recommending random places.")
            all_places = [
                {"placeID": place_id, "name": place_info.get("name", ""), "tags": place_info.get("tags", ""),
                 "description": place_info.get("description", "")}
                for place_id, place_info in places_data.items()
            ]
            random_recommendations = random.sample(all_places, min(16, len(all_places)))
            return jsonify({"recommendations": random_recommendations})

        # Extract data for bookmarks and interactions
        combined_places = [
            {
                "placeID": place_id,
                "name": place_info.get("name", ""),
                "tags": place_info.get("tags", ""),
                "description": place_info.get("description", ""),
            }
            for place_id, place_info in places_data.items()
            if place_id in all_user_places
        ]

        # Function to clean text: remove punctuation, convert to lowercase
        def clean_text(text):
            text = re.sub(r'[^\w\s]', '', str(text))  # Remove punctuation
            text = text.lower()  # Convert to lowercase
            return text

        # Convert data to DataFrames
        df_all_places = pd.DataFrame([
            {
                "placeID": place_id,
                "name": place_info.get("name", ""),
                "tags": place_info.get("tags", ""),
                "description": place_info.get("description", ""),
            }
            for place_id, place_info in places_data.items()
        ])
        df_combined = pd.DataFrame(combined_places)

        # Create combined text for analysis
        df_all_places['combined_text'] = (
            df_all_places['tags'].apply(clean_text) + ' ' +
            df_all_places['description'].apply(clean_text)
        )
        df_combined['combined_text'] = (
            df_combined['tags'].apply(clean_text) + ' ' +
            df_combined['description'].apply(clean_text)
        )

        # Vectorize text using TF-IDF
        tfidf = TfidfVectorizer(stop_words='english')
        X_all = tfidf.fit_transform(df_all_places['combined_text'])
        X_combined = tfidf.transform(df_combined['combined_text'])

        # Create a query vector by averaging the TF-IDF vectors of combined places
        query_vector = X_combined.mean(axis=0)
        query_vector_array = np.asarray(query_vector).reshape(1, -1)

        # Fit the NearestNeighbors model
        knn = NearestNeighbors(n_neighbors=min(16, len(df_all_places)), metric='cosine')
        knn.fit(X_all)

        # Find nearest neighbors
        distances, indices = knn.kneighbors(query_vector_array)

        # Prepare recommendations
        recommendations = []
        for distance, index in zip(distances[0], indices[0]):
            place = df_all_places.iloc[index]
            if place['placeID'] not in all_user_places:  # Exclude already bookmarked or interacted places
                recommendations.append({
                    "placeID": place['placeID'],
                    "name": place['name'],
                    "distance": float(distance),
                })

        # Limit recommendations to 16
        recommendations = recommendations[:16]

        # Sort recommendations by distance
        recommendations.sort(key=lambda x: x['distance'])

        # Print recommendations in terminal
        print("\nRecommendations:")
        for rec in recommendations:
            print(f"PlaceID: {rec['placeID']}, Name: {rec['name']}, Distance: {rec['distance']:.4f}")

        # Return recommendations as JSON
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        print(f"Error: {str(e)}")  # Log the error to the console
        return jsonify({"error": "An error occurred while processing the request."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
