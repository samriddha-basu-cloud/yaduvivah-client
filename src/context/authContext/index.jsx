import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../firebase/Firebase";
// import { GoogleAuthProvider } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase/Firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nowUser, setNowUser] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       // Fetch user data including role from Firestore
  //       getDoc(doc(db, "users", user.uid)).then((docSnap) => {
  //         if (docSnap.exists()) {
  //           setUser({ ...user, role: docSnap.data().role });
  //         } else {
  //           setUser(user);
  //         }
  //         setLoading(false);
  //       });
  //     } else {
  //       setUser(null);
  //       setLoading(false);
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  async function initializeUser(user) {
    if (user) {
      setCurrentUser({ ...user });
      console.log("current user", currentUser);

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log("User data from Firestore:", userData); // Add this line
          setNowUser({
            ...userData,
            role: userData.role || "user", // Default to 'user' if role is not set
          });
          console.log("user------", nowUser);
        } else {
          console.log("No user document found in Firestore"); // Add this line
          setNowUser(user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setNowUser(user);
      }

      console.log("user------", user);
      const isEmail = user.providerData.some(
        (provider) => provider.providerId === "password"
      );
      setIsEmailUser(isEmail);
      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setNowUser(null);
      setLoading(false);
      setUserLoggedIn(false);
    }
    // user is not being set

    setLoading(false);
  }

  const value = {
    userLoggedIn,
    isEmailUser,
    isGoogleUser,
    currentUser,
    setCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
