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


const button = document.getElementById("logout");
const profileButton = document.getElementById('profile-button');
const profileMenu = document.getElementById('profile-menu');
const name = document.getElementById("name");

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
    const bookingPanel = document.getElementById('booking-entities'); // Get the booking panel div


    onValue(bilarRef, (snapshot) => {
        const data = snapshot.val();

        for (const carKey in data) {
            const car = data[carKey];


            if (car.bookings == null) {
                continue;
            }

            const bookings = Object.values(car.bookings);

            for (const iterator of bookings) {

                if (iterator.user != auth.currentUser.email) {
                    continue;
                }

                // Create a new div for each booking
                const bookingDiv = document.createElement('div');
                bookingDiv.classList.add('booking-entry'); // Add a CSS class for styling

                // Create a container for text content (left content)
                const textContentContainer = document.createElement('div');
                textContentContainer.classList.add('text-content');

                // Create content for the booking div
                const userInfo = document.createElement('h2');
                userInfo.textContent = `${car.reg}`;

                const pickupInfo = document.createElement('p');
                pickupInfo.textContent = "Starttid: " + `${iterator.pickup_date}`.replace("T", " ");

                const dropoffInfo = document.createElement('p');
                dropoffInfo.textContent = "Sluttid: " + `${iterator.dropoff_date}`.replace("T", " ");

                // Append the content to the text content container
                textContentContainer.appendChild(userInfo);
                textContentContainer.appendChild(pickupInfo);
                textContentContainer.appendChild(dropoffInfo);

                // Create a container for the "Remove" button (right content)
                const removeButtonContainer = document.createElement('div');
                removeButtonContainer.classList.add('remove-button-container');

                // Create a "Remove" button
                const removeButton = document.createElement('button');
                removeButton.setAttribute('class', 'booking-button');
                removeButton.setAttribute('id', 'remove-button');
                removeButton.textContent = 'Avboka';
                removeButton.addEventListener("click", async function () {
                    await removeBooking(carKey, iterator.booking_id);
                    await removeAllBookingEntities();
                    await loadBookings();
                });

                // Append the "Remove" button to its container
                removeButtonContainer.appendChild(removeButton);

                // Append the text content container and remove button container to the booking div
                bookingDiv.appendChild(textContentContainer);
                bookingDiv.appendChild(removeButtonContainer);

                // Append the booking div to the booking panel
                bookingPanel.appendChild(bookingDiv);
            }

        }

        if (bookingPanel.children.length <= 0) {

            const bookingDiv = document.createElement('div');
            bookingDiv.setAttribute('id', 'prompt');

            const dropoffInfo = document.createElement('p');
            dropoffInfo.textContent = "Jag har inga aktuella bokningar.";

            bookingDiv.appendChild(dropoffInfo);
            bookingPanel.appendChild(bookingDiv);
        }

    });

}

async function removeBooking(carKey, bookingId) {
    // Show a confirmation dialog
    const confirmed = window.confirm("Är du säker på att du vill ta bort den här bokningen?");

    if (confirmed) {
        // Construct an object to remove the specific child node
        const updates = {};
        updates[`cars/${carKey}/bookings/${bookingId}`] = null;

        // Use update to remove the booking entry
        update(ref(database), updates)
            .then(() => {

            })
            .catch((error) => {
                console.error(`Error removing booking: ${error}`);
            });
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