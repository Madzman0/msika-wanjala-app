// screens/DepotHomeScreen.js
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
 DepotHomeScreen (GUI-only demo)
 - Tabs bottom: Incoming | At Depot | Notifications | History | Profile
 - Depot receives seller QR -> creates merged QR -> parcel appears At Depot
 - Simulate notifying transporters; simulate transporter claiming
 - Transporter scans QR at depot -> starts in-transit progress (simulated)
 - When delivered, depot gets notification & adds to history
 - Header with profile + expandable hamburger menu
*/

const SAMPLE_TRANSPORTERS = [
  { id: "T-9001", name: "Michael Transport", type: "bike" },
  { id: "T-9002", name: "Zoom Logistics", type: "truck" },
  { id: "T-9003", name: "Rapid Rides", type: "bike" },
];

const NOW = Date.now();

// Sample incoming seller QR payloads (simulated sellers send to depot)
const INITIAL_INCOMING = [
  {
    id: "SQR-001",
    productTitle: "Fresh Veg Box",
    sellerName: "Green Farm Ltd",
    sellerPhone: "+265 88 111 222",
    buyerName: "John M",
    buyerPhone: "+265 88 100 200",
    buyerAddress: "123 Market Rd, Lilongwe",
    buyerCoords: { lat: -13.9620, lon: 33.7750 },
    transportTypeNeeded: "bike",
    weightKg: 12,
    createdAt: NOW - 1000 * 60 * 5,
  },
  {
    id: "SQR-002",
    productTitle: "Smartphone Order",
    sellerName: "Tech Hub",
    sellerPhone: "+265 88 222 333",
    buyerName: "Sarah K",
    buyerPhone: "+265 88 200 300",
    buyerAddress: "22 Tech Ave, Blantyre",
    buyerCoords: { lat: -15.3875, lon: 35.3229 },
    transportTypeNeeded: "truck",
    weightKg: 3,
    createdAt: NOW - 1000 * 60 * 22,
  },
];

export default function DepotHomeScreen({ navigation }) {
  // Depot profile (pretend loaded)
  const [depot] = useState({
    id: "D1",
    name: "Central Depot - Lilongwe",
    location: { lat: -13.9626, lon: 33.7741 },
  });

  // UI / app state
  const [activeTab, setActiveTab] = useState("Incoming");
  const [incoming, setIncoming] = useState(INITIAL_INCOMING);
  const [depotParcels, setDepotParcels] = useState([]); // parcels stored/managed at depot
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [transporters] = useState(SAMPLE_TRANSPORTERS);
  const [menuOpen, setMenuOpen] = useState(false);

  // modals & temp states
  const [mergeModalParcel, setMergeModalParcel] = useState(null);
  const [mergeModalVisible, setMergeModalVisible] = useState(false);

  const [claimModalParcel, setClaimModalParcel] = useState(null);
  const [claimModalVisible, setClaimModalVisible] = useState(false);

  const [scanModalParcel, setScanModalParcel] = useState(null);
  const [scanModalVisible, setScanModalVisible] = useState(false);

  const [deliveryConfirmParcel, setDeliveryConfirmParcel] = useState(null);
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);

  const progressRefs = useRef({}); // store progress intervals per parcel id

  // Helper: push depot notification
  const pushNotif = (text) => {
    setNotifications((prev) => [{ id: `N-${Date.now()}`, text, time: Date.now() }, ...prev]);
  };

  // Generate a merged QR when depot receives seller QR (simulate)
  const createMergedQrAndStore = (sellerQr) => {
    // Create merged QR object
    const merged = {
      id: `MQR-${sellerQr.id}-${Date.now()}`,
      fromSellerId: sellerQr.id,
      parcelId: `DP-${Math.floor(Math.random() * 9000) + 1000}`,
      mapLink: `MAP://to/${sellerQr.buyerCoords.lat},${sellerQr.buyerCoords.lon}`,
      buyerName: sellerQr.buyerName,
      buyerPhone: sellerQr.buyerPhone,
      buyerAddress: sellerQr.buyerAddress,
      sellerName: sellerQr.sellerName,
      generatedAt: Date.now(),
    };

    // Build a parcel record for depot
    const parcel = {
      id: merged.parcelId,
      title: sellerQr.productTitle,
      sellerName: sellerQr.sellerName,
      buyerName: sellerQr.buyerName,
      buyerPhone: sellerQr.buyerPhone,
      buyerAddress: sellerQr.buyerAddress,
      buyerCoords: sellerQr.buyerCoords,
      transportType: sellerQr.transportTypeNeeded,
      weightKg: sellerQr.weightKg,
      depotAssigned: depot.id,
      status: "atDepot", // atDepot | claimed | inTransit | delivered
      claimedBy: null,
      claimedByName: null,
      mergedQr: merged,
      createdAt: Date.now(),
      progress: 0,
      chat: [],
    };

    // remove seller QR from incoming, add to depotParcels
    setIncoming((prev) => prev.filter((s) => s.id !== sellerQr.id));
    setDepotParcels((prev) => [parcel, ...prev]);

    // notify transporters (simulated)
    pushNotif(`New parcel ${parcel.id} at ${depot.name} — needs ${parcel.transportType.toUpperCase()}`);
    // also add global "transporters notified" entry to notifications array
    setNotifications((prev) => [{ id: `NT-${Date.now()}`, text: `Parcel ${parcel.id} available for ${parcel.transportType}`, time: Date.now() }, ...prev]);

    return parcel;
  };

  // Simulate transporter claiming the parcel (this is triggered from depot UI for demo)
  const simulateTransporterClaim = (parcel, transporterId) => {
    const t = transporters.find((x) => x.id === transporterId);
    if (!t) {
      Alert.alert("No transporter", "Transporter not found.");
      return;
    }
    setDepotParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "claimed", claimedBy: t.id, claimedByName: t.name } : p)));
    pushNotif(`${t.name} claimed ${parcel.id} — waiting to arrive and scan QR.`);
  };

  // Simulate transporter arrives and scans QR at depot -> this transitions to inTransit
  const transporterScansQr = (parcelId) => {
    const parcel = depotParcels.find((p) => p.id === parcelId);
    if (!parcel) return;
    if (!parcel.claimedBy) {
      Alert.alert("Cannot scan", "Parcel must be claimed by transporter first.");
      return;
    }

    // simulate scanning: show buyer details (QR info) in modal then start in-transit
    setScanModalParcel(parcel);
    setScanModalVisible(true);
  };

  const confirmScanAndStartTransit = (parcel) => {
    // mark inTransit and start progress simulation
    setDepotParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "inTransit" } : p)));
    setScanModalVisible(false);
    pushNotif(`Parcel ${parcel.id} is now in transit (claimed by ${parcel.claimedByName})`);
    // simulate buyer notification (GUI-only)
    setNotifications((prev) => [{ id: `B-${Date.now()}`, text: `Buyer ${parcel.buyerName} notified: parcel ${parcel.id} en-route`, time: Date.now() }, ...prev]);

    startParcelProgress(parcel.id);
  };

  // Start progress simulation for in-transit parcels (updates depotParcels and pushes updates)
  const startParcelProgress = (parcelId) => {
    // clear existing if present
    if (progressRefs.current[parcelId]) {
      clearInterval(progressRefs.current[parcelId]);
    }
    let progress = 0;
    progressRefs.current[parcelId] = setInterval(() => {
      progress += Math.round(8 + Math.random() * 10); // 8-18% increments
      if (progress >= 95) {
        progress = 95;
        // update then clear - waiting for manual delivered confirmation
        setDepotParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
        clearInterval(progressRefs.current[parcelId]);
        delete progressRefs.current[parcelId];
        return;
      }
      setDepotParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
    }, 1000);
  };

  // Mark parcel delivered (transporter confirms) -> depot receives delivered notification and archive
  const confirmParcelDelivered = (parcel) => {
    setDepotParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "delivered", progress: 100 } : p)));
    setHistory((prev) => [{ ...parcel, status: "delivered", deliveredAt: Date.now() }, ...prev]);
    setNotifications((prev) => [{ id: `H-${Date.now()}`, text: `Parcel ${parcel.id} delivered — depot notified`, time: Date.now() }, ...prev]);
    // remove intervals
    if (progressRefs.current[parcel.id]) {
      clearInterval(progressRefs.current[parcel.id]);
      delete progressRefs.current[parcel.id];
    }
    pushNotif(`Parcel ${parcel.id} marked delivered. Archived in history.`);
  };

  // Chat message add (demo)
  const addDepotChat = (parcelId, message) => {
    setDepotParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, chat: [...(p.chat || []), { ...message, time: Date.now() }] } : p)));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(progressRefs.current).forEach((i) => clearInterval(i));
    };
  }, []);

  // Renderers for tabs
  const renderIncoming = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{item.productTitle}</Text>
        <Text style={styles.small}>{item.transportTypeNeeded.toUpperCase()}</Text>
      </View>
      <Text style={styles.small}>Seller: {item.sellerName} • {item.sellerPhone}</Text>
      <Text style={styles.small}>Buyer: {item.buyerName} • {item.buyerPhone}</Text>
      <Text style={styles.small}>Address: {item.buyerAddress}</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => { setMergeModalParcel(item); setMergeModalVisible(true); }}>
          <Text style={styles.primaryBtnText}>Create Merged QR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => {
          // reject/remove incoming (simulate)
          setIncoming((prev) => prev.filter((s) => s.id !== item.id));
          pushNotif(`Seller QR ${item.id} rejected/removed.`);
        }}>
          <Text style={styles.ghostBtnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAtDepot = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{item.title} • {item.id}</Text>
        <Text style={[styles.statusPill, item.status === "inTransit" ? styles.inTransit : item.status === "delivered" ? styles.delivered : styles.claimed]}>
          {item.status.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.small}>Seller: {item.sellerName}</Text>
      <Text style={styles.small}>Buyer: {item.buyerName} • {item.buyerPhone}</Text>
      <Text style={styles.small}>Pickup Depot: {item.depotAssigned}</Text>

      <View style={{ height: 8 }} />
      <View style={styles.progressBarBg}><View style={[styles.progressBarFg, { width: `${Math.min(item.progress || 0, 100)}%` }]} /></View>
      <Text style={styles.small}>{(item.progress || 0).toFixed(0)}% progress</Text>

      <View style={styles.row}>
        {item.status === "atDepot" && (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => {
              // open modal to simulate transporter claiming
              setClaimModalParcel(item);
              setClaimModalVisible(true);
            }}>
              <Text style={styles.primaryBtnText}>Simulate Claim</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => {
              // view merged QR
              Alert.alert("Merged QR", JSON.stringify(item.mergedQr, null, 2));
            }}>
              <Text style={styles.ghostBtnText}>View QR</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === "claimed" && (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => transporterScansQr(item.id)}>
              <Text style={styles.primaryBtnText}>Transporter Scans QR (simulate)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => {
              Alert.alert("Claimed By", `${item.claimedByName} (${item.claimedBy})`);
            }}>
              <Text style={styles.ghostBtnText}>Who Claimed</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === "inTransit" && (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => { setDeliveryConfirmParcel(item); setDeliveryModalVisible(true); }}>
              <Text style={styles.primaryBtnText}>Confirm Delivered</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => {
              // view buyer map link
              Alert.alert("Buyer Map", item.mergedQr?.mapLink || "No map");
            }}>
              <Text style={styles.ghostBtnText}>View Map</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === "delivered" && (
          <Text style={{ alignSelf: "center", marginLeft: 8 }}>Delivered • Archived</Text>
        )}
      </View>
    </View>
  );

  const renderNotif = ({ item }) => (
    <View style={styles.notificationRow}>
      <Text style={{ color: "#111", fontWeight: "600" }}>{item.text}</Text>
      <Text style={{ color: "#777", fontSize: 12 }}>{new Date(item.time).toLocaleTimeString()}</Text>
    </View>
  );

  const renderHistory = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title} • {item.id}</Text>
      <Text style={styles.small}>Delivered At: {new Date(item.deliveredAt || Date.now()).toLocaleString()}</Text>
      <Text style={styles.small}>Buyer: {item.buyerName}</Text>
    </View>
  );

  // Handlers for modals
  const handleCreateMergedQr = () => {
    if (!mergeModalParcel) return;
    const added = createMergedQrAndStore(mergeModalParcel);
    setMergeModalVisible(false);
    setMergeModalParcel(null);
    // Optionally navigate or highlight At Depot
    setActiveTab("At Depot");
    // For demo: auto notify transporters by adding notification entries per transporter
    transporters.forEach((t) => {
      if (t.type === added.transportType || true) {
        // keep it generic: notify all
        setTimeout(() => {
          setNotifications((prev) => [{ id: `TP-${Date.now()}-${t.id}`, text: `Notice to ${t.name}: parcel ${added.id} ready at ${depot.name}`, time: Date.now() }, ...prev]);
        }, 250);
      }
    });
  };

  const handleClaimBySelectedTransporter = (transporterId) => {
    if (!claimModalParcel) return;
    simulateTransporterClaim(claimModalParcel, transporterId);
    setClaimModalVisible(false);
    setClaimModalParcel(null);
    pushNotif(`Simulated: ${transporterId} claimed parcel`);
  };

  const handleConfirmDelivery = () => {
    if (!deliveryConfirmParcel) return;
    confirmParcelDelivered(deliveryConfirmParcel);
    setDeliveryModalVisible(false);
    setDeliveryConfirmParcel(null);
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation?.openDrawer?.() || Alert.alert("Menu", "Open menu")} style={{ padding: 6 }}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>{depot.name}</Text>
            <Text style={styles.headerSub}>Depot ID: {depot.id}</Text>
          </View>
        </View>

        {/* right: profile + hamburger */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => Alert.alert("Depot Profile", `${depot.name}\nID: ${depot.id}`)} style={{ marginRight: 10 }}>
            <Ionicons name="business" size={30} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuOpen((s) => !s)} style={{ padding: 6 }}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* dropdown menu */}
        {menuOpen && (
          <View style={styles.dropdown}>
            <TouchableOpacity onPress={() => { setMenuOpen(false); navigation?.replace?.("BuyerHomeScreen") || Alert.alert("Switch", "Switch to Buyer (simulated)"); }} style={styles.dropdownItem}>
              <Text>Switch to Buyer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMenuOpen(false); navigation?.replace?.("SellerHome") || Alert.alert("Switch", "Switch to Seller (simulated)"); }} style={styles.dropdownItem}>
              <Text>Switch to Seller</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMenuOpen(false); Alert.alert("Profile", "Open depot profile (simulated)"); }} style={styles.dropdownItem}>
              <Text>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMenuOpen(false); navigation?.replace?.("Welcome") || Alert.alert("Logout", "Simulated logout"); }} style={[styles.dropdownItem, { borderBottomWidth: 0 }]}>
              <Text style={{ color: "#ef4444" }}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1, padding: 12 }}>
        {activeTab === "Incoming" && (
          <FlatList
            data={incoming}
            keyExtractor={(i) => i.id}
            renderItem={renderIncoming}
            ListEmptyComponent={<Text style={styles.placeholder}>No seller QR's waiting — incoming will appear here.</Text>}
          />
        )}

        {activeTab === "At Depot" && (
          <FlatList
            data={depotParcels}
            keyExtractor={(i) => i.id}
            renderItem={renderAtDepot}
            ListEmptyComponent={<Text style={styles.placeholder}>No parcels currently at the depot.</Text>}
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
            keyExtractor={(h) => h.id || h.parcelId || `${h.title}-${h.deliveredAt}`}
            renderItem={renderHistory}
            ListEmptyComponent={<Text style={styles.placeholder}>No history yet.</Text>}
          />
        )}

        {activeTab === "Profile" && (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={styles.profileBox}>
              <Text style={styles.profileTitle}>{depot.name}</Text>
              <Text style={styles.small}>Depot ID: {depot.id}</Text>
              <Text style={styles.small}>Location: {depot.location.lat.toFixed(4)}, {depot.location.lon.toFixed(4)}</Text>
              <View style={{ height: 12 }} />
              <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert("Settings", "Depot settings (UI-only)")}>
                <Text style={styles.primaryBtnText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ghostBtn, { marginTop: 12 }]} onPress={() => Alert.alert("Export", "Export logs (simulated)")}>
                <Text style={styles.ghostBtnText}>Export Logs</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {/* BOTTOM TAB BAR */}
      <SafeAreaView style={[styles.tabbar, { backgroundColor: "#fff" }]}>
        {[
          { name: "Incoming", icon: "download-outline" },
          { name: "At Depot", icon: "cube-outline" },
          { name: "Notifications", icon: "notifications-outline" },
          { name: "History", icon: "time-outline" },
          { name: "Profile", icon: "person-circle-outline" },
        ].map((t) => (
          <TouchableOpacity
            key={t.name}
            style={[styles.tabItem, activeTab === t.name && styles.tabActive]}
            onPress={() => setActiveTab(t.name)}
          >
            <Ionicons name={t.icon} size={22} color={activeTab === t.name ? "#2563eb" : "#6b7280"} />
            <Text style={[styles.tabText, activeTab === t.name && styles.tabTextActive]}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </SafeAreaView>

      {/* MODALS */}

      {/* Merge QR Modal */}
      <Modal visible={mergeModalVisible} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Merged QR</Text>
            <Text style={styles.small}>Seller QR: {mergeModalParcel?.id}</Text>
            <Text style={styles.small}>Product: {mergeModalParcel?.productTitle}</Text>
            <Text style={styles.small}>Buyer: {mergeModalParcel?.buyerName} • {mergeModalParcel?.buyerPhone}</Text>

            <View style={{ height: 12 }} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateMergedQr}>
                <Text style={styles.primaryBtnText}>Create & Publish</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => { setMergeModalVisible(false); setMergeModalParcel(null); }}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Claim Modal (choose transporter to simulate claim) */}
      <Modal visible={claimModalVisible} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Simulate Transporter Claim</Text>
            <Text style={styles.small}>Parcel: {claimModalParcel?.id} • {claimModalParcel?.title}</Text>

            <View style={{ height: 10 }} />
            {transporters.map((t) => (
              <TouchableOpacity key={t.id} style={{ paddingVertical: 10 }} onPress={() => handleClaimBySelectedTransporter(t.id)}>
                <Text style={{ fontWeight: "700" }}>{t.name} • {t.type.toUpperCase()}</Text>
                <Text style={{ color: "#666", fontSize: 12 }}>Tap to simulate claim</Text>
              </TouchableOpacity>
            ))}

            <View style={{ height: 10 }} />
            <TouchableOpacity style={[styles.ghostBtn]} onPress={() => { setClaimModalVisible(false); setClaimModalParcel(null); }}>
              <Text style={styles.ghostBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scan Modal (shows merged QR details and confirm start transit) */}
      <Modal visible={scanModalVisible} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCardLarge}>
            <Text style={styles.modalTitle}>Transporter Scanned QR</Text>
            <Text style={styles.small}>Parcel: {scanModalParcel?.id}</Text>
            <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Buyer:</Text> {scanModalParcel?.buyerName}</Text>
            <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Phone:</Text> {scanModalParcel?.buyerPhone}</Text>
            <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Address:</Text> {scanModalParcel?.buyerAddress}</Text>
            <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Map:</Text> {scanModalParcel?.mergedQr?.mapLink}</Text>

            <View style={{ height: 12 }} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => confirmScanAndStartTransit(scanModalParcel)}>
                <Text style={styles.primaryBtnText}>Start Transit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => setScanModalVisible(false)}>
                <Text style={styles.ghostBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delivery confirm modal */}
      <Modal visible={deliveryModalVisible} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Delivered</Text>
            <Text style={styles.small}>Parcel: {deliveryConfirmParcel?.id}</Text>
            <Text style={styles.small}>Delivered by: {deliveryConfirmParcel?.claimedByName}</Text>

            <View style={{ height: 12 }} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmDelivery}>
                <Text style={styles.primaryBtnText}>Yes — Mark Delivered</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => { setDeliveryModalVisible(false); setDeliveryConfirmParcel(null); }}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
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

  // dropdown menu
  dropdown: {
    position: "absolute",
    top: 62,
    right: 10,
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    zIndex: 9999,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },

  tabbar: { flexDirection: "row", backgroundColor: "#fff", elevation: 4 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabActive: { borderTopWidth: 3, borderTopColor: "#2563eb" },
  tabText: { color: "#6b7280", fontWeight: "600", fontSize: 12 },
  tabTextActive: { color: "#2563eb" },

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
  ghostBtn: { borderWidth: 1, borderColor: "#e6e9f2", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  ghostBtnText: { color: "#333", fontWeight: "700" },

  placeholder: { color: "#9ca3af", textAlign: "center", marginTop: 28 },

  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalCardLarge: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },

  notificationRow: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 10, elevation: 1 },

  profileBox: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 1 },
  profileTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },

  progressBarBg: { height: 8, backgroundColor: "#eef2ff", borderRadius: 6, overflow: "hidden", marginTop: 8 },
  progressBarFg: { height: 8, backgroundColor: "#2563eb" },

  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, color: "#fff", fontWeight: "700" },
  claimed: { backgroundColor: "#f59e0b", color: "#fff" },
  inTransit: { backgroundColor: "#2563eb", color: "#fff" },
  delivered: { backgroundColor: "#10b981", color: "#fff" },

  input: { borderWidth: 1, borderColor: "#e6e9f2", borderRadius: 10, padding: 10, backgroundColor: "#fff" },
});
