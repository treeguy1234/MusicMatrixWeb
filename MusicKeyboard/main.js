const padGrid = document.getElementById("padGrid");
const chipStatus = document.getElementById('chipStatus');

for (let i = 0; i <= 31; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = i;
    slot.addEventListener("mouseenter", () => setChipStatus("Slot S" + i, "Row " + ((i%8)+1) + " Column " + Math.floor(i/8+1)));
    //chip.addEventListener("mouseleave", () => setChipStatus());
    slot.addEventListener("focus", () => setChipStatus("Slot S" + i, "Row " + i%8 + " Column " + Math.floor(i/8+1)));
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

buildShortcutChips(shortcuts);