import { PRIORITIES } from "../../constants/priorities";
import { Icons } from "../icons/Icons";
import { styles } from "../../styles/styles";

export function MiniTodoItem({ todo, setTodos }) {
  const p = PRIORITIES[todo.priority] || PRIORITIES.medium;

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
        {todo.project && <span style={styles.todoTag}>{todo.project}</span>}
      </div>
      <span style={{ ...styles.priorityDot, background: p.color }} title={p.label} />
    </div>
  );
}
