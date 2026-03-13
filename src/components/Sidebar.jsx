import { Icons } from "./icons/Icons";
import { formatDateFull, getToday } from "../utils/dateUtils";
import { styles } from "../styles/styles";

export function Sidebar({ activeView, setActiveView, todoCount }) {
  const navItems = [
    { id: "today",    label: "Today",       icon: <Icons.Book /> },
    { id: "todos",    label: "Todos",       icon: <Icons.Check />, badge: todoCount },
    { id: "weekly",   label: "Weekly Plan", icon: <Icons.Target /> },
    { id: "calendar", label: "Calendar",    icon: <Icons.Calendar /> },
    { id: "projects", label: "Projects",    icon: <Icons.Folder /> },
    { id: "learning", label: "Learning",    icon: <Icons.Cap /> },
    { id: "traveling", label: "Traveling",  icon: <Icons.Map /> },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>LabFlow</span>
        </div>
        <div style={styles.logoSubtitle}>research · plan · ship</div>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            style={{
              ...styles.navItem,
              ...(activeView === item.id ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navLabel}>{item.label}</span>
            {item.badge > 0 && <span style={styles.navBadge}>{item.badge}</span>}
          </button>
        ))}
      </nav>

      <div style={styles.sidebarFooter}>
        <div style={styles.dateDisplay}>{formatDateFull(getToday())}</div>
      </div>
    </div>
  );
}
