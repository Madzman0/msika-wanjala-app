// SplashScreen.js
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Image, Animated } from "react-native";

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current; // fade in/out
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // pop in
  const [darkMode] = useState(false); // simulate dark mode

  useEffect(() => {
    // IN-ANIMATION (fade + scale in)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false, // Changed to false for web compatibility
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: false, // Changed to false for web compatibility
      }),
    ]).start();

  }, [fadeAnim, scaleAnim]);

  const theme = darkMode ? darkStyles : lightStyles;

  return (
    <View style={theme.container}>
      <Animated.Image
        resizeMode="contain"
        source={require("../assets/logo.png")}
        style={[
          theme.logo,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      />
      <Animated.Text style={[theme.appName, { opacity: fadeAnim }]}>
        Msika Wanjala
      </Animated.Text>
    </View>
  );
}

// LIGHT THEME
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ff6f00",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 120, height: 120, marginBottom: 20 },
  appName: { fontSize: 28, fontWeight: "bold", color: "#fff" },
});

// DARK THEME
const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    tintColor: "#ff6f00",
  },
  appName: { fontSize: 28, fontWeight: "bold", color: "#ff6f00" },
});
