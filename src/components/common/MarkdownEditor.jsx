import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";
import "../../styles/markdown.css";

const MODES = {
  write: "write",
  live: "live",
  preview: "preview",
};

const TOOLBAR_ACTIONS = [
  { id: "bold", label: "B", title: "Bold (Ctrl/Cmd+B)" },
  { id: "italic", label: "I", title: "Italic (Ctrl/Cmd+I)" },
  { id: "code", label: "</>", title: "Inline code (Ctrl/Cmd+E)" },
  { id: "h2", label: "H2", title: "Heading" },
  { id: "quote", label: '"', title: "Quote" },
  { id: "bullet", label: "•", title: "Bullet list" },
  { id: "checklist", label: "[]", title: "Checklist" },
  { id: "link", label: "Link", title: "Link (Ctrl/Cmd+K)" },
  { id: "math", label: "fx", title: "Inline math" },
];

function extractHeadings(md) {
  const headings = [];
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].replace(/[*_`~#]/g, "").trim(),
        line: i,
      });
    }
  }
  return headings;
}

function sanitizeHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\bon\w+\s*=/gi, "data-removed=");
}

function renderKatex(expr, displayMode) {
  try {
    return katex.renderToString(expr.trim(), {
      displayMode,
      throwOnError: false,
      strict: "warn",
    });
  } catch {
    return `<span class="md-math-error">${expr}</span>`;
  }
}

function preprocessMarkdown(md) {
  if (!md.trim()) return md;

  const codeTokens = [];
  let processed = md.replace(/```[\s\S]*?```|`[^`\n]+`/g, (match) => {
    const token = `@@CODE_TOKEN_${codeTokens.length}@@`;
    codeTokens.push(match);
    return token;
  });

  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => {
    return `\n<div class="md-math-block">${renderKatex(expr, true)}</div>\n`;
  });

  processed = processed.replace(/(^|[^\$\\])\$([^\n$]+?)\$/g, (_, prefix, expr) => {
    return `${prefix}<span class="md-math-inline">${renderKatex(expr, false)}</span>`;
  });

  processed = processed.replace(/@@CODE_TOKEN_(\d+)@@/g, (_, index) => codeTokens[Number(index)]);
  return processed;
}

function injectTaskMetadata(html) {
  let taskIndex = 0;
  return html.replace(/<input([^>]*type="checkbox"[^>]*)>/g, (match, attrs) => {
    const checked = /\schecked(?:=|(?=\s|>))/i.test(attrs);
    return `<input type="checkbox" data-task-index="${taskIndex += 1}" ${checked ? "checked" : ""}>`;
  });
}

function renderMarkdown(md) {
  const rendered = marked.parse(preprocessMarkdown(md), {
    gfm: true,
    breaks: true,
  });
  return injectTaskMetadata(sanitizeHtml(rendered));
}

function updateTaskLine(text, taskIndex) {
  const lines = text.split("\n");
  let seen = 0;
  const nextLines = lines.map((line) => {
    const match = line.match(/^(\s*[-*+]\s+\[)( |x|X)(\]\s.*)$/);
    if (!match) return line;

    seen += 1;
    if (seen !== taskIndex) return line;

    const nextValue = match[2].toLowerCase() === "x" ? " " : "x";
    return `${match[1]}${nextValue}${match[3]}`;
  });

  return seen >= taskIndex ? nextLines.join("\n") : text;
}

function updateSelection(textarea, nextValue, selectionStart, selectionEnd) {
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(selectionStart, selectionEnd);
    textarea.scrollTop = textarea.scrollTop;
  });
  return nextValue;
}

function applyMarkdownAction(action, text, textarea) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = text.slice(start, end);
  const before = text.slice(0, start);
  const after = text.slice(end);

  const wrapSelection = (prefix, suffix = prefix, fallback = "") => {
    const selectedWithContext = text.slice(start - prefix.length, end + suffix.length);
    if (
      selected &&
      start >= prefix.length &&
      end + suffix.length <= text.length &&
      selectedWithContext === `${prefix}${selected}${suffix}`
    ) {
      const nextValue = `${text.slice(0, start - prefix.length)}${selected}${text.slice(end + suffix.length)}`;
      return {
        value: updateSelection(
          textarea,
          nextValue,
          start - prefix.length,
          end - prefix.length
        ),
      };
    }

    const body = selected || fallback;
    const nextValue = `${before}${prefix}${body}${suffix}${after}`;
    const cursorStart = start + prefix.length;
    const cursorEnd = cursorStart + body.length;
    return {
      value: updateSelection(textarea, nextValue, cursorStart, cursorEnd),
    };
  };

  const prefixLines = (linePrefix) => {
    const blockStart = before.lastIndexOf("\n") + 1;
    const blockEnd = after.indexOf("\n");
    const absoluteBlockEnd = blockEnd === -1 ? text.length : end + blockEnd;
    const block = text.slice(blockStart, absoluteBlockEnd);
    const updatedBlock = block
      .split("\n")
      .map((line) => `${linePrefix}${line}`)
      .join("\n");
    const nextValue = `${text.slice(0, blockStart)}${updatedBlock}${text.slice(absoluteBlockEnd)}`;
    return {
      value: updateSelection(textarea, nextValue, blockStart, blockStart + updatedBlock.length),
    };
  };

  switch (action) {
    case "bold":
      return wrapSelection("**", "**", "bold text");
    case "italic":
      return wrapSelection("*", "*", "italic text");
    case "code":
      return wrapSelection("`", "`", "code");
    case "link":
      return wrapSelection("[", "](https://)", "link text");
    case "math":
      return wrapSelection("$", "$", "x^2");
    case "h2":
      return prefixLines("## ");
    case "quote":
      return prefixLines("> ");
    case "bullet":
      return prefixLines("- ");
    case "checklist":
      return prefixLines("- [ ] ");
    default:
      return { value: text };
  }
}

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  },
  modal: {
    width: "92vw",
    height: "88vh",
    maxWidth: "1320px",
    background: "#fff",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: "1px solid #e8e7e3",
    background: "#fafaf8",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#1a1a2e",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
  },
  tabBtn: {
    padding: "5px 12px",
    border: "1px solid #e8e7e3",
    borderRadius: "6px",
    background: "#fff",
    fontSize: "12px",
    fontWeight: 500,
    color: "#6b7280",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  tabBtnActive: {
    background: "#1a1a2e",
    color: "#fff",
    borderColor: "#1a1a2e",
  },
  closeBtn: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "6px",
    background: "transparent",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "8px",
  },
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  outline: {
    width: "200px",
    minWidth: "200px",
    borderRight: "1px solid #e8e7e3",
    background: "#fafaf8",
    overflow: "auto",
    padding: "12px 0",
  },
  outlineTitle: {
    fontSize: "10px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#9ca3af",
    padding: "0 16px 8px",
    margin: 0,
  },
  outlineItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "transparent",
    padding: "4px 16px",
    fontSize: "12.5px",
    color: "#4b5563",
    cursor: "pointer",
    fontFamily: "inherit",
    lineHeight: 1.5,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    transition: "background 0.1s",
    borderRadius: 0,
  },
  editor: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  splitPane: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    flex: 1,
    minHeight: 0,
  },
  pane: {
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #f1f0ec",
  },
  previewPane: {
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
  paneHeader: {
    padding: "8px 14px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#9ca3af",
    borderBottom: "1px solid #f1f0ec",
    background: "#fcfcfa",
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    padding: "10px 14px",
    borderBottom: "1px solid #f1f0ec",
    background: "#fcfcfa",
  },
  toolbarBtn: {
    minWidth: "34px",
    height: "30px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    background: "#fff",
    color: "#374151",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: "0 10px",
  },
  textarea: {
    flex: 1,
    width: "100%",
    border: "none",
    outline: "none",
    resize: "none",
    padding: "24px 32px",
    fontSize: "14px",
    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    lineHeight: 1.8,
    color: "#1a1a2e",
    background: "#fff",
    boxSizing: "border-box",
  },
  preview: {
    flex: 1,
    overflow: "auto",
    padding: "24px 32px",
    fontSize: "14px",
    lineHeight: 1.8,
    color: "#1a1a2e",
    minWidth: 0,
  },
  emptyHint: {
    color: "#9ca3af",
    fontStyle: "italic",
    fontSize: "14px",
  },
  shortcutHint: {
    padding: "8px 14px 12px",
    fontSize: "11.5px",
    color: "#9ca3af",
    borderTop: "1px solid #f1f0ec",
    background: "#fcfcfa",
  },
  notePreviewBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    width: "100%",
    padding: "10px 14px",
    border: "1px dashed #d1d5db",
    borderRadius: "8px",
    background: "#fafaf8",
    cursor: "pointer",
    fontSize: "13px",
    color: "#6b7280",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "border-color 0.15s, background 0.15s",
  },
};

export function NotePreview({ content, onClick }) {
  const hasContent = content && content.trim();
  return (
    <button style={S.notePreviewBtn} onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      {hasContent ? (
        <span style={{ flex: 1 }}>
          {content.split("\n").find((line) => line.trim())?.slice(0, 60) || "Open notes"}
          {content.length > 60 ? "..." : ""}
        </span>
      ) : (
        <span>Click to add notes...</span>
      )}
    </button>
  );
}

export function MarkdownModal({ title, content, onChange, onClose }) {
  const [mode, setMode] = useState(MODES.live);
  const [text, setText] = useState(content || "");
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const saveTimeout = useRef(null);

  useEffect(() => {
    setText(content || "");
  }, [content]);

  const handleChange = useCallback(
    (val) => {
      setText(val);
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => onChange(val), 250);
    },
    [onChange]
  );

  const handleClose = useCallback(() => {
    clearTimeout(saveTimeout.current);
    onChange(text);
    onClose();
  }, [onChange, onClose, text]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  const headings = useMemo(() => extractHeadings(text), [text]);
  const renderedHtml = useMemo(() => {
    if (!text.trim()) return "";
    return renderMarkdown(text);
  }, [text]);

  const scrollToHeading = (line) => {
    if ((mode === MODES.write || mode === MODES.live) && textareaRef.current) {
      const ta = textareaRef.current;
      const lines = ta.value.split("\n");
      let pos = 0;
      for (let i = 0; i < line && i < lines.length; i += 1) {
        pos += lines[i].length + 1;
      }
      ta.focus();
      ta.setSelectionRange(pos, pos);
      ta.scrollTop = Math.max(0, line * 25 - 60);
    }

    if (previewRef.current) {
      const allHeadings = previewRef.current.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const index = headings.findIndex((heading) => heading.line === line);
      if (index >= 0 && allHeadings[index]) {
        allHeadings[index].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const runToolbarAction = (action) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const result = applyMarkdownAction(action, text, textarea);
    handleChange(result.value);
  };

  const handleEditorKeyDown = (event) => {
    const isMeta = event.metaKey || event.ctrlKey;
    if (!isMeta) return;

    let action = null;
    const key = event.key.toLowerCase();
    if (key === "b") action = "bold";
    if (key === "i") action = "italic";
    if (key === "e") action = "code";
    if (key === "k") action = "link";
    if (!action) return;

    event.preventDefault();
    runToolbarAction(action);
  };

  const handlePreviewClick = (event) => {
    const checkbox = event.target.closest('input[type="checkbox"][data-task-index]');
    if (!checkbox) return;

    event.preventDefault();
    const index = Number(checkbox.dataset.taskIndex);
    if (!index) return;

    handleChange(updateTaskLine(text, index));
  };

  const renderPreview = () => {
    if (!renderedHtml) {
      return (
        <div ref={previewRef} style={S.preview} className="md-preview">
          <p style={S.emptyHint}>Nothing to preview yet. Switch to Write and start writing.</p>
        </div>
      );
    }

    return (
      <div
        ref={previewRef}
        style={S.preview}
        className="md-preview"
        onClick={handlePreviewClick}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  };

  const renderEditorPane = () => (
    <div style={mode === MODES.live ? S.pane : S.editor}>
      {mode === MODES.live && <div style={S.paneHeader}>Markdown</div>}
      <div style={S.toolbar}>
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            style={S.toolbarBtn}
            title={action.title}
            onClick={() => runToolbarAction(action.id)}
          >
            {action.label}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        style={S.textarea}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleEditorKeyDown}
        placeholder={"# Heading\n\n- [ ] Task item\n- **bold** and *italic*\n- Inline math: $E=mc^2$\n\n$$\n\\int_0^1 x^2 dx\n$$"}
        spellCheck={false}
        autoFocus
      />
      <div style={S.shortcutHint}>
        Shortcuts: Ctrl/Cmd+B bold, Ctrl/Cmd+I italic, Ctrl/Cmd+E code, Ctrl/Cmd+K link
      </div>
    </div>
  );

  return (
    <div style={S.overlay} onClick={handleClose}>
      <div style={S.modal} onClick={(event) => event.stopPropagation()}>
        <div style={S.header}>
          <h2 style={S.headerTitle}>{title}</h2>
          <div style={S.headerActions}>
            {Object.values(MODES).map((nextMode) => (
              <button
                key={nextMode}
                style={{ ...S.tabBtn, ...(mode === nextMode ? S.tabBtnActive : {}) }}
                onClick={() => setMode(nextMode)}
              >
                {nextMode[0].toUpperCase() + nextMode.slice(1)}
              </button>
            ))}
            <button style={S.closeBtn} onClick={handleClose}>
              ×
            </button>
          </div>
        </div>

        <div style={S.body}>
          <div style={S.outline}>
            <h4 style={S.outlineTitle}>Outline</h4>
            {headings.length === 0 && (
              <div style={{ padding: "0 16px", fontSize: "11.5px", color: "#9ca3af", fontStyle: "italic" }}>
                Use # headings to build outline
              </div>
            )}
            {headings.map((heading, index) => (
              <button
                key={index}
                style={{
                  ...S.outlineItem,
                  paddingLeft: `${16 + (heading.level - 1) * 12}px`,
                  fontWeight: heading.level <= 2 ? 600 : 400,
                }}
                onClick={() => scrollToHeading(heading.line)}
              >
                {heading.text}
              </button>
            ))}
          </div>

          <div style={S.editor}>
            {mode === MODES.write && renderEditorPane()}
            {mode === MODES.preview && renderPreview()}
            {mode === MODES.live && (
              <div style={S.splitPane}>
                {renderEditorPane()}
                <div style={S.previewPane}>
                  <div style={S.paneHeader}>Preview</div>
                  {renderPreview()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
