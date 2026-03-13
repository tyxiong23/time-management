import { COLLECTION_COLORS } from "../constants/collectionColors";

export function normalizeTodoLink(todo) {
  const category = todo.category || (todo.project ? "projects" : "");
  const relatedItem = todo.relatedItem || todo.project || "";
  return {
    ...todo,
    category,
    relatedItem,
  };
}

export function getTodoLinkLabel(todo) {
  return todo.relatedItem || todo.project || "";
}

export function isTodoLinkedToItem(todo, category, itemName) {
  const normalized = normalizeTodoLink(todo);
  return normalized.category === category && normalized.relatedItem === itemName;
}

export function pickCollectionColor(index) {
  return COLLECTION_COLORS[index % COLLECTION_COLORS.length];
}

export function getEffectiveDateRange(startDate, endDate) {
  if (startDate && endDate && endDate < startDate) {
    return {
      startDate: endDate,
      endDate: startDate,
    };
  }

  return {
    startDate: startDate || "",
    endDate: endDate || "",
  };
}

export function getDateProgress(startDate, endDate, today) {
  const range = getEffectiveDateRange(startDate, endDate);
  if (!range.startDate || !range.endDate) return 0;
  if (today <= range.startDate) return 0;
  if (today >= range.endDate) return 100;

  const total = new Date(`${range.endDate}T00:00:00`) - new Date(`${range.startDate}T00:00:00`);
  const elapsed = new Date(`${today}T00:00:00`) - new Date(`${range.startDate}T00:00:00`);
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}
