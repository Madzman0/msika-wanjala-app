// App.js

import React, { useEffect, useState } from "react";
import RoleSelectionLoginScreen from "./screens/RoleSelectionLoginScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";

import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import GeneralLoginScreen from "./screens/GeneralLoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import RoleRegisterScreen from "./screens/RoleRegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import BuyerHomeScreen from "./screens/BuyerHomeScreen";
import CartScreen from "./screens/CartScreen";
import AllCategoriesScreen from "./screens/AllCategoriesScreen";
import ChatScreen from "./screens/ChatScreen";
import ManagePhoneScreen from "./screens/ManagePhoneScreen";
import NewChatScreen from "./screens/NewChatScreen";
import ConnectedAccountsScreen from "./screens/ConnectedAccountsScreen";
import BillingAddressScreen from "./screens/BillingAddressScreen";
import HelpCenterScreen from "./screens/HelpCenterScreen";
import BlockedUsersScreen from "./screens/BlockedUsersScreen";
import LoginActivityScreen from "./screens/LoginActivityScreen";
import RefundRequestScreen from "./screens/RefundRequestScreen";
import MapAddressScreen from "./screens/MapAddressScreen";

import CheckoutScreen from "./screens/CheckoutScreen";
import PaymentScreen from "./screens/PaymentScreen";
import ConfirmationScreen from "./screens/ConfirmationScreen";

import VendorLoginScreen from "./screens/VendorLoginScreen";
import SellerLogin from "./screens/SellerLogin";
import DepotLogin from "./screens/DepotLogin";
import TransporterLogin from "./screens/TransporterLogin";
import SellerHomeScreen from "./screens/SellerHomeScreen";
import DepotHomeScreen from "./screens/DepotHomeScreen";
import TransporterHomeScreen from "./screens/TransporterHomeScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import SellerSettingsScreen from "./screens/SellerSettingsScreen";
import ShippingInfoScreen from "./screens/ShippingInfoScreen";
import PayoutMethodsScreen from "./screens/PayoutMethodsScreen";
import SellerTransactionHistoryScreen from "./screens/SellerTransactionHistoryScreen";
import ReturnPolicyScreen from "./screens/ReturnPolicyScreen";
import BusinessInfoScreen from "./screens/BusinessInfoScreen";
import EditShopProfileScreen from "./screens/EditShopProfileScreen";
import SellerVerificationScreen from "./screens/SellerVerificationScreen";
import SelectPickupScreen from "./screens/SelectPickupScreen";
import PrivacyPolicyScreen from "./screens/PrivacyPolicyScreen";
import TermsOfServiceScreen from "./screens/TermsOfServiceScreen";
import EditProductScreen from "./screens/EditProductScreen";
import LiveStreamViewerScreen from './screens/LiveStreamViewerScreen';
import SellerProfileViewScreen from './screens/SellerProfileViewScreen';
import LiveSessionsListScreen from './screens/LiveSessionsListScreen';
import GoLiveScreen from './screens/GoLiveScreen'; // Import the new screen

import { CartProvider } from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";
import { ThemeProvider } from "./context/ThemeContext";

// ✅ Import Firebase
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const Stack = createNativeStackNavigator();

export default function App() {
  const [userRole, setUserRole] = useState(null); // null: guest, 'buyer': buyer, 'seller': seller etc.
  const [loading, setLoading] = useState(true); // for splash delay while checking auth
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // User is signed in, get their role from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Check for a 'roles' array first for multi-role support
            if (userData.roles && Array.isArray(userData.roles) && userData.roles.length > 1) {
              // User has multiple roles, set a special state to show the selection screen
              setAvailableRoles(userData.roles);
              setUserRole('multi-role');
            } else if (userData.roles && Array.isArray(userData.roles) && userData.roles.length === 1) {
              // User has a roles array but with only one role
              setUserRole(userData.roles[0]);
            } else if (userData.role) {
              // Fallback to the single 'role' field for backward compatibility
              setUserRole(userData.role);
            } else {
              // If user exists but has no role field, default them to buyer
              setUserRole('buyer');
            }
          } else {
            // User exists in Auth but not in Firestore DB.
            // Default to 'buyer' role to prevent being kicked out.
            setUserRole('buyer');
          }
        } else {
          setUserRole(null); // User is signed out
        }
      } catch (error) {
        console.error("Failed to fetch user role from Firestore:", error);
        setUserRole(null); // Fallback to guest role on error
      } finally {
        setLoading(false); // Hide splash screen AFTER auth check and role fetch is complete
      }
    });
    return unsubscribe; // cleanup listener
  }, []);

  if (loading) {
    return <SplashScreen />; // show splash while checking auth
  }

  return (
    <ThemeProvider>
      <CartProvider>
        <ProductProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {userRole === null ? ( // User is not logged in (Guest)
                // Guest Flow: User is not logged in
                <>
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />
                  <Stack.Screen name="GeneralLogin" component={GeneralLoginScreen} />
                  <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
                  <Stack.Screen name="RoleRegister" component={RoleRegisterScreen} />

                  {/* Vendor Login Flow */}
                  <Stack.Screen name="VendorLogin" component={VendorLoginScreen} />

                  {/* Allow guests to view the home screen */}
                  <Stack.Screen name="BuyerHomeScreen" component={BuyerHomeScreen} />

                </>
              ) : userRole === 'buyer' ? ( // User is logged in as a Buyer
                // Logged-in Buyer Flow
                <>
                  <Stack.Screen name="BuyerHomeScreen" component={BuyerHomeScreen} />
                  <Stack.Screen name="CartScreen" component={CartScreen} />
                  <Stack.Screen name="AllCategoriesScreen" component={AllCategoriesScreen} />
                  <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
                  <Stack.Screen name="NewChatScreen" component={NewChatScreen} />
                  <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
                  <Stack.Screen name="ConfirmationScreen" component={ConfirmationScreen} />
                  <Stack.Screen name="ChatScreen" component={ChatScreen} />
                  <Stack.Screen name="ManagePhoneScreen" component={ManagePhoneScreen} />
                  <Stack.Screen name="BillingAddress" component={BillingAddressScreen} />
                  <Stack.Screen name="ConnectedAccountsScreen" component={ConnectedAccountsScreen} />
                  <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
                  <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
                  <Stack.Screen name="LoginActivity" component={LoginActivityScreen} />
                  <Stack.Screen name="RefundRequests" component={RefundRequestScreen} />
                  <Stack.Screen name="MapAddressScreen" component={MapAddressScreen} />
                  <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
                  <Stack.Screen name="LiveStreamViewerScreen" component={LiveStreamViewerScreen} />
                  <Stack.Screen name="LiveSessionsListScreen" component={LiveSessionsListScreen} />
                  <Stack.Screen name="SellerProfileViewScreen" component={SellerProfileViewScreen} />
                </>
              ) : userRole === 'seller' ? (
                // Logged-in Seller Flow
                <>
                  <Stack.Screen name="SellerHome" component={SellerHomeScreen} />
                  {/* Add the EditProductScreen to the seller's stack */}
                  <Stack.Screen name="SellerSettingsScreen" component={SellerSettingsScreen} />
                  <Stack.Screen name="EditProductScreen" component={EditProductScreen} /> 
                  <Stack.Screen name="ConnectedAccountsScreen" component={ConnectedAccountsScreen} />
                  <Stack.Screen name="ShippingInfoScreen" component={ShippingInfoScreen} />
                  <Stack.Screen name="PayoutMethodsScreen" component={PayoutMethodsScreen} />
                  <Stack.Screen name="SellerTransactionHistoryScreen" component={SellerTransactionHistoryScreen} />
                  <Stack.Screen name="ReturnPolicyScreen" component={ReturnPolicyScreen} />
                  <Stack.Screen name="BusinessInfoScreen" component={BusinessInfoScreen} />
                  <Stack.Screen name="EditShopProfileScreen" component={EditShopProfileScreen} />
                  <Stack.Screen name="SellerVerificationScreen" component={SellerVerificationScreen} />
                  <Stack.Screen name="SelectPickupScreen" component={SelectPickupScreen} />
                  <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
                  <Stack.Screen name="TermsOfServiceScreen" component={TermsOfServiceScreen} />
                  <Stack.Screen name="GoLiveScreen" component={GoLiveScreen} />
                </>
              ) : userRole === 'multi-role' ? (
                <>
                  <Stack.Screen name="RoleSelectionLogin" initialParams={{ availableRoles: availableRoles, setRole: setUserRole }}>
                    {props => <RoleSelectionLoginScreen {...props} />}
                  </Stack.Screen>
                  <Stack.Screen name="SelectPickupScreen" component={SelectPickupScreen} />
                  <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
                  <Stack.Screen name="TermsOfServiceScreen" component={TermsOfServiceScreen} />
                </>
              ) : userRole === 'transporter' ? (
                // Logged-in Transporter Flow
                <Stack.Screen name="TransporterHome" component={TransporterHomeScreen} />
              ) : userRole === 'depot' ? (
                // Logged-in Depot Flow
                <Stack.Screen name="DepotHome" component={DepotHomeScreen} />
              ) : ( // User is logged in as a Vendor (Seller, Depot, etc.)
                // Fallback for any other roles or if something is misconfigured
                // This will show the Welcome screen and allow them to log out or try again.
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </ProductProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
