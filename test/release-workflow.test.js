import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const releaseWorkflow = await readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8')
const changelogConfig = await readFile(new URL('../cliff.toml', import.meta.url), 'utf8')

test('release workflow does not interpolate github.ref_name inside shell scripts', () => {
  const runBlocks = [...releaseWorkflow.matchAll(/^\s+run: \|\n((?:\s{10,}.+\n?)*)/gm)]
    .map((match) => match[1])

  assert.ok(runBlocks.length > 0)
  assert.equal(runBlocks.some((block) => block.includes('github.ref_name')), false)
})

test('changelog template renders git-cliff conventional commit descriptions', () => {
  assert.match(changelogConfig, /commit\.message\s*\|\s*trim\s*\|\s*upper_first/)
  assert.doesNotMatch(changelogConfig, /commit\.message\s*\|\s*split\(pat=": "\)/)
})
