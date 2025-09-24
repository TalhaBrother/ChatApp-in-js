import { addDoc, auth, collection, db, deleteDoc, doc, getDocs, onAuthStateChanged, onSnapshot, query, signOut, updateDoc, where } from "./config.js"
let currentUser = JSON.parse(window.localStorage.getItem("uid"))
let posts = []


onAuthStateChanged(auth, (user) => {
    if (user) {
      
        currentUser = user
        console.log("User is signed in")
        // ...
    } else {
        console.log("User is signed Out!")
    }
});

document.querySelector("#signout").addEventListener("click", () => {
    signOut(auth).then(() => {
        console.log("SignedOut Successful!")
    }).catch((error) => {
        console.error(error)
    });
})

document.querySelector("#post-btn").addEventListener("click", async () => {
    try {
        let inputValue = document.querySelector("#post-input").value
        const docRef = await addDoc(collection(db, "posts"), {
            text: inputValue,
            uid: currentUser.uid
        });
        console.log("Post created with ID: ", docRef.id);

    } catch (error) {
        console.error("Post Creation error! ", error)
    }

})


let updateData = async (id) => {
    try {
        console.log(id)
        let input = document.querySelector('#post-input')
        const updateDocRef = doc(db, "posts", id);
        await updateDoc(updateDocRef, {
            text: input.value
        }).then(() => {
            console.log('successfully updated!')
            input.value = '' 
            document.querySelector('.update').style.display = 'none'
            document.querySelector('#post-btn').style.display = 'block'
        });
    } catch (error) {
        console.error(error)
    }
}
let editData = async (id) => {
    let input = document.querySelector('#post-input')

    let findPost = posts.find((post) => post.id === id)
    input.value = findPost.text
    document.querySelector('.update').style.display = 'flex'
    document.querySelector('#post-btn').style.display = 'none'

    let updateBtn = document.createElement("span")
    updateBtn.id = 'update_btn'
    updateBtn.innerText = "Update"
    updateBtn.addEventListener('click', () => {
        updateData(findPost.id)
    })
    let updateDiv = document.querySelector('.update')
    updateDiv.innerHTML = ''
    updateDiv.appendChild(updateBtn)
   

}

let deleteData = async (id) => {
  try {
    await deleteDoc(doc(db, "posts", id)).then(() => {
      console.log('successfully deleted!')

    })
  } catch (error) {
    console.error(error)
  }
}

let renderPost=()=>{
    let postbox=document.querySelector(".posts-box")
    postbox.innerHTML=""
    posts.map((post)=>{
        let cardDiv=document.createElement("div")
        cardDiv.className="postCard"
        cardDiv.innerHTML+=`
        <span>${post?.text}</span>
        <button class="edit-btn">Edit</button>
        <button class="del-btn">Delete</button>
        `
        cardDiv.querySelector(".edit-btn").addEventListener("click",()=>{
            editData(post.id)
        })
         cardDiv.querySelector(".del-btn").addEventListener("click",()=>{
            deleteData(post.id)
        })
        postbox.appendChild(cardDiv)
    })
}
let getPosts = async () => {
  try {
    console.log(currentUser)

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      
      console.log(doc.id, " => ", doc.data());
      posts.push({ ...doc.data(), id: doc.id })
    });

  } catch (error) {
    console.error(error)
  }
}
const q = query(collection(db, "posts"), where("uid", "==", currentUser));
const unsubscribe = onSnapshot(q, (querySnapshot) => {
  posts = []
  querySnapshot.forEach((doc) => {

    posts.push({ ...doc.data(), id: doc.id })
  });
  renderPost()
})