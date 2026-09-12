# Matching methodology

Version 1.0 · catalogue metadata snapshot: August 2026 (unchanged)

## Purpose

The Navigator helps a user form a discussable starting architecture for a climate monitoring, evaluation, and learning system. It does not determine the best system, independently assess tool effectiveness, or replace political, institutional, technical, community, or rights-holder deliberation.

The design follows four principles:

1. start with a decision, not a tool;
2. start with national and local systems before external frameworks;
3. distinguish complementary system roles rather than treating every tool as a substitute;
4. make exclusions, fit logic, evidence dates, and uncertainty visible.

## Inputs

Required inputs are the primary decision, thematic scope, evidence-generation scale, decision/reporting scale, and current capacity. Stakeholder perspective, secondary decisions, phase, preferred approach, data readiness, time to first useful result, and theory-of-change readiness add context.

Project name, the actual decision, location, sector/hazard, existing institutions, available evidence and resources are editable context notes. They are saved and exported with the plan but are not parsed to infer matches or alter scores. The optional water-relevance answer is a structured exception described below. Capacity and data labels describe resources available for the particular task at its relevant scale, without assuming national institutions or inferring capacity from a country grouping.

“A mix of methods” is an approach preference. “Not sure yet” leaves the approach criterion unanswered for scoring: it adds no point to the denominator and creates no approach mismatch warning.

Selecting multiple thematic scopes does not increase a score repeatedly. A tool receives the scope weight once if it overlaps at least one selected scope. This avoids rewarding broadly tagged tools merely because a user selects more topics.

## Functional components

Every catalogue item is assigned one primary role:

| Component | Question it answers |
|---|---|
| Policy and reporting anchor | What obligation, standard, or results structure must the system serve? |
| System design method | How will objectives, institutions, indicators, and review cycles form a coherent design? |
| Data and evidence source | What observations, statistics, geospatial evidence, or risk information can be used? |
| Collection and participation method | How will evidence be generated with implementers and affected people? |
| Evaluation and learning method | How will the system examine outcomes, contribution, uncertainty, equity, and adaptation? |
| Capacity and enabling support | What finance, skills, institutions, or technical support make the system sustainable? |

The current assignment is editorial metadata in `COMPONENT_BY_ID`. It is contestable and should be reviewed when a tool changes or when practitioners provide better evidence.

## Eligibility safeguards

Answered safeguards are evaluated before ranking:

- **Thematic scope:** at least one selected scope must overlap the tool metadata.
- **Relevant scale:** anchor and enabling tools are tested against the decision/reporting scale; collection and evaluation tools against the evidence scale; design and data tools use the decision scale, falling back to the evidence scale. Exact scale is preferred; one adjacent level is allowed with a warning; other mismatches block eligibility.
- **Capacity:** the lowest capacity tier supported by the tool must not exceed the user's current tier. Capacity-enabling tools are exempt because their purpose may be to close that gap.
- **Data readiness:** the lowest data tier supported by the tool must not exceed the user's current tier.
- **Water relevance:** Aqueduct and AQUASTAT are excluded when the user explicitly says water availability, flooding or drought is not relevant. When this question is unanswered or uncertain, they remain subject to the other safeguards and receive a visible relevance warning. “Yes” removes that warning, but does not award points or confirm geographic/hazard coverage. This narrow check follows the existing catalogue descriptions and is not a comprehensive hazard or sector taxonomy.

An unanswered safeguard neither blocks nor confirms feasibility. Results are therefore labelled provisional until all required questions are complete.

## Fit score

Eligible and ineligible tools both receive the same transparent score so the reasoning can be inspected. Weights are:

| Criterion | Points |
|---|---:|
| Matches primary decision | 4 |
| Matches any secondary decision | 1 |
| Overlaps thematic scope | 3 |
| Exact relevant scale | 2 |
| Adjacent relevant scale | 1 |
| Feasible for current capacity | 2 |
| Compatible evidence approach | 1 |
| Feasible for current data readiness | 1 |
| Useful within time horizon | 1 |
| Supports an available or developing theory of change | 1 |
| Fits the current phase | 1 |

The percentage inside **Why this fit** is `points earned / maximum points available for answered questions`. It is relative fit, not a probability, confidence interval, evidence-quality rating, or claim of effectiveness. It no longer appears as the leading card label. A “Still to check” notice names unanswered data and time questions, and always retains local applicability, costs and ownership for human review.

Labels are deliberately conservative:

- **Matches your stated needs:** eligible, primary-decision match, at least 75%, and no warnings. This refers only to the stated criteria, not to unchecked conditions.
- **Potential fit — review checks:** eligible and at least 55%.
- **Supporting option:** eligible below 55% or not a primary-decision match.
- **Not suitable now:** at least one feasibility blocker.

## Bundle construction

Tools are sorted by eligibility, primary-decision match, percentage, and name. The bundle then takes the first eligible tool in each component, preferring a primary-decision match. This is a transparent greedy selection, not an optimisation of interactions between tools.

A blank component is intentional: it means no catalogue item passed all answered safeguards. The role should remain visible and may be filled by an existing country process rather than by another external tool.

## User choices and implementation

Users can compare eligible alternatives within one component and explicitly select an option. They can instead name an existing local process and record why it fits and what needs checking. Locally specified processes receive no automated fit score or feasibility endorsement.

When answers change, an explicitly chosen tool that becomes ineligible is retained with its blockers and labelled as a previous choice needing review. It is not silently replaced or presented as an eligible recommendation. The user can choose an eligible alternative, name a local process, or return to the default suggestion. Automatically suggested components update with the current answers.

The worksheet records an owner, first task, existing evidence, people to involve, deadline and unresolved question for each component. First tasks are generic prompts for that component, not tool-specific implementation instructions. Editing or replacing a component retains worksheet notes and asks the user to review them. Local choices, missing answers, invalidated choices, sources and open checks are carried into the plan exports.

Named projects are stored locally, with independent duplication and JSON export/import. Imported state is validated against known choices and bounded text fields; it is not executed. Existing v0.8 and v0.9 answers are migrated when no v1.0 projects exist. An embedded offline snapshot opens as its own project and subsequently saved edits take precedence for that snapshot.

## Evidence and maintenance

Each item records a public source URL and an editorial metadata set. The snapshot date records the catalogue state shipped with this release; it does not mean that every claim or link was independently verified during that month, or that the tool was evaluated for effectiveness.

For a material update:

1. inspect the primary source and record the review date;
2. verify current ownership, availability, cost claim, geographic coverage, prerequisites, and licence where available;
3. update tags conservatively and explain ambiguous judgements in the pull request;
4. add or update at least one validation scenario when ranking behaviour changes;
5. seek review from at least one likely user outside the contributor's own stakeholder group.

## Known limitations and risks

- The catalogue is selective, globally oriented, and likely to underrepresent national, local, Indigenous, non-English, private-sector, and practitioner-developed systems.
- A single primary component cannot express every legitimate use of a multi-purpose tool.
- Tool metadata compresses institutional complexity and may become stale.
- The logic cannot assess political mandate, trust, accessibility, data sovereignty, consent, privacy, security, procurement restrictions, or distributional harm.
- Adjacent-scale matching does not solve aggregation or localisation; it merely keeps an option visible with a warning.
- A high fit can still be the wrong choice if it duplicates an existing process or imposes unsustainable reporting burden.

Use the output as a workshop hypothesis. Confirm it with decision users, data producers, affected communities, rights holders, statistics and digital teams, programme staff, finance and oversight actors, and independent evaluators as relevant.
