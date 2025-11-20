// BuyerHomeScreen.js
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  useWindowDimensions,
  TextInput,
  Modal,
  Alert,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { CartContext } from "../context/CartContext";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth, signOut, sendPasswordResetEmail, sendEmailVerification, deleteUser, EmailAuthProvider, reauthenticateWithCredential, updateProfile } from "firebase/auth";
import { app, db } from "../firebaseConfig"; // Make sure db is exported from firebaseConfig
import { doc, updateDoc, getDoc, deleteDoc, collection, getDocs, increment, arrayUnion, arrayRemove, setDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";

// --- Import Refactored Tab View Components ---
import HomeView from './HomeView';
import MessengerView from './MessengerView';
import HistoryView from './HistoryView';
import ConnectedAccountsScreen from './ConnectedAccountsScreen';
import ProfileView from './ProfileView';
import NotificationsView from './NotificationsView';

import { ThemeContext } from "../context/ThemeContext";
const { width: screenWidth } = Dimensions.get("window");

const tourismSections = [
  {
    id: "lake",
    name: "Lake Malawi",
    description:
      'Explore the crystal clear waters and sandy beaches of the "Lake of Stars," a UNESCO World Heritage site known for its unique fish species. Offers stunning lakeside resorts and fresh fish restaurants.',
    icon: "water",
    image: require("../assets/tourism1.jpg"),
    rating: 4.9,
    location: "Mangochi, Salima, Nkhata Bay",
    offersAccommodation: true,
    offersMeals: true,
  },
  {
    id: "wildlife",
    name: "Wildlife & Safaris",
    description:
      "Discover elephants, lions, and rhinos in Malawi's resurgent national parks like Liwonde, Majete, and Nkhotakota. Safari lodges and bush camps provide unique stays, often with dining.",
    icon: "leaf",
    image: require("../assets/tourism3.jpg"), // Using a more relevant image
    rating: 4.7,
    location: "Liwonde, Majete, Nkhotakota",
    offersAccommodation: true,
    offersMeals: true,
  },
  {
    id: "mountains",
    name: "Mountains & Hiking",
    description: "Hike the majestic Mulanje Massif or the beautiful Zomba Plateau for breathtaking views and unique flora. Guesthouses and local eateries are available.",
    icon: "trail-sign",
    image: require("../assets/tourism2.jpg"),
    rating: 4.8,
    location: "Mulanje, Zomba",
    offersAccommodation: true,
    offersMeals: true,
  },
  {
    id: "culture",
    name: "Cultural Heritage",
    description: "Experience the warm heart of Africa through its vibrant villages, traditional dances, and intricate crafts. Local homestays and traditional food experiences are common.",
    icon: "people",
    image: require("../assets/tourism3.jpg"),
    rating: 4.6,
    location: "Throughout Malawi",
    offersAccommodation: true,
    offersMeals: true,
  },
];

export default function BuyerHomeScreen({ route, navigation: navigationProp, setIsLoggedIn }) {
  // navigation that works even if navigation prop is missing
  const navigation = navigationProp || useNavigation();
  const isFocused = useIsFocused();
  const { theme } = useContext(ThemeContext);

  const auth = getAuth(app);

  // Get screen width and determine number of columns for the grid
  const { width } = useWindowDimensions();
  const getNumColumns = () => {
    if (width >= 1200) return 4; // Large PC screens
    if (width >= 768) return 3;  // Tablets
    return 2; // Mobile
  };
  const numColumns = getNumColumns();
  const styles = getStyles(theme, width);


  // cart context (assumes your CartContext provides cartItems and setCartItems)
  const { cartItems = [], setCartItems = () => {} } = useContext(CartContext);

  // UI state
  const [menuVisible, setMenuVisible] = useState(false);
  const scrollRef = useRef(null);

  // search & filter state
  const [searchText, setSearchText] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const categories = ["All", "Clothes", "Shoes", "Electronics", "Food", "Beauty"];
  const [activeCategory, setActiveCategory] = useState("All");
  const [productList, setProductList] = useState([]);

  // tabs & UI
  const [activeTab, setActiveTab] = useState("Home");

  // modals & product selection
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedProductForOptions, setSelectedProductForOptions] = useState(null);
  // New state for rating modal
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [appRating, setAppRating] = useState(0);
  const [tourismModalVisible, setTourismModalVisible] = useState(false);
  const [tourismDetailVisible, setTourismDetailVisible] = useState(false);
  const [selectedTourism, setSelectedTourism] = useState(null);
  const [hasNotifiedEvening, setHasNotifiedEvening] = useState(false);
  // New state for the profile info modal
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState("");
  const [infoModalContent, setInfoModalContent] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalText, setSuccessModalText] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: 'Guest', memberId: 'N/A', email: '' });
  // New state for delete account modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [passwordForDelete, setPasswordForDelete] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // --- Report Product State ---
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);


  // chats (dummy)
  const [chats, setChats] = useState([
    { id: 1, name: "Green Farm Ltd", lastMessage: "Your vegetables arrived?", unread: 2 },
    { id: 2, name: "Harvest Co", lastMessage: "We have fresh crops available.", unread: 0 },
  ]);

  const unreadMessagesCount = chats.filter(chat => chat.unread).length;

  // user (dummy)
  const user = { name: currentUser.name, profilePic: profileImage, email: currentUser.email };
  const initials = currentUser.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || '...';

  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, "products");
      const productSnapshot = await getDocs(productsCollection);
      const products = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Use a placeholder if img is not in Firestore data
        img: doc.data().imageUrl ? { uri: doc.data().imageUrl } : require("../assets/product1.jpg")
      }));
      setProductList(products);
    };
    fetchProducts();
  }, []);
  // Fetch user data on component mount

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload(); // Get the latest user data from Firebase
        setEmailVerified(user.emailVerified);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser(userData);
          if (userData.photoURL) {
            setProfileImage(userData.photoURL);
          }
        }
      }
    };

    fetchUserData();
  }, [isFocused]); // Re-run this effect when the screen comes into focus

  // Effect to handle opening a featured product from a live stream
  useEffect(() => {
    if (route.params?.featuredProductId && productList.length > 0) {
      const productId = route.params.featuredProductId;
      const productToShow = productList.find(p => p.id === productId);
      if (productToShow) {
        handleViewProduct(productToShow);
      }
    }
  }, [route.params?.featuredProductId, productList]);
  // derived filtered list
  const filteredProducts = productList.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes((searchText || "").toLowerCase());
    const matchesLocation = p.location.toLowerCase().includes((searchLocation || "").toLowerCase());
    return matchesCategory && matchesSearch && matchesLocation;
  });

  // Evening Notification for Accommodation and Meals
  useEffect(() => {
    const checkTimeAndNotify = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Trigger notification around 6 PM (e.g., between 5:55 PM and 6:05 PM)
      if (hour === 17 && minute >= 55 || hour === 18 && minute <= 5) {
        if (!hasNotifiedEvening) {
          const accommodationPlaces = tourismSections.filter(t => t.offersAccommodation).map(t => t.name);
          const mealPlaces = tourismSections.filter(t => t.offersMeals).map(t => t.name);

          let message = "As evening approaches, consider these options:\n\n";
          if (accommodationPlaces.length > 0) {
            message += `Places to Sleep: ${accommodationPlaces.join(', ')}\n`;
          }
          if (mealPlaces.length > 0) {
            message += `Places to Eat: ${mealPlaces.join(', ')}\n`;
          }
          message += "\nEnjoy your evening!";

          Alert.alert("Evening Recommendations", message);
          setHasNotifiedEvening(true); // Prevent repeated notifications
        }
      } else {
        setHasNotifiedEvening(false); // Reset for the next day
      }
    };
    const interval = setInterval(checkTimeAndNotify, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [hasNotifiedEvening]);
  // product actions
  const handleBuy = (product) => {
    try {
      const exists = cartItems.find((item) => item.name === product.name);
      if (exists) {
        setCartItems(cartItems.map((item) =>
          item.name === product.name ? { ...item, qty: (item.qty || 1) + 1 } : item
        ));
      } else {
        setCartItems([...(cartItems || []), { ...product, qty: 1 }]);
      }
    } catch (err) {
      console.warn("Cart update error", err);
    }
  };

  const handleLike = async (product) => {
    const user = auth.currentUser;
    if (!product.id || !user) return;

    const productRef = doc(db, "products", product.id);
    const isAlreadyLiked = product.likedBy?.includes(user.uid);

    // --- Optimistically update the UI for a responsive feel ---
    setProductList(currentProducts =>
      currentProducts.map(p => {
        if (p.id === product.id) {
          const newLikedBy = isAlreadyLiked
            ? p.likedBy.filter(uid => uid !== user.uid)
            : [...(p.likedBy || []), user.uid];
          return { ...p, likedBy: newLikedBy, likes: newLikedBy.length };
        }
        return p;
      })
    );

    // --- Update Firebase in the background ---
    // Optimistically update the UI
    try {
      if (isAlreadyLiked) {
        // Unlike the product
        await updateDoc(productRef, {
          likedBy: arrayRemove(user.uid),
          likes: increment(-1)
        });
      } else {
        // Like the product
        await updateDoc(productRef, {
          likedBy: arrayUnion(user.uid),
          likes: increment(1)
        });
        // Send notification to the seller only when a product is liked (not unliked)
        if (product.sellerId) {
          await addDoc(collection(db, "notifications"), {
            sellerId: product.sellerId,
            text: `${user.displayName || 'A buyer'} liked your product: "${product.name}".`,
            type: 'product_like',
            read: false,
            createdAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error("Error updating product likes:", error);
      // Optionally, revert the UI change on error by re-fetching data
    }
  };

  const handleViewProduct = async (product) => {
    // --- This is the new logic to increment the view count ---
    if (product.id) {
      const productRef = doc(db, "products", product.id);
      try {
        // Atomically increment the 'views' field by 1.
        // If the field doesn't exist, it will be created with a value of 1.
        await updateDoc(productRef, {
          views: increment(1)
        });
      } catch (error) {
        console.error("Error updating product views:", error);
        // We don't need to alert the user for this background task.
      }
    }
    setSelectedProduct(product);
    setProductModalVisible(true);
  };

  const closeProductModal = () => {
    setProductModalVisible(false);
    setSelectedProduct(null);
  };

  const handleOptionsPress = (product) => {
    setSelectedProductForOptions(product);
    setOptionsModalVisible(true);
  };

  const closeOptionsModal = () => {
    setOptionsModalVisible(false);
    setSelectedProductForOptions(null);
  };

  const handleReportProduct = () => {
    setOptionsModalVisible(false); // Close the options modal
    setReportModalVisible(true);   // Open the report modal
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Reason Required", "Please provide a reason for your report.");
      return;
    }
    if (!selectedProductForOptions || !auth.currentUser) return;

    setIsSubmittingReport(true);
    try {
      await addDoc(collection(db, "reports"), {
        productId: selectedProductForOptions.id,
        productName: selectedProductForOptions.name,
        sellerId: selectedProductForOptions.sellerId,
        reportedBy: auth.currentUser.uid,
        reason: reportReason,
        status: 'pending_review',
        createdAt: serverTimestamp(),
      });
      Alert.alert("Report Submitted", "Thank you for your feedback. We will review this product shortly.");
      setReportModalVisible(false);
      setReportReason('');
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Could not submit your report. Please try again.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleLoadMore = () => {
    // For now, this is a placeholder. In a real app, you would fetch the next page of products from Firebase.
    Alert.alert("Load More", "This would fetch more products.");
  };

  // category
  const handleCategoryPress = (cat) => {
    setActiveCategory(cat);
  };

  // This is the correct handler to be passed to MessengerView
  const handleChatPress = (chatId, chatName, chatPhotoURL) => {
    // The navigation logic is what's important here.
    navigation.navigate("ChatScreen", { chatId, chatName, chatPhotoURL });
  };

  const handleLiveSessionPress = (session) => {
    // Navigate to the new viewer screen, passing the whole session object
    navigation.navigate("LiveStreamViewerScreen", { session });
  };

  const handleWhoIsLivePress = () => {
    navigation.navigate("LiveSessionsListScreen");
  };

  // tabs definition (icons as elements so cloneElement works)
  const tabs = [
    { name: "Home", icon: <Ionicons name="home" size={24} /> },
    { name: "Messenger", icon: <Ionicons name="chatbubbles" size={24} /> },
    { name: "History", icon: <MaterialIcons name="history" size={24} /> },
    { name: "Profile", icon: <FontAwesome5 name="user-alt" size={20} /> },
    { name: "Notifications", icon: <Ionicons name="notifications" size={24} /> },
  ];

  const handleRateSeller = (item) => {
    // In a real app, this would open a rating modal and send the rating to a backend.
    // For this demo, we'll just show an alert.
    Alert.alert("Rate Seller", `You are rating ${item.supplier} for the product "${item.name}". Thank you for your feedback!`);
  };

  const openTourismDetail = (section) => {
    setSelectedTourism(section);
    setTourismDetailVisible(true);
  };

  // Profile Info Modal
  const openInfoModal = (title, content) => {
    setInfoModalTitle(title);
    setInfoModalContent(content);
    setInfoModalVisible(true);
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The onAuthStateChanged listener in App.js will handle the state change, but we can navigate for a faster UX.
      navigation.replace("GeneralLogin");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Logout Failed", "An error occurred while logging out.");
    }
  };

  // Password Reset Handler
  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (user && user.email) {
      try {
        await sendPasswordResetEmail(auth, user.email);
        setSuccessModalText("Check your email to change your password");
        setSuccessModalVisible(true);
      } catch (error) {
        console.error("Password Reset Error:", error);
        Alert.alert("Error", "Failed to send reset email. Please try again.");
      }
    } else {
      Alert.alert("Error", "Could not find user email. Please try again or contact support.");
    }
  };

  // Email Verification Handler
  const handleSendVerificationEmail = async () => {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        setSuccessModalText("Check your email for a verification code");
        setSuccessModalVisible(true);
      } catch (error) {
        console.error("Email Verification Error:", error);
        Alert.alert("Error", "Failed to send verification email. Please try again later.");
      }
    }
  };

  // Edit Profile Handler
  const handleEditProfile = () => {
    navigation.navigate("EditProfileScreen", { user: currentUser });
  };

  // Manage Phone Number Handler
  const handleManagePhone = () => {
    navigation.navigate("ManagePhoneScreen");
  };

  // Manage Connected Accounts Handler
  const handleManageConnectedAccounts = () => {
    navigation.navigate("ConnectedAccountsScreen");
  };

  const confirmAndDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user || !passwordForDelete) {
      setDeleteError("Password is required.");
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      // Re-authenticate the user for this sensitive operation
      const credential = EmailAuthProvider.credential(user.email, passwordForDelete);
      await reauthenticateWithCredential(user, credential);

      // Re-authentication successful, now delete the user data and account
      const userDocRef = doc(db, "users", user.uid);
      await deleteDoc(userDocRef); // Delete from Firestore
      await deleteUser(user); // Delete from Firebase Auth

      // Close modal and navigate
      setDeleteModalVisible(false);
      navigation.replace("GeneralLogin");

      // Show success message after navigation
      Alert.alert("Account Deletion Initiated", "Your account will be permanently deleted after 30 days of not being reactivated.");

    } catch (error) {
      console.error("Account Deletion Error:", error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setDeleteError("Wrong password. Please try again.");
      } else {
        setDeleteError("An error occurred. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to upload image and get URL
  const uploadImageAsync = async (uri) => {
    const user = auth.currentUser;
    if (!user) return null;

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
      const storage = getStorage(app);
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      const uploadTask = await uploadBytesResumable(storageRef, blob);

      // We're done with the blob, close and release it
      blob.close();

      return await getDownloadURL(uploadTask.ref);
    } catch (e) {
      console.error("Upload Error:", e);
      Alert.alert("Upload Failed", "An error occurred while uploading the image.");
      return null;
    }
  };


  // Upload Photo Handler
  const handleUploadPhoto = async () => {
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
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.8, // Slightly compress for faster uploads
    });

    if (!result.canceled) {
      setIsUploading(true);
      const uploadUrl = await uploadImageAsync(result.assets[0].uri);
      setIsUploading(false);

      if (uploadUrl) {
        // Update the local state to show the new image immediately
        setProfileImage(uploadUrl);

        // Update the user's document in Firestore
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        try {
          await updateDoc(userDocRef, { photoURL: uploadUrl });
        } catch (error) {
          console.error("Firestore Update Error:", error);
          Alert.alert("Update Failed", "Could not save profile picture to your profile.");
        }
      }
    }
  };

  // Remove Photo Handler
  const handleRemovePhoto = async () => {
    const user = auth.currentUser;
    if (!user) return;

    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your current profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsUploading(true); // Reuse the uploading spinner for feedback
            try {
              // Update local state to immediately reflect the change
              setProfileImage(null);

              // Update the user's document in Firestore
              const userDocRef = doc(db, "users", user.uid);
              await updateDoc(userDocRef, { photoURL: null });

            } catch (error) {
              console.error("Error removing profile picture:", error);
              Alert.alert("Error", "Could not remove profile picture. Please try again.");
            } finally {
              setIsUploading(false);
            }
          },
        },
      ]
    );
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    // This function will now just open the confirmation modal
    setDeleteModalVisible(true);
    setPasswordForDelete(''); // Clear password field
    setDeleteError(''); // Clear any previous errors
  };

  // product grid render
  const renderProduct = ({ item, index }) => {
    const isWideScreen = width >= 768;
    const isLiked = item.likedBy?.includes(auth.currentUser?.uid);
    const inCart = (cartItems || []).some(ci => ci.name === item.name);

    if (isWideScreen) {
      // Desktop / Tablet View (Amazon-like)
      return (
        <View style={styles.desktopCard}>
          <Image source={item.img} style={styles.desktopImage} />
          <View style={styles.desktopCardContent}>
            <Text style={styles.desktopTitle} numberOfLines={2}>{item.name}</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <Ionicons key={i} name="star" size={16} color={i < 4 ? "#ffc107" : "#e0e0e0"} />
              ))}
              <Text style={styles.ratingText}>(1,234)</Text>
            </View>
            <Text style={styles.desktopPrice}>MWK {item.price.toLocaleString()}</Text>
            <TouchableOpacity style={styles.desktopCartButton} onPress={() => handleBuy(item)}>
              <Text style={styles.desktopCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      // Mobile View (Existing Style)
      return ( 
        <TouchableOpacity 
          style={styles.masonryCard} 
          onPress={() => handleViewProduct(item)}
          activeOpacity={0.9}
        >
          <Image source={item.img} style={styles.masonryImage} />
          {inCart && (
            <View style={styles.addedTag}>
              <Text style={{ color: "green", fontWeight: "bold" }}>Added to cart</Text>
            </View>
          )}
          <View style={styles.bottomButtons}>
            <TouchableOpacity onPress={() => handleBuy(item)}>
              <Text style={styles.overlayBtn}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleViewProduct(item)}>
              <Text style={styles.overlayBtn}>View</Text>
            </TouchableOpacity>
          </View>
  
          <View style={styles.cardFooterOverlay}>
            <Text style={styles.gridTitle}>{item.name}</Text>
            <View style={styles.footerRight}>
              <TouchableOpacity style={styles.heartRow} onPress={() => handleLike(item)}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? "#ff6b6b" : "#fff"} />
                <Text style={{ marginLeft: 4, fontSize: 12, color: "#fff", fontWeight: '600' }}>{item.likes || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleOptionsPress(item)}>
                <Ionicons name="ellipsis-vertical" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };


  
  // header renderer (keeps menu and navigation)
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image source={require("../assets/logo.png")} style={[styles.logo, theme.isDarkMode && { tintColor: '#fff' }]} />
        <Text style={styles.appName}>Msika Wanjala</Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity>
          <View style={styles.profileCircle}>
            {user.profilePic ? (
              <Image source={user.profilePic} style={styles.profilePic} />
            ) : (
              <Text style={styles.initialsText}>{initials}</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={28} color={theme.text} />
        </TouchableOpacity>

        {menuVisible && (
  <Modal
    transparent={true}
    animationType="fade"
    visible={menuVisible}
    onRequestClose={() => setMenuVisible(false)}
  >
    <TouchableOpacity
      style={styles.modalOverlay}
      onPress={() => setMenuVisible(false)}
    >
      <View style={styles.hamburgerMenu}>
        {/* Switch to Vendor */}
        {currentUser?.sellerId && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={async () => {
              const user = auth.currentUser;
              if (!user) return;
              try {
                const userDocRef = doc(db, "users", user.uid);
                // Ensure the seller role exists before switching
                await updateDoc(userDocRef, { roles: arrayUnion('seller') });
                route.params?.switchAppRole('seller');
              } catch (error) {
                console.error("Error switching back to seller:", error);
                Alert.alert("Error", "Could not switch roles.");
              }
            }}
          >
            <Text style={styles.menuItemText}>Switch to Seller</Text>
          </TouchableOpacity>
        )}

        {/* Rate App */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            setMenuVisible(false);
            setRatingModalVisible(true);
          }}
        >
          <Text style={styles.menuItemText}>Rate this app</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLogout}
        >
          <Text style={styles.menuItemText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
)}

      </View>
    </View>
  );

  const renderTopTabBar = () => (
    <View style={styles.topTabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={[styles.topTabButton, activeTab === tab.name && styles.topTabButtonActive]}
          onPress={() => setActiveTab(tab.name)}
        >
           {React.cloneElement(tab.icon, { color: activeTab === tab.name ? "#ff6f00" : "#ccc", size: 20 })}
          <Text style={[styles.topTabButtonText, activeTab === tab.name && { color: "#ff6f00" }]}>{tab.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  return (
    <View style={styles.container}>
      {renderHeader()}
      {width >= 768 && renderTopTabBar()}

      {/* MAIN CONTENT */}
      <View style={{ flex: 1 }}>
        {activeTab === "Home" && (
          <HomeView
            searchText={searchText}
            setSearchText={setSearchText}
            searchLocation={searchLocation}
            setSearchLocation={setSearchLocation}
            categories={categories}
            activeCategory={activeCategory}
            handleCategoryPress={handleCategoryPress}
            navigation={navigation}
            scrollRef={scrollRef}
            filteredProducts={filteredProducts}
            renderProduct={renderProduct}
            numColumns={numColumns}
            handleLoadMore={handleLoadMore}
            setTourismModalVisible={setTourismModalVisible}
            onWhoIsLivePress={handleWhoIsLivePress}
          />
        )}

        {/* Messenger */}
        {activeTab === "Messenger" && (
          <MessengerView chats={chats} handleChatPress={handleChatPress} unreadMessagesCount={unreadMessagesCount} navigation={navigation}/>
        )}

        {/* History */}
        {activeTab === "History" && (
          <HistoryView cartItems={cartItems} handleRateSeller={handleRateSeller}  width={width}/>
        )}

        {/* Profile */}
        {activeTab === "Profile" && (
          <ProfileView
            initials={initials}
            user={currentUser}
            openInfoModal={openInfoModal}
            setActiveTab={setActiveTab}
            handleLogout={handleLogout}
            handleChangePassword={handleChangePassword}
            handleRemovePhoto={handleRemovePhoto}
            handleUploadPhoto={handleUploadPhoto}
            profileImage={profileImage}
            isUploading={isUploading}
            emailVerified={emailVerified} // Pass emailVerified status
            handleSendVerificationEmail={handleSendVerificationEmail}
            handleManagePhone={handleManagePhone}
            handleEditProfile={handleEditProfile}
            handleManageConnectedAccounts={handleManageConnectedAccounts} // Pass the new function
            handleDeleteAccount={handleDeleteAccount} // Pass the new function
          />
        )}

        {/* Notifications */}
        {activeTab === "Notifications" && (
          <NotificationsView />
        )}
      </View>

      {/* Success Modal for Password Reset */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successModalText}>{successModalText}</Text>
            <TouchableOpacity style={styles.successModalButton} onPress={() => setSuccessModalVisible(false)}>
              <Text style={styles.closeButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModalContent}>
            <Text style={styles.modalTitle}>Confirm account deletion</Text>
            <Text style={styles.modalText}>
              Enter your password to confirm deletion of your account.
            </Text>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.input, borderColor: theme.border, borderWidth: 1, width: '100%', marginVertical: 12 }]}
              placeholder="Enter your password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={passwordForDelete}
              onChangeText={setPasswordForDelete}
            />
            {deleteError ? <Text style={{ color: 'red', marginBottom: 10 }}>{deleteError}</Text> : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={[styles.optionButton, { flex: 1, marginRight: 8, backgroundColor: theme.background }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.optionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, { flex: 1, marginLeft: 8, backgroundColor: '#991b1b' }]}
                onPress={confirmAndDeleteAccount} disabled={isDeleting}>
                <Text style={[styles.optionButtonText, { color: '#fff' }]}>{isDeleting ? 'Deleting...' : 'Confirm'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Product Modal */}
      {selectedProduct && (
        <Modal
          visible={productModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeProductModal}
        >
          <View style={styles.modalOverlay}> 
            <View style={styles.modalContent}>
              <Image source={selectedProduct.img} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
              <Text style={styles.modalText}>Price: {selectedProduct.price}</Text>
              <Text style={styles.modalText}>Category: {selectedProduct.category}</Text>
              <Text style={styles.modalText}>Supplier: {selectedProduct.supplier}</Text>
              <Text style={styles.modalText}>Location: {selectedProduct.location}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeProductModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Options Modal */}
      {selectedProductForOptions && (
        <Modal
          visible={optionsModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeOptionsModal}
        >
          <View style={styles.modalOverlay}> 
            <View style={styles.optionsModalContent}>
              <Text style={styles.modalTitle}>Options</Text>
            <TouchableOpacity style={styles.optionButton} onPress={() => {
              navigation.navigate('SellerProfileViewScreen', { sellerId: selectedProductForOptions.sellerId });
              closeOptionsModal();
            }}>
              <Text style={styles.optionButtonText}>View Seller's Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={closeOptionsModal}>
                <Text style={styles.optionButtonText}>Not Interested</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => { navigation.navigate("RelatedProducts", { category: selectedProductForOptions.category }); closeOptionsModal(); }}>
                <Text style={styles.optionButtonText}>See Related Products</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.optionButton, { backgroundColor: '#fee2e2' }]} onPress={handleReportProduct}>
                <Text style={[styles.optionButtonText, { color: '#b91c1c', fontWeight: 'bold' }]}>Report Product</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={closeOptionsModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Report Product Modal */}
      <Modal
        visible={reportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModalContent}>
            <Text style={styles.modalTitle}>Report Product</Text>
            <Text style={styles.modalText}>
              Please tell us why you are reporting "{selectedProductForOptions?.name}".
            </Text>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.input, borderColor: theme.border, borderWidth: 1, width: '100%', marginVertical: 12, height: 100, textAlignVertical: 'top' }]}
              placeholder="e.g., Prohibited item, scam, incorrect information..."
              placeholderTextColor={theme.textSecondary}
              value={reportReason}
              onChangeText={setReportReason}
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity style={[styles.optionButton, { flex: 1, marginRight: 8, backgroundColor: theme.background }]} onPress={() => setReportModalVisible(false)}>
                <Text style={styles.optionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.optionButton, { flex: 1, marginLeft: 8, backgroundColor: '#b91c1c' }]} onPress={submitReport} disabled={isSubmittingReport}>
                <Text style={[styles.optionButtonText, { color: '#fff' }]}>{isSubmittingReport ? 'Submitting...' : 'Submit Report'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal
        visible={ratingModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.modalOverlay}> 
          <View style={styles.ratingModalContent}>
            <Text style={styles.modalTitle}>Rate Our App</Text>
            <Text style={styles.modalText}>
              If you enjoy using our app, please take a moment to rate it.
            </Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setAppRating(star)}>
                  <Ionicons
                    name={star <= appRating ? "star" : "star-outline"}
                    size={36}
                    color="#ffc107"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.submitRatingButton}
              onPress={() => {
                setRatingModalVisible(false);
                // You can add logic here to submit the rating
                alert(`Thank you for rating us ${appRating} stars!`);
                setAppRating(0); // Reset rating
              }}
            >
              <Text style={styles.closeButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tourism Modal */}
      <Modal
        visible={tourismModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTourismModalVisible(false)}
      >
        <View style={styles.modalOverlay}> 
          <View style={styles.tourismModalContent}>
            <Text style={styles.tourismModalTitle}>Explore Malawi</Text>
            <Text style={styles.tourismModalSubtitle}>Discover the Warm Heart of Africa</Text>
            <ScrollView>
              {tourismSections.map(section => (
                <TouchableOpacity key={section.id} style={styles.tourismCard} onPress={() => openTourismDetail(section)}>
                  <Image source={section.image} style={styles.tourismCardImage} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.tourismCardTitle}>{section.name}</Text>
                    <Text style={styles.tourismCardDescription}>{section.description}</Text>
                    <View style={styles.viewDetailsButton}>
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setTourismModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tourism Detail Modal */}
      {selectedTourism && (
        <Modal
          visible={tourismDetailVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setTourismDetailVisible(false)}
        >
          <View style={styles.modalOverlay}> 
            <View style={styles.tourismDetailContent}>
              <Image source={selectedTourism.image} style={styles.tourismDetailImage} />
              <Text style={styles.tourismDetailTitle}>{selectedTourism.name}</Text>
              
              <View style={styles.ratingRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={20} color={i < Math.floor(selectedTourism.rating) ? "#ffc107" : "#e0e0e0"} />
                ))}
                <Text style={styles.ratingText}>{selectedTourism.rating} / 5.0</Text>
              </View>

              <Text style={styles.tourismDetailDescription}>{selectedTourism.description}</Text>

              <Text style={styles.detailSectionHeader}>Location Overview</Text>
              <View style={styles.mockMap}>
                <Ionicons name="map" size={60} color="#a5d6a7" />
                <Text style={styles.mockMapText}>{selectedTourism.location}</Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setTourismDetailVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}


      {/* Floating Cart */}
      <TouchableOpacity style={styles.floatingCart} onPress={() => navigation.navigate("CartScreen")}>
        <Ionicons name="cart" size={28} color="#fff" />
        {cartItems && cartItems.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={{ color: "#fff", fontSize: 12 }}>{cartItems.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      {width < 768 && (
        <View style={styles.bottomTabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.name)}
            >
              <View style={{ alignItems: "center" }}>
                {React.cloneElement(tab.icon, { color: activeTab === tab.name ? "#ff6f00" : "#777" })}
                <Text style={{ color: activeTab === tab.name ? "#ff6f00" : "#777", fontSize: 12, marginTop: 2 }}>
                  {tab.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// --- STYLES ---
const getStyles = (theme, width) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },

  // header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, marginRight: 10 },
  appName: { fontSize: 18, fontWeight: "bold", color: theme.text },
  headerActions: { flexDirection: "row", alignItems: "center" },
  profileCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.background, justifyContent: "center", alignItems: "center", marginRight: 8 },
  profilePic: { width: 40, height: 40, borderRadius: 20 },
  initialsText: { fontSize: 16, fontWeight: "bold", color: theme.text },

  // search & categories
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    margin: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
  },  
  searchInput: { flex: 1, paddingVertical: Platform.OS === "ios" ? 10 : 6, fontSize: 14, color: theme.text },

  // product card
  masonryCard: { width: "48%", backgroundColor: theme.card, borderRadius: 10, elevation: 3, overflow: "hidden", marginBottom: 8 },
  masonryImage: { width: "100%", height: 180, borderRadius: 10 },
  addedTag: { position: "absolute", top: 10, left: 10, borderWidth: 1, borderColor: "green", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: "#eaffea" },
  bottomButtons: { position: "absolute", bottom: 36, left: 8, flexDirection: "row" },
  overlayBtn: { color: "#fff", fontWeight: "bold", marginLeft: 6, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: "hidden" },
  cardFooterOverlay: { position: "absolute", bottom: 0, width: "100%", backgroundColor: "rgba(0,0,0,0.45)", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 8, paddingVertical: 6 },
  footerRight: { flexDirection: "row", alignItems: "center" },
  heartRow: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  gridTitle: { fontWeight: "bold", fontSize: 14, color: "#fff" }, // This is on an overlay, so white is fine.

  // chat, history & profile
  infoModalContent: { width: "85%", backgroundColor: theme.card, borderRadius: 10, padding: 25, alignItems: "center" },
  // modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: theme.card, borderRadius: 10, padding: 20, alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: theme.text },
  modalText: { fontSize: 14, marginBottom: 5, color: theme.textSecondary },
  closeButton: { marginTop: 15, backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 },
  closeButtonText: { color: "#fff", fontWeight: "bold" },

  successModalContent: { width: "85%", backgroundColor: "#166534", borderRadius: 10, padding: 25, alignItems: "center" },
  successModalText: { color: "#fff", fontSize: 16, textAlign: 'center', marginBottom: 20 },
  successModalButton: { backgroundColor: "#22c55e", paddingHorizontal: 30, paddingVertical: 10, borderRadius: 8 },


  optionsModalContent: { width: "85%", backgroundColor: theme.card, borderRadius: 10, padding: 20, alignItems: "center" },
  optionButton: { width: "100%", padding: 15, backgroundColor: theme.background, borderRadius: 5, marginBottom: 10, alignItems: "center" },
  optionButtonText: { fontSize: 16, color: theme.text },

  // Rating Modal Styles
  ratingModalContent: { width: "85%", backgroundColor: theme.card, borderRadius: 15, padding: 25, alignItems: "center", elevation: 10 },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "80%",
    marginVertical: 20,
  },
  submitRatingButton: { marginTop: 15, backgroundColor: "#28a745", paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },

  // hamburger menu
  tourismModalContent: { width: '90%', maxHeight: '80%', backgroundColor: theme.card, borderRadius: 15, padding: 20 },
  tourismModalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: theme.text },
  tourismModalSubtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginBottom: 20, paddingHorizontal: 10 },
  tourismCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, padding: 10, borderRadius: 12, marginBottom: 12, elevation: 1 },
  tourismCardImage: { width: 80, height: 80, borderRadius: 10, resizeMode: "cover" },
  tourismCardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text },
  tourismCardDescription: { fontSize: 13, color: theme.textSecondary, marginTop: 4, lineHeight: 18 },
  viewDetailsButton: { marginTop: 8, backgroundColor: '#ffead9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  viewDetailsText: { color: '#ff6f00', fontWeight: 'bold', fontSize: 12 },

  tourismDetailContent: { width: '90%', maxHeight: '90%', backgroundColor: theme.card, borderRadius: 20, padding: 20, alignItems: 'center' }, 
  tourismDetailImage: { width: '100%', height: 180, borderRadius: 15, marginBottom: 16 },
  tourismDetailTitle: { fontSize: 24, fontWeight: 'bold', color: theme.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 }, 
  ratingText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#b0b0b0' },
  tourismDetailDescription: { fontSize: 15, color: '#b0b0b0', textAlign: 'center', marginVertical: 12, lineHeight: 22 },
  detailSectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 10, marginBottom: 8, alignSelf: 'flex-start' },
  mockMap: { width: '100%', height: 120, backgroundColor: '#eef2ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#dbeafe' },
  mockMapText: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#3b82f6' },


  // hamburger menu
  hamburgerMenu: { position: "absolute", top: 50, right: 15, backgroundColor: theme.card, borderRadius: 8, elevation: 5, padding: 10, minWidth: 180 },
  menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  menuItemText: { fontSize: 16, color: theme.text },

  // floating cart & tabs
  floatingCart: { position: "absolute", bottom: width < 768 ? 80 : 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.primary, justifyContent: "center", alignItems: "center", zIndex: 10 },
  cartBadge: { position: "absolute", top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: "red", justifyContent: "center", alignItems: "center" },
  bottomTabBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 64, flexDirection: "row", borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.card, zIndex: 10 },
  tabButton: { flex: 1, justifyContent: "center", alignItems: "center" },
  // --- New Styles for Responsiveness ---
  topTabBar: { flexDirection: 'row', backgroundColor: theme.card, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border, justifyContent: 'center' },
  topTabButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginHorizontal: 4 },
  topTabButtonActive: { backgroundColor: theme.background },
  topTabButtonText: { color: theme.textSecondary, marginLeft: 8, fontWeight: '600' },
  desktopCard: {
    backgroundColor: theme.card,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    flex: 1,
    margin: 8,
  },
  desktopImage: { width: '100%', height: 200, backgroundColor: theme.background },
  desktopCardContent: { padding: 12 },
  desktopTitle: { fontSize: 15, color: theme.text, fontWeight: '600', height: 40 },
  desktopPrice: { fontSize: 18, fontWeight: 'bold', color: theme.primary, marginVertical: 8 },
  desktopCartButton: { backgroundColor: theme.primary, paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  desktopCartButtonText: { color: '#fff', fontWeight: 'bold' },
});
