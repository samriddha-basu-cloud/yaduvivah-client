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
  console.log(incomingRequests);
  const RequestCard = ({ title, requests, onAccept, onReject }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 flex-1 min-w-[300px]">
      <h3 className="text-xl font-semibold mb-4 text-indigo-700">{title}</h3>
      {requests.length === 0 ? (
        <p className="text-gray-500 italic">No {title.toLowerCase()}.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li
              key={request.id}
              className="bg-indigo-50 rounded-md p-4 transition-all hover:shadow-md"
            >
              <p className="font-medium text-indigo-900 mb-2">
                {title === "Incoming Requests" ? "From: " : "To: "}
                {request.senderName || request.recipientName}
              </p>
              {onAccept && onReject && (
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => onAccept(request.id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm transition-colors duration-200"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(request.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition-colors duration-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-indigo-100 to-orange-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-800">
          Friend Requests
        </h2>
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
          <RequestCard
            title="Incoming Requests"
            requests={incomingRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
          <RequestCard title="Outgoing Requests" requests={outgoingRequests} />
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;