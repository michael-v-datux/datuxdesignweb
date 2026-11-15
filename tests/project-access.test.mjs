import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { unlink } from 'node:fs/promises';
const compiled = new URL('./.project-access-test.mjs', import.meta.url);
await build({ entryPoints: ['src/lib/projects/access.ts'], bundle: true, platform: 'node', format: 'esm', packages: 'external', outfile: compiled.pathname, define: { 'import.meta.env': '{}' } });
const { issueProjectToken, verifyProjectToken, matchesProjectPassword } = await import(compiled.href);
after(() => unlink(compiled));
const secret = 'test-signing-secret', now = 1_800_000_000_000;
const token = issueProjectToken('design-system', 'hash-one', secret, now);
test('signed access is scoped to the project and password version', () => {
 assert.equal(verifyProjectToken(token, 'design-system', 'hash-one', secret, now), true);
 assert.equal(verifyProjectToken(token, 'other-case', 'hash-one', secret, now), false);
 assert.equal(verifyProjectToken(token, 'design-system', 'hash-two', secret, now), false);
});
test('forged legacy cookies and changed tokens fail closed', () => {
 for (const value of ['true', token+'x', 'e30.invalid', token+'.extra', undefined]) assert.equal(verifyProjectToken(value, 'design-system', 'hash-one', secret, now), false);
 assert.equal(verifyProjectToken(token, 'design-system', 'hash-one', 'different-secret', now), false);
});
test('expired access is rejected', () => {
 assert.equal(verifyProjectToken(token, 'design-system', 'hash-one', secret, now+86400000), false);
});
test('malformed passwords are rejected before bcrypt', async () => {
 for (const password of [undefined, null, {}, '', 'a'.repeat(257)]) assert.equal(await matchesProjectPassword(password,'hash'), false);
});
