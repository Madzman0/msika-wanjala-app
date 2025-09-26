// App.js

import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import GeneralLoginScreen from "./screens/GeneralLoginScreen";
import RoleRegisterScreen from "./screens/RoleRegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import BuyerHomeScreen from "./screens/BuyerHomeScreen";
import CartScreen from "./screens/CartScreen";
import ChatScreen from "./screens/ChatScreen";

// Payment Flow
import CheckoutScreen from "./screens/CheckoutScreen";
import PaymentScreen from "./screens/PaymentScreen";
import ConfirmationScreen from "./screens/ConfirmationScreen";

import { CartProvider } from "./context/CartContext";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          {!isLoggedIn ? (
            // Guest Flow
            <>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="GeneralLogin">
                {(props) => (
                  <GeneralLoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
                )}
              </Stack.Screen>
              <Stack.Screen name="RoleRegister" component={RoleRegisterScreen} />
              <Stack.Screen name="Home">
                {(props) => (
                  <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />
                )}
              </Stack.Screen>
            </>
          ) : (
            // Buyer Flow
            <>
              <Stack.Screen name="BuyerHome">
                {(props) => (
                  <BuyerHomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />
                )}
              </Stack.Screen>

              {/* Cart & Checkout Flow */}
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen name="Payment" component={PaymentScreen} />
              <Stack.Screen name="Confirmation" component={ConfirmationScreen} />

              {/* Chat */}
              <Stack.Screen name="ChatScreen" component={ChatScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
