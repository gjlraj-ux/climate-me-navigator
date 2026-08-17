# Contributing

Contributions that improve accuracy, inclusion, usability, accessibility, or transparency are welcome.

## Before proposing a new tool

Check whether the need is better met by a national or local process already prompted in Stage 0. The catalogue should not turn every system need into an external-tool recommendation.

For a catalogue addition, include:

- official name, provider, and primary public HTTPS source;
- what the tool does in plain language;
- evidence of current availability and the date checked;
- cost or access conditions, avoiding “free” where implementation still has material service or capacity costs;
- supported purposes, thematic scopes, scales, capacity tiers, approaches, data-readiness tiers, and time horizons;
- proposed functional component and why;
- at least one real use example with a verifiable source where possible;
- known prerequisites, exclusions, safeguarding or data-governance concerns;
- which stakeholder scenario changes and why.

## Changes to matching logic

Explain the decision problem, not only the code change. Update `METHODOLOGY.md`, add or revise scenarios in `validation/scenarios.json`, and run:

```bash
npm test
```

Avoid increasing a tool's score merely because it has more tags. A change that makes more items eligible should state the institutional or practical reason.

## Accessibility and content

- Use native controls and expose selected, expanded, modal, and tab state to assistive technology.
- Do not rely on colour or hover alone.
- Keep body text at readable contrast against the paper backgrounds.
- Describe uncertainty and limitations beside the recommendation, not only in documentation.
- Distinguish comparison over time from causal attribution.
- Treat budget percentages as context-dependent heuristics, not universal rules.

## Pull requests

Keep changes focused. In the description, include:

1. the stakeholder or decision need;
2. the conceptual change;
3. affected metadata or matching behaviour;
4. checks run;
5. unresolved judgement calls;
6. screenshots or keyboard-flow notes for interface changes.

The repository does not currently declare a licence. Do not import content whose reuse terms are unclear.

