// SplashScreen.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";

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
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // OUT-ANIMATION + navigate
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace("Welcome"); // ✅ Go to Welcome instead of Home
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  const theme = darkMode ? darkStyles : lightStyles;

  return (
    <View style={theme.container}>
      <Animated.Image
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
  logo: { width: 120, height: 120, marginBottom: 20, resizeMode: "contain" },
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
    resizeMode: "contain",
    tintColor: "#ff6f00",
  },
  appName: { fontSize: 28, fontWeight: "bold", color: "#ff6f00" },
});
