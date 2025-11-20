import React, { useContext } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const HomeView = ({
  searchText,
  setSearchText,
  searchLocation,
  setSearchLocation,
  categories,
  activeCategory,
  handleCategoryPress,
  navigation,
  scrollRef,
  filteredProducts,
  renderProduct,
  numColumns,
  handleLoadMore,
  setTourismModalVisible,
  liveSessions,
  onWhoIsLivePress,
}) => {
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 768;
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <FlatList
      ListHeaderComponent={() => (
        <>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#777" style={{ marginHorizontal: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.searchBar, { flex: 1, marginRight: 8 }]}>
              <Ionicons name="location" size={20} color="#777" style={{ marginHorizontal: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by location..."
                value={searchLocation}
                onChangeText={setSearchLocation}
              />
            </View>
            <TouchableOpacity style={styles.liveButton} onPress={onWhoIsLivePress}>
              <Text style={styles.liveButtonText}>Who's Live?</Text>
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, activeCategory === cat && styles.activeTab]}
                onPress={() => handleCategoryPress(cat)}
              >
                <Text style={[styles.categoryTabText, activeCategory === cat && styles.activeTabText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.viewAllCatButton}
              onPress={() => navigation.navigate("AllCategoriesScreen")}
            >
              <Text style={styles.viewAllCatText}>View All</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Carousel (3 images requested) */}
          <View style={[styles.carouselWrapper, styles.desktopCarouselWrapper]}>
            <ScrollView
              horizontal
              pagingEnabled={false}
              ref={scrollRef}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {[require("../assets/tourism1.jpg"), require("../assets/tourism2.jpg"), require("../assets/tourism3.jpg")].map((img, i) => (
                <TouchableOpacity key={i} activeOpacity={0.9} onPress={() => setTourismModalVisible(true)}>
                  <View style={styles.desktopCarouselItem}>
                    <Image source={img} style={styles.carouselImage} />
                    <View style={styles.adOverlay}>
                      <Text style={styles.adText}>Explore Malawi's Beauty</Text>
                      <TouchableOpacity style={styles.adButton}>
                        <Text style={styles.adButtonText}>Learn More</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

        </>
      )}
      data={filteredProducts}
      renderItem={renderProduct}
      key={numColumns}
      numColumns={numColumns}
      keyExtractor={(item, index) => `product-${item.id}-${index}`}
      columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
      contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10 }}
      onEndReached={activeCategory === "All" ? handleLoadMore : null}
      onEndReachedThreshold={0.5}
    />
  );
};

const getStyles = (theme) => StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: theme.text },
  rowContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginTop: 6, marginBottom: 10 },
  categoryTabs: { paddingHorizontal: 10, marginBottom: 10 },
  categoryTab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: theme.input, marginRight: 10 },
  activeTab: { backgroundColor: theme.primary },
  categoryTabText: { fontSize: 14, color: theme.textSecondary },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  viewAllCatButton: {
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginLeft: 5,
  },
  viewAllCatText: {
    color: theme.primary,
    fontWeight: 'bold',
  },
  carouselWrapper: { marginBottom: 15 },
  carouselImage: { width: '100%', height: '100%', borderRadius: 10 },
  // --- Responsive Ad Banner Styles ---
  desktopCarouselWrapper: {
    height: 220, // A fixed, sleeker height for desktop
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  desktopCarouselItem: {
    width: screenWidth - 20, // Adjust width to fit the container
    height: '100%',
  },
  adOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: '50%', // Overlay only on one side for a modern ad look
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 10,
  },
  adText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  adButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  adButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // --- "Who's Live?" Button ---
  liveButton: { backgroundColor: theme.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  liveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

});

export default HomeView;