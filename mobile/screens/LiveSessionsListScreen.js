// screens/LiveSessionsListScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { ThemeContext } from '../context/ThemeContext';

export default function LiveSessionsListScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const liveQuery = query(collection(db, "liveSessions"), where("status", "==", "live"), orderBy("createdAt", "desc"));
    
    const FAKE_LIVE_SESSION = {
      id: 'fake-live-session-for-list',
      sellerId: 'fake-seller-for-list',
      sellerAvatar: 'https://i.pravatar.cc/150?u=fake-seller-for-list',
      sellerName: 'Awesome Deals Live',
      title: '🔴 Unboxing New Gadgets! 50% OFF!',
      viewerCount: 128,
      status: 'live',
      createdAt: { toDate: () => new Date() } 
    };

    const unsubscribe = onSnapshot(liveQuery, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLiveSessions([FAKE_LIVE_SESSION, ...sessions]); // Prepend the fake session
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const handleSessionPress = (session) => {
    navigation.navigate("LiveStreamViewerScreen", { session });
  };

  // Filter sessions based on search query
  const filteredSessions = liveSessions.filter(session => {
    const queryLower = searchQuery.toLowerCase();
    const titleMatch = session.title.toLowerCase().includes(queryLower);
    const sellerNameMatch = session.sellerName.toLowerCase().includes(queryLower);
    return titleMatch || sellerNameMatch;
  });

  const renderSession = ({ item }) => (
    <TouchableOpacity style={styles.sessionCard} onPress={() => handleSessionPress(item)}>
      <Image
        source={{ uri: item.sellerAvatar || `https://i.pravatar.cc/150?u=${item.sellerId}` }}
        style={styles.avatar}
      />
      <View style={styles.sessionDetails}>
        <Text style={styles.sessionTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.sellerName}>{item.sellerName}</Text>
        <View style={styles.viewerCountContainer}>
          <Ionicons name="eye-outline" size={14} color={theme.textSecondary} />
          <Text style={styles.viewerCountText}>{item.viewerCount || 0}</Text>
        </View>
      </View>
      <View style={styles.liveIndicator}>
        <Text style={styles.liveIndicatorText}>LIVE</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Streams</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by seller or stream title..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={theme.primary} />
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-off-outline" size={64} color={theme.textSecondary} />
              <Text style={styles.emptyText}>No one is live at the moment.</Text>
              <Text style={styles.emptySubtext}>Check back later!</Text>
            </View>
          }
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
  listContainer: { padding: 16 },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  sessionDetails: { flex: 1 },
  sessionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text },
  sellerName: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
  viewerCountContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  viewerCountText: { marginLeft: 4, fontSize: 13, color: theme.textSecondary, fontWeight: '600' },
  liveIndicator: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginLeft: 10 },
  liveIndicatorText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: '40%' },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: theme.text, marginTop: 16 },
  emptySubtext: { fontSize: 15, color: theme.textSecondary, marginTop: 8 },
});