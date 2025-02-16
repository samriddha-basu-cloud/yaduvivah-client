import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Firestore, collection, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCUqEZklvL_n9rwZ2v78vxXWVv6z_2ALUE",
  authDomain: "matri-site-cf115.firebaseapp.com",
  projectId: "matri-site-cf115",
  storageBucket: "matri-site-cf115.appspot.com",
  messagingSenderId: "231063048901",
  appId: "1:231063048901:web:968969b3f06dd22f1096ac",
  measurementId: "G-351NC8Z306",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const friendRequestsRef = collection(db, "friendRequests");
const storage = getStorage(app);
const firestore = getFirestore(app);

export { app, auth, db, friendRequestsRef, storage, firestore };
