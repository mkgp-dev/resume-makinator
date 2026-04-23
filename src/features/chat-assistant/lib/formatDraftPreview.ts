import type { AiDraft, AiDraftChange } from "@/features/chat-assistant/types"
import { getChatFieldLabelForSection, getChatSectionLabel } from "@/features/chat-assistant/lib/fieldLabels"
import { parseDraftStringList } from "@/features/chat-assistant/lib/stringListDraft"
import { parseDraftJsonObject } from "@/features/chat-assistant/lib/structuredDraftJson"

export type DraftPreviewMetadata = string[]

export type DraftPreviewEntry =
  | {
      kind: "text"
      text: string
      metadata: DraftPreviewMetadata | null
    }
  | {
      kind: "bullets"
      items: string[]
      metadata: DraftPreviewMetadata | null
    }
  | {
      kind: "coreSkills"
      groupName: string
      skills: string[]
      metadata: DraftPreviewMetadata | null
      isNewGroup: boolean
    }
  | {
      kind: "fields"
      rows: Array<{
        label: string
        value: string
      }>
      metadata: DraftPreviewMetadata | null
    }

export type DraftPreview = {
  entries: DraftPreviewEntry[]
}

type DraftChangeItemLabelResolver = (change: AiDraftChange) => string | null

const EXCLUDED_STRUCTURED_PREVIEW_FIELDS = new Set([
  "id",
  "profilePicture",
  "configuration",
  "enableInRender",
  "template",
])

const isCoreSkillsCreateChange = (change: AiDraftChange) =>
  change.section === "coreSkills" &&
  !change.itemId &&
  !change.field &&
  Boolean(change.proposedText?.trim())

const isCoreSkillsUpdateChange = (change: AiDraftChange) =>
  change.section === "coreSkills" &&
  Boolean(change.itemId) &&
  change.field === "devFramework" &&
  Boolean(change.proposedText?.trim())

const cleanFallbackText = (value: string) =>
  value
    .trim()
    .replace(/^\[\s*/, "")
    .replace(/\s*\]$/, "")
    .replace(/^"+|"+$/g, "")
    .replace(/\\"/g, "\"")
    .trim()

const looksLikeStructuredObjectText = (value: string) => {
  const normalized = value.trim()

  return (
    normalized.startsWith("{") ||
    normalized.startsWith("\"{") ||
    normalized.startsWith("\\\"{")
  )
}

const parseCoreSkillsDraftPreview = (value: string) => {
  const parsed = parseDraftJsonObject(value)
  if (!parsed) return null

  const groupName = typeof parsed.devLanguage === "string" ? parsed.devLanguage.trim() : ""
  const skills = Array.isArray(parsed.devFramework)
    ? parsed.devFramework
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : []

  if (!groupName || skills.length === 0) {
    return null
  }

  return {
    groupName,
    skills,
  }
}

const formatStructuredPreviewValue = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim() || "Not set yet"
  }

  if (value === null) {
    return "Not set yet"
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No"
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "None yet"

    const items = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)

    if (items.length !== value.length) return null
    return items.length ? items.join(", ") : "None yet"
  }

  return null
}

const formatStructuredFieldsPreview = (value: string, section: string) => {
  const parsed = parseDraftJsonObject(value)
  if (!parsed) return null

  const rows = Object.entries(parsed)
    .filter(([field]) => !EXCLUDED_STRUCTURED_PREVIEW_FIELDS.has(field))
    .map(([field, fieldValue]) => {
      const previewValue = formatStructuredPreviewValue(fieldValue)
      if (!previewValue) return null

      return {
        label: getChatFieldLabelForSection(field, section),
        value: previewValue,
      }
    })
    .filter((row): row is { label: string; value: string } => Boolean(row))

  return rows.length ? rows : null
}

const formatMetadata = (change: AiDraftChange, itemLabel?: string | null) => {
  const parts = [getChatSectionLabel(change.section)]
  if (itemLabel?.trim()) parts.push(itemLabel.trim())
  if (change.field?.trim()) parts.push(getChatFieldLabelForSection(change.field, change.section))

  return parts.length ? parts : null
}

const formatDraftPreviewEntry = (
  change: AiDraftChange,
  draftItemLabel?: string | null,
  resolveItemLabel?: DraftChangeItemLabelResolver,
): DraftPreviewEntry | null => {
  const itemLabel = resolveItemLabel?.(change) ?? draftItemLabel
  const metadata = formatMetadata(change, itemLabel)

  if (!change.proposedText?.trim()) {
    return null
  }

  const proposedText = change.proposedText.trim()

  if (isCoreSkillsCreateChange(change)) {
    const coreSkillsPreview = parseCoreSkillsDraftPreview(proposedText)

    if (coreSkillsPreview) {
      return {
        kind: "coreSkills",
        groupName: coreSkillsPreview.groupName,
        skills: coreSkillsPreview.skills,
        metadata,
        isNewGroup: true,
      }
    }
  }

  if (isCoreSkillsUpdateChange(change)) {
    const parsedSkills = parseDraftStringList(proposedText)
    if (parsedSkills.ok) {
      return {
        kind: "coreSkills",
        groupName: itemLabel?.trim() || "Core skill group",
        skills: parsedSkills.items,
        metadata,
        isNewGroup: false,
      }
    }
  }

  if (change.field === "bulletSummary") {
    const bulletItems = parseDraftStringList(proposedText)

    if (bulletItems.ok) {
      return {
        kind: "bullets",
        items: [bulletItems.items[bulletItems.items.length - 1]],
        metadata,
      }
    }

    return {
      kind: "text",
      text: cleanFallbackText(proposedText),
      metadata,
    }
  }

  if (change.section === "softSkills" || change.field === "knownLanguages") {
    const listItems = parseDraftStringList(proposedText)

    if (listItems.ok) {
      return {
        kind: "fields",
        rows: [
          {
            label: "Items",
            value: listItems.items.join(", "),
          },
        ],
        metadata,
      }
    }

    return {
      kind: "text",
      text: cleanFallbackText(proposedText),
      metadata,
    }
  }

  const structuredRows = formatStructuredFieldsPreview(proposedText, change.section)
  if (structuredRows) {
    return {
      kind: "fields",
      rows: structuredRows,
      metadata,
    }
  }

  if (looksLikeStructuredObjectText(proposedText)) {
    return null
  }

  return {
    kind: "text",
    text: cleanFallbackText(proposedText),
    metadata,
  }
}

export const formatDraftPreview = (
  draft: AiDraft,
  draftItemLabel?: string | null,
  resolveItemLabel?: DraftChangeItemLabelResolver,
): DraftPreview | null => {
  const entries = draft.proposedChanges
    .map((change) => formatDraftPreviewEntry(change, draftItemLabel, resolveItemLabel))
    .filter((entry): entry is DraftPreviewEntry => Boolean(entry))

  return entries.length ? { entries } : null
}
