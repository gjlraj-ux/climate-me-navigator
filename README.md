# Climate M&E Navigator

The Climate M&E Navigator is a decision-support prototype for designing monitoring, evaluation, and learning systems for climate action. It begins with the decision and the country system, tests basic feasibility, and assembles a starting bundle of complementary system components from 44 public tools and methods.

The site is a single, dependency-free HTML file that can be hosted on GitHub Pages or saved for offline use.

## What changed in v0.9

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

The validator checks the tool catalogue, taxonomy coverage, HTTPS source links, accessible interaction markers, removal of legacy ranking logic, and a set of stakeholder scenarios.

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
