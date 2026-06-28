document.addEventListener("DOMContentLoaded", () => {

	const isSubPage = window.location.pathname.includes("/pages/");

	const MATCHS_PATH = isSubPage ? "../matchs.json" : "matchs.json";
	const EVENTS_PATH = isSubPage ? "../events.json" : "events.json";
	const CHALLENGE_PATH = isSubPage ? "../challenge.json" : "challenge.json";

	// ✅ MENU
	const hamburger = document.getElementById("hamburger");
	const navLinks = document.getElementById("navLinks");

	if (hamburger && navLinks) {
		hamburger.addEventListener("click", () => {
			navLinks.classList.toggle("active");
		});
	}

	// =========================
	// ✅ MATCH
	// =========================
	fetch(MATCHS_PATH)
		.then(res => res.json())
		.then(data => {

			const now = new Date();

			const next = data
				.map(e => ({ ...e, dateObj: new Date(e.date + "T" + e.heure) }))
				.filter(e => e.dateObj >= now)
				.sort((a, b) => a.dateObj - b.dateObj)[0];

			if (!next) return;

			document.getElementById("match-title").textContent = next.title;
			document.getElementById("match-date").textContent = "📅 " + formatDate(next.date);
			document.getElementById("match-heure").textContent = "🕒 " + next.heure;
			document.getElementById("match-image").src = next.image;

			startMatchCountdown(next.date, next.heure, "match-countdown");

			// ✅ BOUTONS
			document.getElementById("calendarBtn").onclick = () => {
				const date = next.date.replace(/-/g, "");
				window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${next.title}&dates=${date}/${date}`);
			};

			document.getElementById("shareBtn").onclick = () => {
				navigator.clipboard.writeText(`${next.title} ${next.date} ${next.heure}`);
				alert("Copié ✅");
			};
		});

	// =========================
	// ✅ EVENT PAGE (LISTE)
	// =========================
	fetch(EVENTS_PATH)
		.then(res => res.json())
		.then(events => {

			// 👉 PAGE EVENTS
			const container = document.getElementById("events-container");

			if (container && Array.isArray(events)) {

				events.forEach(event => {

					const card = document.createElement("div");
					card.classList.add("event-card");

					card.innerHTML = `
                        <img src="${isSubPage ? "../" + event.image : event.image}">
                        <h3>${event.title}</h3>
                        <p>📅 ${formatDate(event.date)}</p>
                        <p>🕒 ${event.heure}</p>
                    `;

					container.appendChild(card);
				});
			}

			// 👉 ACCUEIL (1 EVENT)
			if (!Array.isArray(events)) {
				const event = events;

				if (!document.getElementById("event-title")) return;

				document.getElementById("event-title").textContent = event.title;
				document.getElementById("event-date").textContent = "📅 " + formatDate(event.date_start);
				document.getElementById("event-heure").textContent = "🕒 " + event.heure_start;
				document.getElementById("event-image").src = event.image;

				startRangeCountdown(
					event.date_start,
					event.heure_start,
					event.date_end,
					event.heure_end,
					"event-countdown"
				);
			}
		});

	// =========================
	// ✅ CHALLENGE
	// =========================
	fetch(CHALLENGE_PATH)
		.then(res => res.json())
		.then(c => {

			document.getElementById("challenge-title").textContent = c.title;
			document.getElementById("challenge-date").textContent =
				"📅 " + formatDate(c.date_start) + " → " + formatDate(c.date_end);

			document.getElementById("challenge-heure").textContent =
				"🕒 " + c.heure_start + " → " + c.heure_end;

			document.getElementById("challenge-image").src = c.image;

			startRangeCountdown(
				c.date_start,
				c.heure_start,
				c.date_end,
				c.heure_end,
				"challenge-countdown"
			);
		});

});

// =========================
// ✅ UTILS
// =========================
function formatDate(dateStr) {
	return new Date(dateStr).toLocaleDateString("fr-FR");
}

function formatCountdown(diff) {
	const h = Math.floor(diff / 3600000);
	const m = Math.floor((diff % 3600000) / 60000);
	const s = Math.floor((diff % 60000) / 1000);
	return `${h}h ${m}m ${s}s`;
}

function startMatchCountdown(date, heure, id) {
	const el = document.getElementById(id);
	if (!el) return;

	const base = new Date(`${date}T${heure}`).getTime();
	const start = base - 900000;
	const end = base + 900000;

	setInterval(() => {
		const now = Date.now();

		if (now < start) el.textContent = "⏳ " + formatCountdown(start - now);
		else if (now <= end) el.textContent = "🔥 EN COURS";
		else el.textContent = "✅ TERMINÉ";

	}, 1000);
}

function startRangeCountdown(ds, hs, de, he, id) {
	const el = document.getElementById(id);
	if (!el) return;

	const start = new Date(`${ds}T${hs}`).getTime();
	const end = new Date(`${de}T${he}`).getTime();

	setInterval(() => {
		const now = Date.now();

		if (now < start) el.textContent = "⏳ " + formatCountdown(start - now);
		else if (now <= end) el.textContent = "🔥 EN COURS";
		else el.textContent = "✅ TERMINÉ";

	}, 1000);
}
