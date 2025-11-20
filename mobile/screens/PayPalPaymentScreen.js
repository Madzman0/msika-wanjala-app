import React, { useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function PayPalPaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // In a real app, these would be passed from the checkout screen
  const { total, items, address, deliveryOption, discount } = route.params;

  // This is where you would have your server endpoint that initiates the PayPal payment.
  // For this example, we'll use a mock HTML page to simulate the flow.
  const paymentUrl = `https://your-server.com/create-payment?amount=${total}&method=${route.params.method}`;

  // This mock HTML simulates the page your server would redirect to after PayPal processes the payment.
  // It uses `postMessage` to communicate the result back to your React Native app.
  const mockSuccessHtml = `
    <html>
      <body style="display:flex; justify-content:center; align-items:center; height:100vh; background-color:${theme.background}; color:${theme.text}; font-family:sans-serif;">
        <div>
          <h2>Simulating Payment...</h2>
          <p>Click below to simulate a successful payment.</p>
          <button 
            onclick="window.ReactNativeWebView.postMessage('SUCCESS')" 
            style="padding:10px 20px; background-color:#28a745; color:white; border:none; border-radius:5px; font-size:16px;">
            Simulate Success
          </button>
        </div>
        <script>
          // In a real scenario, this would be triggered automatically on page load after PayPal redirects.
        </script>
      </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    const message = event.nativeEvent.data;

    if (message === 'SUCCESS') {
      // Payment was successful, navigate to the confirmation screen
      navigation.replace('ConfirmationScreen', {
        total,
        items,
        address,
        deliveryOption,
        discount,
        method: route.params.method, // Pass the method dynamically
      });
    } else if (message === 'CANCEL') {
      // Payment was cancelled
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={{ width: 24 }} />
      </View>
      <WebView
        source={{ html: mockSuccessHtml }} // In a real app: source={{ uri: paymentUrl }}
        onMessage={handleWebViewMessage}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>Connecting to payment gateway...</Text>
          </View>
        )}
      />
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: 40, // Adjust for status bar
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 10,
    color: theme.text,
  },
});