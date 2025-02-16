import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  FaTrash,
} from "react-icons/fa";
import { useAuth } from "../context/authContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, storage } from "../firebase/Firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import "../styles/shimmer.css";
import Headers from "../Components/header";
import { getAuth, deleteUser } from "firebase/auth";
import { deleteDoc } from "firebase/firestore";
import { doSignOut } from "../firebase/auth";
import { auth } from "../firebase/Firebase";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import AadhaarImageManager from "../Components/AadhaarImageManager";
import TermsModal from '../Components/TermsModal'; // Adjust the import path as necessary

const ProfileForm = () => {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [adharCheck, setAdharCheck] = useState(false);
  const [payment, setpayment] = useState(false);
  const [paymentType, setPaymentType] = useState("");
  const [photoLimit, setPhotoLimit] = useState(0);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [disableFields, setDisableFields] = useState(false);
  // Add these to your existing state declarations
const [aadhaarImages, setAadhaarImages] = useState({ front: null, back: null });
const [aadhaarFiles, setAadhaarFiles] = useState({ front: null, back: null });

const [previewImage, setPreviewImage] = useState(null);
const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);


// Add this function to handle Aadhaar image upload
const handleAadhaarUpload = (event, type) => {
  const file = event.target.files[0];
  if (file) {
    // Store the file for later upload
    setAadhaarFiles(prev => ({ ...prev, [type]: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setAadhaarImages(prev => ({ ...prev, [type]: reader.result }));
    };
    reader.readAsDataURL(file);
  }
};

// Function to upload Aadhaar images to Firebase
const uploadAadhaarImages = async () => {
  const aadhaarUrls = { front: null, back: null };

  try {
    // Upload front image
    if (aadhaarFiles.front) {
      const frontRef = ref(storage, `aadhaar/${currentUser.uid}/front`);
      await uploadBytes(frontRef, aadhaarFiles.front);
      aadhaarUrls.front = await getDownloadURL(frontRef);
    }

    // Upload back image
    if (aadhaarFiles.back) {
      const backRef = ref(storage, `aadhaar/${currentUser.uid}/back`);
      await uploadBytes(backRef, aadhaarFiles.back);
      aadhaarUrls.back = await getDownloadURL(backRef);
    }

    return aadhaarUrls;
  } catch (error) {
    console.error("Error uploading Aadhaar images:", error);
    throw error;
  }
};



  const [formData, setFormData] = useState({
    // Personal Details
    name: "",
    age: "",
    height: "",
    complexion: "",
    manglic: "",
    motherTongue: "",
    subCaste: "",
    profession: "",
    state: "",
    district: "",
    pincode: "",
    specificAddress: "",
    phone: "",
    bloodGroup: "",
    email: currentUser.email,
    dateOfBirth: "",
    sex: "",
    agentRefCode: "",

    // Family Details
    caste: "",
    status: "",
    familyMembers: "",

    // Educational Details
    tenthPass: "",
    twelfthPass: "",
    employmentStatus: "",
    organization: "",
    salary: "",
    hideSalary: false,
    workAddress: "",
    sameAsPersonalAddress: false,
    currentAddress: "",

    // Aadhaar verification
    aadhaarNumber: "",
    captcha: "",
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
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [apiError, setApiError] = useState(null);

  const navigate = useNavigate();

  const handleAadhaarDelete = async (side) => {
  const confirmDelete = window.confirm(`Are you sure you want to delete the ${side} Aadhaar image?`);
  if (confirmDelete) {
    try {
      // Delete from Firebase Storage
      const imageRef = ref(storage, `aadhaar/${currentUser.uid}/${side}`);
      await deleteObject(imageRef);
      
      // Update state
      setAadhaarImages(prev => ({ ...prev, [side]: null }));
      setAadhaarFiles(prev => ({ ...prev, [side]: null }));
    } catch (error) {
      console.error(`Error deleting ${side} Aadhaar image:`, error);
      alert(`Failed to delete ${side} Aadhaar image. Please try again.`);
    }
  }
};

const handleImagePreview = (imageUrl) => {
  setPreviewImage(imageUrl);
  setImagePreviewOpen(true);
};

const handleClosePreview = () => {
  setImagePreviewOpen(false);
  setPreviewImage(null);
};

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setpayment(userData.payment || false);
          setPaymentType(userData.paymentType || "");

          // Set photo limit based on payment status and type
          if (!userData.payment) {
            setPhotoLimit(1);
          } else {
            switch (userData.paymentType) {
              case "A":
                setPhotoLimit(6);
                break;
              case "B":
                setPhotoLimit(9);
                break;
              case "C":
                setPhotoLimit(12);
                break;
              default:
                setPhotoLimit(1);
            }
          }
        }
      }
    };

    fetchPaymentInfo();
  }, [currentUser]);

  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhotoUpload = (acceptedFiles) => {
    const totalPhotos = photos.length + existingPhotos.length;
    const remainingSlots = photoLimit - totalPhotos;

    if (remainingSlots <= 0) {
      alert(
        `You have reached your photo limit of ${photoLimit}. Please upgrade your plan to upload more photos.`
      );
      return;
    }

    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    const formattedFiles = filesToAdd.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file: file,
    }));

    setPhotos([...photos, ...formattedFiles]);

    if (filesToAdd.length < acceptedFiles.length) {
      alert(
        `Only ${filesToAdd.length} photo(s) were added. You've reached your limit of ${photoLimit} photos.`
      );
    }
  };

  const uploadProfilePhoto = async () => {
    if (profilePhotoFile) {
      const storageRef = ref(storage, `profilePhotos/${currentUser.uid}`);
      await uploadBytes(storageRef, profilePhotoFile);
      const url = await getDownloadURL(storageRef);
      return url;
    }
    return null;
  };



  const calculateAge = (dob) => {
  if (!dob) return;

  const birthDate = new Date(dob);
  const today = new Date();

  if (birthDate > today) {
    alert("Future dates are not allowed!");
    return;
  }

  let ageYears = today.getFullYear() - birthDate.getFullYear();
  let ageMonths = today.getMonth() - birthDate.getMonth();
  let ageDays = today.getDate() - birthDate.getDate();

  if (ageDays < 0) {
    ageMonths--;
    ageDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (ageMonths < 0) {
    ageYears--;
    ageMonths += 12;
  }

  if (ageYears < 18 || ageYears > 60) {
    alert("Age must be between 18 and 60 years!");
    setFormData((prevData) => ({
      ...prevData,
      age: "",
      dateOfBirth: "",
    }));
    setDisableFields(true); // Disable following fields
    return;
  }

  const formattedAge = `${ageYears} years, ${ageMonths} months, ${ageDays} days`;

  setFormData((prevData) => ({
    ...prevData,
    age: formattedAge,
    dateOfBirth: dob, // Update the state
  }));
  setDisableFields(false); // Enable following fields
};


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
          setPhotos(photos.filter((_, i) => i !== photoToDelete.index));
        } else {
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handlePhotoUpload,
    accept: "image/*",
  });


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

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        deletePassword
      );
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>User not found. Please log in.</div>;
  }

  // const handleNextPage = () => {
  //   setCurrentPage(currentPage + 1);
  // };

  const handleNextPage = (e) => {
  // If there's an event, prevent default behavior
  if (e) {
    e.preventDefault();
  }
  setCurrentPage(currentPage + 1);
};

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const renderPersonalDetails = () => (
  <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl shadow-lg">
    <h2 className="text-3xl font-bold mb-8 text-center text-indigo-800 animate-pulse">
      Personal Details
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[
        {
          name: "name",
          placeholder: "Name",
          type: "text",
          pattern: "^[A-Za-z ]+$",
          onKeyDown: (e) => e.key.match(/[0-9]/) && e.preventDefault(),
          // onInput:(e) => e.target.value = e.target.value.replace(/[0-9]/g, ''),
        },
               {
          name: "dateOfBirth",
          placeholder: "Date of Birth",
          type: "date",
          max: new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0],
          onChange: (e) => calculateAge(e.target.value),
        },
        {
          name: "age",
          placeholder: "Age (Auto-calculated)",
          type: "text",
          disabled: true,
        },
        {
          name: "sex",
          placeholder: "Select Gender",
          type: "select",
          options: ["Male", "Female"],
        },
        {
  name: "height",
  placeholder: "Height",
  render: () => (
    <div className="relative">
      <div className="flex items-center gap-6 w-full p-5 bg-white rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-200/50 transition-all duration-300">
        <div className="flex-1">
          <div className="flex items-center justify-between px-4 py-2 bg-indigo-50/50 rounded-lg hover:bg-indigo-50 transition-colors duration-200">
            <input
              type="number"
              name="heightFeet"
              placeholder="Feet"
              min="0"
              max="8"
              className="w-full bg-transparent focus:outline-none text-lg font-medium text-indigo-900 placeholder:text-indigo-300"
              value={formData.heightFeet || ''}
              onChange={(e) => {
                const feet = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  heightFeet: feet,
                  height: `${feet} ft and ${prev.heightInches || 0} inches`
                }));
              }}
            />
            <span className="text-indigo-500 font-medium ml-2">ft</span>
          </div>
        </div>
        
        <div className="h-10 w-px bg-indigo-200/70" />
        
        <div className="flex-1">
          <div className="flex items-center justify-between px-4 py-2 bg-indigo-50/50 rounded-lg hover:bg-indigo-50 transition-colors duration-200">
            <input
              type="number"
              name="heightInches"
              placeholder="Inches"
              min="0"
              max="11"
              className="w-full bg-transparent focus:outline-none text-lg font-medium text-indigo-900 placeholder:text-indigo-300"
              value={formData.heightInches || ''}
              onChange={(e) => {
                const inches = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  heightInches: inches,
                  height: `${prev.heightFeet || 0} ft and ${inches} inches`
                }));
              }}
            />
            <span className="text-indigo-500 font-medium ml-2">in</span>
          </div>
        </div>
      </div>
      <label className="absolute -top-3 left-4 px-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-sm font-medium text-indigo-800 rounded-md">
        Height
      </label>
    </div>
  ),
},
          {
            name: "complexion",
            placeholder: "Complexion",
            type: "text",
            pattern: "^[A-Za-z ]+$",
            onKeyDown: (e) => e.key.match(/[0-9]/) && e.preventDefault(),
          },
          {
            name: "manglic",
            placeholder: "Manglic Status",
            type: "select",
            options: ["Yes", "No"],
          },
          {
            name: "motherTongue",
            placeholder: "Mother Tongue",
            type: "text",
            pattern: "^[A-Za-z ]+$",
            onKeyDown: (e) => e.key.match(/[0-9]/) && e.preventDefault(),
          },
          {
            name: "subCaste",
            placeholder: "Sub Caste",
            type: "text",
            pattern: "^[A-Za-z ]+$",
            onKeyDown: (e) => e.key.match(/[0-9]/) && e.preventDefault(),
          },
          {
            name: "profession",
            placeholder: "Profession",
            type: "text",
            pattern: "^[A-Za-z ]+$",
            onKeyDown: (e) => e.key.match(/[0-9]/) && e.preventDefault(),
          },
          {
            name: "phone",
            placeholder: "Phone(WhatsApp)",
            type: "tel",
            pattern: "\\d{10}",
            maxLength: "10",
            onKeyDown: (e) => e.key.match(/[a-zA-Z]/)&&
                e.key !== "Backspace" &&
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight" &&
                e.key !== "Tab" && 
                e.preventDefault(),
          },
          {
            name: "bloodGroup",
            placeholder: "Select Blood Group",
            type: "select",
            options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
          },
          {
            name: "email",
            placeholder: "Email",
            type: "email",
            disabled: true,
          },
        ].map((field) => (
        <div key={field.name} className="relative">
          {field.render ? (
            field.render()
          ) : field.type === "select" ? (
            <select
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
              required
            >
              <option value="">{field.placeholder}</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
              required
              {...(field.pattern && { pattern: field.pattern })}
              {...(field.max && { max: field.max })}
              {...(field.maxLength && { maxLength: field.maxLength })}
              {...(field.disabled && { disabled: field.disabled })}
              {...(field.onKeyDown && { onKeyDown: field.onKeyDown })}
              {...(field.onChange && { onChange: field.onChange })}
            />
          )}
          <label
            htmlFor={field.name}
            className="absolute left-4 -top-3 bg-gradient-to-r from-indigo-100 to-purple-100 px-2 text-sm text-indigo-800 font-medium"
          >
            {field.placeholder}
          </label>
        </div>
      ))}

        <div className="sm:col-span-2">
          <h3 className="text-xl font-semibold mb-4 text-indigo-800">Address Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pincode Input Field */}
            <div className="relative">
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={async (e) => {
                  const pincode = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                  setFormData({ ...formData, pincode });
            
                  if (pincode.length === 6) {
                    try {
                      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                      const data = await response.json();
                      const postOffice = data[0]?.PostOffice?.[0];
            
                      if (postOffice) {
                        setFormData((prevData) => ({
                          ...prevData,
                          state: postOffice.State,
                          district: postOffice.District,
                          region: postOffice.Region,
                        }));
                      } else {
                        // Handle case where pincode is not found
                        setFormData((prevData) => ({
                          ...prevData,
                          state: '',
                          district: '',
                          region: '',
                        }));
                      }
                    } catch (error) {
                      console.error('Error fetching pincode data:', error);
                    }
                  } else {
                    // Clear state, district, and region if pincode is not valid
                    setFormData((prevData) => ({
                      ...prevData,
                      state: '',
                      district: '',
                      region: '',
                    }));
                  }
                }}
                placeholder="Pincode"
                pattern="\d{6}"
                maxLength="6"
                className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
                required
              />
              <label className="absolute left-4 -top-3 bg-indigo-100 px-2 text-sm text-indigo-800 font-medium">
                Pincode
              </label>
            </div>
        
            {/* State Input Field */}
            <div className="relative">
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State / U.T."
                className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
                required
                readOnly
              />
              <label className="absolute left-4 -top-3 bg-indigo-100 px-2 text-sm text-indigo-800 font-medium">
                State/U.T.
              </label>
            </div>
        
            {/* District Input Field */}
            <div className="relative">
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="District"
                className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
                required
                readOnly
              />
              <label className="absolute left-4 -top-3 bg-indigo-100 px-2 text-sm text-indigo-800 font-medium">
                District
              </label>
            </div>
        
            {/* Region Input Field */}
            <div className="relative">
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="Region"
                className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
                required
                readOnly
              />
              <label className="absolute left-4 -top-3 bg-indigo-100 px-2 text-sm text-indigo-800 font-medium">
                Region
              </label>
            </div>
          </div>
        
          <div className="relative mt-4">
            <textarea
              name="specificAddress"
              value={formData.specificAddress}
              onChange={handleChange}
              placeholder="Enter your complete address"
              className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
              required
              rows={3}
            />
            <label className="absolute left-4 -top-3 bg-indigo-100 px-2 text-sm text-indigo-800 font-medium">
              Complete Address
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const checkVarificationandPhotos = () => (
  <>
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-indigo-800 animate-pulse">
        Aadhaar Verification and Photos
      </h2>

      <div className="space-y-6">
        {/* Aadhaar Number Input */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="text-lg font-medium text-indigo-800">
            Aadhaar Number:
          </label>
          <input
            type="text"
            name="aadhaarNumber"
            value={formData.aadhaarNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
              if (value.length <= 12) {
                setFormData({ ...formData, aadhaarNumber: value });
              }
            }}
            onKeyDown={(e) => {
              if (
                !(
                  e.key === 'Backspace' ||
                  e.key === 'Delete' ||
                  e.key === 'ArrowLeft' ||
                  e.key === 'ArrowRight' ||
                  e.key === 'Tab' ||
                  e.key.match(/\d/)
                )
              ) {
                e.preventDefault();
              }
            }}
            className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
            required
          />
        </div>

        {/* Aadhaar Images Upload */}
        <div>
          <h3 className="text-lg font-medium text-indigo-800 mb-2">
            Upload Aadhaar Images (Front & Back) <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Aadhaar Front Upload */}
            {/* <div className="border-dashed border-2 border-indigo-300 p-6 rounded-lg text-center hover:border-indigo-500 transition duration-200 ease-in-out">
              <input type="file" accept="image/*" onChange={(e) => handleAadhaarUpload(e, "front")} hidden id="aadhaarFront" />
              <label htmlFor="aadhaarFront" className="cursor-pointer">
                {aadhaarImages.front ? (
                  <img
                    src={aadhaarImages.front}
                    alt="Aadhaar Front"
                    className="w-full h-40 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <p className="text-indigo-600">Click to upload Aadhaar Front</p>
                )}
              </label>
            </div> */}

            {/* Aadhaar Back Upload */}
            {/* <div className="border-dashed border-2 border-indigo-300 p-6 rounded-lg text-center hover:border-indigo-500 transition duration-200 ease-in-out">
              <input type="file" accept="image/*" onChange={(e) => handleAadhaarUpload(e, "back")} hidden id="aadhaarBack" />
              <label htmlFor="aadhaarBack" className="cursor-pointer">
                {aadhaarImages.back ? (
                  <img
                    src={aadhaarImages.back}
                    alt="Aadhaar Back"
                    className="w-full h-40 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <p className="text-indigo-600">Click to upload Aadhaar Back</p>
                )}
              </label>
            </div> */}
          </div>

          <AadhaarImageManager 
  currentUser={currentUser}
  aadhaarImages={aadhaarImages}
  handleAadhaarUpload={handleAadhaarUpload}
  handleAadhaarDelete={handleAadhaarDelete}
  handleImagePreview={handleImagePreview}
  setAadhaarImages={setAadhaarImages}
/>


          {/* Aadhaar Upload Validation Message */}
          {(!aadhaarImages.front || !aadhaarImages.back) && (
            <p className="text-red-500 text-sm mt-2 text-center">
              Aadhaar front and back images are required.
            </p>
          )}
        </div>

        {/* Agent Ref Code */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="text-lg font-medium text-indigo-800">
            Agent Ref Code:
          </label>
          <input
            type="text"
            name="agentRefCode"
            value={formData.agentRefCode}
            onChange={handleChange}
            className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
          />
        </div>

        {/* Regular Photos Upload Section */}
        <p className="text-indigo-600 text-sm mb-4 text-center">
          {payment
            ? `Your first picture will be the display picture & Your current plan allows you to upload up to ${photoLimit} photos.`
            : "You can upload 1 photo that will be your display picture. Upgrade your plan to upload more!"}
        </p>

        <div
          {...getRootProps()}
          className="border-dashed border-2 border-indigo-300 p-6 rounded-lg text-center hover:border-indigo-500 transition duration-200 ease-in-out"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-indigo-700">Drop the files here...</p>
          ) : (
            <p className="text-indigo-600">
              Drag & drop some files here, or click to select files
            </p>
          )}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[...photos, ...existingPhotos].map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
                onClick={() => handleImageClick(photo.url)}
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition duration-200 ease-in-out"
                onClick={() => openDeleteDialog(photo, index)}
              >
                <FaTrash />
              </button>
            </div>
          ))}
          {isPhotosLoading && (
            <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#f49d3f]"></div>
            </div>
          )}
        </div>

        <p className="text-indigo-600 text-sm mt-4 text-center">
          {photos.length + existingPhotos.length} / {photoLimit} photos uploaded
        </p>
      </div>
    </div>
  </>
);

  const renderFamilyDetails = () => (
  <>
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-indigo-800 animate-pulse">
        Family Details
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          {
            name: "caste",
            placeholder: "Caste",
            type: "text",
            onKeyDown: (e) => {
              if (!/^[a-zA-Z\s]*$/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault();
              }
            },
          },
          {
            name: "familyMembers",
            placeholder: "Number of Family Members (Max 50)",
            type: "number",
            min: 1,
            max: 50,
            onKeyDown: (e) => {
              if (
                !/[0-9]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight" &&
                e.key !== "Tab"
              ) {
                e.preventDefault();
              }
            },
            onBlur: (e) => {
              const value = parseInt(e.target.value, 10);
              if (value < 1) e.target.value = 1;
              if (value > 50) e.target.value = 50;
            },
          },
          {
            name: "status",
            placeholder: "Marital Status",
            type: "select",
            options: [
              { value: "single", label: "Single" },
              { value: "married", label: "Married" },
              { value: "divorced", label: "Divorced" },
              { value: "widowed", label: "Widowed" },
            ],
          },
        ].map((field) => (
          <div key={field.name} className="relative">
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out appearance-none"
                required
              >
                <option value="">{field.placeholder}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
                required
                {...(field.min && { min: field.min })}
                {...(field.max && { max: field.max })}
                {...(field.onKeyDown && { onKeyDown: field.onKeyDown })}
                {...(field.onBlur && { onBlur: field.onBlur })}
              />
            )}
            <label
              htmlFor={field.name}
              className="absolute left-4 -top-3 bg-gradient-to-r from-indigo-100 to-purple-100 px-2 text-sm text-indigo-800 font-medium"
            >
              {field.placeholder}
            </label>
          </div>
        ))}
      </div>
    </div>
  </>
);

  const renderEducationalDetails = () => (
  <>
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-indigo-800 animate-pulse">
        Educational and Professional Details
      </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Checkbox Group */}
        <div className="sm:col-span-2">
          <fieldset className="border-2 border-indigo-200 rounded-lg p-4">
            <legend className="text-sm text-indigo-800 font-medium px-2">
              Highest Educational Qualifications
            </legend>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:space-x-4 space-y-2 sm:space-y-0">
              {[
                { name: "tenthPass", label: "10th Pass" },
                { name: "twelfthPass", label: "12th Pass" },
                { name: "graduate", label: "Graduate" },
                { name: "postGraduate", label: "Post Graduate" },
              ].map((field) => (
                <div key={field.name} className="flex items-center">
                  <input
                    type="radio"
                    name="highestQualification"
                    value={field.name}
                    checked={formData.highestQualification === field.name}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={field.name} className="ml-2 text-indigo-800">
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      
        {/* Employment Status */}
        <div className="relative">
          <select
            name="employmentStatus"
            value={formData.employmentStatus}
            onChange={handleChange}
            className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out appearance-none"
            required
          >
            <option value="">Employment Status</option>
            {[
              { value: "employed", label: "Employed" },
              { value: "unemployed", label: "Unemployed" },
              { value: "student", label: "Student" },
            ].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label
            htmlFor="employmentStatus"
            className="absolute left-4 -top-3 bg-gradient-to-r from-indigo-100 to-blue-100 px-2 text-sm text-indigo-800 font-medium"
          >
            Employment Status
          </label>
        </div>
      
        {/* Conditional Fields for Employed Status */}
        {formData.employmentStatus === "employed" && (
          <>
            {[
              {
                name: "organization",
                placeholder: "Organization",
                type: "text",
              },
              { name: "salary", placeholder: "Salary", type: "number" },
            ].map((field) => (
              <div key={field.name} className="relative">
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
                  required
                />
                <label
                  htmlFor={field.name}
                  className="absolute left-4 -top-3 bg-gradient-to-r from-indigo-100 to-blue-100 px-2 text-sm text-indigo-800 font-medium"
                >
                  {field.placeholder}
                </label>
              </div>
            ))}
      
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="hideSalary"
                checked={formData.hideSalary}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="hideSalary" className="text-indigo-800">
                Hide Salary
              </label>
            </div>
      
            <div className="sm:col-span-2 relative">
              <textarea
                name="workAddress"
                value={formData.workAddress}
                onChange={handleChange}
                placeholder="Work Address"
                className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
                required
                rows={3}
              />
              <label
                htmlFor="workAddress"
                className="absolute left-4 -top-3 bg-gradient-to-r from-indigo-100 to-blue-100 px-2 text-sm text-indigo-800 font-medium"
              >
                Work Address
              </label>
            </div>
      
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="sameAsPersonalAddress"
                checked={formData.sameAsPersonalAddress}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="sameAsPersonalAddress" className="text-indigo-800">
                Same as Permanent Address
              </label>
            </div>
      
            {!formData.sameAsPersonalAddress && (
              <div className="sm:col-span-2 relative">
                <textarea
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleChange}
                  placeholder="Current Address"
                  className="w-full p-4 bg-white rounded-lg shadow-inner border-2 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition duration-200 ease-in-out"
                  required
                  rows={3}
                />
                <label
                  htmlFor="currentAddress"
                  className="absolute left-4 -top-3 bg-gradient-to-r from-indigo-100 to-blue-100 px-2 text-sm text-indigo-800 font-medium"
                >
                  Current Address
                </label>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </>
);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return renderPersonalDetails();
      case 2:
        return renderFamilyDetails();
      case 3:
        return renderEducationalDetails();
      case 4:
        return checkVarificationandPhotos();
      default:
        return null;
    }
  };

// Add this separate function to handle page navigation

const handleSubmit = (e) => {
  e.preventDefault();
  
  // If not on the last page, just move to next page without any confirmation
  if (currentPage < 4) {
    handleNextPage();
    return;
  }

  // Open the TermsModal instead of submitting directly
  setIsTermsModalOpen(true);
};

const handleConfirmSubmit = async () => {
  setIsTermsModalOpen(false);
  setIsSubmitting(true);
  try {
    // Upload regular photos
    const newPhotoURLs = await Promise.all(photos.map(uploadPhoto));
    const allPhotoURLs = [
      ...existingPhotos.map((photo) => photo.url),
      ...newPhotoURLs,
    ];

    // Upload Aadhaar images
    const aadhaarUrls = await uploadAadhaarImages();

    // Upload profile photo if exists
    const profilePhotoURL = await uploadProfilePhoto();

    // Save all data to Firestore
    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(
      userRef,
      {
        ...formData,
        photos: allPhotoURLs,
        profilePhoto: profilePhotoURL,
        aadhaarImages: aadhaarUrls,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    setProfileUpdated(true);
  } catch (err) {
    console.error("Error submitting profile:", err);
    alert("Error submitting profile");
  } finally {
    setIsSubmitting(false);
  }
};

const handleDeny = () => {
  setIsTermsModalOpen(false);
  // Handle the denial action if necessary
};

  return (
    <>
      <Headers />
      <div className="min-h-screen flex items-center justify-center bg-orange-200 py-12 mt-14">
        <div className="bg-white p-6 rounded-2xl shadow-md w-4/5 neumorphic-card">
          <div className="mb-4 flex justify-between">
            <div className="w-1/3 h-2 bg-blue-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(currentPage / 4) * 100}%` }}
              ></div>
            </div>
            <span>Page {currentPage} of 4</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderCurrentPage()}
            <div className="flex justify-end mt-4">
                {currentPage > 1 && (
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg neumorphic-button mr-2"
                  >
                    Previous
                  </button>
                )}
                {currentPage < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextPage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg neumorphic-button"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={`px-4 py-2 bg-green-500 text-white rounded-lg neumorphic-button ${
                      isSubmitting ? "opacity-50" : ""
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Profile"}
                  </button>
                )}
              </div>
          </form>
          <TermsModal
      isOpen={isTermsModalOpen}
      onClose={() => setIsTermsModalOpen(false)}
      onConfirm={handleConfirmSubmit}
      onDeny={handleDeny}
    />
        </div>
      </div>
      <Dialog
        open={profileUpdated}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Profile Updated</DialogTitle>
        <DialogContent dividers>
          <p>
            Your profile has been updated successfully!will be visible to others
            after verified by Admin
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close Profile
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={imagePreviewOpen} 
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-auto"
            />
          )}
        </DialogContent>
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
            Are you sure you want to delete your account? This action cannot be
            undone.
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
            <img src={selectedImage} alt="Selected" className="w-full h-auto" />
          </DialogContent>
        </Dialog>
        
      )}
    </>
  );
};

export default ProfileForm;