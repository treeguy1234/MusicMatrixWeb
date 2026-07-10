const padGrid = document.getElementById("padGrid");
const chipStatus = document.getElementById("chipStatus");
const exportCPPButton = document.getElementById("exportCPPButton");
const exportINIButton = document.getElementById("exportINIButton");
const shortcutIndex = buildShortcutIndex(shortcuts);

var draggedChip = null;
var draggedFromSlot = null;

var boundShortcuts = [];

var assignedCount = {
    number: 0,

    get count() {
        return this.number;
    },

    set count(newValue) {
        this.number = newValue;
        checkIfCanExport(newValue);
    }
};

const keyMap = {
    Ctrl: "KEY_LEFT_CTRL",
    Shift: "KEY_LEFT_SHIFT",
    Alt: "KEY_LEFT_ALT",
    Up: "KEY_UP_ARROW",
    Down: "KEY_DOWN_ARROW",
    Left: "KEY_LEFT_ARROW",
    Right: "KEY_RIGHT_ARROW",
    Del: "KEY_DELETE",
    Esc: "KEY_ESC",
    Ins: "KEY_INSERT",
    Home: "KEY_HOME",
    End: "KEY_END",
    PgUp: "KEY_PAGE_UP",
    PgDn: "KEY_PAGE_DOWN",
    Return: "KEY_RETURN",
    Space: "' '"
};

for (var i = 0; i < 32; i++) {
    boundShortcuts.push({});
}

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

    const targetIndex = slot.dataset.index;

    if (draggedFromSlot !== null && draggedFromSlot === targetIndex) {
        draggedChip = null;
        draggedFromSlot = null;
        return;
    }

    const originIndex = draggedFromSlot;
    fillSlot(slot, draggedChip);

    if (originIndex !== null) {
        const originSlot = padGrid.querySelector(`.slot[data-index="${originIndex}"]`);
        if (originSlot) unbindSlot(originSlot);
    }

    draggedChip = null;
    draggedFromSlot = null;
});

for (let i = 0; i <= 31; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = i;
    slot.addEventListener("mouseenter", function () {
        if (slot.getAttribute("customHint")) {
            setChipStatus("Slot S" + i, slot.getAttribute("customHint"), "", 1);
        } else {
            setChipStatus("Slot S" + i, "Row " + ((i % 8) + 1) + " Column " + Math.floor(i / 8 + 1), "", 0);
        }
    });
    slot.addEventListener("focus", function () {
        if (slot.getAttribute("customHint")) {
            setChipStatus("Slot S" + i, slot.getAttribute("customHint"), "", 1);
        } else {
            setChipStatus("Slot S" + i, "Row " + ((i % 8) + 1) + " Column " + Math.floor(i / 8 + 1), "", 0);
        }
    });
    slot.addEventListener("click", function () {
        unbindSlot(slot);
    });
    slot.innerHTML = `<span class="idx">S${i}</span>`;
    if (getShortcutByIndex(i)) {
        fillSlot(slot, getShortcutByIndex(i));
    }
    padGrid.appendChild(slot);
}

function fillSlot(slot, targetChip) {
    const slotIndex = slot.dataset.index;
    const wasAlreadyFilled = slot.classList.contains("filled");

    const img = document.createElement("img");
    img.src = targetChip.icon !== null ? targetChip.icon : "./Icons/MuseScore/NoIcon.svg";
    img.className = "chip-icon";
    img.alt = targetChip.name || "";
    img.draggable = true;

    img.addEventListener("dragstart", (e) => {
        draggedChip = { ...targetChip };
        draggedFromSlot = slotIndex;
        e.dataTransfer.effectAllowed = "move";
        e.stopPropagation();
    });

    slot.innerHTML = "";
    slot.appendChild(img);
    slot.classList.add("filled");

    bindShortcut(targetChip, slot, slotIndex, wasAlreadyFilled);
}

function bindShortcut(targetChip, slot, index, wasAlreadyFilled = false) {
    localStorage.setItem(`S${index}`, JSON.stringify(targetChip));
    slot.setAttribute("customHint", `${targetChip.name}: ${targetChip.desc}`);
    boundShortcuts[index].key1 = targetChip.key1;
    boundShortcuts[index].key2 = targetChip.key2;
    boundShortcuts[index].key3 = targetChip.key3;
    if (!wasAlreadyFilled) assignedCount.count++;
}

function checkIfCanExport(number = assignedCount.count) {
    if (number < 32) {
        exportCPPButton.disabled = true;
        exportINIButton.disabled = true;
    } else {
        exportCPPButton.disabled = false;
        exportINIButton.disabled = false;
    }
}

function unbindSlot(slot) {
    if (!slot.classList.contains("filled")) return;

    const index = slot.dataset.index;
    localStorage.removeItem(`S${index}`);
    slot.removeAttribute("customHint");
    slot.classList.remove("filled");
    slot.innerHTML = `<span class="idx">S${index}</span>`;

    assignedCount.count--;
}

function getShortcutByIndex(index) {
    return JSON.parse(localStorage.getItem(`S${index}`));
}

function setChipStatus(name, desc, shortcut, divider) {
    //chipStatus.textContent = desc ? `${name}: ${desc} - ${shortcut}`: "";

    chipStatus.textContent = desc ? `${name}${divider == 0 ? ":" : " -"} ${desc}` : "";
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
                draggedFromSlot = null; // NEW
                e.dataTransfer.effectAllowed = "copy";
            });

            chip.addEventListener("mouseenter", () =>
                setChipStatus(item.title, item.description, chip.getAttribute("shortcut"), 0)
            );
            //chip.addEventListener("mouseleave", () => setChipStatus());
            chip.addEventListener("focus", () =>
                setChipStatus(item.title, item.description, chip.getAttribute("shortcut"), 0)
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

function buildCPP() {
    for (var r = 0; r < 32; r++) {
        for (var c = 0; c < 3; c++) {
            mainCPP = mainCPP.replace(`R${r + 1}C${c + 1}`, stringToKey(boundShortcuts[r][`key${c + 1}`]));
        }
    }
    navigator.clipboard.writeText(mainCPP);
    return mainCPP;
}

function buildINI() {
    for (var r = 0; r < 32; r++) {
        for (var c = 0; c < 3; c++) {
            MusicMatrixINI = MusicMatrixINI.replace(
                `R${r + 1}C${c + 1}`,
                stringToKey(boundShortcuts[r][`key${c + 1}`])
            );
        }
    }
    navigator.clipboard.writeText(MusicMatrixINI);
    return MusicMatrixINI;
}

function stringToKey(input) {
    if (input == null || input === "") return "0";
    if (keyMap[input]) return keyMap[input];
    if (/^F\d{1,2}$/.test(input)) return `KEY_${input}`;
    return `'${input}'`;
}

function downloadGeneratedCode(filename, codeString) {
    const blob = new Blob([codeString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
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

document.getElementById("settingsButton").addEventListener("click", function () {
    localStorage.clear();
    window.location.reload();
});

document.getElementById("exportCPPButton").addEventListener("click", function () {
    downloadGeneratedCode("main.cpp", buildCPP());
});

document.getElementById("exportINIButton").addEventListener("click", function () {
    downloadGeneratedCode("MusicMatrix.ini", buildINI());
});

buildShortcutChips(shortcuts);
checkIfCanExport();