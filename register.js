import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  db, 
  signInWithPopup, 
  provider 
} from "./config.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const auth = getAuth();
let form = document.querySelector("form");

// ✅ Register user with email & password
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let email = document.querySelector("#email").value.trim();
  let password = document.querySelector("#password").value.trim();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Save user data in Firestore (using UID as document ID)
    await setDoc(doc(db, "users", user.uid), {
      displayName: user.displayName || email.split("@")[0],
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      photoURL: user.photoURL || null,
      creationTime: user.metadata.creationTime,
      uid: user.uid,
    });

    // ✅ Save UID for session
    localStorage.setItem("uid", user.uid);

    console.log("✅ Registered Successfully!");
    window.location.replace("./dashboard.html");
  } catch (error) {
    console.error("❌ Registration Error:", error);
    alert(error.message);
  }
});

// ✅ Register or login with Google
document.querySelector("#GoogleBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // ✅ Save or overwrite user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      displayName: user.displayName,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      photoURL: user.photoURL || null,
      creationTime: user.metadata.creationTime,
      uid: user.uid,
    });

    localStorage.setItem("uid", user.uid);
    window.location.replace("./dashboard.html");
  } catch (error) {
    console.error("❌ Google Sign-Up Error:", error);
    alert(error.message);
  }
});
