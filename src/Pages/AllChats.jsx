import React, { useState, useEffect } from "react";
import { auth, firestore } from "../firebase/Firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import Chat from "../Components/Chat";
import { useNavigate } from "react-router-dom";
import { Home, Search, MessageCircle, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

function AllChats() {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(firestore, "conversations"),
          where("participants", "array-contains", currentUser.uid)
        );

        const unsubscribeChats = onSnapshot(q, (snapshot) => {
          const chatList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChats(chatList);
        });

        return () => unsubscribeChats();
      }
    });

    return () => unsubscribe();
  }, []);

  const getOtherParticipantName = async (participants) => {
    const otherParticipantId = participants.find((p) => p !== user.uid);
    try {
      const userDoc = await getDoc(doc(firestore, "users", otherParticipantId));
      if (userDoc.exists()) {
        return userDoc.data().name;
      }
      return "Unknown User";
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "Error";
    }
  };

  const getOtherParticipantDp = async (participants) => {
    const otherParticipantId = participants.find((p) => p !== user.uid);
    try {
      const userDoc = await getDoc(doc(firestore, "users", otherParticipantId));
      if (userDoc.exists()) {
        return userDoc.data().photos[0];
      }
      return "Unknown User";
    } catch (error) {
      console.error("Error fetching user photo:", error);
      return "Error";
    }
  };

  const handleChatSelect = (chat) => {
    const recipientId = chat.participants.find((p) => p !== user.uid);
    setSelectedChat({ uid: recipientId, chatId: chat.id });
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-white">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <p className="text-xl text-gray-600">Please log in to view your chats</p>
        </motion.div>
      </div>
    );
  }

  const filteredChats = chats.filter((chat) => {
    return true;
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Left Panel - Chat List */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`${
          isMobileView && selectedChat ? 'hidden' : 'block'
        } w-full md:w-1/3 flex flex-col bg-white shadow-2xl`}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="p-6 border-b border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Messages
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl hover:bg-orange-50 transition-colors duration-200"
              onClick={() => navigate("/")}
            >
              <Home className="w-6 h-6 text-orange-500" />
            </motion.button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </motion.div>

        <div className="flex-grow overflow-y-auto">
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="divide-y divide-gray-100"
          >
            {filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                userId={user.uid}
                getOtherParticipantName={getOtherParticipantName}
                getOtherParticipantDp={getOtherParticipantDp}
                onSelect={() => handleChatSelect(chat)}
                isSelected={selectedChat && selectedChat.chatId === chat.id}
              />
            ))}
          </motion.ul>
        </div>
      </motion.div>

      {/* Right Panel - Chat Box */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`${
          isMobileView && !selectedChat ? 'hidden' : 'block'
        } w-full md:w-2/3 flex flex-col bg-white overflow-hidden rounded-l-3xl shadow-inner ${
          isMobileView ? 'mb-16' : ''
        }`}
      >
        {selectedChat ? (
          <div className="h-full">
            {isMobileView && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToList}
                className="p-4 text-orange-500 flex items-center space-x-2"
              >
                <ChevronLeft className="w-6 h-6" />
                <span>Back to chats</span>
              </motion.button>
            )}
            <div className={`h-full ${isMobileView ? 'pb-16' : ''}`}>
              <Chat uid={selectedChat.uid} chatId={selectedChat.chatId} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="p-8 rounded-full bg-orange-50"
            >
              <MessageCircle className="w-12 h-12 text-orange-400" />
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-xl text-gray-500 font-medium"
            >
              Select a conversation to start messaging
            </motion.p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ChatItem({
  chat,
  userId,
  getOtherParticipantName,
  getOtherParticipantDp,
  onSelect,
  isSelected,
}) {
  const [otherParticipantName, setOtherParticipantName] = useState("Loading...");
  const [otherParticipantDp, setOtherParticipantDp] = useState("");

  useEffect(() => {
    const fetchName = async () => {
      const name = await getOtherParticipantName(chat.participants);
      setOtherParticipantName(name);
      const dp = await getOtherParticipantDp(chat.participants);
      setOtherParticipantDp(dp);
    };
    fetchName();
  }, [chat.participants, getOtherParticipantName, getOtherParticipantDp]);

  return (
    <motion.li
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer p-4 transition-all duration-200 ${
        isSelected
          ? "bg-gradient-to-r from-orange-50 to-orange-100 border-r-4 border-orange-500"
          : "hover:bg-gray-50"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative flex-shrink-0"
        >
          <div className="h-14 w-14 rounded-full overflow-hidden ring-2 ring-offset-2 ring-orange-100">
            <img
              src={otherParticipantDp || "/api/placeholder/100/100"}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
        </motion.div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {otherParticipantName}
            </p>
            {/* <p className="text-xs text-gray-500">3m ago</p> */}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {chat.lastMessage || "Click to start a conversation"}
          </p>
        </div>
      </div>
    </motion.li>
  );
}

export default AllChats;