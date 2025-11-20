// screens/LiveStreamViewerScreen.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, deleteDoc, query, onSnapshot, serverTimestamp, doc, orderBy, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ThemeContext } from '../context/ThemeContext';

export default function LiveStreamViewerScreen({ route, navigation }) {
  const { session } = route.params;
  const auth = getAuth();
  const user = auth.currentUser;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [likes, setLikes] = useState([]); // For floating hearts animation
  const flatListRef = useRef(null);

  // Effect to handle joining and leaving the session
  useEffect(() => {
    if (!user || !session?.id) return;

    const viewerRef = doc(db, "liveSessions", session.id, "viewers", user.uid);
    const sessionRef = doc(db, "liveSessions", session.id);

    // Add user to viewers list on join
    setDoc(viewerRef, {
      viewerId: user.uid,
      name: user.displayName || 'Anonymous Viewer',
      joinedAt: serverTimestamp(),
    }).then(() => {
      // Increment viewer count after successfully adding the viewer
      updateDoc(sessionRef, { viewerCount: increment(1) });
    }).catch(error => console.error("Failed to add viewer and update count:", error));

    // Cleanup function to remove user from viewers list on leave
    return () => {
      deleteDoc(viewerRef).then(() => {
        updateDoc(sessionRef, { viewerCount: increment(-1) });
      }).catch(error => console.error("Failed to remove viewer and update count:", error));
    };
  }, [session?.id, user]);

  // Effect to listen for chat messages
  useEffect(() => {
    if (!session?.id) return;

    // Listen for changes on the main session document (for featured product)
    const sessionRef = doc(db, "liveSessions", session.id);
    const sessionUnsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        setFeaturedProduct(doc.data().featuredProduct || null);
      }
    });

    const messagesQuery = query(collection(db, sessionRef, "messages"), orderBy("createdAt", "asc"));
    const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const liveMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(liveMsgs);
    });


    return () => {
      sessionUnsubscribe();
      messagesUnsubscribe();
    };
  }, [session?.id]);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !session?.id || !user) return;

    try {
      await addDoc(collection(db, "liveSessions", session.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || 'Viewer',
        text: chatInput,
        createdAt: serverTimestamp(),
      });
      setChatInput('');
    } catch (error) {
      console.error("Error sending chat message:", error);
      Alert.alert("Error", "Could not send chat message.");
    }
  };

  const handleLike = () => {
    if (!session?.id) return;
    const liveSessionRef = doc(db, "liveSessions", session.id);

    // Update like count in Firestore
    updateDoc(liveSessionRef, {
      likeCount: increment(1)
    }).catch(error => console.error("Error sending like:", error));

    // Trigger floating heart animation
    const newLike = {
      id: Date.now(),
      right: Math.random() * 40 + 10, // random horizontal position
      animatedValue: new Animated.Value(0),
    };

    setLikes(currentLikes => [...currentLikes, newLike]);

    Animated.timing(newLike.animatedValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setLikes(currentLikes => currentLikes.filter(like => like.id !== newLike.id));
    });
  };

  const handleViewFeaturedProduct = () => {
    if (!featuredProduct || !featuredProduct.id) {
      Alert.alert("Product Unavailable", "Details for this product are currently unavailable.");
      return;
    }
    // Navigate to the home screen and pass the product ID to trigger the details modal
    navigation.navigate('BuyerHomeScreen', { featuredProductId: featuredProduct.id });
  };

  const renderChatMessage = ({ item }) => (
    <View style={styles.chatMessage}>
      <Text style={styles.chatSender}>{item.senderName}:</Text>
      <Text style={styles.chatText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Image source={{ uri: session.sellerAvatar }} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{session.title}</Text>
            <Text style={styles.headerSubtitle}>{session.sellerName}</Text>
          </View>
        </View>

        {/* This is where a video component would go. For now, it's a placeholder. */}
        <View style={styles.videoPlaceholder}>
          <Ionicons name="videocam-outline" size={64} color={theme.textSecondary} />
          <Text style={styles.placeholderText}>Live Stream Placeholder</Text>
          {/* --- Featured Product Overlay --- */}
          {featuredProduct && (
            <View style={styles.featuredProductContainer}>
              <Image source={{ uri: featuredProduct.imageUrl }} style={styles.featuredProductImage} />
              <View style={styles.featuredProductDetails}>
                <Text style={styles.featuredProductTag}>FEATURED</Text>
                <Text style={styles.featuredProductName} numberOfLines={1}>{featuredProduct.name}</Text>
                <Text style={styles.featuredProductPrice}>MWK {featuredProduct.price.toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={styles.buyButton} onPress={handleViewFeaturedProduct}>
                <Text style={styles.buyButtonText}>View Product</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* --- Floating Hearts Animation --- */}
          {likes.map(like => (
            <Animated.View
              key={like.id}
              style={[
                styles.likeAnimation,
                {
                  right: like.right,
                  opacity: like.animatedValue.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1, 0] }),
                  transform: [{ translateY: like.animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, -200] }) }],
                },
              ]}
            >
              <Ionicons name="heart" size={30} color={theme.primary} />
            </Animated.View>
          ))}
          {/* --- Like Button --- */}
          <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
            <Ionicons name="heart" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderChatMessage}
            keyExtractor={(item) => item.id}
            style={styles.chatList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Say something..."
              placeholderTextColor={theme.textSecondary}
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleSendChatMessage}
            />
            <TouchableOpacity onPress={handleSendChatMessage} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  avatar: { width: 40, height: 40, borderRadius: 20, marginLeft: 15 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text },
  headerSubtitle: { fontSize: 13, color: theme.textSecondary },
  videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  placeholderText: { color: '#666', marginTop: 8 },
  chatContainer: { height: 300, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border },
  chatList: { flex: 1, padding: 10 },
  chatMessage: { flexDirection: 'row', marginBottom: 8 },
  chatSender: { fontWeight: 'bold', color: theme.primary, marginRight: 6 },
  chatText: { color: theme.text, flexShrink: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: theme.border },
  chatInput: { flex: 1, backgroundColor: theme.input, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: theme.text },
  sendButton: { marginLeft: 10, backgroundColor: theme.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  // Featured Product Styles
  featuredProductContainer: { position: 'absolute', bottom: 10, left: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center' },
  featuredProductImage: { width: 60, height: 60, borderRadius: 8 },
  featuredProductDetails: { flex: 1, marginLeft: 12 },
  featuredProductTag: { color: '#fff', backgroundColor: theme.primary, fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  featuredProductName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  featuredProductPrice: { color: '#fff', fontSize: 14, marginTop: 2 },
  buyButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#fff', fontWeight: 'bold',
  },
  likeButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeAnimation: {
    position: 'absolute',
    bottom: 70,
  },
  likeButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeAnimation: {
    position: 'absolute',
    bottom: 70,
  },
});