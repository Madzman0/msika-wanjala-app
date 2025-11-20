// screens/SellerProfileViewScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { ThemeContext } from '../context/ThemeContext';

export default function SellerProfileViewScreen({ route, navigation }) {
  const { sellerId } = route.params; // Receive the seller's UID
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) {
      Alert.alert("Error", "Seller ID was not provided.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch seller details from the 'users' collection using the provided sellerId
        const sellerDocRef = doc(db, "users", sellerId);
        const sellerDoc = await getDoc(sellerDocRef);

        if (sellerDoc.exists()) {
          // Add the uid to the seller object for later use in messaging
          setSeller({ uid: sellerDoc.id, ...sellerDoc.data() });
        } else {
          console.log("No such seller document for ID:", sellerId);
          Alert.alert("Error", "Could not find seller profile.");
          navigation.goBack();
          return;
        }

        // 2. Fetch seller products from the 'products' collection
        const productsQuery = query(collection(db, "products"), where("sellerId", "==", sellerId));
        const productsSnapshot = await getDocs(productsQuery);
        const sellerProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(sellerProducts);

      } catch (error) {
        console.error("Error fetching seller profile:", error);
        Alert.alert("Error", "Could not load seller profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  const handleMessageSeller = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Please Login", "You need to be logged in to contact a seller.");
      return;
    }
    if (currentUser.uid === sellerId) {
      Alert.alert("This is You!", "You cannot message yourself.");
      return;
    }

    const chatId = [currentUser.uid, sellerId].sort().join('_');
    const chatRef = doc(db, "chats", chatId);

    try {
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          userIds: [currentUser.uid, sellerId],
          createdAt: serverTimestamp(),
          lastMessage: `Chat started with ${seller.name}.`,
          lastMessageAt: serverTimestamp(),
        });
      }
      navigation.navigate("ChatScreen", { chatId, chatName: seller.name, chatPhotoURL: seller.photoURL });
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Could not start the chat.");
    }
  };

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} /></SafeAreaView>;
  }

  if (!seller) {
    return <SafeAreaView style={styles.container}><Text style={styles.errorText}>Seller profile could not be loaded.</Text></SafeAreaView>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={seller.bannerURL ? { uri: seller.bannerURL } : require('../assets/tourism1.jpg')} style={styles.coverPhoto} />
        <View style={styles.profileInfo}>
          <Image source={seller.photoURL ? { uri: seller.photoURL } : require('../assets/product1.jpg')} style={styles.profilePic} />
          <Text style={styles.sellerName}>{seller.name}</Text>
          <Text style={styles.sellerSlogan}>{seller.slogan || 'Quality products, great prices.'}</Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.messageButton} onPress={handleMessageSeller}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
        <Text style={styles.messageButtonText}>Message Seller</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Products from {seller.name}</Text>
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => ( // Make products tappable to view details
            <TouchableOpacity style={styles.productCard} onPress={() => navigation.navigate('BuyerHomeScreen', { featuredProductId: item.id })}>
              <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productPrice}>MWK {item.price.toLocaleString()}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.errorText}>This seller has no products yet.</Text>}
        />
      </View>
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { marginBottom: 60 },
  coverPhoto: { width: '100%', height: 200 },
  profileInfo: { alignItems: 'center', marginTop: -50 },
  profilePic: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: theme.background },
  sellerName: { fontSize: 24, fontWeight: 'bold', color: theme.text, marginTop: 8 },
  sellerSlogan: { fontSize: 15, color: theme.textSecondary, marginTop: 4 },
  backButton: { position: 'absolute', top: 40, left: 15, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20 },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    marginTop: 16,
  },
  messageButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 16 },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: theme.card,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  productImage: { width: '100%', height: 120 },
  productName: { fontSize: 15, fontWeight: '600', color: theme.text, paddingHorizontal: 8, marginTop: 8 },
  productPrice: { fontSize: 14, color: theme.primary, fontWeight: 'bold', paddingHorizontal: 8, paddingBottom: 10, marginTop: 4 },
  errorText: { textAlign: 'center', color: theme.textSecondary, marginTop: 20, fontStyle: 'italic' },
});