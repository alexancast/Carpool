import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getDatabase, ref, push, onValue, update, child } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
import { sha256 } from "../JS/encryption.js"

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

const allBookings = [];
const button = document.getElementById("logout");
const profileButton = document.getElementById('profile-button');
const profileMenu = document.getElementById('profile-menu');
const name = document.getElementById("name");
const bookingPanel = document.getElementById('booking-entities'); // Get the booking panel div

profileButton.addEventListener('click', () => {
    profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
});

async function monitorAuthState() {
    onAuthStateChanged(auth, user => {

        if (user) {
            name.textContent = auth.currentUser.email;

        } else {
            //no user signed in
            window.location.href = "../HTML/index.html";
        }
    })
}

monitorAuthState();

async function logout() {
    await signOut(auth);
    window.location.href = "../HTML/index.html";
}

button.addEventListener("click", async function () {
    try {
        await logout();
    } catch (error) {
        // Handle any errors here
    }
});


async function loadBookings() {

    // Hämta alla bilar från databasen
    const bilarRef = ref(database, 'cars');
    allBookings.length = 0;

    onValue(bilarRef, (snapshot) => {
        const data = snapshot.val();

        for (const carKey in data) {
            const car = data[carKey];


            if (car.bookings == null) {
                continue;
            }

            const bookings = Object.values(car.bookings);

            for (const iterator of bookings) {

                // Add the booking to the allBookings array
                allBookings.push({
                    carKey: carKey,
                    car: car,
                    iterator: iterator
                });
            }
        }

        // Sort the allBookings array by pickup_date
        allBookings.sort((a, b) => {
            const pickupDateA = new Date(a.iterator.pickup_date);
            const pickupDateB = new Date(b.iterator.pickup_date);
            return pickupDateA - pickupDateB;
        });

        displayBookings();

    });

}

function isToday(date) {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}


async function displayBookings() {

    if (allBookings.length <= 0) {

        const bookingDiv = document.createElement('div');
        bookingDiv.setAttribute('id', 'prompt');

        const dropoffInfo = document.createElement('p');
        dropoffInfo.textContent = "Inga bokningar är registrerade idag.";

        bookingDiv.appendChild(dropoffInfo);
        bookingPanel.appendChild(bookingDiv);

    } else {
        for (let i = 0; i < allBookings.length; i++) {
            const element = allBookings[i];
            displayBooking(element);
        }
    }
}

async function displayBooking(booking) {


    const pickupInfo = document.createElement('p');
    pickupInfo.setAttribute("id", "todays-bookings-text");

    const pickupDate = new Date(booking.iterator.pickup_date);
    const dropoffDate = new Date(booking.iterator.dropoff_date);

    const isPickupToday = isToday(pickupDate);
    const isDropoffToday = isToday(dropoffDate);

    if (isPickupToday || isDropoffToday) {

        pickupInfo.textContent = `${booking.car.reg}` + "\t|\t" + `${booking.iterator.pickup_date} - ${booking.iterator.dropoff_date}`.replaceAll("T", " ") + " | " + booking.iterator.user;
        bookingPanel.appendChild(pickupInfo);

        const separator = document.createElement("div");
        separator.setAttribute("class", "separator");
        bookingPanel.appendChild(separator);

    } else {
        return;
    }

}

document.addEventListener('DOMContentLoaded', function () {
    const bookingPanel = document.getElementById('my-booking-panel');

    if (bookingPanel) {
        // Your code to load bookings and append child elements goes here
        loadBookings();
    } else {
        console.error("Element with id 'my-booking-panel' not found in the DOM.");
    }
});

async function removeAllBookingEntities() {
    const parentContainer = document.getElementById("booking-entities");
    while (parentContainer.firstChild) {
        parentContainer.removeChild(parentContainer.firstChild);
    }
}