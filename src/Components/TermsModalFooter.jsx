import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa"; // Import the close icon

const TermsModal = ({ isOpen, onClose, onConfirm, onDeny }) => {
  // State to track if user has scrolled to the bottom.
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  // Ref for the scrollable content container.
  const contentRef = useRef(null);

  // Function to handle scrolling
  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    // When scrollTop + clientHeight is at (or almost at) scrollHeight, we are at the bottom.
    if (scrollTop + clientHeight >= scrollHeight - 1) {
      setIsScrolledToBottom(true);
    } else {
      setIsScrolledToBottom(false);
    }
  };

  // Optional: When the modal opens, check if the content is already short enough that scrolling isn’t required.
  useEffect(() => {
    if (isOpen && contentRef.current) {
      handleScroll();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <motion.div
        className="relative z-10 max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Decorative Top Border */}
        <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600" />

        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={24} />
          </button>

          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">Terms of Use</h2>
            <p className="text-gray-500">YaduVivah (YV)</p>
          </div>

          {/* Scrollable Content Container */}
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="max-h-[70vh] overflow-y-auto pr-4"
          >
            <div className="space-y-6">
              {/* Title and Intro */}
              <h1 className="text-2xl font-bold">Service Agreement:</h1>
              <p className="text-gray-600 italic">
                Last Updated: 20th February, 2025
              </p>
              <p>
                Welcome to yaduvivah.com, your dedicated online platform for
                serious matrimonial matchmaking. By accessing or using our
                website and services (collectively, the “Service”), you agree to
                be bound by these Terms of Use (“Agreement”). If you do not agree
                with any of these terms, please refrain from using the Service.
              </p>

              {/* 1. Acceptance of Terms */}
              <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
              <p>
                By registering for and/or using the Service, you represent that
                you have read, understood, and agree to abide by all the
                provisions of this Agreement. This Agreement constitutes an
                electronic contract between you and Yaduvivah.com and is
                enforceable in accordance with applicable law.
              </p>

              {/* 2. Eligibility and Membership */}
              <h2 className="text-xl font-bold">2. Eligibility and Membership</h2>
              <p>
                <strong>Eligibility:</strong> To register as a member, you must
                be legally competent and of the legal marriageable age in India
                (currently, 18 years or older for females and 21 years or older
                for males). By joining, you affirm that you are not prohibited by
                any applicable law or court order from entering into matrimony.
              </p>
              <p>
                <strong>Membership:</strong> Membership is intended solely for
                individuals seeking a serious matrimonial alliance.
                yaduvivah.com is not a platform for casual dating or commercial
                promotions. Multiple profiles by the same individual are
                prohibited; any duplicate profiles may be removed without notice.
              </p>

              {/* 3. Registration, Account Security, and Personal Data */}
              <h2 className="text-xl font-bold">
                3. Registration, Account Security, and Personal Data
              </h2>
              <p>
                <strong>Registration:</strong> To become a Member, you must
                provide accurate, current, and complete information during the
                registration process. By doing so, you consent to the collection,
                storage, and use of your personally identifiable and, if
                applicable, sensitive personal data in accordance with our Terms
                of Use.
              </p>
              <p>
                <strong>Account Security:</strong> You are responsible for
                maintaining the confidentiality of your login credentials.
                Immediately notify us of any unauthorized use or breach of your
                account. Failure to secure your account may result in its
                termination without any refund of subscription fees.
              </p>
              <p>
                <strong>Data Consent:</strong> By using our Service, you agree
                that we may contact you via email, SMS, or other communication
                channels regarding your account, membership, and relevant
                match-related notifications.
              </p>

              {/* 4. Use of the Service */}
              <h2 className="text-xl font-bold">4. Use of the Service</h2>
              <p>
                <strong>Purpose:</strong> The Service is provided solely to
                facilitate the search for a lifelong matrimonial partner. All
                profiles, communications, and services are intended exclusively
                for matrimonial purposes.
              </p>
              <p>
                <strong>Non-Commercial Use:</strong> yaduvivah.com is a
                personal matchmaking platform. You agree not to use the Service
                for any commercial purposes, such as advertising third-party
                products or services, without our express written consent.
              </p>
              <p>
                <strong>Assistance to Authorities:</strong> In cases of
                fraudulent behavior or misuse, Yaduvivah.com will provide all
                possible assistance to law enforcement or statutory investigation
                agencies upon receiving proper authorization.
              </p>

              {/* 5. User Content and Conduct */}
              <h2 className="text-xl font-bold">5. User Content and Conduct</h2>
              <p>
                <strong>User Content:</strong> You are solely responsible for
                all content you post, including but not limited to your profile
                information, photographs, and communications (“Content”). By
                submitting Content, you grant Yaduvivah.com a non-exclusive,
                royalty-free, worldwide license to store, display, reproduce,
                and distribute your Content in connection with the Service.
              </p>
              <p>
                <strong>Prohibited Content and Conduct:</strong> You agree not
                to post or transmit any content that:
              </p>
              <ul className="list-disc ml-6">
                <li>Is defamatory, obscene, or offensive;</li>
                <li>Infringes on the intellectual property rights of others;</li>
                <li>Promotes illegal activities or violence;</li>
                <li>Contains false or misleading information;</li>
                <li>
                  Harasses, defames, or invades the privacy of any individual;
                </li>
                <li>
                  Encourages or facilitates unauthorized commercial activities.
                </li>
              </ul>
              <p>
                yaduvivah.com reserves the right to remove any Content that
                violates these guidelines or that we deem harmful to the
                community, at our sole discretion.
              </p>

              {/* 6. Intellectual Property */}
              <h2 className="text-xl font-bold">6. Intellectual Property</h2>
              <p>
                All content, trademarks, logos, and proprietary information on
                yaduvivah.com are owned by or licensed to us. You agree not to
                copy, modify, distribute, or create derivative works without our
                prior written consent, except as expressly permitted under this
                Agreement.
              </p>

              {/* 7. Payment, Membership Fees, and Refund Policy */}
              <h2 className="text-xl font-bold">
                7. Payment, Membership Fees, and Refund Policy
              </h2>
              <p>
                <strong>Membership Fees:</strong> While access to the basic
                features of yaduvivah.com is free, premium services may require
                a paid membership. Details regarding premium features, fees, and
                subscription terms will be clearly communicated at the time of
                purchase.
              </p>
              <p>
                <strong>Refunds:</strong> In the event of business
                discontinuity or as otherwise specified in writing, any refund
                policies will be communicated in advance. Generally, subscription
                fees are non-refundable, except where explicitly stated
                otherwise.
              </p>

              {/* 8. Disclaimers and Limitation of Liability */}
              <h2 className="text-xl font-bold">
                8. Disclaimers and Limitation of Liability
              </h2>
              <p>
                <strong>Service Provided “As Is”:</strong> yaduvivah.com is
                provided on an “AS IS” basis without warranties of any kind,
                either express or implied. We do not guarantee any specific
                outcomes from your use of the Service.
              </p>
              <p>
                <strong>Limitation on Liability:</strong> Under no
                circumstances shall Yaduvivah.com be liable for any indirect,
                incidental, consequential, or punitive damages arising out of
                your use of the Service. Our total liability, if any, will be
                limited to the amount paid by you for the Service during the
                membership period.
              </p>
              <p>
                <strong>No Endorsement of User Content:</strong> yaduvivah.com
                does not endorse any content posted by Members and is not
                responsible for verifying the accuracy or authenticity of such
                Content.
              </p>

              {/* 9. Indemnification */}
              <h2 className="text-xl font-bold">9. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Yaduvivah.com, its
                affiliates, officers, and employees from any claims, losses,
                liabilities, or expenses (including legal fees) arising out of
                your use of the Service, violation of this Agreement, or
                infringement of any rights of any third party.
              </p>

              {/* 10. Termination and Modifications */}
              <h2 className="text-xl font-bold">
                10. Termination and Modifications
              </h2>
              <p>
                <strong>Termination by You:</strong> You may terminate your
                membership at any time by deleting your account or contacting us
                at{" "}
                <a
                  href="mailto:help@yaduvivah.com?subject=Help%20regarding%20termination%20and%20modification&body=Hey!%20Please%20help%20me%20with%20the%20..."
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  help@yaduvivah.com
                </a>
                . No refunds will be issued for any unused portion of your
                membership fees unless explicitly provided in writing.
              </p>
              <p>
                <strong>Termination by Us:</strong> Yaduvivah.com reserves the
                right to suspend or terminate your access to the Service at its
                discretion, particularly if you violate these Terms or engage in
                behavior deemed harmful to the community.
              </p>
              <p>
                <strong>Modifications:</strong> We may update or modify these
                Terms of Use from time to time. Continued use of the Service after
                such changes constitutes your acceptance of the revised terms.
              </p>

              {/* 11. Governing Law and Jurisdiction */}
              <h2 className="text-xl font-bold">
                11. Governing Law and Jurisdiction
              </h2>
              <p>
                This Agreement shall be governed by and construed in accordance
                with the laws of India. Any disputes arising from or related to
                these Terms shall be subject to the exclusive jurisdiction of the
                competent courts in Mumbai, India.
              </p>

              {/* 12. Miscellaneous */}
              <h2 className="text-xl font-bold">12. Miscellaneous</h2>
              <p>
                <strong>Entire Agreement:</strong> This Agreement constitutes the
                entire agreement between you and Yaduvivah.com regarding your use
                of the Service and supersedes all prior agreements.
              </p>
              <p>
                <strong>Data Usage:</strong> The Data provided to yaduvivah.com by you can be used by yaduvivah.com for the purpose of promotions, advertising, statistics, marketing and etc. as it needs/wants.
              </p>
              <p>
                <strong>Severability:</strong> If any provision of this
                Agreement is found to be unenforceable, the remaining provisions
                shall continue to be valid and enforceable.
              </p>
              <p>
                <strong>Contact Information:</strong> For any questions
                regarding these Terms of Use or any other matters, please contact
                us at:
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:help@yaduvivah.com"
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  help@yaduvivah.com
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons
          <div className="flex justify-center mt-6 space-x-4">
            <motion.button
              onClick={() => {
                onDeny();
                onClose();
              }}
              className="w-full max-w-sm py-4 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 bg-red-500 hover:bg-red-600"
            >
              I Deny
            </motion.button>
            <motion.button
              onClick={onConfirm}
              disabled={!isScrolledToBottom}
              // Only apply hover and tap animations if enabled.
              whileHover={isScrolledToBottom ? { scale: 1.02 } : {}}
              whileTap={isScrolledToBottom ? { scale: 0.98 } : {}}
              className={`w-full max-w-sm py-4 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 ${
                isScrolledToBottom
                  ? "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              I Understand
            </motion.button>
          </div> */}
        </div>
      </motion.div>
    </div>
  );
};

export default TermsModal;