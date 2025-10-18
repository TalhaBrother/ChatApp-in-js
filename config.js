
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
import { serverTimestamp,getFirestore,onSnapshot,orderBy, limit,or,and,where,query,collection, getDocs, addDoc ,doc, deleteDoc, updateDoc} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { signInWithPopup,GoogleAuthProvider , signOut, onAuthStateChanged, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLGd1FvbPSrhnne8v8ZaGo2SYxV7NJc6o",
  authDomain: "smit-2394a.firebaseapp.com",
  projectId: "smit-2394a",
  storageBucket: "smit-2394a.firebasestorage.app",
  messagingSenderId: "488578676073",
  appId: "1:488578676073:web:81432e210a3475390ab9f8",
  measurementId: "G-J5FQBVF0TF"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const db = getFirestore(app);

export{app,serverTimestamp,and,signInWithPopup,provider,GoogleAuthProvider,onAuthStateChanged, signInWithEmailAndPassword,createUserWithEmailAndPassword,getAuth,db,onSnapshot,orderBy, limit,or,where,query,collection, getDocs, addDoc ,doc, deleteDoc, updateDoc , signOut,auth}