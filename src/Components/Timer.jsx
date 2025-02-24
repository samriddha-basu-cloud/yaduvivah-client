import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Clock } from "lucide-react";

function Timer() {
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [timerExpired, setTimerExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAnalog, setShowAnalog] = useState(false);
  const [timeValues, setTimeValues] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    let timerInterval;

    const fetchCreatedAtAndStartTimer = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserLoggedIn(true);
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const data = userDocSnap.data();
              if (data.createdAt) {
                const createdAtDate = data.createdAt.toDate
                  ? data.createdAt.toDate()
                  : new Date(data.createdAt);
                const expiryTime = createdAtDate.getTime() + 24 * 60 * 60 * 1000;

                timerInterval = setInterval(() => {
                  const now = Date.now();
                  const diff = expiryTime - now;
                  if (diff <= 0) {
                    setTimerExpired(true);
                    clearInterval(timerInterval);
                  } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeValues({ hours, minutes, seconds });
                    setTimeLeft(
                      `${hours.toString().padStart(2, "0")}:${minutes
                        .toString()
                        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                    );
                  }
                }, 1000);
              }
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        } else {
          setUserLoggedIn(false);
        }
        setLoading(false);
      });
    };

    fetchCreatedAtAndStartTimer();

    return () => clearInterval(timerInterval);
  }, [auth, db]);

  if (loading || timerExpired || !userLoggedIn) return null;

  return (
    <div className="flex justify-center items-center">
      <div className="relative group sm:fixed sm:bottom-0 sm:w-full sm:px-4 sm:pb-4">
        <div className="bg-gradient-to-br from-white/10 to-white/30 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 mt-24 sm:mt-0 border border-white/20">
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={() => setShowAnalog(!showAnalog)}
              className="absolute top-2 right-2 text-white/70 hover:text-white/90 transition-colors"
            >
              <Clock className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-medium text-white/90">Account Activation</h3>
              <div className="text-4xl font-bold text-white/90 font-mono tracking-wider">
                {timeLeft}
              </div>
            <div className="text-sm text-white/70">
              Time remaining for activation
            </div>
          </div>
          {/* Hover tooltip */}
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg -bottom-12 left-1/2 transform -translate-x-1/2 w-64 text-center text-sm">
            Please wait for 24 hours before your account gets activated
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-black/80"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timer;
