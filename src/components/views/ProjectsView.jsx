import { useState } from "react";
import { PROJECT_STATUS } from "../../constants/projectStatus";
import { generateId } from "../../utils/idUtils";
import { getToday, formatDate } from "../../utils/dateUtils";
import { MiniTodoItem } from "../common/MiniTodoItem";
import { QuickAddTodo } from "../common/QuickAddTodo";
import { Icons } from "../icons/Icons";
import { styles } from "../../styles/styles";

// ---- ProjectForm ----
function ProjectForm({ project, onSave, onCancel }) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState(project?.status || "active");
  const [deadline, setDeadline] = useState(project?.deadline || "");

  return (
    <div style={styles.card}>
      <input
        style={styles.formInput}
        placeholder="Project name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <textarea
        style={{ ...styles.formInput, minHeight: "60px", fontFamily: "inherit", resize: "vertical" }}
        placeholder="Description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div style={styles.formRow}>
        <select
          style={styles.formSelect}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {Object.entries(PROJECT_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <input
          style={styles.formInput}
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          placeholder="Deadline"
        />
      </div>
      <div style={styles.formActions}>
        <button style={styles.secondaryBtn} onClick={onCancel}>
          Cancel
        </button>
        <button
          style={styles.primaryBtn}
          onClick={() =>
            name.trim() && onSave({ ...project, name, description, status, deadline })
          }
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ---- ProjectCard ----
function ProjectCard({ proj, todos, setTodos, setProjects, isExpanded, onToggle }) {
  const projTodos = todos.filter((t) => t.project === proj.name);
  const completed = projTodos.filter((t) => t.completed).length;
  const total = projTodos.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const status = PROJECT_STATUS[proj.status] || PROJECT_STATUS.active;

  return (
    <div style={styles.projectCard} onClick={onToggle}>
      <div style={styles.projectHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ ...styles.statusDot, background: status.color }} />
          <h3 style={styles.projectName}>{proj.name}</h3>
        </div>
        <div style={styles.todoActions}>
          <button
            style={styles.iconBtn}
            onClick={(e) => {
              e.stopPropagation();
              setProjects((prev) =>
                prev.map((p) => (p.id === proj.id ? { ...p, _editing: true } : p))
              );
            }}
          >
            <Icons.Edit />
          </button>
          <button
            style={styles.iconBtn}
            onClick={(e) => {
              e.stopPropagation();
              setProjects((prev) => prev.filter((p) => p.id !== proj.id));
            }}
          >
            <Icons.Trash />
          </button>
        </div>
      </div>

      {proj.description && <p style={styles.projectDesc}>{proj.description}</p>}
      {proj.deadline && (
        <div style={styles.projectDeadline}>
          <Icons.Clock /> Deadline: {formatDate(proj.deadline)}
        </div>
      )}

      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <span style={styles.progressText}>
          {completed}/{total} tasks ({progress}%)
        </span>
      </div>

      {isExpanded && (
        <div style={styles.projectExpanded}>
          <h4 style={styles.smallTitle}>Milestones</h4>
          <textarea
            style={{ ...styles.journalTextarea, minHeight: "60px" }}
            placeholder="Track milestones, notes..."
            value={proj.milestones || ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              setProjects((prev) =>
                prev.map((p) =>
                  p.id === proj.id ? { ...p, milestones: e.target.value } : p
                )
              );
            }}
          />
          <h4 style={{ ...styles.smallTitle, marginTop: "12px" }}>Related Tasks</h4>
          {projTodos.map((todo) => (
            <MiniTodoItem key={todo.id} todo={todo} setTodos={setTodos} />
          ))}
          <QuickAddTodo
            setTodos={(fn) => {
              setTodos((prev) => {
                const result = fn(prev);
                const last = result[result.length - 1];
                if (last && !last.project) last.project = proj.name;
                return result;
              });
            }}
            defaultDate=""
          />
        </div>
      )}
    </div>
  );
}

// ---- ProjectsView ----
export function ProjectsView({ projects, setProjects, todos, setTodos }) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div style={styles.viewContainer}>
      <div style={styles.viewHeader}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={styles.viewTitle}>Research Projects</h1>
          <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>
            <Icons.Plus /> New Project
          </button>
        </div>
      </div>

      {showForm && (
        <ProjectForm
          onSave={(proj) => {
            setProjects((prev) => [
              ...prev,
              { ...proj, id: generateId(), createdDate: getToday() },
            ]);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div style={styles.projectGrid}>
        {projects.map((proj) => {
          if (proj._editing) {
            return (
              <ProjectForm
                key={proj.id}
                project={proj}
                onSave={(updated) => {
                  setProjects((prev) =>
                    prev.map((p) =>
                      p.id === proj.id ? { ...p, ...updated, _editing: false } : p
                    )
                  );
                }}
                onCancel={() =>
                  setProjects((prev) =>
                    prev.map((p) => (p.id === proj.id ? { ...p, _editing: false } : p))
                  )
                }
              />
            );
          }

          return (
            <ProjectCard
              key={proj.id}
              proj={proj}
              todos={todos}
              setTodos={setTodos}
              setProjects={setProjects}
              isExpanded={expandedId === proj.id}
              onToggle={() => setExpandedId(expandedId === proj.id ? null : proj.id)}
            />
          );
        })}
        {projects.length === 0 && (
          <div style={styles.emptyStateLarge}>
            No projects yet. Create one to start tracking your research!
          </div>
        )}
      </div>
    </div>
  );
}
