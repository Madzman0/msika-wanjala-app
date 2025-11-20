// screens/NewChatScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export default function NewChatScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const usersRef = collection(db, "users");
        // Fetch users who have 'seller' in their roles array.
        const q = query(usersRef, where("roles", "array-contains", "seller"));
        const querySnapshot = await getDocs(q);
        const sellers = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(seller => seller.id !== auth.currentUser?.uid); // Exclude self
        setUsers(sellers);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  const handleStartChat = async (seller) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const chatId = [currentUser.uid, seller.id].sort().join('_');
    const chatRef = doc(db, "chats", chatId);

    try {
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          userIds: [currentUser.uid, seller.id],
          createdAt: serverTimestamp(),
          lastMessage: `Chat with ${seller.name} started.`,
          lastMessageAt: serverTimestamp(),
        });
      }
      navigation.replace("ChatScreen", { chatId, chatName: seller.name, chatPhotoURL: seller.photoURL });
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Could not start the chat.");
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => handleStartChat(item)}>
      <Image source={{ uri: item.photoURL || `https://i.pravatar.cc/150?u=${item.id}` }} style={styles.avatar} />
      <Text style={styles.userName}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start a New Chat</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a seller..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color={theme.primary} />
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No sellers found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.input,
    borderRadius: 10, paddingHorizontal: 12, margin: 16, borderWidth: 1, borderColor: theme.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: theme.text, fontSize: 15 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  userName: { flex: 1, fontSize: 16, fontWeight: '600', color: theme.text },
  emptyText: { textAlign: 'center', marginTop: 40, color: theme.textSecondary, fontSize: 16 },
});