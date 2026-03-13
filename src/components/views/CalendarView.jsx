import { useState } from "react";
import { getToday, formatDateFull } from "../../utils/dateUtils";
import { PRIORITIES } from "../../constants/priorities";
import { COLLECTION_TYPES } from "../../constants/collectionTypes";
import { MiniTodoItem } from "../common/MiniTodoItem";
import { Icons } from "../icons/Icons";
import { styles } from "../../styles/styles";

const COLLECTION_CALENDAR_META = {
  projects: { label: "Research", short: "R" },
  learning: { label: "Learning", short: "L" },
  traveling: { label: "Travel", short: "T" },
};

export function CalendarView({ todos, dailyNotes, setTodos, projects = [], learning = [], traveling = [] }) {
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
    setSelectedDate(null);
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
  while (days.length % 7 !== 0) days.push(null);

  const getDateStr = (day) => {
    if (!day) return "";
    return `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const today = getToday();
  const datedItems = [
    ...projects.map((item) => ({ ...item, category: "projects" })),
    ...learning.map((item) => ({ ...item, category: "learning" })),
    ...traveling.map((item) => ({ ...item, category: "traveling" })),
  ];

  return (
    <div style={{ ...styles.viewContainer, maxWidth: "1320px" }}>
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
            const dayItems = day
              ? datedItems.filter((item) => {
                  const start = item.startDate || "";
                  const end = item.deadline || "";
                  if (!start && !end) return false;
                  if (start && end) return dateStr >= start && dateStr <= end;
                  if (start) return dateStr >= start;
                  return dateStr <= end;
                })
              : [];

            return (
              <div
                key={i}
                style={{
                  ...styles.calDay,
                  ...(day ? styles.calDayActive : {}),
                  ...(isToday ? styles.calDayToday : {}),
                  ...(isSelected ? styles.calDaySelected : {}),
                }}
                onClick={() => {
                  if (!day) return;
                  setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
                }}
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
                    {dayItems.map((item) => {
                      return (
                        <div
                          key={`${item.category}-${item.id}`}
                          style={styles.calItemTag}
                          title={`${COLLECTION_CALENDAR_META[item.category]?.label || COLLECTION_TYPES[item.category]?.label}: ${item.name}`}
                        >
                          <span
                            style={{
                              ...styles.calItemCategory,
                              background: item.color || "#1a1a2e",
                            }}
                          >
                            {COLLECTION_CALENDAR_META[item.category]?.short || "?"}
                          </span>
                          <span style={styles.calItemName}>{item.name}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div style={styles.calSidebar}>
            <div style={styles.calSidebarHeader}>
              <h3 style={styles.cardTitle}>{formatDateFull(selectedDate)}</h3>
              <button style={styles.iconBtn} onClick={() => setSelectedDate(null)}>
                ×
              </button>
            </div>
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
            {(() => {
              const activeItems = datedItems.filter((item) => {
                const start = item.startDate || "";
                const end = item.deadline || "";
                if (!start && !end) return false;
                if (start && end) return selectedDate >= start && selectedDate <= end;
                if (start) return selectedDate >= start;
                return selectedDate <= end;
              });
              if (activeItems.length === 0) return null;
              const groupedItems = ["projects", "learning", "traveling"]
                .map((category) => ({
                  category,
                  items: activeItems.filter((item) => item.category === category),
                }))
                .filter((group) => group.items.length > 0);
              return (
                <div style={{ marginTop: "16px" }}>
                  <h4 style={styles.smallTitle}>Collections</h4>
                  {groupedItems.map((group) => (
                    <div key={group.category} style={{ marginTop: "10px" }}>
                      <div style={styles.calCollectionHeading}>
                        {COLLECTION_CALENDAR_META[group.category]?.label || COLLECTION_TYPES[group.category]?.label}
                      </div>
                      {group.items.map((item) => (
                        <div key={`${item.category}-${item.id}`} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 0" }}>
                          <span style={{ ...styles.statusDot, background: item.color || "#1a1a2e" }} />
                          <span style={{ fontSize: "12.5px", color: "#1a1a2e" }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
