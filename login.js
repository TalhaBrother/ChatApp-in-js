import { getAuth, signInWithEmailAndPassword,GoogleAuthProvider,provider ,signInWithPopup } from "./config.js";

const auth = getAuth();
let SignInUser=async(e)=>{
    e.preventDefault()
    let email=document.querySelector("#signInEmail").value
    let password=document.querySelector("#signInPassword").value
    try {
        const userCredential=await signInWithEmailAndPassword(auth, email, password)
        const user=userCredential.user
        console.log("Logging In...")
        window.localStorage.setItem("uid", JSON.stringify(user.uid))
        window.location.replace("./dashboard.html")
    } catch (error) {
        console.error("Login Error: ",error)
    }
}
document.querySelector("#Login").addEventListener("submit",SignInUser)

document.querySelector("#GoogleBtn").addEventListener("click",()=>{
    signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });

})