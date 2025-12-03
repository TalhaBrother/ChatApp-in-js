// DOM Elements
const messagesBox = document.getElementById("messagesBox");
const usernameInp = document.getElementById("usernameInp");
const messageInp = document.getElementById("messageInp");
const sendBtn = document.getElementById("sendBtn");

// Load chat history
let history = JSON.parse(localStorage.getItem("chatHistory")) || [];

// Function to render messages
function renderMessages() {
  messagesBox.innerHTML = "";
  history.forEach(msg => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<strong>${msg.user}</strong>: ${msg.text}`;
    messagesBox.appendChild(div);
  });
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// Function to send message
function sendMessage() {
  const user = usernameInp.value.trim();
  const text = messageInp.value.trim();
  if (!user || !text) return;

  const message = {
    user,
    text,
    timestamp: Date.now()
  };

  history.push(message);
  localStorage.setItem("chatHistory", JSON.stringify(history));
  messageInp.value = "";
  renderMessages();
}

// Event listener
sendBtn.addEventListener("click", sendMessage);
messageInp.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// Initial render
renderMessages();
