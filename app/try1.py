import firebase_admin
from firebase_admin import credentials, db
import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

# Initialize Firebase Admin SDK
cred = credentials.Certificate('C:/vscode projects/wandermy/wandermy2-firebase-adminsdk-jjw4z-b7eb9a0e36.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://wandermy2-default-rtdb.asia-southeast1.firebasedatabase.app'
})

# Fetch data from Firebase Realtime Database
bookmark_ref = db.reference('bookmark')
places_ref = db.reference('places')

# Input the userID for which recommendations are needed
user_id = "Bupwmd6pCxbMrMHbmXXo0JyMYrw2"  # Replace with the actual user ID

# Fetch the user's bookmarked placeIDs
user_bookmarks_data = bookmark_ref.child(user_id).get()
if not user_bookmarks_data:
    print(f"No bookmarks found for user ID: {user_id}")
    exit()

# Extract placeIDs from the nested structure
user_bookmarks = [bookmark['placeID'] for bookmark in user_bookmarks_data.values()]

# Fetch all places from the database
places_data = places_ref.get()
if not places_data:
    print("No places data found in the database.")
    exit()

# Extract bookmarked places and their details
bookmarked_places = []
all_places = []

for place_id, place_info in places_data.items():
    all_places.append({
        "placeID": place_id,
        "name": place_info.get("name", ""),
        "tags": place_info.get("tags", ""),
        # "category": place_info.get("category", ""),
        "description": place_info.get("description", "")
    })
    if place_id in user_bookmarks:
        bookmarked_places.append({
            "placeID": place_id,
            "tags": place_info.get("tags", ""),
            # "category": place_info.get("category", ""),
            "description": place_info.get("description", "")
        })

# Function to clean text: remove punctuation and extra spaces
def clean_text(text):
    text = re.sub(r'[^\w\s]', '', str(text))  # Removes punctuation
    text = text.lower()  # Convert to lowercase for consistency
    return text

# Convert the data to DataFrames
df_all_places = pd.DataFrame(all_places)
df_bookmarked = pd.DataFrame(bookmarked_places)

# Clean tags, category, and description
df_all_places['combined_text'] = (
    df_all_places['tags'].apply(clean_text) + ' ' +
    # df_all_places['category'].apply(clean_text) + ' ' +
    df_all_places['description'].apply(clean_text)
)
df_bookmarked['combined_text'] = (
    df_bookmarked['tags'].apply(clean_text) + ' ' +
    # df_bookmarked['category'].apply(clean_text) + ' ' +
    df_bookmarked['description'].apply(clean_text)
)

# Use TF-IDF to vectorize the combined text
tfidf = TfidfVectorizer(stop_words='english')
X_all = tfidf.fit_transform(df_all_places['combined_text'])

# Create a "query vector" by averaging the vectors of bookmarked places
X_bookmarked = tfidf.transform(df_bookmarked['combined_text'])
query_vector = X_bookmarked.mean(axis=0)

# Ensure query_vector is a numpy array
query_vector_array = np.asarray(query_vector).reshape(1, -1)

# Fit the NearestNeighbors model (KNN) using cosine similarity
knn = NearestNeighbors(n_neighbors=10, metric='cosine')
knn.fit(X_all)

# Find the nearest neighbors based on cosine similarity
distances, indices = knn.kneighbors(query_vector_array)

# Print the similarity ranking
print(f"Recommended places for user ID: {user_id}")
for i, (distance, index) in enumerate(zip(distances[0], indices[0])):
    place = df_all_places.iloc[index]
    # Avoid recommending already bookmarked places
    if place['placeID'] not in user_bookmarks:
        print(f"{i + 1}. {place['name']} (Distance: {distance:.4f})")
