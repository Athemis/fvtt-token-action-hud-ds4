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

test('changelog template links each entry to its commit', () => {
  assert.match(changelogConfig, /commit\.id\s*\|\s*truncate\(length=7, end=""\)/)
  assert.match(changelogConfig, /github\.com\/Athemis\/fvtt-token-action-hud-ds4\/commit\/\{\{ commit\.id \}\}/)
})

test('release workflow exports Token Action HUD Core minimum version for changelog', () => {
  assert.match(releaseWorkflow, /TAH_CORE_MINIMUM_VERSION=/)
  assert.match(releaseWorkflow, /select\(\.id == "token-action-hud-core"\)/)
  assert.match(releaseWorkflow, /\.compatibility\.minimum/)
  assert.match(releaseWorkflow, /TAH_CORE_MINIMUM_VERSION: \$\{\{ env\.TAH_CORE_MINIMUM_VERSION \}\}/)
})

test('release workflow creates GitHub releases with gh cli', () => {
  assert.doesNotMatch(releaseWorkflow, /ncipollo\/release-action/)
  assert.match(releaseWorkflow, /GH_TOKEN: \$\{\{ secrets\.GITHUB_TOKEN \}\}/)
  assert.match(releaseWorkflow, /gh release create "\$TAG_NAME"/)
  assert.match(releaseWorkflow, /--title "\$PACKAGE_NAME \$TAG_NAME"/)
  assert.match(releaseWorkflow, /--notes "\$RELEASE_BODY"/)
  assert.match(releaseWorkflow, /\.\/module\.json/)
  assert.match(releaseWorkflow, /\.\/module\.zip/)
})

test('changelog template starts with Token Action HUD Core requirement note', () => {
  assert.match(changelogConfig, /> \[!NOTE\]/)
  assert.match(changelogConfig, /> This module requires Token Action HUD Core \{\{ get_env\(name="TAH_CORE_MINIMUM_VERSION"\) \}\}\+\./)
})

test('changelog template renders conventional commit scopes when present', () => {
  assert.match(changelogConfig, /\{% if commit\.scope %\}/)
  assert.match(changelogConfig, /\*\(\{\{ commit\.scope \}\}\)\*/)
})
