import { auth, db } from "./Firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithRedirect
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions

export const doCreateUserWithEmailAndPassword = async (email, password, additionalData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await addUserToFirestore(user, additionalData);
  return userCredential;
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async (additionalData) => {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  await addUserToFirestore(user, additionalData);
  return result;
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
};

const addUserToFirestore = async (user, additionalData = {}) => {
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        role: user.role || "user",
        verifiedByAdmin: false,
        payment: false,
        paymentType: "",
        email: user.email,
        displayName: user.displayName || additionalData.name || "",
        photoURL: user.photoURL || "",
        createdAt: new Date(),
        reported: additionalData.reported || false,
        name: additionalData.name || "",
        adharVarified: additionalData.adharVarified || false,
        description: additionalData.description || "",
        age: additionalData.age || null,
        number: additionalData.number || "",
        religion: additionalData.religion || "",
        motherTongue: additionalData.motherTongue || "",
        sex: additionalData.sex || "",
        agentRefCode: additionalData.agentRefCode || "",
        profession: additionalData.profession || "",
        status: additionalData.status || "",
        childrenFromPreviousMarriage:
          additionalData.childrenFromPreviousMarriage || "",
        region: additionalData.region || "",
        photos: additionalData.photos || [],
        reportReasons: additionalData.reportReasons || {
          inappropriateContent: false,
          spam: false,
          harassment: false,
          fakeProfile: false,
        },
        showEmail: additionalData.showEmail || false,
        showNumber: additionalData.showNumber || false,
        showStatus: additionalData.showStatus || false,
      },
      { merge: true }
    );
    console.log("User added to Firestore");
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
  }
};
