import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
  {
    id: '1',
    question: 'How do I change my password?',
    answer: 'You can change your password from the "Profile" tab. Go to "Account Security" and tap on "Change Password". You will receive an email with instructions to reset it.',
  },
  {
    id: '2',
    question: 'How can I update my profile information?',
    answer: 'Navigate to the "Profile" tab and tap on "More account settings". From there, you can edit your name, phone number, and other personal details.',
  },
  {
    id: '3',
    question: 'Is my payment information secure?',
    answer: 'Yes, we use industry-standard encryption to protect your payment details. Your full card information is never stored on our servers.',
  },
  {
    id: '4',
    question: 'How do I report a problem with the app?',
    answer: 'You can report a problem by going to "More account settings" > "Support & Feedback" and tapping on "Report a Problem". Please provide as much detail as possible.',
  },
  {
    id: '5',
    question: 'How does the 60-day name change policy work?',
    answer: 'To ensure account security and identity consistency, you can only change your full name once every 60 days. The date for your next available change will be shown in your profile settings.',
  },
];

const FaqItem = ({ item, isExpanded, onPress }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.questionContainer} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.questionText}>{item.question}</Text>
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={theme.textSecondary} />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function HelpCenterScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePress = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqData = FAQ_DATA.filter(item => {
    const query = searchQuery.toLowerCase();
    const questionMatch = item.question.toLowerCase().includes(query);
    const answerMatch = item.answer.toLowerCase().includes(query);
    return questionMatch || answerMatch;
  });


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search help articles..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
        {filteredFaqData.length > 0 ? (
          filteredFaqData.map((item) => (
          <FaqItem
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            onPress={() => handlePress(item.id)}
          />
        ))
        ) : (
          <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  scrollContainer: { padding: 16 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.input,
    borderRadius: 10, paddingHorizontal: 12, marginBottom: 20,
    borderWidth: 1, borderColor: theme.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: theme.text, fontSize: 16 },
  faqItem: {
    backgroundColor: theme.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginRight: 10,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  answerText: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
    paddingTop: 12,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 30,
    color: theme.textSecondary,
    fontSize: 16,
  },
});