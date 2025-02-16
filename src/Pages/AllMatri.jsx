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
  <div className="border rounded-lg p-4 max-w-sm w-full mx-auto">
    <div className="animate-pulse flex flex-col space-y-4">
      <div className="rounded-full bg-slate-200 h-40 w-40 mx-auto"></div>
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
);

const GlassSlider = styled(Slider)(({ theme }) => ({
  color: "#fdba74",
  height: 8,
  "& .MuiSlider-track": {
    border: "none",
    backgroundColor: "#fdba74",
  },
  "& .MuiSlider-thumb": {
    height: 24,
    width: 24,
    backgroundColor: "#fdba74",
    border: "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&:before": {
      display: "none",
    },
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#fdba74",
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
    backgroundColor: "#fdba74",
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
    const age = item.age ? parseInt(item.age) : 0;
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
      <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100">
        <Headers />
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-between items-center mb-8">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
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
            <button
              onClick={toggleFilterVisibility}
              className="mt-24 bg-[#F39C3E] hover:bg-[#e08b2d] text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            >
              {isFilterVisible ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {isFilterVisible && (
            <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <input
                  type="text"
                  name="language"
                  placeholder="Language"
                  className="border border-indigo-200 p-2 rounded-lg w-full bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-[#F39C3E]"
                  value={searchTerms.language}
                  onChange={handleSearchChange}
                />
                <input
                  type="text"
                  name="prof"
                  placeholder="Profession"
                  className="border border-indigo-200 p-2 rounded-lg w-full bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-[#F39C3E]"
                  value={searchTerms.prof}
                  onChange={handleSearchChange}
                />
                <input
                  type="text"
                  name="region"
                  placeholder="Region"
                  className="border border-indigo-200 p-2 rounded-lg w-full bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-[#F39C3E]"
                  value={searchTerms.region}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="w-full px-4">
                <h3 className="text-lg font-semibold mb-2 text-indigo-800">
                  Age Range: {ageRange.low} - {ageRange.high}
                </h3>
                <GlassSlider
                  getAriaLabel={() => "Age range slider"}
                  value={[ageRange.low, ageRange.high]}
                  onChange={handleAgeRangeChange}
                  valueLabelDisplay="auto"
                  min={18}
                  max={60}
                  marks={[
                    { value: 18, label: "18" },
                    { value: 60, label: "60" },
                  ]}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            ) : !loggedUser ? (
              <div className="col-span-full flex flex-col items-center justify-center h-64 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl">
                <div className="text-center text-indigo-800 font-semibold mb-4">
                  Log in to View Profiles
                </div>
                <button
                  onClick={handleLoginRedirect}
                  className="bg-[#F39C3E] hover:bg-[#e08b2d] text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
                >
                  Go to Login
                </button>
              </div>
            ) : !payment ? (
              <div className="col-span-full flex flex-col items-center justify-center h-64 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl">
                <div className="text-center text-indigo-800 font-semibold mb-4">
                  Upgrade your account to view profiles
                </div>
                <button
                  onClick={handleUpgradeRedirect}
                  className="bg-[#F39C3E] hover:bg-[#e08b2d] text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
                >
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
                    number={data.number}
                    email={data.email}
                    motherTongue={data.motherTongue}
                    description={data.description}
                    status={data.status}
                    childrenFromPreviousMarriage={data.childrenFromPreviousMarriage}
                    region={data.region}
                    showEmail={data.showEmail}
                    showNumber={data.showNumber}
                    showStatus={data.showStatus}
                    height={data.height}
                  />
                ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-64 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl">
                <div className="text-center text-indigo-800 font-semibold">
                  No profiles found
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