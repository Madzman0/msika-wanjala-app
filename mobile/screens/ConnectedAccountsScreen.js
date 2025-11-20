import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, linkWithPopup, unlink, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { ThemeContext } from '../context/ThemeContext';

const ProviderRow = ({ icon, name, isLinked, onLink, onUnlink, isLinking }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <View style={styles.row}>
      <View style={styles.providerInfo}>
        <Ionicons name={icon} size={24} color={theme.text} style={{ marginRight: 12 }} />
        <Text style={styles.providerName}>{name}</Text>
      </View>
      {isLinking ? (
        <ActivityIndicator color={theme.primary} />
      ) : isLinked ? (
        <TouchableOpacity style={styles.unlinkButton} onPress={onUnlink}>
          <Text style={styles.unlinkButtonText}>Unlink</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.linkButton} onPress={onLink}>
          <Text style={styles.linkButtonText}>Link</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function ConnectedAccountsScreen({ navigation }) {
  const auth = getAuth();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [user, setUser] = useState(auth.currentUser);
  const [linkedProviders, setLinkedProviders] = useState([]);
  const [loading, setLoading] = useState({ google: false, facebook: false });

  useEffect(() => {
    if (user) {
      const providerIds = user.providerData.map(provider => provider.providerId);
      setLinkedProviders(providerIds);
    }
  }, [user]);

  const handleLink = async (providerName) => {
    if (!user) return;

    let provider;
    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else if (providerName === 'facebook') {
      provider = new FacebookAuthProvider();
    } else {
      return;
    }

    setLoading(prev => ({ ...prev, [providerName]: true }));
    try {
      await linkWithPopup(user, provider);
      Alert.alert("Success", `Your ${providerName} account has been linked.`);
      // Refresh user state
      setUser({ ...auth.currentUser });
    } catch (error) {
      console.error(`Link error with ${providerName}:`, error);
      if (error.code === 'auth/credential-already-in-use') {
        Alert.alert("Error", "This social account is already linked to another user.");
      } else {
        Alert.alert("Error", `Failed to link ${providerName} account. Please try again.`);
      }
    } finally {
      setLoading(prev => ({ ...prev, [providerName]: false }));
    }
  };

  const handleUnlink = async (providerId) => {
    if (!user) return;

    // Prevent unlinking the last provider
    if (user.providerData.length <= 1) {
      Alert.alert("Cannot Unlink", "You cannot unlink your only sign-in method.");
      return;
    }

    try {
      await unlink(user, providerId);
      Alert.alert("Success", "The account has been unlinked.");
      // Refresh user state
      setUser({ ...auth.currentUser });
    } catch (error) {
      console.error(`Unlink error for ${providerId}:`, error);
      Alert.alert("Error", "Failed to unlink account. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connected Accounts</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.infoText}>
          Link your social accounts for easier sign-in.
        </Text>

        <View style={styles.section}>
          <ProviderRow
            icon="mail-outline"
            name="Email/Password"
            isLinked={linkedProviders.includes('password')}
            onUnlink={() => handleUnlink('password')}
          />
          <ProviderRow
            icon="logo-google"
            name="Google"
            isLinked={linkedProviders.includes('google.com')}
            onLink={() => handleLink('google')}
            onUnlink={() => handleUnlink('google.com')}
            isLinking={loading.google}
          />
          <ProviderRow
            icon="logo-facebook"
            name="Facebook"
            isLinked={linkedProviders.includes('facebook.com')}
            onLink={() => handleLink('facebook')}
            onUnlink={() => handleUnlink('facebook.com')}
            isLinking={loading.facebook}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  scrollContainer: { padding: 20 },
  infoText: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    backgroundColor: theme.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '600',
  },
  linkButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unlinkButton: {
    borderColor: theme.textSecondary,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unlinkButtonText: {
    color: theme.textSecondary,
    fontWeight: 'bold',
  },
});