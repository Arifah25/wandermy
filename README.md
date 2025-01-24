# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

## Setup Firebase Service Account

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Go to Project Settings by clicking the gear icon next to "Project Overview".
4. Navigate to the "Service accounts" tab.
5. Click on "Generate new private key" to download the JSON file.
6. Save the file as `serviceAccountKey.json` in your project directory (e.g., `app/serviceAccountKey.json`).

## Setup Environment Variables

1. In the root of your project directory, create a file named `.env`.
2. Add your API key and other environment variables to the `.env` file. For example:

    ```plaintext
   EXPO_PUBLIC_GOOGLE_MAP_KEY=YOUR_GOOGLE_MAP_API_KEY
   EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   EXPO_PUBLIC_API_URL=FROM_AXIOS_OUTPUT
    ```

3. Ensure that your  file is listed in your  file to prevent it from being committed to your repository.

## Start the app

   ```bash
    npx expo start -c
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
