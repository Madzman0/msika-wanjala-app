// screens/TransporterHomeScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/*
 TransporterHomeScreen
 - Full UI-only transporter workflow prototype (not backend)
 - Tabs: Available | My Parcels | Notifications | History | Profile
 - Competitive claiming / confirm modal
 - Nearest depot filtering
 - QR scan (simulated) -> show buyer info + map + delivery point
 - Start Delivery -> progress simulation
 - Chat / messages (GUI only)
 - Buyer confirmation & rating flow (simulated)
*/

const DEPOTS = [
  { id: "D1", name: "Depot A", lat: -13.9626, lon: 33.7741 },
  { id: "D2", name: "Depot B", lat: -15.3875, lon: 35.3229 },
  { id: "D3", name: "Depot C", lat: -14.0000, lon: 34.0000 },
];

// some sample parcels pre-created after payment (qrData simulating seller-created QR)
const INITIAL_PARCELS = [
  {
    id: "P-1001",
    title: "Fresh Veg Box",
    buyerName: "John M",
    buyerPhone: "+265 88 100 200",
    buyerAddress: "123 Market Rd, Lilongwe",
    buyerCoords: { lat: -13.9620, lon: 33.7750 },
    transportType: "bike", // type registered by transporter
    weightKg: 12,
    depotAssigned: null, // calculated as nearest depot
    status: "ready", // ready, competing, claimed, atDepot, inTransit, delivered
    claimedBy: null, // transporter id
    qrData: null, // will be simulated
    chat: [], // messages between transporter and buyer
    progress: 0, // delivery progress %
    ratingByBuyer: null, // after delivered
    createdAt: Date.now(),
  },
  {
    id: "P-1002",
    title: "Smartphone Order",
    buyerName: "Sarah K",
    buyerPhone: "+265 88 200 300",
    buyerAddress: "22 Tech Ave, Blantyre",
    buyerCoords: { lat: -15.3875, lon: 35.3229 },
    transportType: "truck",
    weightKg: 3,
    depotAssigned: null,
    status: "ready",
    claimedBy: null,
    qrData: null,
    chat: [],
    progress: 0,
    ratingByBuyer: null,
    createdAt: Date.now(),
  },
  {
    id: "P-1003",
    title: "Shoe Delivery",
    buyerName: "Alice P",
    buyerPhone: "+265 99 444 555",
    buyerAddress: "7 Fashion St, Zomba",
    buyerCoords: { lat: -15.3830, lon: 35.3200 },
    transportType: "bike",
    weightKg: 1.2,
    depotAssigned: null,
    status: "ready",
    claimedBy: null,
    qrData: null,
    chat: [],
    progress: 0,
    ratingByBuyer: null,
    createdAt: Date.now(),
  },
];

// simple distance (approx) for nearest-depot calc (not precise, fine for demo)
const distSq = (a, b) => (a.lat - b.lat) ** 2 + (a.lon - b.lon) ** 2;

export default function TransporterHomeScreen({ navigation }) {
  // transporter profile (pretend this is loaded from auth)
  const [transporter] = useState({
    id: "T-9001",
    name: "Michael Transport",
    type: "bike", // this determines which parcels he receives
    location: { lat: -13.9625, lon: 33.7740 }, // base location
    assignedDepot: "D1",
  });

  // app state
  const [activeTab, setActiveTab] = useState("Available");
  const [parcels, setParcels] = useState(() => {
    // initialize parcels and compute nearest depot + qrData simulated
    return INITIAL_PARCELS.map((p) => {
      const depot = DEPOTS.reduce((acc, d) => (distSq(p.buyerCoords, d) < distSq(p.buyerCoords, acc) ? d : acc), DEPOTS[0]);
      return {
        ...p,
        depotAssigned: depot.id,
        qrData: {
          id: `QR-${p.id}`,
          mapLink: `MAP://to/${p.buyerCoords.lat},${p.buyerCoords.lon}`,
          buyerName: p.buyerName,
          buyerPhone: p.buyerPhone,
          buyerAddress: p.buyerAddress,
          parcelId: p.id,
          generatedAt: Date.now(),
        },
      };
    });
  });

  const [myParcels, setMyParcels] = useState([]); // parcels assigned/taken by this transporter
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]); // delivered parcels
  // UI modals & helpers
  const [competingParcel, setCompetingParcel] = useState(null); // parcel under competition
  const [competeCountdown, setCompeteCountdown] = useState(6);
  const competeRef = useRef(null);
  const [showCompeteModal, setShowCompeteModal] = useState(false);

  const [qrModalParcel, setQrModalParcel] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const [chatParcel, setChatParcel] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatText, setChatText] = useState("");

  const [deliveryConfirmParcel, setDeliveryConfirmParcel] = useState(null);
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);

  const [ratingModalParcel, setRatingModalParcel] = useState(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [buyerRating, setBuyerRating] = useState("");

  // convenience: show only parcels that belong to this transporter's depot and type (simulate nearest-depot notifications)
  const availableParcelsForMe = parcels.filter(
    (p) => p.status === "ready" && p.transportType === transporter.type && p.depotAssigned === transporter.assignedDepot
  );

  // helper: push a notification
  const pushNotif = (title) => {
    setNotifications((prev) => [{ id: `N-${Date.now()}`, text: title, time: Date.now() }, ...prev]);
  };

  // COMPETITIVE GRAB LOGIC
  // When transporter taps "Compete", a 6-second window opens. If they press Confirm before timeout, they get it.
  // If they don't confirm, a simulated competitor may grab it.
  const startCompete = (parcel) => {
    if (parcel.status !== "ready") {
      Alert.alert("Not available", "This parcel is no longer available.");
      return;
    }
    setCompetingParcel(parcel);
    setCompeteCountdown(6);
    setShowCompeteModal(true);

    competeRef.current = setInterval(() => {
      setCompeteCountdown((c) => {
        if (c <= 1) {
          clearInterval(competeRef.current);
          // decide winner: small chance simulated competitor wins
          const competitorWins = Math.random() < 0.45; // 45% chance competitor beats you if you didn't confirm
          if (competitorWins) {
            // mark parcel taken by 'other'
            setParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "claimed", claimedBy: "other" } : p)));
            pushNotif(`Parcel ${parcel.id} taken by another transporter.`);
            setShowCompeteModal(false);
            setCompetingParcel(null);
          } else {
            // remains ready (you still have chance to confirm by pressing confirm quickly)
            setShowCompeteModal(false);
            setCompetingParcel(null);
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const confirmCompete = () => {
    if (!competingParcel) return;
    clearInterval(competeRef.current);
    // mark parcel claimed by this transporter
    setParcels((prev) => prev.map((p) => (p.id === competingParcel.id ? { ...p, status: "claimed", claimedBy: transporter.id } : p)));
    setMyParcels((prev) => [{ ...competingParcel, status: "claimed", claimedBy: transporter.id }, ...prev]);
    pushNotif(`You claimed ${competingParcel.id}. Proceed to depot to scan QR.`);
    setShowCompeteModal(false);
    setCompetingParcel(null);
  };

  // SCAN AT DEPOT -> when transporter reaches depot they scan QR and get parcel details (simulate)
  const openQrModal = (parcel) => {
    // only allow scan if parcel is claimed by this transporter or status 'claimed' with claimedBy = transporter.id
    if (parcel.claimedBy !== transporter.id && parcel.status !== "claimed") {
      Alert.alert("Cannot scan", "You need to claim this parcel first.");
      return;
    }
    setQrModalParcel(parcel);
    setQrModalVisible(true);
  };

  const scanAndStartDelivery = (parcel) => {
    // mark the parcel as atDepot -> then inTransit
    setParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "inTransit", claimedBy: transporter.id } : p)));
    setMyParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "inTransit" } : p)));
    setQrModalVisible(false);
    pushNotif(`You started delivery for ${parcel.id}. Buyer notified.`);
    // simulate notifying buyer (GUI only)
    addChatMessage(parcel.id, { sender: "system", text: `Transporter ${transporter.name} is en-route.` });
    // start progress simulation
    startProgressSimulation(parcel.id);
  };

  // progress simulation: increment parcel.progress every second until 90, then wait for transporter to mark delivered
  const startProgressSimulation = (parcelId) => {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.round(5 + Math.random() * 6); // approx 5-11% per sec
      if (progress >= 90) {
        progress = 90;
        // update once then stop auto-increment
        setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
        setMyParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
        clearInterval(progressInterval);
        return;
      }
      setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
      setMyParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
    }, 1000);

    // store reference on parcel in case we want to clear (not strictly necessary for demo)
  };

  // MARK DELIVERED (transporter taps 'Mark as delivered' -> will open a confirm which simulates buyer confirmation flow)
  const markDelivered = (parcel) => {
    setDeliveryConfirmParcel(parcel);
    setDeliveryModalVisible(true);
  };

  const confirmDeliveredByTransporter = () => {
    if (!deliveryConfirmParcel) return;
    // set status to delivered locally and push to history and ask for buyer rating simulation
    setParcels((prev) => prev.map((p) => (p.id === deliveryConfirmParcel.id ? { ...p, status: "delivered", progress: 100 } : p)));
    setMyParcels((prev) => prev.map((p) => (p.id === deliveryConfirmParcel.id ? { ...p, status: "delivered", progress: 100 } : p)));
    setHistory((prev) => [{ ...deliveryConfirmParcel, status: "delivered", deliveredAt: Date.now() }, ...prev]);
    pushNotif(`Parcel ${deliveryConfirmParcel.id} delivered. Waiting for buyer confirmation & rating.`);
    // open rating modal to simulate buyer rating
    setRatingModalParcel(deliveryConfirmParcel);
    setRatingModalVisible(true);
    setDeliveryModalVisible(false);
  };

  const submitBuyerRating = () => {
    if (!ratingModalParcel) return;
    const rating = Number(buyerRating) || 5;
    setParcels((prev) => prev.map((p) => (p.id === ratingModalParcel.id ? { ...p, ratingByBuyer: rating } : p)));
    setMyParcels((prev) => prev.map((p) => (p.id === ratingModalParcel.id ? { ...p, ratingByBuyer: rating } : p)));
    setHistory((prev) => prev.map((h) => (h.id === ratingModalParcel.id ? { ...h, ratingByBuyer: rating } : h)));
    pushNotif(`Buyer rated parcel ${ratingModalParcel.id} ${rating} ★`);
    setRatingModalVisible(false);
    setBuyerRating("");
    setRatingModalParcel(null);
  };

  // CHAT: append message to parcel.chat
  const addChatMessage = (parcelId, message) => {
    setParcels((prev) =>
      prev.map((p) => (p.id === parcelId ? { ...p, chat: [...(p.chat || []), { ...message, time: Date.now() }] } : p))
    );
    setMyParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, chat: [...(p.chat || []), { ...message, time: Date.now() }] } : p)));
  };

  const openChat = (parcel) => {
    setChatParcel(parcel);
    setChatVisible(true);
  };

  const sendChat = () => {
    if (!chatText.trim() || !chatParcel) return;
    addChatMessage(chatParcel.id, { sender: transporter.name, text: chatText });
    setChatText("");
    // simulate buyer reply with slight delay
    setTimeout(() => {
      addChatMessage(chatParcel.id, { sender: chatParcel.buyerName, text: "Thanks — noted!", time: Date.now() });
    }, 1500);
  };

  // UI helpers
  useEffect(() => {
    return () => clearInterval(competeRef.current);
  }, []);

  // RENDERERS
  const renderAvailable = ({ item }) => {
    // only show parcels for this transporter's type & depot (they represent "notifications")
    if (item.transportType !== transporter.type || item.depotAssigned !== transporter.assignedDepot) return null;
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.badge}>{item.transportType.toUpperCase()}</Text>
        </View>
        <Text style={styles.small}>Parcel ID: {item.id}</Text>
        <Text style={styles.small}>Buyer: {item.buyerName} • {item.buyerPhone}</Text>
        <Text style={styles.small}>Depot: {item.depotAssigned}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => startCompete(item)}>
            <Text style={styles.primaryBtnText}>Compete (grab)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => openChat(item)}>
            <Text style={styles.ghostBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMyParcel = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={[styles.statusPill, item.status === "inTransit" ? styles.inTransit : item.status === "delivered" ? styles.delivered : styles.claimed]}>
            {item.status.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.small}>ID: {item.id}</Text>
        <Text style={styles.small}>Buyer: {item.buyerName} • {item.buyerPhone}</Text>
        <Text style={styles.small}>Depot: {item.depotAssigned}</Text>

        <View style={{ height: 8 }} />
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFg, { width: `${Math.min(item.progress || 0, 100)}%` }]} />
        </View>
        <Text style={styles.small}>{(item.progress || 0).toFixed(0)}% complete</Text>

        <View style={styles.row}>
          {item.status === "claimed" && item.claimedBy === transporter.id && (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => openQrModal(item)}>
              <Text style={styles.primaryBtnText}>Scan QR at Depot</Text>
            </TouchableOpacity>
          )}

          {item.status === "inTransit" && (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => markDelivered(item)}>
                <Text style={styles.primaryBtnText}>Mark Delivered</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => openChat(item)}>
                <Text style={styles.ghostBtnText}>Chat</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === "delivered" && (
            <>
              <Text style={{ alignSelf: "center", marginLeft: 8 }}>Delivered • Rating: {item.ratingByBuyer ?? "—"}</Text>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => openChat(item)}>
                <Text style={styles.ghostBtnText}>Chat</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderNotif = ({ item }) => (
    <View style={styles.notificationRow}>
      <Text style={{ color: "#111", fontWeight: "600" }}>{item.text}</Text>
      <Text style={{ color: "#777", fontSize: 12 }}>{new Date(item.time).toLocaleTimeString()}</Text>
    </View>
  );

  const renderHistory = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.small}>ID: {item.id}</Text>
      <Text style={styles.small}>Delivered At: {new Date(item.deliveredAt || Date.now()).toLocaleString()}</Text>
      <Text style={styles.small}>Rating: {item.ratingByBuyer ?? "—"}</Text>
    </View>
  );

  // Main UI
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
  {/* HEADER */}
  <View style={styles.header}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity onPress={() => navigation?.openDrawer?.() || Alert.alert("Menu", "Open menu")}>
        <Ionicons name="menu" size={26} color="#fff" />
      </TouchableOpacity>
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.headerTitle}>{transporter.name}</Text>
        <Text style={styles.headerSub}>{transporter.type.toUpperCase()} • Depot {transporter.assignedDepot}</Text>
      </View>
    </View>

    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity onPress={() => Alert.alert("Profile", "Open transporter profile")}>
        <Ionicons name="person-circle" size={34} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>

  {/* CONTENT */}
  <View style={{ flex: 1, padding: 12 }}>
    {activeTab === "Available" && (
      <FlatList
        data={availableParcelsForMe}
        keyExtractor={(i) => i.id}
        renderItem={renderAvailable}
        ListEmptyComponent={<Text style={styles.placeholder}>No parcels currently notifying your depot/type.</Text>}
      />
    )}

    {activeTab === "My Parcels" && (
      <FlatList
        data={myParcels}
        keyExtractor={(i) => i.id}
        renderItem={renderMyParcel}
        ListEmptyComponent={<Text style={styles.placeholder}>You have not claimed any parcels yet.</Text>}
      />
    )}

    {activeTab === "Notifications" && (
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={renderNotif}
        ListEmptyComponent={<Text style={styles.placeholder}>No notifications yet.</Text>}
      />
    )}

    {activeTab === "History" && (
      <FlatList
        data={history}
        keyExtractor={(i) => i.id}
        renderItem={renderHistory}
        ListEmptyComponent={<Text style={styles.placeholder}>No delivered parcels yet.</Text>}
      />
    )}

    {activeTab === "Profile" && (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.profileBox}>
          <Text style={styles.profileTitle}>{transporter.name}</Text>
          <Text style={styles.small}>Type: {transporter.type}</Text>
          <Text style={styles.small}>Depot: {transporter.assignedDepot}</Text>
          <Text style={styles.small}>Phone: +265 88 777 000</Text>

          <View style={{ height: 16 }} />

          <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert("Settings", "Open settings placeholder")}>
            <Text style={styles.primaryBtnText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.ghostBtn, { marginTop: 12 }]} onPress={() => Alert.alert("Logout", "Simulated logout")}>
            <Text style={styles.ghostBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )}
  </View>

  <SafeAreaView style={[styles.tabbar, { backgroundColor: "#fff" }]}>
  {[
    { name: "Available", icon: "cube-outline" },
    { name: "My Parcels", icon: "bicycle-outline" },
    { name: "Notifications", icon: "notifications-outline" },
    { name: "History", icon: "time-outline" },
    { name: "Profile", icon: "person-circle-outline" },
  ].map((t) => (
    <TouchableOpacity
      key={t.name}
      style={[styles.tabItem, activeTab === t.name && styles.tabActive]}
      onPress={() => setActiveTab(t.name)}
    >
      <Ionicons
        name={t.icon}
        size={24}
        color={activeTab === t.name ? "#2563eb" : "#6b7280"}
      />
      <Text
        style={[
          styles.tabText,
          activeTab === t.name && styles.tabTextActive,
        ]}
      >
        {t.name}
      </Text>
    </TouchableOpacity>
  ))}
</SafeAreaView>




      {/* COMPETE MODAL */}
      <Modal visible={showCompeteModal} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Competitive Grab</Text>
            <Text style={styles.small}>Parcel: {competingParcel?.id} — {competingParcel?.title}</Text>
            <Text style={{ marginTop: 8, fontSize: 16 }}>Confirm within: {competeCountdown}s</Text>

            <View style={{ height: 12 }} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={confirmCompete}>
                <Text style={styles.primaryBtnText}>Confirm & Take</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => { clearInterval(competeRef.current); setShowCompeteModal(false); setCompetingParcel(null); }}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 10 }} />
            <Text style={styles.small}>Tip: Confirm fast — simulated competitors may take it.</Text>
          </View>
        </View>
      </Modal>

      {/* QR Modal */}
      <Modal visible={qrModalVisible} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCardLarge}>
            <Text style={styles.modalTitle}>Scan QR — Parcel {qrModalParcel?.id}</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Buyer:</Text> {qrModalParcel?.buyerName}</Text>
              <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Phone:</Text> {qrModalParcel?.buyerPhone}</Text>
              <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Address:</Text> {qrModalParcel?.buyerAddress}</Text>
              <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Map:</Text> {qrModalParcel?.qrData?.mapLink}</Text>
              <Text style={styles.small}><Text style={{ fontWeight: "700" }}>QR ID:</Text> {qrModalParcel?.qrData?.id}</Text>
            </View>

            <View style={{ height: 12 }} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => scanAndStartDelivery(qrModalParcel)}>
                <Text style={styles.primaryBtnText}>Scan & Start Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => setQrModalVisible(false)}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DELIVERY CONFIRMATION */}
      <Modal visible={deliveryModalVisible} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Delivery</Text>
            <Text style={styles.small}>Parcel: {deliveryConfirmParcel?.id} • {deliveryConfirmParcel?.title}</Text>

            <View style={{ height: 12 }} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={confirmDeliveredByTransporter}>
                <Text style={styles.primaryBtnText}>Yes — Delivered</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => setDeliveryModalVisible(false)}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* RATING MODAL (simulate buyer rating) */}
      <Modal visible={ratingModalVisible} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Buyer Rating (simulate)</Text>
            <Text style={styles.small}>Parcel: {ratingModalParcel?.id}</Text>
            <TextInput
              placeholder="Buyer rate seller (1-5)"
              keyboardType="numeric"
              value={buyerRating}
              onChangeText={setBuyerRating}
              style={styles.input}
            />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={submitBuyerRating}>
                <Text style={styles.primaryBtnText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => { setRatingModalVisible(false); setBuyerRating(""); }}>
                <Text style={styles.ghostBtnText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CHAT MODAL */}
      <Modal visible={chatVisible} transparent animationType="slide">
        <View style={styles.chatWrap}>
          <View style={styles.chatCard}>
            <View style={styles.rowBetween}>
              <Text style={{ fontWeight: "700" }}>Chat with {chatParcel?.buyerName}</Text>
              <TouchableOpacity onPress={() => setChatVisible(false)}><Ionicons name="close" size={22} /></TouchableOpacity>
            </View>
            <ScrollView style={{ marginVertical: 12, maxHeight: 300 }}>
              {(chatParcel?.chat || []).map((m, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: "#666" }}>{m.sender} • {new Date(m.time).toLocaleTimeString()}</Text>
                  <Text style={{ fontSize: 14 }}>{m.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.row}>
              <TextInput value={chatText} onChangeText={setChatText} placeholder="Type a message..." style={[styles.input, { flex: 1 }]} />
              <TouchableOpacity style={[styles.primaryBtn, { marginLeft: 8 }]} onPress={sendChat}>
                <Text style={styles.primaryBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc" },

  header: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerSub: { color: "#dbeafe", fontSize: 12 },

  tabbar: { flexDirection: "row", backgroundColor: "#fff", elevation: 2 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: "#2563eb" },
  tabText: { color: "#6b7280", fontWeight: "600" },
  tabTextActive: { color: "#2563eb" },

  content: { flex: 1, padding: 12 },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  cardTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  small: { color: "#6b7280", fontSize: 13, marginTop: 4 },

  primaryBtn: { backgroundColor: "#2563eb", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  ghostBtn: { borderWidth: 1, borderColor: "#e6e9f2", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginLeft: 8 },
  ghostBtnText: { color: "#333", fontWeight: "700" },

  badge: { backgroundColor: "#eef2ff", color: "#1e3a8a", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontWeight: "700" },

  placeholder: { color: "#9ca3af", textAlign: "center", marginTop: 28 },

  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalCardLarge: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },

  notificationRow: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 10, elevation: 1 },

  profileBox: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 1 },

  progressBarBg: { height: 8, backgroundColor: "#eef2ff", borderRadius: 6, overflow: "hidden", marginTop: 8 },
  progressBarFg: { height: 8, backgroundColor: "#2563eb" },

  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, color: "#fff", fontWeight: "700" },
  claimed: { backgroundColor: "#f59e0b", color: "#fff" },
  inTransit: { backgroundColor: "#2563eb", color: "#fff" },
  delivered: { backgroundColor: "#10b981", color: "#fff" },

  input: { borderWidth: 1, borderColor: "#e6e9f2", borderRadius: 10, padding: 10, backgroundColor: "#fff" },

  chatWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 16 },
  chatCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, maxHeight: "80%" },


  bottomTabbar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: "#e6e9f2",
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabActive: {
    borderTopWidth: 3,
    borderTopColor: "#2563eb",
  },
  tabText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#2563eb",
  },
  
});
