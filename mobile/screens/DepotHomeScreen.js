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
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/*
  Merged DepotHomeScreen (simulation)
  - Tabs: Incoming | Outgoing | At Depot | Notifications | History | Profile
  - Incoming: only parcels that arrived from another district AND transporter scanned them into depot
  - Outgoing: only local/regional parcels that have been received and picked by a transporter within region (inTransit)
  - At Depot: all parcels currently stored at depot
  - Scan flows:
     * Transporter scans when arriving (incoming) -> item appears at depot (merged), transporter paid (simulated)
     * Transporter scans when picking up (outgoing) -> starts inTransit and transporter paid (if not already)
     * Buyer scans on delivery -> seller paid -> parcel archived to history
  - QR object acts as transaction + mapLink
  - All monetary transfers simulated and recorded to balances + notifications
*/

const SAMPLE_TRANSPORTERS = [
  { id: "T-9001", name: "Michael Transport", type: "bike" },
  { id: "T-9002", name: "Zoom Logistics", type: "truck" },
  { id: "T-9003", name: "Rapid Rides", type: "bike" },
];

const NOW = Date.now();

// seller QRs coming from other districts (arriving to this depot)
// NOTE: originDistrict differs from depot district => treated as "incoming from another district"
const INITIAL_INCOMING = [
  {
    id: "SQR-001",
    productTitle: "Fresh Veg Box",
    sellerName: "Green Farm Ltd",
    sellerId: "seller-greenfarm", // Add sellerId here
    sellerPhone: "+265 88 111 222",
    buyerName: "John M",
    buyerPhone: "+265 88 100 200",
    buyerAddress: "123 Market Rd, Lilongwe",
    buyerCoords: { lat: -13.9620, lon: 33.7750 },
    transportTypeNeeded: "bike",
    originDistrict: "Mzuzu",
    weightKg: 12,
    createdAt: NOW - 1000 * 60 * 5,
  },
  {
    id: "SQR-002",
    productTitle: "Smartphone Order",
    sellerName: "Tech Hub",
    sellerId: "seller-techhub", // Add sellerId here
    sellerPhone: "+265 88 222 333",
    buyerName: "Sarah K",
    buyerPhone: "+265 88 200 300",
    buyerAddress: "22 Tech Ave, Blantyre",
    buyerCoords: { lat: -15.3875, lon: 35.3229 },
    transportTypeNeeded: "truck",
    originDistrict: "Mzimba",
    weightKg: 3,
    createdAt: NOW - 1000 * 60 * 22,
  },
];

// local/regional seller QRs (these originate within depot region -> candidates for outgoing)
const INITIAL_LOCAL = [
  {
    id: "LQR-101",
    productTitle: "Cooking Oil (5L)",
    sellerName: "Lilongwe Store",
    sellerId: "seller-lilongwe", // Add sellerId here
    sellerPhone: "+265 88 333 444",
    buyerName: "Alice B",
    buyerPhone: "+265 88 400 500",
    buyerAddress: "45 Central St, Lilongwe",
    buyerCoords: { lat: -13.9610, lon: 33.7760 },
    transportTypeNeeded: "car",
    originDistrict: "Lilongwe", // same as depot district sample
    weightKg: 5,
    createdAt: NOW - 1000 * 60 * 10,
  },
];

export default function DepotHomeScreen({ navigation, setIsLoggedIn }) {
  // Depot profile (pretend loaded)
  const DEPOT_DISTRICT = "Lilongwe"; // for easy comparisons
  const [depot] = useState({
    id: "D1",
    name: "Central Depot - Lilongwe",
    location: { lat: -13.9626, lon: 33.7741 },
    district: DEPOT_DISTRICT,
  });

  // UI / app state
  const [activeTab, setActiveTab] = useState("Incoming");
  const [incomingSellers, setIncomingSellers] = useState(INITIAL_INCOMING); // seller QRs arriving from other districts (not yet scanned into depot)
  const [localSellers, setLocalSellers] = useState(INITIAL_LOCAL); // local seller QRs waiting to be merged/accepted
  const [depotParcels, setDepotParcels] = useState([
    // Pre-populated parcels for the "Outgoing" tab presentation
    {
      id: "DP-8811",
      title: "Handmade Shoes",
      sellerName: "Zomba Crafts",
      buyerName: "Grace Phiri",
      buyerPhone: "+265 99 888 777",
      buyerAddress: "Area 47, Lilongwe",
      buyerCoords: { lat: -13.971, lon: 33.788 },
      transportType: "bike",
      weightKg: 2.5,
      depotAssigned: "D1",
      originDistrict: "Zomba",
      status: "atDepot",
      claimedBy: null,
      claimedByName: null,
      mergedQr: {
        id: "MQR-SQR-003-DEMO",
        parcelId: "DP-8811",
        mapLink: "MAP://to/-13.971,33.788",
        transaction: { transportFee: 2500, sellerAmount: 18000 },
      },
      createdAt: NOW - 1000 * 60 * 30,
      progress: 0,
      arrivedByTransporter: true,
    },
    {
      id: "DP-9922",
      title: "Laptop Charger",
      sellerName: "Tech Accessories",
      buyerName: "David Banda",
      buyerPhone: "+265 88 123 456",
      buyerAddress: "Kanengo, Lilongwe",
      buyerCoords: { lat: -13.923, lon: 33.731 },
      transportType: "bike",
      weightKg: 0.8,
      depotAssigned: "D1",
      originDistrict: "Lilongwe",
      status: "atDepot",
      claimedBy: null,
      claimedByName: null,
      mergedQr: {
        id: "MQR-LQR-102-DEMO",
        parcelId: "DP-9922",
        mapLink: "MAP://to/-13.923,33.731",
        transaction: { transportFee: 1500, sellerAmount: 12000 },
      },
      createdAt: NOW - 1000 * 60 * 90,
      progress: 0,
      arrivedByTransporter: false,
    },
  ]); // merged parcels stored/managed at depot
  const [notifications, setNotifications] = useState([
    { id: 'N1', text: 'Final delivery for parcel DP-7755 to John M is complete.', time: Date.now() - 1000 * 60 * 15, read: false, icon: 'checkmark-done-circle-outline', iconColor: '#10b981' },
    { id: 'N2', text: 'Payment of MK 18,000 for parcel DP-8811 has been released to seller Zomba Crafts.', time: Date.now() - 1000 * 60 * 60 * 2, read: false, icon: 'wallet-outline', iconColor: '#2563eb' },
    { id: 'N4', text: 'Transporter \'Rapid Rides\' has claimed parcel DP-9922 for local delivery.', time: Date.now() - 1000 * 60 * 60 * 3, read: true, icon: 'bicycle-outline', iconColor: '#f59e0b' },
    { id: 'N5', text: 'Parcel SQR-002 has arrived from Mzimba via transporter \'Zoom Logistics\'.', time: Date.now() - 1000 * 60 * 60 * 5, read: true, icon: 'arrow-down-circle-outline', iconColor: '#6b7280' },
    { id: 'N3', text: 'Welcome to the Depot Dashboard.', time: Date.now() - 1000 * 60 * 60 * 24, read: true, icon: 'information-circle-outline', iconColor: '#6b7280' },
  ]);
  const [history, setHistory] = useState([
    // Pre-populated history items for presentation
    { id: 'H1', title: 'Fresh Veg Box', status: 'delivered', deliveredAt: Date.now() - 1000 * 60 * 20, buyerName: 'John M', claimedByName: 'Michael Transport' },
    { id: 'H2', title: 'Handmade Shoes', status: 'payment_released', deliveredAt: Date.now() - 1000 * 60 * 60 * 2, paidTo: 'Seller: Zomba Crafts', paymentAmount: 18000 },
    { id: 'H3', title: 'Smartphone Order', status: 'payment_released', deliveredAt: Date.now() - 1000 * 60 * 60 * 5, paidTo: 'Transporter: Zoom Logistics', paymentAmount: 5500 },
    { id: 'H4', title: 'Cooking Oil (5L)', status: 'delivered', deliveredAt: Date.now() - 1000 * 60 * 60 * 24, buyerName: 'Alice B', claimedByName: 'Rapid Rides' },
  ]);
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

  const [scanIncomingModalVisible, setScanIncomingModalVisible] = useState(false);
  const [scannedIncomingQrId, setScannedIncomingQrId] = useState("");

  // simple balances for simulation
  const [sellerBalances, setSellerBalances] = useState({});
  const [transporterBalances, setTransporterBalances] = useState({});

  const progressRefs = useRef({}); // store progress intervals per parcel id

  // Helper: push depot notification
  const pushNotif = (text) => {
    setNotifications((prev) => [{ id: `N-${Date.now()}`, text, time: Date.now() }, ...prev]);
  };

  // Utility: get per-km rate based on transport type (matches your earlier rates)
  const getRatePerKm = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("bike") || t.includes("motor")) return 1000; // MK1000 / km
    if (t.includes("truck")) return 300; // MK300 / km
    if (t.includes("car")) return 500; // MK500 / km
    return 500;
  };

  // Create merged QR and parcel record from a seller QR (used for both incoming & local)
  const createMergedQrAndStore = (sellerQr) => {
    // SIMULATION: Replace geolib with a simple mock distance calculation
    const latDiff = Math.abs(depot.location.lat - (sellerQr.buyerCoords?.lat || 0));
    const lonDiff = Math.abs(depot.location.lon - (sellerQr.buyerCoords?.lon || 0));
    // Rough approximation: 1 degree diff is ~111km. This is fine for a prototype.
    const distanceKm = Math.max(1, Math.round((latDiff + lonDiff) * 111) + Math.random() * 10);

    const rate = getRatePerKm(sellerQr.transportTypeNeeded || "truck");
    const transportFee = distanceKm * rate;

    // simulate total amount (the "transaction" / held money). You may replace this with a real price
    const totalAmount = Math.max(1000, Math.round((sellerQr.weightKg || 1) * 2000 + Math.random() * 3000));
    const sellerAmount = Math.max(0, totalAmount - transportFee);

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
      transaction: {
        totalAmount,
        transportFee,
        sellerAmount,
        transporterPaid: false,
        sellerPaid: false,
        held: true,
      },
      distanceKm,
    };

    const parcel = {
      id: merged.parcelId,
      title: sellerQr.productTitle,
      sellerName: sellerQr.sellerName,
      sellerId: sellerQr.sellerId, // Pass the sellerId to the parcel object
      buyerName: sellerQr.buyerName,
      buyerPhone: sellerQr.buyerPhone,
      buyerAddress: sellerQr.buyerAddress,
      buyerCoords: sellerQr.buyerCoords,
      transportType: sellerQr.transportTypeNeeded,
      weightKg: sellerQr.weightKg,
      depotAssigned: depot.id,
      originDistrict: sellerQr.originDistrict || sellerQr.fromDistrict || sellerQr.originDistrict || "unknown",
      status: "atDepot", // atDepot | claimed | inTransit | delivered
      claimedBy: null,
      claimedByName: null,
      mergedQr: merged,
      createdAt: Date.now(),
      progress: 0,
      chat: [],
      arrivedByTransporter: false, // set true if transporter scanned while arriving (for incoming)
    };

    // remove buyer/seller QR from its list if exists
    setIncomingSellers((prev) => prev.filter((s) => s.id !== sellerQr.id));
    setLocalSellers((prev) => prev.filter((s) => s.id !== sellerQr.id));
    // add to depot parcels
    setDepotParcels((prev) => [parcel, ...prev]);

    pushNotif(`Merged QR created for ${parcel.id} (seller ${parcel.sellerName})`);
    return parcel;
  };

  // Release transporter fee to transporterBalances (simulate)
  const releaseTransporterFee = (parcel, transporterId) => {
    if (!parcel || !parcel.mergedQr) return;
    if (parcel.mergedQr.transaction.transporterPaid) return;

    const fee = parcel.mergedQr.transaction.transportFee || 0;
    setTransporterBalances((prev) => {
      const prevVal = prev[transporterId] || 0;
      return { ...prev, [transporterId]: prevVal + fee };
    });

    // mark as paid on the parcel object
    setDepotParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, mergedQr: { ...p.mergedQr, transaction: { ...p.mergedQr.transaction, transporterPaid: true } } } : p)));
    pushNotif(`Transporter ${transporterId} paid MK ${fee.toLocaleString()} for ${parcel.id}`);
  };

  // Release seller payment (buyer scanned on delivery)
  const releaseSellerPayment = (parcel) => {
    if (!parcel || !parcel.mergedQr) return;
    if (parcel.mergedQr.transaction.sellerPaid) return;

    const amt = parcel.mergedQr.transaction.sellerAmount || 0;
    const sellerKey = parcel.sellerName || "seller";
    setSellerBalances((prev) => {
      const prevVal = prev[sellerKey] || 0;
      return { ...prev, [sellerKey]: prevVal + amt };
    });

    // mark as paid and held false
    setDepotParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, mergedQr: { ...p.mergedQr, transaction: { ...p.mergedQr.transaction, sellerPaid: true, held: false } } } : p)));
    pushNotif(`Seller ${sellerKey} received MK ${amt.toLocaleString()} for ${parcel.id}`);
  };

  // Add a payment transaction to history
  const addPaymentToHistory = (parcel, paidTo, amount) => {
    const historyEntry = { ...parcel, status: "payment_released", deliveredAt: Date.now(), paidTo, paymentAmount: amount };
    setHistory((prev) => [historyEntry, ...prev]);
  };

  // Handle the scan of a parcel arriving at the depot (from seller or transporter)
  const handleScanIncomingParcel = () => {
    const qrId = scannedIncomingQrId.trim();
    if (!qrId) {
      Alert.alert("Invalid Scan", "Please enter a QR ID to simulate the scan.");
      return;
    }
    
    // Check if it's a local seller QR or an incoming (inter-district) QR
    let sellerQr = localSellers.find((s) => s.id === qrId);
    let isLocal = true;

    if (!sellerQr) {
      sellerQr = incomingSellers.find((s) => s.id === qrId);
      isLocal = false;
    }
    
    if (!sellerQr) {
      Alert.alert("Scan Failed", `No waiting parcel found with QR ID: ${qrId}`);
      setScannedIncomingQrId("");
      return;
    }

    if (isLocal) {
      // It's a local seller dropping off the parcel. Create the parcel and release payment to the seller.
      const parcel = createMergedQrAndStore(sellerQr);
      releaseSellerPayment(parcel); // Pay the seller immediately
      pushNotif(`Local parcel ${parcel.id} received from seller ${parcel.sellerName}. Payment released.`);
      addPaymentToHistory(parcel, `Seller: ${parcel.sellerName}`, parcel.mergedQr.transaction.sellerAmount);
    } else {
      // It's an inter-district parcel. Simulate a random transporter bringing it in and pay them.
      const t = transporters[Math.floor(Math.random() * transporters.length)];
      handleTransporterArrivalForSellerQr(sellerQr, t.id);
    }

    setScanIncomingModalVisible(false);
    setScannedIncomingQrId("");
    setActiveTab("Notifications"); // Switch to notifications tab to show the result
  };
  // Simulate transporter arrival scanning a seller QR (incoming seller QR arrives)
  const handleTransporterArrivalForSellerQr = (sellerQr, transporterId) => {
    if (!sellerQr) return;
    // create merged parcel
    const added = createMergedQrAndStore(sellerQr);
    // mark arrived, claimed by transporter and immediately pay transporter for the leg to depot
    setDepotParcels((prev) => prev.map((p) => (p.id === added.id ? { ...p, arrivedByTransporter: true, claimedBy: transporterId, claimedByName: transporters.find(t => t.id === transporterId)?.name || transporterId } : p)));
    addPaymentToHistory(added, `Transporter: ${transporterId}`, added.mergedQr.transaction.transportFee);
    // release transporter fee
    releaseTransporterFee(added, transporterId);
    // switch to At Depot / Incoming list highlight
    setActiveTab("Incoming");
  };

  // Simulate transporter claiming already-merged parcel (from At Depot)
  const simulateTransporterClaim = (parcel, transporterId) => {
    const t = transporters.find((x) => x.id === transporterId);
    if (!t) {
      Alert.alert("No transporter", "Transporter not found.");
      return;
    }
    setDepotParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "claimed", claimedBy: t.id, claimedByName: t.name } : p)));
    pushNotif(`${t.name} claimed ${parcel.id} — waiting to start transit.`);
  };

  // When transporter scans merged QR to start transit (for outgoing pickup or when moving out of depot)
  const confirmScanAndStartTransit = async (parcel) => {
    if (!parcel) return;
    // If transporter wasn't recorded, we won't block — still start transit
    // Release transporter fee if not already
    if (!parcel.mergedQr.transaction.transporterPaid) {
      // if claimedBy exists, pay that one; otherwise assign to a random transporter (simulation)
      const tId = parcel.claimedBy || transporters[Math.floor(Math.random() * transporters.length)].id;
      releaseTransporterFee(parcel, tId);
    }

    // --- Create notification for the seller ---
    await addDoc(collection(db, "notifications"), {
      sellerId: parcel.sellerId, // Assuming sellerId is on the parcel object
      text: `Your parcel "${parcel.title}" is now in transit to the buyer.`,
      type: 'in_transit',
      read: false,
      createdAt: serverTimestamp(),
    });

    // set status inTransit
    setDepotParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "inTransit" } : p)));
    setScanModalVisible(false);
    pushNotif(`Parcel ${parcel.id} is now in transit (claimed by ${parcel.claimedByName || "unknown"})`);
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
      if (progress >= 98) {
        progress = 98;
        // update then clear - waiting for buyer scan to mark delivered
        setDepotParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
        clearInterval(progressRefs.current[parcelId]);
        delete progressRefs.current[parcelId];
        return;
      }
      setDepotParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, progress } : p)));
    }, 1200);
  };

  // Buyer scans at delivery (scanned QR from transporter) -> release seller money and mark delivered
  const buyerScansAtDelivery = (parcel) => {
    if (!parcel) return;
    // ensure it is inTransit
    if (parcel.status !== "inTransit") {
      Alert.alert("Not in transit", "Parcel must be in transit to deliver.");
      return;
    }
    // Release seller payment (simulate)
    releaseSellerPayment(parcel);
    // Mark parcel delivered, push to history, clear intervals
    setDepotParcels((prev) => prev.map((p) => (p.id === parcel.id ? { ...p, status: "delivered", progress: 100 } : p)));
    setHistory((prev) => [{ ...parcel, status: "delivered", deliveredAt: Date.now() }, ...prev]);
    setNotifications((prev) => [{ id: `H-${Date.now()}`, text: `Parcel ${parcel.id} delivered — depot notified`, time: Date.now() }, ...prev]);
    if (progressRefs.current[parcel.id]) {
      clearInterval(progressRefs.current[parcel.id]);
      delete progressRefs.current[parcel.id];
    }
    pushNotif(`Parcel ${parcel.id} delivered and seller paid.`);
  };

  // Remove intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(progressRefs.current).forEach((i) => clearInterval(i));
    };
  }, []);

  // Render helpers ----------------------------------------------------------------

  // incoming tab: parcels that arrived from another district AND transporter scanned them into depot
  const arrivedIncomingParcels = depotParcels.filter((p) => p.originDistrict !== depot.district && p.arrivedByTransporter);

  // NEW Outgoing tab: parcels at the depot ready for distribution (not yet claimed for local delivery)
  const outgoingParcelsReady = depotParcels.filter(p => p.status === 'atDepot');
  
  const atDepotList = depotParcels;

  // UI renders
  const renderIncoming = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{item.title} • {item.id}</Text>
        <Text style={styles.small}>{item.transportType?.toUpperCase?.() || (item.transportTypeNeeded || "").toUpperCase()}</Text>
      </View>
      <Text style={styles.small}>Seller: {item.sellerName}</Text>
      <Text style={styles.small}>Buyer: {item.buyerName} • {item.buyerPhone}</Text>
      <Text style={styles.small}>Address: {item.buyerAddress}</Text>
      <Text style={styles.small}>Origin: {item.originDistrict}</Text>

      <View style={styles.row}>
        {/* For arrived incoming parcels, allow viewing QR or assign local claim */}
        <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert("Merged QR", JSON.stringify(item.mergedQr, null, 2))}>
          <Text style={styles.primaryBtnText}>View Merged QR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => { setClaimModalParcel(item); setClaimModalVisible(true); }}>
          <Text style={styles.ghostBtnText}>Assign Transport</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOutgoing = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{item.title} • {item.id}</Text>
        <Text style={[styles.statusPill, item.status === "inTransit" ? styles.inTransit : styles.claimed]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.small}>Buyer: {item.buyerName} • {item.buyerPhone}</Text>
      <Text style={styles.small}>Seller: {item.sellerName}</Text>
      <Text style={styles.small}>Transport Fee: MK {item.mergedQr?.transaction?.transportFee?.toLocaleString()}</Text>
      <Text style={styles.small}>Seller Share: MK {item.mergedQr?.transaction?.sellerAmount?.toLocaleString()}</Text>
      <View style={{ height: 8 }} />
      {item.status === "claimed" && (
        <View style={styles.row}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => { setScanModalParcel(item); setScanModalVisible(true); }}>
            <Text style={styles.primaryBtnText}>Transporter Start Transit (scan)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => Alert.alert("QR", JSON.stringify(item.mergedQr, null, 2))}>
            <Text style={styles.ghostBtnText}>View QR</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === "inTransit" && (
        <View>
          <View style={styles.progressBarBg}><View style={[styles.progressBarFg, { width: `${Math.min(item.progress || 0, 100)}%` }]} /></View>
          <Text style={styles.small}>{(item.progress || 0).toFixed(0)}% progress</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => buyerScansAtDelivery(item)}>
              <Text style={styles.primaryBtnText}>Simulate Buyer Scan (Deliver & Release Seller Payment)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => Alert.alert("Map Link", item.mergedQr?.mapLink || "No map")}>
              <Text style={styles.ghostBtnText}>View Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
      <Text style={styles.small}>Origin: {item.originDistrict}</Text>
      <Text style={styles.small}>Transport Fee: MK {item.mergedQr?.transaction?.transportFee?.toLocaleString()}</Text>

      <View style={{ height: 8 }} />
      <View style={styles.progressBarBg}><View style={[styles.progressBarFg, { width: `${Math.min(item.progress || 0, 100)}%` }]} /></View>
      <Text style={styles.small}>{(item.progress || 0).toFixed(0)}% progress</Text>

      <View style={styles.row}>
        {item.status === "atDepot" && (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert("Notified", `Transporters in ${depot.district} have been notified about parcel ${item.id}.`)}>
              <Text style={styles.primaryBtnText}>Notify transporter within region</Text>
            </TouchableOpacity>
            
          </>
        )}

        {item.status === "claimed" && (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => { setScanModalParcel(item); setScanModalVisible(true); }}>
              <Text style={styles.primaryBtnText}>Transporter Scans QR (simulate)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => Alert.alert("Claimed By", `${item.claimedByName} (${item.claimedBy})`)}>
              <Text style={styles.ghostBtnText}>Who Claimed</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === "inTransit" && (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => { setDeliveryConfirmParcel(item); setDeliveryModalVisible(true); }}>
              <Text style={styles.primaryBtnText}>Confirm Delivered</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => Alert.alert("Buyer Map", item.mergedQr?.mapLink || "No map")}>
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
    <TouchableOpacity style={[styles.notificationRow, !item.read && { backgroundColor: '#eef2ff' }]}>
      <View style={[styles.notifIconCircle, { backgroundColor: item.read ? '#f3f4f6' : item.iconColor+'20' }]}>
        <Ionicons name={item.icon || "information-circle-outline"} size={24} color={item.read ? '#6b7280' : item.iconColor} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.notifText, !item.read && { fontWeight: 'bold', color: '#1f2937' }]}>
          {item.text}
        </Text>
        <Text style={styles.notifTime}>{new Date(item.time).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHistory = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyIcon}>
        <Ionicons 
          name={item.status === 'delivered' ? 'cube-outline' : 'wallet-outline'} 
          size={20} 
          color={item.status === 'delivered' ? '#10b981' : '#2563eb'} 
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.historyCardTitle}>{item.title}</Text>
        {item.status === 'delivered' ? (
          <Text style={styles.historyCardSubtitle}>Delivered to {item.buyerName} by {item.claimedByName}</Text>
        ) : (
          <Text style={styles.historyCardSubtitle}>Payment of MK {item.paymentAmount?.toLocaleString()} released to {item.paidTo}</Text>
        )}
        <Text style={styles.historyCardTime}>{new Date(item.deliveredAt).toLocaleString()}</Text>
      </View>
    </View>
  );

  // modal handlers ---------------------------------------------------------------

  // Merge/create merged QR from a local seller QR
  const handleCreateMergedQr = () => {
    if (!mergeModalParcel) return;
    createMergedQrAndStore(mergeModalParcel);
    setMergeModalVisible(false);
    setMergeModalParcel(null);
    setActiveTab("At Depot");
    pushNotif("Merged QR created and stored at depot (local).");
  };

  // Claim modal -> either used to claim an atDepot parcel, or for assigning transporter for arrived incoming items
  const handleClaimBySelectedTransporter = (transporterId) => {
    if (!claimModalParcel) return;

    // If claimModalParcel is a raw seller QR (from incomingSellers/localSellers), the item may have productTitle + id pattern
    // We'll detect by presence of mergedQr - if mergedQr not present then it's a seller QR waiting to be merged in the appropriate list
    if (!claimModalParcel.mergedQr) {
      // It's a seller QR from one of initial lists: treat as transporter arrival (incoming if originDistrict != depot)
      handleTransporterArrivalForSellerQr(claimModalParcel, transporterId);
      setClaimModalVisible(false);
      setClaimModalParcel(null);
      return;
    }

    // Otherwise it's a depot parcel; simulate claim by transporter
    simulateTransporterClaim(claimModalParcel, transporterId);
    setClaimModalVisible(false);
    setClaimModalParcel(null);
  };

  // Confirm transporter's QR scan modal -> start transit (and pay transporter if needed)
  const handleConfirmScanTransit = () => {
    if (!scanModalParcel) return;
    confirmScanAndStartTransit(scanModalParcel);
  };

  const handleConfirmDelivery = () => {
    if (!deliveryConfirmParcel) return;
    // delivered by transporter -- buyer might still need to scan in real system but for simulation we do both
    buyerScansAtDelivery(deliveryConfirmParcel);
    setDeliveryModalVisible(false);
    setDeliveryConfirmParcel(null);
  };

  // Small helpers to simulate arrival by random transporter (quick action buttons)
  const simulateArrivalRandomTransporter = (sellerQr) => {
    const t = transporters[Math.floor(Math.random() * transporters.length)];
    handleTransporterArrivalForSellerQr(sellerQr, t.id);
  };

  const simulateCreateLocalAndKeep = (localQr) => {
    createMergedQrAndStore(localQr);
    pushNotif(`Local seller QR ${localQr.id} merged at depot.`);
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{depot.name}</Text>
          <Text style={styles.headerSub}>Depot ID: {depot.id} • {depot.district}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => setActiveTab("Profile")} style={{ marginRight: 10 }}>
            <Ionicons name="business" size={30} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuOpen((s) => !s)} style={{ padding: 6 }}>
            <Ionicons name="ellipsis-vertical" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1, padding: 12 }}>
        {activeTab === "Incoming" &&
          // The "Incoming" tab is now just a button to trigger a scan
          <View style={styles.scanTabContainer}>
            <Ionicons name="qr-code-outline" size={80} color="#ccc" />
            <Text style={styles.scanTabTitle}>Scan Incoming Parcels</Text>
            <Text style={styles.scanTabSubtitle}>
              Scan the QR code on a parcel arriving from another district to check it into the depot.
            </Text>
            <TouchableOpacity style={styles.scanButton} onPress={() => setScanIncomingModalVisible(true)}>
              <Ionicons name="camera-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.scanButtonText}>Scan Incoming QR</Text>
            </TouchableOpacity>
          </View>}
        {activeTab === "Arrived" && (
          <View>
            {/* Section: arrived incoming parcels (ONLY these should be visible as per request) */}
            <View>
              <Text style={{ fontWeight: "800", marginBottom: 8 }}>Arrived from other districts (scanned by transporter)</Text>
              {arrivedIncomingParcels.length === 0 ? <Text style={styles.placeholder}>No arrived incoming parcels yet.</Text> :
                <FlatList data={arrivedIncomingParcels} keyExtractor={(i) => i.id} renderItem={renderIncoming} />
              }
            </View>
          </View>
        )}

        {activeTab === "Outgoing" && (
          // This tab now shows parcels at the depot, ready for a local transporter to pick up.
          <View>
            <Text style={{ fontWeight: "800", marginBottom: 8, paddingHorizontal: 4 }}>Ready for Local Distribution</Text>
            {outgoingParcelsReady.length === 0 ? (
              <Text style={styles.placeholder}>No parcels are currently waiting for an outgoing transporter.</Text>
            ) : (
              <FlatList data={outgoingParcelsReady} keyExtractor={(i) => i.id} renderItem={renderAtDepot} />
            )}
          </View>
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
              <Text style={{ fontWeight: "800", marginBottom: 8 }}>Balances (simulated)</Text>
              <Text style={styles.small}>Transporters:</Text>
              {Object.keys(transporterBalances).length === 0 ? <Text style={styles.small}>None yet</Text> : Object.entries(transporterBalances).map(([k,v]) => <Text key={k} style={styles.small}>{k}: MK {v.toLocaleString()}</Text>)}
              <View style={{ height: 8 }} />
              <Text style={styles.small}>Sellers:</Text>
              {Object.keys(sellerBalances).length === 0 ? <Text style={styles.small}>None yet</Text> : Object.entries(sellerBalances).map(([k,v]) => <Text key={k} style={styles.small}>{k}: MK {v.toLocaleString()}</Text>)}

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
          { name: "Incoming", icon: "qr-code-outline" },
          { name: "Outgoing", icon: "send-outline" },
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

      {/* Claim Modal (choose transporter to simulate claim or arrival) */}
      <Modal visible={claimModalVisible} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Simulate Transporter Action</Text>
            <Text style={styles.small}>Parcel: {claimModalParcel?.id} • {claimModalParcel?.title || claimModalParcel?.productTitle}</Text>

            <View style={{ height: 10 }} />
            {transporters.map((t) => (
              <TouchableOpacity key={t.id} style={{ paddingVertical: 10 }} onPress={() => handleClaimBySelectedTransporter(t.id)}>
                <Text style={{ fontWeight: "700" }}>{t.name} • {t.type.toUpperCase()}</Text>
                <Text style={{ color: "#666", fontSize: 12 }}>Tap to simulate</Text>
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
            <Text style={styles.small}><Text style={{ fontWeight: "700" }}>Transport Fee:</Text> MK {scanModalParcel?.mergedQr?.transaction?.transportFee?.toLocaleString()}</Text>

            <View style={{ height: 12 }} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirmScanTransit}>
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

      {/* Menu Overlay */}
      {menuOpen && (
        <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
          <View style={styles.menuOverlay}>
            <View style={styles.dropdown}>
              <TouchableOpacity onPress={() => { setMenuOpen(false); setIsLoggedIn(true); }} style={styles.dropdownItem}>
                <Text>Switch to Buyer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMenuOpen(false); setActiveTab("Profile"); }} style={styles.dropdownItem}>
                <Text>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMenuOpen(false); navigation.replace("Welcome"); }} style={[styles.dropdownItem, { borderBottomWidth: 0 }]}>
                <Text style={{ color: "#ef4444" }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}


      {/* NEW: Scan Incoming Parcel Modal */}
      <Modal visible={scanIncomingModalVisible} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Scan Incoming Parcel</Text>
            <Text style={styles.small}>
              Simulate scanning by entering the QR ID of a parcel arriving from another district.
            </Text>
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Enter QR ID (e.g., SQR-001 or LQR-101)"
              value={scannedIncomingQrId}
              onChangeText={setScannedIncomingQrId}
            />
            <View style={{ height: 12 }} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleScanIncomingParcel}>
                <Text style={styles.primaryBtnText}>Confirm Scan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ghostBtn, { marginLeft: 8 }]} onPress={() => setScanIncomingModalVisible(false)}>
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

  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 1000 },
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

  primaryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#2563eb", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  ghostBtn: { borderWidth: 1, borderColor: "#e6e9f2", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  ghostBtnText: { color: "#333", fontWeight: "700" },

  placeholder: { color: "#9ca3af", textAlign: "center", marginTop: 8 },

  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalCardLarge: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },

  notificationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5 },
  notifIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  notifText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  notifTime: { fontSize: 12, color: '#6b7280', marginTop: 4 },

  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12, elevation: 1 },
  historyIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', marginRight: 12 },
  historyCardTitle: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  historyCardSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  historyCardTime: { fontSize: 12, color: '#9ca3af', marginTop: 4 },

  profileBox: { backgroundColor: "#fff", padding: 16, borderRadius: 12, elevation: 1 },
  profileTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },

  progressBarBg: { height: 8, backgroundColor: "#eef2ff", borderRadius: 6, overflow: "hidden", marginTop: 8 },
  progressBarFg: { height: 8, backgroundColor: "#2563eb" },

  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, color: "#fff", fontWeight: "700" },
  claimed: { backgroundColor: "#f59e0b", color: "#fff" },
  inTransit: { backgroundColor: "#2563eb", color: "#fff" },
  delivered: { backgroundColor: "#10b981", color: "#fff" },

  input: { borderWidth: 1, borderColor: "#e6e9f2", borderRadius: 10, padding: 10, backgroundColor: "#fff" },

  // Scan Tab Styles
  scanTabContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scanTabTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 16 },
  scanTabSubtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 22 },
  scanButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, elevation: 3 },
  scanButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

});
