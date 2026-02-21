import { useState } from "react";
import { getToday, formatDateFull } from "../../utils/dateUtils";
import { PRIORITIES } from "../../constants/priorities";
import { MiniTodoItem } from "../common/MiniTodoItem";
import { Icons } from "../icons/Icons";
import { styles } from "../../styles/styles";

export function CalendarView({ todos, dailyNotes, setTodos }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  const navigateMonth = (delta) => {
    setCurrentMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const getDateStr = (day) => {
    if (!day) return "";
    return `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const today = getToday();

  return (
    <div style={styles.viewContainer}>
      <div style={styles.viewHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button style={styles.iconBtn} onClick={() => navigateMonth(-1)}>
            <Icons.ChevronLeft />
          </button>
          <h1 style={styles.viewTitle}>{monthName}</h1>
          <button style={styles.iconBtn} onClick={() => navigateMonth(1)}>
            <Icons.ChevronRight />
          </button>
        </div>
      </div>

      <div style={styles.calendarContainer}>
        <div style={styles.calendarGrid}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={styles.calDayHeader}>{d}</div>
          ))}
          {days.map((day, i) => {
            const dateStr = getDateStr(day);
            const dayTodos = day ? todos.filter((t) => t.dueDate === dateStr) : [];
            const hasNote = day && dailyNotes[dateStr];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;

            return (
              <div
                key={i}
                style={{
                  ...styles.calDay,
                  ...(day ? styles.calDayActive : {}),
                  ...(isToday ? styles.calDayToday : {}),
                  ...(isSelected ? styles.calDaySelected : {}),
                }}
                onClick={() => day && setSelectedDate(dateStr)}
              >
                {day && (
                  <>
                    <div style={styles.calDayNum}>{day}</div>
                    <div style={styles.calDots}>
                      {dayTodos.slice(0, 3).map((t, j) => (
                        <span
                          key={j}
                          style={{
                            ...styles.calDot,
                            background: t.completed
                              ? "#10b981"
                              : PRIORITIES[t.priority]?.color || "#3b82f6",
                          }}
                        />
                      ))}
                      {hasNote && (
                        <span style={{ ...styles.calDot, background: "#8b5cf6" }} />
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div style={styles.calSidebar}>
            <h3 style={styles.cardTitle}>{formatDateFull(selectedDate)}</h3>
            <div style={{ marginTop: "12px" }}>
              <h4 style={styles.smallTitle}>Tasks</h4>
              {todos.filter((t) => t.dueDate === selectedDate).map((todo) => (
                <MiniTodoItem key={todo.id} todo={todo} setTodos={setTodos} />
              ))}
              {todos.filter((t) => t.dueDate === selectedDate).length === 0 && (
                <div style={styles.emptyState}>No tasks</div>
              )}
            </div>
            {dailyNotes[selectedDate] && (
              <div style={{ marginTop: "16px" }}>
                <h4 style={styles.smallTitle}>Journal</h4>
                {dailyNotes[selectedDate].done && (
                  <p style={styles.calNoteText}>✓ {dailyNotes[selectedDate].done}</p>
                )}
                {dailyNotes[selectedDate].doing && (
                  <p style={styles.calNoteText}>→ {dailyNotes[selectedDate].doing}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
