import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePresentation, makeSectionTemplate, columnStateTitle } from '../public/scripts/lib/case-design.js';
test('chapter anchors reject URL and markup injection while preserving localized labels',()=>{
 for(const anchor of ['javascript:alert(1)','bad" id="x','../private','a'.repeat(61)]) assert.equal(normalizePresentation({anchor}).anchor,'');
 const p=normalizePresentation({anchor:'chapter-data',nav_en:'Data',nav_uk:'Дані'});
 assert.equal(p.anchor,'chapter-data'); assert.equal(p.nav_uk,'Дані');
});
test('product explorer templates retain every editable panel and plain-text tab label',()=>{
 const t=makeSectionTemplate('workbench-explorer');
 assert.equal(normalizePresentation(t.presentation).variant,'workbench-explorer');
 assert.equal(t.columns.length,3);
 assert(t.columns.every(c=>c.blocks.some(b=>b.type==='image')));
 assert.equal(columnStateTitle({blocks:[{type:'text',content:{text_en:'<h2><em>Compare</em> &amp; inspect</h2>'}}]},'en',0),'Compare & inspect');
});
