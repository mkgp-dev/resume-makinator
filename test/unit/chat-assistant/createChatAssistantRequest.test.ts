import { describe, expect, it } from "vitest"
import type { ResumeImportData } from "@/entities/resume/types"
import { createChatAssistantRequest } from "@/features/chat-assistant/lib/createChatAssistantRequest"
import type { ChatMessageRecord } from "@/features/chat-assistant/types"

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
    summary: "Builds reliable frontend systems.",
    profilePicture: "avatar.png",
    knownLanguages: ["English", "French"],
  },
  education: [],
  references: [],
  softSkills: ["Communication"],
  coreSkills: [
    {
      id: "core-1",
      devLanguage: "TypeScript",
      devFramework: ["React"],
    },
  ],
  workExperiences: [],
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
    summary: true,
    workExperiences: false,
    personalProjects: false,
    certificates: false,
    education: false,
    coreSkills: true,
    references: false,
    softSkills: true,
    achievements: false,
    language: true,
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

const createMessages = (): ChatMessageRecord[] =>
  Array.from({ length: 10 }, (_, index) => ({
    id: `message-${index + 1}`,
    role: index % 2 === 0 ? "user" : "assistant",
    content:
      index === 8
        ? "x".repeat(1400)
        : `Earlier message ${index + 1}`,
  }))

describe("createChatAssistantRequest", () => {
  it("builds a chat-mode request without a plan target and without legacy fields", () => {
    const request = createChatAssistantRequest({
      message: "Review my resume.",
      messages: createMessages(),
      mode: "chat",
      model: "gemini",
      resumeData: createResumeFixture(),
    })

    expect(request).toMatchObject({
      service: "resume",
      mode: "chat",
      model: "gemini",
      message: "Review my resume.",
    })
    expect(request.target).toBeUndefined()
    expect("conversation" in request).toBe(false)
    expect("pendingAction" in request).toBe(false)
    expect("userDecision" in request).toBe(false)
    expect(request.recentMessages).toHaveLength(8)
    expect(request.recentMessages?.[0]?.content).toBe("Earlier message 3")
    expect(request.recentMessages?.[6]?.content).toHaveLength(1200)
    expect(request.recentMessages?.some((message) => message.content === "Review my resume.")).toBe(false)
  })

  it("builds a plan-mode request with a target and reduced resume data", () => {
    const resumeData = createResumeFixture()
    ;(resumeData.coreSkills[0] as Record<string, unknown>).devicon = "typescript"

    const request = createChatAssistantRequest({
      message: "Improve my languages section.",
      messages: [],
      mode: "plan",
      model: "nova",
      selectedPlanSection: "languages",
      resumeData,
    })

    expect(request).toMatchObject({
      service: "resume",
      mode: "plan",
      model: "nova",
      target: {
        section: "languages",
      },
    })
    expect(request.resumeData?.personalDetails).toEqual({
      summary: "Builds reliable frontend systems.",
      knownLanguages: ["English", "French"],
    })
    expect(request.resumeData?.enableInRender?.language).toBe(true)
    expect(request.resumeData?.coreSkills).toEqual([
      {
        id: "core-1",
        devLanguage: "TypeScript",
        devFramework: ["React"],
      },
    ])
    expect((request.resumeData?.coreSkills?.[0] as Record<string, unknown> | undefined)?.devicon).toBeUndefined()
    expect(request.resumeData?.softSkills).toEqual(["Communication"])
    expect("fullName" in (request.resumeData?.personalDetails ?? {})).toBe(false)
    expect("configuration" in (request.resumeData ?? {})).toBe(false)
    expect("template" in (request.resumeData ?? {})).toBe(false)
  })
})
