import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const moduleJson = JSON.parse(await readFile(new URL('../module.json', import.meta.url), 'utf8'))

test('module metadata targets Foundry 14 and DS4 4 beta compatibility', () => {
  assert.deepEqual(moduleJson.compatibility, {
    minimum: '14',
    verified: '14.361',
    maximum: '14'
  })

  assert.deepEqual(moduleJson.relationships.systems, [
    {
      id: 'ds4',
      compatibility: {
        minimum: '4.0.0-beta.5',
        verified: '4.0.0-beta.5'
      }
    }
  ])
})
