# Markdown Viewer & Editor

A Chrome extension that lets you view rendered Markdown and edit it as plain
text right in your browser. Toggle between **Edit**, **Split**, and **View**
modes, and switch between **light** and **dark** themes.

## Features

- Live Markdown rendering powered by [marked](https://github.com/markedjs/marked)
- Three layouts: edit only, split (source + preview), and view only
- Light / dark theme toggle (initial theme follows your OS preference)
- Auto-save to `chrome.storage.local` so your draft survives restarts
- Open existing `.md` / `.markdown` / `.txt` files and save your work back
  to disk
- Word and character counts in the status bar
- Keyboard shortcuts for everything that matters

## Install (unpacked)

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome (or any Chromium-based browser).
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the [`src/`](./src) directory.
5. Pin the extension and click its toolbar icon to open the editor in a new
   tab.

## Usage

| Shortcut          | Action                |
| ----------------- | --------------------- |
| `Ctrl/Cmd + 1`    | Edit mode             |
| `Ctrl/Cmd + 2`    | Split mode (default)  |
| `Ctrl/Cmd + 3`    | View mode             |
| `Ctrl/Cmd + S`    | Save current document |
| `Ctrl/Cmd+Shift+D`| Toggle dark mode      |
| `Tab` / `Shift+Tab` | Indent / outdent in the editor |

The toolbar provides equivalent buttons for switching modes, toggling the
theme, opening a file, saving, and clearing the editor.

## Project layout

```
src/
├── manifest.json       # Manifest V3 declaration
├── background.js       # Opens the editor tab when the action icon is clicked
├── editor.html         # Editor + preview UI
├── editor.css          # Light / dark theming and layout
├── editor.js           # Rendering, mode/theme toggles, persistence, file ops
├── icons/              # 16 / 32 / 48 / 128 px action icons
└── lib/
    ├── marked.min.js   # Bundled Markdown parser (MIT)
    └── marked.LICENSE.md
```

## Privacy

Everything is local. No network requests are made; the only storage used is
`chrome.storage.local`, which keeps your last draft, mode, and theme
preference on this device.

## License

This project is released under the [MIT License](./LICENSE). The bundled
`marked` library is also MIT-licensed; see
[`src/lib/marked.LICENSE.md`](./src/lib/marked.LICENSE.md).
