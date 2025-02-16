import React, { useState, useEffect } from "react";
import { useList, useListVals } from "react-firebase-hooks/database";
import {
  getDatabase,
  ref,
  push,
  set,
  serverTimestamp,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { useAuth } from "../context/authContext";
import { useAuthState } from "react-firebase-hooks/auth";

const ChatRoom = () => {
  const [newMessage, setNewMessage] = useState("");
  const db = getDatabase();
  const messagesRef = ref(db, "messages");
  const [messages, loading, error] = useList(query(messagesRef, orderByChild("timestamp")));
  const [currentUser, userLoading, userError] = useAuthState(useAuth());

  // Fetch unread messages
  const unreadMessagesRef = query(messagesRef, orderByChild("isRead"), equalTo(false));
  const [unreadMessages] = useListVals(unreadMessagesRef);
  const unreadCount = unreadMessages?.filter(msg => msg.senderId !== currentUser?.uid).length || 0;

  useEffect(() => {
    if (error || userError) {
      console.error("Error fetching messages or user:", error, userError);
    }
  }, [error, userError]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const messageRef = push(messagesRef);
      await set(messageRef, {
        content: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        isRead: false,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!currentUser) return;
      
      const unreadMessagesSnapshot = unreadMessages?.filter(msg => msg.senderId !== currentUser.uid);
      unreadMessagesSnapshot?.forEach(async (msg) => {
        const msgRef = ref(db, `messages/${msg.key}`);
        await update(msgRef, { isRead: true });
      });
    };

    markMessagesAsRead();
  }, [messages, currentUser]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header with Unread Badge */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
        {unreadCount > 0 && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4 pb-24 md:pb-16">
        <div className="max-w-3xl mx-auto space-y-4">
          {loading || userLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error || userError ? (
            <div className="text-red-500 text-center">
              Error: {error?.message || userError?.message}
            </div>
          ) : (
            messages?.map((message) => (
              <div
                key={message.key}
                className={`flex ${
                  message.val().senderId === currentUser?.uid ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.val().senderId === currentUser?.uid
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm break-words">{message.val().content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!currentUser || !newMessage.trim()}
            className={`px-6 py-3 text-white rounded-lg transition-colors ${
              currentUser && newMessage.trim()
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;