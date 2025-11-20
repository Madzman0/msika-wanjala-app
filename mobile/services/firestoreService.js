import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Add user data
export const addUser = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, "users"), userData);
    console.log("User added with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding user:", error.message);
  }
};

// Read all users
export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error reading users:", error.message);
  }
};
