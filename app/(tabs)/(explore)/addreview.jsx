import { View, Text, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { getDatabase, ref, push, set, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { AddPhoto, Button, CreateForm, Rating, Visit } from '../../../components';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';

const AddReview = () => {
  const [reviewImages, setReviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    rating: '',
    choiceQuestion: '',
    comment: '',
    datePosted: '',
  });
  const [errors, setErrors] = useState({});

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
        uploadedUrls.push(downloadURL);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    return uploadedUrls;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.rating) newErrors.rating = 'Rating is required.';
    if (!form.choiceQuestion) newErrors.choiceQuestion = 'Please select your visit experience.';
    if (!form.comment.trim()) newErrors.comment = 'Comment is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePost = async () => {
    if (!validateForm()) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields before submitting.', [
        { text: 'OK' },
      ]);
      return;
    }

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
        comment: form.comment,
        datePosted: new Date().toISOString(),
        photo: reviewUrls,
        user: userId,
      };

      // Save the review data
      await set(newReviewRef, reviewData);

      setIsSubmitting(false);
      Alert.alert('Success', 'Your review has been posted successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error posting review:', error);
      setIsSubmitting(false);
      Alert.alert('Error', 'Something went wrong while posting your review. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  const renderError = (field) => {
    return errors[field] ? <Text className="ml-3 mt-2" style={{ color: 'red', fontSize: 12 }}>{errors[field]}</Text> : null;
  };

  return (
    <View className="bg-white h-full flex-1 items-center justify-start">
      {/* ActivityIndicator Modal */}
      {isSubmitting && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </Modal>
      )}

      <ScrollView className="w-full p-5">
        <Text className="text-2xl font-bold">{name}</Text>

        <View className="w-full mt-4">
          <Rating rating={form.rating} onRatingPress={(rating) => setForm({ ...form, rating })} />
          {renderError('rating')}
        </View>

        <View className="w-full mt-7">
          <Visit
            handlePress={(choice) => setForm({ ...form, choiceQuestion: choice })}
            selectedChoice={form.choiceQuestion}
            isLoading={isSubmitting}
          />
          {renderError('choiceQuestion')}
        </View>

        <View className="mt-3">
          <CreateForm
            title="Share your experience: "
            value={form.comment}
            handleChangeText={(text) => setForm({ ...form, comment: text })}
            tags="yes"
          />
          {renderError('comment')}
        </View>

        <View className="w-full mt-4">
          <AddPhoto
            images={reviewImages}
            setImages={setReviewImages}
            isLoading={isSubmitting}
            isMultiple={true}
          />
        </View>

        <View className="w-full flex-row items-center justify-evenly mt-5 mb-10">
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
            textColor="text-white"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default AddReview;
