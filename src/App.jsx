import { useState } from "react";
import { STORAGE_KEYS } from "./constants/storage";
import { usePersistedState } from "./hooks/usePersistedState";
import { Sidebar } from "./components/Sidebar";
import { TodayView } from "./components/views/TodayView";
import { TodosView } from "./components/views/TodosView";
import { WeeklyPlanView } from "./components/views/WeeklyView";
import { CalendarView } from "./components/views/CalendarView";
import { LearningView, ProjectsView, TravelingView } from "./components/views/ProjectsView";
import { normalizeTodoLink } from "./utils/collectionUtils";
import { styles } from "./styles/styles";

export default function App() {
  const [activeView, setActiveView] = useState("today");
  const [todos, setTodos]             = usePersistedState(STORAGE_KEYS.todos,       []);
  const [dailyNotes, setDailyNotes]   = usePersistedState(STORAGE_KEYS.dailyNotes,  {});
  const [weeklyPlans, setWeeklyPlans] = usePersistedState(STORAGE_KEYS.weeklyPlans, {});
  const [projects, setProjects]       = usePersistedState(STORAGE_KEYS.projects,    []);
  const [learning, setLearning]       = usePersistedState(STORAGE_KEYS.learning,    []);
  const [traveling, setTraveling]     = usePersistedState(STORAGE_KEYS.traveling,   []);

  const normalizedTodos = todos.map(normalizeTodoLink);

  const activeTodoCount = normalizedTodos.filter((t) => !t.completed).length;

  const renderView = () => {
    switch (activeView) {
      case "today":
        return (
          <TodayView
            dailyNotes={dailyNotes}
            setDailyNotes={setDailyNotes}
            todos={normalizedTodos}
            setTodos={setTodos}
          />
        );
      case "todos":
        return (
          <TodosView
            todos={normalizedTodos}
            setTodos={setTodos}
            projects={projects}
            learning={learning}
            traveling={traveling}
          />
        );
      case "weekly":
        return (
          <WeeklyPlanView
            weeklyPlans={weeklyPlans}
            setWeeklyPlans={setWeeklyPlans}
            todos={normalizedTodos}
            setTodos={setTodos}
          />
        );
      case "calendar":
        return (
          <CalendarView
            todos={normalizedTodos}
            dailyNotes={dailyNotes}
            setTodos={setTodos}
            projects={projects}
            learning={learning}
            traveling={traveling}
          />
        );
      case "projects":
        return (
          <ProjectsView
            projects={projects}
            setProjects={setProjects}
            todos={normalizedTodos}
            setTodos={setTodos}
          />
        );
      case "learning":
        return (
          <LearningView
            items={learning}
            setItems={setLearning}
            todos={normalizedTodos}
            setTodos={setTodos}
          />
        );
      case "traveling":
        return (
          <TravelingView
            items={traveling}
            setItems={setTraveling}
            todos={normalizedTodos}
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
