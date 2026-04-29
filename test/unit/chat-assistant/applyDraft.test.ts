import { describe, expect, it } from "vitest"
import type { ResumeImportData } from "@/entities/resume/types"
import { applyAiDraftChanges } from "@/features/chat-assistant/lib/applyDraft"
import type { ProposedChange } from "@/features/chat-assistant/types"

const createResumeFixture = (): ResumeImportData => ({
  activePage: "data",
  personalDetails: {
    fullName: "Ada Lovelace",
    jobTitle: "Engineer",
    defaultAddress: "London",
    defaultEmail: "ada@example.com",
    defaultPhoneNumber: "123",
    socialGithub: "ada",
    socialLinkedin: "ada-linkedin",
    summary: "Original summary",
    profilePicture: "",
    knownLanguages: ["English"],
  },
  education: [
    {
      id: "education-1",
      schoolName: "Analytical Academy",
      courseDegree: "Mathematics",
      startYear: "1830",
      endYear: "1832",
      currentEnrolled: false,
    },
  ],
  references: [
    {
      id: "reference-1",
      fullName: "Charles Babbage",
      jobTitle: "Mentor",
      companyName: "Difference Engine",
      defaultPhoneNumber: "555-123",
      defaultEmail: "charles@example.com",
    },
  ],
  softSkills: ["Communication"],
  coreSkills: [
    {
      id: "core-1",
      devLanguage: "TypeScript",
      devFramework: ["React"],
    },
  ],
  workExperiences: [
    {
      id: "work-1",
      companyName: "Engine Co",
      jobTitle: "Developer",
      briefSummary: "Built things",
      startYear: "2020",
      endYear: "2022",
      currentlyHired: false,
      bulletType: true,
      bulletSummary: ["Did work"],
    },
  ],
  personalProjects: [],
  certificates: [],
  achievements: [],
  configuration: {
    template: "whitepaper",
    fontStyle: "Lora",
    fontSize: 12,
    pageSize: "A4",
    pollinationsApiKey: "",
  },
  enableInRender: {
    summary: false,
    workExperiences: true,
    personalProjects: false,
    certificates: false,
    education: true,
    coreSkills: true,
    references: true,
    softSkills: true,
    achievements: false,
    language: false,
  },
  template: {
    whitepaper: {
      blockSpace: 12,
      enablePicture: false,
      pictureSize: 100,
      bulletText: false,
      inlineInformation: true,
      sectionOrder: [],
    },
    classic: {
      blockSpace: 12,
      enablePicture: false,
      pictureSize: 100,
      bulletText: false,
      inlineInformation: true,
      sectionOrder: [],
    },
    modern: {
      blockSpace: 12,
      enablePicture: false,
      pictureSize: 88,
      bulletText: false,
      accentColor: "#000000",
      sidebarSections: [],
      mainSections: [],
    },
    "modern-alt": {
      blockSpace: 12,
      enablePicture: false,
      pictureSize: 92,
      bulletText: false,
      bannerColor: "#000000",
      sectionOrder: [],
    },
  },
})

describe("applyAiDraftChanges", () => {
  it("replaces the summary and language list", () => {
    const result = applyAiDraftChanges(createResumeFixture(), [
      {
        type: "replace_field",
        section: "personalDetails",
        field: "summary",
        value: "Updated summary",
      },
      {
        type: "replace_list",
        section: "personalDetails.knownLanguages",
        value: ["English", "French"],
      },
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.personalDetails.summary).toBe("Updated summary")
    expect(result.data.personalDetails.knownLanguages).toEqual(["English", "French"])
  })

  it("appends a core skill and generates an id when missing", () => {
    const result = applyAiDraftChanges(createResumeFixture(), [
      {
        type: "append_item",
        section: "coreSkills",
        value: {
          devLanguage: "Python",
          devFramework: ["FastAPI"],
        },
      },
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.coreSkills).toHaveLength(2)
    expect(result.data.coreSkills[1]?.id).toBeTruthy()
    expect(result.data.coreSkills[1]).toMatchObject({
      devLanguage: "Python",
      devFramework: ["FastAPI"],
    })
  })

  it("appends education and references with generated ids", () => {
    const changes: ProposedChange[] = [
      {
        type: "append_item",
        section: "education",
        value: {
          schoolName: "Byte School",
          courseDegree: "Computer Science",
          startYear: "2024",
          endYear: "2026",
          currentEnrolled: true,
        },
      },
      {
        type: "append_item",
        section: "references",
        value: {
          fullName: "Grace Hopper",
          jobTitle: "Admiral",
          companyName: "US Navy",
          defaultPhoneNumber: "555-456",
          defaultEmail: "grace@example.com",
        },
      },
    ]

    const result = applyAiDraftChanges(createResumeFixture(), changes)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.education[1]?.id).toBeTruthy()
    expect(result.data.references[1]?.id).toBeTruthy()
  })

  it("updates and deletes item-based sections by id", () => {
    const result = applyAiDraftChanges(createResumeFixture(), [
      {
        type: "update_item",
        section: "workExperiences",
        itemId: "work-1",
        value: {
          briefSummary: "Led delivery",
        },
      },
      {
        type: "delete_item",
        section: "references",
        itemId: "reference-1",
      },
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.workExperiences[0]?.briefSummary).toBe("Led delivery")
    expect(result.data.references).toHaveLength(0)
  })

  it("applies show_section changes for languages visibility", () => {
    const result = applyAiDraftChanges(createResumeFixture(), [
      {
        type: "replace_list",
        section: "personalDetails.knownLanguages",
        value: ["English", "French"],
      },
      {
        type: "show_section",
        section: "language",
        value: true,
        required: true,
      },
    ])

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.enableInRender.language).toBe(true)
    expect(result.data.personalDetails.knownLanguages).toEqual(["English", "French"])
  })

  it("fails safely when an item id is stale", () => {
    const original = createResumeFixture()
    const result = applyAiDraftChanges(original, [
      {
        type: "update_item",
        section: "workExperiences",
        itemId: "missing-id",
        value: {
          briefSummary: "Should not apply",
        },
      },
    ])

    expect(result.ok).toBe(false)
    expect(original.workExperiences[0]?.briefSummary).toBe("Built things")
  })
})
