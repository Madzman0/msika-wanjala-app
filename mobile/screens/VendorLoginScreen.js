// VendorLoginScreen.js
import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

const VendorLoginScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(isDarkMode);
  return (
    <View style={styles.container}>
      {/* Logo & App Name */}
      <View style={styles.header}>
        <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>Msika Wanjala</Text>
        <Text style={styles.subtitle}>Choose your vendor role to continue</Text>
      </View>

      {/* Responsive container for the cards */}
      <View style={[styles.formContainer, width > 768 && styles.desktopFormContainer]}>
        {/* Vendor of the Week Notification */}
        <TouchableOpacity
          style={styles.notificationCard}
          onPress={() =>
            navigation.navigate("SellerHome", {
              // Pass vendor info to the profile screen
              vendorName: "Green Farm Ltd",
            })
          }
        >
          <View style={styles.notificationIcon}>
            <Ionicons name="trophy" size={24} color="#ffc107" />
          </View>
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationTitle}>Vendor of the Week</Text>
            <Text style={styles.notificationBody}>Congratulations to Green Farm Ltd!</Text>
          </View>
        </TouchableOpacity>

        {/* Card with options */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("GeneralLogin")}
          >
            <Ionicons name="storefront-outline" size={22} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Seller</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("GeneralLogin")}
          >
            <MaterialIcons name="warehouse" size={22} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Depot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("GeneralLogin")}
          >
            <FontAwesome5 name="truck" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Transporter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>
          Not a Vendor? <Text style={{ color: "#ff6f00", fontWeight: "bold" }}>Go Back</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VendorLoginScreen;

const getStyles = (isDarkMode) => {
  const theme = {
    background: isDarkMode ? "#121212" : "#f9fafb",
    card: isDarkMode ? "#1e1e1e" : "#ffffff",
    text: isDarkMode ? "#f0f0f0" : "#1f2937",
    textSecondary: isDarkMode ? "#b0b0b0" : "#6b7280",
    primary: "#ff6f00",
    notificationBg: isDarkMode ? "#332e1a" : "#fffbeb",
    notificationBorder: isDarkMode ? "#ffc107" : "#fde68a",
    notificationTitle: isDarkMode ? "#ff8f00" : "#d97706",
    notificationBody: isDarkMode ? "#ffecb3" : "#92400e",
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
      padding: 20,
    },
    header: {
      alignItems: "center",
      marginBottom: 30,
    },
    logo: {
      width: 90,
      height: 90,
      marginBottom: 10,
      tintColor: isDarkMode ? theme.primary : undefined,
    },
    appName: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.primary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 15,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
      marginBottom: 20,
    },
    notificationCard: {
      backgroundColor: theme.notificationBg,
      borderRadius: 15,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      borderColor: theme.notificationBorder,
      borderWidth: 1,
    },
    formContainer: {
      width: '100%',
    },
    desktopFormContainer: {
      maxWidth: 500,
      alignSelf: 'center',
    },
    notificationIcon: {
      marginRight: 15,
      backgroundColor: theme.card,
      padding: 8,
      borderRadius: 25,
    },
    notificationTextContainer: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.notificationTitle,
    },
    notificationBody: {
      fontSize: 14,
      color: theme.notificationBody,
      marginTop: 2,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 10,
      marginVertical: 8,
      paddingHorizontal: 15,
    },
    icon: {
      marginRight: 10,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    backButton: {
      marginTop: 25,
      alignItems: "center",
    },
    backText: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: "center",
    },
  });
};
