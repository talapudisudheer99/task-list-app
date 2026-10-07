export const TASK_VALIDATION_ERRORS = {
  titleRequired: "Title is required.",
  titleMaxLength: "Title must be at most 200 characters.",
  priorityRequired: "Priority is required.",
  priorityRange: "Priority must be a whole number from 1 to 5.",
  dueDateInvalid: "Due date must be a valid date.",
  dueDateFormat: "Due date must be a valid YYYY-MM-DD date.",
  statusInvalid: "Status is invalid.",
} as const;
