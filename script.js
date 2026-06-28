document.addEventListener("DOMContentLoaded", () => {

    const isSubPage = window.location.pathname.includes("/pages/");

    const MATCHS_PATH = isSubPage ? "../matchs.json" : "matchs.json";
    const EVENTS_PATH = isSubPage ? "../events.json" : "events.json";
    const CHALLENGE_PATH = isSubPage ? "../challenge.json" : "challenge.json";

    // ✅ MENU
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    if (hamburger) {
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
        });

    // =========================
    // ✅ EVENT
    // =========================
    fetch(EVENTS_PATH)
        .then(res => res.json())
        .then(event => {

            if (!document.getElementById("event-title")) return;

            document.getElementById("event-title").textContent = event.title;
            document.getElementById("event-date").textContent =
                "📅 " + formatDate(event.date_start);

            document.getElementById("event-heure").textContent =
                "🕒 " + event.heure_start;

            document.getElementById("event-image").src = event.image;

            startRangeCountdown(
                event.date_start,
                event.heure_start,
                event.date_end,
                event.heure_end,
                "event-countdown"
            );
        });

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
        });

});

// =========================
// ✅ FORMAT DATE
// =========================
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// =========================
// ✅ FORMAT COUNTDOWN
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

    const base = new Date(`${dateStr}T${heureStr}:00`).getTime();
    const start = base - 15 * 60 * 1000;
    const end = base + 15 * 60 * 1000;

    function update() {

        const now = Date.now();

        if (now < start) {
            el.classList.remove("blink");
            el.textContent = `⏳ Début dans ${formatCountdown(start - now)}`;
        }
        else if (now <= end) {
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
            el.textContent = `⏳ ${formatCountdown(start - now)}`;
        }
        else if (now <= end) {
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
