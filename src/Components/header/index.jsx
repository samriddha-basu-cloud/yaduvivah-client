import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { doSignOut } from "../../firebase/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import logo from "../../assets/Logo.png";
import { FaSearch, FaBars, FaTimes, FaUserFriends } from "react-icons/fa";
import { auth } from "../../firebase/Firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/Firebase";
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { getFirestore, query, where, collection, onSnapshot } from "firebase/firestore";
import NotificationIcon from "../../assets/notification.png";
import UserIcon from "../../assets/user.png";
import Pricing from "../../assets/Pricing.png";
import FriendRequests from "../FriendRequests";
import { BsChatDots } from "react-icons/bs";
import FriendsList from "../FriendList";

const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedUser, setLoggedUser] = useState("");
  const { userLoggedIn } = useAuth();
  const auth = getAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePassword, setDeletePassword] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminText, setAdminText] = useState("");

  useEffect(() => {
    if (userLoggedIn && auth.currentUser) {
      const firestore = getFirestore();
      const currentUserId = auth.currentUser.uid;

      const incomingRequestsQuery = query(
        collection(firestore, "friendRequests"),
        where("recipientId", "==", currentUserId),
        where("status", "==", "pending")
      );

      const getUserLoggedIn = onAuthStateChanged(auth, (user) => {
        if (user) {
          const email = user.email;
          console.log("User email:", email);
          setLoggedUser(email.split("@")[0]);
        } else {
          console.log("User is signed out");
        }
      });

      const unsubscribe = onSnapshot(incomingRequestsQuery, (querySnapshot) => {
        const requests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setIncomingRequests(requests);
      });

      const fetchAdminText = async () => {
        const userDoc = await getDoc(doc(firestore, "users", currentUserId));
        if (userDoc.exists() && userDoc.data().adminTexts) {
          setAdminText(userDoc.data().adminTexts);
        }
      };

      fetchAdminText();

      return () => {
        unsubscribe();
        getUserLoggedIn();
      };
    }
  }, [userLoggedIn, auth]);

  const handleMouseLeave = () => {
    setShowDropdown(false);
  };

  const openDeleteAccountDialog = () => {
    setDeleteAccountDialogOpen(true);
  };

  const closeDeleteAccountDialog = () => {
    setDeleteAccountDialogOpen(false);
  };

  const closeAndResetDeleteDialog = () => {
    closeDeleteAccountDialog();
    setDeletePassword("");
  };

  const handleDeleteAccount = async () => {
    try {
      if (!deletePassword) {
        alert("Password is required to delete your account.");
        return;
      }

      const credential = EmailAuthProvider.credential(auth.currentUser.email, deletePassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      await deleteDoc(doc(db, "users", currentUser.uid));
      await deleteUser(auth.currentUser);

      closeDeleteAccountDialog();
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setDeletePassword("");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="flex justify-between items-center w-full z-20 fixed top-0 left-0 h-16 lg:h-20 bg-gradient-to-r from-orange-300 to-orange-500 shadow-md px-4">
  <div className="flex items-center gap-4">
    <div
      className="flex items-center cursor-pointer transform hover:scale-105 transition-transform duration-300"
      onClick={() => navigate("/")}
    >
      <span className="text-3xl font-bold text-white transition-all duration-300 ease-in-out">
        <img className="h-12 w-auto lg:h-16" src={logo} alt="Logo" />
      </span>
    </div>
  </div>

  <div className="lg:hidden">
    <button className="text-white p-2 rounded-full bg-orange-800 hover:bg-orange-900 transition-colors duration-200 hover:rotate-180 transition-transform duration-300" onClick={toggleMobileMenu}>
      {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
    </button>
  </div>

  <div
    className={`flex-col lg:flex-row lg:flex lg:items-center gap-4 lg:gap-2 text-center justify-center items-center ${
      isMobileMenuOpen
        ? "flex backdrop-blur-md bg-orange-800 bg-opacity-95"
        : "hidden"
    } absolute lg:relative top-16 lg:top-0 right-0 w-full lg:w-auto lg:bg-transparent px-4 lg:px-0 transition-all duration-300 shadow-lg lg:shadow-none
    ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto"}`}
  >
    {userLoggedIn ? (
      <div className="flex flex-col lg:flex-row items-start text-center justify-center lg:items-center w-full lg:w-auto py-4 lg:py-0 space-y-2 lg:space-y-0">
        <button
          onClick={() => navigate("/all-matri")}
          className={`flex items-center justify-center text-sm lg:text-base font-medium rounded-full transition ease-in-out px-4 py-2 duration-200 hover:bg-blue-500 hover:text-white w-full lg:w-auto hover:scale-105 transform ${
            location.pathname === "/all-matri" 
              ? "bg-blue-500 text-white scale-105"
              : isMobileMenuOpen
                ? "text-white border border-blue-300 hover:border-blue-500"
                : "text-white hover:bg-blue-500"
          }`}
        >
          <FaSearch className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
          Explore!
        </button>
        
        <Link
          className={`flex items-center justify-center text-sm lg:text-base font-medium rounded-full transition ease-in-out px-4 py-2 duration-200 hover:bg-blue-500 hover:text-white w-full lg:w-auto hover:scale-105 transform ${
            location.pathname === "/payment-details" 
              ? "bg-blue-500 text-white scale-105"
              : isMobileMenuOpen
                ? "text-white border border-blue-300 hover:border-blue-500"
                : "text-white hover:bg-blue-500"
          }`}
          to={"/payment-details"}
        >
          <img src={Pricing} alt="Pricing" className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
          Pricing
        </Link>
        
        <button
          onClick={() => navigate("/allChats")}
          className={`flex items-center justify-center text-sm lg:text-base font-medium rounded-full transition ease-in-out px-4 py-2 duration-200 hover:bg-blue-500 hover:text-white w-full lg:w-auto hover:scale-105 transform ${
            location.pathname === "/allChats" 
              ? "bg-blue-500 text-white scale-105"
              : isMobileMenuOpen
                ? "text-white border border-blue-300 hover:border-blue-500"
                : "text-white hover:bg-blue-500"
          }`}
        >
          <BsChatDots className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
          Chats
        </button>
        
        <button
          onClick={() => setShowFriends(!showFriends)}
          className={`flex items-center justify-center text-sm lg:text-base font-medium rounded-full transition ease-in-out px-4 py-2 duration-200 hover:bg-blue-500 hover:text-white w-full lg:w-auto hover:scale-105 transform ${
            showFriends 
              ? "bg-blue-500 text-white scale-105"
              : isMobileMenuOpen
                ? "text-white border border-blue-300 hover:border-blue-500"
                : "text-white hover:bg-blue-500"
          }`}
        >
          <FaUserFriends className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
          Connections
        </button>
        
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`flex items-center justify-center text-sm lg:text-base font-medium rounded-full transition ease-in-out px-4 py-2 duration-200 hover:bg-blue-500 hover:text-white cursor-pointer relative w-full lg:w-auto hover:scale-105 transform ${
            showNotifications 
              ? "bg-blue-500 text-white scale-105"
              : isMobileMenuOpen
                ? "text-white border border-blue-300 hover:border-blue-500"
                : "text-white hover:bg-blue-500"
          }`}
        >
          <img
            src={NotificationIcon}
            alt="Notification Icon"
            className="w-4 h-4 lg:w-5 lg:h-5 mr-2"
          />
          Notifications
          {incomingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white animate-pulse">
              {incomingRequests.length}
            </span>
          )}
          {adminText && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 animate-pulse"></span>
          )}
        </button>
        
        <div className="relative w-full lg:w-auto">
          <button
            className={`flex items-center justify-center text-sm lg:text-base font-medium rounded-full transition ease-in-out px-4 py-2 duration-200 hover:bg-blue-500 hover:text-white w-full lg:w-auto hover:scale-105 transform ${
              showDropdown 
                ? "bg-blue-500 text-white scale-105"
                : isMobileMenuOpen
                  ? "text-white border border-blue-300 hover:border-blue-500"
                  : "text-white hover:bg-blue-500"
            }`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img
              src={UserIcon}
              alt="User Icon"
              className="w-4 h-4 lg:w-5 lg:h-5 mr-2"
            />
            Profile
          </button>
          
          {showDropdown && (
            <div
              ref={dropdownRef}
              onMouseLeave={handleMouseLeave}
              className="absolute right-0 mt-2 py-2 bg-white rounded-xl shadow-xl w-56 z-50 border border-orange-100 overflow-hidden animate-fadeIn"
            >
              <div className="block px-4 py-3 text-orange-800 w-full text-center font-medium bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
                Hello! {loggedUser}
              </div>
              
              <button
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-orange-50 w-full text-left transition-colors duration-200 hover:scale-[1.02] transform"
                onClick={() => navigate("/profile")}
              >
                <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                  <img src={UserIcon} alt="Profile" className="w-4 h-4" />
                </span>
                Edit Profile
              </button>
              
              <button
                className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left transition-colors duration-200 hover:scale-[1.02] transform"
                onClick={openDeleteAccountDialog}
              >
                <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <FaTimes className="w-4 h-4 text-red-500" />
                </span>
                Delete Account
              </button>
              
              <button
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 w-full text-left transition-colors duration-200 hover:scale-[1.02] transform border-t border-gray-100"
                onClick={() => {
                  doSignOut().then(() => {
                    navigate("/login");
                  });
                }}
              >
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2.586L13.586 9H10V5.586z" clipRule="evenodd" />
                  </svg>
                </span>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    ) : (
      <div className="flex flex-col lg:flex-row items-center justify-center w-full lg:w-auto py-4 lg:py-0 space-y-2 lg:space-y-0 lg:space-x-2">
        <Link
          className="text-sm lg:text-base font-medium text-white bg-orange-800 hover:bg-blue-500 transition-colors duration-200 px-6 py-2 rounded-full w-full lg:w-auto text-center hover:scale-105 transform transition-transform"
          to={"/login"}
        >
          Login
        </Link>
        <Link
          className="text-sm lg:text-base font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200 px-6 py-2 rounded-full w-full lg:w-auto text-center hover:scale-105 transform transition-transform"
          to={"/register"}
        >
          Register
        </Link>
      </div>
    )}
  </div>
</nav>

{/* Modal styles remain the same with added animations */}
{showNotifications && (
  <div className="fixed inset-0 bg-orange-900 bg-opacity-70 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-transform duration-300 scale-100 animate-scaleIn">
      <div className="flex justify-between items-center p-5 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white">
        <h2 className="text-xl font-bold text-orange-800">Notifications</h2>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 shadow-sm hover:rotate-90 transition-transform"
        >
          <span className="text-xl">&times;</span>
        </button>
      </div>
      <div className="h-[calc(90vh-8rem)] overflow-auto">
        <FriendRequests />
      </div>
      <div className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-right">
        <button 
          onClick={() => setShowNotifications(false)}
          className="px-4 py-2 bg-white text-orange-700 rounded-lg font-medium hover:bg-orange-50 transition-colors duration-200 text-sm shadow-sm hover:scale-105 transform transition-transform"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{showFriends && (
  <div className="fixed inset-0 bg-orange-900 bg-opacity-70 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transform transition-transform duration-300 scale-100 animate-scaleIn">
      <div className="flex justify-between items-center p-5 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white">
        <h2 className="text-xl font-bold text-orange-800">All Connections</h2>
        <button
          onClick={() => setShowFriends(!showFriends)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 shadow-sm hover:rotate-90 transition-transform"
        >
          <span className="text-xl">&times;</span>
        </button>
      </div>
      <div className="bg-white">
        <FriendsList onClose={() => setShowFriends(false)} />
      </div>
      <div className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-right">
        <button 
          onClick={() => setShowFriends(false)}
          className="px-4 py-2 bg-white text-orange-700 rounded-lg font-medium hover:bg-orange-50 transition-colors duration-200 text-sm shadow-sm hover:scale-105 transform transition-transform"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{/* Add these CSS keyframes animations to your global styles */}
<style jsx global>{`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out;
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`}</style>
    </>
  );
};

export default Header;
