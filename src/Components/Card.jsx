import React, { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { MdOutlineReportOff } from "react-icons/md";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Tooltip,
  Zoom,
} from "@mui/material";

export default function Card(props) {
  const navigate = useNavigate();
  const hasPhotos = props.photos && props.photos.length > 0;
  const [isReported, setIsReported] = useState(false);
  const [showReportButton, setShowReportButton] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const autoPlayRef = useRef(null);
  const [reportReasons, setReportReasons] = useState({
    inappropriateContent: false,
    spam: false,
    harassment: false,
    fakeProfile: false,
  });

  const auth = getAuth();

  useEffect(() => {
    const checkReportStatus = async () => {
      const db = getFirestore();
      const userRef = doc(db, "users", props.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setIsReported(userData.reported || false);

        const currentUser = auth.currentUser;
        const isOwnProfile = currentUser && currentUser.uid === props.uid;

        setShowReportButton(!isOwnProfile);
      }
    };
    checkReportStatus();
  }, [props.uid, auth]);

  // Set up automatic carousel effect
  useEffect(() => {
    if (hasPhotos && props.photos.length > 1) {
      autoPlayRef.current = setInterval(() => {
        if (!isHovering) {
          setCurrentPhotoIndex((prevIndex) => 
            (prevIndex + 1) % props.photos.length
          );
        }
      }, 3000);
      
      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [hasPhotos, props.photos, isHovering]);

  const handleReport = async () => {
    if (isReported) return;

    const db = getFirestore();
    const userRef = doc(db, "users", props.uid);

    const selectedReasons = Object.entries(reportReasons)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);

    try {
      await updateDoc(userRef, {
        reported: true,
        reportReason: selectedReasons,
      });
      setIsReported(true);
      setOpenDialog(false);
      alert("Profile reported successfully");
    } catch (error) {
      console.error("Error reporting profile:", error);
      alert("Failed to report profile. Please try again.");
    }
  };

  const handleOpenDialog = (e) => {
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleReasonChange = (event) => {
    setReportReasons({
      ...reportReasons,
      [event.target.name]: event.target.checked,
    });
  };

  const handleCardClick = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const db = getFirestore();
      const userRef = doc(db, "users", currentUser.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.payment) {
            navigate("/individualProfile", { state: { props } });
          } else {
            alert("Please upgrade your account to view profiles.");
          }
        }
      });
    } else {
      alert("Please log in to view profiles.");
    }
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (hasPhotos && props.photos.length > 1) {
      setCurrentPhotoIndex((prevIndex) => 
        (prevIndex + 1) % props.photos.length
      );
    }
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    if (hasPhotos && props.photos.length > 1) {
      setCurrentPhotoIndex((prevIndex) => 
        (prevIndex - 1 + props.photos.length) % props.photos.length
      );
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 relative"
      style={{
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
        borderRadius: "16px",
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {showReportButton && (
        <>
          <Tooltip 
            title={isReported ? "Already reported" : "Report profile"} 
            placement="left"
            TransitionComponent={Zoom}
            arrow
          >
            <button
              onClick={handleOpenDialog}
              disabled={isReported}
              className={`absolute top-3 right-3 z-30 rounded-full p-2 transition-all duration-200 ${
                isReported 
                  ? "bg-gray-100 cursor-default" 
                  : "bg-white/90 hover:bg-white shadow-md hover:shadow-lg"
              }`}
              style={{
                backdropFilter: "blur(4px)",
              }}
            >
              {isReported ? (
                <MdOutlineReportOff className="w-5 h-5 text-gray-400" />
              ) : (
                <MdOutlineReportGmailerrorred className="w-5 h-5 text-red-500" />
              )}
            </button>
          </Tooltip>

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            onClick={(e) => e.stopPropagation()}
            PaperProps={{
              style: {
                borderRadius: '12px',
                padding: '8px',
              },
            }}
          >
            <DialogTitle 
              style={{ fontWeight: '600' }}
            >
              {"Report User"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please select the reason(s) for reporting this user:
              </DialogContentText>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reportReasons.inappropriateContent}
                      onChange={handleReasonChange}
                      name="inappropriateContent"
                      color="warning"
                    />
                  }
                  label="Inappropriate Content"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reportReasons.spam}
                      onChange={handleReasonChange}
                      name="spam"
                      color="warning"
                    />
                  }
                  label="Spam"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reportReasons.harassment}
                      onChange={handleReasonChange}
                      name="harassment"
                      color="warning"
                    />
                  }
                  label="Harassment"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reportReasons.fakeProfile}
                      onChange={handleReasonChange}
                      name="fakeProfile"
                      color="warning"
                    />
                  }
                  label="Fake Profile"
                />
              </FormGroup>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseDialog} 
                style={{ color: '#6B7280' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReport}
                variant="contained"
                disableElevation
                color="warning"
                autoFocus
                disabled={!Object.values(reportReasons).some(Boolean)}
                style={{ 
                  borderRadius: '8px',
                  textTransform: 'none'
                }}
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      
      <div className="relative">
        {/* Images in background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-gray-50">
          {hasPhotos ? (
            <div className="w-full h-full relative">
              {props.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${props.name}'s profile`}
                  className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500"
                  style={{
                    opacity: currentPhotoIndex === index ? 1 : 0,
                    transform: isHovering ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 700ms ease-out, opacity 500ms ease-out'
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
              <FaUser className="text-orange-200 text-6xl" />
            </div>
          )}

          {/* Dark overlay */}
                    <div 
            className="absolute inset-0 w-full h-full" 
            style={{ 
              background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 100%)',
            }}
          ></div>
        </div>

        {/* Main container with aspect-ratio */}
        <div className="aspect-square w-full relative">
          {/* Carousel navigation controls */}
          {hasPhotos && props.photos.length > 1 && (
            <>
              {/* Left arrow */}
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-20 opacity-0 transition-opacity duration-300"
                style={{ 
                  opacity: isHovering ? 0.8 : 0,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <IoChevronBackOutline className="w-5 h-5" />
              </button>
              
              {/* Right arrow */}
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-20 opacity-0 transition-opacity duration-300"
                style={{ 
                  opacity: isHovering ? 0.8 : 0,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <IoChevronForwardOutline className="w-5 h-5" />
              </button>
              
              {/* Dots indicator */}
              <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center gap-1.5">
                {props.photos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      currentPhotoIndex === index ? 'bg-white scale-125' : 'bg-white/60'
                    }`}
                  ></div>
                ))}
              </div>
            </>
          )}
          
          {/* Profile info - now with higher z-index */}
          <div 
            className="absolute bottom-0 left-0 right-0 p-5 z-20"
          >
            <h3 className="text-xl font-bold text-white">
              {props.name}
            </h3>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-orange-50 truncate max-w-[70%]">{props.prof}</span>
              <span 
                className="text-xs font-bold text-white px-3 py-1 rounded-full"
                style={{ 
                  background: 'linear-gradient(90deg, rgba(251,146,60,0.9) 0%, rgba(251,113,133,0.9) 100%)',
                  boxShadow: '0 2px 6px rgba(251,146,60,0.3)'
                }}
              >
                {props.ex}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 animate-pulse"></div>
          <span className="text-xs text-gray-500 font-medium">View full profile</span>
        </div>
        <div 
          className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-50"
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-orange-400"
          >
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
