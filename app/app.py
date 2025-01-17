from flask import Flask, jsonify, request
import firebase_admin
from firebase_admin import credentials, db
import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://wandermy2-default-rtdb.asia-southeast1.firebasedatabase.app'
})

# Function to clean text: remove punctuation, convert to lowercase
def clean_text(text):
    text = re.sub(r'[^\w\s]', '', str(text))  # Remove punctuation
    text = text.lower()  # Convert to lowercase
    return text

# Function to extract state from the address
def extract_state(address):
    try:
        # Assume the state is the last part of the address (e.g., "City, State")
        parts = str(address).split(',')
        state = parts[-1].strip() if len(parts) > 1 else ""
        return state.lower()  # Convert to lowercase for consistency
    except Exception as e:
        print(f"Error extracting state: {e}")
        return ""

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    try:
        # Add debug logging
        print("Starting recommendation process...")
        
        # Retrieve `userId` from the incoming JSON request
        data = request.json
        user_id = data.get("userId")
        print(f"Received user_id: {user_id}")

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        # Fetch user data and get religion and preferences
        user_ref = db.reference(f'users/{user_id}')
        user_data = user_ref.get() or {}
        religion = user_data.get('religion', '').lower() if user_data else ''
        
        # Get user preferences and convert to list
        user_preferences_str = user_data.get('userPreference', '').lower()
        user_preferences = [pref.strip() for pref in user_preferences_str.split(',')] if user_preferences_str else []
        
        print(f"User religion: {religion}")
        print(f"User preferences: {user_preferences}")

        # Fetch bookmarks, interactions, user data, and places
        user_ref = db.reference(f'users/{user_id}')
        user_data = user_ref.get() or {}
        
        # Add debug logging for user data
        print(f"User data retrieved: {user_data}")

        # Initialize these before the try block
        bookmark_ref = db.reference(f'bookmark/{user_id}')
        interaction_ref = db.reference(f'user_interactions/{user_id}')
        places_ref = db.reference('places')

        # Batch fetch with error handling
        try:
            user_bookmarks_data = bookmark_ref.get() or {}
            user_interactions_data = interaction_ref.get() or {}
            places_data = places_ref.order_by_key().get() or {}
            
            # Add debug logging
            print(f"Bookmarks count: {len(user_bookmarks_data)}")
            print(f"Interactions count: {len(user_interactions_data)}")
            print(f"Total places: {len(places_data)}")
            
        except Exception as e:
            print(f"Error fetching data from Firebase: {str(e)}")
            return jsonify({"error": "Error fetching data"}), 500

        # Safely extract placeIDs
        user_bookmarks = []
        user_interactions = []
        
        try:
            user_bookmarks = [bookmark.get('placeID') for bookmark in user_bookmarks_data.values() if isinstance(bookmark, dict)]
            user_interactions = [interaction.get('placeID') for interaction in user_interactions_data.values() if isinstance(interaction, dict)]
        except Exception as e:
            print(f"Error processing bookmarks/interactions: {str(e)}")

        all_user_places = set(user_bookmarks + user_interactions)
        print(f"Processed user places count: {len(all_user_places)}")

        # Debugging: Log all user places
        print("All User Places (Bookmarked + Interacted):", all_user_places)

        # Prepare data for scoring
        places = [
            {
                "placeID": place_id,
                "name": place_info.get("name", ""),
                "tags": place_info.get("tags", ""),
                "description": place_info.get("description", ""),
                "address": place_info.get("address", ""),
                "state": extract_state(place_info.get("address", "")),
                "category": place_info.get("category", ""),  # Add category to filter dining places
                "halalStatus": place_info.get("halalStatus", "").lower()  # Add halal status for filtering
            }
            for place_id, place_info in places_data.items()
            if place_id not in all_user_places  # Exclude already interacted/bookmarked
        ]

        # Filter places based on religion for dining category
        if religion == "islam":
            places = [
                place for place in places
                if place["category"].lower() != "dining" or place["halalStatus"] == "halal"
            ]

        # If no places are left to recommend
        if not places:
            return jsonify({"recommendations": []})

        df_places = pd.DataFrame(places)

        # Clean and preprocess tags, description, and state
        df_places['clean_tags'] = df_places['tags'].apply(clean_text)
        df_places['clean_description'] = df_places['description'].apply(clean_text)
        df_places['clean_state'] = df_places['state'].apply(clean_text)

        # Combine all features for similarity scoring
        df_places['combined_features'] = (
            df_places['clean_tags'] + ' ' +
            df_places['clean_description'] + ' ' +
            df_places['clean_state']
        )

        # User interaction-based query vector
        user_combined_features = " ".join([
            clean_text(place_info.get("tags", "")) + ' ' +
            clean_text(place_info.get("description", "")) + ' ' +
            clean_text(extract_state(place_info.get("address", "")))
            for place_id, place_info in places_data.items()
            if place_id in all_user_places
        ])

        # TF-IDF Vectorization
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(df_places['combined_features'])
        user_vector = tfidf.transform([user_combined_features])

        # Calculate similarity
        tfidf_similarities = cosine_similarity(user_vector, tfidf_matrix).flatten()

        # # Weighted scoring: Apply weights to similarity components
        # df_places['tag_similarity'] = df_places['clean_tags'].apply(lambda x: len(set(x.split()) & set(user_combined_features.split())))
        # df_places['description_similarity'] = df_places['clean_description'].apply(lambda x: len(set(x.split()) & set(user_combined_features.split())))
        # df_places['state_similarity'] = df_places['clean_state'].apply(lambda x: 1 if x in user_combined_features else 0)

        # # Combine scores with weights
        # df_places['combined_score'] = (
        #     0.5 * tfidf_similarities +
        #     0.3 * df_places['tag_similarity'] +
        #     0.2 * df_places['state_similarity']
        # )

        # Compute state similarity based on user interaction states
        def state_similarity(row):
            return 1 if row['clean_state'] in user_combined_features else 0

        df_places['state_similarity'] = df_places.apply(state_similarity, axis=1)

        # Preference-Based Scoring
        def preference_score(row):
            if not user_preferences:  # If no preferences, return 0
                return 0
            
            score = 0
            for keyword in user_preferences:
                if keyword and (  # Check if keyword is not empty
                    keyword in row['clean_tags'] or
                    keyword in row['clean_description'] or
                    keyword in row['clean_state']
                ):
                    score += 1
            return score

        df_places['preference_score'] = df_places.apply(preference_score, axis=1)

        # Religion-Based Scoring Adjustment
        def religion_score(row):
            if religion == "islam" and row['category'].lower() == "dining" and row['halalStatus'] != "halal":
                return -1  # Penalize for non-halal dining places for Islamic users
            return 0

        df_places['religion_score'] = df_places.apply(religion_score, axis=1)

        # Weighted Scoring: Combine TF-IDF, Preferences, and Religion
        df_places['combined_score'] = (
            0.5 * tfidf_similarities +            # Content similarity from user interactions
            0.3 * df_places['preference_score'] + # Match with user preferences
            0.2 * df_places['state_similarity'] + # Match with state relevance
            df_places['religion_score']           # Adjust for religion
        )
        # Sort by combined score and select top 20
        recommendations = (
            df_places.sort_values(by='combined_score', ascending=False)
            .head(20)
            .to_dict(orient='records')
        )

        # Print recommendations in terminal
        print("\nRecommendations:")
        for rec in recommendations:
            print(f"PlaceID: {rec['placeID']}, Name: {rec['name']}, Score: {rec['combined_score']:.4f}")

        # Format recommendations
        formatted_recommendations = []
        for rec in recommendations:
            if isinstance(rec, dict) and 'placeID' in rec and 'name' in rec and 'combined_score' in rec:
                formatted_recommendations.append({
                    "placeID": rec['placeID'],
                    "name": rec['name'],
                    "similarity_score": float(rec['combined_score'])  # Ensure it's a float
                })

        print(f"Returning {len(formatted_recommendations)} recommendations")
        return jsonify({"recommendations": formatted_recommendations})

    except Exception as e:
        print(f"Error in recommendation process: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

