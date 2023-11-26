
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getDatabase, ref, push, onValue, update, child, set } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
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

function setMinTime() {
    // Function to format the date in YYYY-MM-DDT00:00 format
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    function formatDropoffDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours() + 1).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Get the current date and time
    const currentDate = new Date();
    const currentDateTime = formatDate(currentDate);
    const dropoffTime = formatDropoffDate(currentDate);

    // Set the min and value attributes for pickup-date input
    const pickupDateInput = document.getElementById("pickup-date");
    pickupDateInput.setAttribute("min", currentDateTime);
    pickupDateInput.setAttribute("value", currentDateTime);

    // Set the min attribute for dropoff-date input, initially same as pickup date
    const dropoffDateInput = document.getElementById("dropoff-date");
    dropoffDateInput.setAttribute("min", currentDateTime);
    dropoffDateInput.setAttribute("value", currentDateTime);

    // Add an event listener to pickupDateInput to update the min attribute of dropoffDateInput when it changes
    pickupDateInput.addEventListener("change", function () {
        dropoffDateInput.setAttribute("min", pickupDateInput.value);
    });
}


// Call setMinTime when the document is fully loaded
window.onload = setMinTime;


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const database = getDatabase(app)

const button = document.getElementById("logout");
const search = document.getElementById("search");
const dropoff_date = document.getElementById("dropoff-date");
const pickup_date = document.getElementById("pickup-date");
const name = document.getElementById("name");



search.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get the values of the pickup and dropoff date input fields
    const pickupDateInput = document.getElementById("pickup-date");
    const dropoffDateInput = document.getElementById("dropoff-date");

    pickupDateInput.addEventListener("input", function () {
        removeAllCarEntities();
    });

    dropoffDateInput.addEventListener("input", function () {
        removeAllCarEntities();
    });

    // Parse the input values as Date objects
    const pickupDate = new Date(pickupDateInput.value);
    const dropoffDate = new Date(dropoffDateInput.value);

    // Calculate the minimum allowed dropoff time (15 minutes after pickup time)
    const minDropoffTime = new Date(pickupDate);
    minDropoffTime.setMinutes(minDropoffTime.getMinutes() + 15);

    if (dropoffDate <= pickupDate || dropoffDate < minDropoffTime) {
        alert("Bil kan inte bokas kortare än 15 minuter.");
    } else {
        searchCars();
    }
});


function searchCars() {

    removeAllCarEntities();

    // Hämta alla bilar från databasen
    const bilarRef = ref(database, 'cars');

    onValue(bilarRef, (snapshot) => {
        const data = snapshot.val();
        addCarEntitiesToContainer(data);

    });

}


function bookCar(reg, pickupDate, dropoffDate, user, booking_id) {

    removeAllCarEntities();

    // Get a key for a new Post.
    const newPostKey = push(child(ref(database), "cars/" + reg + "/bookings/")).key;

    // Create a booking object with separate values
    const bookingData = {
        pickup_date: pickupDate,
        dropoff_date: dropoffDate,
        user: user,
        booking_id: booking_id
    };

    // Use the booking_id as the key for the booking in the database
    const bookingKey = booking_id;

    // Set the booking data under the specified path
    const bookingRef = ref(database, `cars/${reg}/bookings/${bookingKey}`);

    // Use the set function to add the booking to the database
    set(bookingRef, bookingData)
        .then(() => {


            // console.log(`Booking with ID ${booking_id} added successfully.`);
        })
        .catch((error) => {
            // console.error(`Error adding booking: ${error}`);
        });


}


button.addEventListener("click", async function () {
    try {
        await logout();
    } catch (error) {
        // Handle any errors here
    }
});

async function logout() {
    await signOut(auth);
    window.location.href = "../HTML/index.html";
}

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

const profileButton = document.getElementById('profile-button');
const profileMenu = document.getElementById('profile-menu');

profileButton.addEventListener('click', () => {
    profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
});


monitorAuthState();

// Assuming you have a parent container where you want to add these car entities
const parentContainer = document.getElementById("cars-container");

// Function to create a new car entity
function createCarEntity(licensePlate, radio, utryckning, carKey, index) {

    // Create the main div for the car
    const carDiv = document.createElement("div");
    carDiv.classList.add("car");

    //Delay animation
    const animationDelay = index * 0.1; // Adjust the delay as needed
    carDiv.style.animationDelay = `${animationDelay}s`;


    // Set the car key as a data attribute
    carDiv.dataset.carKey = carKey;

    // Create the div for car details
    const carDetailsDiv = document.createElement("div");
    carDetailsDiv.classList.add("car-details");

    // Create the heading for license plate and model
    const heading = document.createElement("h1");
    heading.textContent = `${licensePlate}`;

    // Create a paragraph for radio and utryckning
    const details = document.createElement("p");
    details.textContent = `Radio: ${radio} Utryckning: ${utryckning}`;

    // Append the heading and details to the car details div
    carDetailsDiv.appendChild(heading);
    carDetailsDiv.appendChild(details);

    // Create a button for booking
    const bookingButton = document.createElement("button");
    bookingButton.classList.add("booking-button");
    bookingButton.textContent = "Boka";

    // Append car details and booking button to the main car div
    carDiv.appendChild(carDetailsDiv);
    carDiv.appendChild(bookingButton);

    // Append the car div to the parent container
    parentContainer.appendChild(carDiv);
}

// Function to create and add car entities to the parent container
function addCarEntitiesToContainer(carsData) {

    var index = 0;

    for (const carKey in carsData) {
        const car = carsData[carKey];

        var carAvailable = true;

        if (car.bookings != null) {

            const bookings = Object.values(car.bookings);

            for (const iterator of bookings) {

                const intersects = checkDateIntersection(

                    pickup_date.value,  // Use the correct format for your input field
                    dropoff_date.value, // Use the correct format for your input field
                    iterator.pickup_date,
                    iterator.dropoff_date
                );

                if (intersects) {
                    carAvailable = false
                }

            }

        }
        // Check if bluelightsCheckbox is true and the car has bluelights
        // OR if bluelightsCheckbox is false (show all cars)
        const showBluelights = bluelights.checked ? car.bluelights : true;

        // Check if radioCheckbox is true and the car has radio
        // OR if radioCheckbox is false (show all cars)
        const showRadio = radio.checked ? car.radio : true;

        // Only create a car entity if both conditions are met
        if (showBluelights && showRadio && carAvailable) {
            createCarEntity(car.reg, car.radio, car.bluelights, carKey, index);
            index++;

        }

    }

    // Check if there are children in the parent container
    if (parentContainer.children.length > 0) {
        // parentContainer.style.display = "block"; // Set it to 'block' if it has children
    } else {
        // parentContainer.style.display = "none"; // Set it to 'none' if it has no children
        const details = document.createElement("p");
        details.textContent = "Inga bilar matchar sökningen.";
        details.setAttribute("id", "no-search-results");
        parentContainer.appendChild(details);
    }

}

function checkDateIntersection(startDate1, endDate1, startDate2, endDate2) {
    // Check if the end date of the first time frame is before or equal to the start date of the second time frame
    // OR if the start date of the first time frame is after or equal to the end date of the second time frame
    // If either condition is true, there is no intersection.
    if (endDate1 <= startDate2 || startDate1 >= endDate2) {
        return false;
    }

    // If neither condition is true, there is an intersection.
    return true;
}

// Attach a click event listener to the parent container of car entities
parentContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("booking-button")) {
        // Find the car key associated with this button
        const carElement = event.target.closest(".car");
        const carKey = carElement.dataset.carKey;

        const user = auth.currentUser;
        const bookingID = generateBookingID();

        // Call the bookCar function with the carKey
        bookCar(carKey, pickup_date.value, dropoff_date.value, user.email, bookingID);
    }
});

function removeAllCarEntities() {
    const cars = document.querySelectorAll('.car');

    cars.forEach(car => {
        if (car.parentElement === parentContainer) {
            parentContainer.removeChild(car);
        }
    });
}








// Function to generate a unique booking ID
function generateBookingID() {
    const timestamp = new Date().getTime(); // Get current timestamp
    const random = Math.floor(Math.random() * 10000); // Generate a random number
    const bookingID = `${timestamp}${random}`; // Combine timestamp and random number
    return bookingID;
}

