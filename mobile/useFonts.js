import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export const useFonts = async () => {
  try {
    await Font.loadAsync({
      ...Ionicons.font,
    });
  } catch (e) {
    console.warn('An error occurred while loading fonts:', e);
  }
};