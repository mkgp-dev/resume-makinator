import { getChatFieldLabel, getChatSectionLabel } from "@/features/chat-assistant/lib/fieldLabels"
import type { AiDraft, ProposedChange } from "@/features/chat-assistant/types"

export type DraftPreviewEntry = {
  label: string
  detail: string
}

export type DraftPreview = {
  entries: DraftPreviewEntry[]
}

const describeValue = (value: unknown): string => {
  if (typeof value === "string") return value
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) {
    return value.map((item) => describeValue(item)).join(", ")
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .filter(([key]) => key !== "id")
      .map(([key, itemValue]) => `${getChatFieldLabel(key)}: ${describeValue(itemValue)}`)
      .join(" | ")
  }

  return String(value)
}

const describeChange = (change: ProposedChange): DraftPreviewEntry => {
  switch (change.type) {
    case "replace_field":
      return {
        label: getChatSectionLabel(change.section),
        detail: `${getChatFieldLabel(change.field)} -> ${change.value}`,
      }
    case "replace_list":
      return {
        label: getChatSectionLabel(change.section),
        detail: describeValue(change.value),
      }
    case "append_item":
      return {
        label: `Add to ${getChatSectionLabel(change.section)}`,
        detail: describeValue(change.value),
      }
    case "update_item":
      return {
        label: `Update ${getChatSectionLabel(change.section)}`,
        detail: describeValue(change.value),
      }
    case "delete_item":
      return {
        label: `Remove from ${getChatSectionLabel(change.section)}`,
        detail: `Item ID: ${change.itemId}`,
      }
    case "show_section":
      return {
        label: "Show section",
        detail: getChatSectionLabel(change.section),
      }
  }
}

export const formatDraftPreview = (draft: AiDraft): DraftPreview => ({
  entries: draft.proposedChanges.map(describeChange),
})
