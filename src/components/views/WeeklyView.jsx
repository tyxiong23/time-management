import { useState } from "react";
import { getWeekId, getWeekDates, formatDate } from "../../utils/dateUtils";
import { MiniTodoItem } from "../common/MiniTodoItem";
import { Icons } from "../icons/Icons";
import { styles } from "../../styles/styles";

export function WeeklyPlanView({ weeklyPlans, setWeeklyPlans, todos, setTodos }) {
  const [currentWeek, setCurrentWeek] = useState(getWeekId());
  const plan = weeklyPlans[currentWeek] || { goals: "", reflection: "", rating: 3 };
  const weekDates = getWeekDates(currentWeek);

  const updatePlan = (field, value) => {
    setWeeklyPlans((prev) => ({
      ...prev,
      [currentWeek]: { ...prev[currentWeek], [field]: value },
    }));
  };

  const navigateWeek = (delta) => {
    const dates = getWeekDates(currentWeek);
    const monday = new Date(dates[0] + "T00:00:00");
    monday.setDate(monday.getDate() + delta * 7);
    setCurrentWeek(getWeekId(monday));
  };

  const weekTodos = todos.filter((t) => t.dueDate && weekDates.includes(t.dueDate));

  return (
    <div style={styles.viewContainer}>
      <div style={styles.viewHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button style={styles.iconBtn} onClick={() => navigateWeek(-1)}>
            <Icons.ChevronLeft />
          </button>
          <h1 style={styles.viewTitle}>{currentWeek}</h1>
          <button style={styles.iconBtn} onClick={() => navigateWeek(1)}>
            <Icons.ChevronRight />
          </button>
          <button style={styles.secondaryBtn} onClick={() => setCurrentWeek(getWeekId())}>
            This Week
          </button>
        </div>
        <div style={styles.viewSubtitle}>
          {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
        </div>
      </div>

      <div style={styles.weeklyGrid}>
        {/* Left column — goals & reflection */}
        <div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🎯 Weekly Goals</h3>
            <textarea
              style={{ ...styles.journalTextarea, minHeight: "120px" }}
              placeholder={"What do you want to accomplish this week?\n- Goal 1\n- Goal 2\n- Goal 3"}
              value={plan.goals || ""}
              onChange={(e) => updatePlan("goals", e.target.value)}
            />
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🔄 Weekly Reflection</h3>
            <textarea
              style={{ ...styles.journalTextarea, minHeight: "100px" }}
              placeholder="What went well? What could be improved?"
              value={plan.reflection || ""}
              onChange={(e) => updatePlan("reflection", e.target.value)}
            />
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Week Rating</h3>
            <div style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => updatePlan("rating", n)}
                  style={{
                    ...styles.ratingBtn,
                    background: (plan.rating || 0) >= n ? "#f59e0b" : "#e5e7eb",
                    color: (plan.rating || 0) >= n ? "#fff" : "#9ca3af",
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — tasks this week */}
        <div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📋 This Week's Tasks ({weekTodos.length})</h3>
            {weekDates.map((date) => {
              const dayTodos = weekTodos.filter((t) => t.dueDate === date);
              if (dayTodos.length === 0) return null;
              return (
                <div key={date} style={{ marginBottom: "12px" }}>
                  <div style={styles.weekDayLabel}>{formatDate(date)}</div>
                  {dayTodos.map((todo) => (
                    <MiniTodoItem key={todo.id} todo={todo} setTodos={setTodos} />
                  ))}
                </div>
              );
            })}
            {weekTodos.length === 0 && (
              <div style={styles.emptyState}>No tasks scheduled this week.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
