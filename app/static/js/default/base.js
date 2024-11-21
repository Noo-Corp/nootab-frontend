window.addEventListener("load", () => {
    const logo = document.querySelector('#logo img');
    logo.addEventListener('click', handleLogoClick);
});

function handleLogoClick() {
    const logo = document.getElementById('logo');
    const isLightMode = localStorage.getItem("colour-mode-back") === '#F5F5F5' || localStorage.getItem("colour-mode-back") === null;

    if (isLightMode) {
        animateLogo(logo);
    } else {
        animateZzzEffect();
        pulseLogo(logo);
    }
}

function animateLogo(logo) {
    logo.classList.remove('animate');
    void logo.offsetWidth;
    logo.classList.add('animate');
}

function animateZzzEffect() {
    const zzzContainer = document.querySelector(".zzz-container");
    const zzzChildren = zzzContainer.querySelectorAll("div");

    zzzChildren.forEach(child => {
        child.classList.add("zzz-animate");
        child.textContent = "Z";
        child.addEventListener("animationend", () => {
            child.classList.remove("zzz-animate");
            child.textContent = "";
        });
    });
}

function pulseLogo(logo) {
    logo.classList.remove('pulse');
    void logo.offsetWidth;
    logo.classList.add('pulse');
}
