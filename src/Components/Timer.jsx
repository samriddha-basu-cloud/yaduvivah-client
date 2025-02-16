import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Clock } from "lucide-react";

const AnalogClock = ({ hours, minutes, seconds }) => {
  const secondsDegrees = (seconds / 60) * 360;
  const minutesDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hoursDegrees = ((hours + minutes / 60) / 24) * 360;

  return (
    <div className="relative w-32 h-32">
      <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg" />
      
      {/* Hour markers */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-3 bg-white/70"
          style={{
            left: '50%',
            top: '4px',
            transformOrigin: '50% 62px',
            transform: `rotate(${i * 30}deg)`
          }}
        />
      ))}
      
      {/* Clock hands */}
      <div
        className="absolute left-1/2 top-1/2 w-1 h-12 bg-white/90 rounded-full origin-bottom transform -translate-x-1/2"
        style={{ transform: `rotate(${hoursDegrees}deg) translateY(-50%)` }}
      />
      <div
        className="absolute left-1/2 top-1/2 w-0.5 h-14 bg-blue-400/90 rounded-full origin-bottom transform -translate-x-1/2"
        style={{ transform: `rotate(${minutesDegrees}deg) translateY(-50%)` }}
      />
      <div
        className="absolute left-1/2 top-1/2 w-0.5 h-16 bg-red-400/90 rounded-full origin-bottom transform -translate-x-1/2"
        style={{ transform: `rotate(${secondsDegrees}deg) translateY(-50%)` }}
      />
      <div className="absolute left-1/2 top-1/2 w-3 h-3 bg-white/90 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
};

function Timer() {
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [timerExpired, setTimerExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAnalog, setShowAnalog] = useState(false);
  const [timeValues, setTimeValues] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    let timerInterval;

    const fetchCreatedAtAndStartTimer = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
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
        }
        setLoading(false);
      });
    };

    fetchCreatedAtAndStartTimer();

    return () => clearInterval(timerInterval);
  }, [auth, db]);

  if (loading || timerExpired) return null;

  return (
    <div className="flex justify-center items-center">
      <div className="relative group">
        <div className="bg-gradient-to-br from-white/10 to-white/30 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 mt-24 border border-white/20">
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={() => setShowAnalog(!showAnalog)}
              className="absolute top-2 right-2 text-white/70 hover:text-white/90 transition-colors"
            >
              <Clock className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-medium text-white/90">Account Activation</h3>
            
            {showAnalog ? (
              <AnalogClock {...timeValues} />
            ) : (
              <div className="text-4xl font-bold text-white/90 font-mono tracking-wider">
                {timeLeft}
              </div>
            )}
            
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