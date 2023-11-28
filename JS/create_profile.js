import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
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

submit.addEventListener("click", async function () {

    await createProfile();


})


async function createProfile() {

    const email = document.getElementById('email').value; // Fetch the email value here
    const password = document.getElementById('password').value; // Fetch the password value here
    const repeat_password = document.getElementById('repeat-password').value; // Fetch the repeat_password value here
    const error = document.getElementById('error-message');

    if (await validate_email(email, error) == false) {

        // alert("Epost felaktigt.");
        return;
    }

    if (await validate_password(password, repeat_password, error) == false) {
        // alert("Lösenordet felaktigt.");
        return;
    }

    try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

        (userCredentials.user);
        error.textContent = "Verifieringslänk har skickats till din e-post."

    } catch (error) {

        ("Could not create profile");

    }

}

async function monitorAuthState() {
    onAuthStateChanged(auth, user => {

        if (user) {
            // window.location.href = "../HTML/booking.html";
            sendEmailVerification(auth.currentUser)

        } else {
            //no user signed in

        }
    })
}



monitorAuthState();

async function validate_email(email, error) {

    const expression = /^[^@]+@\w+(\.\w+)+\w$/.test(email);

    if (expression) {
        return true;
    } else {
        error.textContent = "Felaktig e-postadress.";
        return false;
    }

}

async function validate_password(password, repeat_password, error) {

    if (password == null || password.length < 6) {
        error.textContent = "Lösenordet är för kort.";
        return false;
    } else {

        if (password === repeat_password) {
            error.textContent = ''; // Clear the error message
            return true;
        } else {
            error.textContent = "Lösenorden matchar inte.";
            return false;
        }
    }
}





