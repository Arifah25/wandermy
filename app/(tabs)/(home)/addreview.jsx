import { View, Text, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { getDatabase, ref, push, set, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { AddPhoto, Button, CreateForm, Rating, Visit } from '../../../components';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';

const AddReview = () => {
  // Attributes for review
  const [reviewImages, setReviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    rating: '',
    choiceQuestion:'',
    comment:'',
    datePosted: '',
  });

  const router = useRouter();
  const route = useRoute();
  const { placeID, name } = route.params;

  const auth = getAuth();
  const db = getDatabase();
  const userId = auth.currentUser?.uid;

  const [reviewID, setReviewID] = useState(null);

  const uploadImages = async (images, reviewId) => {
    const storage = getStorage();
    const uploadedUrls = [];
    
    for (const uri of images) {
      const storageRef1 = storageRef(storage, `reviews/${placeID}/${reviewId}/${new Date().toISOString()}`);
      const response = await fetch(uri);
      const blob = await response.blob();

      try {
        const snapshot = await uploadBytes(storageRef1, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(downloadURL); // Collect uploaded image URLs
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    return uploadedUrls;
  } 

  const handleRating = (rating) => {
    setForm({ ...form, rating });
  };

  const handleChoiceQuestion = (choice) => {
    setForm({ ...form, choiceQuestion: choice });
  };

  const updateUserPoints = async (userId, pointsToAdd) => {
    const userRef = ref(db, `users/${userId}`);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const updatedPoints = (userData.points || 0) + pointsToAdd;

        // Update the points in the database
        await set(userRef, {
          ...userData,
          points: updatedPoints,
        });

        // Check for badge eligibility
        if (updatedPoints >= 100 && !userData.badges?.includes('Traveller Badge')) {
          const badges = userData.badges || [];
          badges.push('Traveller Badge');
          await set(userRef, {
            ...userData,
            points: updatedPoints,
            badges,
          });
          console.log('Traveller Badge awarded!');
        }
      } else {
        console.error('User not found in database.');
      }
    } catch (error) {
      console.error('Error updating user points:', error);
    }
  };

  const handlePost = async () => {
    setIsSubmitting(true);
    try {
      const reviewRef = ref(db, `reviews/${placeID}`);
      const newReviewRef = push(reviewRef);
      const reviewId = newReviewRef.key;
      setReviewID(reviewId);

      // Upload images and get the URLs
      const reviewUrls = await uploadImages(reviewImages, reviewID);

      const reviewData = {
        placeID,
        rating: form.rating,
        choiceQuestion: form.choiceQuestion,
        comment:form.comment,
        datePosted: new Date().toISOString(),
        photo: reviewUrls,
        user: userId,
      };

      //save the review data
      await set(newReviewRef, reviewData);

      // Award 5 points for posting a review
      await updateUserPoints(userId, 10);

      setIsSubmitting(false);
      console.log('Review uploaded, points awarded.');
      router.back();
      } catch (error) {
        console.error('Error posting review:', error);
        setIsSubmitting(false);
    }
  }; 

  return (
    <View className="bg-white h-full flex-1 items-center  justify-start">
      <ScrollView className="w-full p-5">
        <Text className="text-2xl font-bold">
          {name}
        </Text>
        <View className="w-full mt-4">
          <Rating 
          rating={form.rating}
          onRatingPress={handleRating}
          />
        </View>
        <View className="w-full mt-5">
          <Visit 
          handlePress={handleChoiceQuestion} 
          selectedChoice={form.choiceQuestion} 
          isLoading={isSubmitting}
          />
        </View>
        <View className="mt-5">
          <CreateForm
          title="Share your experience: "
          value={form.comment}
          onChangeText={(text) => setForm({ ...form, comment: text })}
          tags="yes"
          />
        </View>
        <View className="w-full">
          <AddPhoto 
          images={reviewImages}
          setImages={setReviewImages} // Pass the state setters to AddPhoto
          isLoading={isSubmitting}
          isMultiple={true}
          />
        </View>
        <View
        className="w-full flex-row items-center justify-evenly mt-5 mb-10">
          <Button 
          title="Cancel"
          handlePress={() => router.back()}
          style="bg-secondary w-2/5"
          textColor="text-primary"
          />
          <Button 
          title="POST"
          handlePress={handlePost}
          style="bg-primary w-2/5"
          textColor="text-white"/>
        </View>
      </ScrollView>  
    </View>
  )
}

export default AddReview