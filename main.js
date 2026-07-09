const padGrid = document.getElementById("padGrid");
const chipStatus = document.getElementById("chipStatus");
const shortcutIndex = buildShortcutIndex(shortcuts);
var draggedChip = null;

padGrid.addEventListener("dragover", (e) => {
    const slot = e.target.closest(".slot");
    if (!slot) return;
    e.preventDefault();
    slot.classList.add("drag-over");
});

padGrid.addEventListener("dragleave", (e) => {
    const slot = e.target.closest(".slot");
    if (slot) slot.classList.remove("drag-over");
});

padGrid.addEventListener("drop", (e) => {
    const slot = e.target.closest(".slot");
    if (!slot || !draggedChip) return;
    e.preventDefault();
    slot.classList.remove("drag-over");
    fillSlot(slot, draggedChip);
});

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
    if(getShortcutByIndex(i)) {
        fillSlot(slot, getShortcutByIndex(i));
    }
    padGrid.appendChild(slot);
}

function fillSlot(slot, targetChip) {
    const slotIndex = slot.getAttribute("data-index");
    var fragment = document.createDocumentFragment();
    
    var a = document.createElement("img");
    a.src = targetChip.icon !== null ? targetChip.icon : "./Icons/MuseScore/NoIcon.svg";
    
    fragment.appendChild(a);
    
    slot.innerHTML = "";
    slot.appendChild(fragment);
    
    bindShortcut(targetChip, slotIndex);
}

function bindShortcut(targetChip, index) {
    localStorage.setItem(`S${index}`, JSON.stringify(targetChip));
}

function getShortcutByIndex(index) {
    return JSON.parse(localStorage.getItem(`S${index}`));
}

function setChipStatus(name, desc, shortcut) {
    //chipStatus.textContent = desc ? `${name}: ${desc} - ${shortcut}`: "";
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
            chip.setAttribute("shortcut", compileShortcutText(item.shortkey1, item.shortkey2, item.shortkey3));
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
                    desc: item.description,
                    key1: item.shortkey1,
                    key2: item.shortkey2,
                    key3: item.shortkey3
                };
                e.dataTransfer.effectAllowed = "copy";
            });

            chip.addEventListener("mouseenter", () =>
                setChipStatus(item.title, item.description, chip.getAttribute("shortcut"))
            );
            //chip.addEventListener("mouseleave", () => setChipStatus());
            chip.addEventListener("focus", () =>
                setChipStatus(item.title, item.description, chip.getAttribute("shortcut"))
            );
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

function compileShortcutText(key1, key2, key3) {
    return `${key1}${key2 !== "" ? " + " : ""}${key2}${key3 !== "" ? " + " : ""}${key3}`;
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

document.getElementById("chipStatus").addEventListener("click", function () {
    document.getElementById("search").focus();
});

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        document.getElementById("search").focus();
    }
    if (event.key === "/" && !document.getElementById("search").matches(":focus")) {
        event.preventDefault();
        document.getElementById("search").focus();
    }
    if (event.key === "Escape") {
        document.getElementById("search").blur();
    }
});

buildShortcutChips(shortcuts);