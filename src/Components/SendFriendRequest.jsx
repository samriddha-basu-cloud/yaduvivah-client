import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

const SendFriendRequest = ({ recipientId }) => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [canSendRequest, setCanSendRequest] = useState(false);
  const auth = getAuth();
  const firestore = getFirestore();
  const currentUserId = auth.currentUser.uid;

  useEffect(() => {
    const friendRequestQuery = query(
      collection(firestore, "friendRequests"),
      where("senderId", "in", [currentUserId, recipientId]),
      where("recipientId", "in", [currentUserId, recipientId])
    );

    const unsubscribe = onSnapshot(friendRequestQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const request = querySnapshot.docs[0].data();
        setRequestStatus(request.status);
      } else {
        setRequestStatus(null);
      }
    });

    checkRequestLimit();

    return unsubscribe;
  }, [currentUserId, recipientId, firestore]);

  const checkRequestLimit = async () => {
    const userRef = doc(firestore, "users", currentUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const { requestsSentToday, lastRequestDate, paymentType } = userData;

      const today = new Date().toDateString();
      const isNewDay = lastRequestDate !== today;

      let dailyLimit;
      switch (paymentType) {
        case "A":
          dailyLimit = 5;
          break;
        case "B":
          dailyLimit = 7;
          break;
        case "C":
          dailyLimit = 10;
          break;
        default:
          dailyLimit = 0;
      }

      if (isNewDay) {
        await updateDoc(userRef, {
          requestsSentToday: 0,
          lastRequestDate: today,
        });
        setCanSendRequest(true);
      } else if (requestsSentToday < dailyLimit) {
        setCanSendRequest(true);
      } else {
        setCanSendRequest(false);
        setError(
          `You've reached your daily limit of ${dailyLimit} friend requests.`
        );
      }
    }
  };

  const handleSendRequest = async () => {
    if (!canSendRequest) {
      setError("You've reached your daily friend request limit.");
      return;
    }

    if (requestStatus) {
      setError("A friend request already exists with this user.");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const friendRequestsRef = collection(firestore, "friendRequests");
      await addDoc(friendRequestsRef, {
        senderId: currentUserId,
        recipientId,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      const userRef = doc(firestore, "users", currentUserId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      await updateDoc(userRef, {
        requestsSentToday: (userData.requestsSentToday || 0) + 1,
        lastRequestDate: new Date().toDateString(),
      });

      setRequestStatus("pending");
      console.log("Friend request sent ✅.");
    } catch (error) {
      console.error("Error sending friend request:", error);
      setError("Failed to send friend request. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const renderButton = () => {
    if (requestStatus === "accepted") {
      return (
        <p className="bg-[#41379d] text-[#ececfe] p-4 text-xl rounded-xl">
          You are already friends
        </p>
      );
    } else if (requestStatus === "pending") {
      return (
        <p className="bg-[#41379d] text-[#ececfe] p-4 text-xl rounded-xl">
          Friend request pending
        </p>
      );
    } else {
      return (
        <button
          onClick={handleSendRequest}
          disabled={isSending || !canSendRequest}
          className={`bg-lime-600 text-[#ececfe] p-4 text-xl rounded-xl ${
            !canSendRequest ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSending ? "Sending..." : "Send Friend Request"}
        </button>
      );
    }
  };

  return (
    <div>
      {renderButton()}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default SendFriendRequest;