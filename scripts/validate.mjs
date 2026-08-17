import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scenarios = JSON.parse(fs.readFileSync(path.join(root, "validation", "scenarios.json"), "utf8"));
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const scriptBlocks = [...source.matchAll(/<script(?:[^>]*)>([\s\S]*?)<\/script>/g)].map(match => match[1]);
check(scriptBlocks.length === 1, `expected one inline script, found ${scriptBlocks.length}`);
for (const [index, script] of scriptBlocks.entries()) {
  try { new vm.Script(script, { filename: `index-inline-${index + 1}.js` }); }
  catch (error) { failures.push(`inline script ${index + 1} does not parse: ${error.message}`); }
}

const dataStart = source.indexOf("const TOOLS = [");
const dataEnd = source.indexOf("// RENDERING", dataStart);
check(dataStart >= 0 && dataEnd > dataStart, "could not locate catalogue and matching source");

let api;
if (dataStart >= 0 && dataEnd > dataStart) {
  try {
    api = vm.runInNewContext(
      `${source.slice(dataStart, dataEnd)};({TOOLS,COMPONENTS,COMPONENT_BY_ID,state,rankedTools,buildSystemBundle})`,
      {},
      { filename: "matching-source.js" }
    );
  } catch (error) {
    failures.push(`catalogue or matching source does not execute: ${error.message}`);
  }
}

if (api) {
  const required = ["id", "name", "provider", "type", "cost", "link", "what", "purpose", "scope", "scale", "capacity", "approach", "data", "time"];
  const ids = new Set();
  check(api.TOOLS.length === 44, `expected 44 catalogue items, found ${api.TOOLS.length}`);
  for (const tool of api.TOOLS) {
    for (const field of required) check(tool[field] !== undefined && tool[field] !== "", `${tool.id || "unnamed tool"}: missing ${field}`);
    check(!ids.has(tool.id), `duplicate tool id: ${tool.id}`);
    ids.add(tool.id);
    check(/^https:\/\//.test(tool.link), `${tool.id}: source link must use HTTPS`);
    for (const field of ["purpose", "scope", "scale", "capacity", "approach", "data", "time"]) {
      check(Array.isArray(tool[field]) && tool[field].length > 0, `${tool.id}: ${field} must be a non-empty array`);
    }
  }

  const componentIds = new Set(api.COMPONENTS.map(component => component.id));
  check(componentIds.size === 6, `expected 6 unique components, found ${componentIds.size}`);
  for (const tool of api.TOOLS) {
    check(Object.hasOwn(api.COMPONENT_BY_ID, tool.id), `${tool.id}: missing component assignment`);
    check(componentIds.has(api.COMPONENT_BY_ID[tool.id]), `${tool.id}: invalid component ${api.COMPONENT_BY_ID[tool.id]}`);
  }
  for (const mappedId of Object.keys(api.COMPONENT_BY_ID)) check(ids.has(mappedId), `component map contains unknown tool: ${mappedId}`);

  const defaultAnswers = {
    role: null, purpose_primary: null, purpose_secondary: [], scope: [],
    evidence_scale: null, decision_scale: null, capacity: null,
    approach: null, data: null, time: null, toc: null, phase: null
  };
  for (const scenario of scenarios) {
    api.state.answers = { ...defaultAnswers, ...scenario.answers };
    const ranked = api.rankedTools();
    const bundle = api.buildSystemBundle(ranked);
    const present = new Set(bundle.map(tool => tool._component));
    check(bundle.length >= scenario.minimum_bundle_size, `${scenario.id}: expected at least ${scenario.minimum_bundle_size} bundle components, found ${bundle.length}`);
    for (const component of scenario.expected_components) {
      check(present.has(component), `${scenario.id}: expected eligible ${component} component`);
    }
    for (const tool of ranked.filter(item => !item._eligible)) {
      check(tool._blockers.length > 0, `${scenario.id}/${tool.id}: ineligible tool has no visible blocker`);
    }
  }
}

const staticChecks = [
  [source.includes("Working draft · v0.9"), "visible version is not v0.9"],
  [source.includes("function buildSystemBundle"), "system-bundle construction is missing"],
  [source.includes("CATALOGUE_SNAPSHOT"), "catalogue snapshot label is missing"],
  [source.includes('role="dialog" aria-modal="true"'), "modal semantics are missing"],
  [source.includes('aria-selected="true"'), "tab selection semantics are missing"],
  [source.includes("aria-pressed"), "selection state semantics are missing"],
  [!source.includes("fitBand("), "legacy fit-band logic remains"],
  [!source.includes("state.answers.scale"), "legacy single-scale state remains"],
  [source.includes("A baseline supports comparison but does not by itself establish"), "baseline/attribution qualification is missing"]
];
for (const [condition, message] of staticChecks) check(condition, message);

if (failures.length) {
  console.error(`Validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validation passed: ${api?.TOOLS.length || 0} tools, ${api?.COMPONENTS.length || 0} components, ${scenarios.length} stakeholder scenarios.`);
