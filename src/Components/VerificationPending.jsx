import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VerificationPending() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
      <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl p-8 shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">Verification Pending</h2>
          <p className="text-gray-600 mb-6">
            Your account is currently pending verification by our admin team. You'll be able to access all features once your account is verified.
          </p>
          <p className="text-gray-600">
            Please check back later or contact support if you have any questions.
          </p>
        </div>
      </div>
    </div>
  );
}
