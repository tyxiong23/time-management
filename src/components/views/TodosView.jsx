import { useMemo, useState } from "react";
import { PRIORITIES } from "../../constants/priorities";
import { COLLECTION_TYPES } from "../../constants/collectionTypes";
import { generateId } from "../../utils/idUtils";
import { getToday, formatDate } from "../../utils/dateUtils";
import { getTodoLinkLabel, normalizeTodoLink } from "../../utils/collectionUtils";
import { Icons } from "../icons/Icons";
import { styles } from "../../styles/styles";

function TodoForm({ todo, collections, onSave, onCancel }) {
  const normalized = normalizeTodoLink(todo || {});
  const [text, setText] = useState(normalized.text || "");
  const [priority, setPriority] = useState(normalized.priority || "medium");
  const [dueDate, setDueDate] = useState(normalized.dueDate || "");
  const [category, setCategory] = useState(normalized.category || "");
  const [relatedItem, setRelatedItem] = useState(normalized.relatedItem || "");

  const relatedOptions = category ? collections[category] || [] : [];

  return (
    <div style={styles.card}>
      <input
        style={styles.formInput}
        placeholder="Task description..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
      />
      <div style={styles.formRow}>
        <select
          style={styles.formSelect}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {Object.entries(PRIORITIES).map(([key, value]) => (
            <option key={key} value={key}>
              {value.icon} {value.label}
            </option>
          ))}
        </select>
        <input
          style={styles.formInput}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select
          style={styles.formSelect}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setRelatedItem("");
          }}
        >
          <option value="">No Category</option>
          {Object.values(COLLECTION_TYPES).map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
        <select
          style={styles.formSelect}
          value={relatedItem}
          onChange={(e) => setRelatedItem(e.target.value)}
          disabled={!category}
        >
          <option value="">{category ? "No linked item" : "Select category first"}</option>
          {relatedOptions.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div style={styles.formActions}>
        <button style={styles.secondaryBtn} onClick={onCancel}>
          Cancel
        </button>
        <button
          style={styles.primaryBtn}
          onClick={() =>
            text.trim() &&
            onSave({
              ...normalized,
              text: text.trim(),
              priority,
              dueDate,
              category,
              relatedItem,
              project: category === "projects" ? relatedItem : "",
              completed: normalized.completed || false,
            })
          }
        >
          Save
        </button>
      </div>
    </div>
  );
}

function TodoItem({ todo, setTodos, collections, isEditing, setEditingId }) {
  const normalized = normalizeTodoLink(todo);
  const p = PRIORITIES[normalized.priority] || PRIORITIES.medium;
  const today = getToday();
  const isOverdue = normalized.dueDate && normalized.dueDate < today && !normalized.completed;
  const linkLabel = getTodoLinkLabel(normalized);
  const categoryLabel = normalized.category ? COLLECTION_TYPES[normalized.category]?.label : "";

  if (isEditing) {
    return (
      <TodoForm
        todo={normalized}
        collections={collections}
        onSave={(updated) => {
          setTodos((prev) => prev.map((entry) => (entry.id === normalized.id ? { ...entry, ...updated } : entry)));
          setEditingId(null);
        }}
        onCancel={() => setEditingId(null)}
      />
    );
  }

  return (
    <div style={{ ...styles.todoItem, borderLeftColor: p.color }}>
      <button
        style={{
          ...styles.todoCheckbox,
          borderColor: normalized.completed ? "#10b981" : p.color,
          background: normalized.completed ? "#10b981" : "transparent",
          color: normalized.completed ? "#fff" : "transparent",
        }}
        onClick={() =>
          setTodos((prev) => prev.map((entry) =>
            entry.id === normalized.id ? { ...entry, completed: !normalized.completed } : entry
          ))
        }
      >
        {normalized.completed && <Icons.Check />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: normalized.completed ? "line-through" : "none",
            opacity: normalized.completed ? 0.5 : 1,
            color: "#1a1a2e",
          }}
        >
          {normalized.text}
        </div>
        <div style={styles.todoMeta}>
          {normalized.dueDate && (
            <span style={{ ...styles.todoDue, color: isOverdue ? "#ef4444" : "#6b7280" }}>
              <Icons.Clock /> {formatDate(normalized.dueDate)}
            </span>
          )}
          {linkLabel && (
            <span style={styles.todoTag}>{categoryLabel ? `${categoryLabel}: ${linkLabel}` : linkLabel}</span>
          )}
        </div>
      </div>

      <div style={styles.todoActions}>
        <button style={styles.iconBtn} onClick={() => setEditingId(normalized.id)}>
          <Icons.Edit />
        </button>
        <button
          style={styles.iconBtn}
          onClick={() => setTodos((prev) => prev.filter((entry) => entry.id !== normalized.id))}
        >
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
}

export function TodosView({ todos, setTodos, projects, learning, traveling }) {
  const [filter, setFilter] = useState("active");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const collections = { projects, learning, traveling };

  const filtered = useMemo(() => {
    let list = todos.map(normalizeTodoLink);
    if (filter === "active") list = list.filter((todo) => !todo.completed);
    else if (filter === "completed") list = list.filter((todo) => todo.completed);
    list.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
    return list;
  }, [todos, filter]);

  return (
    <div style={styles.viewContainer}>
      <div style={styles.viewHeader}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={styles.viewTitle}>Todos</h1>
          <button style={styles.primaryBtn} onClick={() => setShowAddForm(true)}>
            <Icons.Plus /> New Task
          </button>
        </div>
        <div style={styles.filterBar}>
          {["all", "active", "completed"].map((entry) => (
            <button
              key={entry}
              onClick={() => setFilter(entry)}
              style={{ ...styles.filterBtn, ...(filter === entry ? styles.filterBtnActive : {}) }}
            >
              {entry.charAt(0).toUpperCase() + entry.slice(1)}
              {entry === "active" && ` (${todos.filter((todo) => !todo.completed).length})`}
            </button>
          ))}
        </div>
      </div>

      {showAddForm && (
        <TodoForm
          collections={collections}
          onSave={(todo) => {
            setTodos((prev) => [...prev, { ...todo, id: generateId(), createdDate: getToday() }]);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div style={styles.todoList}>
        {filtered.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            setTodos={setTodos}
            collections={collections}
            isEditing={editingId === todo.id}
            setEditingId={setEditingId}
          />
        ))}
        {filtered.length === 0 && (
          <div style={styles.emptyStateLarge}>
            {filter === "completed" ? "No completed tasks yet." : "All clear! 🎉"}
          </div>
        )}
      </div>
    </div>
  );
}
