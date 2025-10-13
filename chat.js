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

let loginUser = null;
let selectedUser = null;
let users = [];
let messages = [];
let chatUnsubscribe = null;
let currentUser = JSON.parse(window.localStorage.getItem("uid"));

// ✅ Fetch logged-in user
let fetchCurrentUser = async () => {
    try {
        const userDocRef = query(collection(db, "users"), where("uid", "==", currentUser));
        const userSnap = await getDocs(userDocRef);
        userSnap.forEach((doc) => {
            loginUser = { id: doc.id, ...doc.data() };
        });
    } catch (error) {
        console.error("Fetch User error!", error);
    }
};

fetchCurrentUser().then(() => {
    document.querySelector("#name").innerHTML = loginUser?.displayName || loginUser?.email || "Unknown User";
});

// ✅ Load chat messages between selected users
let getChat = async (user) => {
    selectedUser = user;
    console.log("Selected User: ", selectedUser);

    if (typeof chatUnsubscribe === "function") {
        chatUnsubscribe();
    }

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

            // ✅ Sort safely by timestamp
            messages.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return a.createdAt.seconds - b.createdAt.seconds;
            });

            console.log("Messages: ", messages);
            renderChats();
        });

    } catch (error) {
        console.error("Error loading chat: ", error);
    }
};

// ✅ Show all users except the logged-in one
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
            console.log("User clicked:", user);
            getChat(user);
            alert(`Chatting with ${user.displayName || user.email}`);
        });
        userBox.appendChild(userDiv);
    });
};

// ✅ Show chat messages
let renderChats = () => {
    const messagesBox = document.querySelector(".messages-box");
    messagesBox.innerHTML = "";

    if (messages.length < 1) {
        messagesBox.innerHTML = "No chats yet!";
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

    // Auto scroll to bottom
    messagesBox.scrollTop = messagesBox.scrollHeight;
};

// ✅ Fetch all users and render
const q = query(collection(db, "users"), orderBy("uid"));
const unsubscribe = onSnapshot(q, (querySnapshot) => {
    users = [];
    querySnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.uid !== currentUser) { // Skip current user
            users.push({ ...user, id: doc.id });
        }
    });

    console.log("Rendered Users:", users);
    renderUser();

    // ✅ Auto-select first user if available
    if (users.length > 0 && !selectedUser) {
        getChat(users[0]);
        alert(`Auto-selected first user: ${users[0].displayName || users[0].email}`);
    }
});

// ✅ Send message
let sendMessage = async (value) => {
    try {
        if (!selectedUser?.uid) {
            console.error("No user selected while sending message!");
            alert("Please select a user before sending a message.");
            return;
        }

        const docRef = await addDoc(collection(db, "messages"), {
            text: value,
            to: selectedUser?.uid,
            from: currentUser,
            createdAt: serverTimestamp(),
        });

        console.log("Message sent with ID: ", docRef.id);
    } catch (error) {
        console.error("Message Sent Error!", error);
    }
};

// ✅ Handle send button
document.querySelector("#send-btn").addEventListener("click", () => {
    const MsgInput = document.querySelector("#message-inp");
    const msg = MsgInput.value.trim();

    if (msg.length < 1) return;

    if (!selectedUser?.uid) {
        console.error("No user selected!");
        alert("Please select a user to chat with.");
        return;
    }

    sendMessage(msg);
    MsgInput.value = "";
});
