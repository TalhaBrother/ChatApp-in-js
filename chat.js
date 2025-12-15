import {
  auth,
  db,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  onAuthStateChanged,
  serverTimestamp
} from "./config.js";

let currentUser = null;
let currentUserName = "";
let selectedUser = null;
let unsubscribe = null; // 🔴 IMPORTANT

// Generate unique chat ID
function getChatId(uid1, uid2) {
  return uid1 < uid2 ? uid1 + "_" + uid2 : uid2 + "_" + uid1;
}

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("login.html");
  } else {
    currentUser = user.uid;

    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach(doc => {
      if (doc.id === currentUser) {
        currentUserName = doc.data().displayName || doc.data().email;
      }
    });

    loadUsers();
  }
});

// Load users list
async function loadUsers() {
  const usersBox = document.getElementById("usersBox");
  usersBox.innerHTML = "";

  const snap = await getDocs(collection(db, "users"));
  snap.forEach(doc => {
    if (doc.id === currentUser) return;

    const div = document.createElement("div");
    div.textContent = doc.data().displayName || doc.data().email;
    div.onclick = () => openChat(doc.id, div.textContent);
    usersBox.appendChild(div);
  });
}

// Open chat (WhatsApp behavior)
function openChat(id, name) {
  selectedUser = id;
  document.getElementById("activeUser").textContent =
    "Chatting with: " + name;

  const messagesBox = document.getElementById("messagesBox");
  messagesBox.innerHTML = "";

  if (unsubscribe) unsubscribe(); // 🔴 STOP OLD LISTENER

  const chatId = getChatId(currentUser, selectedUser);

  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp")
  );

  unsubscribe = onSnapshot(q, snap => {
    messagesBox.innerHTML = "";

    snap.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.className = "message";

      if (msg.from === currentUser) {
        div.classList.add("sent");
        div.innerHTML = `<strong>You:</strong> ${msg.text}`;
      } else {
        div.innerHTML = `<strong>${msg.fromName}:</strong> ${msg.text}`;
      }

      messagesBox.appendChild(div);
    });

    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}

// Send message
async function sendMessage() {
  const input = document.getElementById("messageInp");
  const txt = input.value.trim();
  if (!txt || !selectedUser) return;

  const chatId = getChatId(currentUser, selectedUser);

  await addDoc(collection(db, "chats", chatId, "messages"), {
    text: txt,
    from: currentUser,
    fromName: currentUserName,
    timestamp: serverTimestamp()
  });

  input.value = "";
}

// Button click
document.getElementById("sendBtn").onclick = sendMessage;
