const padGrid = document.getElementById("padGrid");
const chipStatus = document.getElementById("chipStatus");
const shortcutIndex = buildShortcutIndex(shortcuts);

for (let i = 0; i <= 31; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = i;
    slot.addEventListener("mouseenter", () =>
        setChipStatus("Slot S" + i, "Row " + ((i % 8) + 1) + " Column " + Math.floor(i / 8 + 1))
    );
    //chip.addEventListener("mouseleave", () => setChipStatus());
    slot.addEventListener("focus", () =>
        setChipStatus("Slot S" + i, "Row " + (i % 8) + " Column " + Math.floor(i / 8 + 1))
    );
    //chip.addEventListener("blur", () => setChipStatus());
    slot.innerHTML = `<span class="idx">S${i}</span>`;
    padGrid.appendChild(slot);
}

function setChipStatus(name, desc) {
    chipStatus.textContent = desc ? `${name}: ${desc}` : "";
}

function buildShortcutChips(shortcuts, sidebarSelector = "#menuContent") {
    const sidebar = document.querySelector(sidebarSelector);
    sidebar.querySelectorAll(".category").forEach((el) => el.remove());

    for (const [categoryName, items] of Object.entries(shortcuts)) {
        const categoryEl = document.createElement("div");
        categoryEl.className = "category";

        const heading = document.createElement("h2");
        heading.textContent = categoryName.replace(/\s*\p{Extended_Pictographic}\s*$/u, "").trim();
        categoryEl.appendChild(heading);

        const chipGrid = document.createElement("div");
        chipGrid.className = "chip-grid";

        items.forEach((item) => {
            const chip = document.createElement("div");
            chip.className = "chip";
            chip.draggable = true;
            chip.dataset.name = item.title;
            chip.dataset.desc = item.description;
            if (item.icon) chip.dataset.icon = item.icon;

            if (item.icon) {
                const img = document.createElement("img");
                img.src = item.icon;
                img.alt = item.title;
                img.className = "chip-icon";
                chip.appendChild(img);
            } else {
                const fallback = document.createElement("span");
                fallback.className = "chip-fallback";
                fallback.textContent = item.title.charAt(0);
                chip.appendChild(fallback);
            }

            /*const tooltip = document.createElement("div");
            tooltip.className = "tooltip";
            tooltip.innerHTML = `<span class="name">${item.title}</span><span class="desc">${item.description}</span>`;
            chip.appendChild(tooltip);*/

            chip.addEventListener("dragstart", (e) => {
                draggedChip = {
                    icon: item.icon || null,
                    name: item.title,
                    desc: item.description
                };
                e.dataTransfer.effectAllowed = "copy";
            });

            chip.addEventListener("mouseenter", () => setChipStatus(item.title, item.description));
            //chip.addEventListener("mouseleave", () => setChipStatus());
            chip.addEventListener("focus", () => setChipStatus(item.title, item.description));
            //chip.addEventListener("blur", () => setChipStatus());

            chipGrid.appendChild(chip);
        });

        categoryEl.appendChild(chipGrid);
        sidebar.appendChild(categoryEl);
    }
}

function searchShortcuts(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [...shortcutIndex.values()];

    return [...shortcutIndex.values()].filter(
        (item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
}

function buildShortcutIndex(shortcuts) {
    const index = new Map();

    for (const [category, items] of Object.entries(shortcuts)) {
        items.forEach((item) => {
            index.set(item.title, { ...item, category });
        });
    }

    return index;
}

function updateCategoryVisibility() {
    document.querySelectorAll(".category").forEach((category) => {
        const hasVisibleChip = [...category.querySelectorAll(".chip")].some((chip) => chip.style.display !== "none");

        category.style.display = hasVisibleChip ? "" : "none";
    });
}

document.getElementById("search").addEventListener("input", (e) => {
    const results = searchShortcuts(e.target.value);
    const matchingTitles = new Set(results.map((r) => r.title));

    document.querySelectorAll(".chip").forEach((chip) => {
        chip.style.display = matchingTitles.has(chip.dataset.name) ? "" : "none";
    });

    updateCategoryVisibility();
});

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        document.getElementById("search").focus();
    }
    if (event.key === "/" && !document.getElementById("search").matches(':focus')) {
        event.preventDefault();
        document.getElementById("search").focus();
    }
});

buildShortcutChips(shortcuts);