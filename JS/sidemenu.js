const profileButton = document.getElementById('profile-button');
const profileMenu = document.getElementById('profile-menu');

var isActive = false;


profileButton.addEventListener('click', () => {


    if (isActive) {
        profileMenu.classList.remove("active");
        profileMenu.classList.add("inactive");
    } else {
        profileMenu.classList.remove("inactive");
        profileMenu.classList.add("active");
    }
    isActive = !isActive;

});