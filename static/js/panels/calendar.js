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

function googleSignout() {
	fetch('/signout', {
		method: 'POST',
		headers: {
            'App': 'calendar',
		}
	})
    .then(response => response.json())
    .then(data => {
        if (data.signed_out) {
            document.getElementById("authorize-button").style.display = "inline";
            document.getElementById("signout-button").style.display = "none";
            document.getElementById("main-title").textContent = "";
            document.getElementById("refresh").style.display = "none";
            document.getElementById("schedule-container").style.display = "none";
            document.getElementById('calendar-link').style.display = "none";
            document.getElementById('initial-view').style.display = "block";

            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    });
}

function googleAuthorize(check) {
    fetch('/authorize', {
		method: 'GET',
		headers: {
            'Check': check,
            'App': 'calendar',
		}
	})
	.then(response => response.json())
	.then(data => {
        document.getElementById("schedule-view").style.display = "none";

        if (data.authorized) {
            document.getElementById('initial-view').style.display = "none";

            renderSchedule(data.events);

            document.getElementById("user-email").textContent = data.user_email;
            document.getElementById("calendar-link").style.display = 'block';

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
            if (check == "0") {
                window.open(data.auth_url, "_blank", "width=600,height=800");
            }
		}
	})
}

function updateScheduleDate() {
    const scheduleDateElement = document.getElementById('schedule-date');
    const currentDate = new Date();
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(currentDate);
    scheduleDateElement.textContent = `- ${formattedDate} -`;
}

function formatEventTime(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startFormatted = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(startDate);
    const endFormatted = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(endDate);

    const sameDay = startDate.toDateString() === endDate.toDateString();

    if (sameDay) {
        return `${startFormatted} - ${endFormatted}`;
    } else {
        const options = { month: 'short', day: 'numeric' };
        const formattedEndDate = new Intl.DateTimeFormat('en-US', options).format(endDate);
        return `${startFormatted} - ${formattedEndDate}, ${endFormatted}`;
    }
}

function renderSchedule(events) {
    const scheduleView = document.getElementById('schedule-view');
    scheduleView.innerHTML = '';

    updateScheduleDate();

    const allDayEvents = events.filter(event => !event.start.includes('T'));
    const timeSpecificEvents = events.filter(event => event.start.includes('T'));

    const now = new Date();

    if (allDayEvents.length > 0) {
        allDayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'schedule-event all-day';
            eventElement.innerHTML = `
                <div class="event-title">${event.title}</div>
                <div class="event-time">All Day</div>
            `;
            scheduleView.appendChild(eventElement);
        });
    }

    if (timeSpecificEvents.length > 0) {
        timeSpecificEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'schedule-event';

            const eventEndTime = new Date(event.end);
            if (now > eventEndTime) {
                eventElement.classList.add('ended');
            }

            const eventTime = formatEventTime(event.start, event.end);
            eventElement.innerHTML = `
                <div>${event.title}</div>
                <div class="event-time">${eventTime}</div>
            `;
            scheduleView.appendChild(eventElement);
        });
    }

    if (events.length === 0) {
        scheduleView.innerHTML = '<div class="schedule-event">No events for today</div>';
    }

    scheduleView.style.display = "block";
}

function refresh(type, behaviour) {
    const scheduleView = document.getElementById("schedule-view");

    const hasTokens = document.cookie.split('; ').some(cookie => {
        return cookie.startsWith('access_token=') || cookie.startsWith('refresh_token=');
    });

    if (behaviour === "load" && !hasTokens) {
        scheduleView.style.display = "none";
        document.getElementById('initial-view').style.display = "block";
    } else if (behaviour === "active") {
        scheduleView.style.display = "none";
    }

    googleAuthorize(type);
}
