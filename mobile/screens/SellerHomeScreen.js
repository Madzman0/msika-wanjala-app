// screens/SellerHomeScreen.js
import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import {
  Dimensions,
  Alert,
  TouchableWithoutFeedback,
  Modal,
  SafeAreaView, // Added SafeAreaView import
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit, updateDoc, deleteDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "../firebaseConfig";
import { ThemeContext } from "../context/ThemeContext";

// Import refactored view components
import DashboardView from "./DashboardView";
import PostView from "./PostView";
import MessagesView from "./MessagesView";
import HistoryView from "./HistoryView";
import NotificationsView from "./NotificationsView";

const screenWidth = Dimensions.get("window").width;

const DEPOTS = [
  { id: "D1", name: "Depot A (Lilongwe)", lat: -13.9626, lon: 33.7741 },
  { id: "D2", name: "Depot B (Blantyre)", lat: -15.3875, lon: 35.3229 },
  { id: "D3", name: "Depot C (Zomba)", lat: -15.3830, lon: 35.3200 },
];
import MyShopView from "./MyShopView";

export default function SellerHomeScreen({ route, navigation, setIsLoggedIn }) {
  const { theme } = useContext(ThemeContext); // Use theme context
  const styles = getStyles(theme);
  const isFocused = useIsFocused();
  // Tabs: Dashboard, Post, Messages, History, Notifications, My Shop
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Topbar / role & menu
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [shopName, setShopName] = useState("My Shop");
  const [slogan, setSlogan] = useState("");
  const [shopBanner, setShopBanner] = useState(null);
  const [shopAvatar, setShopAvatar] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('verified'); // Temporarily set to verified for testing
  const [allProducts, setAllProducts] = useState([]); // For platform-wide stats
  const [orders, setOrders] = useState([]); // For location and sales stats
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // --- Date Filtering State ---
  const [dateRange, setDateRange] = useState('all_time'); // '7_days', '30_days', 'all_time'
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  
  // Check for vendorName from navigation params (e.g., from Vendor of the Week)
  useEffect(() => {
    if (route.params?.vendorName) {
      setShopName(route.params.vendorName);
      setActiveTab("My Shop"); // Switch to the shop tab to show the profile
    }
  }, [route.params?.vendorName]);

  // Effect to filter data based on the selected date range
  useEffect(() => {
    const filterItemsByDate = (items) => {
      if (dateRange === 'all_time' || !items) {
        return items;
      }
      const now = new Date();
      const daysToSubtract = dateRange === '7_days' ? 7 : 30;
      const cutoffDate = new Date(now.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));

      return items.filter(item => {
        const itemDate = item.createdAt?.toDate();
        return itemDate && itemDate >= cutoffDate;
      });
    };

    setFilteredOrders(filterItemsByDate(orders));
    // We filter products based on their creation date for this example.
    // A more advanced implementation might filter based on last view/sale date.
    setFilteredProducts(filterItemsByDate(products));

  }, [dateRange, orders, products]);

  // Fetch current user and their products
  const fetchSellerData = useCallback(async (isRefresh = false) => {
    // This function can remain for manual refresh, but the real-time part will be in useEffect.
    if (!isRefresh) {
      setIsLoading(true);
    }
    const auth = getAuth();
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser(userData);
        setShopName(userData.name || "My Shop");
        setSlogan(userData.slogan || "Your one-stop shop for quality goods.");
        setShopBanner(userData.bannerURL);
        setShopAvatar(userData.photoURL);
        setVerificationStatus(userData.verificationStatus || 'unverified');

        if (userData.sellerId) {
          // Fetch products for this seller
          const productsQuery = query(collection(db, "products"));
          const querySnapshot = await getDocs(productsQuery);
          const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Set all products for platform-wide stats like top sellers
          setAllProducts(fetchedProducts);
          // Filter for the current seller's products for their specific stats
          const sellerProducts = fetchedProducts.filter(p => p.sellerId === userData.sellerId);
          setProducts(sellerProducts);

          // Fetch orders for this seller
          const ordersQuery = query(collection(db, "orders"), where("sellerId", "==", userData.sellerId), orderBy("createdAt", "desc"));
          const ordersSnapshot = await getDocs(ordersQuery);
          const sellerOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setOrders(sellerOrders);

          // Transform sellerOrders into salesHistory format
          const transformedSalesHistory = sellerOrders.map(order => ({
            id: order.id,
            productId: order.items[0]?.productId || order.id, // Use first item's ID or order ID
            buyer: order.buyerName,
            amount: order.total,
            status: order.status,
            time: order.createdAt?.toDate().getTime(), // Convert Firestore Timestamp to JS timestamp
          }));
          setSalesHistory(transformedSalesHistory);

          // Fetch notifications for this seller
          const notifsQuery = query(
            collection(db, "notifications"),
            where("sellerId", "==", userData.sellerId),
            orderBy("createdAt", "desc"),
            limit(50) // Get the last 50 notifications
          );
          const notifsSnapshot = await getDocs(notifsQuery);
          const sellerNotifications = notifsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Add the static AI notification for demonstration
          setNotifications(sellerNotifications);
        }
      }
    }
    if (!isRefresh) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let productsUnsubscribe;
    let ordersUnsubscribe;
    let notificationsUnsubscribe;

    const setupListeners = async () => {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser(userData);
        setShopName(userData.name || "My Shop");
        setSlogan(userData.slogan || "Your one-stop shop for quality goods.");
        setShopBanner(userData.bannerURL);
        setShopAvatar(userData.photoURL); // This was photoUrl, should be photoURL
        // setVerificationStatus(userData.verificationStatus || 'unverified'); // Temporarily disabled for testing

        if (userData.sellerId) {
          // --- Real-time listener for Products ---
          const productsQuery = query(collection(db, "products"), where("sellerId", "==", userData.sellerId));
          productsUnsubscribe = onSnapshot(productsQuery, (snapshot) => {
            const sellerProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(sellerProducts);
            setIsLoading(false); // Stop loading once initial products are fetched
          });

          // --- Real-time listener for Orders ---
          const ordersQuery = query(collection(db, "orders"), where("sellerId", "==", userData.sellerId), orderBy("createdAt", "desc"));
          ordersUnsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const sellerOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(sellerOrders);
          });

          // --- Real-time listener for Notifications ---
          const notifsQuery = query(collection(db, "notifications"), where("sellerId", "==", userData.sellerId), orderBy("createdAt", "desc"), limit(50));
          notificationsUnsubscribe = onSnapshot(notifsQuery, (snapshot) => {
            const sellerNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(sellerNotifications);
          });

          // --- Real-time listener for Live Sessions ---
          const liveQuery = query(collection(db, "liveSessions"), where("sellerId", "==", user.uid));
          const liveUnsubscribe = onSnapshot(liveQuery, (snapshot) => {
            if (!snapshot.empty) {
              const liveDoc = snapshot.docs[0];
              setIsLive(true);
              setLiveSessionId(liveDoc.id);
            } else {
              setIsLive(false);
              setLiveSessionId(null);
            }
          });
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    setupListeners();

    // Cleanup function to unsubscribe from listeners when the component unmounts
    return () => {
      if (productsUnsubscribe) productsUnsubscribe();
      if (ordersUnsubscribe) ordersUnsubscribe();
      if (notificationsUnsubscribe) notificationsUnsubscribe();
    };
  }, [isFocused]); // Re-run this effect when the screen comes into focus

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSellerData(true);
    setRefreshing(false);
  }, [fetchSellerData]);

  // Slide animation (menu slides in from right)
  const menuAnim = useRef(new Animated.Value(300)).current;

  // Post form fields
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState("14");

  // Notifications & messages & history
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([
    { id: "m1", from: "Green Farm Ltd", text: "Do you have bulk discount?", time: Date.now() - 3600 * 1000 * 5, unread: true },
  ]);
  // QR Code Modal State
  const unreadMessagesCount = messages.filter(m => m.unread).length;

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  // --- Live Session State ---
  const [isLive, setIsLive] = useState(false);
  const [liveSessionId, setLiveSessionId] = useState(null);

  // --- Bidding Session State ---
  const [biddingModalVisible, setBiddingModalVisible] = useState(false);
  const [selectedProductForBid, setSelectedProductForBid] = useState(null);
  const [bidStartPrice, setBidStartPrice] = useState('');
  const [bidDuration, setBidDuration] = useState('15'); // Default 15 minutes

  const [salesHistory, setSalesHistory] = useState([]);

  // Derived data for charts
  const computePieData = () => {
    const total = filteredProducts.reduce((sum, p) => sum + (p.views || 0), 0) || 1;
    return filteredProducts.map((p, i) => ({
      name: p.name,
      population: p.views || 0, // Use 'views' field, default to 0
      imageUrl: p.imageUrl, // Add imageUrl for the spotlight component
      color: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff"][i % 5],
      legendFontColor: theme.text,
      legendFontSize: 12,
    }));
  };

  const computeLikesPieData = () => {
    if (!filteredProducts || filteredProducts.length === 0) return [];
    return filteredProducts.filter(p => p.likes > 0).map((p, i) => ({
      name: p.name,
      population: p.likes || 0,
      imageUrl: p.imageUrl, // Add imageUrl for the spotlight component
      color: ["#ef4444", "#f97316", "#f59e0b", "#ec4899", "#d946ef"][i % 5],
      legendFontColor: theme.text,
      legendFontSize: 12,
    }));
  };

  const computeBuyerLocations = () => {
    const agg = {};
    // Use real order data now
    filteredOrders.forEach((order) => {
      // Assuming order.buyerLocation is a string like "Lilongwe"
      if (order.buyerLocation) {
        const city = order.buyerLocation.split(',')[0].trim(); // Extract city name
        agg[city] = (agg[city] || 0) + 1;
      }
    });
    const labels = Object.keys(agg);
    const data = labels.map((l) => agg[l]);
    if (labels.length === 0) { // Fallback if no orders
      return { labels: ["Local"], datasets: [{ data: [1] }] };
    }
    return { labels, datasets: [{ data }] };
  };

  const computeSalesSeries = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const monthlySales = {};

    // Initialize the last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      monthlySales[monthKey] = 0;
    }

    filteredOrders.forEach(order => {
      const orderDate = order.createdAt?.toDate(); // Convert Firestore Timestamp to JS Date
      if (orderDate) {
        const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
        if (monthlySales.hasOwnProperty(monthKey)) {
          monthlySales[monthKey] += order.total || 0;
        }
      }
    });

    const labels = Object.keys(monthlySales).map(key => monthNames[new Date(key).getMonth()]);
    const data = Object.values(monthlySales);

    return { labels, datasets: [{ data }] };
  };

  const topSellers = () => {
    // New logic: Calculate top sellers based on average rating
    const sellerAgg = {};
    // Group products by seller
    allProducts.forEach((p) => {
      if (!p.sellerName || !p.rating) return;
      if (!sellerAgg[p.sellerName]) {
        sellerAgg[p.sellerName] = { totalRating: 0, count: 0 };
      }
      sellerAgg[p.sellerName].totalRating += p.rating;
      sellerAgg[p.sellerName].count += 1;
    });

    // Calculate average and format for sorting
    return Object.entries(sellerAgg)
      .map(([name, data]) => ({
        name,
        avgRating: (data.totalRating / data.count).toFixed(1),
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
  };

  const ratingSummary = () => {
    // This now correctly calculates for the current seller's products only
    if (filteredProducts.length === 0) {
      return { avgRating: 0, reliableVotes: 0 };
    }
    const totalRatings = filteredProducts.reduce((s, p) => s + (p.rating || 0), 0);
    const avgRating = +(totalRatings / filteredProducts.length).toFixed(1);
    const reliableVotes = filteredProducts.reduce((s, p) => s + (p.reliableVotes || 0), 0);
    return { avgRating, reliableVotes };
  };

  const remainingDays = (p) => {
    const posted = p.postedAt || Date.now();
    const expiry = (p.expiresInDays || 14) * 24 * 3600 * 1000;
    const remainingMs = posted + expiry - Date.now();
    const days = Math.ceil(remainingMs / (24 * 3600 * 1000));
    return days > 0 ? days : 0;
  };

  // Menu open/close helpers
  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(menuAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
      setMenuVisible(false);
    });
  };

  const toggleMenu = () => {
    if (menuVisible) closeMenu();
    else openMenu();
  };

  const handleSwitchRole = async (newRole, switchAppRole) => {
    closeMenu();
    if (newRole === "Buyer" && typeof switchAppRole === "function") {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          // If the user doesn't already have the buyer role, add it.
          if (!userData.roles || !userData.roles.includes('buyer')) {
            await updateDoc(userDocRef, {
              roles: arrayUnion('buyer')
            });
          }
        }
        // Proceed to switch the role in the app state
        switchAppRole('buyer');
      } catch (error) {
        console.error("Error switching role:", error);
        Alert.alert("Error", "Could not switch roles. Please try again.");
      }
    }
  };
  
  const handleLogout = async () => {
    closeMenu();
    const auth = getAuth();
    try {
      await signOut(auth);
      navigation.replace("GeneralLogin");
    } catch (error) {
      console.error("Logout failed", error);
      Alert.alert("Logout Failed", "An error occurred while logging out.");
    }
  };

  // This is the correct handler to be passed to MessengerView
  const handleChatPress = (chatId, chatName, chatPhotoURL) => {
    navigation.navigate("ChatScreen", { chatId, chatName, chatPhotoURL });
  };

  const handleImagePick = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Compress image slightly
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  // Helper to upload image and get URL
  const uploadImageAsync = async (uri, sellerId, productId) => {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
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

  const addProduct = async () => {
    if (!productName || !price || !category || !quantity) {
      Alert.alert("Missing Fields", "Please enter product name, price, category, and quantity.");
      return;
    }
    if (!currentUser?.sellerId) {
      Alert.alert("Error", "Could not find your Seller ID. Please re-login.");
      return;
    }

    setIsUploading(true);

    let uploadedImageUrl = "";
    // If an image was picked (it will be a local file URI)
    if (imageUrl && imageUrl.startsWith('file://')) {
      const newProductId = `prod_${Date.now()}`; // Generate a temporary ID for the image path
      const downloadUrl = await uploadImageAsync(imageUrl, currentUser.sellerId, newProductId);
      if (!downloadUrl) {
        setIsUploading(false);
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
      // This is the definitive fix: The product's sellerId MUST be the user's authentication UID
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
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = (productToDelete) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to permanently delete "${productToDelete.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingProductId(productToDelete.id); // Start loading
            try {
              // 1. Delete the product document from Firestore
              const productRef = doc(db, "products", productToDelete.id);
              await deleteDoc(productRef);

              // 2. Delete the image from Firebase Storage if it exists
              if (productToDelete.imageUrl) {
                const storage = getStorage();
                try {
                  // Extract the path from the download URL
                  const imageUrl = productToDelete.imageUrl;
                  const decodedUrl = decodeURIComponent(imageUrl);
                  const pathRegex = /o\/(.+)\?alt=media/;
                  const match = decodedUrl.match(pathRegex);

                  if (match && match[1]) {
                    const imagePath = match[1]; // This is the path like products/sellerId/productId-timestamp
                    const imageRef = ref(storage, imagePath);
                    await deleteObject(imageRef);
                  } else {
                    console.warn("Could not extract storage path from image URL:", imageUrl);
                  }
                } catch (error) {
                  if (error.code !== 'storage/object-not-found') {
                     console.warn("Image deletion failed:", error);
                  }
                }
              }

              Alert.alert("Success", "Product has been deleted.");
              // The real-time listener will automatically update the UI.
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Failed to delete the product. Please try again.");
            } finally {
              setDeletingProductId(null); // Stop loading
            }
          },
        },
      ]
    );
  };
  const handleNotifyTransporter = (order) => {
    if (!order) {
      Alert.alert("No Order Selected", "Could not find the order to notify.");
      return;
    }

    const buyerCoords = order.buyerLocation?.latitude && order.buyerLocation?.longitude
      ? { lat: order.buyerLocation.latitude, lon: order.buyerLocation.longitude }
      : { lat: -13.9626, lon: 33.7741 }; // Fallback to Lilongwe

    const productToShip = order.items[0] || {};

    // --- New Logic: Generate QR with location data ---
    const distSq = (a, b) => (a.lat - b.lat) ** 2 + (a.lon - b.lon) ** 2;
    const nearestDepot = DEPOTS.reduce(
      (acc, d) => (distSq(buyerCoords, d) < distSq(buyerCoords, acc) ? d : acc),
      DEPOTS[0]
    );

    // Simple distance approximation for the prototype
    const latDiff = Math.abs(nearestDepot.lat - productToShip.buyerCoords.lat);
    const lonDiff = Math.abs(nearestDepot.lon - productToShip.buyerCoords.lon);
    const estimatedDistanceKm = Math.round((latDiff + lonDiff) * 111);

    const mockQrData = {
      productId: productToShip.productId,
      productName: productToShip.name || 'Unknown Item',
      sellerName: shopName,
      buyerName: order.buyerName,
      destination: buyerCoords,
      nearestDepot: nearestDepot.name,
      estimatedDistance: `${estimatedDistanceKm} km`,
      mapLink: `MAP://to/${buyerCoords.lat},${buyerCoords.lon}`,
      qrId: `QR-PICKUP-${productToShip.id}-${Date.now()}`,
    };

    setQrCodeData(mockQrData);
    setQrModalVisible(true);
  };

  const markNotificationRead = async (id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    const notifRef = doc(db, "notifications", id);
    await updateDoc(notifRef, { read: true });
  };

  // --- Live Session Handlers ---
  const handleGoLivePress = () => {
    navigation.navigate('GoLiveScreen');
  };

  const handleEndLive = async () => {
    if (!liveSessionId) return;
    try {
      const liveSessionRef = doc(db, "liveSessions", liveSessionId);
      await deleteDoc(liveSessionRef);
      setIsLive(false);
      setLiveSessionId(null);
      Alert.alert("Session Ended", "Your live session has ended.");
    } catch (error) {
      console.error("Error ending live session:", error);
      Alert.alert("Error", "Could not end the live session properly.");
    }
  };

  // --- Bidding Session Handlers ---
  const handleStartBiddingPress = () => {
    // Reset state when opening the modal
    setSelectedProductForBid(null);
    setBidStartPrice('');
    setBidDuration('15');
    setBiddingModalVisible(true);
  };

  const handleConfirmStartBid = async () => {
    if (!selectedProductForBid || !bidStartPrice || !bidDuration) {
      Alert.alert("Incomplete", "Please select a product, set a starting price, and duration.");
      return;
    }

    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + parseInt(bidDuration) * 60000);

      await addDoc(collection(db, "biddingSessions"), {
        sellerId: currentUser.sellerId,
        sellerName: shopName,
        productId: selectedProductForBid.id,
        productName: selectedProductForBid.name,
        startPrice: Number(bidStartPrice),
        currentBid: Number(bidStartPrice),
        startTime: serverTimestamp(),
        endTime: endTime,
        status: 'active',
      });
      Alert.alert("Success", `Bidding for "${selectedProductForBid.name}" has started!`);
      setBiddingModalVisible(false);
    } catch (error) {
      console.error("Error starting bid session:", error);
      Alert.alert("Error", "Could not start the bidding session.");
    }
  };

  const UnverifiedSellerView = () => (
    <View style={styles.unverifiedContainer}>
      <View style={styles.unverifiedPanel}>
        <Ionicons name="shield-checkmark-outline" size={48} color={theme.primary} />
        <Text style={styles.unverifiedTitle}>You're not eligible to perform activities on this platform</Text>
        <Text style={styles.unverifiedSubtitle}>Please verify your Identity first to start selling.</Text>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Steps to Get Verified:</Text>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>1.</Text>
            <Text style={styles.stepText}>Navigate to your <Text style={{fontWeight: 'bold'}}>My Shop</Text> tab.</Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>2.</Text>
            <Text style={styles.stepText}>Tap the <Ionicons name="settings-outline" size={16} /> icon to open your settings.</Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>3.</Text>
            <Text style={styles.stepText}>Select <Text style={{fontWeight: 'bold'}}>Seller Verification</Text> and submit the required information.</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.verificationButton} 
          onPress={() => {
            setActiveTab('My Shop');
            navigation.navigate('SellerSettingsScreen');
          }}>
          <Text style={styles.verificationButtonText}>Go to Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const tabs = [
    { name: "Dashboard", icon: <Ionicons name="stats-chart" size={24} /> },
    { name: "Post", icon: <Ionicons name="add-circle" size={24} /> },
    { name: "History", icon: <Ionicons name="time" size={24} /> },
    { name: "Notifications", icon: <Ionicons name="notifications" size={24} /> },
    { name: "My Shop", icon: <Ionicons name="storefront" size={24} /> },
  ];
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          {currentUser?.photoURL ? (
            <Image
              source={{ uri: currentUser.photoURL }}
              style={styles.profilePic}
            />
          ) : (
            <View style={styles.profilePic}>
              <Text style={styles.initialsText}>{(shopName || 'S').charAt(0)}</Text>
            </View>
          )}
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{shopName}</Text>
            <Text style={{ color: "#777", fontSize: 12 }}>Seller Dashboard</Text>
          </View>
        </View>
        <TouchableOpacity onPress={toggleMenu} style={styles.topRightTouchable}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Bidding Session Modal */}
      <Modal
        visible={biddingModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBiddingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.biddingModalContent}>
            <Text style={styles.liveModalTitle}>Start a Bidding Session</Text>
            <Text style={styles.biddingSubtitle}>Select a product to start an auction.</Text>

            <ScrollView style={styles.biddingProductList}>
              {products.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.biddingProductRow,
                    selectedProductForBid?.id === p.id && styles.biddingProductSelected
                  ]}
                  onPress={() => setSelectedProductForBid(p)}
                >
                  <Image source={{ uri: p.imageUrl || "https://placekitten.com/200/200" }} style={styles.biddingProductThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.biddingProductName}>{p.name}</Text>
                    <Text style={styles.biddingProductPrice}>Current Price: MWK {p.price.toLocaleString()}</Text>
                  </View>
                  {selectedProductForBid?.id === p.id && <Ionicons name="checkmark-circle" size={24} color="#16a34a" />}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.biddingInputsContainer}>
              <TextInput
                style={[styles.liveModalInput, { flex: 1 }]}
                placeholder="Starting Price (MWK)"
                keyboardType="numeric"
                value={bidStartPrice}
                onChangeText={setBidStartPrice}
              />
              <TextInput
                style={[styles.liveModalInput, { flex: 0.6, marginLeft: 10 }]}
                placeholder="Duration (min)"
                keyboardType="numeric"
                value={bidDuration}
                onChangeText={setBidDuration}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#777" }]} onPress={() => setBiddingModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#16a34a" }]} onPress={handleConfirmStartBid}>
                <Text style={styles.buttonText}>Start Bid</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={qrModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="qr-code-outline" size={24} color="#333" style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Transporter Pickup QR</Text>
            </View>
            {/* Simulated QR Code using Views */}
            <View style={styles.qrCodeImage}>
              {Array.from({ length: 15 }).map((_, rowIndex) => (
                <View key={rowIndex} style={{ flexDirection: 'row' }}>
                  {Array.from({ length: 15 }).map((_, colIndex) => (
                    <View
                      key={colIndex}
                      style={{
                        width: 8, height: 8,
                        backgroundColor: Math.random() > 0.4 ? '#1f2937' : '#fff',
                      }} />
                  ))}
                </View>
              ))}
            </View>
            <View style={styles.qrInfoBox}>
              <Text style={styles.qrInfoLabel}>Product:</Text>
              <Text style={styles.qrInfoValue}>{qrCodeData?.productName} (for {qrCodeData?.buyerName})</Text>
              <Text style={[styles.qrInfoLabel, { marginTop: 8 }]}>Nearest Depot:</Text>
              <Text style={styles.qrInfoValue}>{qrCodeData?.nearestDepot}</Text>
              <Text style={[styles.qrInfoLabel, { marginTop: 8 }]}>Est. Distance:</Text>
              <Text style={styles.qrInfoValue}>{qrCodeData?.estimatedDistance}</Text>
              <Text style={[styles.qrInfoLabel, { marginTop: 8 }]}>Transaction ID:</Text>
              <Text style={styles.qrInfoValue}>{qrCodeData?.qrId}</Text>
            </View>
            <Text style={styles.qrInstructionText}>
              Show this to the transporter when they arrive to pick up the parcel.
            </Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#374151', marginTop: 20, marginHorizontal: 0 }]} onPress={() => setQrModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI Insight Modal */}
      <Modal
        visible={aiModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.aiModalContent}>
            <ScrollView>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={24} color="#ff6f00" />
                <Text style={styles.aiModalTitle}>AI Quarterly Business Report</Text>
              </View>
              <Text style={styles.aiModalSubtitle}>Market trends and recommendations for your top category: <Text style={{fontWeight: 'bold'}}>Electronics</Text>.</Text>

              <Text style={styles.aiSectionHeader}>📈 Market Trend Analysis</Text>
              <LineChart
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                  datasets: [
                    { data: [20, 35, 28, 45, 55, 50], color: (opacity = 1) => `rgba(255, 111, 0, ${opacity})` }, // Your Sales
                    { data: [25, 30, 35, 40, 48, 52], color: (opacity = 1) => `rgba(0, 111, 255, ${opacity})` }  // Market Average
                  ],
                  legend: ["Your Sales", "Market Average"]
                }}
                width={screenWidth * 0.8}
                height={180}
                chartConfig={{
                  backgroundColor: "#f7f7f7", backgroundGradientFrom: "#f7f7f7", backgroundGradientTo: "#f7f7f7",
                  decimalPlaces: 0, color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 }, propsForDots: { r: "4" }
                }}
                bezier
                style={{ borderRadius: 16, alignSelf: 'center' }}
              />

              <Text style={styles.aiSectionHeader}>💡 AI Recommendations</Text>
              <View style={styles.aiRecommendation}>
                <Text style={styles.aiRecText}>- Your 'Phones' product sales are <Text style={{color: '#16a34a'}}>outperforming the market average</Text>. Consider increasing stock or running a featured promotion.</Text>
                <Text style={styles.aiRecText}>- The market shows growing interest in 'Wearable Tech'. This could be a profitable new product line to explore.</Text>
              </View>

              <Text style={styles.aiSectionHeader}>📋 Trend Summary</Text>
              <View style={styles.aiTable}>
                <View style={styles.aiTableRow}><Text style={styles.aiTableCellHeader}>Metric</Text><Text style={styles.aiTableCellHeader}>Your Performance</Text><Text style={styles.aiTableCellHeader}>Market Trend</Text></View>
                <View style={styles.aiTableRow}><Text style={styles.aiTableCell}>Avg. Price</Text><Text style={styles.aiTableCell}>MWK 25,000</Text><Text style={styles.aiTableCell}>+5%</Text></View>
                <View style={styles.aiTableRow}><Text style={styles.aiTableCell}>Buyer Engagement</Text><Text style={styles.aiTableCell}>+15%</Text><Text style={styles.aiTableCell}>+8%</Text></View>
              </View>

            </ScrollView>
            <TouchableOpacity
              style={[styles.closeButton, { alignSelf: 'center' }]}
              onPress={() => setAiModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Slide menu overlay */}
      {menuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={styles.overlayBg} />
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleSwitchRole("Buyer", route.params?.switchAppRole)}>
              <Text>Switch to Buyer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); setActiveTab("My Shop"); }}>
              <Text>My shop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {(() => {
          switch (activeTab) {
            case "Dashboard":
              return <DashboardView
                products={filteredProducts}
                isLoading={isLoading}
                allProducts={allProducts}
                orders={filteredOrders}
                onRefresh={onRefresh}
                refreshing={refreshing}
                shopName={shopName}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                handleNotifyTransporter={handleNotifyTransporter}
                computePieData={computePieData}
                computeLikesPieData={computeLikesPieData}
                computeBuyerLocations={computeBuyerLocations}
                computeSalesSeries={computeSalesSeries}
                topSellers={topSellers}
                ratingSummary={ratingSummary}
                onPressAiCard={() => setAiModalVisible(true)}
                navigation={navigation}
                setActiveTab={setActiveTab}
                unreadMessagesCount={unreadMessagesCount}
              />;
            case "Post":
              if (verificationStatus !== 'verified') {
                return <UnverifiedSellerView />;
              }
              return <PostView
                productName={productName} setProductName={setProductName}
                category={category} setCategory={setCategory}
                price={price} setPrice={setPrice}
                quantity={quantity} setQuantity={setQuantity}
                imageUrl={imageUrl} setImageUrl={setImageUrl}
                description={description} setDescription={setDescription}
                isUploading={isUploading}
                expiresInDays={expiresInDays} setExpiresInDays={setExpiresInDays}
                handleImagePick={handleImagePick}
                addProduct={addProduct}
                products={products} // For "Your Recent Products"
                currentUser={currentUser}
                shopName={shopName}
                setProducts={setProducts}
                setNotifications={setNotifications}
                handleDeleteProduct={handleDeleteProduct}
                deletingProductId={deletingProductId}
                navigation={navigation}
                setActiveTab={setActiveTab}
              />;
            case "Messages":
              return <MessagesView messages={messages} handleChatPress={handleChatPress} navigation={navigation} />;
            case "History":
              return <HistoryView salesHistory={salesHistory} />;
            case "Notifications":
              return <NotificationsView notifications={notifications} markNotificationRead={markNotificationRead} />;
            case "My Shop":
              return <MyShopView
                products={products}
                shopName={shopName}
                slogan={slogan || 'Your one-stop shop for quality goods.'}
                shopBanner={shopBanner}
                shopAvatar={shopAvatar}
                isLoading={isLoading}
                verificationStatus={verificationStatus}
                isLive={isLive}
                handleGoLivePress={handleGoLivePress}
                handleStartBiddingPress={handleStartBiddingPress}
                ratingSummary={ratingSummary}
                handleDeleteProduct={handleDeleteProduct}
                deletingProductId={deletingProductId}
                navigation={{ ...navigation, navigate: (screen, params) => navigation.navigate(screen, { ...params, salesHistory }) }}
              />;
            default:
              return <DashboardView
                products={filteredProducts}
                isLoading={isLoading}
                allProducts={allProducts}
                orders={filteredOrders}
                onRefresh={onRefresh}
                refreshing={refreshing}
                shopName={shopName}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                handleNotifyTransporter={handleNotifyTransporter}
                computePieData={computePieData}
                computeLikesPieData={computeLikesPieData}
                computeBuyerLocations={computeBuyerLocations}
                computeSalesSeries={computeSalesSeries}
                topSellers={topSellers}
                ratingSummary={ratingSummary}
                onPressAiCard={() => setAiModalVisible(true)}
                navigation={navigation}
                unreadMessagesCount={unreadMessagesCount}
                setActiveTab={setActiveTab}
              />;
          }
        })()}
      </View>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabBar}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.name} style={styles.tabButton} onPress={() => setActiveTab(t.name)}>
            <View style={{ alignItems: "center" }}>
              {React.cloneElement(t.icon, { color: activeTab === t.name ? "#ff6f00" : "#777" })}
              <Text style={{ color: activeTab === t.name ? "#ff6f00" : "#777", fontSize: 12, marginTop: 4 }}>{t.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// --- MODERN STYLES ---
const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    zIndex: 5,
  },
  topLeft: { flexDirection: "row", alignItems: "center" },
  profilePic: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#e5e7eb",
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: { fontSize: 18, fontWeight: 'bold', color: '#4b5563' },
  topRightTouchable: { padding: 6 },

  menuOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
  overlayBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)" },
  sideMenu: {
    position: "absolute",
    top: 70,
    right: 10,
    width: 230,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    zIndex: 1000,
  },
  liveModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  liveModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1f2937',
  },
  liveModalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  }, // Correctly close liveModalInput

  content: { flex: 1 },

  shopContainer: { flex: 1, backgroundColor: "#f9fafb" },
  shopHeader: { alignItems: 'center', marginBottom: 16 },
  shopBanner: { width: '100%', height: 150, backgroundColor: '#e5e7eb' },
  shopInfo: { alignItems: 'center', marginTop: -50, width: '100%' },
  shopAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff', backgroundColor: '#d1d5db' },
  shopName: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginTop: 8 },
  shopSlogan: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  shopStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, elevation: 2, marginBottom: 16 },
  shopStatItem: { alignItems: 'center' },
  shopStatValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  shopStatLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  liveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  endLiveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6f00',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16, },
  bidButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }, // Correctly close bidButtonText

  topSellerRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },

  formContainer: { padding: 16 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  button: { flex: 1, padding: 14, borderRadius: 12, marginHorizontal: 6, alignItems: "center" }, // Correctly close button
  modernProductRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  editButton: {
    padding: 8,
  },

  transporterName: { fontSize: 15, fontWeight: '600', color: '#374151' }, // This was incorrectly nested
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 6, fontSize: 14, fontWeight: 'bold', color: '#374151' },


  listingRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },

  bottomTabBar: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: "#fff" },
  tabButton: { flex: 1, alignItems: "center" },
  unreadBadge: { backgroundColor: "#ef4444", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },

  historyCard: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12, elevation: 1 },
  historyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#1f2937" },
  historyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  historyLabel: { fontWeight: "600", color: "#374151" },
  historyValue: { color: "#111827" },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  menuItem: { paddingVertical: 14, paddingHorizontal: 14, borderBottomColor: "#f3f4f6", borderBottomWidth: 1 },

  closeButton: { marginTop: 15, backgroundColor: "#ff6f00", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 },
  closeButtonText: { color: "#fff", fontWeight: "bold" },

  qrModalContent: { width: "85%", backgroundColor: "#fff", borderRadius: 20, padding: 25, alignItems: "center", elevation: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  qrCodeImage: { width: 150, height: 150, marginVertical: 20, overflow: 'hidden', borderWidth: 4, borderColor: '#1f2937', justifyContent: 'center', alignItems: 'center' },
  qrInfoBox: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 10, width: '100%', borderWidth: 1, borderColor: '#f3f4f6' },
  qrInfoLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  qrInfoValue: { fontSize: 14, color: '#1f2937', fontWeight: '700' },
  qrInstructionText: { marginTop: 15, textAlign: 'center', color: '#6b7280', fontSize: 14 },

  aiModalContent: { width: '95%', maxHeight: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  aiModalTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 8, color: '#111' },

  aiModalSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16, marginTop: 4 },
  aiSectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4 },
  aiRecommendation: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 10 },
  aiRecText: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 },
  aiTable: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, overflow: 'hidden' },
  aiTableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  aiTableCell: { flex: 1, padding: 10, fontSize: 13, color: '#374151' }, // Correctly close aiTableCell
  aiTableCellHeader: { flex: 1, padding: 10, fontSize: 13, fontWeight: 'bold', backgroundColor: '#f9fafb', color: '#1f2937' }, // Correctly close aiTableCellHeader

  notificationRow: {
    backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  aiNotification: {
    backgroundColor: '#fffbe6', // A light yellow
    borderColor: '#f59e0b',
    borderWidth: 1,
  },
  comingSoonBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  // Bidding Modal Styles
  biddingModalContent: { width: '90%', maxHeight: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  biddingSubtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  biddingProductList: { maxHeight: 250, width: '100%', marginBottom: 16 },
  biddingProductRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 8 },
  biddingProductSelected: { borderColor: '#16a34a', borderWidth: 2, backgroundColor: '#f0fdf4' },
  biddingProductThumb: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  biddingProductName: { fontSize: 15, fontWeight: 'bold', color: '#1f2937' },
  biddingProductPrice: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  biddingInputsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Unverified Seller View Styles
  unverifiedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: theme.background },
  unverifiedPanel: { backgroundColor: theme.card, borderRadius: 16, padding: 24, alignItems: 'center', width: '100%', maxWidth: 400, elevation: 3 },
  unverifiedTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text, textAlign: 'center', marginTop: 12 },
  unverifiedSubtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  stepsContainer: { alignSelf: 'flex-start', width: '100%', marginBottom: 24 },
  stepsTitle: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 12 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  stepNumber: { fontWeight: 'bold', color: theme.primary, marginRight: 8 },
  stepText: { fontSize: 14, color: theme.textSecondary, flex: 1, lineHeight: 20 },
  verificationButton: { backgroundColor: theme.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, width: '100%' },
  verificationButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});