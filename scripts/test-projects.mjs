import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1];
const declarations = script.slice(0, script.indexOf('initializeProjects();'));
const store = new Map();
const attributes = new Map();
const context = vm.createContext({
  console, Date, Math, JSON, URL, Blob, setTimeout,
  localStorage: {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: key => store.delete(key)
  },
  document: {
    body: { getAttribute: key => attributes.get(key) ?? null, removeAttribute: key => attributes.delete(key) },
    getElementById: () => null,
    querySelector: () => null
  }
});
vm.runInContext(declarations, context);
const run = expression => vm.runInContext(expression, context);
const plain = value => JSON.parse(JSON.stringify(value));
let checks = 0;
function test(name, fn) {
  try { fn(); checks++; console.log('PASS ' + name); }
  catch (error) { error.message = name + ': ' + error.message; throw error; }
}

test('all teaching examples produce eligible component suggestions', () => {
  const examples = run('EXAMPLES');
  for (const example of examples) {
    context.testExample = plain(example);
    run('Object.assign(state, freshState()); state.answers = {...emptyAnswers(), ...testExample.answers};');
    const bundle = run('resolveBundle()');
    assert.equal(bundle.length, 6);
    assert.ok(bundle.filter(e => e.tool).length >= 2);
    assert.ok(bundle.every(e => !e.tool || e.tool._eligible));
  }
});

test('unsure approach is unscored and does not add approach warnings', () => {
  run("Object.assign(state, freshState()); state.answers = {...emptyAnswers(), ...EXAMPLES[0].answers, approach: null};");
  const before = plain(run('rankedTools()'));
  run("state.answers.approach = 'unsure'");
  assert.deepEqual(plain(run('rankedTools()')), before);
});

test('water relevance excludes only the two water-specific sources', () => {
  run("state.answers.water = 'yes'");
  const before = plain(run('rankedTools()'));
  run("state.answers.water = 'no'");
  const after = plain(run('rankedTools()'));
  for (const id of ['aqueduct', 'aquastat']) {
    const tool = after.find(t => t.id === id);
    assert.equal(tool._eligible, false);
    assert.ok(tool._blockers.some(b => b.includes('Water-specific')));
  }
  for (const tool of after.filter(t => !['aqueduct','aquastat'].includes(t.id))) {
    assert.deepEqual(tool, before.find(t => t.id === tool.id));
  }
  run("state.answers.water = 'unsure'");
  assert.ok(run("rankedTools().find(t=>t.id==='aqueduct')._warnings.some(w=>w.includes('Water-specific'))"));
});

test('local choices, chosen alternatives and stale choices remain explicit', () => {
  run("Object.assign(state, freshState()); state.answers = {...emptyAnswers(), ...EXAMPLES[1].answers}; state.selections.anchor_reporting = {kind:'local',name:'District review forum',note:'Confirm mandate'};");
  assert.equal(run("selectionName(resolveBundle().find(e=>e.component.id==='anchor_reporting'))"), 'District review forum');
  run("state.selections.collection_delivery = {kind:'tool',toolId:'pmerl'};");
  assert.equal(run("resolveBundle().find(e=>e.component.id==='collection_delivery').tool.id"), 'pmerl');
  run("state.answers.scope = ['mitigation'];");
  const entry = run("resolveBundle().find(e=>e.component.id==='collection_delivery')");
  assert.equal(entry.invalid, true);
  assert.equal(entry.tool.id, 'pmerl');
  assert.match(run('buildPlainSummary()'), /NOT ELIGIBLE UNDER CURRENT ANSWERS/);
});

test('project normalization bounds untrusted inputs and preserves editable work', () => {
  context.malformed = JSON.parse('{"stage":100,"answers":{"scope":"adaptation","purpose_primary":"invented","capacity":{},"approach":"unsure"},"context":{"name":"Test","decision":"<img src=x onerror=alert(1)>"},"selections":{"anchor_reporting":{"kind":"tool","toolId":"pmerl"},"evaluation_learning":{"kind":"local","name":"Local review"}},"worksheet":{"evaluation_learning":{"owner":"Team A","task":"","question":"<script>alert(1)</script>"}}}');
  run('Object.assign(state, normalizeState(malformed));');
  assert.equal(run('state.stage'), 0);
  assert.deepEqual(plain(run('state.answers.scope')), []);
  assert.equal(run('state.answers.purpose_primary'), null);
  assert.equal(run('state.answers.capacity'), null);
  assert.equal(run('state.selections.anchor_reporting'), undefined);
  assert.equal(run("worksheetValue(componentMeta('evaluation_learning'),'task')"), '');
  const html = run('renderWorksheet(resolveBundle())');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('Team A'));
});

test('old single-scale answers migrate without losing their meaning', () => {
  run("Object.assign(state, normalizeState({answers:{purpose_primary:'national_policy',scope:['adaptation'],scale:'national',capacity:'low'}}));");
  assert.equal(run('state.answers.evidence_scale'), 'national');
  assert.equal(run('state.answers.decision_scale'), 'national');
  assert.equal(run('state.started'), true);
});

test('named projects and worksheets survive save and reload', () => {
  store.clear(); attributes.clear();
  run("workspace={activeId:'',projects:[]}; initializeProjects(); state.context.name='Coastal review'; state.context.decision='Which action next?'; state.worksheet.evaluation_learning={owner:'Community forum',question:'Who is missing?'}; persistState();");
  const original = plain(run('state'));
  run('Object.assign(state, freshState()); workspace={activeId:"",projects:[]}; initializeProjects();');
  assert.deepEqual(plain(run('state')), original);
  assert.equal(run('workspace.projects.length'), 1);
});

test('v0.9 answers are imported once and do not overwrite a newer project', () => {
  store.clear(); attributes.clear();
  store.set('nav_state_v9', JSON.stringify({ stage:3, answers:{ purpose_primary:'national_policy',scope:['adaptation'],capacity:'medium' } }));
  run('workspace={activeId:"",projects:[]}; initializeProjects(); persistState();');
  assert.equal(run('state.answers.capacity'), 'medium');
  run("state.answers.capacity='low'; persistState(); workspace={activeId:'',projects:[]}; initializeProjects();");
  assert.equal(run('state.answers.capacity'), 'low');
});

test('an offline snapshot imports separately, then keeps subsequent edits on reload', () => {
  const embedded = { id:'p-offline-example',state:{ answers:{scope:['adaptation']},context:{name:'Offline scenario'} } };
  attributes.set('data-saved-project', JSON.stringify(embedded));
  run('initializeProjects();');
  assert.equal(run('workspace.activeId'), 'p-offline-example');
  assert.equal(run('workspace.projects.length'), 2);
  run("state.context.name='Edited offline scenario'; persistState();");
  attributes.set('data-saved-project', JSON.stringify(embedded));
  run('workspace={activeId:"",projects:[]}; initializeProjects();');
  assert.equal(run('state.context.name'), 'Edited offline scenario');
  assert.equal(run('workspace.projects.length'), 2);
});

test('save failures are reported while in-memory work is preserved', () => {
  run("state.context.decision='Keep this decision'; localStorage.setItem=()=>{throw new Error('Quota');}; persistState();");
  assert.equal(run('saveFailed'), true);
  assert.equal(run('workspace.projects.find(p=>p.id===workspace.activeId).state.context.decision'), 'Keep this decision');
});

test('plan exports preserve local choices, notes, context, provenance and uncertainty', () => {
  run("Object.assign(state,freshState()); state.context.name='Heat review'; state.context.decision='Which ward needs support?';state.selections.anchor_reporting={kind:'local',name:'Ward meeting',note:'Confirm authority'}; state.worksheet.anchor_reporting={owner:'Ward team',question:'Who attends?'};");
  const text = run('buildPlainSummary()');
  for (const value of ['Heat review','Which ward needs support?','Ward meeting','Ward team','Who attends?','Confirm authority','PREVIEW','STILL TO CHECK','https://']) assert.ok(text.includes(value), value);
});

test('CSV cells escape delimiters, newlines and spreadsheet formulas', () => {
  for (const value of ['=2+2','+SUM(A1)','-1+1','@cmd','\t=1',' \n=1']) {
    context.cell = value;
    assert.ok(run('csvCell(cell)').startsWith('"\''));
  }
  context.cell = 'A,"B"\nC';
  assert.equal(run('csvCell(cell)'), '"A,""B""\nC"');
});

test('fit percentages appear only inside detailed reasoning', () => {
  run("Object.assign(state,freshState());state.answers={...emptyAnswers(),...EXAMPLES[1].answers,data:null,time:null};");
  const card = run('toolCardHTML(rankedTools().find(t=>t.id==="pmerl"),"bundle")');
  assert.ok(!card.slice(0,card.indexOf('<details')).includes('%'));
  assert.match(card, /data availability/);
  assert.match(card, /timing/);
  assert.match(card, /Criteria match:/);
});

console.log(`Project checks passed: ${checks}.`);
