import { isTodoLinkedToItem } from "./collectionUtils";

const NOTES_HEADING = "## Notes";
const TASKS_HEADING = "## Tasks";

function normalizeNoteText(text) {
  return (text || "").replace(/\r\n/g, "\n");
}

export function extractCollectionNoteBody(text) {
  const normalized = normalizeNoteText(text).trim();
  if (!normalized) return "";

  const lines = normalized.split("\n");
  let index = 0;

  while (index < lines.length && !lines[index].trim()) index += 1;

  if (index < lines.length && /^#\s+/.test(lines[index])) {
    index += 1;
    while (index < lines.length && !lines[index].trim()) index += 1;
  }

  if (index < lines.length && lines[index].trim() === TASKS_HEADING) {
    index += 1;
    while (index < lines.length) {
      const trimmed = lines[index].trim();
      if (!trimmed) {
        index += 1;
        continue;
      }
      if (/^##\s+/.test(trimmed)) break;
      if (/^[-*+]\s+\[[ xX]\]\s+/.test(trimmed) || /^_No linked tasks yet\._$/.test(trimmed)) {
        index += 1;
        continue;
      }
      break;
    }
    while (index < lines.length && !lines[index].trim()) index += 1;
  }

  if (index < lines.length && lines[index].trim() === NOTES_HEADING) {
    index += 1;
    while (index < lines.length && !lines[index].trim()) index += 1;
  }

  return lines.slice(index).join("\n").trim();
}

export function buildCollectionTasksMarkdown(category, itemName, todos) {
  const linkedTodos = todos.filter((todo) => isTodoLinkedToItem(todo, category, itemName));
  if (linkedTodos.length === 0) return "_No linked tasks yet._";

  return linkedTodos
    .map((todo) => `- [${todo.completed ? "x" : " "}] ${todo.text}`)
    .join("\n");
}

export function buildCollectionNote(item, category, todos) {
  const body = extractCollectionNoteBody(item.notes || "");
  const sections = [
    `# ${item.name}`,
    "",
    TASKS_HEADING,
    buildCollectionTasksMarkdown(category, item.name, todos),
    "",
    NOTES_HEADING,
  ];

  if (body) sections.push("", body);
  return sections.join("\n");
}
