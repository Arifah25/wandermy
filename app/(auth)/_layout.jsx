import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from './sign-in';
import SignUp from './sign-up';
import VerifyEmail from './verify-email';

const Stack = createNativeStackNavigator();

const AuthLayout = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="sign-in"
        component={SignIn}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="sign-up"
        component={SignUp}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="verify-email"
        component={VerifyEmail}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthLayout;
