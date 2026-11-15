import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { unlink } from 'node:fs/promises';
const output = new URL('./.media-range-test.mjs', import.meta.url);
await build({ entryPoints:['src/lib/projects/media-range.ts'], bundle:true, platform:'node', format:'esm', outfile:output.pathname });
const { mediaRange } = await import(output.href);
after(()=>unlink(output));
test('video byte ranges support bounded, open and suffix requests',()=>{
 assert.deepEqual(mediaRange('bytes=0-99',1000),{start:0,end:99});
 assert.deepEqual(mediaRange('bytes=900-',1000),{start:900,end:999});
 assert.deepEqual(mediaRange('bytes=-100',1000),{start:900,end:999});
 assert.deepEqual(mediaRange('bytes=900-5000',1000),{start:900,end:999});
 assert.deepEqual(mediaRange('bytes=-5000',1000),{start:0,end:999});
 assert.equal(mediaRange(null,1000),null);
});
test('invalid, reversed, multiple and unsatisfiable ranges fail closed',()=>{
 for(const range of ['bytes=1000-','bytes=100-10','bytes=-0','bytes=-','bytes=0-1,4-5','items=0-9','bytes=999999999999999999999-'])assert.equal(mediaRange(range,1000),false);
 assert.equal(mediaRange('bytes=0-',0),false);
});
