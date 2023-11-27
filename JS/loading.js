export async function loadingAnimation() {
    const loadingDots = document.querySelectorAll('.loading-dot');

    for (const dot of loadingDots) {
        dot.classList.add('animate-loading');
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100 milliseconds (0.1 seconds)
    }
}

export async function createLodingAnimation(parentContainer) {

    if (parentContainer == null) {
        return;
    }

    const loading_container = document.createElement("div");
    loading_container.setAttribute("class", "loading");

    for (let i = 0; i < 3; i++) {

        const dot = document.createElement("div");
        dot.setAttribute("class", "loading-dot");
        loading_container.appendChild(dot);

    }

    parentContainer.appendChild(loading_container);

    loadingAnimation();

}

export function removeLoadingContainer() {
    //Remove the loading dots
    const loading = document.querySelector(".loading");
    if (loading != null) {
        loading.parentElement.removeChild(loading);
    }
}