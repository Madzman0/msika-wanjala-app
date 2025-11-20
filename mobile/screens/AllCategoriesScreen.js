// screens/AllCategoriesScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const allCategories = [
  { name: "Clothes", icon: "shirt-outline" },
  { name: "Shoes", icon: "footsteps-outline" },
  { name: "Electronics", icon: "phone-portrait-outline" },
  { name: "Food", icon: "fast-food-outline" },
  { name: "Beauty", icon: "sparkles-outline" },
  { name: "Books", icon: "book-outline" },
  { name: "Home Goods", icon: "home-outline" },
  { name: "Sports", icon: "basketball-outline" },
  { name: "Toys", icon: "game-controller-outline" },
  { name: "Automotive", icon: "car-sport-outline" },
];

export default function AllCategoriesScreen({ navigation }) {
  // Get screen width and determine number of columns for the grid
  const { width } = useWindowDimensions();
  const getNumColumns = () => {
    if (width >= 1200) return 4; // Large PC screens
    if (width >= 768) return 3;  // Tablets
    return 2; // Mobile
  };
  const numColumns = getNumColumns();

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // You can navigate to a filtered product list here
        // For now, it just goes back.
        navigation.goBack();
      }}
    >
      <Ionicons name={item.icon} size={32} color="#ff6f00" />
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Categories</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={allCategories}
        renderItem={renderCategory}
        key={numColumns} // Force re-render on column change
        numColumns={numColumns}
        keyExtractor={(item) => `category-${item.name}`}
        contentContainerStyle={styles.grid}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#272727",
    backgroundColor: "#1e1e1e",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  grid: {
    padding: 10,
  },
  card: {
    flex: 1,
    margin: 8,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});