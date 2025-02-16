import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AiOutlineSend,
  AiOutlineArrowLeft,
  AiOutlineUserAdd,
} from "react-icons/ai";
import Chat from "../Components/Chat";
import Header from "../Components/header";
import SendFriendRequest from "../Components/SendFriendRequest";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const ProfileDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = location.state?.props;
  const [chatbox, setChatbox] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [canViewProfile, setCanViewProfile] = useState(false);

  useEffect(() => {
    const checkpayment = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const db = getFirestore();
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCanViewProfile(!!userData.payment);
        }
      }
    };

    checkpayment();
  }, []);

  const displayField = (value, isVisible) => {
    return isVisible ? value : "Chosen to be hidden by the user";
  };

  if (!profile || !canViewProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-indigo-100 to-purple-100">
        <div className="text-center p-10 bg-white rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold text-indigo-800 mb-4">Oops!</h2>
          <p className="text-xl text-gray-600">
            {!profile
              ? "No profile data available."
              : "Please upgrade your account to view profiles."}
          </p>
          {!canViewProfile && (
            <button
              onClick={() => navigate("/upgrade")} // Create an upgrade page
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full"
            >
              Upgrade Account
            </button>
          )}
        </div>
      </div>
    );
  }

  const displayPhotos = showAllPhotos
    ? profile.photos
    : profile.photos.slice(0, 3);

  return (
    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 min-h-screen">
      <Header />
      <div className="container mx-auto p-4 pt-20">
        <button
          className="fixed top-20 left-4 z-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
          onClick={() => window.history.back()}
        >
          <AiOutlineArrowLeft className="w-6 h-6" />
        </button>
        <div className="relative">
          <div
            className={`${
              chatbox ? "hidden" : "block"
            } transition-all duration-300 ease-in-out`}
          >
            <div className="text-center mb-6">
              <img
                src={profile.photos[0]}
                alt={`${profile.name}'s profile`}
                className="w-40 h-40 object-cover rounded-full mx-auto shadow-xl border-4 border-white"
              />
            </div>
            <h1 className="text-4xl font-bold mb-6 text-center text-indigo-800">
              {profile.name}'s Profile
            </h1>
            <div className="bg-white shadow-2xl rounded-2xl p-8 mb-8">
              <h2 className="text-3xl font-semibold mb-6 text-indigo-700">
                Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Age", value: profile.age },
                  { label: "Mother Tongue", value: profile.motherTongue },
                  { label: "Gender", value: profile.sex },
                  { label: "Region", value: profile.region },
                  { label: "Profession", value: profile.prof },
                  { label: "Height", value: profile.height },
                  {
                    label: "Email",
                    value: displayField(profile.email, profile.showEmail),
                  },
                  {
                    label: "Phone",
                    value: displayField(profile.number, profile.showNumber),
                  },
                  {
                    label: "Status",
                    value: displayField(profile.status, profile.showStatus),
                  },
                ].map((item, index) => (
                  <div key={index} className="bg-indigo-50 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-800">
                      {item.label}:
                    </p>
                    <p className="font-bold text-xl text-indigo-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <SendFriendRequest recipientId={profile.uid} />
              </div>
              <h3 className="text-2xl font-semibold mt-8 mb-4 text-indigo-700">
                Description
              </h3>
              <p className="text-gray-700 bg-indigo-50 p-4 rounded-lg">
                {profile.description}
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-800">
                Photos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayPhotos.map((photo, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1">
                    <img
                      src={photo}
                      alt={`${profile.name}'s photo ${index + 1}`}
                      className="object-cover rounded-2xl shadow-xl w-full h-full transition duration-300 ease-in-out transform hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              {profile.photos.length > 3 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowAllPhotos(!showAllPhotos)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
                  >
                    {showAllPhotos
                      ? "Show Less"
                      : `Show More Photos (${profile.photos.length - 3} more)`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {chatbox && (
            <div className="fixed inset-0 bg-white shadow-2xl z-50 overflow-hidden pt-10 ">
              <div className="flex items-center space-x-4 p-4 pt-8 bg-[#ebebfe] text-[#41379d] justify-between ">
                <div className="flex items-center gap-8 ">
                  <img
                    src={profile.photos[0]}
                    alt={`${profile.name}'s profile`}
                    className="w-16 h-16 object-cover rounded-full border-2 border-white"
                  />
                  <h2 className="text-2xl font-semibold">{profile.name}</h2>
                </div>
                <div className="flex">
                  <button
                    onClick={() => setChatbox(false)}
                    className="ml-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
                  >
                    &#x2715;
                  </button>
                </div>
              </div>
              <div className="overflow-auto h-[calc(100vh-88px)]">
                <Chat uid={profile.uid} />
              </div>
            </div>
          )}

          {!chatbox && (
            <div className="fixed bottom-8 right-8 z-50">
              <button
                onClick={() => setChatbox(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              >
                <AiOutlineSend size={28} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
