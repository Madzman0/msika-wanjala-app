// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import GeneralLoginScreen from "./screens/GeneralLoginScreen";
import RoleRegisterScreen from "./screens/RoleRegisterScreen";
import HomeScreen from "./screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        {/* Step 1: Splash */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Step 2: Welcome */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />

        {/* Step 3: Login & Register */}
        <Stack.Screen name="GeneralLogin" component={GeneralLoginScreen} />
        <Stack.Screen name="RoleRegister" component={RoleRegisterScreen} />

        {/* Step 4: Home */}
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
