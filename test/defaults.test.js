import assert from 'node:assert/strict'
import { test } from 'node:test'

globalThis.Hooks = {
  once: async (hook, handler) => {
    if (hook !== 'tokenActionHudCoreApiReady') return

    await handler({
      api: {
        Utils: {
          i18n: (key) => key
        }
      }
    })
  }
}

const { GROUP } = await import('../scripts/constants.js')
const { DEFAULTS } = await import('../scripts/defaults.js')

test('DS4 4 HUD groups are registered for generic checks and consumables', () => {
  assert.deepEqual(GROUP.generic_check, {
    id: 'generic_check',
    name: 'tokenActionHud.ds4.genericCheck',
    type: 'system',
    listName: 'Group: tokenActionHud.ds4.genericCheck'
  })
  assert.deepEqual(GROUP.consumables, {
    id: 'consumables',
    name: 'tokenActionHud.ds4.consumables',
    type: 'system',
    listName: 'Group: tokenActionHud.ds4.consumables'
  })
})

test('default layout includes generic checks, consumables, and targeted spellcasting', () => {
  assert.deepEqual(DEFAULTS.layout.map((entry) => entry.nestId), [
    'weapons',
    'spells',
    'checks',
    'items',
    'utility'
  ])

  const spells = DEFAULTS.layout.find((entry) => entry.nestId === 'spells')
  const checks = DEFAULTS.layout.find((entry) => entry.nestId === 'checks')
  const items = DEFAULTS.layout.find((entry) => entry.nestId === 'items')

  assert.equal(spells.groups[1].nestId, 'spells_tspellcasting')
  assert.deepEqual(checks.groups.map((group) => group.nestId), [
    'checks_checks',
    'checks_generic_check'
  ])
  assert.deepEqual(items.groups.map((group) => group.nestId), ['items_consumables'])
})
