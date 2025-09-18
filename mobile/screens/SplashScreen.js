// screens/SplashScreen.js
import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";

export default function SplashScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const [darkMode] = useState(false); // keep local; later use global theme

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      // OUT animation then go Welcome
      Animated.timing(fade, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => {
        navigation.replace("Welcome"); // go to Welcome (intro) first
      });
    }, 1800);

    return () => clearTimeout(t);
  }, [fade, scale, navigation]);

  const theme = darkMode ? darkStyles : lightStyles;

  return (
    <View style={theme.container}>
      <Animated.Image
        source={require("../assets/logo.png")}
        style={[theme.logo, { opacity: fade, transform: [{ scale }] }]}
      />
    </View>
  );
}

const lightStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ff6f00", justifyContent: "center", alignItems: "center" },
  logo: { width: 140, height: 140, resizeMode: "contain" },
});
const darkStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  logo: { width: 140, height: 140, resizeMode: "contain", tintColor: "#ff6f00" },
});
