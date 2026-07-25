import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const moduleJson = JSON.parse(await readFile(new URL('../module.json', import.meta.url), 'utf8'))

test('module metadata targets Foundry 14 and DS4 4 beta compatibility', () => {
  const { compatibility } = moduleJson
  assert.equal(compatibility.minimum, '14')
  assert.equal(compatibility.maximum, '14')
  assert.match(
    compatibility.verified,
    /^14\./,
    `verified should be a Foundry 14 patch version, got ${compatibility.verified}`
  )

  const [system] = moduleJson.relationships.systems
  assert.equal(system.id, 'ds4')
  assert.match(
    system.compatibility.minimum,
    /^4\.0\.0-/,
    `DS4 minimum should be a 4.0.0 pre-release, got ${system.compatibility.minimum}`
  )
  assert.match(
    system.compatibility.verified,
    /^4\.0\.0-/,
    `DS4 verified should be a 4.0.0 pre-release, got ${system.compatibility.verified}`
  )
})