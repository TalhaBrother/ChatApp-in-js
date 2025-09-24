import { getAuth, createUserWithEmailAndPassword, collection, addDoc,db ,signInWithPopup, GoogleAuthProvider,provider } from "./config.js";
const auth = getAuth();
let form = document.querySelector("form")
form.addEventListener("submit", async (e) => {
    e.preventDefault()
    let email = document.querySelector("#email").value
    let password = document.querySelector("#password").value
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        window.localStorage.setItem("uid", JSON.stringify(user.uid))
        const docRef = await addDoc(collection(db, "users"), {
            displayName: user?.displayName,
            email: user?.email,
            phoneNumber: user?.phoneNumber,
            photoURL: user?.photoURL,
            creationTime: user?.metadata?.creationTime,
            uid: user?.uid,
        });
        console.log("Document written with ID: ", docRef.id);
        console.log("Registered Successfully!")
         window.location.replace('./dashboard.html')

    } catch (error) {
        console.error("Registeration Error!",error)

    }
})
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