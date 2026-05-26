import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const releaseWorkflow = await readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8')

test('release workflow does not interpolate github.ref_name inside shell scripts', () => {
  const runBlocks = [...releaseWorkflow.matchAll(/^\s+run: \|\n((?:\s{10,}.+\n?)*)/gm)]
    .map((match) => match[1])

  assert.ok(runBlocks.length > 0)
  assert.equal(runBlocks.some((block) => block.includes('github.ref_name')), false)
})
