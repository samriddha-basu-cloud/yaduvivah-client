import React, { useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { Send, ArrowLeft } from "lucide-react";
import Header from "../Components/header";
import FriendRequests from "../Components/FriendRequests";

// Firebase configuration remains the same
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
const firestore = getFirestore(app);
const analytics = getAnalytics(app);

function App() {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const [isFriend, setIsFriend] = useState(null);

  useEffect(() => {
    async function checkFriendship() {
      if (user && location.state?.chatId) {
        const areFriends = await checkIfFriends(user.uid, location.state.chatId);
        setIsFriend(areFriends);
      }
    }
    checkFriendship();
  }, [user, location.state]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <button
        className="fixed top-20 left-4 z-10 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <main className="container mx-auto px-4 pt-20 pb-4 h-[calc(100vh-5rem)]">
        {user ? (
          <>
            <div className="relative h-full rounded-lg bg-white shadow-lg">
              <FriendRequests />
              {isFriend === false ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-lg text-gray-600 bg-gray-50 px-6 py-4 rounded-lg">
                    You are not friends with this user yet
                  </div>
                </div>
              ) : isFriend === true ? (
                <ChatRoom recipientId={location.state.chatId} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-gray-600 bg-white px-6 py-4 rounded-lg shadow-md">
              Please sign in to continue
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ChatRoom({ recipientId }) {
  const dummy = useRef();
  const firestore = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const conversationsRef = collection(firestore, "conversations");
  const [conversationDoc, setConversationDoc] = useState(null);
  const [areFriends, setAreFriends] = useState(false);
  const [formValue, setFormValue] = useState("");

  useEffect(() => {
    async function fetchConversation() {
      const areFriendsResult = await checkIfFriends(currentUser.uid, recipientId);
      setAreFriends(areFriendsResult);

      if (areFriendsResult) {
        const conversationId = [currentUser.uid, recipientId].sort().join(":");
        const conversationRef = doc(conversationsRef, conversationId);
        const conversationSnapshot = await getDoc(conversationRef);

        if (conversationSnapshot.exists()) {
          setConversationDoc(conversationRef);
        } else {
          const newConversationRef = await getOrCreateConversation(
            conversationsRef,
            currentUser.uid,
            recipientId
          );
          setConversationDoc(newConversationRef);
        }
      }
    }
    fetchConversation();
  }, [currentUser.uid, recipientId]);

  const messagesRef = conversationDoc ? collection(conversationDoc, "messages") : null;
  const messagesQuery = messagesRef ? query(messagesRef, orderBy("createdAt")) : null;
  const [messages] = useCollectionData(messagesQuery, { idField: "id" });

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!formValue.trim()) return;

    if (conversationDoc) {
      await addDoc(collection(conversationDoc, "messages"), {
        text: formValue,
        createdAt: serverTimestamp(),
        senderId: currentUser.uid,
      });

      setFormValue("");
      dummy.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!areFriends) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600 bg-gray-50 px-6 py-4 rounded-lg">
          You need to be friends to start chatting
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages?.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            type="submit"
            disabled={!formValue.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

function ChatMessage(props) {
  const { text, senderId, createdAt } = props.message;
  const auth = getAuth();
  const messageClass = senderId === auth.currentUser.uid ? "sent" : "received";

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div
      className={`flex flex-col ${
        messageClass === "sent" ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl group relative ${
          messageClass === "sent"
            ? "bg-blue-500 text-white rounded-l-lg rounded-tr-lg ml-8"
            : "bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg mr-8"
        }`}
      >
        <div className="p-3">
          <p className="break-words">{text}</p>
        </div>
        <span className="absolute bottom-0 translate-y-full text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {createdAt?.seconds ? formatDate(new Date(createdAt.seconds * 1000)) : ""}
        </span>
      </div>
    </div>
  );
}

// Helper functions remain the same
async function checkIfFriends(currentUserId, recipientId) {
  const firestore = getFirestore();
  const friendRequestQuery = query(
    collection(firestore, "friendRequests"),
    where("senderId", "in", [currentUserId, recipientId]),
    where("recipientId", "in", [currentUserId, recipientId]),
    where("status", "==", "accepted")
  );

  const querySnapshot = await getDocs(friendRequestQuery);
  return !querySnapshot.empty;
}

async function getOrCreateConversation(conversationsRef, currentUserId, recipientId) {
  const conversationId = [currentUserId, recipientId].sort().join(":");
  const conversationRef = doc(conversationsRef, conversationId);
  const conversationDoc = await getDoc(conversationRef);

  const friendRequestQuery = query(
    collection(firestore, "friendRequests"),
    where("senderId", "in", [currentUserId, recipientId]),
    where("recipientId", "in", [currentUserId, recipientId]),
    where("status", "==", "accepted")
  );

  const querySnapshot = await getDocs(friendRequestQuery);

  if (querySnapshot.empty) {
    console.log("Users are not friends. Cannot create conversation.");
    return null;
  }

  if (conversationDoc.exists()) {
    return conversationRef;
  }

  await setDoc(conversationRef, {
    participants: [currentUserId, recipientId],
    createdAt: serverTimestamp(),
  });

  await updateDoc(conversationRef, {
    participants: arrayUnion(currentUserId, recipientId),
  });

  return conversationRef;
}

export default App;