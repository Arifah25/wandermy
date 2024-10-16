import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useRoute } from '@react-navigation/native';
import {CreateForm} from '../../../../components'
import { getDatabase, ref, get, update } from 'firebase/database';

const EditEvent = () => {
    return (
      <View>
        <Text>Welcome to the Event Screen</Text>
      </View>
    );
  };
  
  export default EditEvent;