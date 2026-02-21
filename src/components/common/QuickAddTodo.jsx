import { useState } from "react";
import { generateId } from "../../utils/idUtils";
import { getToday } from "../../utils/dateUtils";
import { styles } from "../../styles/styles";

export function QuickAddTodo({ setTodos, defaultDate }) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    setTodos((prev) => [
      ...prev,
      {
        id: generateId(),
        text: text.trim(),
        completed: false,
        priority: "medium",
        dueDate: defaultDate || "",
        project: "",
        createdDate: getToday(),
      },
    ]);
    setText("");
  };

  return (
    <div style={styles.quickAdd}>
      <input
        style={styles.quickAddInput}
        placeholder="+ Quick add task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />
    </div>
  );
}
