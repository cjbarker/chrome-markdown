# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to the strategy described in
[`VERSIONING.md`](./VERSIONING.md).

## [Unreleased]

## [1.0] - 2026-04-28

### Added

- Manifest V3 Chrome extension that opens a full-page Markdown editor in a
  new tab when the toolbar action is clicked (clicking again focuses the
  existing tab).
- Three layout modes — **Edit**, **Split**, **View** — with a segmented
  toolbar control and `Ctrl/Cmd + 1 / 2 / 3` shortcuts.
- Light and dark themes with a toolbar toggle and `Ctrl/Cmd + Shift + D`
  shortcut. First-run theme follows `prefers-color-scheme`.
- Live Markdown rendering via the bundled MIT-licensed
  [marked](https://github.com/markedjs/marked) 12.x parser. No remote code
  is loaded.
- Auto-save of draft, mode, and theme to `chrome.storage.local`.
- Open `.md` / `.markdown` / `.txt` files from disk and Save the current
  document as `<first-h1-slug>.md` (`Ctrl/Cmd + S`).
- Tab / Shift+Tab indent helpers and a status bar showing live word and
  character counts.
- Action icons at 16, 32, 48, and 128 px.
- Versioning strategy documented in [`VERSIONING.md`](./VERSIONING.md).

[Unreleased]: https://github.com/cjbarker/chrome-markdown/compare/v1.0...HEAD
[1.0]: https://github.com/cjbarker/chrome-markdown/releases/tag/v1.0
