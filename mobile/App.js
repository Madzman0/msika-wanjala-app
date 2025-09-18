// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import RoleSelectionScreen from "./screens/RoleSelectionScreen";
import RoleLoginScreen from "./screens/RoleLoginScreen";
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
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />

        {/* use "RoleSelection" as the route name used across screens */}
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />

        <Stack.Screen name="RoleLogin" component={RoleLoginScreen} />
        <Stack.Screen name="RoleRegister" component={RoleRegisterScreen} />

        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
