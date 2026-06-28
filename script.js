document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // ✅ PATH AUTO
    // =========================
    const isSubPage = window.location.pathname.includes("/pages/");

    const MATCHS_PATH = isSubPage ? "../matchs.json" : "matchs.json";
    const EVENTS_PATH = isSubPage ? "../events.json" : "events.json";
    const CHALLENGE_PATH = isSubPage ? "../challenge.json" : "challenge.json";

    // =========================
    // ✅ MENU BURGER
    // =========================
    const hamburger = document.getElementById("hamburger") || document.querySelector(".hamburger");
    const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });

        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
            });
        });
    }

    let currentEvent = null;

    // =========================
    // ✅ MATCHS (15 MIN AVANT/APRÈS)
    // =========================
    fetch(MATCHS_PATH)
        .then(res => res.json())
        .then(events => {

            const now = new Date();

            const nextEvent = events
                .map(e => ({ ...e, dateObj: new Date(e.date + "T" + e.heure) }))
                .filter(e => e.dateObj >= now)
                .sort((a, b) => a.dateObj - b.dateObj)[0];

            if (nextEvent && document.getElementById("event-title")) {

                currentEvent = nextEvent;

                document.getElementById("event-title").textContent = nextEvent.title;
                document.getElementById("event-date").textContent = "📅 " + formatDate(nextEvent.date);
                document.getElementById("event-heure").textContent = "🕒 " + nextEvent.heure;
                document.getElementById("event-image").src = nextEvent.image;

                startMatchCountdown(nextEvent.date, nextEvent.heure, "event-countdown");
            }

            const container = document.getElementById("events-container");

            if (container) {

                events.forEach(event => {

                    const card = document.createElement("div");
                    card.classList.add("event-card");

                    const id = "count-" + event.date.replace(/-/g, "");
                    const imagePath = isSubPage ? "../" + event.image : event.image;

                    card.innerHTML = `
                        <img src="${imagePath}" alt="event">
                        <h3>${event.title}</h3>
                        <p>📅 ${formatDate(event.date)}</p>
                        <p class="event-heure">🕒 ${event.heure}</p>
                        <p class="countdown" id="${id}"></p>

                        <button class="calendar-btn">Ajouter au calendrier</button>
                        <button class="share-btn">Partager</button>
                    `;

                    container.appendChild(card);

                    startMatchCountdown(event.date, event.heure, id);

                    // ✅ CALENDAR
                    const btn = card.querySelector(".calendar-btn");
                    btn.addEventListener("click", () => {
                        const date = event.date.replace(/-/g, "");
                        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${date}/${date}`;
                        window.open(url, "_blank");
                    });

                    // ✅ SHARE
                    const shareBtn = card.querySelector(".share-btn");

                    shareBtn.addEventListener("click", async () => {

                        const text = `${event.title}
📅 ${formatDate(event.date)}
🕒 ${event.heure}

🔥 Rejoins-nous en live !
https://www.tiktok.com/${event.alias}`;

                        const imageUrl = isSubPage ? "../" + event.image : event.image;

                        if (navigator.share && navigator.canShare) {

                            try {
                                const response = await fetch(imageUrl);
                                const blob = await response.blob();
                                const file = new File([blob], "event.jpg", { type: blob.type });

                                await navigator.share({
                                    title: event.title,
                                    text: text,
                                    files: [file]
                                });

                            } catch {
                                await navigator.share({
                                    title: event.title,
                                    text: text,
                                    url: `https://www.tiktok.com/${event.alias}`
                                });
                            }

                        } else {
                            navigator.clipboard.writeText(text);
                            alert("Texte copié 📋");
                        }
                    });
                });
            }

            // ✅ WIDGET BUTTONS
            const calendarBtn = document.getElementById("calendarBtn");
            if (calendarBtn) {
                calendarBtn.addEventListener("click", () => {
                    if (!currentEvent) return;

                    const date = currentEvent.date.replace(/-/g, "");
                    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(currentEvent.title)}&dates=${date}/${date}`;
                    window.open(url, "_blank");
                });
            }

            const shareBtnWidget = document.getElementById("shareBtn");
            if (shareBtnWidget) {
                shareBtnWidget.addEventListener("click", async () => {

                    if (!currentEvent) return;

                    const text = `${currentEvent.title}
📅 ${formatDate(currentEvent.date)}
🕒 ${currentEvent.heure}

🔥 Rejoins-nous en live !
https://www.tiktok.com/${currentEvent.alias}`;

                    if (navigator.share && navigator.canShare) {
                        try {
                            const response = await fetch(currentEvent.image);
                            const blob = await response.blob();
                            const file = new File([blob], "event.jpg", { type: blob.type });

                            await navigator.share({
                                title: currentEvent.title,
                                text: text,
                                files: [file]
                            });
                        } catch {
                            await navigator.share({
                                title: currentEvent.title,
                                text: text,
                                url: `https://www.tiktok.com/${currentEvent.alias}`
                            });
                        }
                    } else {
                        navigator.clipboard.writeText(text);
                        alert("Texte copié 📋");
                    }
                });
            }
        })
        .catch(err => console.error("Erreur matchs:", err));

    // =========================
    // ✅ EVENTS (START / END)
    // =========================
    fetch(EVENTS_PATH)
        .then(res => res.json())
        .then(event => {

            if (!document.getElementById("challenge-title")) return;

            document.getElementById("challenge-title").textContent = event.title;
            document.getElementById("challenge-date").textContent =
                "📅 " + formatDate(event.date_start) + " → " + formatDate(event.date_end);

            document.getElementById("challenge-heure").textContent =
                "🕒 " + event.heure_start + " → " + event.heure_end;

            document.getElementById("challenge-image").src = event.image;

            startRangeCountdown(
                event.date_start,
                event.heure_start,
                event.date_end,
                event.heure_end,
                "challenge-countdown"
            );
        })
        .catch(err => console.error("Erreur events:", err));

    // =========================
    // ✅ CHALLENGE
    // =========================
    fetch(CHALLENGE_PATH)
        .then(res => res.json())
        .then(challenge => {

            document.getElementById("challenge-title").textContent = challenge.title;
            document.getElementById("challenge-date").textContent =
                "📅 " + formatDate(challenge.date_start) + " → " + formatDate(challenge.date_end);

            document.getElementById("challenge-heure").textContent =
                "🕒 " + challenge.heure_start + " → " + challenge.heure_end;

            document.getElementById("challenge-image").src = challenge.image;

            startRangeCountdown(
                challenge.date_start,
                challenge.heure_start,
                challenge.date_end,
                challenge.heure_end,
                "challenge-countdown"
            );
        })
        .catch(err => console.error("Erreur challenge:", err));

});


// =========================
// ✅ FORMAT DATE
// =========================
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// =========================
// ✅ MATCH COUNTDOWN (15 MIN)
// =========================
function startMatchCountdown(dateStr, heureStr, elementId) {

    const el = document.getElementById(elementId);
    if (!el) return;

    const baseTime = new Date(`${dateStr}T${heureStr}:00`).getTime();

    const startTime = baseTime - (15 * 60 * 1000);
    const endTime = baseTime + (15 * 60 * 1000);

    function update() {

        const now = new Date().getTime();

        if (now < startTime) {
            const diff = startTime - now;

            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            el.textContent = `⏳ Début dans ${m}m ${s}s`;
        }

        else if (now >= startTime && now <= endTime) {
            el.textContent = "🔥 EN COURS";
        }

        else {
            el.textContent = "✅ TERMINÉ";
        }
    }

    update();
    setInterval(update, 1000);
}


// =========================
// ✅ RANGE COUNTDOWN
// =========================
function startRangeCountdown(dateStart, heureStart, dateEnd, heureEnd, elementId) {

    const el = document.getElementById(elementId);
    if (!el) return;

    const start = new Date(`${dateStart}T${heureStart}:00`).getTime();
    const end = new Date(`${dateEnd}T${heureEnd}:00`).getTime();

    function update() {

        const now = new Date().getTime();

        if (now < start) {

            const diff = start - now;

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);

            el.textContent = `⏳ ${d}j ${h}h ${m}m`;
        }

        else if (now >= start && now <= end) {
            el.textContent = "🔥 EN COURS";
        }

        else {
            el.textContent = "✅ TERMINÉ";
        }
    }

    update();
    setInterval(update, 1000);
}
