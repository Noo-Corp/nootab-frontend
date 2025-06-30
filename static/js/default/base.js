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

function openData() {
    document.getElementById('dataModal').style.display = 'block';
}
  
function closeModal() {
    document.getElementById('dataModal').style.display = 'none';
}

function saveData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'nootab-data.json';
    link.click();
}

function uploadData() {
    document.getElementById('fileInput').click();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                for (const [key, value] of Object.entries(data)) {
                    localStorage.setItem(key, value);
                }
                location.reload();
            } catch (error) {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    }
  }

function clearData() {
    if (confirm('Are you sure you want to clear all data?')) {
        localStorage.clear();
        fetch('https://nootab-backend-159a708a7b1c.herokuapp.com/signout', {
            method: 'POST',
            credentials: "include",
            headers: {
                'App': 'all',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.signed_out) {
                location.reload();
            }
        });
    }
}

window.onclick = function (event) {
    const modal = document.getElementById('dataModal');
    if (event.target === modal) {
        closeModal();
    }
};