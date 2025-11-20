// screens/GoLiveScreen.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, deleteDoc, query, where, onSnapshot, serverTimestamp, doc, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ThemeContext } from '../context/ThemeContext';


export default function GoLiveScreen({ navigation }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [liveSessionId, setLiveSessionId] = useState(null);
  const [liveSessionTitle, setLiveSessionTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const flatListRef = useRef(null);
  const [animatedLikes, setAnimatedLikes] = useState([]);

  // Listen for active live sessions for the current seller
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "liveSessions"),
      where("sellerId", "==", user.uid) // Assuming sellerId is the user's UID
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const liveDoc = querySnapshot.docs[0];
        const liveData = liveDoc.data();
        setIsLive(true);
        setLiveSessionId(liveDoc.id);
        setLiveSessionTitle(liveData.title);
        setFeaturedProduct(liveData.featuredProduct || null);

        // Trigger animation when like count increases
        if (liveData.likeCount > likeCount && likeCount > 0) {
          triggerLikeAnimation();
        }
        setLikeCount(liveData.likeCount || 0);

        const viewersQuery = query(collection(db, "liveSessions", liveDoc.id, "viewers"));

        // --- Real-time listener for Viewers ---
        const viewersUnsubscribe = onSnapshot(viewersQuery, (snapshot) => {
          const liveViewers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setViewers(liveViewers);
        });

        // --- Real-time listener for Chat Messages ---
        const messagesQuery = query(collection(db, "liveSessions", liveDoc.id, "messages"), orderBy("createdAt", "asc"));
        const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const liveMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMessages(liveMessages);
          // Scroll to the bottom when new messages are added
          flatListRef.current?.scrollToEnd({ animated: true });
        });
      } else {
        setIsLive(false);
        setLiveSessionId(null);
        setFeaturedProduct(null);
        setLikeCount(0);
      }
      setCheckingStatus(false);
    });

    return () => unsubscribe();
  }, [user]);

  // New useEffect to fetch seller's products
  useEffect(() => {
    if (!user) return;

    const productsQuery = query(collection(db, "products"), where("sellerId", "==", user.uid));
    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const sellerProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(sellerProducts);
    });

    return () => unsubscribe();
  }, [user]);



  const handleStartLive = async () => {
    if (!liveSessionTitle.trim() || !user) {
      Alert.alert("Title Required", "Please enter a title for your live session.");
      return;
    }
    setLoading(true);
    try {
      const liveSessionData = {
        sellerId: user.uid,
        sellerName: user.displayName || 'Seller',
        sellerAvatar: user.photoURL || null,
        title: liveSessionTitle,
        likeCount: 0,
        viewerCount: 0, // Initialize viewer count
        status: 'live',
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "liveSessions"), liveSessionData);
      setLiveSessionId(docRef.id);
      setIsLive(true);
      Alert.alert("You are now live!", "Buyers will be notified that you are active.");
    } catch (error) {
      console.error("Error starting live session:", error);
      Alert.alert("Error", "Could not start the live session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndLive = async () => {
    if (!liveSessionId) return;
    setLoading(true);
    try {
      const liveSessionRef = doc(db, "liveSessions", liveSessionId);
      await deleteDoc(liveSessionRef);
      setIsLive(false);
      setLiveSessionId(null);
      setLiveSessionTitle('');
      Alert.alert("Session Ended", "Your live session has ended.");
    } catch (error) {
      console.error("Error ending live session:", error);
      Alert.alert("Error", "Could not end the live session properly.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !liveSessionId || !user) return;

    try {
      await addDoc(collection(db, "liveSessions", liveSessionId, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || 'Seller',
        text: chatInput,
        createdAt: serverTimestamp(),
      });
      setChatInput(''); // Clear the input
    } catch (error) {
      console.error("Error sending chat message:", error);
      Alert.alert("Error", "Could not send chat message.");
    }
  };

  const handleFeatureProduct = async (product) => {
    if (!liveSessionId) return;

    const liveSessionRef = doc(db, "liveSessions", liveSessionId);
    try {
      await updateDoc(liveSessionRef, {
        featuredProduct: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        }
      });
    } catch (error) {
      console.error("Error featuring product:", error);
      Alert.alert("Error", "Could not feature the product.");
    }
  };

  const triggerLikeAnimation = () => {
    const newLike = {
      id: Date.now(),
      right: Math.random() * 40 + 10, // random horizontal position
      animatedValue: new Animated.Value(0),
    };

    setAnimatedLikes(currentLikes => {
      // Keep the list of animations from getting too long
      const updatedLikes = [...currentLikes, newLike];
      return updatedLikes.slice(-10);
    });

    Animated.timing(newLike.animatedValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setAnimatedLikes(currentLikes => currentLikes.filter(like => like.id !== newLike.id));
    });
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productPrice}>MWK {item.price.toLocaleString()}</Text>
      <TouchableOpacity
        style={[styles.featureButton, featuredProduct?.id === item.id && styles.featuredButton]}
        onPress={() => handleFeatureProduct(item)}>
        <Text style={styles.featureButtonText}>{featuredProduct?.id === item.id ? 'Featured' : 'Feature'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderChatMessage = ({ item }) => {
    const isMyMessage = item.senderId === user?.uid;
    const messageTime = item.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';

    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer]}>
        <View style={[styles.chatBubble, isMyMessage ? styles.myChatBubble : styles.otherChatBubble]}>
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text style={styles.chatMessageText}>{item.text}</Text>
          <Text style={styles.timestamp}>{messageTime}</Text>
        </View>
      </View>
    );
  };

  if (checkingStatus) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Session</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {isLive ? (
          <View style={styles.liveInfoContainer}>
            <View style={styles.liveHeader}>
              <View style={styles.viewerCount}>
                <Ionicons name="eye" size={16} color="#fff" />
                <Text style={styles.viewerCountText}>{viewers.length}</Text>
              </View>
              <View style={styles.viewerCount}>
                <Ionicons name="heart" size={16} color="#fff" />
                <Text style={styles.viewerCountText}>{likeCount}</Text>
              </View>
              <View style={styles.liveIndicator}>
                <Text style={styles.liveIndicatorText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.liveTitle}>{liveSessionTitle}</Text>
            <Text style={styles.liveSubtitle}>Engaging with {viewers.length} {viewers.length === 1 ? 'viewer' : 'viewers'}</Text>
            <TouchableOpacity style={[styles.button, styles.endButton]} onPress={handleEndLive} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>End Live Session</Text>}
            </TouchableOpacity>
            {/* --- Floating Hearts Animation for Seller --- */}
            {animatedLikes.map(like => (
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
          </View>
        ) : (
          <View style={styles.setupContainer}>
            <Ionicons name="videocam-outline" size={64} color={theme.textSecondary} />
            <Text style={styles.setupTitle}>Go Live to Your Followers</Text>
            <Text style={styles.setupSubtitle}>Engage with your customers in real-time. Set a title for your session to let them know what it's about.</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Unboxing New Electronics!"
              placeholderTextColor={theme.textSecondary}
              value={liveSessionTitle}
              onChangeText={setLiveSessionTitle}
            />
            <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStartLive} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Start Live Session</Text>}
            </TouchableOpacity>
          </View>
        )}

        {isLive && (
          <View style={styles.productsContainer}>
            <Text style={styles.sectionTitle}>My Products</Text>
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          <View style={styles.chatContainer}>
            <FlatList
              data={messages}
              renderItem={renderChatMessage}
              keyExtractor={(item) => item.id}
              style={styles.chatList}
              ref={flatListRef} // Attach the ref here
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            {/* The TextInput for chat is now inside the chatContainer for better layout */}
            <TextInput
              style={styles.chatInput}
              placeholder="Type your message..."
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleSendChatMessage}
            />
          </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, justifyContent: 'center' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  liveInfoContainer: { alignItems: 'center', width: '100%', backgroundColor: theme.card, padding: 20, borderRadius: 16, marginBottom: 20 },
  liveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 },
  viewerCount: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  viewerCountText: { color: '#fff', marginLeft: 6, fontWeight: 'bold' },
  liveIndicator: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  liveIndicatorText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  liveTitle: { fontSize: 22, fontWeight: 'bold', color: theme.text, marginTop: 16 },
  liveSubtitle: { fontSize: 15, color: theme.textSecondary, marginTop: 4, marginBottom: 24 },
  setupContainer: { alignItems: 'center', width: '100%' },
  setupTitle: { fontSize: 22, fontWeight: 'bold', color: theme.text, marginTop: 16, textAlign: 'center' },
  setupSubtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 22 },
  input: { backgroundColor: theme.input, width: '100%', padding: 14, borderRadius: 10, fontSize: 16, color: theme.text, marginBottom: 20, borderWidth: 1, borderColor: theme.border },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  startButton: { backgroundColor: '#16a34a' },
  endButton: { backgroundColor: '#ef4444' },
  chatContainer: { flex: 1, width: '100%', backgroundColor: theme.card, marginTop: 10, borderRadius: 16, overflow: 'hidden' },
  chatList: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  messageContainer: { flexDirection: 'row', marginVertical: 4 },
  myMessageContainer: { justifyContent: 'flex-end' },
  otherMessageContainer: { justifyContent: 'flex-start' },
  chatBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  myChatBubble: { backgroundColor: theme.primary, borderBottomRightRadius: 4 },
  otherChatBubble: { backgroundColor: theme.input, borderBottomLeftRadius: 4 },
  senderName: { fontWeight: 'bold', color: theme.primary, marginBottom: 4, fontSize: 13 },
  chatMessageText: { color: theme.text, fontSize: 15, lineHeight: 20 },
  timestamp: { fontSize: 11, color: theme.textSecondary, alignSelf: 'flex-end', marginTop: 4 },
  chatInput: {
    backgroundColor: theme.input, width: '100%',
    padding: 14, fontSize: 16, color: theme.text,
    borderTopWidth: 1, borderTopColor: theme.border,
  },
  productsContainer: { width: '100%', height: 220, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 8 },
  productCard: { width: 130, marginRight: 12, backgroundColor: theme.card, borderRadius: 10, padding: 8, alignItems: 'center' },
  productImage: { width: '100%', height: 80, borderRadius: 8, backgroundColor: theme.input },
  productName: { fontSize: 13, fontWeight: '600', color: theme.text, marginTop: 6, textAlign: 'center', height: 32 },
  productPrice: { fontSize: 12, color: theme.textSecondary, marginTop: 4 },
  featureButton: {
    marginTop: 8, backgroundColor: theme.primary, paddingVertical: 6,
    paddingHorizontal: 12, borderRadius: 6, width: '100%', alignItems: 'center'
  },
  featuredButton: {
    backgroundColor: '#16a34a', // Green when featured
  },
  featureButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  likeAnimation: {
    position: 'absolute',
    bottom: 20,
  },

});