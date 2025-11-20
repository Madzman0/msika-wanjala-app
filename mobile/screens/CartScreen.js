// CartScreen.js
import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ Import CartContext (must exist and provide cartItems, setCartItems)
import { CartContext } from "../context/CartContext";
import { ThemeContext } from "../context/ThemeContext";

/**
 * Modern, professional Cart screen
 * - keeps all prior capabilities (increase/decrease qty, remove, total, checkout)
 * - adds per-item subtotal, promo code (demo), recommended products section
 * - uses navigation.navigate('Product') if you want to wire to product details
 */
export default function CartScreen({ navigation }) {
  const { cartItems, addToCart, deleteFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const { theme } = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 768;
  const styles = getStyles(theme, isWideScreen);

  // Demo recommendations (use actual data / API in production)
  const recommendations = [
    { id: "r1", img: require("../assets/product2.jpg"), name: "Crops", price: 8000 },
    { id: "r2", img: require("../assets/product3.jpg"), name: "Soyabeans", price: 10000 },
    { id: "r3", img: require("../assets/product4.jpg"), name: "Phones", price: 25000 },
  ];

  const removeItem = (id, name) => {
    Alert.alert(
      "Remove item",
      `Remove ${name} from cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteFromCart(id),
        },
      ],
      { cancelable: true }
    );
  };

  const increaseQty = (id, qty) => {
    updateQuantity(id, qty + 1);
  };

  const decreaseQty = (id, qty) => {
    updateQuantity(id, qty > 1 ? qty - 1 : 1);
  };

  // subtotal per item and total
  const totalPrice = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0),
    [cartItems]
  );

  // demo promo codes: SAVE10 = 10% off, SAVE500 = 500 off
  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;

    if (code === "SAVE10") {
      setAppliedPromo({ code, type: "percent", value: 10 });
      Alert.alert("Promo applied", "10% discount applied.");
    } else if (code === "SAVE500") {
      setAppliedPromo({ code, type: "fixed", value: 500 });
      Alert.alert("Promo applied", "MWK 500 discount applied.");
    } else {
      setAppliedPromo(null);
      Alert.alert("Invalid code", "Please enter a valid promo code.");
    }
    setPromo("");
  };

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === "percent") return Math.round((totalPrice * appliedPromo.value) / 100);
    return appliedPromo.value;
  }, [appliedPromo, totalPrice]);

  const finalTotal = Math.max(0, totalPrice - discountAmount);

  const checkout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Cart empty", "Please add items to cart before proceeding to checkout.");
      return;
    }
  
    // ✅ Navigate to Checkout screen, pass cart data and total
    navigation.navigate("CheckoutScreen", {
      total: finalTotal,
      items: cartItems,
      discount: discountAmount,
    });
  };
  
  const RecommendationsView = () => (
    <View style={styles.recommendationsContainer}>
      <Text style={styles.recommendTitle}>You may also like</Text>
      <ScrollView>
        {recommendations.map((r) => (
          <View key={r.id} style={styles.recommendCard}>
            <Image source={r.img} style={styles.recommendImg} />
            <View style={styles.recommendDetails}>
              <Text style={styles.recommendName} numberOfLines={1}>{r.name}</Text>
              <Text style={styles.recommendPrice}>MWK {r.price.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={styles.recommendAdd}
              onPress={() => {
                const exists = cartItems.find((it) => it.id === r.id);
                if (exists) {
                  updateQuantity(r.id, exists.qty + 1);
                } else {
                  addToCart(r);
                }
              }}
            ><Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text></TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => {
    const qty = item.qty || 1;
    const subtotal = (item.price || 0) * qty;

    return (
      <View style={styles.itemCard}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            // Navigate to product details if you have one
            // navigation.navigate("Product", { product: item });
          }}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Image source={item.img} style={styles.itemImage} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.itemSupplier}>{item.supplier || ""}</Text>
            <Text style={styles.itemPrice}>MWK {(item.price || 0).toLocaleString()}</Text>

            {/* qty + subtotal row */}
            <View style={styles.row}>
              <View style={styles.qtyBox}>
                <TouchableOpacity onPress={() => decreaseQty(item.id, qty)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="remove-circle" size={26} color={theme.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{qty}</Text>
                <TouchableOpacity onPress={() => increaseQty(item.id, qty)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="add-circle" size={26} color="#ff6f00" />
                </TouchableOpacity>
              </View>

              <View style={{ marginLeft: 12, flex: 1, alignItems: "flex-end" }}>
                <Text style={styles.subtotalText}>Subtotal</Text>
                <Text style={styles.subtotalValue}>MWK {subtotal.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* actions: remove */}
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => removeItem(item.id, item.name)} style={styles.iconBtn}>
            <Ionicons name="trash" size={20} color="#b71c1c" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isWideScreen) {
    // --- WIDE SCREEN LAYOUT ---
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} >
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <Text style={styles.headerCount}>{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</Text>
          </View>
          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Text style={styles.clearTxt}>Clear</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <View style={styles.leftColumn}>
            {cartItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySubtitle}>Add items from the marketplace to get started.</Text>
                <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate("BuyerHomeScreen")}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Continue Shopping</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={cartItems}
                keyExtractor={(item) => item.name}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 12 }}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              />
            )}
          </View>
          <RecommendationsView />
        </View>
        {/* Footer for wide screen */}
        <View style={styles.stickyFooter}>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerLabel}>Total</Text>
            {appliedPromo ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.footerTotal}>MWK {totalPrice.toLocaleString()}</Text>
                <Text style={styles.promoApplied}>  -{appliedPromo.code} </Text>
              </View>
            ) : (
              <Text style={styles.footerTotal}>MWK {totalPrice.toLocaleString()}</Text>
            )}
            {discountAmount > 0 && (
              <Text style={styles.discountText}>Discount: MWK {discountAmount.toLocaleString()}</Text>
            )}
            <Text style={[styles.footerTotal, { fontSize: 16 }]}>Pay: MWK {finalTotal.toLocaleString()}</Text>
          </View>
          <View style={{ width: 140, justifyContent: "center" }}>
            <TouchableOpacity style={styles.checkoutBtn} onPress={checkout}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Proceed to Pay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- MOBILE LAYOUT ---
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} >
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <Text style={styles.headerCount}>{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</Text>
          </View>

          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Text style={styles.clearTxt}>Clear</Text>
          </TouchableOpacity>
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add items from the marketplace to get started.</Text>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => navigation.navigate("BuyerHomeScreen")} // keep UX smooth
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.name}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />

            {/* Promo + Recommended stacked above sticky footer */}
            <View style={styles.promoRow}>
              <View style={styles.promoLeft}>
                <TextInput
                  value={promo}
                  onChangeText={setPromo}
                  placeholder="Promo code"
                  placeholderTextColor={theme.textSecondary}
                  style={styles.promoInput}
                />
              </View>
              <TouchableOpacity style={styles.applyBtn} onPress={applyPromo}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Recommendations */}
            <View style={styles.recommendWrap}>
              <Text style={styles.recommendTitle}>You may also like</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recommendations.map((r) => (
                  <View key={r.id} style={styles.recommendCard}>
                    <Image source={r.img} style={styles.recommendImg} />
                    <Text style={styles.recommendName} numberOfLines={1}>{r.name}</Text>
                    <Text style={styles.recommendPrice}>MWK {r.price.toLocaleString()}</Text>
                    <TouchableOpacity
                      style={styles.recommendAdd}
                      onPress={() => {
                        // add to cart quickly
                        const exists = cartItems.find((it) => it.id === r.id);
                        if (exists) {
                          updateQuantity(r.id, exists.qty + 1);
                        } else {
                          addToCart(r);
                        }
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* STICKY FOOTER */}
        <View style={styles.stickyFooter}>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerLabel}>Total</Text>
            {appliedPromo ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.footerTotal}>MWK {totalPrice.toLocaleString()}</Text>
                <Text style={styles.promoApplied}>  -{appliedPromo.code} </Text>
              </View>
            ) : (
              <Text style={styles.footerTotal}>MWK {totalPrice.toLocaleString()}</Text>
            )}

            {discountAmount > 0 && (
              <Text style={styles.discountText}>Discount: MWK {discountAmount.toLocaleString()}</Text>
            )}

            <Text style={[styles.footerTotal, { fontSize: 16 }]}>Pay: MWK {finalTotal.toLocaleString()}</Text>
          </View>

          <View style={{ width: 140, justifyContent: "center" }}>
            <TouchableOpacity style={styles.checkoutBtn} onPress={checkout}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Proceed to Pay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme, isWideScreen) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  headerRow: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: theme.text },
  headerCount: { marginLeft: 8, color: theme.textSecondary, fontSize: 13 },
  clearBtn: { padding: 6 },
  clearTxt: { color: theme.primary, fontWeight: "700" },

  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: "700", color: theme.text },
  emptySubtitle: { marginTop: 6, color: theme.textSecondary, textAlign: "center" },
  continueBtn: {
    marginTop: 18,
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  itemCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  itemImage: { width: 96, height: 96, borderRadius: 10, resizeMode: "cover" },
  itemTitle: { fontSize: 16, fontWeight: "700", color: theme.text },
  itemSupplier: { fontSize: 12, color: theme.textSecondary, marginTop: 4 },
  itemPrice: { marginTop: 8, fontWeight: "700", color: theme.text },

  row: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: theme.input,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qtyText: { marginHorizontal: 10, fontWeight: "700", color: theme.text },

  subtotalText: { fontSize: 12, color: theme.textSecondary },
  subtotalValue: { fontWeight: "700", marginTop: 2, color: theme.text },

  itemActions: { position: "absolute", right: 10, top: 10 },
  iconBtn: { padding: 6 },

  promoRow: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    backgroundColor: theme.card,
  },
  promoLeft: { flex: 1 },
  promoInput: {
    backgroundColor: theme.input,
    color: theme.text,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  applyBtn: {
    marginLeft: 8,
    backgroundColor: theme.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  promoApplied: { color: theme.primary, fontWeight: "700", marginLeft: 8 },

  recommendWrap: { padding: 12, backgroundColor: theme.card, borderTopWidth: 1, borderColor: theme.border },
  recommendTitle: { fontWeight: "800", marginBottom: 12, fontSize: 16, color: theme.text },
  recommendCard: {
    width: isWideScreen ? '100%' : 120,
    marginRight: 10,
    backgroundColor: isWideScreen ? theme.card : theme.input,
    borderRadius: 10,
    padding: 8,
    alignItems: isWideScreen ? 'flex-start' : "center",
    flexDirection: isWideScreen ? 'row' : 'column',
    marginBottom: isWideScreen ? 12 : 0,
  },
  recommendImg: {
    width: isWideScreen ? 80 : 100,
    height: isWideScreen ? 80 : 80,
    borderRadius: 8,
    resizeMode: "cover",
  },
  recommendDetails: {
    flex: 1,
    marginLeft: isWideScreen ? 12 : 0,
    marginTop: isWideScreen ? 0 : 6,
  },
  recommendName: { fontSize: isWideScreen ? 15 : 12, fontWeight: "700", color: theme.text },
  recommendPrice: { fontSize: isWideScreen ? 14 : 12, color: theme.textSecondary, marginTop: 4 },
  recommendAdd: {
    marginTop: isWideScreen ? 0 : 8,
    marginLeft: isWideScreen ? 12 : 0,
    backgroundColor: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  stickyFooter: {
    position: isWideScreen ? 'relative' : "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderColor: theme.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  footerLabel: { color: theme.textSecondary, fontSize: 12 },
  footerTotal: { fontSize: 18, fontWeight: "800", color: theme.text },
  discountText: { color: "#2e7d32", fontWeight: "700" },

  checkoutBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  // --- Wide Screen Specific Styles ---
  leftColumn: {
    flex: 2, // Takes up 2/3 of the space
    backgroundColor: theme.background,
    borderRightWidth: 1,
    borderRightColor: theme.border,
  },
  recommendationsContainer: {
    flex: 1, // Takes up 1/3 of the space
    padding: 16,
    backgroundColor: theme.input,
  },
});
