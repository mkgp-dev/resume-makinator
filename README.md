<div align="center">
  <a href="https://github.com/mkgp-dev/resume-makinator">
    <img src="public/logo.png" alt="Logo" width="150" height="90">
  </a>

<h3 align="center">resume-makinator</h3>

  <p align="center">
    A modern, browser-based tool that helps anyone create a polished resume.
    <br />
    <a href="#">Visit the site</a>
    &middot;
    <a href="https://github.com/mkgp-dev/resume-makinator/issues/new?template=bug_report.md">Report a bug</a>
    &middot;
    <a href="https://github.com/mkgp-dev/resume-makinator/issues/new?template=template_request.md">Request a template</a>
  </p>
</div>



## About the Project

Resume Makinator started from a simple problem: a friend didn’t want to use Word to create a resume because of all the formatting, spacing, and layout work. To make the process simpler and more efficient, I built this project so that all they have to do is fill in structured fields and adjust a few options, instead of manually designing a document from scratch.

Right now, this project uses a single, opinionated template focused on clarity and readability. The goal is to expand this over time with more templates based on research into resume designs that are widely accepted and appropriate for different roles and industries.

By making this tool public, I want to help anyone who struggles with creating a resume. No complicated editors, no layout headaches! just open it in the br owser, fill in the blanks, toggle the sections you need, quickly fix the order of entries, and you’re ready to export.



### Features

> [!NOTE]
> The current template (Whitepaper) always ends with the **References** section.

- Work in a structured, section-based editor instead of a blank document.
- Control which sections appear by enabling or disabling them for the final preview.
- Reorder entries inside a section using drag-and-drop to quickly fix the order.
- Keep everything client-side, with data stored only in the browser.
- Export and re-import your data as JSON to back it up or move between devices.
- Preview your resume in a PDF-style viewer while you edit.



### Built With

- **React + Vite** for the single-page application, component-based UI, and fast dev/build pipeline.
- **TailwindCSS & DaisyUI** for utility-first styling and prebuilt UI components.
- **Zustand** for lightweight global state management of resume data and configuration.
- **localForage** for persistent local storage using IndexedDB under the hood.
- **react-pdf** for generating the PDF-like resume preview and export.
- **dnd kit** for drag-and-drop reordering of entries inside sections.
- **react-select** for enhanced select inputs.
- **use-debounce** for smoothing out updates during rapid typing.
- **nanoid** for generating stable IDs for dynamic list items.



## Contributing

Contributions are welcome as long as they respect the license.

If you want to:

- **Report a bug** then open an issue with a clear description and steps to reproduce.
- **Request a template** then open an issue with examples or links to the style you have in mind.
- **Suggest an improvement** then open an issue or a discussion explaining what you’d like to see.
- **Submit a fix or feature** then fork the repository, create a branch, and open a pull request.



## License

This is a source-available project. You can use it and modify it for personal, non-commercial purposes, but you may not redistribute it or claim it as your own. See the [LICENSE](./LICENSE) file for full details.