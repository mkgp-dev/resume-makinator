import type { ActivePage, PageId } from "@/app/navigation"

export const SITE_TITLE = "Resume Makinator | Free Online Resume Builder"

const PAGE_TITLES: Record<PageId, string> = {
  about: "About You | Resume Makinator",
  information: "Information | Resume Makinator",
  education: "Education | Resume Makinator",
  skill: "Skills | Resume Makinator",
  work: "Work Experience | Resume Makinator",
  project: "Projects | Resume Makinator",
  certificate: "Certificates | Resume Makinator",
  achievement: "Achievements | Resume Makinator",
  reference: "References | Resume Makinator",
  config: "Configuration | Resume Makinator",
  data: "Data | Resume Makinator",
}

export const getDocumentTitle = (page: ActivePage) => {
  if (!page) return SITE_TITLE
  return PAGE_TITLES[page]
}
