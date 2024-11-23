var refreshInterval = null;

window.onload = function() {
	refresh("1", "load");
};

function updateRefreshedAtTime() {
    const refreshedAtElement = document.getElementById("main-title");
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    refreshedAtElement.textContent = `Refreshed at ${currentTime}`;
}

function formatReceivedTime(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

function displayEmails(emails) {
	const emailListDiv = document.getElementById("email-list");
	emailListDiv.innerHTML = "<span>- UNREAD EMAILS -</span><ul>" + emails.map(email => {
        const subject = email.subject ? email.subject : "(no subject)";
        const formattedTime = formatReceivedTime(email.received_time);
        return `<li onclick="viewEmail(event, '${email.id}')">${subject} - ${email.from} - <span>${formattedTime}</span></li>`;
    }).join('') + "</ul>";
}

function viewEmail(event, emailId) {
    const listItem = event.target.closest('li');
    if (listItem.classList.contains('opened')) {
        listItem.classList.remove('opened');
        document.getElementById("content").style.display = "none";
        return;
    }

    const allEmails = document.querySelectorAll('#email-list ul li');
    allEmails.forEach(email => {
        email.classList.remove('opened');
    });
    listItem.classList.add('opened');

	fetch(`/view_email/${emailId}`, {
		method: 'GET',
		headers: {
			'Authorization': localStorage.getItem('gmail-token') + ' ' + localStorage.getItem('gmail-refresh-token'),
            'App': 'gmail',
		}
	})
	.then(response => response.json())
	.then(data => {
        const contentDiv = document.getElementById("content");

        if (data.error) {
            if (contentDiv.shadowRoot) {
                contentDiv.shadowRoot.innerHTML = "";
            } else {
                contentDiv.attachShadow({ mode: 'open' });
            }
            const shadowRoot = contentDiv.shadowRoot;
            shadowRoot.innerHTML = data.error;
            contentDiv.style.display = "table";
        } else if (data.content) {
            if (data.content == '<div dir="auto"></div>\r\n') {
                contentDiv.innerText = "(no content)";
            } else {
                if (contentDiv.shadowRoot) {
                    contentDiv.shadowRoot.innerHTML = "";
                } else {
                    contentDiv.attachShadow({ mode: 'open' });
                }

                data.content = data.content.replace(
                    /<div\s+dir=["']auto["'](.*?)>/,
                    '<div dir="auto"$1 style="padding: 22px 0;">'
                );

                
                const shadowRoot = contentDiv.shadowRoot;
                shadowRoot.innerHTML = data.content;
            }
            contentDiv.style.display = "table";
		}
	})
}

function googleSignout() {
	localStorage.removeItem('gmail-token');
	localStorage.removeItem('gmail-refresh-token');
	document.getElementById("authorize-button").style.display = "inline";
	document.getElementById("signout-button").style.display = "none";
	document.getElementById("email-list").innerHTML = "";
	document.getElementById("main-title").textContent = "";
    document.getElementById("refresh").style.display = "none";
    document.getElementById("content").style.display = "none";
    document.getElementById('gmail-link').style.display = "none";
    document.getElementById('initial-view').style.display = "block";

    clearInterval(refreshInterval);
    refreshInterval = null;
}

function googleAuthorize(check) {
    fetch('/authorize', {
		method: 'GET',
		headers: {
			'Authorization': localStorage.getItem('gmail-token') + ' ' + localStorage.getItem('gmail-refresh-token'),
            'Check': check,
            'App': 'gmail',
		}
	})
	.then(response => response.json())
	.then(data => {
        const contentDiv = document.getElementById("content");

        document.getElementById('email-list').innerHTML = '';
        contentDiv.style.display = "none";

        if (data.authorized) {
            document.getElementById('initial-view').style.display = "none";

			if (data.emails.length > 0) {
				displayEmails(data.emails);
			} else {
                if (contentDiv.shadowRoot) {
                    contentDiv.shadowRoot.innerHTML = "";
                } else {
                    contentDiv.attachShadow({ mode: 'open' });
                }
                const shadowRoot = contentDiv.shadowRoot;
                shadowRoot.innerHTML = `
                    <div style="
                        width: 100%;
                        background-color: var(--modeback);
                        color: var(--secondary);
                        font-weight: bold;
                        font-size: 12px;
                        position: absolute;
                        left: 0;
                        top: 46%;
                        transform: translateY(-50%);
                    ">
                        NO UNREAD EMAILS
                    </div>`;
                contentDiv.style.display = "table";
			}

            document.getElementById("user-email").textContent = data.user_email;
            document.getElementById("gmail-link").style.display = 'block';

            if (data.gmail_token && data.gmail_refresh_token) {
                localStorage.setItem('gmail-token', data.gmail_token);
                localStorage.setItem('gmail-refresh-token', data.gmail_refresh_token);
            }

			document.getElementById("authorize-button").style.display = "none";
			document.getElementById("signout-button").style.display = "inline";

            updateRefreshedAtTime();

            document.getElementById("refresh").style.display = "block";
        
            if (!refreshInterval) {
                refreshInterval = setInterval(() => {
                    refresh('1', 'passive');
                }, 5 * 60 * 1000);
            }
		} else {
			document.getElementById("authorize-button").style.display = "inline";
			document.getElementById("signout-button").style.display = "none";
		}
	})
}

function refresh(type, behaviour) {
    const emailList = document.getElementById("email-list");
    const content = document.getElementById("content");

    if (behaviour === "load" && (!localStorage.getItem("gmail-token") || !localStorage.getItem("gmail-refresh-token"))) {
        emailList.innerHTML = "";
        content.style.display = "none";
        document.getElementById('initial-view').style.display = "block";
    } else if (behaviour === "active") {
        emailList.innerHTML = "";
        content.style.display = "none";
    }

    googleAuthorize(type);
}
