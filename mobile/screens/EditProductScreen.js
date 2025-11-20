// screens/EditProductScreen.js
import React, { useState, useContext } from 'react';
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
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../firebaseConfig';
import { ThemeContext } from '../context/ThemeContext';

export default function EditProductScreen({ route, navigation }) {
  const { product } = route.params;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [stock, setStock] = useState(product.stock.toString());
  const [description, setDescription] = useState(product.description);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = (e) => reject(new TypeError('Network request failed'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
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

  const handleUpdateProduct = async () => {
    if (!name || !price || !stock) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setIsUploading(true);
    let finalImageUrl = imageUrl;

    // If a new image was picked (it's a local file URI), upload it
    if (imageUrl && imageUrl.startsWith('file://')) {
      const downloadUrl = await uploadImageAsync(imageUrl);
      if (!downloadUrl) {
        setIsUploading(false);
        Alert.alert('Upload Failed', 'Could not upload the new image. Please try again.');
        return;
      }
      finalImageUrl = downloadUrl;
    }

    const productRef = doc(db, 'products', product.id);

    try {
      await updateDoc(productRef, {
        name: name,
        price: Number(price),
        stock: Number(stock),
        description: description,
        imageUrl: finalImageUrl,
      });
      Alert.alert('Success', 'Product updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = async () => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to permanently delete this product? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              // 1. Delete image from Firebase Storage if it exists
              if (product.imageUrl) {
                const storage = getStorage();
                const imageRef = ref(storage, product.imageUrl);
                await deleteObject(imageRef).catch((error) => {
                  // Don't block deletion if image not found, just log it
                  console.warn("Image deletion failed, maybe it was already removed:", error);
                });
              }

              // 2. Delete the product document from Firestore
              const productRef = doc(db, "products", product.id);
              await deleteDoc(productRef);

              Alert.alert("Success", "Product deleted successfully.");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Failed to delete product. Please try again.");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
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
        <Text style={styles.label}>Product Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Price (MWK)</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />

        <Text style={styles.label}>Quantity in Stock</Text>
        <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" />

        <Text style={styles.label}>Product Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
          ) : (
            <Text style={styles.imagePickerText}>Add Image</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} multiline />

        <TouchableOpacity style={styles.button} onPress={handleUpdateProduct} disabled={isUploading}>
          {isUploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteProduct} disabled={isDeleting}>
          {isDeleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Delete Product</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  formContainer: { padding: 16 },
  label: { fontSize: 15, fontWeight: '600', color: theme.textSecondary, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 12, backgroundColor: theme.card, fontSize: 16, color: theme.text },
  button: { backgroundColor: theme.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  imagePicker: { height: 180, backgroundColor: theme.input, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  previewImage: { width: '100%', height: '100%', borderRadius: 12 },
  imagePickerText: { color: theme.textSecondary },
});