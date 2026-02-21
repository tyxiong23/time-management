import { useState, useMemo } from "react";
import { PRIORITIES } from "../../constants/priorities";
import { generateId } from "../../utils/idUtils";
import { getToday, formatDate } from "../../utils/dateUtils";
import { Icons } from "../icons/Icons";
import { styles } from "../../styles/styles";

// ---- TodoForm ----
function TodoForm({ todo, projects, onSave, onCancel }) {
  const [text, setText] = useState(todo?.text || "");
  const [priority, setPriority] = useState(todo?.priority || "medium");
  const [dueDate, setDueDate] = useState(todo?.dueDate || "");
  const [project, setProject] = useState(todo?.project || "");

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
          {Object.entries(PRIORITIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.icon} {v.label}
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
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          <option value="">No Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
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
              ...todo,
              text,
              priority,
              dueDate,
              project,
              completed: todo?.completed || false,
            })
          }
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ---- TodoItem ----
function TodoItem({ todo, setTodos, projects, isEditing, setEditingId }) {
  const p = PRIORITIES[todo.priority] || PRIORITIES.medium;
  const today = getToday();
  const isOverdue = todo.dueDate && todo.dueDate < today && !todo.completed;

  if (isEditing) {
    return (
      <TodoForm
        todo={todo}
        projects={projects}
        onSave={(updated) => {
          setTodos((prev) =>
            prev.map((t) => (t.id === todo.id ? { ...t, ...updated } : t))
          );
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
          borderColor: todo.completed ? "#10b981" : p.color,
          background: todo.completed ? "#10b981" : "transparent",
          color: todo.completed ? "#fff" : "transparent",
        }}
        onClick={() =>
          setTodos((prev) =>
            prev.map((t) =>
              t.id === todo.id ? { ...t, completed: !t.completed } : t
            )
          )
        }
      >
        {todo.completed && <Icons.Check />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: todo.completed ? "line-through" : "none",
            opacity: todo.completed ? 0.5 : 1,
            color: "#1a1a2e",
          }}
        >
          {todo.text}
        </div>
        <div style={styles.todoMeta}>
          {todo.dueDate && (
            <span style={{ ...styles.todoDue, color: isOverdue ? "#ef4444" : "#6b7280" }}>
              <Icons.Clock /> {formatDate(todo.dueDate)}
            </span>
          )}
          {todo.project && <span style={styles.todoTag}>{todo.project}</span>}
        </div>
      </div>

      <div style={styles.todoActions}>
        <button style={styles.iconBtn} onClick={() => setEditingId(todo.id)}>
          <Icons.Edit />
        </button>
        <button
          style={styles.iconBtn}
          onClick={() =>
            setTodos((prev) => prev.filter((t) => t.id !== todo.id))
          }
        >
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
}

// ---- TodosView ----
export function TodosView({ todos, setTodos, projects }) {
  const [filter, setFilter] = useState("active");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const filtered = useMemo(() => {
    let list = [...todos];
    if (filter === "active") list = list.filter((t) => !t.completed);
    else if (filter === "completed") list = list.filter((t) => t.completed);
    list.sort((a, b) => {
      const po = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
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
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "active" && ` (${todos.filter((t) => !t.completed).length})`}
            </button>
          ))}
        </div>
      </div>

      {showAddForm && (
        <TodoForm
          projects={projects}
          onSave={(todo) => {
            setTodos((prev) => [
              ...prev,
              { ...todo, id: generateId(), createdDate: getToday() },
            ]);
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
            projects={projects}
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
