import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/authContext";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { FaUserFriends, FaUserSlash, FaUserPlus, FaCheck, FaTimes } from "react-icons/fa";

const FriendsList = ({ onClose }) => {
  const [friends, setFriends] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockingId, setBlockingId] = useState(null);
  const { currentUser } = useAuth();
  const db = getFirestore();

  useEffect(() => {
    fetchFriendsAndBlocked();
  }, [currentUser, db]);

  const fetchFriendsAndBlocked = async () => {
    if (currentUser) {
      setLoading(true);
      try {
        const friendsQuery = query(
          collection(db, "friendRequests"),
          where("status", "==", "accepted"),
          where("recipientId", "==", currentUser.uid)
        );

        const friendsQuery2 = query(
          collection(db, "friendRequests"),
          where("status", "==", "accepted"),
          where("senderId", "==", currentUser.uid)
        );

        const [querySnapshot1, querySnapshot2] = await Promise.all([
          getDocs(friendsQuery),
          getDocs(friendsQuery2),
        ]);

        const friendsList1 = querySnapshot1.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          friendId: doc.data().senderId,
        }));

        const friendsList2 = querySnapshot2.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          friendId: doc.data().recipientId,
        }));

        const combinedFriendsList = [...friendsList1, ...friendsList2];

        const blockedQuery = query(
          collection(db, "blockedUsers"),
          where("blockerId", "==", currentUser.uid)
        );

        const blockedSnapshot = await getDocs(blockedQuery);
        const blockedList = blockedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const friendsWithNames = await fetchUserNames(combinedFriendsList, "friendId");
        const blockedWithNames = await fetchUserNames(blockedList, "blockedId");

        setFriends(friendsWithNames);
        setBlockedUsers(blockedWithNames);
      } catch (error) {
        console.error("Error fetching friends and blocked users:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchUserNames = async (userList, idField) => {
    return Promise.all(
      userList.map(async (user) => {
        const userDoc = await getDoc(doc(db, "users", user[idField]));
        const userData = userDoc.data();
        return {
          ...user,
          name: userData ? userData.name || "Unknown User" : "Unknown User",
        };
      })
    );
  };

  const handleBlockConfirm = async (friendRequestId, friendId, friendName) => {
    try {
      await deleteDoc(doc(db, "friendRequests", friendRequestId));

      const newBlockedDoc = await addDoc(collection(db, "blockedUsers"), {
        blockerId: currentUser.uid,
        blockedId: friendId,
        timestamp: new Date(),
      });

      setFriends(friends.filter((friend) => friend.id !== friendRequestId));
      setBlockedUsers([...blockedUsers, { 
        id: newBlockedDoc.id, 
        blockedId: friendId, 
        name: friendName 
      }]);
    } catch (error) {
      console.error("Error blocking friend:", error);
    } finally {
      setBlockingId(null);
    }
  };

  const handleUnblock = async (blockedId, userId) => {
    try {
      await deleteDoc(doc(db, "blockedUsers", blockedId));

      await addDoc(collection(db, "friendRequests"), {
        senderId: currentUser.uid,
        recipientId: userId,
        status: "pending",
        timestamp: new Date(),
      });

      setBlockedUsers(blockedUsers.filter((user) => user.id !== blockedId));
      // Refresh the friends list to show the new pending request
      await fetchFriendsAndBlocked();
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-inner max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-6 pb-2 border-b-2 border-orange-300">
          <FaUserFriends className="mr-3 text-orange-500" />
          Your Connections
        </h2>
        {friends.length === 0 ? (
          <div className="text-gray-500 text-center py-8 px-4 bg-blue-50 rounded-lg border border-blue-100">
            <p>You have no connections yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {friends.map((friend) => (
              <li
                key={friend.id}
                className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex justify-between items-center">
                  <span className="text-blue-800 font-medium text-lg">
                    {friend.name}
                  </span>
                  {blockingId !== friend.id ? (
                    <button
                      onClick={() => setBlockingId(friend.id)}
                      className="flex items-center bg-white text-red-500 border border-red-300 px-3 py-2 rounded-full hover:bg-red-50 transition-colors duration-200 shadow-sm"
                    >
                      <FaUserSlash className="mr-2" />
                      Block
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBlockConfirm(friend.id, friend.friendId, friend.name)}
                        className="flex items-center bg-white text-green-600 border border-green-300 px-3 py-2 rounded-full hover:bg-green-50 transition-colors duration-200 shadow-sm"
                      >
                        <FaCheck className="mr-2" />
                        Confirm
                      </button>
                      <button
                        onClick={() => setBlockingId(null)}
                        className="flex items-center bg-white text-gray-600 border border-gray-300 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                      >
                        <FaTimes className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-blue-700 flex items-center mb-6 pb-2 border-b-2 border-orange-300">
          <FaUserSlash className="mr-3 text-orange-500" />
          Blocked Users
        </h2>
        {blockedUsers.length === 0 ? (
          <div className="text-gray-500 text-center py-8 px-4 bg-blue-50 rounded-lg border border-blue-100">
            <p>You haven't blocked any users.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {blockedUsers.map((user) => (
              <li
                key={user.id}
                className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-white rounded-xl border border-orange-100 transition-all duration-300 hover:shadow-md"
              >
                <span className="text-blue-800 font-medium text-lg">
                  {user.name}
                </span>
                <button
                  onClick={() => handleUnblock(user.id, user.blockedId)}
                  className="flex items-center bg-white text-blue-600 border border-blue-300 px-3 py-2 rounded-full hover:bg-blue-50 transition-colors duration-200 shadow-sm"
                >
                  <FaUserPlus className="mr-2" />
                  Send Request
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
