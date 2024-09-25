import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { getDatabase, ref, onValue, set, remove, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { TouchableOpacity, Image } from 'react-native';
import { icons } from '../../../constants';

const Details = () => {
    const [bookmark, setBookmark] = useState(false);
    const router = useRouter();
    const navigation = useNavigation();
    const route = useRoute();
    const { attractionId } = route.params;

    const auth = getAuth();
    const db = getDatabase();
    const userId = auth.currentUser?.uid;
    
    useEffect(() => {
        const checkBookmarkStatus = async () => {
          if (!userId) return;
          const bookmarkRef = ref(db, `bookmarks/${userId}/${attractionId}`);
          const snapshot = await get(bookmarkRef);
          setBookmark(snapshot.exists());
        };
        checkBookmarkStatus();
      }, [userId, attractionId]);

      const handleBookmarkPress = async () => {
        if (!userId) return;
        const bookmarkRef = ref(db, `bookmarks/${userId}/${attractionId}`);
        if (bookmark) {
          await remove(bookmarkRef);
        } else {
          await set(bookmarkRef, {
            bookmarkId: `${userId}_${attractionId}`,
            userId,
            attractionId,
            dateBookmarked: new Date().toISOString(),
          });
        }
        setBookmark(!bookmark);
      };
    
      useEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <TouchableOpacity onPress={handleBookmarkPress} style={{ marginRight: 10 }}>
              <Image
                source={bookmark ? icons.bookmarked : icons.bookmark}
                style={{ width: 24, height: 24, tintColor: 'white' }}
              />
            </TouchableOpacity>
          ),
        });
      }, [router, bookmark]);
    
  return (
    <View>
      <Text>Details</Text>
    </View>
  )
}

export default Details