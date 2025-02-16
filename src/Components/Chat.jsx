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
  getDoc,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDocs,
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
import { useLocation, useParams } from "react-router-dom";
import { Send, Menu } from "lucide-react";

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

function App(props) {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const params = useParams();
  const [isFriend, setIsFriend] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const [recipientData, setRecipientData] = useState(null);

  useEffect(() => {
    const checkFriendship = async () => {
      const uid = props.uid || location.state?.props?.uid || params.uid;
      if (user && uid) {
        setRecipientId(uid);
        const areFriends = await checkIfFriends(user.uid, uid);
        setIsFriend(areFriends);
        
        // Fetch recipient data
        const userDoc = await getDoc(doc(getFirestore(), 'users', uid));
        if (userDoc.exists()) {
          setRecipientData(userDoc.data());
        }
      }
    };

    checkFriendship();
  }, [user, location.state, params, props.uid]);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="max-w-5xl mx-auto h-screen relative bg-white shadow-lg">
        {user ? (
          <>
            {isFriend === false ? (
              <div className="flex items-center justify-center h-full p-6 text-lg text-gray-600 bg-gray-50">
                <div className="text-center">
                  <p className="mb-4">You are not friends with this user.</p>
                  <button className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors">
                    Send Friend Request
                  </button>
                </div>
              </div>
            ) : isFriend === true ? (
              <ChatRoom recipientId={recipientId} chatId={props.chatId} recipientData={recipientData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-6 text-lg text-gray-600 bg-gray-50">
            Please sign in to continue
          </div>
        )}
      </section>
    </div>
  );
}

function ChatRoom({ recipientId, chatId, recipientData }) {
  const dummy = useRef();
  const firestore = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [formValue, setFormValue] = useState("");
  const [conversationDoc, setConversationDoc] = useState(null);
  const [areFriends, setAreFriends] = useState(false);


  const conversationsRef = collection(firestore, "conversations");

  useEffect(() => {
    const fetchConversation = async () => {
      const areFriendsResult = await checkIfFriends(
        currentUser.uid,
        recipientId
      );
      setAreFriends(areFriendsResult);

      if (areFriendsResult) {
        let conversationRef;
        if (chatId) {
          conversationRef = doc(conversationsRef, chatId);
        } else {
          const conversationId = [currentUser.uid, recipientId]
            .sort()
            .join(":");
          conversationRef = doc(conversationsRef, conversationId);
        }

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
    };

    fetchConversation();
  }, [currentUser.uid, recipientId, chatId]);

  const messagesRef = conversationDoc
    ? collection(conversationDoc, "messages")
    : null;
  const messagesQuery = messagesRef
    ? query(messagesRef, orderBy("createdAt"))
    : null;

  const [messages] = useCollectionData(messagesQuery, { idField: "id" });

  const sendMessage = async (e) => {
    e.preventDefault();

    if (conversationDoc && formValue.trim()) {
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
      <div className="flex items-center justify-center h-full p-6 text-lg text-gray-600 bg-gray-50">
        You need to be friends to chat.
      </div>
    );
  }

  return (
  <div className="flex flex-col h-screen">
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center">
        <div className="flex items-center space-x-4">
          {recipientData?.photos[0] ? (
            <img 
              src={recipientData.photos[0]} 
              alt={recipientData.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-medium text-lg">
                {recipientData?.name?.charAt(0) || recipientId?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {recipientData?.name || recipientId}
            </h2>
          </div>
        </div>
      </div>
    </header>

    <main className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 md:pb-4 pb-36">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </div>
    </main>

    <form
      onSubmit={sendMessage}
      className="border-t border-gray-200 bg-white p-4 md:sticky fixed bottom-0 left-0 right-0"
    >
      <div className="flex items-center space-x-4 max-w-3xl mx-auto">
        <input
          className="flex-1 py-3 px-4 bg-gray-100 rounded-full text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          disabled={!formValue.trim()}
          className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-full text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      } space-y-1`}
    >
      <div
        className={`py-3 px-4 rounded-2xl max-w-[85%] sm:max-w-md break-words ${
          messageClass === "sent"
            ? "bg-orange-500 text-white"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
      <span className="text-xs text-gray-500 px-2">
        {createdAt?.seconds
          ? formatDate(new Date(createdAt.seconds * 1000))
          : ""}
      </span>
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

async function getOrCreateConversation(
  conversationsRef,
  currentUserId,
  recipientId
) {
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