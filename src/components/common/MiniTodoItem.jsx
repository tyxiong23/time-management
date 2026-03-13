import { PRIORITIES } from "../../constants/priorities";
import { COLLECTION_TYPES } from "../../constants/collectionTypes";
import { getTodoLinkLabel } from "../../utils/collectionUtils";
import { Icons } from "../icons/Icons";
import { styles } from "../../styles/styles";

export function MiniTodoItem({ todo, setTodos }) {
  const p = PRIORITIES[todo.priority] || PRIORITIES.medium;
  const categoryLabel = todo.category ? COLLECTION_TYPES[todo.category]?.label : "";
  const linkLabel = getTodoLinkLabel(todo);

  return (
    <div style={styles.miniTodo}>
      <button
        style={styles.todoCheckbox}
        onClick={() =>
          setTodos((prev) =>
            prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
          )
        }
      >
        {todo.completed && <Icons.Check />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            ...styles.miniTodoText,
            textDecoration: todo.completed ? "line-through" : "none",
            opacity: todo.completed ? 0.5 : 1,
          }}
        >
          {todo.text}
        </div>
        {linkLabel && <span style={styles.todoTag}>{categoryLabel ? `${categoryLabel}: ${linkLabel}` : linkLabel}</span>}
      </div>
      <span style={{ ...styles.priorityDot, background: p.color }} title={p.label} />
    </div>
  );
}
