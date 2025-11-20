import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, TextInput, FlatList, Keyboard } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps/lib/MapView'; // Use web-compatible import
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

export default function MapAddressScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [address, setAddress] = useState('Loading address...');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);

  // It's best practice to store API keys in environment variables rather than hardcoding them.
  const SERPAPI_KEY = "b70dac7ba9e2eb129916933aed606ad62ca0a470354f104087124ea75108863e";

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert('Permission Denied', 'Location access was denied. Showing a default location. You can still search or pan the map to select an address.');
          // Fallback to a default location if permission is denied
          const fallbackLocation = { latitude: -13.9626, longitude: 33.7741 }; // Lilongwe
          setLocation(fallbackLocation);
          setRegion({ ...fallbackLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 });
          await reverseGeocode(fallbackLocation);
          // No return here, let it fall through to finally
        } else {
          const currentLocation = await Location.getCurrentPositionAsync({});
          const initialCoords = { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude };
          setLocation(initialCoords);
          setRegion({
            ...initialCoords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          await reverseGeocode(initialCoords);
        }
      } catch (error) {
        Alert.alert("Error", "Could not fetch your location. Please make sure your GPS is enabled.");
        const fallbackLocation = { latitude: -13.9626, longitude: 33.7741 }; // Lilongwe
        setLocation(fallbackLocation);
        setRegion({ ...fallbackLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        await reverseGeocode(fallbackLocation);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Effect for auto-complete search with debounce
  useEffect(() => {
    // Don't search if the query is too short
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms delay

    // Cleanup function to clear the timeout if the user keeps typing
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Debounce reverse geocoding to avoid excessive API calls
  const debouncedReverseGeocode = useMemo(() => {
    let timeout;
    return (coords) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        reverseGeocode(coords);
      }, 500); // 500ms delay
    };
  }, []);

  const reverseGeocode = async (coords) => {
    try {
      const result = await Location.reverseGeocodeAsync(coords);
      if (result.length > 0) {
        const { street, city, region, postalCode, country } = result[0];
        const formattedAddress = [street, city, region, postalCode, country].filter(Boolean).join(', ');
        setAddress(formattedAddress);
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      console.error("Reverse Geocode Error:", error);
      setAddress('Could not determine address');
    }
  };

  const onRegionChangeComplete = (newRegion) => {
    const newCoords = {
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    };
    // setLocation is important for the confirm button
    setLocation(newCoords);
    debouncedReverseGeocode(newCoords); // Use the debounced version
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !location) { // Guard against running search if location is not ready
      return;
    }
    // No need to set isSearching here, the useEffect for searchQuery already does.
    try {
      // Use the current map center for location-aware search
      const { latitude, longitude } = location;
      const ll = `@${latitude},${longitude},14z`;
      const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(searchQuery)}&ll=${ll}&api_key=${SERPAPI_KEY}`;

      const response = await fetch(url);
      const json = await response.json();

      if (json.local_results && json.local_results.length > 0) {
        // Map SerpApi results to a format our app can use
        const formattedResults = json.local_results.map(result => ({
          title: result.title,
          address: result.address,
          latitude: result.gps_coordinates.latitude,
          longitude: result.gps_coordinates.longitude,
        }));
        setSearchResults(formattedResults);
      } else {
        setSearchResults([]); // Clear results if none found
      }
    } catch (error) {
      console.error("SerpApi Search Error:", error);
      Alert.alert('Error', 'An error occurred while searching.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (location) => {
    const { latitude, longitude } = location;
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    mapRef.current?.animateToRegion(newRegion, 1000);
    // Clear search results and query
    setSearchResults([]);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const handleConfirmLocation = () => {
    if (!location || !address.trim() || address.includes('Loading')) {
      Alert.alert("Location Not Ready", "Please wait for the address to load or select a valid location on the map.");
      return;
    }
    navigation.navigate('CheckoutScreen', {
      selectedLocation: {
        name: address,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
  };

  const handleCenterOnUser = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to center the map.');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      const newCoords = { latitude, longitude };
      const newRegion = { ...newCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      mapRef.current?.animateToRegion(newRegion, 1000); // This will trigger onRegionChangeComplete
    } catch (error) {
      Alert.alert('Error', 'Could not get your current location.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a place or address..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          onFocus={() => setSearchResults([])} // Clear results when focusing
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}><Ionicons name="search" size={20} color="#fff" /></TouchableOpacity>
        {(isSearching || searchResults.length > 0) && (
          <FlatList
            style={styles.resultsList}
            data={searchResults}
            ListHeaderComponent={isSearching ? <ActivityIndicator style={{ marginVertical: 10 }} color={theme.primary} /> : null}
            ListEmptyComponent={!isSearching && searchQuery.length > 2 ? <Text style={styles.noResultsText}>No results found</Text> : null}
            keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectSearchResult(item)}>
                <Text style={styles.resultText}>
                  {item.title}
                </Text>
                <Text style={styles.resultSubText}>{item.address}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      {region && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          onRegionChangeComplete={onRegionChangeComplete}
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // OSM tile server
          showsUserLocation={true}
        />
      )}
      <View style={styles.markerFixed}>
        <Ionicons name="location-sharp" size={40} color={theme.primary} />
      </View>
      <TouchableOpacity style={styles.centerButton} onPress={handleCenterOnUser}>
        <Ionicons name="locate" size={24} color={theme.primary} />
      </TouchableOpacity>
      <View style={styles.bottomCard}>
        <Text style={styles.addressLabel}>Selected Address:</Text>
        <Text style={styles.addressText}>{address}</Text>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  loadingText: { marginTop: 10, color: theme.text, fontSize: 16 },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 10,
    padding: 5,
    elevation: 10,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    color: theme.text,
  },
  resultsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.card,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  resultText: {
    color: theme.text,
  },
  resultSubText: {
    color: theme.textSecondary,
    fontSize: 12,
  },
  noResultsText: {
    padding: 12,
    textAlign: 'center',
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  searchButton: { backgroundColor: theme.primary, padding: 10, borderRadius: 8 },
  bottomCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  markerFixed: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -20,
    marginTop: -40,
  },
  centerButton: {
    position: 'absolute',
    bottom: 180, // Adjust to be above the bottom card
    right: 20,
    backgroundColor: theme.card,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    zIndex: 1,
  },
  addressLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 16,
    color: theme.text,
    marginVertical: 8,
  },
  confirmButton: {
    backgroundColor: theme.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
