export type PageId =
  | "about"
  | "information"
  | "education"
  | "skill"
  | "work"
  | "project"
  | "certificate"
  | "achievement"
  | "reference"
  | "config"
  | "data"

export type ActivePage = PageId | ""

export const PAGE_IDS: PageId[] = [
  "about",
  "information",
  "education",
  "skill",
  "work",
  "project",
  "certificate",
  "achievement",
  "reference",
  "config",
  "data",
]

export const isActivePage = (value: string): value is ActivePage =>
  value === "" || PAGE_IDS.includes(value as PageId)
