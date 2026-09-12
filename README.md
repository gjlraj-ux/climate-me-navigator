# Climate M&E Navigator

The Climate M&E Navigator is a decision-support prototype for designing monitoring, evaluation, and learning systems for climate action. It begins with the decision and the country system, tests basic feasibility, and assembles a starting bundle of complementary system components from 44 public tools and methods.

The site is a single, dependency-free HTML file that can be hosted on GitHub Pages or saved for offline use.

## What changed in v1.0

- shorter entry with a primary decision first, optional context checklist, and three illustrative climate examples;
- task-based capacity and evidence questions, plus a distinct unscored “not sure yet” approach;
- explicit checks still needed, with numerical fit confined to the detailed explanation;
- a compact plan overview and comparison of eligible alternatives within each component;
- user-selected tools and locally specified processes, retaining an invalidated choice for explicit review after answers change;
- an editable implementation worksheet with owners, tasks, evidence, people, dates and unresolved questions;
- named projects, duplication, JSON export/import, and migration of existing v0.8/v0.9 answers;
- native radio buttons and checkboxes, focus restoration, contextual lessons with a return action, larger controls and responsive comparison layouts;
- a relevance check for the two water-specific evidence sources, documented in the matching methodology.

## Earlier changes in v0.9

- reframed the journey around stakeholder perspective and the decision the system must support;
- added national and local grounding prompts for plans, budgets, statistics, local priorities, prior evaluations, and data-governance rules;
- separated the scale where evidence is generated from the scale where decisions or reporting happen;
- replaced a flat tool ranking with six functional system components;
- introduced explicit feasibility blockers for scope, scale, capacity, and data readiness;
- added visible fit reasoning, implementation first steps, catalogue snapshot dates, and a 90-day start;
- improved keyboard, modal, tab, selection-state, and colour-contrast accessibility;
- documented the matching method and added automated structural and scenario checks.

## Use it

Open `index.html` in a browser or visit the GitHub Pages deployment. No account, server, build step, analytics, or data upload is required. Answers are stored only in the current browser unless the user intentionally copies, prints, downloads, or emails them.

## Develop and validate

Requirements: Node.js 18 or newer.

```bash
npm test
```

The checks cover the tool catalogue, taxonomy coverage, HTTPS source links, accessible interaction markers, stakeholder scenarios, state migration, local choices, stale choices, project persistence, uncertainty labels and exports. They do not substitute for visual, mobile or assistive-technology review. See [validation/USABILITY_REVIEW.md](validation/USABILITY_REVIEW.md) for this release's checks and remaining review.

## Projects and exports

Use the project selector to switch between locally saved projects. **New project** keeps the current one; **Duplicate** makes an independent scenario. Change the project name in Step 1. **Export project** creates a JSON file that **Import project** opens as a separate project on this or another browser.

The implementation worksheet exports as CSV, while **Copy plan** and **Print / save as PDF** include the choices and implementation notes. **Save for offline use** downloads the entire Navigator with only the current project embedded. Later edits in that offline copy can be saved in its browser when storage is available. Browser storage may be cleared or unavailable; the interface reports saving failures, and explicit exports provide a portable copy.

Illustrative examples are teaching scenarios, not empirical case studies. Their assumptions can be inspected and changed, and opening an example creates a separate project.

## How recommendations work

The Navigator first excludes tools that fail answered feasibility safeguards, then ranks remaining tools by decision fit and optional preferences. It selects one eligible starting option for each functional component:

1. policy and reporting anchor;
2. system design method;
3. data and evidence source;
4. collection and participation method;
5. evaluation and learning method;
6. capacity and enabling support.

See [METHODOLOGY.md](METHODOLOGY.md) for the exact logic, limitations, and update protocol.

## Contribute

Tool additions, corrections, country examples, accessibility reports, and scenario tests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). The project does not currently declare an open-source licence; contributors should confirm reuse terms with the repository owner until one is added.

## Important limitation

This is a working-draft decision aid, not an endorsement, procurement recommendation, assurance product, or substitute for country-led design and stakeholder deliberation. Verify source material, cost, coverage, safeguards, institutional burden, data rights, and local applicability before adoption.
