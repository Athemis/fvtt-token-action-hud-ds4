import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'

globalThis.Hooks = {
  once: async (hook, handler) => {
    if (hook !== 'tokenActionHudCoreApiReady') return

    await handler({
      api: {
        RollHandler: class {
          isRenderItem () { return false }

          async renderItem (actor, itemId) {
            this.renderedActor = actor
            this.renderedItemId = itemId
          }
        }
      }
    })
  }
}

const { RollHandler } = await import('../scripts/roll-handler.js')

beforeEach(() => {
  globalThis.canvas = { tokens: { controlled: [] } }
  globalThis.ui = { notifications: { error: () => {}, warn: () => {} } }
  globalThis.game = {}
})

test('item actions roll with token speaker data', async () => {
  let rollOptions
  const token = { document: { id: 'token-document' } }
  const actor = {
    items: new Map([['item-id', { roll: async (options) => { rollOptions = options } }]])
  }
  const handler = new RollHandler()
  handler.actor = actor
  handler.token = token

  await handler.handleActionClick({}, 'item|item-id')

  assert.deepEqual(rollOptions, { speaker: { token: token.document } })
})

test('item actions warn when item is unavailable', async () => {
  let warning
  let error
  globalThis.ui.notifications.warn = (message) => { warning = message }
  globalThis.ui.notifications.error = (message) => { error = message }
  globalThis.game = {
    i18n: {
      format: (key, data) => `${key}:${data.itemId}`
    }
  }
  const handler = new RollHandler()
  handler.actor = { items: new Map() }
  handler.token = { document: { id: 'token-document' } }

  await handler.handleActionClick({}, 'item|missing-item')

  assert.equal(warning, 'tokenActionHud.ds4.itemUnavailable:missing-item')
  assert.equal(error, undefined)
})

test('rendered item actions use core renderItem', async () => {
  const actor = { items: new Map() }
  const handler = new RollHandler()
  handler.actor = actor
  handler.token = { document: { id: 'token-document' } }
  handler.isRenderItem = () => true

  await handler.handleActionClick({}, 'item|item-id')

  assert.equal(handler.renderedActor, actor)
  assert.equal(handler.renderedItemId, 'item-id')
})

test('check actions roll with token speaker data', async () => {
  let rollValue
  let rollOptions
  const token = { document: { id: 'token-document' } }
  const actor = {
    rollCheck: async (checkValue, options) => {
      rollValue = checkValue
      rollOptions = options
    }
  }
  const handler = new RollHandler()
  handler.actor = actor
  handler.token = token

  await handler.handleActionClick({}, 'check|body')

  assert.equal(rollValue, 'body')
  assert.deepEqual(rollOptions, { speaker: { token: token.document } })
})

test('multitoken check actions roll each controlled actor with its token speaker data', async () => {
  const rolls = []
  const tokens = ['first', 'second'].map((id) => {
    const token = {
      id,
      document: { id: `${id}-document` },
      actor: {
        type: id === 'first' ? 'character' : 'creature',
        rollCheck: async (checkValue, options) => rolls.push({ checkValue, options })
      }
    }
    return token
  })
  globalThis.canvas.tokens.controlled = tokens
  const handler = new RollHandler()

  await handler.handleActionClick({}, 'multitoken|check|body')

  assert.deepEqual(rolls, [
    { checkValue: 'body', options: { speaker: { token: tokens[0].document } } },
    { checkValue: 'body', options: { speaker: { token: tokens[1].document } } }
  ])
})

test('consume actions call DS4 consume item macro with actor context', async () => {
  let consumedItemId
  let consumedActor
  globalThis.game = {
    ds4: {
      macros: {
        consumeItem: async (itemId, actor) => {
          consumedItemId = itemId
          consumedActor = actor
        }
      }
    }
  }
  const actor = { type: 'character' }
  const handler = new RollHandler()
  handler.actor = actor
  handler.token = { document: { id: 'token-document' } }

  await handler.handleActionClick({}, 'consume|item-id')

  assert.equal(consumedItemId, 'item-id')
  assert.equal(consumedActor, actor)
})

test('multitoken consume actions are ignored because consumables are single actor actions', async () => {
  let consumeCalls = 0
  globalThis.game = {
    ds4: {
      macros: {
        consumeItem: async () => { consumeCalls += 1 }
      }
    }
  }
  globalThis.canvas.tokens.controlled = [{ id: 'token-id', actor: { type: 'character' } }]
  const handler = new RollHandler()

  await handler.handleActionClick({}, 'multitoken|consume|item-id')

  assert.equal(consumeCalls, 0)
})

test('multitoken generic check actions are ignored because generic checks are single actor actions', async () => {
  let rollCalls = 0
  globalThis.canvas.tokens.controlled = [{
    id: 'token-id',
    document: { id: 'token-document' },
    actor: {
      type: 'character',
      rollGenericCheck: async () => { rollCalls += 1 }
    }
  }]
  const handler = new RollHandler()

  await handler.handleActionClick({}, 'multitoken|genericCheck|generic')

  assert.equal(rollCalls, 0)
})

test('consume actions warn when DS4 consume item macro is unavailable', async () => {
  let warning
  globalThis.ui.notifications.warn = (message) => { warning = message }
  globalThis.game = {
    i18n: {
      localize: (key) => `${key}.localized`
    }
  }
  const handler = new RollHandler()
  handler.actor = { type: 'character' }
  handler.token = { document: { id: 'token-document' } }

  await handler.handleActionClick({}, 'consume|item-id')

  assert.equal(warning, 'tokenActionHud.ds4.consumeUnavailable.localized')
})

test('generic check actions roll actor generic check with token speaker data', async () => {
  let rollOptions
  const token = { document: { id: 'token-document' } }
  const actor = {
    rollGenericCheck: async (options) => { rollOptions = options }
  }
  const handler = new RollHandler()
  handler.actor = actor
  handler.token = token

  await handler.handleActionClick({}, 'genericCheck|')

  assert.deepEqual(rollOptions, { speaker: { token: token.document } })
})
