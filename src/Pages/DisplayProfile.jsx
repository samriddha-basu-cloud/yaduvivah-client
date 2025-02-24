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
import logo from "../assets/Logo.png";

const ProfileDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = location.state?.props;
  const [chatbox, setChatbox] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [canViewProfile, setCanViewProfile] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

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
      setLoading(false); // Set loading to false after data is fetched
    };

    checkpayment();
  }, []);

  const displayField = (value, isVisible) => {
    return isVisible ? value : "Chosen to be hidden by the user";
  };

 if (loading) {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="text-center p-10 bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border border-orange-100">
        <div className="flex flex-col items-center justify-center space-y-6">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-24 w-auto" 
            style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          />
          <div className="relative w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-blue-500 rounded-full"
              style={{ 
                animation: 'loader 1.5s ease-in-out infinite',
              }}
            />
          </div>
          <p className="text-gray-600 font-medium mt-4">Loading profile...</p>
        </div>
      </div>
      <style>
        {`
          @keyframes loader {
            0% { width: 0%; left: 0; }
            50% { width: 70%; }
            100% { width: 0%; left: 100%; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}

  if (!profile || !canViewProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center p-10 bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <h2 className="text-3xl font-bold text-orange-600 mb-4">Oops!</h2>
          <p className="text-xl text-gray-700">
            {!profile
              ? "No profile data available."
              : "Please upgrade your account to view profiles."}
          </p>
          {!canViewProfile && (
            <button
              onClick={() => navigate("/upgrade")}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:shadow-md w-full md:w-auto"
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
    <div className="bg-gradient-to-br from-orange-50 to-white min-h-screen">
      <Header />
      <div className="container mx-auto p-4 pt-32 max-w-6xl">
        <button
          className="fixed top-20 sm:top-24 left-4 z-10 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center gap-2"
          onClick={() => window.history.back()}
        >
          <AiOutlineArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="relative">
          <div
            className={`${
              chatbox ? "hidden" : "block"
            } transition-all duration-300 ease-in-out`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-8 mb-10 p-6 bg-white rounded-2xl shadow-lg">
              <div className="flex-shrink-0">
                <img
                  src={profile.photos[0]}
                  alt={`${profile.name}'s profile`}
                  className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full mx-auto md:mx-0 border-4 border-orange-100 shadow-lg"
                />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-orange-700">
                  {profile.name}
                </h1>
                <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    {profile.age.split(",")[0]}
                  </span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    {profile.prof}
                  </span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    {profile.region}
                  </span>
                </div>
                <div className="mt-4">
                  <SendFriendRequest recipientId={profile.uid} />
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-orange-700 border-b border-orange-100 pb-3">
                Personal Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  { label: "Age", value: profile.age.split(",")[0], icon: "👤" },
                  { label: "Mother Tongue", value: profile.motherTongue, icon: "🗣️" },
                  { label: "Gender", value: profile.sex, icon: "⚧️" },
                  { label: "Region", value: profile.region, icon: "🏙️" },
                  { label: "Profession", value: profile.prof, icon: "💼" },
                  { label: "Height", value: profile.height, icon: "📏" },
                  { label: "Blood Group", value: profile.bloodGroup, icon: "🩸" },
                  { label: "Caste", value: profile.caste, icon: "👪" },
                  { label: "Sub Caste", value: profile.subCaste, icon: "👥" },
                  { label: "Complexion", value: profile.complexion, icon: "🧑" },
                  { label: "Manglic", value: profile.manglic, icon: "✨" },
                  { label: "Family Members", value: profile.familyMembers, icon: "👨‍👩‍👧‍👦" },
                  { label: "Employment Status", value: profile.employmentStatus, icon: "🏢" },
                  { label: "Highest Qualification", value: profile.highestQualification, icon: "🎓" },
                  { label: "District", value: profile.district, icon: "🏛️" },
                  { label: "State", value: profile.state, icon: "🗺️" },
                  { label: "Pincode", value: profile.pincode, icon: "📮" },
                  { label: "Email", value: displayField(profile.email, profile.showEmail), icon: "📧" },
                  { label: "Phone", value: displayField(profile.phone, profile.showNumber), icon: "📱" },
                  { label: "Status", value: displayField(profile.status, profile.showStatus), icon: "💭" },
                  { label: "Date of Birth", value: profile.dateOfBirth, icon: "🎂" },
                ].map((item, index) => (
                  <div key={index} className="bg-orange-50 p-4 rounded-lg hover:shadow-md transition-all duration-300 border border-orange-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="text-sm text-orange-700 font-medium">
                          {item.label}
                        </p>
                        <p className="font-semibold text-gray-800 truncate">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-orange-700">
                Photo Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {displayPhotos.map((photo, index) => (
                  <div key={index} className="rounded-xl overflow-hidden shadow-lg h-64 md:h-80 hover:shadow-xl transition-all duration-300">
                    <img
                      src={photo}
                      alt={`${profile.name}'s photo ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-500 ease-in-out hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              {profile.photos.length > 3 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowAllPhotos(!showAllPhotos)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-lg"
                  >
                    {showAllPhotos
                      ? "Show Less Photos"
                      : `Show All Photos (${profile.photos.length - 3} more)`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {chatbox && (
            <div className="fixed inset-0 bg-white z-50 overflow-hidden pt-10">
              <div className="flex items-center space-x-4 p-4 pt-8 bg-orange-50 text-orange-800 justify-between border-b border-orange-100">
                <div className="flex items-center gap-4">
                  <img
                    src={profile.photos[0]}
                    alt={`${profile.name}'s profile`}
                    className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-full border-2 border-orange-200"
                  />
                  <h2 className="text-xl md:text-2xl font-semibold">{profile.name}</h2>
                </div>
                <button
                  onClick={() => setChatbox(false)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-full transition-all duration-300 ease-in-out flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Close</span>
                  <span>&#x2715;</span>
                </button>
              </div>
              <div className="overflow-auto h-[calc(100vh-88px)]">
                <Chat uid={profile.uid} />
              </div>
            </div>
          )}

          {!chatbox && (
            <div className="fixed bottom-8 right-8 z-20">
              <button
                onClick={() => setChatbox(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center"
                aria-label="Open chat"
              >
                <AiOutlineSend size={24} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
