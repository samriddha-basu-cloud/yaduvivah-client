import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  query,
  where,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const FriendRequests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [adminTexts, setAdminTexts] = useState("");
  const auth = getAuth();
  const firestore = getFirestore();
  const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

  const fetchUserProfiles = async (userIds) => {
    const userProfiles = {};
    const userPromises = userIds.map(async (userId) => {
      const userDoc = await getDoc(doc(firestore, "users", userId));
      if (userDoc.exists()) {
        userProfiles[userId] =
          userDoc.data().name || userDoc.data().displayName || "Unknown User";
      } else {
        userProfiles[userId] = "Unknown User";
      }
    });
    await Promise.all(userPromises);
    return userProfiles;
  };

  useEffect(() => {
    const fetchAdminTexts = async () => {
      if (currentUserId) {
        const userDoc = await getDoc(doc(firestore, "users", currentUserId));
        if (userDoc.exists() && userDoc.data().adminTexts) {
          setAdminTexts(userDoc.data().adminTexts);
        }
      }
    };

    fetchAdminTexts();

    const incomingRequestsQuery = query(
      collection(firestore, "friendRequests"),
      where("recipientId", "==", currentUserId),
      where("status", "==", "pending")
    );

    const outgoingRequestsQuery = query(
      collection(firestore, "friendRequests"),
      where("senderId", "==", currentUserId),
      where("status", "==", "pending")
    );

    const unsubscribeIncoming = onSnapshot(
      incomingRequestsQuery,
      async (querySnapshot) => {
        const requests = [];
        querySnapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() });
        });
        const userIds = requests.map((request) => request.senderId);
        const userProfiles = await fetchUserProfiles(userIds);
        setIncomingRequests(
          requests.map((request) => ({
            ...request,
            senderName: userProfiles[request.senderId],
          }))
        );
      }
    );

    const unsubscribeOutgoing = onSnapshot(
      outgoingRequestsQuery,
      async (querySnapshot) => {
        const requests = [];
        querySnapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() });
        });
        const userIds = requests.map((request) => request.recipientId);
        const userProfiles = await fetchUserProfiles(userIds);
        setOutgoingRequests(
          requests.map((request) => ({
            ...request,
            recipientName: userProfiles[request.recipientId],
          }))
        );
      }
    );

    return () => {
      unsubscribeIncoming();
      unsubscribeOutgoing();
    };
  }, [currentUserId, firestore]);

  const handleAcceptRequest = async (requestId) => {
    try {
      const requestRef = doc(
        collection(firestore, "friendRequests"),
        requestId
      );
      await updateDoc(requestRef, { status: "accepted" });
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const requestRef = doc(
        collection(firestore, "friendRequests"),
        requestId
      );
      await deleteDoc(requestRef);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const RequestCard = ({ title, requests, onAccept, onReject }) => (
    <div className="w-full md:w-1/2 p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="p-6">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-orange-400 text-4xl mb-4">📭</div>
              <p className="text-gray-500 text-center">
                No {title.toLowerCase()} at the moment
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {requests.map((request) => (
                <li
                  key={request.id}
                  className="bg-gradient-to-r from-orange-50 to-white rounded-lg p-4 border border-orange-100 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold mr-3">
                      {(request.senderName?.[0] || request.recipientName?.[0] || "?").toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {request.senderName || request.recipientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {title === "Incoming Requests" ? "Wants to connect" : "Request sent"}
                      </p>
                    </div>
                  </div>
                  {onAccept && onReject && (
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => onAccept(request.id)}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onReject(request.id)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {adminTexts && (
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-orange-600 rounded-xl shadow-xl animate-pulse opacity-90"></div>
            <div className="relative bg-white rounded-xl shadow-lg p-6 border-2 border-orange-600">
              <h2 className="text-2xl font-bold text-center text-orange-600 mb-4">
                Message from Admin
              </h2>
              <p className="text-center text-gray-700 leading-relaxed text-xl font-semibold">
                {adminTexts}
              </p>
            </div>
          </div>
        )}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
          Friend Requests
        </h2>
        <div className="flex flex-wrap -mx-4">
          <RequestCard
            title="Incoming Requests"
            requests={incomingRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
          <RequestCard 
            title="Outgoing Requests" 
            requests={outgoingRequests} 
          />
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;