import { getToday, formatDateFull } from "../../utils/dateUtils";
import { MiniTodoItem } from "../common/MiniTodoItem";
import { QuickAddTodo } from "../common/QuickAddTodo";
import { styles } from "../../styles/styles";

export function TodayView({ dailyNotes, setDailyNotes, todos, setTodos }) {
  const today = getToday();
  const note = dailyNotes[today] || { done: "", doing: "", blockers: "", notes: "" };

  const updateNote = (field, value) => {
    setDailyNotes((prev) => ({
      ...prev,
      [today]: { ...prev[today], [field]: value },
    }));
  };

  const todayTodos = todos.filter(
    (t) => !t.completed && (t.dueDate === today || (!t.dueDate && t.createdDate === today))
  );
  const overdueTodos = todos.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < today
  );

  return (
    <div style={styles.viewContainer}>
      <div style={styles.viewHeader}>
        <h1 style={styles.viewTitle}>Today</h1>
        <div style={styles.viewSubtitle}>{formatDateFull(today)}</div>
      </div>

      <div style={styles.todayGrid}>
        {/* Left column — Daily journal */}
        <div style={styles.todayJournal}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <span style={{ color: "#10b981" }}>✓</span> Done Today
            </h3>
            <textarea
              style={styles.journalTextarea}
              placeholder="What did you accomplish today?"
              value={note.done || ""}
              onChange={(e) => updateNote("done", e.target.value)}
            />
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <span style={{ color: "#3b82f6" }}>→</span> Working On
            </h3>
            <textarea
              style={styles.journalTextarea}
              placeholder="What are you currently working on?"
              value={note.doing || ""}
              onChange={(e) => updateNote("doing", e.target.value)}
            />
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <span style={{ color: "#ef4444" }}>⚠</span> Blockers
            </h3>
            <textarea
              style={{ ...styles.journalTextarea, minHeight: "60px" }}
              placeholder="Any blockers or issues?"
              value={note.blockers || ""}
              onChange={(e) => updateNote("blockers", e.target.value)}
            />
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <span style={{ color: "#8b5cf6" }}>📝</span> Notes
            </h3>
            <textarea
              style={styles.journalTextarea}
              placeholder="Free-form notes, ideas, observations..."
              value={note.notes || ""}
              onChange={(e) => updateNote("notes", e.target.value)}
            />
          </div>
        </div>

        {/* Right column — Tasks sidebar */}
        <div style={styles.todaySidebar}>
          {overdueTodos.length > 0 && (
            <div style={{ ...styles.card, borderLeft: "3px solid #ef4444" }}>
              <h3 style={{ ...styles.cardTitle, color: "#ef4444" }}>
                Overdue ({overdueTodos.length})
              </h3>
              {overdueTodos.map((todo) => (
                <MiniTodoItem key={todo.id} todo={todo} setTodos={setTodos} />
              ))}
            </div>
          )}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Today's Tasks ({todayTodos.length})</h3>
            {todayTodos.length === 0 && (
              <div style={styles.emptyState}>
                No tasks for today. Add some from the Todos view!
              </div>
            )}
            {todayTodos.map((todo) => (
              <MiniTodoItem key={todo.id} todo={todo} setTodos={setTodos} />
            ))}
          </div>
          <QuickAddTodo setTodos={setTodos} defaultDate={today} />
        </div>
      </div>
    </div>
  );
}
