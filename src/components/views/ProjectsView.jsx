import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { PROJECT_STATUS } from "../../constants/projectStatus";
import { COLLECTION_TYPES } from "../../constants/collectionTypes";
import { COLLECTION_COLORS } from "../../constants/collectionColors";
import { generateId } from "../../utils/idUtils";
import { getToday, formatDate, getDaysUntil } from "../../utils/dateUtils";
import { buildCollectionNote, extractCollectionNoteBody } from "../../utils/noteUtils";
import { getDateProgress, getEffectiveDateRange, isTodoLinkedToItem, normalizeTodoLink, pickCollectionColor } from "../../utils/collectionUtils";
import { normalizeLocationEntry, parseLocationInput, serializeLocationEntry, serializeLocationObject } from "../../utils/travelMapUtils";
import { MiniTodoItem } from "../common/MiniTodoItem";
import { QuickAddTodo } from "../common/QuickAddTodo";
import { Icons } from "../icons/Icons";
import { NotePreview, MarkdownModal } from "../common/MarkdownEditor";
import { styles } from "../../styles/styles";

const LazyTravelMap = lazy(() => import("./TravelMap"));

function parseLocations(value) {
  return value
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean);
}

function CollectionForm({ item, collectionType, onSave, onCancel }) {
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [status, setStatus] = useState(item?.status || "active");
  const [startDate, setStartDate] = useState(item?.startDate || "");
  const [deadline, setDeadline] = useState(item?.deadline || "");
  const [color, setColor] = useState(item?.color || COLLECTION_COLORS[0]);
  const [locationsInput, setLocationsInput] = useState(
    (item?.locations || []).map((location) => serializeLocationObject(normalizeLocationEntry(location))).join("\n")
  );
  const [locationQuery, setLocationQuery] = useState("");
  const [searchingLocations, setSearchingLocations] = useState(false);
  const [locationResults, setLocationResults] = useState([]);
  const [locationSearchError, setLocationSearchError] = useState("");
  const supportsLocations = collectionType === "traveling";

  const searchLocations = async () => {
    const query = locationQuery.trim();
    if (!query) return;
    setSearchingLocations(true);
    setLocationSearchError("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("search_failed");
      const data = await response.json();
      setLocationResults(
        data.map((entry) => ({
          label: entry.display_name,
          lat: Number(entry.lat),
          lng: Number(entry.lon),
        }))
      );
      if (data.length === 0) {
        setLocationSearchError("No matching location found.");
      }
    } catch {
      setLocationResults([]);
      setLocationSearchError("Online search failed. You can still enter `Name | lat, lng` manually.");
    } finally {
      setSearchingLocations(false);
    }
  };

  const appendLocation = (serializedLocation) => {
    setLocationsInput((prev) => (prev.trim() ? `${prev}\n${serializedLocation}` : serializedLocation));
  };

  return (
    <div style={styles.card}>
      <input
        style={styles.formInput}
        placeholder={`${COLLECTION_TYPES[collectionType].singular} name...`}
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
      {supportsLocations && (
        <>
          <textarea
            style={{ ...styles.formInput, minHeight: "78px", fontFamily: "inherit", resize: "vertical" }}
            placeholder={"Locations, one per line\nTokyo\nKyoto\nReykjavik | 64.1466, -21.9426"}
            value={locationsInput}
            onChange={(e) => setLocationsInput(e.target.value)}
          />
          <div style={styles.locationSearchBox}>
            <input
              style={{ ...styles.formInput, marginBottom: 0, flex: 1 }}
              placeholder="Search exact place online..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchLocations()}
            />
            <button type="button" style={styles.secondaryBtn} onClick={searchLocations} disabled={searchingLocations}>
              {searchingLocations ? "Searching..." : "Search"}
            </button>
          </div>
          {locationSearchError && <div style={styles.inlineHint}>{locationSearchError}</div>}
          {locationResults.length > 0 && (
            <div style={styles.locationResults}>
              {locationResults.map((result) => (
                <button
                  key={`${result.label}-${result.lat}-${result.lng}`}
                  type="button"
                  style={styles.locationResultBtn}
                  onClick={() => {
                    appendLocation(serializeLocationEntry(result.label, result.lat, result.lng));
                    setLocationQuery("");
                    setLocationResults([]);
                    setLocationSearchError("");
                  }}
                >
                  <strong>{result.label}</strong>
                  <span>{result.lat.toFixed(4)}, {result.lng.toFixed(4)}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      <div style={styles.formRow}>
        <select
          style={styles.formSelect}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {Object.entries(PROJECT_STATUS).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label style={styles.formLabel}>Start</label>
          <input
            style={{ ...styles.formInput, marginBottom: 0 }}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label style={styles.formLabel}>End</label>
          <input
            style={{ ...styles.formInput, marginBottom: 0 }}
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>
      <div style={{ marginBottom: "12px" }}>
        <div style={styles.formLabel}>Color</div>
        <div style={styles.colorPalette}>
          {COLLECTION_COLORS.map((paletteColor) => (
            <button
              key={paletteColor}
              type="button"
              onClick={() => setColor(paletteColor)}
              style={{
                ...styles.colorSwatch,
                background: paletteColor,
                ...(color === paletteColor ? styles.colorSwatchActive : {}),
              }}
              aria-label={`Select color ${paletteColor}`}
            />
          ))}
        </div>
      </div>
      <div style={styles.formActions}>
        <button style={styles.secondaryBtn} onClick={onCancel}>
          Cancel
        </button>
        <button
          style={styles.primaryBtn}
          onClick={() =>
            name.trim() &&
          onSave({
              ...item,
              name: name.trim(),
              description,
              status,
              startDate,
              deadline,
              color,
              locations: supportsLocations
                ? parseLocations(locationsInput).map((location) => normalizeLocationEntry(location)).filter(Boolean)
                : item?.locations || [],
            })
          }
        >
          Save
        </button>
      </div>
    </div>
  );
}

function MilestoneItem({ milestone, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(milestone.text);
  const [dueDate, setDueDate] = useState(milestone.dueDate || "");
  const isOverdue = !milestone.completed && milestone.dueDate && milestone.dueDate < getToday();

  return (
    <div style={styles.milestoneItem}>
      <button
        style={{
          ...styles.todoCheckbox,
          ...(milestone.completed ? { background: "#7c3aed", borderColor: "#7c3aed" } : {}),
          width: "16px",
          height: "16px",
        }}
        onClick={onToggle}
      >
        {milestone.completed && <Icons.Check />}
      </button>
      {editing ? (
        <div style={{ flex: 1, display: "flex", gap: "6px", alignItems: "center" }}>
          <input
            style={{ ...styles.formInput, marginBottom: 0, flex: 1 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim()) {
                onUpdate({ ...milestone, text: text.trim(), dueDate });
                setEditing(false);
              }
              if (e.key === "Escape") {
                setText(milestone.text);
                setDueDate(milestone.dueDate || "");
                setEditing(false);
              }
            }}
            autoFocus
          />
          <input
            style={{ ...styles.formInput, marginBottom: 0, width: "130px" }}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button
            style={styles.iconBtn}
            onClick={() => {
              if (text.trim()) {
                onUpdate({ ...milestone, text: text.trim(), dueDate });
                setEditing(false);
              }
            }}
          >
            <Icons.Check />
          </button>
        </div>
      ) : (
        <>
          <span
            style={{
              ...styles.milestoneText,
              ...(milestone.completed ? { textDecoration: "line-through", color: "#9ca3af" } : {}),
            }}
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            {milestone.text}
          </span>
          {milestone.dueDate && (
            <span style={{ ...styles.milestoneDue, ...(isOverdue ? { color: "#ef4444" } : {}) }}>
              {formatDate(milestone.dueDate)}
            </span>
          )}
          <button
            style={{ ...styles.iconBtn, width: "24px", height: "24px", opacity: 0.4 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Icons.Trash />
          </button>
        </>
      )}
    </div>
  );
}

function MilestoneAdd({ onAdd }) {
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onAdd({ id: generateId(), text: text.trim(), dueDate, completed: false });
    setText("");
    setDueDate("");
  };

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "6px" }}>
      <input
        style={{ ...styles.quickAddInput, flex: 1, padding: "6px 10px" }}
        placeholder="Add milestone..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <input
        style={{ ...styles.formInput, marginBottom: 0, width: "130px", padding: "6px 10px", fontSize: "12px" }}
        type="date"
        value={dueDate}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setDueDate(e.target.value)}
      />
    </div>
  );
}

function CollectionCard({ item, collectionType, todos, setTodos, setItems, isExpanded, onToggle }) {
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const linkedTodos = todos.filter((todo) => isTodoLinkedToItem(todo, collectionType, item.name));
  const noteContent = useMemo(() => buildCollectionNote(item, collectionType, todos), [item, collectionType, todos]);
  const today = getToday();
  const dateProgress = getDateProgress(item.startDate, item.deadline, today);
  const effectiveRange = getEffectiveDateRange(item.startDate, item.deadline);
  const milestones = Array.isArray(item.milestones) ? item.milestones : [];
  const finishedTasks = linkedTodos.filter((todo) => todo.completed).length;
  const status = PROJECT_STATUS[item.status] || PROJECT_STATUS.active;
  const daysRemaining = item.status === "active" ? getDaysUntil(effectiveRange.endDate, today) : null;

  const updateItem = (updates) => {
    setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, ...updates } : entry)));
  };

  return (
    <div
      style={{ ...styles.projectCard, borderTop: `4px solid ${item.color || "#2563eb"}` }}
      onClick={onToggle}
    >
      <div style={styles.projectHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ ...styles.statusDot, background: item.color || "#2563eb" }} />
          <h3 style={styles.projectName}>{item.name}</h3>
          <span style={{ ...styles.todoTag, background: `${status.color}18`, color: status.color }}>
            {status.label}
          </span>
        </div>
        <div style={styles.todoActions}>
          <button
            style={styles.iconBtn}
            onClick={(e) => {
              e.stopPropagation();
              setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, _editing: true } : entry)));
            }}
          >
            <Icons.Edit />
          </button>
          <button
            style={styles.iconBtn}
            onClick={(e) => {
              e.stopPropagation();
              setItems((prev) => prev.filter((entry) => entry.id !== item.id));
            }}
          >
            <Icons.Trash />
          </button>
        </div>
      </div>

      {item.description && <p style={styles.projectDesc}>{item.description}</p>}

      {(effectiveRange.startDate || effectiveRange.endDate) && (
        <div style={styles.projectDeadline}>
          <Icons.Clock />
          {effectiveRange.startDate && effectiveRange.endDate
            ? `${formatDate(effectiveRange.startDate)} — ${formatDate(effectiveRange.endDate)}`
            : effectiveRange.startDate
              ? `Start: ${formatDate(effectiveRange.startDate)}`
              : `Deadline: ${formatDate(effectiveRange.endDate)}`}
        </div>
      )}

      {collectionType === "traveling" && item.locations?.length > 0 && (
        <div style={styles.locationChipRow}>
          {item.locations.map((location, index) => {
            const parsed = normalizeLocationEntry(location);
            return (
              <span key={`${parsed?.label || "location"}-${index}`} style={styles.locationChip}>
                {parsed?.label || String(location)}
              </span>
            );
          })}
        </div>
      )}

      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, background: item.color || "#2563eb", width: `${dateProgress}%` }} />
        </div>
        <div style={styles.progressMetaRow}>
          <span style={styles.progressText}>Date progress: {dateProgress}%</span>
          {item.status === "active" && effectiveRange.endDate && daysRemaining != null && (
            <span style={styles.progressWarningText}>
              {daysRemaining >= 0 ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left` : `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} overdue`}
            </span>
          )}
        </div>
      </div>
      <div style={styles.collectionTaskStats}>
        Total tasks: {linkedTodos.length} · Finished tasks: {finishedTasks}
      </div>

      {isExpanded && (
        <div style={styles.projectExpanded} onClick={(e) => e.stopPropagation()}>
          <h4 style={styles.smallTitle}>Notes</h4>
          <NotePreview content={noteContent} onClick={() => setShowNoteEditor(true)} />
          {showNoteEditor && (
            <MarkdownModal
              title={`${item.name} — Notes`}
              content={noteContent}
              onChange={(value) => updateItem({ notes: extractCollectionNoteBody(value) })}
              onClose={() => setShowNoteEditor(false)}
            />
          )}

          <h4 style={{ ...styles.smallTitle, marginTop: "16px" }}>
            Milestones
            {milestones.length > 0 && (
              <span style={styles.milestoneCount}>
                {" "}{milestones.filter((milestone) => milestone.completed).length}/{milestones.length}
              </span>
            )}
          </h4>
          <div style={styles.milestoneList}>
            {milestones.map((milestone) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                onToggle={() => updateItem({
                  milestones: milestones.map((entry) =>
                    entry.id === milestone.id ? { ...entry, completed: !entry.completed } : entry
                  ),
                })}
                onDelete={() => updateItem({
                  milestones: milestones.filter((entry) => entry.id !== milestone.id),
                })}
                onUpdate={(updated) => updateItem({
                  milestones: milestones.map((entry) => (entry.id === milestone.id ? updated : entry)),
                })}
              />
            ))}
          </div>
          <MilestoneAdd onAdd={(milestone) => updateItem({ milestones: [...milestones, milestone] })} />

          <h4 style={{ ...styles.smallTitle, marginTop: "16px" }}>Related Tasks</h4>
          {linkedTodos.map((todo) => (
            <MiniTodoItem key={todo.id} todo={todo} setTodos={setTodos} />
          ))}
          <QuickAddTodo
            setTodos={setTodos}
            defaultDate=""
            defaultCategory={collectionType}
            defaultRelatedItem={item.name}
          />

          {collectionType === "traveling" && (
            <div style={{ marginTop: "16px", ...styles.cardInset }}>
              <h4 style={styles.smallTitle}>Travel Map</h4>
              <div style={styles.travelInlineMapList}>
                {item.locations.map((location, index) => {
                  const parsed = normalizeLocationEntry(location) || parseLocationInput(location);
                  return (
                    <div key={`${parsed?.label || "location"}-${index}`} style={styles.travelInlineMapItem}>
                      <span style={{ ...styles.statusDot, background: parsed?.lat != null ? item.color || "#2563eb" : "#d1d5db" }} />
                      <span>
                        {parsed?.label || location}
                        {parsed?.lat == null && " (needs coordinates)"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CollectionView({ collectionType, items, setItems, todos, setTodos }) {
  const typeInfo = COLLECTION_TYPES[collectionType];
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setItems((prev) => {
      let changed = false;
      const next = prev.map((item, index) => {
        const normalizedBody = extractCollectionNoteBody(item.notes || "");
        const nextItem = {
          ...item,
          notes: normalizedBody,
          color: item.color || pickCollectionColor(index),
          createdAt: item.createdAt || `${item.createdDate || getToday()}T00:00:00`,
          milestones: Array.isArray(item.milestones) ? item.milestones : [],
          locations: Array.isArray(item.locations)
            ? item.locations.map((location) => normalizeLocationEntry(location)).filter(Boolean)
            : [],
        };
        if (
          nextItem.notes !== item.notes ||
          nextItem.color !== item.color ||
          nextItem.createdAt !== item.createdAt ||
          nextItem.milestones !== item.milestones ||
          nextItem.locations !== item.locations
        ) {
          changed = true;
        }
        return nextItem;
      });
      return changed ? next : prev;
    });
  }, [setItems]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const leftDeadline = getEffectiveDateRange(a.startDate, a.deadline).endDate || "9999-12-31";
      const rightDeadline = getEffectiveDateRange(b.startDate, b.deadline).endDate || "9999-12-31";
      if (leftDeadline !== rightDeadline) {
        if (leftDeadline === "9999-12-31") return 1;
        if (rightDeadline === "9999-12-31") return -1;
        return rightDeadline.localeCompare(leftDeadline);
      }

      const leftCreated = a.createdAt || `${a.createdDate || ""}T00:00:00`;
      const rightCreated = b.createdAt || `${b.createdDate || ""}T00:00:00`;
      return rightCreated.localeCompare(leftCreated);
    });
  }, [items]);

  return (
    <div style={styles.viewContainer}>
      <div style={styles.viewHeader}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={styles.viewTitle}>{typeInfo.label}</h1>
          <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>
            <Icons.Plus /> New {typeInfo.singular}
          </button>
        </div>
      </div>

      {showForm && (
        <CollectionForm
          collectionType={collectionType}
          onSave={(item) => {
            setItems((prev) => [
              {
                ...item,
                id: generateId(),
                createdDate: getToday(),
                createdAt: new Date().toISOString(),
                milestones: [],
                notes: "",
                color: item.color || pickCollectionColor(prev.length),
                locations: item.locations || [],
              },
              ...prev,
            ]);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {collectionType === "traveling" && items.length > 0 && (
        <Suspense fallback={<div style={styles.travelMapLoading}>Loading travel map...</div>}>
          <LazyTravelMap
            items={sortedItems}
            selectedItemId={expandedId}
            onSelectItem={(itemId) => setExpandedId((prev) => (prev === itemId ? null : itemId))}
          />
        </Suspense>
      )}

      <div style={styles.projectGrid}>
        {sortedItems.map((item) => {
          if (item._editing) {
            return (
              <CollectionForm
                key={item.id}
                item={item}
                collectionType={collectionType}
                onSave={(updated) => {
                  if (updated.name !== item.name) {
                    setTodos((prev) =>
                      prev.map((todo) => {
                        const normalized = normalizeTodoLink(todo);
                        return normalized.category === collectionType && normalized.relatedItem === item.name
                          ? { ...normalized, relatedItem: updated.name, project: collectionType === "projects" ? updated.name : "" }
                          : normalized;
                      })
                    );
                  }
                  setItems((prev) => prev.map((entry) => (
                    entry.id === item.id ? { ...entry, ...updated, _editing: false } : entry
                  )));
                }}
                onCancel={() => setItems((prev) => prev.map((entry) => (
                  entry.id === item.id ? { ...entry, _editing: false } : entry
                )))}
              />
            );
          }

          return (
            <CollectionCard
              key={item.id}
              item={item}
              collectionType={collectionType}
              todos={todos}
              setTodos={setTodos}
              setItems={setItems}
              isExpanded={expandedId === item.id}
              onToggle={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
            />
          );
        })}
        {sortedItems.length === 0 && (
          <div style={styles.emptyStateLarge}>
            No {typeInfo.label.toLowerCase()} yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectsView(props) {
  return (
    <CollectionView
      collectionType="projects"
      items={props.projects}
      setItems={props.setProjects}
      todos={props.todos}
      setTodos={props.setTodos}
    />
  );
}

export function LearningView(props) {
  return <CollectionView {...props} collectionType="learning" />;
}

export function TravelingView(props) {
  return <CollectionView {...props} collectionType="traveling" />;
}
