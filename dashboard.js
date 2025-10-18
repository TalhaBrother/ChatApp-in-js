import { 
  addDoc, 
  auth, 
  collection, 
  db, 
  deleteDoc, 
  doc, 
  getDocs, 
  onAuthStateChanged, 
  onSnapshot, 
  query, 
  signOut, 
  updateDoc, 
  where 
} from "./config.js";

let currentUser = window.localStorage.getItem("uid"); // ✅ FIXED: No JSON.parse
let posts = [];

// ✅ Track authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user.uid;
    console.log("✅ User is signed in:", currentUser);
  } else {
    console.log("❌ User is signed out!");
    window.location.replace("./login.html");
  }
});

// ✅ Logout function
document.querySelector("#signout").addEventListener("click", async () => {
  try {
    await signOut(auth);
    console.log("✅ Signed out successfully!");
    localStorage.removeItem("uid");
    window.location.replace("./login.html");
  } catch (error) {
    console.error("❌ Sign-out error:", error);
  }
});

// ✅ Create new post
document.querySelector("#post-btn").addEventListener("click", async () => {
  try {
    let inputValue = document.querySelector("#post-input").value.trim();
    if (!inputValue) return alert("Please write something before posting!");

    const docRef = await addDoc(collection(db, "posts"), {
      text: inputValue,
      uid: currentUser, // ✅ FIXED
    });

    console.log("✅ Post created with ID:", docRef.id);
    document.querySelector("#post-input").value = "";
  } catch (error) {
    console.error("❌ Post creation error:", error);
  }
});

// ✅ Update post
let updateData = async (id) => {
  try {
    let input = document.querySelector("#post-input");
    const updateDocRef = doc(db, "posts", id);

    await updateDoc(updateDocRef, {
      text: input.value
    });

    console.log("✅ Successfully updated!");
    input.value = "";
    document.querySelector(".update").style.display = "none";
    document.querySelector("#post-btn").style.display = "block";
  } catch (error) {
    console.error("❌ Update error:", error);
  }
};

// ✅ Edit post (load data into input)
let editData = async (id) => {
  let input = document.querySelector("#post-input");
  let findPost = posts.find((post) => post.id === id);

  input.value = findPost.text;
  document.querySelector(".update").style.display = "flex";
  document.querySelector("#post-btn").style.display = "none";

  let updateBtn = document.createElement("span");
  updateBtn.id = "update_btn";
  updateBtn.innerText = "Update";
  updateBtn.addEventListener("click", () => {
    updateData(findPost.id);
  });

  let updateDiv = document.querySelector(".update");
  updateDiv.innerHTML = "";
  updateDiv.appendChild(updateBtn);
};

// ✅ Delete post
let deleteData = async (id) => {
  try {
    await deleteDoc(doc(db, "posts", id));
    console.log("🗑️ Successfully deleted!");
  } catch (error) {
    console.error("❌ Delete error:", error);
  }
};

// ✅ Render posts
let renderPost = () => {
  let postbox = document.querySelector(".posts-box");
  postbox.innerHTML = "";

  posts.forEach((post) => {
    let cardDiv = document.createElement("div");
    cardDiv.className = "postCard";
    cardDiv.innerHTML = `
      <span>${post?.text}</span>
      <button class="edit-btn">Edit</button>
      <button class="del-btn">Delete</button>
    `;

    cardDiv.querySelector(".edit-btn").addEventListener("click", () => {
      editData(post.id);
    });

    cardDiv.querySelector(".del-btn").addEventListener("click", () => {
      deleteData(post.id);
    });

    postbox.appendChild(cardDiv);
  });
};

// ✅ Real-time posts listener
const q = query(collection(db, "posts"), where("uid", "==", currentUser));

onSnapshot(q, (querySnapshot) => {
  posts = [];
  querySnapshot.forEach((doc) => {
    posts.push({ ...doc.data(), id: doc.id });
  });
  renderPost();
});
