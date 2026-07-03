const padGrid = document.getElementById('padGrid');
 
for (let i = 0; i <= 31; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.index = i;
    slot.innerHTML = `<span class="idx">S${i}</span>`;
    padGrid.appendChild(slot);
}

function buildShortcutChips(shortcuts, sidebarSelector = 'aside') {
  const sidebar = document.querySelector(sidebarSelector);

  // Clear out any previously generated categories (keeps the search bar intact)
  sidebar.querySelectorAll('.category').forEach(el => el.remove());

  for (const [categoryName, items] of Object.entries(shortcuts)) {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'category';

    // Strip the trailing emoji from keys like "Durations ⏱️" -> "Durations"
    const heading = document.createElement('h2');
    heading.textContent = categoryName.replace(/\s*\p{Extended_Pictographic}\s*$/u, '').trim();
    categoryEl.appendChild(heading);

    const chipGrid = document.createElement('div');
    chipGrid.className = 'chip-grid';

    items.forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.draggable = true;
      chip.dataset.name = item.title;
      chip.dataset.desc = item.description;
      if (item.icon) chip.dataset.icon = item.icon;

      if (item.icon) {
        const img = document.createElement('img');
        img.src = item.icon;
        img.alt = item.title;
        img.className = 'chip-icon';
        chip.appendChild(img);
      } else {
        // No icon generated yet — fall back to the first letter so the
        // chip isn't an empty box while your SVG library is still growing
        const fallback = document.createElement('span');
        fallback.className = 'chip-fallback';
        fallback.textContent = item.title.charAt(0);
        chip.appendChild(fallback);
      }

      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.innerHTML = `<span class="name">${item.title}</span><span class="desc">${item.description}</span>`;
      chip.appendChild(tooltip);

      chip.addEventListener('dragstart', (e) => {
        draggedChip = {
          icon: item.icon || null,
          name: item.title,
          desc: item.description
        };
        e.dataTransfer.effectAllowed = 'copy';
      });

      chipGrid.appendChild(chip);
    });

    categoryEl.appendChild(chipGrid);
    sidebar.appendChild(categoryEl);
  }
}

buildShortcutChips(shortcuts);