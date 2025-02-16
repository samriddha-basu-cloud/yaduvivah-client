import React, { useEffect } from 'react';
import { FaTrash, FaEye } from 'react-icons/fa';
import { Dialog, DialogContent } from '@mui/material';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/Firebase';

const AadhaarImageManager = ({
  currentUser,
  aadhaarImages,
  handleAadhaarUpload,
  handleAadhaarDelete,
  handleImagePreview,
  setAadhaarImages
}) => {
  useEffect(() => {
    const fetchAadhaarImages = async () => {
      try {
        const sides = ['front', 'back'];
        const urls = {};

        for (const side of sides) {
          const imageRef = ref(storage, `aadhaar/${currentUser.uid}/${side}`);
          try {
            const url = await getDownloadURL(imageRef);
            urls[side] = url;
          } catch (error) {
            // Image doesn't exist for this side, skip it
            console.log(`No ${side} image found`);
          }
        }

        // Only update state if we found any images
        if (Object.keys(urls).length > 0) {
          setAadhaarImages(prev => ({
            ...prev,
            ...urls
          }));
        }
      } catch (error) {
        console.error("Error fetching Aadhaar images:", error);
      }
    };

    if (currentUser?.uid) {
      fetchAadhaarImages();
    }
  }, [currentUser?.uid, setAadhaarImages]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {['front', 'back'].map((side) => (
        <div 
          key={side}
          className="relative border-dashed border-2 border-indigo-300 p-6 rounded-lg text-center hover:border-indigo-500 transition duration-200 ease-in-out group"
        >
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => handleAadhaarUpload(e, side)} 
            hidden 
            id={`aadhaar${side.charAt(0).toUpperCase() + side.slice(1)}`} 
          />
          <label 
            htmlFor={`aadhaar${side.charAt(0).toUpperCase() + side.slice(1)}`} 
            className="cursor-pointer block"
          >
            {aadhaarImages[side] ? (
              <div className="relative">
                <img
                  src={aadhaarImages[side]}
                  alt={`Aadhaar ${side}`}
                  className="w-full h-40 object-cover rounded-lg shadow-md"
                />
                <div className="absolute top-2 right-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleImagePreview(aadhaarImages[side]);
                    }}
                    className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition duration-200"
                  >
                    <FaEye />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAadhaarDelete(side);
                    }}
                    className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-indigo-600">Click to upload Aadhaar {side}</p>
            )}
          </label>
        </div>
      ))}
    </div>
  );
};

export default AadhaarImageManager;