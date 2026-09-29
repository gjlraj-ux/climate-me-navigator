import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

// DOM integration only: no remote resources, layout engine or native browser.
const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function boot(saved = {}, html = source) {
  const errors = [], downloads = [], confirmations = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(html, {
    url: 'https://navigator.test/', runScripts: 'dangerously', virtualConsole,
    beforeParse(window) {
      for (const [key,value] of Object.entries(saved)) window.localStorage.setItem(key,value);
      window.scrollTo = () => {};
      window.confirm = message => { confirmations.push(message); return true; };
      window.HTMLElement.prototype.scrollIntoView = () => {};
      window.HTMLAnchorElement.prototype.click = function () {};
      window.Blob = Blob;
      window.URL.createObjectURL = blob => { downloads.push(blob); return 'blob:test'; };
      window.URL.revokeObjectURL = () => {};
    }
  });
  const { window } = dom, { document } = window;
  const get = selector => { const el = document.querySelector(selector); assert.ok(el, selector); return el; };
  const click = selector => get(selector).click();
  const input = (selector, value) => {
    const el = get(selector); el.value = value;
    el.dispatchEvent(new window.Event('input', { bubbles:true }));
  };
  const snapshot = () => Object.fromEntries(Object.keys(window.localStorage).map(key => [key,window.localStorage.getItem(key)]));
  const close = () => { dom.window.close(); assert.deepEqual(errors, [], 'uncaught application errors'); };
  return { window, document, get, click, input, snapshot, downloads, confirmations, close };
}
let checks = 0;
async function test(name, fn) {
  await fn(); checks++; console.log('PASS ' + name);
}
function completeJourney(ui) {
  ui.click('#start-design');
  ui.click('#answer-purpose_primary-community_monitoring');
  ui.input('#context-name', 'Coastal review');
  ui.input('#context-decision', 'Which preparedness changes should the district fund?');
  ui.click('#btn-next'); ui.click('#answer-scope-adaptation'); ui.click('#btn-next');
  ui.click('#answer-evidence_scale-community'); ui.click('#answer-decision_scale-subnational');
  ui.click('#answer-capacity-low'); ui.click('#btn-next');
  saveProject(ui, 'Coastal review');
}
function saveProject(ui, name) {
  ui.click('#project-save'); ui.input('#project-name-input',name);
  ui.get('#project-name-form').dispatchEvent(new ui.window.Event('submit',{bubbles:true,cancelable:true}));
}

await test('Back returns to welcome and preserves answers through reload', () => {
  const ui = boot();
  ui.click('#start-design'); ui.click('#answer-purpose_primary-national_policy');
  ui.input('#context-name','Saved decision'); ui.click('#btn-back');
  assert.match(ui.get('#stage-container h1').textContent, /Design a climate/);
  const saved = ui.snapshot(); ui.close();
  const reopened = boot(saved);
  reopened.click('#start-design');
  assert.equal(reopened.get('#answer-purpose_primary-national_policy').checked,true);
  assert.equal(reopened.get('#context-name').value,'Saved decision'); reopened.close();
});

await test('review checks opens and focuses the requested optional questions', () => {
  const ui = boot(); completeJourney(ui);
  ui.click('[data-focus="refine-block"]');
  assert.equal(ui.get('#refine-block').open, true);
  assert.equal(ui.document.activeElement,ui.get('#refine-block > summary'));
  ui.click('#answer-data-thin');
  assert.equal(ui.get('#refine-block').open,true);
  ui.click('#btn-next'); ui.click('[data-focus="context-decision"]');
  assert.equal(ui.get('#context-notes').open,true);
  assert.equal(ui.document.activeElement.id,'context-decision'); ui.close();
});

await test('long local names and drafts survive reload, switching and duplication', () => {
  const ui = boot(); completeJourney(ui);
  const name = 'District adaptation review forum '.repeat(10);
  ui.click('[data-use-local="anchor_reporting"]');
  assert.ok(name.length <= ui.get('#local-name-anchor_reporting').maxLength);
  ui.input('#local-name-anchor_reporting',name);
  ui.input('#local-note-anchor_reporting','Confirm public access');
  ui.input('#work-anchor_reporting-owner','District team');
  ui.click('[data-auto="anchor_reporting"]');
  const saved = ui.snapshot(); ui.close();
  const reopened = boot(saved);
  reopened.click('[data-use-local="anchor_reporting"]');
  assert.equal(reopened.get('#local-name-anchor_reporting').value,name);
  assert.equal(reopened.get('#local-note-anchor_reporting').value,'Confirm public access');
  assert.equal(reopened.get('#work-anchor_reporting-owner').value,'District team');
  const originalId = reopened.get('#project-select').value;
  reopened.click('#project-duplicate');
  reopened.input('#local-name-anchor_reporting','Different process');
  const select = reopened.get('#project-select'); select.value = originalId;
  select.dispatchEvent(new reopened.window.Event('change',{bubbles:true}));
  assert.equal(reopened.get('#local-name-anchor_reporting').value,name); reopened.close();
});

await test('evidence-use notes survive JSON, text, CSV, offline export and reload', async () => {
  const ui = boot(); completeJourney(ui);
  const notes = {
    question:'Who can act on flood warnings?\nWhose experience is missing?',
    review:'District and community forum, 15 November',
    action:'=Discuss accessible evacuation routes',
    feedback:'Return findings in an open meeting <with comments>'
  };
  for (const [key,value] of Object.entries(notes)) ui.input('#use-'+key,value);
  assert.ok(ui.get('#evidence-use').textContent.includes('contributors'));
  assert.ok(ui.get('.decision-brief').textContent.includes('Which preparedness'));
  ui.click('#project-export');
  const project = JSON.parse(await ui.downloads.at(-1).text());
  assert.deepEqual(project.state.evidenceUse,notes);
  let copied;
  Object.defineProperty(ui.window.navigator,'clipboard',{value:{writeText:async text => {copied=text;}}});
  ui.click('#btn-copy-summary');
  await Promise.resolve();
  for (const value of Object.values(notes)) assert.ok(copied.includes(value));
  ui.click('#export-worksheet'); const csv = await ui.downloads.at(-1).text();
  for (const value of Object.values(notes)) assert.ok(csv.includes(value));
  assert.ok(csv.includes('"\'=Discuss accessible evacuation routes"'));
  ui.click('#btn-save-offline'); const offline = await ui.downloads.at(-1).text();
  const saved = ui.snapshot(); ui.close();
  for (const opened of [boot(saved),boot({},offline)]) {
    for (const [key,value] of Object.entries(notes)) assert.equal(opened.get('#use-'+key).value,value);
    opened.close();
  }
});

await test('print preparation includes decision-use notes and all answered refinements', () => {
  const ui = boot(); completeJourney(ui);
  ui.click('[data-focus="refine-block"]');
  ui.click('#answer-data-thin'); ui.click('#answer-time-weeks'); ui.click('#btn-next');
  ui.input('#use-review','Community forum\nBefore the next budget review');
  ui.window.dispatchEvent(new ui.window.Event('beforeprint'));
  for (const id of ['plan-context','evidence-use-editor','work-anchor_reporting']) assert.equal(ui.get('#'+id).open,true);
  assert.match(ui.get('#plan-context').textContent,/Limited or fragmented evidence/);
  assert.match(ui.get('#plan-context').textContent,/A few weeks/);
  assert.match(ui.get('#print-evidence-use').textContent,/Community forum\nBefore/);
  ui.window.dispatchEvent(new ui.window.Event('afterprint'));
  for (const id of ['plan-context','evidence-use-editor','work-anchor_reporting']) assert.equal(ui.get('#'+id).open,false);
  ui.close();
});

await test('project imports retain notes and reset the file picker after errors', async () => {
  const ui = boot(); completeJourney(ui);
  ui.input('#use-feedback','Return results to the local assembly');
  ui.click('#project-export'); const json = await ui.downloads.at(-1).text();
  const originalId = ui.get('#project-select').value;
  const importFile = async text => {
    const picker = ui.get('#project-file');
    Object.defineProperty(picker,'files',{configurable:true,value:[{size:text.length,text:async()=>text}]});
    Object.defineProperty(picker,'value',{configurable:true,writable:true,value:'selected.json'});
    picker.dispatchEvent(new ui.window.Event('change',{bubbles:true}));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(picker.value,'');
  };
  await importFile('invalid JSON');
  assert.match(ui.get('#live-status').textContent,/not valid JSON/);
  await importFile(json);
  assert.notEqual(ui.get('#project-select').value,originalId);
  assert.equal(ui.get('#use-feedback').value,'Return results to the local assembly');
  assert.equal(ui.get('#project-select').options.length,2); ui.close();
});

await test('every step has unique IDs and valid label and description targets', () => {
  const ui = boot(); completeJourney(ui);
  for (const stage of [0,1,2,3,4]) {
    ui.click('#stage-nav-'+stage);
    const ids = [...ui.document.querySelectorAll('[id]')].map(el=>el.id);
    assert.equal(new Set(ids).size,ids.length,'duplicate IDs at step '+stage);
    for (const el of ui.document.querySelectorAll('label[for]')) assert.ok(ui.document.getElementById(el.htmlFor));
    for (const el of ui.document.querySelectorAll('[aria-describedby]')) {
      for (const id of el.getAttribute('aria-describedby').split(/\s+/)) assert.ok(ui.document.getElementById(id),id);
    }
  }
  ui.click('#tab-course'); assert.equal(ui.get('.skip-link').textContent,'Skip to M&E basics');
  ui.click('#tab-navigator'); assert.equal(ui.get('.skip-link').textContent,'Skip to navigator');
  ui.close();
});

await test('trial runs share one draft slot and only explicit saves enter the saved list', () => {
  const ui = boot();
  for (let i=0;i<3;i++) ui.click('#project-new');
  assert.equal(ui.get('#project-select').options.length,1);
  assert.equal(ui.document.querySelectorAll('#project-select optgroup option').length,0);
  ui.click('#start-design'); ui.click('#answer-purpose_primary-national_policy');
  ui.window.confirm = () => false; ui.click('#project-new');
  assert.equal(ui.get('#answer-purpose_primary-national_policy').checked,true);
  ui.window.confirm = () => true; ui.click('#project-new');
  assert.equal(ui.get('#project-select').options.length,1);
  saveProject(ui,'My retained plan');
  assert.equal(ui.document.querySelectorAll('#project-select optgroup option').length,1);
  ui.click('#project-new'); ui.click('#project-new');
  assert.equal(ui.get('#project-select').options.length,2);
  assert.equal(ui.document.querySelectorAll('#project-select optgroup option').length,1);
  const saved=ui.snapshot(); ui.close();
  const reopened=boot(saved);
  assert.equal(reopened.get('#project-select').options.length,2);
  assert.equal(reopened.document.querySelectorAll('#project-select optgroup option').length,1);
  reopened.close();
});

await test('legacy untitled projects remain intact and deletion requires confirmation', () => {
  const saved={nav_projects_v10:JSON.stringify({activeId:'old-1',projects:[
    {id:'old-1',state:{answers:{scope:['adaptation']},context:{name:'Untitled project',decision:'Preserve my work'}}},
    {id:'old-2',state:{answers:{scope:['mitigation']},context:{name:'Another existing plan'}}}
  ]})};
  const ui=boot(saved);
  assert.equal(ui.document.querySelectorAll('#project-select optgroup option').length,2);
  saveProject(ui,'Renamed older project');
  assert.equal(ui.get('#project-select').options.length,2);
  let message;
  ui.window.confirm=text=>{message=text;return false;}; ui.click('#project-delete');
  assert.match(message,/Renamed older project/);
  assert.equal(ui.get('#project-select').options.length,2);
  ui.window.confirm=()=>true; ui.click('#project-delete');
  assert.equal(ui.get('#project-select').value,'old-2');
  assert.equal(ui.get('#project-select').options.length,1);
  ui.click('#project-delete');
  assert.equal(ui.get('#project-select').options.length,1);
  assert.match(ui.get('#project-select').textContent,/Working draft/);
  assert.equal(ui.document.querySelectorAll('#project-select optgroup option').length,0);
  const stored=JSON.parse(ui.snapshot().nav_projects_v10);
  assert.ok(stored.projects.every(p=>p.id!=='old-1'&&p.id!=='old-2'));
  ui.close();
});

await test('readable downloads are separate from JSON backups and retain notes safely', async () => {
  const ui=boot();completeJourney(ui);
  ui.input('#use-feedback','Return findings <script>alert(1)</script> & invite corrections.');
  ui.click('#project-download');ui.click('#download-html');
  assert.equal(ui.downloads.at(-1).type,'text/html;charset=utf-8');
  const html=await ui.downloads.at(-1).text();
  const rendered=new JSDOM(html);
  assert.equal(rendered.window.document.querySelectorAll('script').length,0);
  assert.match(rendered.window.document.body.textContent,/Return findings <script>alert\(1\)<\/script> & invite corrections/);
  assert.match(rendered.window.document.body.textContent,/Which preparedness/);
  rendered.window.close();
  ui.click('#project-download');ui.click('#download-txt');
  assert.equal(ui.downloads.at(-1).type,'text/plain;charset=utf-8');
  assert.match(await ui.downloads.at(-1).text(),/CLIMATE M&E NAVIGATOR/);
  ui.click('#stage-nav-1');let printed=false;
  ui.window.print=()=>{printed=true;assert.ok(ui.document.getElementById('evidence-use'));};
  ui.click('#project-download');ui.click('#download-pdf');assert.equal(printed,true);
  assert.equal(ui.document.getElementById('download-dialog'),null);
  assert.match(ui.get('#project-export').textContent,/backup \(\.json\)/);
  ui.close();
});

console.log(`DOM integration checks passed: ${checks}.`);
