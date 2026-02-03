const form = document.querySelector("form");
const loading = document.getElementById("loadingOverlay");
const toast = document.getElementById("toast");

form.addEventListener("submit", () => {
    // Show loading
    loading.style.display = "flex";

    // Show toast
    showToast("Analyzing email...");
});

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Show success toast AFTER page reload (Flask POST)
window.addEventListener("load", () => {
    const hasResult = document.querySelector(".result-box");
    if (hasResult) {
        showToast("Analysis completed successfully ✔");
    }
});
