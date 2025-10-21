"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { formatCurrency, formatDate, formatPercent } from "../lib/format";
import type {
  CostWithComputed,
  DiscussionEntry,
  DiscussionType,
  ProjectBundle,
  TaskItem
} from "../lib/types";

const DISCUSSION_LABELS: Record<DiscussionType, string> = {
  RATIONALE: "Begründung",
  QUESTION: "Frage",
  COUNTERPROPOSAL: "Gegenvorschlag"
};

const TAB_LABELS = {
  details: "Details",
  documents: "Dokumente",
  discussion: "Diskussion"
} as const;

type TabKey = keyof typeof TAB_LABELS;

type Selection =
  | { kind: "cost"; item: CostWithComputed }
  | { kind: "task"; item: TaskItem };

export interface ProjectPageProps {
  bundle: ProjectBundle;
}

export function ProjectPage({ bundle }: ProjectPageProps) {
  const { organization, project, costs, roles, tasks, discussions } = bundle;
  const [selection, setSelection] = useState<Selection | null>(
    costs.length > 0 ? { kind: "cost", item: costs[0] } : tasks[0] ? { kind: "task", item: tasks[0] } : null
  );
  const [activeTab, setActiveTab] = useState<TabKey>("details");
  const [documentStatus, setDocumentStatus] = useState<"idle" | "loading" | "available" | "missing">("idle");

  useEffect(() => {
    if (activeTab !== "documents") {
      return;
    }
    if (!selection || selection.kind !== "cost" || !selection.item.document) {
      setDocumentStatus("missing");
      return;
    }

    let aborted = false;
    setDocumentStatus("loading");
    fetch(selection.item.document, { method: "HEAD" })
      .then((response) => {
        if (aborted) return;
        setDocumentStatus(response.ok ? "available" : "missing");
      })
      .catch(() => {
        if (!aborted) {
          setDocumentStatus("missing");
        }
      });

    return () => {
      aborted = true;
    };
  }, [activeTab, selection]);

  const relevantDiscussionEntries = useMemo(() => {
    if (!selection) {
      return discussions;
    }
    return discussions.filter((entry) =>
      entry.itemId ? entry.itemId === selection.item.id : true
    );
  }, [discussions, selection]);

  const handleSupportClick = (item: CostWithComputed) => {
    alert(
      `Demo: Du würdest die Kostenposition "${item.title}" unterstützen. In der Vollversion kannst du hier deine monatliche Zusage einstellen.`
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8 lg:py-12">
      <header className="mb-12 space-y-4">
        <div className="text-sm uppercase tracking-wide text-primary">{organization.name}</div>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{project.title}</h1>
        <p className="text-lg text-slate-700">Ein Ort von und für Hainfelder</p>
        <p className="text-sm text-slate-500">Standort: Hainfeld, NÖ</p>
        <p className="max-w-3xl text-base text-slate-700">{project.summary}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-12">
          <section aria-labelledby="kosten-heading" className="space-y-6">
            <div>
              <h2 id="kosten-heading" className="text-2xl font-semibold text-slate-900">
                Kosten (monatlich)
              </h2>
              <p className="text-sm text-slate-600">
                Transparente Übersicht über laufende Ausgaben und wie viel bereits zugesagt ist.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {costs.map((cost) => (
                <CostCard
                  key={cost.id}
                  cost={cost}
                  isActive={selection?.kind === "cost" && selection.item.id === cost.id}
                  onSelect={() => {
                    setSelection({ kind: "cost", item: cost });
                    setActiveTab("details");
                  }}
                  onSupport={() => handleSupportClick(cost)}
                />
              ))}
            </div>
          </section>

          <section aria-labelledby="aufgaben-heading" className="space-y-6">
            <div>
              <h2 id="aufgaben-heading" className="text-2xl font-semibold text-slate-900">
                Aufgaben
              </h2>
              <p className="text-sm text-slate-600">
                Rollen zum Mitgestalten und ein Wochenplan zum Hüten des Raums.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-medium text-slate-900">Rollen</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {roles.map((role) => (
                  <li key={role.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelection({ kind: "task", item: role });
                        setActiveTab("details");
                      }}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:border-primary/70 hover:shadow focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <div className="font-medium text-slate-900">{role.title}</div>
                      <div className="text-xs text-slate-600">{role.description}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isActive={selection?.kind === "task" && selection.item.id === task.id}
                onSelect={() => {
                  setSelection({ kind: "task", item: task });
                  setActiveTab("details");
                }}
              />
            ))}
          </section>
        </div>

        <aside className="lg:sticky lg:top-10">
          <Sidebar
            selection={selection}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            discussionEntries={relevantDiscussionEntries}
            documentStatus={documentStatus}
          />
        </aside>
      </div>
    </div>
  );
}

interface CostCardProps {
  cost: CostWithComputed;
  isActive: boolean;
  onSelect: () => void;
  onSupport: () => void;
}

function CostCard({ cost, isActive, onSelect, onSupport }: CostCardProps) {
  const hasNeed = typeof cost.need === "number" && cost.need > 0;
  const coveragePercent = Math.min(cost.coverageRatio, 1);
  const coverageLabel = hasNeed
    ? `${formatPercent(coveragePercent)} gedeckt`
    : "Betrag offen";
  const needLabel = hasNeed
    ? `${formatCurrency(cost.need!, cost.currency)} pro Monat`
    : "Betrag offen";

  const pledgeSummary = (() => {
    if (cost.preview.chargeGroups.length === 0) {
      return "Noch keine Zusagen";
    }
    const parts = cost.preview.chargeGroups.map((group) =>
      `${group.count}× ${formatCurrency(group.amount, cost.currency)}`
    );
    return `Aliquot-Vorschau: ${parts.join(" · ")} pro Person`;
  })();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`group flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
        isActive ? "border-primary" : "border-slate-200 hover:border-primary/60"
      }`}
    >
      <div className="space-y-2">
        {cost.subtitle && (
          <div className="text-xs font-medium uppercase tracking-wide text-primary/90">
            {cost.subtitle}
          </div>
        )}
        <h3 className="text-xl font-semibold text-slate-900">{cost.title}</h3>
        <p className="text-sm text-slate-600">{needLabel}</p>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
          <span>Deckungsgrad</span>
          <span>{coverageLabel}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-primary"
            style={{ width: `${Math.min(coveragePercent * 100, 100)}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-slate-600">{pledgeSummary}</p>

      <div className="mt-auto flex items-center justify-between">
        <div className="text-xs font-medium text-slate-500">
          {cost.pledges.reduce((sum, pledge) => sum + pledge.count, 0)} Zusagen
        </div>
        <button
          type="button"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-light"
          onClick={(event) => {
            event.stopPropagation();
            onSupport();
          }}
        >
          Diesen Punkt monatlich unterstützen
        </button>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: TaskItem;
  isActive: boolean;
  onSelect: () => void;
}

function TaskCard({ task, isActive, onSelect }: TaskCardProps) {
  const schedule = task.schedule ?? {
    label: "Flexible Einteilung",
    startHour: 8,
    endHour: 20,
    days: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
  };
  const hours = Array.from({ length: Math.max(schedule.endHour - schedule.startHour, 1) }, (_, index) => schedule.startHour + index);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`rounded-xl border bg-white p-6 shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/60 ${
        isActive ? "border-primary" : "border-slate-200 hover:border-primary/60"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{task.title}</h3>
            <p className="text-sm text-slate-600">{schedule.label}</p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelect();
            }}
            className="rounded-md border border-primary/40 px-3 py-1 text-sm font-medium text-primary transition hover:bg-primary/10 focus-visible:bg-primary/10"
          >
            Details anzeigen
          </button>
        </div>
        <p className="text-sm text-slate-600">{task.description}</p>

        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-600">
              {schedule.days.map((day) => (
                <div key={day} className="font-medium uppercase tracking-wide text-slate-700">
                  {day.slice(0, 2)}
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2 text-xs">
              {schedule.days.map((day) => (
                <div key={`${day}-slots`} className="space-y-1">
                  {hours.map((hour) => (
                    <div
                      key={`${day}-${hour}`}
                      className="rounded border border-dashed border-slate-200 bg-slate-50 py-1 text-slate-500"
                    >
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  selection: Selection | null;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  discussionEntries: DiscussionEntry[];
  documentStatus: "idle" | "loading" | "available" | "missing";
}

function Sidebar({
  selection,
  activeTab,
  onTabChange,
  discussionEntries,
  documentStatus
}: SidebarProps) {
  const [pendingType, setPendingType] = useState<DiscussionType>("RATIONALE");
  const [pendingContent, setPendingContent] = useState("");
  const [submittedPreview, setSubmittedPreview] = useState<DiscussionEntry | null>(null);

  useEffect(() => {
    setSubmittedPreview(null);
    setPendingContent("");
    setPendingType("RATIONALE");
  }, [selection]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = pendingContent.trim();
    if (!trimmed) {
      return;
    }
    const placeholder: DiscussionEntry = {
      id: `preview_${Date.now()}`,
      projectId: "preview",
      itemId: selection?.item.id,
      author: "Dein Beitrag (in Prüfung)",
      type: pendingType,
      createdAt: new Date().toISOString(),
      content: trimmed
    };
    setSubmittedPreview(placeholder);
    setPendingContent("");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="border-b border-slate-200 p-6">
        <div className="text-sm uppercase tracking-wide text-primary">Sidebar</div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {selection ? selection.item.title : "Bitte ein Element wählen"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {selection
            ? selection.kind === "cost"
              ? "Details, Dokumente und Diskussion zur Kostenposition"
              : "Aufgabenbeschreibung und Abstimmung"
            : "Wähle eine Kosten- oder Aufgabenkarte, um mehr zu erfahren."}
        </p>
      </div>
      <div className="border-b border-slate-200 px-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          {(Object.keys(TAB_LABELS) as TabKey[]).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => onTabChange(tabKey)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition ${
                activeTab === tabKey
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-primary"
              }`}
            >
              {TAB_LABELS[tabKey]}
            </button>
          ))}
        </nav>
      </div>
      <div className="space-y-6 p-6 text-sm text-slate-700">
        {!selection && <p>Keine Auswahl – bitte auf eine Karte klicken.</p>}

        {selection && activeTab === "details" && (
          <div className="space-y-4">
            <p>{selection.item.description}</p>
            {selection.kind === "cost" && selection.item.need && (
              <p className="text-xs text-slate-500">
                Monatlicher Bedarf: {formatCurrency(selection.item.need, selection.item.currency)}
              </p>
            )}
            {selection.kind === "task" && selection.item.schedule && (
              <p className="text-xs text-slate-500">
                Zeitfenster: {selection.item.schedule.label}
              </p>
            )}

            {"meta" in selection.item && selection.item.meta && (
              <dl className="space-y-2">
                {Object.entries(selection.item.meta).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 text-xs">
                    <dt className="font-medium text-slate-600">{key}</dt>
                    <dd className="text-right text-slate-700">{value ?? "–"}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-700">Live-Ticker</div>
              <p className="mt-1 text-xs text-slate-500">
                Kein Live-Ticker verbunden
              </p>
              <button
                type="button"
                className="mt-3 rounded-md border border-primary/40 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10"
              >
                Quelle hinzufügen
              </button>
            </div>
          </div>
        )}

        {selection && activeTab === "documents" && (
          <div className="space-y-3">
            {selection.kind === "cost" && selection.item.document ? (
              documentStatus === "available" ? (
                <iframe
                  title="Dokumentenansicht"
                  src={selection.item.document}
                  className="h-64 w-full rounded border border-slate-200"
                />
              ) : documentStatus === "loading" ? (
                <p>Dokument wird geladen …</p>
              ) : (
                <p className="text-slate-500">
                  Demo-Datei (noch) nicht vorhanden. Bitte später erneut versuchen.
                </p>
              )
            ) : (
              <p>Keine Dokumente hinterlegt.</p>
            )}
          </div>
        )}

        {selection && activeTab === "discussion" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Beiträge erscheinen öffentlich, nachdem ein LLM-gestützter Filter sie freigegeben hat.
            </p>
            <div className="space-y-3">
              {relevantEntries(selection, discussionEntries, submittedPreview).map((entry) => (
                <DiscussionPost key={entry.id} entry={entry} />
              ))}
              {discussionEntries.length === 0 && (
                <p className="text-slate-500">Noch keine Beiträge vorhanden.</p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="discussion-type" className="block text-xs font-medium text-slate-600">
                  Beitragstyp
                </label>
                <select
                  id="discussion-type"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={pendingType}
                  onChange={(event) => setPendingType(event.target.value as DiscussionType)}
                >
                  {Object.entries(DISCUSSION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="discussion-content" className="block text-xs font-medium text-slate-600">
                  Dein Beitrag
                </label>
                <textarea
                  id="discussion-content"
                  required
                  rows={4}
                  placeholder="Beschreibe deinen Gedanken …"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                  value={pendingContent}
                  onChange={(event) => setPendingContent(event.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-light"
              >
                Beitrag als Vorschau anzeigen
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function relevantEntries(
  selection: Selection | null,
  entries: DiscussionEntry[],
  preview: DiscussionEntry | null
): DiscussionEntry[] {
  const filtered = selection
    ? entries.filter((entry) => (entry.itemId ? entry.itemId === selection.item.id : true))
    : entries;
  const combined = preview ? [...filtered, preview] : filtered;
  return combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function DiscussionPost({ entry }: { entry: DiscussionEntry }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-primary">{DISCUSSION_LABELS[entry.type]}</span>
        <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
      </div>
      <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{entry.content}</p>
      <div className="mt-3 text-xs text-slate-500">— {entry.author}</div>
    </article>
  );
}
