document.addEventListener("DOMContentLoaded", () => {

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
    // ✅ MATCHS
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

                    const id = "count-" + event.date.replace(/-/g, "") + event.heure.replace(":", "");

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

                    // CALENDAR
                    card.querySelector(".calendar-btn").addEventListener("click", () => {
                        const date = event.date.replace(/-/g, "");
                        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${date}/${date}`;
                        window.open(url, "_blank");
                    });

                    // SHARE
                    card.querySelector(".share-btn").addEventListener("click", async () => {

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
        });

    // =========================
    // ✅ EVENTS + CHALLENGE
    // =========================
    function loadRange(path) {
        fetch(path)
            .then(res => res.json())
            .then(data => {

                if (!document.getElementById("challenge-title")) return;

                document.getElementById("challenge-title").textContent = data.title;
                document.getElementById("challenge-date").textContent =
                    "📅 " + formatDate(data.date_start) + " → " + formatDate(data.date_end);

                document.getElementById("challenge-heure").textContent =
                    "🕒 " + data.heure_start + " → " + data.heure_end;

                document.getElementById("challenge-image").src = data.image;

                startRangeCountdown(
                    data.date_start,
                    data.heure_start,
                    data.date_end,
                    data.heure_end,
                    "challenge-countdown"
                );
            });
    }

    loadRange(EVENTS_PATH);
    loadRange(CHALLENGE_PATH);

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
// ✅ FORMAT COUNTDOWN SMART
// =========================
function formatCountdown(diff) {

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    if (d > 0) return `${d}j ${h}h ${m}m ${s}s`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
}

// =========================
// ✅ MATCH COUNTDOWN
// =========================
function startMatchCountdown(dateStr, heureStr, elementId) {

    const el = document.getElementById(elementId);
    if (!el) return;

    const baseTime = new Date(`${dateStr}T${heureStr}:00`).getTime();
    const startTime = baseTime - (15 * 60 * 1000);
    const endTime = baseTime + (15 * 60 * 1000);

    function update() {

        const now = Date.now();

        if (now < startTime) {

            el.classList.remove("blink");
            const diff = startTime - now;
            el.textContent = `⏳ Début dans ${formatCountdown(diff)}`;
        }

        else if (now >= startTime && now <= endTime) {

            el.textContent = "🔥 EN COURS";
            el.classList.add("blink");
        }

        else {

            el.classList.remove("blink");
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

        const now = Date.now();

        if (now < start) {

            el.classList.remove("blink");
            const diff = start - now;
            el.textContent = `⏳ ${formatCountdown(diff)}`;
        }

        else if (now >= start && now <= end) {

            el.textContent = "🔥 EN COURS";
            el.classList.add("blink");
        }

        else {

            el.classList.remove("blink");
            el.textContent = "✅ TERMINÉ";
        }
    }

    update();
    setInterval(update, 1000);
}
