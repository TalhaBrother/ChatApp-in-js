import { 
    collection, 
    addDoc, 
    getDocs, 
    orderBy, 
    query, 
    db, 
    where, 
    or, 
    and, 
    onSnapshot, 
    serverTimestamp 
} from "./config.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const auth = getAuth();
let loginUser = null;
let selectedUser = null;
let users = [];
let messages = [];
let chatUnsubscribe = null;
let currentUser = null;

// ✅ Wait for Firebase Auth user
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user.uid;
        console.log("✅ Logged in user:", currentUser);
        await fetchCurrentUser();

        // 👇 wait a bit before loading users to ensure Firestore is ready
        setTimeout(loadUsers, 500);
    } else {
        console.log("No user logged in — redirecting to login...");
        window.location.replace("./login.html");
    }
});

// ✅ Fetch logged-in user info from Firestore
let fetchCurrentUser = async () => {
    try {
        const userDocRef = query(collection(db, "users"), where("uid", "==", currentUser));
        const userSnap = await getDocs(userDocRef);
        userSnap.forEach((doc) => {
            loginUser = { id: doc.id, ...doc.data() };
        });

        document.querySelector("#name").innerHTML = 
            loginUser?.displayName || loginUser?.email || "Unknown User";
    } catch (error) {
        console.error("Fetch User error!", error);
    }
};

// ✅ Load chat messages between two users
let getChat = async (user) => {
    selectedUser = user;
    localStorage.setItem("selectedUserUID", user.uid); // ✅ Remember last chat
    console.log("💬 Chatting with:", selectedUser.email || selectedUser.displayName);

    if (typeof chatUnsubscribe === "function") chatUnsubscribe();

    try {
        const q = query(
            collection(db, "messages"),
            or(
                and(where("from", "==", selectedUser?.uid), where("to", "==", currentUser)),
                and(where("from", "==", currentUser), where("to", "==", selectedUser?.uid))
            ),
            orderBy("createdAt")
        );

        chatUnsubscribe = onSnapshot(q, (querySnapshot) => {
            messages = [];
            querySnapshot.forEach((doc) => {
                messages.push(doc.data());
            });

            // Sort safely by timestamp
            messages.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return a.createdAt.seconds - b.createdAt.seconds;
            });

            renderChats();
        });

    } catch (error) {
        console.error("Error loading chat: ", error);
    }
};

// ✅ Render chat users list
let renderUser = () => {
    const userBox = document.querySelector(".users-list");
    userBox.innerHTML = "";

    users.forEach((user) => {
        const userDiv = document.createElement("div");
        userDiv.innerHTML = `
            <div class="user-card" 
                 style="cursor:pointer; padding:8px; border:1px solid #ccc; margin-bottom:5px; border-radius:8px;">
                 ${user.displayName || user.email}
            </div>`;

        userDiv.querySelector(".user-card").addEventListener("click", () => {
            getChat(user);
        });

        userBox.appendChild(userDiv);
    });
};

// ✅ Render chat messages
let renderChats = () => {
    const messagesBox = document.querySelector(".messages-box");
    messagesBox.innerHTML = "";

    if (messages.length < 1) {
        messagesBox.innerHTML = `<p style="color:#777;">No chats yet</p>`;
        return;
    }

    messages.forEach((msg) => {
        const msgDiv = document.createElement("div");
        msgDiv.className = (msg?.from === currentUser) ? "right msg" : "left msg";
        msgDiv.style.margin = "5px 0";
        msgDiv.style.padding = "6px 10px";
        msgDiv.style.borderRadius = "10px";
        msgDiv.style.maxWidth = "70%";
        msgDiv.style.wordWrap = "break-word";
        msgDiv.style.backgroundColor = (msg?.from === currentUser) ? "#DCF8C6" : "#F1F1F1";
        msgDiv.innerHTML = `${msg?.text}`;
        messagesBox.appendChild(msgDiv);
    });

    // Auto-scroll to bottom
    messagesBox.scrollTop = messagesBox.scrollHeight;
};

// ✅ Load all users except logged-in one
let loadUsers = () => {
    const q = query(collection(db, "users"), orderBy("uid"));
    onSnapshot(q, (querySnapshot) => {
        users = [];
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            if (user.uid !== currentUser) {
                users.push({ ...user, id: doc.id });
            }
        });

        renderUser();

        // ✅ Restore last selected chat if exists
        const lastUID = localStorage.getItem("selectedUserUID");
        console.log("🕓 Restoring last chat with:", lastUID);

        if (users.length > 0) {
            const lastUser = users.find(u => u.uid === lastUID);
            if (lastUser) {
                getChat(lastUser);
            } else {
                getChat(users[0]); // fallback to first user
            }
        }
    });
};

// ✅ Send message
let sendMessage = async (value) => {
    if (!selectedUser?.uid) {
        alert("Please select a user before sending a message.");
        return;
    }

    try {
        const docRef = await addDoc(collection(db, "messages"), {
            text: value,
            to: selectedUser?.uid,
            from: currentUser,
            createdAt: serverTimestamp(),
        });
        console.log("Message sent with ID: ", docRef.id);
    } catch (error) {
        console.error("Message Send Error!", error);
    }
};

// ✅ Handle send button
document.querySelector("#send-btn").addEventListener("click", () => {
    const MsgInput = document.querySelector("#message-inp");
    const msg = MsgInput.value.trim();

    if (msg.length < 1) return;
    if (!selectedUser?.uid) {
        alert("Please select a user to chat with.");
        return;
    }

    sendMessage(msg);
    MsgInput.value = "";
});

// ✅ Keep selected user in localStorage after refresh
// ❌ Do NOT clear this on reload
// window.addEventListener("beforeunload", () => {
//     localStorage.removeItem("selectedUserUID");
// });
