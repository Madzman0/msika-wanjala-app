// screens/EditProductScreen.js
import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '../firebaseConfig';
import { ThemeContext } from '../context/ThemeContext';

export default function EditProductScreen({ route, navigation }) {
  const { product } = route.params;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [name, setName] = useState(product.name || '');
  const [category, setCategory] = useState(product.category || '');
  const [price, setPrice] = useState(product.price?.toString() || '');
  const [stock, setStock] = useState(product.stock?.toString() || '');
  const [description, setDescription] = useState(product.description || '');
  const [imageUrl, setImageUrl] = useState(product.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () { resolve(xhr.response); };
      xhr.onerror = function (e) { reject(new TypeError("Network request failed")); };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `products/${product.sellerId}/${product.id}-${Date.now()}`);
      const uploadTask = await uploadBytesResumable(storageRef, blob);
      blob.close();
      return await getDownloadURL(uploadTask.ref);
    } catch (e) {
      console.error("Upload Error:", e);
      return null;
    }
  };

  const handleSaveChanges = async () => {
    if (!name || !price || !stock) {
      Alert.alert("Missing Fields", "Please fill in the name, price, and stock fields.");
      return;
    }

    setIsUploading(true);
    let finalImageUrl = imageUrl;

    // If a new image was picked, upload it
    if (imageUrl && imageUrl.startsWith('file://')) {
      const downloadUrl = await uploadImageAsync(imageUrl);
      if (!downloadUrl) {
        setIsUploading(false);
        Alert.alert("Upload Failed", "Could not upload the new image. Please try again.");
        return;
      }
      finalImageUrl = downloadUrl;
    }

    const productRef = doc(db, "products", product.id);

    try {
      await updateDoc(productRef, {
        name,
        category,
        price: Number(price),
        stock: Number(stock),
        description,
        imageUrl: finalImageUrl,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Success", "Product updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating product:", error);
      Alert.alert("Update Failed", "There was an error updating your product.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Ionicons name="camera-outline" size={32} color="#888" />
              <Text style={styles.imagePickerText}>Change Product Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
        <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Stock Quantity" value={stock} onChangeText={setStock} keyboardType="numeric" />
        <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} placeholder="Description" value={description} onChangeText={setDescription} multiline />

        <TouchableOpacity style={styles.button} onPress={handleSaveChanges} disabled={isUploading}>
          {isUploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  formContainer: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: theme.input,
    fontSize: 16,
    marginBottom: 12,
    color: theme.text,
  },
  button: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  imagePicker: {
    height: 180,
    backgroundColor: theme.input,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  imagePickerPlaceholder: { alignItems: 'center' },
  imagePickerText: { marginTop: 8, color: theme.textSecondary },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
});