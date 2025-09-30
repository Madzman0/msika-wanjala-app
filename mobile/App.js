// App.js

import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import SignUpScreen from "./screens/SignUpScreen";
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

// Vendor (Seller/Depot/Transporter) Flow
import VendorLoginScreen from "./screens/VendorLoginScreen";
import SellerLogin from "./screens/SellerLogin";
import DepotLogin from "./screens/DepotLogin";
import TransporterLogin from "./screens/TransporterLogin";
import SellerHomeScreen from "./screens/SellerHomeScreen";
import DepotHomeScreen from "./screens/DepotHomeScreen";
import TransporterHomeScreen from "./screens/TransporterHomeScreen";

import { CartProvider } from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <CartProvider>
      <ProductProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ headerShown: false }}
          >
            {!isLoggedIn ? (
              // Guest / Vendor Flow
              <>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="GeneralLogin">
                  {(props) => (
                    <GeneralLoginScreen
                      {...props}
                      setIsLoggedIn={setIsLoggedIn}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen
                  name="RoleRegister"
                  component={RoleRegisterScreen}
                />
                <Stack.Screen name="Home">
                  {(props) => (
                    <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />
                  )}
                </Stack.Screen>

                {/* Vendor Login Flow */}
                <Stack.Screen
                  name="VendorLogin"
                  component={VendorLoginScreen}
                />
                <Stack.Screen name="SellerLogin">
                  {(props) => (
                    <SellerLogin
                      {...props}
                      onLogin={() => props.navigation.replace("SellerHome")}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="DepotLogin">
                  {(props) => (
                    <DepotLogin
                      {...props}
                      onLogin={() => props.navigation.replace("DepotHome")}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="TransporterLogin">
                  {(props) => (
                    <TransporterLogin
                      {...props}
                      onLogin={() =>
                        props.navigation.replace("TransporterHome")
                      }
                    />
                  )}
                </Stack.Screen>

                {/* Vendor Home Screens */}
                <Stack.Screen name="SellerHome">
                  {(props) => (
                    <SellerHomeScreen
                      {...props}
                      setIsLoggedIn={setIsLoggedIn} // ✅ pass setter
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen name="DepotHome" component={DepotHomeScreen} />
                <Stack.Screen
                  name="TransporterHome"
                  component={TransporterHomeScreen}
                />
              </>
            ) : (
              // Buyer Flow
              <>
                <Stack.Screen name="BuyerHomeScreen">
                  {(props) => (
                    <BuyerHomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />
                  )}
                </Stack.Screen>

                {/* Cart & Checkout Flow */}
                <Stack.Screen name="Cart" component={CartScreen} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} />
                <Stack.Screen name="Payment" component={PaymentScreen} />
                <Stack.Screen
                  name="Confirmation"
                  component={ConfirmationScreen}
                />

                {/* Chat */}
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ProductProvider>
    </CartProvider>
  );
}
