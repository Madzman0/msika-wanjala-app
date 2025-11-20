import React, { useState, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Animated,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from "../firebaseConfig";
import { ThemeContext } from "../context/ThemeContext";

const PostView = ({
  productName, setProductName,
  category, setCategory,
  price, setPrice,
  quantity, setQuantity,
  imageUrl, setImageUrl,
  description, setDescription,
  isUploading,
  expiresInDays, setExpiresInDays,
  handleImagePick,
  addProduct,
  products, // For "Your Recent Products"
  currentUser,
  shopName,
  setProducts,
  setNotifications,
  handleDeleteProduct,
  deletingProductId,
  navigation,
  setActiveTab,
}) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryY, setCategoryY] = useState(0);
  const [categoryHeight, setCategoryHeight] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const openCategoryModal = () => {
    setShowCategoryModal(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const closeCategoryModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start(() => setShowCategoryModal(false));
  };

  // Helper to upload image and get URL (duplicated from SellerHomeScreen for self-containment)
  const uploadImageAsync = async (uri, sellerId, productId) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `products/${sellerId}/${productId}-${Date.now()}`);
      const uploadTask = await uploadBytesResumable(storageRef, blob);

      blob.close(); // Release blob memory

      return await getDownloadURL(uploadTask.ref);
    } catch (e) {
      console.error("Upload Error:", e);
      return null;
    }
  };

  const handleAddProduct = async () => {
    if (!productName || !price || !category || !quantity) {
      Alert.alert("Missing Fields", "Please enter product name, price, category, and quantity.");
      return;
    }
    if (!currentUser?.sellerId) {
      Alert.alert("Error", "Could not find your Seller ID. Please re-login.");
      return;
    }

    // setIsUploading(true); // This state is passed from parent

    let uploadedImageUrl = "";
    // If an image was picked (it will be a local file URI)
    if (imageUrl && imageUrl.startsWith('file://')) {
      const newProductId = `prod_${Date.now()}`; // Generate a temporary ID for the image path
      const downloadUrl = await uploadImageAsync(imageUrl, currentUser.sellerId, newProductId);
      // setIsUploading(false); // This state is passed from parent
      if (!downloadUrl) {
        Alert.alert("Upload Failed", "Could not upload the product image. Please try again.");
        return;
      }
      uploadedImageUrl = downloadUrl;
    }

    const newProductData = {
      name: productName,
      category,
      price: Number(price) || 0,
      stock: Number(quantity) || 0,
      sellerName: currentUser.name || "Unknown Seller",
      sellerId: currentUser.sellerId,
      imageUrl: uploadedImageUrl,
      description,
      location: "Lilongwe", // Placeholder location
      views: 0,
      sales: 0,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "products"), newProductData);
      const newP = { id: docRef.id, ...newProductData };
      setProducts((prev) => [newP, ...prev]);
      setNotifications((prev) => [
        { id: `n${Date.now()}`, text: `You posted: "${newP.name}"`, time: Date.now(), read: false },
        ...prev,
      ]);
      // clear form
      setProductName("");
      setCategory("Electronics");
      setQuantity("");
      setPrice("");
      setImageUrl("");
      setDescription("");
      setExpiresInDays("14");
      Alert.alert("Success", "Your product has been listed!");
      setActiveTab("My Shop"); // Switch to see the new product
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Post Failed", "There was an error posting your product. Please try again.");
    } finally {
      // setIsUploading(false); // This state is passed from parent
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Post New Product</Text>
        <TextInput
          style={styles.input}
          placeholder="Product name*"
          placeholderTextColor="#888"
          value={productName}
          onChangeText={setProductName}
        />

        {/* Category Selector */}
        <TouchableOpacity
          style={[styles.input, { justifyContent: "center" }]}
          onPress={openCategoryModal}
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout;
            setCategoryY(y);
            setCategoryHeight(height);
          }}
        >
          <Text style={{ color: category ? "#111" : "#888" }}>
            {category || "Select Category"}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Quantity in Stock*"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <TextInput
          style={styles.input}
          placeholder="Price"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
        <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Ionicons name="camera-outline" size={32} color="#888" />
              <Text style={styles.imagePickerText}>Add Product Image</Text>
            </View>
          )}
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { height: 120 }]}
          placeholder="Description"
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Expires in (days)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={expiresInDays}
          onChangeText={setExpiresInDays}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, { backgroundColor: "#ff6f00" }]} onPress={handleAddProduct} disabled={isUploading}>
            <Text style={styles.buttonText}>Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#777" }]}
            onPress={() => {
              setProductName("");
              setCategory("Electronics");
              setQuantity("");
              setPrice("");
              setImageUrl("");
              setDescription("");
              setExpiresInDays("14");
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Category Dropdown */}
        {showCategoryModal && (
          <TouchableWithoutFeedback onPress={closeCategoryModal}>
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
              <Animated.View
                style={{
                  position: "absolute",
                  left: 16,
                  right: 16,
                  top: categoryY + categoryHeight,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  overflow: "hidden",
                  transform: [
                    {
                      scaleY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                    },
                  ],
                  opacity: slideAnim,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  elevation: 5,
                  transformOrigin: 'top',
                }}
              >
                {["Electronics", "Fashion", "Books", "Toys", "Groceries"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={{ paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: "#ddd" }}
                    onPress={() => {
                      setCategory(cat);
                      closeCategoryModal();
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        )}

        <View style={{ height: 12 }} />
        <Text style={[styles.header, { fontSize: 18 }]}>Your Recent Products</Text>

        {products.map((p) => (
          <View key={p.id} style={styles.modernProductRow}>
            <Image source={{ uri: p.imageUrl || "https://placekitten.com/200/200" }} style={styles.modernProductThumb} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: "700", fontSize: 16 }}>{p.name}</Text>
              <Text style={{ color: "#777", marginTop: 2 }}>{p.category} • MWK {p.price}</Text>
              <Text style={{ color: "#555", marginTop: 4 }}>Stock: {p.stock || 0}</Text>
              <Text style={{ color: "#555", marginTop: 4 }}>Views: {p.views || 0} | Likes: {p.likes || 0}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProductScreen', { product: p })}>
              <Ionicons name="create-outline" size={22} color={theme.primary} />
            </TouchableOpacity>
            {deletingProductId === p.id ? (
              <ActivityIndicator style={styles.deleteButton} color="#ef4444" />
            ) : (
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProduct(p)}>
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  scrollContainer: { padding: 16, paddingBottom: 120 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 16, color: "#111827" },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  imagePicker: {
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  imagePickerPlaceholder: { alignItems: 'center' },
  imagePickerText: { marginTop: 8, color: '#888' },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  button: { flex: 1, padding: 14, borderRadius: 12, marginHorizontal: 6, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  modernProductRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 14, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  modernProductThumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#f3f4f6" },
  editButton: { padding: 8 },
  deleteButton: { padding: 8, marginLeft: 8 },
});

export default PostView;