import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator, ScrollView, Switch, Modal, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app, db } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ThemeContext } from '../context/ThemeContext';

// Rest of your component code
const Section = ({ title, children, style, styles }) => (
  <View style={[styles.section, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>
      {children}
    </View>
  </View>
);

const SettingRow = ({ label, value, onPress, children, theme, styles }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowValueContainer}>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {children}

      {onPress && <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
    </View>
  </TouchableOpacity>
);

export default function EditProfileScreen({ navigation, route }) {
  const { user } = route.params;
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 768;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const auth = getAuth(app);

  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState(user.gender || 'Not set');
  const [dob, setDob] = useState(user.dob || '');
  const [profileImage, setProfileImage] = useState(user.photoURL || null);
  const [isUploading, setIsUploading] = useState(false);

  // Modal states
  const [isGenderModalVisible, setGenderModalVisible] = useState(false);
  const [isDobModalVisible, setDobModalVisible] = useState(false);

  // States for new notification toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  // New state for name change restriction
  const [canChangeName, setCanChangeName] = useState(false);
  const [nextNameChangeDate, setNextNameChangeDate] = useState('');
  const [nextChangeDateObj, setNextChangeDateObj] = useState(null);
  // New state for Report a Problem modal
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [reportIssue, setReportIssue] = useState('');
  const [reportExplanation, setReportExplanation] = useState('');
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportSentSuccess, setReportSentSuccess] = useState(false);
  // New state for rating modal
  const [isRatingModalVisible, setRatingModalVisible] = useState(false);
  const [appRating, setAppRating] = useState(0);
  

  // Check if user can change their name
  useEffect(() => {
    const checkNameChangeAbility = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const lastUpdate = userData.nameLastUpdatedAt; // This will be a Firestore Timestamp

        if (lastUpdate) {
          const lastUpdateDate = lastUpdate.toDate(); // Convert to JS Date
          const sixtyDaysLater = new Date(lastUpdateDate.getTime());
          sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

          if (new Date() < sixtyDaysLater) {
            setCanChangeName(false);
            setNextNameChangeDate(sixtyDaysLater.toLocaleDateString());
            setNextChangeDateObj(sixtyDaysLater);
          } else {
            setCanChangeName(true);
          }
        } else {
          setCanChangeName(true); // Can change if it has never been updated
        }
      }
    };
    checkNameChangeAbility();
  }, []);

  const handleDisabledNamePress = () => {
    if (!canChangeName && nextChangeDateObj) {
      const today = new Date();
      const timeDiff = nextChangeDateObj.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      Alert.alert(
        "Name Change Restricted",
        `You can't change your name yet. Please wait for ${daysLeft} more day(s) to change it again.`
      );
    }
  };

  const handleSendReport = () => {
    if (!reportIssue.trim() || !reportExplanation.trim()) {
      Alert.alert("Incomplete", "Please fill out both fields to submit a report.");
      return;
    }
    setIsSendingReport(true);
    // Simulate sending the report to a backend
    setTimeout(() => {
      setIsSendingReport(false);
      setReportSentSuccess(true); // Show success view in the modal
    }, 1500);
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    // Use a timeout to reset the state after the modal has closed, preventing a visual glitch
    setTimeout(() => {
      setReportSentSuccess(false);
      setIsSendingReport(false);
      // Clear fields for next time
      setReportIssue('');
      setReportExplanation('');
    }, 300);
  };


  const handleSaveChanges = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Missing Information", "Please fill in both your name and phone number.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Not Authenticated", "Please log in again to save your changes.");
      return;
    }

    setLoading(true);
    let finalPhotoURL = profileImage;

    // Check if the profileImage is a new local file that needs to be uploaded
    if (profileImage && profileImage.startsWith('file://')) {
      setIsUploading(true);
      // Helper to upload image and get URL
      const uploadImageAsync = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () { resolve(xhr.response); };
          xhr.onerror = function (e) { reject(new TypeError("Network request failed")); };
          xhr.responseType = "blob";
          xhr.open("GET", uri, true);
          xhr.send(null);
        });

        try {
          const storage = getStorage(app);
          const storageRef = ref(storage, `profile_images/${currentUser.uid}`);
          const uploadTask = await uploadBytesResumable(storageRef, blob);
          blob.close();
          return await getDownloadURL(uploadTask.ref);
        } catch (e) {
          console.error("Upload Error:", e);
          Alert.alert("Upload Failed", "An error occurred while uploading the image.");
          return null;
        }
      };
      finalPhotoURL = await uploadImageAsync(profileImage);
      setIsUploading(false);
      if (!finalPhotoURL) {
        setLoading(false);
        return; // Stop if upload failed
      }
    }

    try {
      const dataToUpdate = {
        name: name.trim(),
        phone: phone,
        gender: gender,
        dob: dob,
        photoURL: finalPhotoURL,
      };

      // If the name was changed, add the timestamp
      if (name.trim().toLowerCase() !== user.name.toLowerCase()) {
        dataToUpdate.nameLastUpdatedAt = serverTimestamp();
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, dataToUpdate);
      Alert.alert("Changes Saved", "Your profile has been updated successfully.", [{ text: "OK" }]);
      navigation.goBack();
    } catch (error) {
      console.error("Profile Update Error:", error);
      Alert.alert("Update Failed", "An error occurred while saving your changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>More Account Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={isWideScreen && styles.gridContainer}>
          {/* --- Personal Information --- */}
          <Section title="🧍‍♂️ Personal Information" style={isWideScreen && styles.gridItem} styles={styles}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileBigCircle}>
                  <Text style={styles.initialsText}>{(name || 'G').charAt(0)}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadPhoto} disabled={isUploading}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.uploadBtnText}>{profileImage ? 'Change Photo' : 'Upload Photo'}</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                editable={canChangeName}
                value={name}
                onChangeText={setName}
                placeholderTextColor={theme.textSecondary}
              />
              {!canChangeName && (
                <Text style={styles.restrictionText}>
                  You can change your name again after {nextNameChangeDate}.
                </Text>
              )}
              {canChangeName && (
                <Text style={[styles.restrictionText, { color: '#888' }]}>
                  Note: Your name can only be changed once every 60 days.
                </Text>
              )}
            </View>
            <SettingRow label="Email Address" onPress={() => Alert.alert("Info", "This would open the email change modal.")} value={user.email} theme={theme} styles={styles} />
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
            <SettingRow label="Gender" onPress={() => setGenderModalVisible(true)} value={gender} theme={theme} styles={styles} />
            <SettingRow label="Date of Birth" onPress={() => setDobModalVisible(true)} value={dob || 'Not set'} theme={theme} styles={styles} />
            <SettingRow label="Location / Address" onPress={() => Alert.alert("Info", "This would open an address editor.")} value="Lilongwe, Malawi" theme={theme} styles={styles} />
            
            <View style={styles.formGroup}>
              <TouchableOpacity style={styles.button} onPress={handleSaveChanges} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </Section>

          {/* --- Buying Preferences --- */}
          <Section title="🛒 Buying Preferences" style={isWideScreen && styles.gridItem} styles={styles}>
            <SettingRow label="Preferred Categories" onPress={() => Alert.alert("Info", "Navigate to category preference screen.")} theme={theme} styles={styles} />
          </Section>

          {/* --- Payment & Orders --- */}
          <Section title="💳 Payment & Orders" style={isWideScreen && styles.gridItem} styles={styles}>
            <SettingRow label="Billing Address" onPress={() => navigation.navigate("BillingAddress")} theme={theme} styles={styles} />
            <SettingRow label="Order History" onPress={() => navigation.goBack()} theme={theme} styles={styles} />
            <SettingRow label="Refund / Return Requests" onPress={() => navigation.navigate("RefundRequests")} theme={theme} styles={styles} />
          </Section>

          {/* --- Security & Privacy --- */}
          <Section title="🔐 Security & Privacy" style={isWideScreen && styles.gridItem} styles={styles}>
            <SettingRow label="Two-Factor Authentication" onPress={() => Alert.alert("Info", "Navigate to 2FA setup screen.")} value="Disabled" theme={theme} styles={styles} />
            <SettingRow label="Login Activity / Sessions" onPress={() => navigation.navigate("LoginActivity")} theme={theme} styles={styles} />
          </Section>

          {/* --- Notifications --- */}
          <Section title="🔔 Notifications" style={isWideScreen && styles.gridItem} styles={styles}>
            <SettingRow label="Push Notifications" theme={theme} styles={styles}>
              <Switch value={pushNotifications} onValueChange={setPushNotifications} trackColor={{ false: "#767577", true: "#ffad75" }} thumbColor={pushNotifications ? "#ff6f00" : "#f4f3f4"} />
            </SettingRow>
            <SettingRow label="Email Notifications" theme={theme} styles={styles}>
              <Switch value={emailNotifications} onValueChange={setEmailNotifications} trackColor={{ false: "#767577", true: "#ffad75" }} thumbColor={emailNotifications ? "#ff6f00" : "#f4f3f4"} />
            </SettingRow>
            <SettingRow label="SMS Alerts" theme={theme} styles={styles}>
              <Switch value={smsAlerts} onValueChange={setSmsAlerts} trackColor={{ false: "#767577", true: "#ffad75" }} thumbColor={smsAlerts ? "#ff6f00" : "#f4f3f4"} />
            </SettingRow>
          </Section>

          {/* --- Communication --- */}
          <Section title="💬 Communication" style={isWideScreen && styles.gridItem} styles={styles}>
            <SettingRow label="Blocked Sellers / Users" onPress={() => navigation.navigate("BlockedUsers")} theme={theme} styles={styles} />
          </Section>

          {/* --- Support & Feedback --- */}
          <Section title="🧾 Support & Feedback" style={isWideScreen && styles.gridItem} styles={styles}>
            <SettingRow label="Help Center / FAQs" onPress={() => navigation.navigate("HelpCenter")} theme={theme} styles={styles} />
            <SettingRow label="Report a Problem" onPress={() => { setReportModalVisible(true); setReportSentSuccess(false); }} theme={theme} styles={styles} />
            <SettingRow label="Rate the App" onPress={() => setRatingModalVisible(true)} theme={theme} styles={styles}/>
          </Section>

          <View style={{ height: 50, width: '100%' }} />
        </View>

        {/* --- Modals for Editing --- */}
        {/* Gender Selection Modal */}
        <Modal
          visible={isGenderModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setGenderModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.modalOption}
                  onPress={() => {
                    setGender(g);
                    setGenderModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{g}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.modalOption, { marginTop: 10, backgroundColor: theme.input }]} onPress={() => setGenderModalVisible(false)}>
                <Text style={styles.modalOptionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Date of Birth Modal */}
        <Modal
          visible={isDobModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDobModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Date of Birth</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
                value={dob}
                onChangeText={setDob}
              />
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => setDobModalVisible(false)}
              >
                <Text style={styles.modalOptionText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalOption, { marginTop: 10, backgroundColor: theme.input }]} onPress={() => setDobModalVisible(false)}>
                <Text style={styles.modalOptionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Report a Problem Modal */}
        <Modal
          visible={isReportModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeReportModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {reportSentSuccess ? (
                <>
                  <Ionicons name="checkmark-circle-outline" size={48} color="#22c55e" style={{ alignSelf: 'center', marginBottom: 12 }} />
                  <Text style={styles.modalTitle}>Report Sent</Text>
                  <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 20, fontSize: 15 }}>
                    Thank you for your report, we will review it and make it up to you soon.
                  </Text>
                  <TouchableOpacity style={[styles.modalOption, { width: '100%' }]} onPress={closeReportModal}>
                    <Text style={styles.modalOptionText}>Close</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalTitle}>Report a Problem</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Issue (e.g., Login Problem, UI Glitch)"
                    placeholderTextColor={theme.textSecondary}
                    value={reportIssue}
                    onChangeText={setReportIssue}
                  />
                  <TextInput
                    style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                    placeholder="Explain the problem you are facing..."
                    placeholderTextColor={theme.textSecondary}
                    value={reportExplanation}
                    onChangeText={setReportExplanation}
                    multiline
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 }}>
                    <TouchableOpacity style={[styles.modalOption, { flex: 1, marginRight: 8, backgroundColor: theme.input }]} onPress={closeReportModal}>
                      <Text style={styles.modalOptionText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalOption, { flex: 1, marginLeft: 8 }]} onPress={handleSendReport} disabled={isSendingReport}>
                      <Text style={styles.modalOptionText}>{isSendingReport ? 'Sending...' : 'Send'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Rating Modal */}
        <Modal
          visible={isRatingModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setRatingModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rate Our App</Text>
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 20, fontSize: 15 }}>
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
                style={[styles.modalOption, { width: '100%', marginTop: 10, backgroundColor: '#16a34a' }]}
                onPress={() => {
                  setRatingModalVisible(false);
                  Alert.alert(`Thank you for rating us ${appRating} stars!`);
                  setAppRating(0); // Reset rating
                }}
              >
                <Text style={styles.modalOptionText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  scrollContainer: { paddingBottom: 50 },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionBody: {
    backgroundColor: theme.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  rowLabel: {
    fontSize: 16,
    color: theme.text,
  },
  rowValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 16,
    color: theme.textSecondary,
    marginRight: 8,
  },
  formGroup: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  label: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.input,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: theme.text,
  },
  restrictionText: {
    fontSize: 12,
    color: '#ff9800', // An amber color for info/warning
    marginTop: 6,
    paddingHorizontal: 4,
  },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 10 },
  uploadBtnText: { color: '#fff', marginLeft: 5, fontSize: 12, fontWeight: 'bold' },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  profileBigCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  initialsText: { fontSize: 28, fontWeight: 'bold', color: theme.text },

  button: { backgroundColor: theme.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 15, textAlign: 'center' },
  modalOption: { backgroundColor: theme.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  modalOptionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '90%',
    marginBottom: 20,
  },
  // --- Responsive Grid Styles ---
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 8 },
  gridItem: { width: '48%', marginBottom: 12, marginTop: 12 },
});