import { useState } from "react";
import { STORAGE_KEYS } from "./constants/storage";
import { usePersistedState } from "./hooks/usePersistedState";
import { Sidebar } from "./components/Sidebar";
import { TodayView } from "./components/views/TodayView";
import { TodosView } from "./components/views/TodosView";
import { WeeklyPlanView } from "./components/views/WeeklyView";
import { CalendarView } from "./components/views/CalendarView";
import { ProjectsView } from "./components/views/ProjectsView";
import { styles } from "./styles/styles";

export default function App() {
  const [activeView, setActiveView] = useState("today");
  const [todos, setTodos]             = usePersistedState(STORAGE_KEYS.todos,       []);
  const [dailyNotes, setDailyNotes]   = usePersistedState(STORAGE_KEYS.dailyNotes,  {});
  const [weeklyPlans, setWeeklyPlans] = usePersistedState(STORAGE_KEYS.weeklyPlans, {});
  const [projects, setProjects]       = usePersistedState(STORAGE_KEYS.projects,    []);

  const activeTodoCount = todos.filter((t) => !t.completed).length;

  const renderView = () => {
    switch (activeView) {
      case "today":
        return (
          <TodayView
            dailyNotes={dailyNotes}
            setDailyNotes={setDailyNotes}
            todos={todos}
            setTodos={setTodos}
          />
        );
      case "todos":
        return (
          <TodosView
            todos={todos}
            setTodos={setTodos}
            projects={projects}
          />
        );
      case "weekly":
        return (
          <WeeklyPlanView
            weeklyPlans={weeklyPlans}
            setWeeklyPlans={setWeeklyPlans}
            todos={todos}
            setTodos={setTodos}
          />
        );
      case "calendar":
        return (
          <CalendarView
            todos={todos}
            dailyNotes={dailyNotes}
            setTodos={setTodos}
          />
        );
      case "projects":
        return (
          <ProjectsView
            projects={projects}
            setProjects={setProjects}
            todos={todos}
            setTodos={setTodos}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.appContainer}>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        todoCount={activeTodoCount}
      />
      <main style={styles.mainContent}>{renderView()}</main>
    </div>
  );
}
