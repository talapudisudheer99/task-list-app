import type { TaskStatus } from "@/lib/types/tasks";

export const TASKS_PAGE = {
  title: "My tasks",
  subtitle: "Stay organized and get things done.",
} as const;

export const TASKS_TOOLBAR = {
  searchPlaceholder: "Search tasks…",
  statusLabel: "Status",
  priorityLabel: "Priority",
  filterAll: "All",
  importCsv: "Import CSV",
  newTask: "New task",
} as const;

export const TASKS_TABLE = {
  title: "Title",
  dueDate: "Due date",
  priority: "Priority",
  status: "Status",
  actions: "Actions",
  noDueDate: "—",
} as const;

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const TASKS_EMPTY = {
  noTasksTitle: "No tasks yet",
  noTasksDescription: "Create your first task to get started.",
  noMatchesTitle: "No tasks match your filters",
  clearFilters: "Clear filters",
  newTaskButton: "+ New task",
} as const;

export const TASKS_ERROR = {
  loadFailed: "Failed to load tasks",
  tryAgain: "Try again",
} as const;

export const TASK_FORM = {
  newTitle: "New task",
  editTitle: "Edit task",
  titleLabel: "Title *",
  notesLabel: "Notes",
  dueDateLabel: "Due date",
  priorityLabel: "Priority",
  statusLabel: "Status",
  cancel: "Cancel",
  create: "Create task",
  save: "Save",
  saving: "Saving…",
} as const;

export const DELETE_TASK = {
  title: "Delete this task?",
  description:
    "This removes the task from your list. You can't undo this from the app.",
  cancel: "Cancel",
  confirm: "Delete",
  deleting: "Deleting…",
} as const;

export const TASK_TOASTS = {
  created: "Task created",
  updated: "Task updated",
  deleted: "Task deleted",
  completed: "Task completed",
  markedTodo: "Task marked as to do",
} as const;

export const TASK_ACTION_ERRORS = {
  fixFields: "Please fix the highlighted fields.",
  duplicate:
    "A task with this title and due date already exists.",
  notFound: "Task not found.",
} as const;
