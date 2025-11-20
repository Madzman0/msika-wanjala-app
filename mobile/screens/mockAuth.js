// api/mockAuth.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "@users_db";

/**
 * Simulates a backend registration process.
 * @param {object} userData - { name, phone, password, role }
 */
export const register = async (userData) => {
  if (!userData.name || !userData.phone || !userData.password || !userData.role) {
    throw new Error("All fields are required.");
  }

  const storedUsers = await AsyncStorage.getItem(USERS_KEY);
  const users = storedUsers ? JSON.parse(storedUsers) : [];

  const existingUser = users.find((u) => u.phone === userData.phone);
  if (existingUser) {
    throw new Error("A user with this phone number already exists.");
  }

  // In a real app, hash the password. Here we store it directly for simulation.
  const newUser = {
    id: `user_${Date.now()}`,
    ...userData,
    // Buyers are approved by default. Others need admin approval (simulated).
    approved: userData.role === "buyer",
  };

  users.push(newUser);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

  return {
    msg: `User registered as ${userData.role}. ${
      !newUser.approved ? "Awaiting admin approval." : ""
    }`,
    user: newUser,
  };
};

/**
 * Simulates a backend login process.
 * @param {object} credentials - { phone, password }
 */
export const login = async (credentials) => {
  const { phone, password } = credentials;
  if (!phone || !password) {
    throw new Error("Phone and password are required.");
  }

  const storedUsers = await AsyncStorage.getItem(USERS_KEY);
  const users = storedUsers ? JSON.parse(storedUsers) : [];

  const user = users.find((u) => u.phone === phone);
  if (!user) {
    throw new Error("Invalid credentials. User not found.");
  }

  if (user.password !== password) {
    throw new Error("Invalid credentials. Password incorrect.");
  }

  // Simulate the admin approval check for non-buyers
  if (user.role !== "buyer" && !user.approved) {
    throw new Error("Your account has not been approved by an administrator yet.");
  }

  // Simulate creating a session token
  const token = `mock-token-for-${user.id}`;
  await AsyncStorage.setItem("@token", token);

  return {
    token,
    user: { id: user.id, name: user.name, role: user.role },
  };
};