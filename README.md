
# MusicMatrix Web Code Builder

A browser-based configurator for **MusicMatrix**, a custom macro pad built for [MuseScore Studio 4](https://musescore.org/). Drag MuseScore shortcuts onto a 4×8 grid, and export ready-to-flash Arduino firmware.

![MusicMatrix configurator screenshot](https://i.ibb.co/TBP7WN62/Screen-Recording2026-07-11084328-ezgif-com-optimize.gif)

## Features

-   **Drag-and-drop assignment** - drag any of MuseScore's keyboard shortcuts from the sidebar library onto one of the 32 macro slots.
-   **Searchable shortcut library** - instantly filter by name or description (`Ctrl+K` or `/` to jump to search).
-   **Hover-to-preview** - hover or focus any icon to see its full name, description, and key combination before you commit it to a slot.
-   **Live status bar** - no more guessing which slot is which; hovering a slot shows its row/column position or its currently assigned shortcut.
-   **One-click export** - generates a ready-to-paste `shortcuts[][3]` array for the Arduino sketch, matching your exact layout.
-   **Persistent layout** - your grid is saved to the browser automatically (via `localStorage`), so refreshing the page won't lose your work.
-   **No build step, no backend** - pure HTML/CSS/JS. Open `index.html` directly, or serve it with any static file server.

## Getting Started
Navigate to [https://treeguy1234.github.io/MusicMatrixWeb/](https://treeguy1234.github.io/MusicMatrixWeb/) to get started.

## Usage

1.  **Browse or search** the shortcut library on the right. Hover over any icon to see what it does.
2.  **Drag** a shortcut onto any of the 32 slots in the main grid.
3.  **Rearrange** by dragging an already-assigned slot's icon to a new slot, or **click a filled slot** to clear it.
4.  Once all 32 slots are assigned, the **Export** button unlocks — click it to download a `.ino`/`.cpp` file containing your shortcut array, ready to paste into the MusicMatrix Arduino sketch.

## Project Structure

```
.
├── index.html                # Page shell
├── style.css                 # All styling (design tokens, layout, chip/slot states)
├── main.js                   # Drag-and-drop logic, slot state, export
├── musescore_shortcuts.js    # Full shortcut data set (title, description, keys, icon path)
├── Fonts/                    # Contains a font file for the UI
└── Icons/                    # SVG icon set, extracted from the Bravura music font and Google Fonts/Icons

```

## Customizing the Shortcut List

Shortcuts live in `musescore_shortcuts.js` as a single object, grouped by category:

```js
const shortcuts = {
  "General Editing": [
    {
      title: "Undo",
      description: "Undo the last action",
      shortkey1: "Ctrl",
      shortkey2: "Z",
      shortkey3: "",
      icon: "./Icons/Undo.svg"
    },
    // ...
  ],
  // ...
};

```

To add, remove, or re-map a shortcut, edit this file directly. The sidebar will rebuild automatically from whatever's in here. Setting `icon` to `null` is fine; unmatched entries fall back to a text label.

## Hardware

This tool is built specifically for the **MusicMatrix** macro pad:

-   4×8 button grid (32 macros) + a 7-key piano section
-   Arduino Leonardo or Arduino Uno R4 WiFi (native USB HID via `Keyboard.h`)
-   Cherry MX–compatible switches, diode matrix wiring

Hardware design files and firmware live in a separate repo (I'm still making it)

## Roadmap

-   [ ] Piano section support in the configurator
-   [ ] Touch-screen compatibility
-   [ ] Import/export layout presets as shareable JSON


## Acknowledgments

-   Icons extracted from [Bravura](https://github.com/steinbergmedia/bravura), the SMuFL-compliant music font by Steinberg, licensed under the SIL Open Font License.
-   Shortcut reference from the official [MuseScore Studio Handbook](https://musescore.org/en/handbook/4).
-   Additionally, icons from [Google Fonts](https://fonts.google.com/icons)

## License

This project is licensed under the [MIT License](https://github.com/treeguy1234/MusicMatrixWeb/blob/main/LICENSE).
