(() => {
  "use strict";

  const STORAGE_KEYS = {
    content: "md.content",
    mode: "md.mode",
    theme: "md.theme",
  };

  const DEFAULT_CONTENT = `# Welcome to Markdown Editor

A Chrome extension for **viewing** and **editing** Markdown right in your browser.

## Features

- Toggle between **Edit**, **Split**, and **View** modes
- Switch between **light** and **dark** themes
- Auto-saves your work locally
- Open existing \`.md\` files and save your work back to disk

## Try it out

Type Markdown on the left and watch it render on the right.

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> Tip: press **Ctrl/Cmd + 1/2/3** to switch modes, **Ctrl/Cmd + S** to save.

| Shortcut | Action |
| --- | --- |
| \`Ctrl/Cmd + 1\` | Edit mode |
| \`Ctrl/Cmd + 2\` | Split mode |
| \`Ctrl/Cmd + 3\` | View mode |
| \`Ctrl/Cmd + S\` | Save as file |

- [x] Render Markdown
- [x] Edit plain text
- [ ] Add your own notes
`;

  const VALID_MODES = new Set(["edit", "split", "view"]);
  const VALID_THEMES = new Set(["light", "dark"]);

  const body = document.body;
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const status = document.getElementById("status");
  const counts = document.getElementById("counts");
  const themeBtn = document.getElementById("theme-btn");
  const themeIcon = themeBtn.querySelector(".theme-icon");
  const themeLabel = themeBtn.querySelector(".theme-label");
  const modeBtns = document.querySelectorAll(".mode-btn");
  const openBtn = document.getElementById("open-btn");
  const saveBtn = document.getElementById("save-btn");
  const clearBtn = document.getElementById("clear-btn");
  const printBtn = document.getElementById("print-btn");
  const printExitBtn = document.getElementById("print-exit-btn");
  const fileInput = document.getElementById("file-input");

  if (typeof marked !== "undefined") {
    marked.setOptions({ gfm: true, breaks: false });
  }

  const storage = {
    get(keys) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.get(keys, (result) => resolve(result || {}));
        } catch (_) {
          const out = {};
          (Array.isArray(keys) ? keys : Object.keys(keys)).forEach((k) => {
            const raw = localStorage.getItem(k);
            if (raw !== null) {
              try {
                out[k] = JSON.parse(raw);
              } catch (_) {
                out[k] = raw;
              }
            }
          });
          resolve(out);
        }
      });
    },
    set(items) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.set(items, () => resolve());
        } catch (_) {
          Object.entries(items).forEach(([k, v]) => {
            localStorage.setItem(k, JSON.stringify(v));
          });
          resolve();
        }
      });
    },
  };

  const escapeHtml = (s) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  function renderMarkdown(text) {
    if (typeof marked === "undefined") {
      preview.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
      return;
    }
    try {
      preview.innerHTML = marked.parse(text || "");
      preview.querySelectorAll('a[href]').forEach((a) => {
        const href = a.getAttribute("href") || "";
        if (/^https?:|^mailto:/i.test(href)) {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        }
      });
    } catch (err) {
      preview.innerHTML = `<pre>${escapeHtml(String(err))}</pre>`;
    }
  }

  function updateCounts(text) {
    const chars = text.length;
    const words = (text.trim().match(/\S+/g) || []).length;
    counts.textContent = `${words} ${
      words === 1 ? "word" : "words"
    } · ${chars} ${chars === 1 ? "char" : "chars"}`;
  }

  function setStatus(msg, ttl = 1500) {
    status.textContent = msg;
    if (ttl > 0) {
      clearTimeout(setStatus._t);
      setStatus._t = setTimeout(() => {
        status.textContent = "Ready";
      }, ttl);
    }
  }

  function setMode(mode) {
    if (!VALID_MODES.has(mode)) mode = "split";
    body.dataset.mode = mode;
    modeBtns.forEach((btn) => {
      btn.setAttribute(
        "aria-pressed",
        btn.dataset.mode === mode ? "true" : "false"
      );
    });
    storage.set({ [STORAGE_KEYS.mode]: mode });
  }

  function setTheme(theme) {
    if (!VALID_THEMES.has(theme)) theme = "light";
    body.dataset.theme = theme;
    const isDark = theme === "dark";
    themeBtn.setAttribute("aria-pressed", String(isDark));
    themeBtn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    themeIcon.innerHTML = isDark ? "&#9790;" : "&#9728;";
    themeLabel.textContent = isDark ? "Light" : "Dark";
    storage.set({ [STORAGE_KEYS.theme]: theme });
  }

  let saveTimer = null;
  function scheduleAutosave(text) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      storage.set({ [STORAGE_KEYS.content]: text });
    }, 250);
  }

  let renderTimer = null;
  function scheduleRender(text) {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => renderMarkdown(text), 60);
  }

  function onEditorInput() {
    const text = editor.value;
    updateCounts(text);
    scheduleRender(text);
    scheduleAutosave(text);
  }

  function handleTab(e) {
    if (e.key !== "Tab" || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const value = editor.value;

    if (start !== end && value.slice(start, end).includes("\n")) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const block = value.slice(lineStart, end);
      let updated;
      if (e.shiftKey) {
        updated = block.replace(/^(\t| {1,2})/gm, "");
      } else {
        updated = block.replace(/^/gm, "  ");
      }
      editor.value = value.slice(0, lineStart) + updated + value.slice(end);
      editor.selectionStart = lineStart;
      editor.selectionEnd = lineStart + updated.length;
    } else if (e.shiftKey) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const before = value.slice(lineStart, start);
      const trimmed = before.replace(/^(\t| {1,2})/, "");
      const removed = before.length - trimmed.length;
      editor.value =
        value.slice(0, lineStart) + trimmed + value.slice(start);
      editor.selectionStart = editor.selectionEnd = Math.max(
        lineStart,
        start - removed
      );
    } else {
      editor.value = value.slice(0, start) + "  " + value.slice(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
    }
    onEditorInput();
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function deriveFilename(text) {
    const m = text.match(/^\s*#\s+(.+?)\s*$/m);
    const base = (m ? m[1] : "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "untitled";
    return `${base}.md`;
  }

  function saveCurrent() {
    const text = editor.value;
    downloadFile(deriveFilename(text), text);
    setStatus("Saved");
  }

  function openFile() {
    fileInput.click();
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      editor.value = text;
      onEditorInput();
      setStatus(`Loaded ${file.name}`);
    };
    reader.onerror = () => setStatus("Failed to read file", 2500);
    reader.readAsText(file);
    fileInput.value = "";
  });

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  themeBtn.addEventListener("click", () => {
    setTheme(body.dataset.theme === "dark" ? "light" : "dark");
  });

  function enterPrintView() {
    body.dataset.printView = "true";
    printExitBtn.focus();
  }

  function exitPrintView() {
    delete body.dataset.printView;
    printBtn.focus();
  }

  openBtn.addEventListener("click", openFile);
  saveBtn.addEventListener("click", saveCurrent);
  printBtn.addEventListener("click", enterPrintView);
  printExitBtn.addEventListener("click", exitPrintView);
  clearBtn.addEventListener("click", () => {
    if (!editor.value || confirm("Clear the editor? This cannot be undone.")) {
      editor.value = "";
      onEditorInput();
      setStatus("Cleared");
    }
  });

  editor.addEventListener("input", onEditorInput);
  editor.addEventListener("keydown", handleTab);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && body.dataset.printView === "true") {
      e.preventDefault();
      exitPrintView();
      return;
    }
    const meta = e.ctrlKey || e.metaKey;
    if (!meta) return;
    if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      saveCurrent();
    } else if (e.key === "1") {
      e.preventDefault();
      setMode("edit");
    } else if (e.key === "2") {
      e.preventDefault();
      setMode("split");
    } else if (e.key === "3") {
      e.preventDefault();
      setMode("view");
    } else if (e.key === "d" || e.key === "D") {
      if (e.shiftKey) {
        e.preventDefault();
        setTheme(body.dataset.theme === "dark" ? "light" : "dark");
      }
    }
  });

  async function init() {
    const stored = await storage.get([
      STORAGE_KEYS.content,
      STORAGE_KEYS.mode,
      STORAGE_KEYS.theme,
    ]);

    let theme = stored[STORAGE_KEYS.theme];
    if (!VALID_THEMES.has(theme)) {
      theme =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    }
    setTheme(theme);

    setMode(stored[STORAGE_KEYS.mode] || "split");

    const content =
      typeof stored[STORAGE_KEYS.content] === "string"
        ? stored[STORAGE_KEYS.content]
        : DEFAULT_CONTENT;
    editor.value = content;
    onEditorInput();

    editor.focus();
  }

  init();
})();
