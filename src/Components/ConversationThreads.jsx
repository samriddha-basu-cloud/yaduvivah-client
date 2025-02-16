import React from "react";
import { getFirestore, collection, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

function ConversationThreads() {
  const firestore = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const usersRef = collection(firestore, "users");
  const q = query(usersRef, where("uid", "!=", currentUser.uid));
  const [users] = useCollectionData(q, { idField: "id" });

  return (
    <div>
      <h2>Conversation Threads</h2>
      {users &&
        users.map((user) => (
          <div key={user.id}>
            <p>{user.displayName}</p>
            {/* Add a button or link to initiate a conversation */}
          </div>
        ))}
    </div>
  );
}

export default ConversationThreads;
