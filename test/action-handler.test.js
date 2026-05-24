import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'

const actionGroups = []

globalThis.Hooks = {
  once: async (hook, handler) => {
    if (hook !== 'tokenActionHudCoreApiReady') return

    await handler({
      api: {
        ActionHandler: class {
          constructor () {
            this.delimiter = '|'
          }

          addActions (actions, groupData) {
            actionGroups.push({ actions, groupData })
          }
        },
        Logger: {
          debug: () => {},
          error: () => {}
        },
        Utils: {
          i18n: (key) => ({
            'tokenActionHud.ds4.genericCheck': 'Generic Check',
            'DS4.ChecksBody': 'Body',
            DS4Quantity: 'Quantity'
          })[key] ?? key,
          sortItemsByName: (items) => [...items].sort((a, b) => a.name.localeCompare(b.name))
        }
      }
    })
  }
}

const { ActionHandler } = await import('../scripts/action-handler.js')

beforeEach(() => {
  actionGroups.length = 0
  globalThis.game = {
    settings: {
      get: () => false
    }
  }
  globalThis.ui = { notifications: { error: () => {} } }
  globalThis.canvas = { tokens: { controlled: [] } }
  globalThis.CONFIG = {
    DS4: {
      icons: {
        checks: {
          body: 'icons/body.svg'
        }
      }
    }
  }
})

test('single actors include generic check and sorted consumable actions', async () => {
  const handler = new ActionHandler()
  handler.actor = {
    type: 'character',
    rollGenericCheck: async () => {},
    system: {
      checks: { body: 7 },
      combatValues: {
        meleeAttack: { total: { valueOf: () => 8 } },
        rangedAttack: { total: { valueOf: () => 6 } },
        spellcasting: { total: { valueOf: () => 5 } },
        targetedSpellcasting: { total: { valueOf: () => 4 } }
      }
    },
    items: [
      consumableItem({ id: 'z-potion', name: 'Z Potion', quantity: 2, max: 5, spent: 3 }),
      consumableItem({ id: 'a-ration', name: 'A Ration', quantity: 1 }),
      consumableItem({ id: 'empty', name: 'Empty Flask', quantity: 0 }),
      consumableItem({ id: 'rollable', name: 'Throwable Flask', quantity: 1, rollable: true })
    ]
  }

  await handler.buildSystemActions([])

  assert.deepEqual(actionsForGroup('generic_check'), [
    {
      id: 'generic-check',
      name: 'Generic Check',
      encodedValue: 'genericCheck|generic',
      img: 'icons/svg/d20.svg'
    }
  ])
  assert.deepEqual(actionsForGroup('consumables'), [
    {
      id: 'consume-a-ration',
      name: 'A Ration',
      encodedValue: 'consume|a-ration',
      img: 'icons/food.webp',
      info1: { text: 1, title: 'DS4.Quantity' }
    },
    {
      id: 'consume-z-potion',
      name: 'Z Potion',
      encodedValue: 'consume|z-potion',
      img: 'icons/food.webp',
      info1: { text: 2, title: 'DS4.Quantity' },
      info2: { text: 2, title: 'DS4.RemainingUsesTooltip' }
    }
  ])
})

test('weapons and spells include rollable metadata and meleeRanged weapons appear in both attack groups', async () => {
  const handler = new ActionHandler()
  handler.actor = {
    type: 'creature',
    system: {
      checks: {},
      combatValues: {
        meleeAttack: { total: { valueOf: () => 8 } },
        rangedAttack: { total: { valueOf: () => 6 } },
        spellcasting: { total: { valueOf: () => 5 } },
        targetedSpellcasting: { total: { valueOf: () => 4 } }
      }
    },
    items: [
      weaponItem({ id: 'spear', name: 'Spear', attackType: 'meleeRanged', rollable: true }),
      weaponItem({ id: 'bow', name: 'Bow', attackType: 'ranged', rollable: false }),
      spellItem({ id: 'spark', name: 'Spark', spellType: 'spellcasting', rollable: true })
    ]
  }

  await handler.buildSystemActions([])

  assert.deepEqual(actionsForGroup('melee').map((action) => [action.id, action.system]), [
    ['item-spear', { rollable: true }]
  ])
  assert.deepEqual(actionsForGroup('ranged').map((action) => [action.id, action.system]), [
    ['item-bow', { rollable: false }],
    ['item-spear', { rollable: true }]
  ])
  assert.deepEqual(actionsForGroup('spellcasting').map((action) => [action.id, action.system]), [
    ['item-spark', { rollable: true }]
  ])
})

function actionsForGroup (groupId) {
  return actionGroups.find((entry) => entry.groupData.id === groupId)?.actions ?? []
}

function consumableItem ({ id, name, quantity, max, spent, rollable = false }) {
  return {
    id,
    name,
    type: 'equipment',
    img: 'icons/food.webp',
    system: {
      quantity,
      rollable,
      usable: true,
      uses: { max, spent }
    }
  }
}

function weaponItem ({ id, name, attackType, rollable }) {
  return {
    id,
    name,
    type: 'weapon',
    img: 'icons/weapon.webp',
    system: {
      attackType,
      equipped: true,
      rollable,
      weaponBonus: 0
    }
  }
}

function spellItem ({ id, name, spellType, rollable }) {
  return {
    id,
    name,
    type: 'spell',
    img: 'icons/spell.webp',
    system: {
      spellType,
      equipped: true,
      rollable,
      spellModifier: { numerical: 0 }
    }
  }
}
