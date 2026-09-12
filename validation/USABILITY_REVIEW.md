# v1.0 usability implementation review

## Scope

This change implements the usability review of the published v0.9 Navigator. It preserves the 44-item catalogue, six system components and single-file offline format. It adds a shorter start, task-based questions, project context, inspectable illustrative examples, editable component choices, an implementation worksheet and named projects.

## Checks completed

- `npm test`: catalogue and taxonomy validation, the existing stakeholder cases, new water-relevance cases, and 13 project/export regression checks.
- Browserless DOM integration: complete a fresh journey, update context, select an alternative, name a local process, edit worksheet fields, export, duplicate independently, open an example, visit a contextual lesson and return, search the glossary and expand grounding references.
- DOM checks also verify unique IDs, label/control associations and referenced `aria-controls` targets. Focus-target restoration is checked in an emulated DOM; this is not a test of native browser keyboard behaviour.
- Migration checks cover legacy single-scale state, existing v0.9 saved answers, named-project reloads and offline snapshot reloads without resetting later edits.
- Export checks cover context, chosen tools and local processes, implementation notes, sources, missing answers, invalidated choices, text escaping and formula-safe CSV cells.
- The inline script parses without a build step or runtime dependencies.

## Review still needed before publishing

The review browser blocked local HTTP and file preview URLs under its URL policy. No browser-policy workaround was used. Consequently rendered visual review, browser-native keyboard checks, real mobile/zoom checks, printing and assistive-technology review remain pending.

Open `index.html` directly in a browser and check:

1. At desktop width and at 390px and 320px, complete the decision, scope and resource steps; confirm that text and controls remain readable without page-level horizontal scrolling.
2. Use only Tab, Shift+Tab, Space and arrow keys. Select radios and checkboxes, expand optional content, change a component, and return from a lesson. Focus should remain visible and continue from the selected question.
3. At 200% text zoom and 400% page zoom, check the navigation, comparison rows and worksheet. The stage strip may scroll horizontally; individual questions and comparison cells should reflow.
4. Enter a local process and multiline worksheet notes. Print the plan and confirm that all notes, sources and warnings appear. Close the print dialog and confirm the prior expanded/collapsed state returns.
5. Download a project JSON and an offline HTML copy. Open each in a fresh browser, edit it, refresh, and confirm the project is retained. A saving failure must display an actionable message.
6. Test the required choices, component review controls and dialogs with a screen reader.

## Practitioner check

Use a small, varied group of intended users. Ask each to produce a plan for a real decision, change one assumption, explain a recommendation and name a next action. Record where users hesitate, misunderstand fit or need assistance. The teaching examples are illustrative assumptions and should not be presented as field evidence.
