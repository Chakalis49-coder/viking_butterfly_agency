const width = 850;
const height = 1100; // ✅ un peu plus grand pour éviter coupure
const offsetY = -20;

// ✅ SVG RESPONSIVE (FIX PRINCIPAL)
const svg = d3.select("#tree")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`) // ✅ dynamique
    .style("width", "100%")
    .style("height", "auto"); // ✅ IMPORTANT

// ------------------
// ✅ NODES
// ------------------

const nodes = [
    { id: "profil-fondateur1", name: "Fondateur Vikédium", x: 283, y: 80 + offsetY, role: "founder", img: "img/tree/0.1_Vikedium.png" },
    { id: "profil-fondateur2", name: "Fondateur Ragnar", x: 567, y: 80 + offsetY, role: "founder", img: "img/tree/0.2_Ragnar.png" },

    { id: "profil-direction1", name: "Directeur Chakalis49", x: 150, y: 220 + offsetY, role: "director", img: "img/tree/0.3_Chakalis49.png" },
    { id: "profil-direction2", name: "Directrice Licorne", x: 700, y: 220 + offsetY, role: "director", img: "img/tree/0.4_Licorne.png" },
		
    { id: "profil-manager1", name: "Manageuse Manon", x: 425, y: 360 + offsetY, role: "manager", img: "img/tree/0.5_Manon.png" },

    { id: "profil-agent_odin", name: "Agent Loulou", x: 150, y: 520 + offsetY, img: "img/tree/Odin_Loulou.png" },
    { id: "profil-agent_loki", name: "Agente Gwen", x: 425, y: 520 + offsetY, img: "img/tree/Loki_Gwen.png" },
    { id: "profil-agent_guerrier", name: "Agente Dine", x: 700, y: 520 + offsetY, img: "img/tree/Guerrier_Dine.png" }
];

// ------------------
// ✅ LIENS
// ------------------

const links = [
    ["profil-fondateur1", "profil-direction1"],
    ["profil-fondateur1", "profil-direction2"],
    ["profil-fondateur2", "profil-direction1"],
    ["profil-fondateur2", "profil-direction2"],

    ["profil-direction1", "profil-manager1"],
		["profil-direction1", "profil-manager1"],
    ["profil-direction2", "profil-manager1"],
    ["profil-direction2", "profil-manager1"],

		["profil-manager1", "profil-agent_odin"],
    ["profil-manager1", "profil-agent_loki"],
    ["profil-manager1", "profil-agent_guerrier"]
];

// ------------------
// ✅ COULEURS
// ------------------

function getColor(sourceId) {
    const node = nodes.find(n => n.id === sourceId);

    if (!node) return "#d4af37";
    if (node.role === "director") return "#d4af37";
    if (node.role === "manager") return "#c0c0c0";

    return "#d4af37";
}

// ------------------
// ✅ LIGNES
// ------------------

links.forEach(link => {

    const source = nodes.find(n => n.id === link[0]);
    const target = nodes.find(n => n.id === link[1]);

    if (!source || !target) return;

    const midY = (source.y + target.y) / 2;

    svg.append("line")
        .attr("x1", source.x)
        .attr("y1", source.y)
        .attr("x2", source.x)
        .attr("y2", midY)
        .attr("stroke", getColor(source.id))
        .attr("stroke-width", 2);

    svg.append("line")
        .attr("x1", source.x)
        .attr("y1", midY)
        .attr("x2", target.x)
        .attr("y2", midY)
        .attr("stroke", getColor(source.id))
        .attr("stroke-width", 2);

    svg.append("line")
        .attr("x1", target.x)
        .attr("y1", midY)
        .attr("x2", target.x)
        .attr("y2", target.y)
        .attr("stroke", getColor(source.id))
        .attr("stroke-width", 2);
});

// ------------------
// ✅ NODES
// ------------------

const node = svg.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .style("cursor", "pointer")
    .on("click", (event, d) => {
        window.location.href = `profils/${d.id}.html`;
    });

// IMAGE
node.append("image")
    .attr("href", d => d.img)
    .attr("x", -25)
    .attr("y", -55)
    .attr("width", 50)
    .attr("height", 50)
    .attr("clip-path", "circle(25px at 25px 25px)");

// CARD
node.append("rect")
    .attr("x", -70)
    .attr("y", -5)
    .attr("width", 140)
    .attr("height", 55)
    .attr("rx", 12)
    .attr("fill", "rgba(0,0,0,0.6)")
    .attr("stroke", d => {
        if (d.role === "founder") return "#d4af37";
        if (d.role === "director") return "#d4af37";
        if (d.role === "manager") return "#c0c0c0";
        return "#c0c0c0";
    })
    .attr("stroke-width", 2);

// TEXTE
node.append("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "white")
    .style("font-weight", "500")
    .attr("y", 20)
    .each(function(d) {

        const words = d.name.split(" ");
        const text = d3.select(this);

        let line1 = words[0];
        let line2 = words.slice(1).join(" ");

        text.append("tspan")
            .text(line1)
            .attr("x", 0)
            .attr("dy", line2 ? "-6" : "0");

        if (line2) {
            text.append("tspan")
                .text(line2)
                .attr("x", 0)
                .attr("dy", "14");
        }
    });
