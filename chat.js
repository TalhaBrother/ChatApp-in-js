import { collection, addDoc, getDocs, orderBy, query, db, where, or, and, onSnapshot, serverTimestamp } from "./config.js";
let loginUser = null
let selectedUser = null
let users = []
let messages = []
let chatUnsubscribe = null
let currentUser = JSON.parse(window.localStorage.getItem("uid"))


let fetchCurrentUser = async () => {
    try {
        const userDocRef = query(collection(db, "users"), where("uid", "==", currentUser))
        const userSnap = await getDocs(userDocRef)
        userSnap.forEach(doc => {
            console.log(doc.data())
            loginUser = { id: doc.id, ...doc.data() }

        });
    } catch (error) {
        console.error("Fetch User error!", error)
    }

}
fetchCurrentUser().then(() => {
    document.querySelector("#name").innerHTML = loginUser?.displayName
})


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

            messages.sort((a, b) => a?.createdAt - b?.createdAt);
            console.log("Messages: ", messages);

            renderChats();
        });

    } catch (error) {
        console.error("Error: ", error);
    }
};

let renderUser = () => {
    let userBox = document.querySelector(".users-list")
    users.map((user) => {
        console.log(user?.displayName)
        let userDiv = document.createElement("div")
        userDiv.innerHTML = `<div class="user-card">${user?.displayName}</div>`
        userDiv.querySelector(".user-card").addEventListener("click", () => {
            getChat(user)
        })
        userBox.appendChild(userDiv)
    })
}

let renderChats = () => {
    let messagesbox = document.querySelector(".messages-box")
    messagesbox.innerHTML = ''
    if (messages.length < 1) {
        messagesbox.innerHTML = "No chats!"
    }
    messages.map((msg) => {
        let msgDiv = document.createElement("div")
        msgDiv.className = (msg?.from === currentUser) ? "right msg" : "left msg"
        msgDiv.innerHTML = `${msg?.text}`
        
        messagesbox.appendChild(msgDiv)
    })
}

const q = query(collection(db, "users"), where("uid", "!=", currentUser));
const unsubscribe = onSnapshot(q, (querySnapshot) => {
    users = [];
    querySnapshot.forEach((doc) => {
        users.push({ ...doc.data(), id: doc.id });
    });
    console.log(users);
    renderUser()
})

let sendMessage = async (value) => {
    try {
        console.log(selectedUser?.uid)
       const docRef= await addDoc(collection(db, "messages"), {
            text: value,
            to: selectedUser?.uid,
            from: currentUser,
            createdAt: serverTimestamp()
        })
            console.log("Message sent with ID: ", docRef.id);
        

    } catch (error) {
        console.error("Message Sent Error!", error)
    }

}

document.querySelector("#send-btn").addEventListener("click", () => {
    let MsgInput = document.querySelector("#message-inp")
    if (MsgInput.value < 1) {
        return
    }
    if (!selectedUser?.uid) {
    console.error("No user selected!");
    return;
}
    sendMessage(MsgInput.value)
})