import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBa21oxw4RJulOrUbpjLsKYCXrJ51gAT0E",
    authDomain: "carpool-9943f.firebaseapp.com",
    databaseURL: "https://carpool-9943f-default-rtdb.firebaseio.com",
    projectId: "carpool-9943f",
    storageBucket: "carpool-9943f.appspot.com",
    messagingSenderId: "89343115513",
    appId: "1:89343115513:web:6d41d0a80ce976c3272228"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const database = getDatabase(app)


const submit = document.getElementById("submit");
const member = document.getElementById("member");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorDisplay = document.getElementById("error-message"); // Create an element to display errors

member.addEventListener("click", function () {

    window.location.href = "../HTML/create_profile.html";

})

submit.addEventListener("click", async function () {
    const email = usernameInput.value;
    const password = passwordInput.value;


    try {
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);

    } catch (error) {


        // Visa felmeddelandet i errorDisplay
        errorDisplay.textContent = error.message;

        // Ställ in en tidsfördröjning på 3 sekunder för att ta bort felmeddelandet
        setTimeout(() => {
            errorDisplay.textContent = ""; // Ta bort felmeddelandet
        }, 5000); // 3000 millisekunder (3 sekunder)

    }

});


async function monitorAuthState() {
    onAuthStateChanged(auth, user => {

        if (user) {

            if (user.emailVerified) {
                window.location.href = "../HTML/booking.html";
            } else {
                // console.log("Please check your email to verify your account.");
            }


        } else {
            //user has signed out
        }
    })
}



monitorAuthState();
