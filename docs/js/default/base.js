window.addEventListener("load", function() {
    const logo = document.querySelector('#logo img');
	logo.addEventListener('click', logoClick);
});

function logoClick() {
	const logo = document.getElementById('logo');

	if (localStorage.getItem("colour-mode-back") === '#F5F5F5' || localStorage.getItem("colour-mode-back") === null) {
		logo.classList.remove('animate');
		void logo.offsetWidth;
		logo.classList.add('animate');
	} else {
		const zzz_container = document.querySelector(".zzz-container");
		const zzz_children = zzz_container.querySelectorAll("div");
		zzz_children.forEach(function(child) {
			child.classList.add("zzz-animate");
			child.textContent = "Z";
			child.addEventListener("animationend", function() {
				child.classList.remove("zzz-animate");
				child.textContent = "";
			});
		});
		logo.classList.remove('pulse');
		void logo.offsetWidth;
		logo.classList.add('pulse');
	}
}