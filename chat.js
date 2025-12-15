import { auth, db, collection, addDoc, getDocs, onSnapshot, query, where, onAuthStateChanged, serverTimestamp } from "./config.js";

let currentUser = null;
let currentUserName = "";
let selectedUser = null;

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user) window.location.replace("login.html");
  else {
    currentUser = user.uid;
    // Load name
    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(doc => {
      if (doc.id === currentUser) currentUserName = doc.data().displayName || doc.data().email;
    });
    loadUsers();
    loadAllMessages();
  }
});

// Load all registered users
async function loadUsers() {
  const usersBox = document.getElementById("usersBox");
  usersBox.innerHTML = "<p>Select a user for private chat:</p>";
  const snap = await getDocs(collection(db, "users"));
  snap.forEach(doc => {
    if (doc.id === currentUser) return;
    const div = document.createElement("div");
    div.textContent = doc.data().displayName || doc.data().email;
    div.onclick = () => openChat(doc.id, div.textContent);
    usersBox.appendChild(div);
  });
}

// Send message
async function sendMessage() {
  const txt = document.getElementById("messageInp").value.trim();
  if (!txt) return;

  await addDoc(collection(db, "messages"), {
    text: txt,
    from: currentUser,
    fromName: currentUserName || "Unknown",
    to: selectedUser, // null for global chat
    timestamp: serverTimestamp() // Add timestamp for analytics
  });

  document.getElementById("messageInp").value = "";
}

// Open private chat
function openChat(id, name) {
  selectedUser = id;
  document.getElementById("activeUser").textContent = "Chatting with: " + name;
  loadPrivateMessages();
}

// Button click
document.getElementById("sendBtn").onclick = sendMessage;

// Load global messages
function loadAllMessages() {
  selectedUser = null;
  document.getElementById("activeUser").textContent = "Global Chat";
  const messagesBox = document.getElementById("messagesBox");
  const q = query(collection(db, "messages"));
  onSnapshot(q, snap => {
    messagesBox.innerHTML = "";
    snap.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.className = "message";

      // ✅ IMPROVED: Add 'sent' class for current user's messages
      if (msg.from === currentUser) {
          div.classList.add('sent');
          div.innerHTML = `<strong>You:</strong> ${msg.text}`;
      } else {
        // Name before message
        div.innerHTML = `<strong>${msg.fromName || "Unknown"}:</strong> ${msg.text}`;
      }
      
      messagesBox.appendChild(div);
    });
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}

// Load private messages
function loadPrivateMessages() {
  const messagesBox = document.getElementById("messagesBox");
  const q = query(collection(db, "messages"));
  onSnapshot(q, snap => {
    messagesBox.innerHTML = "";
    snap.forEach(doc => {
      const msg = doc.data();
      // Only show messages between current user and selected user
      if ((msg.from === currentUser && msg.to === selectedUser) || 
          (msg.from === selectedUser && msg.to === currentUser)) {
        const div = document.createElement("div");
        div.className = "message";

        // ✅ IMPROVED: Add 'sent' class for current user's messages
        if (msg.from === currentUser) {
            div.classList.add('sent');
            div.innerHTML = `<strong>You:</strong> ${msg.text}`;
        } else {
            div.innerHTML = `<strong>${msg.fromName || "Unknown"}:</strong> ${msg.text}`;
        }
        messagesBox.appendChild(div);
      }
    });
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}
