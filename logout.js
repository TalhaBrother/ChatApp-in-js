import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { app } from "./config.js";
const auth = getAuth();

// ✅ Logout function
document.querySelector("#logoutBtn").addEventListener("click", async () => {
  try {
    // Sign out user from Firebase Auth
    await signOut(auth);

    // Clear localStorage data
    localStorage.removeItem("uid");

    console.log("✅ Logged out successfully!");
    window.location.replace("./login.html");
  } catch (error) {
    console.error("❌ Logout Error:", error);
    alert("Error signing out. Try again.");
  }
});
