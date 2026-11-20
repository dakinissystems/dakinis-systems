export type Role = "OWNER" | "TRAINER" | "CLIENT" | "STAFF";

export type TrackingFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export type FeedbackType =
  | "ROUTINE_CHANGE"
  | "PAIN"
  | "DIFFICULTY"
  | "OBJECTIVE_CHANGE"
  | "BODY_UPDATE";

export type FeedbackStatus = "OPEN" | "REVIEWING" | "CLOSED";

export type ClientRoutineStatus = "ACTIVE" | "PAUSED" | "FINISHED";
