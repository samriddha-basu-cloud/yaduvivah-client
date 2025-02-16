import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaCheckCircle, FaTimesCircle, FaVolumeUp, FaEye, FaTrash } from "react-icons/fa";
import { useAuth } from "../context/authContext";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, storage } from "../firebase/Firebase";
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import "../styles/shimmer.css";
import Headers from "../Components/header";
import { getAuth, deleteUser } from "firebase/auth";
import { deleteDoc } from "firebase/firestore";
import { doSignOut } from "../firebase/auth";
import { auth } from "../firebase/Firebase";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";



const ProfileForm = () => {
  const { currentUser } = useAuth();
  const [adharCheck, setAdharCheck] = useState(false);
  const [formData, setFormData] = useState({
    uid: currentUser.uid,
    name: "",
    age: "",
    number: "",
    email: currentUser.email,
    religion: "",
    motherTongue: "",
    sex: "",
    profession: "",
    description: "",
    aadhaarNumber: "",
    captcha: "",
    status: "",
    childrenFromPreviousMarriage: "",
    region: "",
    showEmail: false,
    showNumber: false,
    showStatus: false,
  });
  const [photos, setPhotos] = useState([]);
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaAudio, setCaptchaAudio] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [isPhotosLoading, setIsPhotosLoading] = useState(true);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletePassword, setDeletePassword] = useState("");

  const navigate = useNavigate();

  // Validation function for alphabet-only fields
  const isAlphabetOnly = (value) => {
    // Allow letters, spaces, and periods (for initials)
    return /^[A-Za-z\s.]*$/.test(value);
  };

  // Validation function for number-only fields
  const isNumberOnly = (value) => {
    return /^\d*$/.test(value);
  };

  // Validation function for phone numbers (10 digits)
  const isValidPhoneNumber = (value) => {
    return /^\d{0,10}$/.test(value);
  };

  // Enhanced handleChange function with validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox fields separately
    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
      return;
    }

    // Validation for alphabet-only fields
    if (["name", "sex", "motherTongue", "profession"].includes(name)) {
      if (!isAlphabetOnly(value)) {
        return; // Don't update if validation fails
      }
    }

    // Validation for number-only fields
    if (name === "age") {
      if (!isNumberOnly(value) || parseInt(value) > 100) {
        return; // Don't update if validation fails or age > 100
      }
    }

    // Special validation for phone number
    if (name === "number") {
      if (!isValidPhoneNumber(value)) {
        return; // Don't update if validation fails
      }
    }

    // Update form data if validation passes
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handlePhotoUpload = (acceptedFiles) => {
    const formattedFiles = acceptedFiles.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file: file,
    }));

    setPhotos([...photos, ...formattedFiles]);
  };

  const generateCaptcha = () => {
    fetch("http://127.0.0.1:8008/api/generate-captcha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCaptchaImage("data:image/jpeg;base64," + data.imageBase64);
        setCaptchaAudio("data:audio/mpeg;base64," + data.audioBase64);
        setTransactionId(data.transactionId);
      })
      .catch((error) => console.error("Error:", error));
  };

  const verifyAadhaar = () => {
    const data = {
      aadhaar_number: formData.aadhaarNumber,
      captcha: formData.captcha,
      transaction_id: transactionId,
    };

    fetch("http://127.0.0.1:8008/api/verify-aadhaar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusMessage.includes("doesn't") || data.status === "Error") {
          setVerificationStatus(false);
          setAdharCheck(false);
        } else {
          setVerificationStatus(true);
          setAdharCheck(true);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setVerificationStatus(false);
        setAdharCheck(false);
      });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setFormData((prevData) => ({
              ...prevData,
              ...userDoc.data(),
            }));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
      setIsLoading(false);
    };

    fetchUserProfile();
  }, [currentUser]);

  useEffect(() => {
    fetchExistingPhotos();
  }, [currentUser.uid]);

  const fetchExistingPhotos = async () => {
    setIsPhotosLoading(true);
    const storageRef = ref(storage, `photos/${currentUser.uid}`);
    try {
      const result = await listAll(storageRef);
      const urlPromises = result.items.map((imageRef) =>
        getDownloadURL(imageRef)
      );
      const urls = await Promise.all(urlPromises);
      setExistingPhotos(
        urls.map((url) => ({
          url: url,
        }))
      );
      // Set the first photo as the profile photo
      if (urls.length > 0) {
        setProfilePhoto(urls[0]);
      }
    } catch (error) {
      console.error("Error fetching existing photos:", error);
    } finally {
      setIsPhotosLoading(false);
    }
  };

  const openDeleteDialog = (photo, index) => {
    setPhotoToDelete({
      photo,
      index,
    });
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPhotoToDelete(null);
  };

  const deletePhoto = async () => {
    if (photoToDelete) {
      try {
        if (photoToDelete.photo.file) {
          // This is a newly uploaded photo
          setPhotos(photos.filter((_, i) => i !== photoToDelete.index));
        } else {
          // This is an existing photo from Firebase Storage
          const photoRef = ref(storage, photoToDelete.photo.url);
          await deleteObject(photoRef);
          setExistingPhotos(
            existingPhotos.filter((_, i) => i !== photoToDelete.index)
          );
        }
      } catch (error) {
        console.error("Error deleting photo:", error);
        alert("Failed to delete photo. Please try again.");
      }
    }
    closeDeleteDialog();
  };

  const uploadPhoto = async (photo) => {
    const storageRef = ref(storage, `photos/${currentUser.uid}/${photo.name}`);
    await uploadBytes(storageRef, photo.file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adharCheck) {
      alert("Please verify your Aadhaar before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload only new photos and get their URLs
      const newPhotoURLs = await Promise.all(photos.map(uploadPhoto));

      // Combine existing photo URLs with new photo URLs
      const allPhotoURLs = [
        ...existingPhotos.map((photo) => photo.url),
        ...newPhotoURLs,
      ];

      // Save user data in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        {
          uid: formData.uid,
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          number: formData.number,
          email: formData.email,
          religion: formData.religion,
          motherTongue: formData.motherTongue,
          sex: formData.sex,
          profession: formData.profession,
          description: formData.description,
          adharVarified: adharCheck,
          status: formData.status,
          childrenFromPreviousMarriage: formData.childrenFromPreviousMarriage,
          region: formData.region,
          photos: allPhotoURLs,
          showEmail: formData.showEmail,
          showNumber: formData.showNumber,
          showStatus: formData.showStatus,
          updatedAt: new Date(),
        },
        {
          merge: true,
        }
      );

      setProfileUpdated(true);
    } catch (err) {
      console.error("Error submitting profile:", err);
      alert("Error submitting profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handlePhotoUpload,
    accept: "image/*",
  });

  const playCaptchaAudio = () => {
    const audio = new Audio(captchaAudio);
    audio.play();
  };

  const handleDialogClose = () => {
    setProfileUpdated(false);
    navigate("/");
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setOpenImageModal(true);
  };

  const handleCloseImageModal = () => {
    setOpenImageModal(false);
    setSelectedImage("");
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

      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        deletePassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", currentUser.uid));

      // Delete user from Firebase Authentication
      await deleteUser(auth.currentUser);

      // Close the dialog and navigate
      closeDeleteAccountDialog();
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      // Clear the password state
      setDeletePassword("");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>User not found. Please log in.</div>;
  }

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  return (
    <>
      <Headers />
      <button
        className="fixed top-12 left-0 mt-4 ml-4 bg-cyan-600 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => window.history.back()}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </button>

      <div
        div
        className="min-h-screen flex items-center justify-center bg-orange-200 py-12 mt-14"
      >
        <div className="bg-white p-6 rounded-2xl shadow-md w-4/5 neumorphic-card">
          <h1 className="text-2xl font-bold mb-4 text-center">Profile Form</h1>
          {profilePhoto && (
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full shadow-[inset_5px_5px_10px_#d4d4d4,inset_-5px_-5px_10px_#ffffff] p-1">
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2"
                  // style = {
                  //   {
                  //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                  //   }
                  // }
                />
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="w-full md:w-1/2">
                <label className="block font-medium">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input bg-white"
                  // style = {
                  //   {
                  //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                  //   }
                  // }
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block font-medium">Age:</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                  // style = {
                  //   {
                  //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                  //   }
                  // }
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="w-full md:w-1/2">
                <label className="block font-medium">Number:</label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                  // style = {
                  //   {
                  //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                  //   }
                  // }
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block font-medium">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                  // style = {
                  //   {
                  //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                  //   }
                  // }
                  required
                  disabled
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="w-full md:w-1/2">
                <label className="block font-medium">Religion:</label>
                <input
                  type="text"
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                  // style = {
                  //   {
                  //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                  //   }
                  // }
                  required
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block font-medium">Mother Tongue:</label>
                <input
                  type="text"
                  name="motherTongue"
                  value={formData.motherTongue}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                  // style = {
                  //   {
                  //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                  //   }
                  // }
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="w-full md:w-1/2">
                <label className="block font-medium">Sex:</label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                  // style = {
                  //   {
                  //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                  //   }
                  // }
                  required
                >
                  <option value="">Select Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="w-full md:w-1/2">
                <label className="block font-medium">Profession:</label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                  // style = {
                  //   {
                  //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                  //   }
                  // }
                  required
                />
              </div>
            </div>
            <div>
              <label className="block font-medium">Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                // style = {
                //   {
                //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                //   }
                // }
                required
              />
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="w-full md:w-1/2">
                <label className="block font-medium">Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
              <div className="w-full md:w-1/2">
                <label className="block font-medium">Region:</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                  required
                >
                  <option value="">Select Region</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.status === "divorced" && (
              <div>
                <label className="block font-medium">
                  Children from Previous Marriage:
                </label>
                <input
                  type="number"
                  name="childrenFromPreviousMarriage"
                  value={formData.childrenFromPreviousMarriage}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                  min="0"
                />
              </div>
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="showEmail"
                  checked={formData.showEmail}
                  onChange={handleChange}
                  className="mr-2"
                />
                Show email on profile
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="showNumber"
                  checked={formData.showNumber}
                  onChange={handleChange}
                  className="mr-2"
                />
                Show phone number on profile
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="showStatus"
                  checked={formData.showStatus}
                  onChange={handleChange}
                  className="mr-2"
                />
                Show status on profile
              </label>
            </div>
            <div className="flex items-center gap-4">
              <label className="block font-medium">Aadhaar Number:</label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                // style = {
                //   {
                //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                //   }
                // }
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="block font-medium">Captcha:</label>
              <img
                src={captchaImage}
                alt="Captcha"
                className="w-32 h-12 neumorphic-image"
              />
              <button
                type="button"
                onClick={playCaptchaAudio}
                className="px-4 py-2 rounded-lg neumorphic-button"
              >
                <FaVolumeUp className="text-xl" />
              </button>
              <input
                type="text"
                name="captcha"
                value={formData.captcha}
                onChange={handleChange}
                className="w-full p-2 rounded-lg border-none shadow-lg neumorphic-input"
                // style = {
                //   {
                //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
                //   }
                // }
                required
              />
              <button
                type="button"
                onClick={generateCaptcha}
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 neumorphic-button"
              >
                Refresh
              </button>
            </div>
            <button
              type="button"
              onClick={verifyAadhaar}
              className="w-full py-2 rounded-lg bg-blue-500 text-white neumorphic-button-submit"
            >
              Verify Aadhaar
            </button>
            {verificationStatus !== null && (
              <p
                className={`mt-2 text-center ${
                  verificationStatus ? "text-green-600" : "text-red-600"
                }`}
              >
                {verificationStatus
                  ? "Aadhaar verified successfully"
                  : "Aadhaar verification failed"}
              </p>
            )}
            <div
              {...getRootProps()}
              className="border-dashed border-2 p-4 rounded-lg text-center neumorphic-drag"
              // style = {
              //   {
              //     boxShadow: '5px 5px 10px #d97706, -5px -5px 10px #fcd34d',
              //   }
              // }
            >
              <label className="block font-medium">Upload Photos:</label>
              <p className="text-gray-500 text-sm">
                The first picture will be the profile photo
              </p>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here...</p>
              ) : (
                <p>Drag & drop some files here, or click to select files</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg neumorphic-image"
                    onClick={() => handleImageClick(photo.url)}
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 neumorphic-delete"
                    onClick={() => openDeleteDialog(photo, index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              {existingPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg neumorphic-image"
                    onClick={() => handleImageClick(photo.url)}
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 neumorphic-delete"
                    onClick={() => openDeleteDialog(photo, index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              {isPhotosLoading && (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center shimmer-animation">
                  Loading photos...
                </div>
              )}
            </div>
            <button
              type="submit"
              className={`w-full py-2 rounded-lg bg-blue-500 text-white neumorphic-button-submit ${
                isSubmitting ? "opacity-50" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={openDeleteAccountDialog}
              className="w-full py-2 mt-4 rounded-lg bg-red-500 text-white neumorphic-button-delete"
            >
              Delete Account
            </button>
          </form>
        </div>

        <Dialog
          open={profileUpdated}
          onClose={handleDialogClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Profile Updated</DialogTitle>
          <DialogContent dividers>
            <p>Your profile has been updated successfully!</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Close Profile
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Delete Photo</DialogTitle>
          <DialogContent dividers>
            <p>Are you sure you want to delete this photo?</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={deletePhoto} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteAccountDialogOpen}
          onClose={closeDeleteAccountDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent dividers>
            <p>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <p>Please enter your password to confirm account deletion:</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full p-2 mt-2 rounded-lg border border-gray-300"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAndResetDeleteDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteAccount} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {selectedImage && (
          <Dialog open={openImageModal} onClose={handleCloseImageModal}>
            <DialogContent>
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-auto"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default ProfileForm;