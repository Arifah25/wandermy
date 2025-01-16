# #before adding based on user interaction
# from flask import Flask, jsonify, request
# import firebase_admin
# from firebase_admin import credentials, db
# import pandas as pd
# import numpy as np
# import random
# import re
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.neighbors import NearestNeighbors

# app = Flask(__name__)

# # Initialize Firebase Admin SDK
# cred = credentials.Certificate('C:/vscode projects/wandermy/wandermy2-firebase-adminsdk-jjw4z-b7eb9a0e36.json')
# firebase_admin.initialize_app(cred, {
#     'databaseURL': 'https://wandermy2-default-rtdb.asia-southeast1.firebasedatabase.app'
# })

# @app.route('/recommendations', methods=['POST'])
# def get_recommendations():
#     # Retrieve `userId` from the incoming JSON request
#     data = request.json
#     user_id = data.get("userId")

#     if not user_id:
#         return jsonify({"error": "User ID is required"}), 400

#     # Fetch bookmarks for the user
#     bookmark_ref = db.reference('bookmark')
#     places_ref = db.reference('places')
#     user_bookmarks_data = bookmark_ref.child(user_id).get()

#     # Fetch all places data
#     places_data = places_ref.get()
#     if not places_data:
#         return jsonify({"error": "No places found in the database"}), 404

#     # Handle case when user has no bookmarks
#     if not user_bookmarks_data:
#         print(f"No bookmarks found for user ID: {user_id}. Recommending random places.")
#         # Select 16 random places from the database
#         all_places = [
#             {"placeID": place_id, "name": place_info.get("name", "")}
#             for place_id, place_info in places_data.items()
#         ]
#         random_recommendations = random.sample(all_places, min(16, len(all_places)))
#         return jsonify({"recommendations": random_recommendations})

#     # Extract placeIDs from user bookmarks
#     user_bookmarks = [bookmark['placeID'] for bookmark in user_bookmarks_data.values()]

#     # Extract bookmarked places and all places
#     all_places = []
#     bookmarked_places = []
#     for place_id, place_info in places_data.items():
#         all_places.append({
#             "placeID": place_id,
#             "name": place_info.get("name", ""),
#             "tags": place_info.get("tags", ""),
#             "description": place_info.get("description", ""),
#         })
#         if place_id in user_bookmarks:
#             bookmarked_places.append({
#                 "placeID": place_id,
#                 "tags": place_info.get("tags", ""),
#                 "description": place_info.get("description", ""),
#             })

#     # Function to clean text: remove punctuation, convert to lowercase
#     def clean_text(text):
#         text = re.sub(r'[^\w\s]', '', str(text))  # Remove punctuation
#         text = text.lower()  # Convert to lowercase
#         return text

#     # Convert data to DataFrames
#     df_all_places = pd.DataFrame(all_places)
#     df_bookmarked = pd.DataFrame(bookmarked_places)

#     # Create combined text for analysis
#     df_all_places['combined_text'] = (
#         df_all_places['tags'].apply(clean_text) + ' ' +
#         df_all_places['description'].apply(clean_text)
#     )
#     df_bookmarked['combined_text'] = (
#         df_bookmarked['tags'].apply(clean_text) + ' ' +
#         df_bookmarked['description'].apply(clean_text)
#     )

#     # Vectorize text using TF-IDF
#     tfidf = TfidfVectorizer(stop_words='english')
#     X_all = tfidf.fit_transform(df_all_places['combined_text'])

#     # Create a query vector by averaging the TF-IDF vectors of bookmarked places
#     X_bookmarked = tfidf.transform(df_bookmarked['combined_text'])
#     query_vector = X_bookmarked.mean(axis=0)
#     query_vector_array = np.asarray(query_vector).reshape(1, -1)

#     # Fit the NearestNeighbors model
#     knn = NearestNeighbors(n_neighbors=min(16, len(all_places)), metric='cosine')
#     knn.fit(X_all)

#     # Find nearest neighbors
#     distances, indices = knn.kneighbors(query_vector_array)

#     # Print user ID and bookmarked places
#     print(f"\nUser ID: {user_id}")
#     print("Bookmarked PlaceIDs:")
#     for place_id in user_bookmarks:
#         print(f"  - {place_id}")

#     # Prepare recommendations
#     recommendations = []
#     for distance, index in zip(distances[0], indices[0]):
#         place = df_all_places.iloc[index]
#         if place['placeID'] not in user_bookmarks:  # Exclude already bookmarked places
#             recommendations.append({
#                 "placeID": place['placeID'],
#                 "name": place['name'],
#                 "distance": float(distance),
#             })

#     # Limit recommendations to 16
#     recommendations = recommendations[:16]

#     # Sort recommendations by distance
#     recommendations.sort(key=lambda x: x['distance'])

#     # Print recommendations in terminal
#     print("\nRecommendations:")
#     for rec in recommendations:
#         print(f"PlaceID: {rec['placeID']}, Name: {rec['name']}, Distance: {rec['distance']:.4f}")

#     # Return recommendations as JSON
#     return jsonify({"recommendations": recommendations})


# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)
