import React from "react";
import { auth } from "../firebase/Firebase";
import { useAuth } from "../context/authContext";

const Message = ({ message }) => {
  const [currentUser] = useAuth(auth);
  return (
    <div
      className={`chat-bubble ${
        message.uid === currentUser.uid ? "right" : ""
      }`}
    >
      <img
        className="chat-bubble__left"
        src={message.avatar}
        alt="user avatar"
      />
      <div className="chat-bubble__right">
        <p className="user-name">{message.name}</p>
        <p className="user-message">{message.text}</p>
      </div>
    </div>
  );
};

export default Message;
