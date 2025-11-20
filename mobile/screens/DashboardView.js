// screens/DashboardView.js
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

const DashboardView = ({
  products,
  orders,
  isLoading,
  onRefresh,
  refreshing,
  shopName,
  dateRange,
  onDateRangeChange,
  handleNotifyTransporter,
  PieChart,
  computePieData,
  computeLikesPieData,
  computeSalesSeries,
  computeBuyerLocations,
  topSellers,
  ratingSummary,
  onPressAiCard,
  navigation, // Add navigation prop
  setActiveTab,
  unreadMessagesCount,
}) => {
  const [selectedViewIndex, setSelectedViewIndex] = useState(null);
  const [selectedLikeIndex, setSelectedLikeIndex] = useState(null);

  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const { avgRating } = ratingSummary();
  const totalSalesValue = orders.reduce((sum, order) => sum + order.total, 0);
  const viewsData = computePieData();
  const likesData = computeLikesPieData();
  const salesData = computeSalesSeries();
  const locationData = computeBuyerLocations();
  const topSellersData = topSellers();

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(255, 111, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowsForBars: false,
  };

  // A new component for a more detailed product analysis presentation
  const ProductSpotlight = ({ title, data, unit, isLoading }) => {
    if (!data || data.length === 0) {
      return <View style={styles.spotlightCard}><Text style={styles.chartTitle}>{title}</Text><Text style={styles.placeholderText}>No product {unit} data yet. Try promoting your items!</Text></View>;
    }
    const topItem = data[0];

    return (
      <View style={styles.spotlightCard}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.spotlightContent}>
          {isLoading ? (
            <View style={[styles.spotlightImage, styles.placeholderBox]}><ActivityIndicator color="#ff6f00" /></View>
          ) : (
            <Image source={{ uri: topItem.imageUrl || 'https://placekitten.com/200/200' }} style={styles.spotlightImage} />
          )}
          <View style={styles.spotlightDetails}>
            {data.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.spotlightRow}>
                <Text style={styles.spotlightRank}>{index + 1}</Text>
                <Text style={styles.spotlightName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.spotlightValue}>{item.population} {unit}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const ChartPlaceholder = ({ title }) => (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={[styles.placeholderBox, { height: 220, width: screenWidth - 48 }]}><ActivityIndicator size="large" color="#ff6f00" /></View>
    </View>
  );
  return (
    <ScrollView
      contentContainerStyle={styles.dashboardContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ff6f00']} />
      }
    >
      <View style={styles.headerContainer}>
        <Text style={styles.dashboardHeader}>Welcome, {shopName}</Text>
        <TouchableOpacity style={styles.messagesButton} onPress={() => setActiveTab('Messages')}>
          <Ionicons name="chatbubbles-outline" size={24} color={theme.primary} />
          {unreadMessagesCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadMessagesCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Range Filter */}
      <View style={styles.dateFilterContainer}>
        <TouchableOpacity style={[styles.dateFilterButton, dateRange === '7_days' && styles.dateFilterActive]} onPress={() => onDateRangeChange('7_days')}>
          <Text style={[styles.dateFilterText, dateRange === '7_days' && styles.dateFilterTextActive]}>Last 7 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.dateFilterButton, dateRange === '30_days' && styles.dateFilterActive]} onPress={() => onDateRangeChange('30_days')}>
          <Text style={[styles.dateFilterText, dateRange === '30_days' && styles.dateFilterTextActive]}>Last 30 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.dateFilterButton, dateRange === 'all_time' && styles.dateFilterActive]} onPress={() => onDateRangeChange('all_time')}>
          <Text style={[styles.dateFilterText, dateRange === 'all_time' && styles.dateFilterTextActive]}>All Time</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}><Text style={styles.statValue}>MWK {totalSalesValue.toLocaleString()}</Text><Text style={styles.statLabel}>Total Sales</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{products.length}</Text><Text style={styles.statLabel}>Products</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{avgRating} ★</Text><Text style={styles.statLabel}>Avg. Rating</Text></View>
      </View>

      {/* AI Insight Card */}
      <TouchableOpacity style={styles.aiInsightCard} onPress={onPressAiCard}>
        <Ionicons name="sparkles" size={24} color="#d97706" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.aiInsightTitle}>AI Business Report Ready</Text>
          <Text style={styles.aiInsightSubtitle}>Get market trends and recommendations for your products.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#d97706" />
      </TouchableOpacity>

      {/* Notify Transporter Action Card */}
      <TouchableOpacity 
        style={styles.prominentActionCard} 
        onPress={() => navigation.navigate('SelectPickupScreen', { orders: orders })}
      >
        <View>
          <Text style={styles.prominentActionTitle}>Ready to Ship?</Text>
          <Text style={styles.prominentActionSubtitle}>Notify a nearby transporter for a pickup.</Text>
        </View>
        <Ionicons name="chevron-forward-circle" size={32} color="#fff" />
      </TouchableOpacity>

      {isLoading ? (
        <>
          <ChartPlaceholder title="Sales Over Time" />
          <ChartPlaceholder title="Buyer Locations" />
        </>
      ) : (
        <>
          {/* Sales Chart */}
          {salesData.datasets[0].data.some(d => d > 0) ? (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Sales Over Time</Text>
              <LineChart data={salesData} width={screenWidth - 48} height={220} chartConfig={chartConfig} bezier />
            </View>
          ) : (
            <View style={styles.chartCard}><Text style={styles.chartTitle}>Sales Over Time</Text><Text style={styles.placeholderText}>No sales data for this period.</Text></View>
          )}

          {/* Buyer Locations Chart */}
          {locationData.datasets[0].data.length > 0 ? (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Buyer Locations</Text>
              <BarChart data={locationData} width={screenWidth - 48} height={220} chartConfig={chartConfig} fromZero yAxisLabel="" />
            </View>
          ) : (
            <View style={styles.chartCard}><Text style={styles.chartTitle}>Buyer Locations</Text><Text style={styles.placeholderText}>No location data from orders yet.</Text></View>
          )}
        </>
      )}

      {/* --- New Product Analysis Presentation --- */}
      <ProductSpotlight title="Most Viewed Products" data={viewsData} unit="views" isLoading={isLoading} />
      <ProductSpotlight title="Most Liked Products" data={likesData} unit="likes" isLoading={isLoading} />
      {/* --- End New Presentation --- */}

      {/* Recent Orders */}
      <View style={styles.sectionCard}>
        <Text style={styles.chartTitle}>Recent Orders</Text>
        {orders.slice(0, 3).map(order => (
          <View key={order.id} style={styles.orderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderText}>Order for {order.buyerName}</Text>
              <Text style={styles.orderSubtext}>Total: MWK {order.total.toLocaleString()} • {order.items.length} item(s)</Text>
            </View>
            <TouchableOpacity style={styles.notifyButton} onPress={() => handleNotifyTransporter(order)}>
              <Text style={styles.notifyButtonText}>Notify Transporter</Text>
            </TouchableOpacity>
          </View>
        ))}
        {orders.length === 0 && <Text style={{ color: '#6b7280' }}>No recent orders.</Text>}
      </View>

      {/* Top Sellers */}
      <View style={styles.sectionCard}>
        <Text style={styles.chartTitle}>Top Sellers by Rating</Text>
        {isLoading ? (
          <View style={[styles.placeholderBox, { height: 100 }]}><ActivityIndicator color="#ff6f00" /></View>
        ) : topSellersData.length > 0 ? (
          topSellersData.map((seller, index) => (
            <View key={index} style={styles.topSellerRow}>
              <Text style={styles.transporterName}>{index + 1}. {seller.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#ffc107" />
                <Text style={styles.ratingText}>{seller.avgRating}</Text>
              </View>
            </View>
          ))
        ) : (<Text style={styles.placeholderText}>No seller data available yet.</Text>)}
      </View>
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  dashboardContainer: { padding: 16, paddingBottom: 100, backgroundColor: theme.background },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  messagesButton: {
    backgroundColor: theme.card,
    padding: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
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
    fontWeight: 'bold',
  },
  dateFilterContainer: { flexDirection: 'row', marginBottom: 16, backgroundColor: theme.input, borderRadius: 10, padding: 4 },
  dateFilterButton: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  dateFilterActive: { backgroundColor: theme.card, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  dateFilterText: { color: theme.textSecondary, fontWeight: '600' },
  dateFilterTextActive: { color: theme.primary, fontWeight: 'bold' },
  dashboardHeader: { fontSize: 22, fontWeight: 'bold', color: theme.text },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, },
  statCard: {
    backgroundColor: theme.card, borderRadius: 12, padding: 14, alignItems: 'center',
    flex: 1, marginHorizontal: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  statValue: { fontSize: 18, fontWeight: 'bold', color: theme.primary },
  statLabel: { fontSize: 12, color: theme.textSecondary, marginTop: 4 },
  aiInsightCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb',
    padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#fde68a',
  },
  aiInsightTitle: { fontSize: 15, fontWeight: 'bold', color: '#92400e' },
  aiInsightSubtitle: { fontSize: 13, color: '#b45309', marginTop: 2 },
  chartCard: {
    backgroundColor: theme.card, borderRadius: 16, padding: 12,
    marginBottom: 16, elevation: 2, alignItems: 'center'
  },
  prominentActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.primary,
    padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2,
  },
  prominentActionTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#fff',
  },
  prominentActionSubtitle: {
    fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginTop: 2,
  },
  sectionCard: {
    backgroundColor: theme.card, borderRadius: 16, padding: 16,
    marginBottom: 16, elevation: 2,
  },
  chartTitle: { fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 12, alignSelf: 'flex-start' },
  orderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  orderText: { fontSize: 15, color: theme.text },
  orderSubtext: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  notifyButton: { backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  notifyButtonText: { color: '#3730a3', fontWeight: 'bold', fontSize: 12 },
  topSellerRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  spotlightCard: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  spotlightContent: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  spotlightImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: theme.input },
  spotlightDetails: { flex: 1, marginLeft: 16 },
  spotlightRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  spotlightRank: { fontSize: 14, fontWeight: 'bold', color: theme.textSecondary, width: 20 },
  spotlightName: { fontSize: 15, color: theme.text, flex: 1, marginRight: 8 },
  spotlightValue: { fontSize: 14, fontWeight: 'bold', color: theme.primary },
  placeholderBox: { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.input, borderRadius: 12 },
  placeholderText: { color: theme.textSecondary, fontStyle: 'italic', textAlign: 'center' },
  transporterName: { fontSize: 15, fontWeight: '600', color: theme.text },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 6, fontSize: 14, fontWeight: 'bold', color: theme.text },
});

export default DashboardView;