import { getAuth, signInWithEmailAndPassword, signInWithPopup, provider } from "./config.js";

const auth = getAuth();

// ✅ Login with Email & Password
document.querySelector("#Login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("#signInEmail").value.trim();
  const password = document.querySelector("#signInPassword").value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Store UID for current session
    localStorage.setItem("uid", user.uid);

    console.log("✅ Logged in successfully!");
    window.location.replace("./dashboard.html");
  } catch (error) {
    console.error("❌ Login Error:", error);
    alert(error.message);
  }
});

// ✅ Login with Google
document.querySelector("#GoogleBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // ✅ Save UID and redirect
    localStorage.setItem("uid", user.uid);
    window.location.replace("./dashboard.html");
  } catch (error) {
    console.error("❌ Google Login Error:", error);
    alert(error.message);
  }
});
