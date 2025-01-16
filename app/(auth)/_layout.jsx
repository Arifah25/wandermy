import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { icons } from '../../constants';
import { useRouter } from 'expo-router';
import SignIn from './sign-in';
import SignUp from './sign-up';
import VerifyEmail from './verify-email';

const Stack = createNativeStackNavigator();

const HeaderIcon = ({ onPress, icon }) => (
  <TouchableOpacity onPress={onPress} style={{ margin: 10 }}>
    <Image source={icon} style={{ width: 24, height: 24, tintColor: '#fff' }} />
  </TouchableOpacity>
);

const AuthLayout = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Stack.Navigator>
      {/* Sign-In Screen */}
      <Stack.Screen
        name="sign-in"
        component={SignIn}
        options={{ headerShown: false }}
      />

      {/* Sign-Up Screen with Header */}
      <Stack.Screen
        name="sign-up"
        component={SignUp}
        options={{
          headerTitle: 'Create Account',
          headerTitleStyle: { color: '#fff', fontFamily: 'Kanit-Regular', fontSize: 20 },
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#A91D1D' },
          headerLeft: () => <HeaderIcon icon={icons.left} onPress={handleBack} />,
        }}
      />

      {/* Verify Email Screen */}
      <Stack.Screen
        name="verify-email"
        component={VerifyEmail}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthLayout;
