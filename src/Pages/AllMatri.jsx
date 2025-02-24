import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../Components/Card";
import Footer from "../Components/Footer";
import Headers from "../Components/header";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import CircularProgress from "@mui/material/CircularProgress";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import VerificationPending from "../Components/VerificationPending";

const SkeletonCard = () => (
  <div className="border-2 border-indigo-100 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-lg bg-white bg-opacity-90 transition-all duration-300 hover:shadow-xl">
    <div className="animate-pulse flex flex-col space-y-5">
      <div className="rounded-full bg-indigo-100 h-48 w-48 mx-auto"></div>
      <div className="flex-1 space-y-4 py-2">
        <div className="h-5 bg-indigo-100 rounded-full w-3/4 mx-auto"></div>
        <div className="space-y-3">
          <div className="h-4 bg-indigo-100 rounded-full"></div>
          <div className="h-4 bg-indigo-100 rounded-full w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
);

const CustomSlider = styled(Slider)(({ theme }) => ({
  color: "#6366F1",
  height: 10,
  "& .MuiSlider-track": {
    border: "none",
    backgroundColor: "#818CF8",
    backgroundImage: "linear-gradient(to right, #6366F1, #A78BFA)",
    boxShadow: "0 2px 4px rgba(99, 102, 241, 0.3)",
  },
  "& .MuiSlider-thumb": {
    height: 26,
    width: 26,
    backgroundColor: "#fff",
    boxShadow: "0 3px 7px rgba(0, 0, 0, 0.2)",
    border: "2px solid #6366F1",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "0 0 0 8px rgba(99, 102, 241, 0.2)",
    },
    "&:before": {
      display: "none",
    },
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.3,
    fontSize: 13,
    fontWeight: 600,
    background: "unset",
    padding: 0,
    width: 34,
    height: 34,
    borderRadius: "50%",
    backgroundColor: "#6366F1",
    backgroundImage: "linear-gradient(to bottom right, #6366F1, #A78BFA)",
    boxShadow: "0 2px 12px rgba(99, 102, 241, 0.3)",
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&:before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
  "& .MuiSlider-rail": {
    opacity: 0.5,
    backgroundColor: "#C7D2FE",
    height: 10,
    borderRadius: 5,
  },
  "& .MuiSlider-mark": {
    backgroundColor: "#6366F1",
    height: 10,
    width: 3,
    marginTop: -3,
  },
  "& .MuiSlider-markLabel": {
    color: "#4F46E5",
    fontWeight: 600,
  },
}));

export default function Matri() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [loggedUserGender, setLoggedUserGender] = useState(null);
  const [payment, setpayment] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  const [searchTerms, setSearchTerms] = useState({
    region: "",
    language: "",
    prof: "",
  });
  const [user, setUser] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ageRange, setAgeRange] = useState({ low: 18, high: 60 });
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const handleAgeRangeChange = (event, newValue) => {
    setAgeRange({
      low: newValue[0],
      high: newValue[1],
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    const db = getFirestore();
    const usersCollection = collection(db, "users");

    try {
      const querySnapshot = await getDocs(usersCollection);
      const userData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUser(userData);

      const loggedUserData = userData.find((user) => user.uid === loggedUser);
      const loggedUserGender = loggedUserData ? loggedUserData.sex : null;
      setLoggedUserGender(loggedUserGender);

      const oppositeGenderUsers = userData.filter(
        (user) => user.sex !== loggedUserGender
      );
      setFilteredData(oppositeGenderUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchTerms((prevState) => ({ ...prevState, [name]: value }));
  };

  const filterData = () => {
    const filtered = user.filter((item) => {
      const professionLower = item.profession ? item.profession.toLowerCase() : "";
      const mothertongueLower = item.motherTongue ? item.motherTongue.toLowerCase() : "";
      const regionLower = item.region ? item.region.toLowerCase() : "";
      const age = item.age ? parseInt(item.age.split(",")[0]) : 0; // Extract age in years
      const oppositeGender = loggedUserGender.toLowerCase() === "male" ? "female" : "male";

      return (
        professionLower.includes(searchTerms.prof.toLowerCase()) &&
        mothertongueLower.includes(searchTerms.language.toLowerCase()) &&
        regionLower.includes(searchTerms.region.toLowerCase()) &&
        age >= ageRange.low &&
        age <= ageRange.high &&
        item.sex.toLowerCase() === oppositeGender // Normalize here
      );
    });

    setFilteredData(filtered);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedUser(user.uid);
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (!userData.verifiedByAdmin) {
            // Instead of navigating immediately, show the VerificationPending component
            setVerificationPending(true);
            return; // stop further processing
          }
          setpayment(userData.payment);
        }
      } else {
        console.log("User is signed out");
        setLoggedUser(null);
        setpayment(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loggedUser && payment) {
      loadData();
    }
  }, [loggedUser, payment]);

  useEffect(() => {
    if (user.length > 0) {
      filterData();
    }
  }, [user, searchTerms, ageRange, loggedUserGender]);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  if (verificationPending) {
    return <VerificationPending />;
  }

  const handleUpgradeRedirect = () => {
    navigate("/payment-details");
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Headers />
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-between items-center mb-10 px-2">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-indigo-200 hover:shadow-xl flex items-center gap-2"
              onClick={() => window.history.back()}
            >
              <svg
                className="w-5 h-5"
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
              <span>Back</span>
            </button>
            <button
              onClick={toggleFilterVisibility}
              className="mt-24 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-purple-200 hover:shadow-xl flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                ></path>
              </svg>
              <span>{isFilterVisible ? "Hide Filters" : "Show Filters"}</span>
            </button>
          </div>

          {isFilterVisible && (
            <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl p-8 mb-10 shadow-xl border border-indigo-100 transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-2xl font-bold text-indigo-800 mb-6 text-center">Find Your Perfect Match</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v4m1.042 9.256A9.96 9.96 0 0013 18c2.21 0 4.225-.72 5.87-1.927m-5.87-7.927A9.96 9.96 0 0113 6c-2.21 0-4.225.72-5.87 1.927" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="language"
                    placeholder="Mother Tongue"
                    className="pl-10 border-2 border-indigo-200 p-3 rounded-xl w-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    value={searchTerms.language}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="prof"
                    placeholder="Profession"
                    className="pl-10 border-2 border-indigo-200 p-3 rounded-xl w-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    value={searchTerms.prof}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="region"
                    placeholder="Region"
                    className="pl-10 border-2 border-indigo-200 p-3 rounded-xl w-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                    value={searchTerms.region}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <div className="w-full px-4 py-2">
                <h3 className="text-lg font-semibold mb-3 text-indigo-800 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Age Range: <span className="ml-2 text-purple-600 font-bold">{ageRange.low} - {ageRange.high} years</span>
                </h3>
                <div className="px-4 py-2">
                  <CustomSlider
                    getAriaLabel={() => "Age range slider"}
                    value={[ageRange.low, ageRange.high]}
                    onChange={handleAgeRangeChange}
                    valueLabelDisplay="auto"
                    min={18}
                    max={60}
                    marks={[
                      { value: 18, label: "18" },
                      { value: 30, label: "30" },
                      { value: 45, label: "45" },
                      { value: 60, label: "60" },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            ) : !loggedUser ? (
              <div className="col-span-full flex flex-col items-center justify-center h-80 bg-white bg-opacity-95 backdrop-filter backdrop-blur-lg rounded-3xl shadow-xl border border-indigo-100 p-8 transition-all duration-300 hover:shadow-2xl">
                <svg className="w-20 h-20 text-indigo-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <div className="text-center text-indigo-800 font-semibold text-xl mb-6">
                  Log in to View Profiles
                </div>
                <button
                  onClick={handleLoginRedirect}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  Go to Login
                </button>
              </div>
            ) : !payment ? (
              <div className="col-span-full flex flex-col items-center justify-center h-80 bg-white bg-opacity-95 backdrop-filter backdrop-blur-lg rounded-3xl shadow-xl border border-indigo-100 p-8 transition-all duration-300 hover:shadow-2xl">
                <svg className="w-20 h-20 text-indigo-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="text-center text-indigo-800 font-semibold text-xl mb-6">
                  Upgrade your account to view profiles
                </div>
                <button
                  onClick={handleUpgradeRedirect}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                  Upgrade Account
                </button>
              </div>
            ) : filteredData.length > 0 ? (
              filteredData
                .filter(
                  (data) =>
                    loggedUser !== data.uid && data.name && data.verifiedByAdmin
                )
                .map((data) => (
                  <Card
                    key={data.id}
                    name={data.name}
                    sex={data.sex}
                    prof={data.profession}
                    photos={data.photos}
                    uid={data.uid}
                    age={data.age}
                    number={data.phone}
                    email={data.email}
                    motherTongue={data.motherTongue}
                    description={data.description}
                    status={data.status}
                    region={data.region}
                    showEmail={data.showEmail}
                    showNumber={data.showNumber}
                    showStatus={data.showStatus}
                    height={data.height}
                    bloodGroup={data.bloodGroup}
                    caste={data.caste}
                    subCaste={data.subCaste}
                    complexion={data.complexion}
                    manglic={data.manglic}
                    familyMembers={data.familyMembers}
                    employmentStatus={data.employmentStatus}
                    highestQualification={data.highestQualification}
                    district={data.district}
                    state={data.state}
                    pincode={data.pincode}
                    dateOfBirth={data.dateOfBirth}
                  />
                ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-64 bg-white bg-opacity-95 backdrop-filter backdrop-blur-lg rounded-3xl shadow-xl border border-indigo-100 p-8 transition-all duration-300 hover:shadow-2xl">
                <div className="text-center">
                  <svg className="w-16 h-16 text-indigo-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="text-center text-indigo-800 font-semibold text-xl">
                    No profiles match your criteria
                  </div>
                  <p className="text-gray-500 mt-2">Try adjusting your filters to see more results</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
