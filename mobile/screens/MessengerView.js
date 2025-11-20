import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';

const MessengerView = ({ handleChatPress, navigation, unreadMessagesCount }) => {
  const { theme } = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const styles = getStyles(theme, width);
  const auth = getAuth();
  const isFocused = useIsFocused();
  const [userChats, setUserChats] = useState([]);

  useEffect(() => {
    if (!auth.currentUser || !isFocused) return;

    const q = query(
      collection(db, "chats"),
      where("userIds", "array-contains", auth.currentUser.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedChats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserChats(fetchedChats);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [isFocused]);

  // New component to handle fetching user data for each chat
  const ChatCard = ({ chat }) => {
    const [otherUser, setOtherUser] = useState(null);

    useEffect(() => {
      const otherUserId = chat.userIds.find(id => id !== auth.currentUser.uid);
      if (otherUserId) {
        const userDocRef = doc(db, "users", otherUserId);
        getDoc(userDocRef).then(docSnap => {
          if (docSnap.exists()) {
            setOtherUser(docSnap.data());
          }
        });
      }
    }, [chat]);

    if (!otherUser) {
      // You can return a placeholder/loader here
      return null;
    }

    return (
      <TouchableOpacity key={chat.id} style={styles.chatCard} onPress={() => handleChatPress(chat.id, otherUser.name, otherUser.photoURL)}>
        <Image source={{ uri: otherUser.photoURL || `https://i.pravatar.cc/150?u=${otherUser.uid}` }} style={styles.chatAvatar} />

        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>{otherUser.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>{chat.lastMessage}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.outerContainer}>
      {/* Chat List Column */}
      <View style={styles.listContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {userChats.length === 0 ? (
              <Text style={styles.noChatsText}>No chats</Text>
            ) : (
              userChats.map((chat) => <ChatCard key={chat.id} chat={chat} handleChatPress={handleChatPress} />)
            )}
            {unreadMessagesCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.badgeText}>{unreadMessagesCount}</Text>
              </View>
            )}
        </ScrollView>
        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewChatScreen')}>
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme, width) => StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.background,
    flexDirection: 'row', // Key for two-column layout
  },
  scrollContainer: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  listContainer: {
    flex: 1, // Takes full width on mobile
  },
  noChatsText: {
    textAlign: 'center',
    marginTop: 20,
    color: theme.textSecondary,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    marginHorizontal: 10,
    backgroundColor: theme.card,
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarText: { fontWeight: 'bold', color: theme.text },
  chatName: { fontWeight: 'bold', fontSize: 16, color: theme.text },
  lastMessage: { color: theme.textSecondary },
  unreadBadge: {
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chatBubbleLeft: {
    backgroundColor: theme.card,
    alignSelf: 'flex-start',
  },
  chatBubbleRight: {
    backgroundColor: theme.primaryLight,
    alignSelf: 'flex-end',
  },
  fab: {
    position: 'absolute',
    bottom: width < 768 ? 80 : 20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  unreadBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ef4444', // A bright red color
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    shadowColor: '#000',
  },
});

export default MessengerView;