export let RollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
  /**
   * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
   */
  RollHandler = class RollHandler extends coreModule.api.RollHandler {
    /**
     * Handle action click
     * Called by Token Action HUD Core when an action is left or right-clicked
     * @override
     * @param {object} event        The event
     * @param {string} encodedValue The encoded value
     */
    async handleActionClick (event, encodedValue) {
      const actionComponents = encodedValue.split('|')
      const isMultiToken = actionComponents[0] === 'multitoken'
      const actionTypeId = isMultiToken ? actionComponents[1] : actionComponents[0]
      const actionId = isMultiToken ? actionComponents[2] : actionComponents[1]

      const renderable = ['item']

      if (renderable.includes(actionTypeId) && this.isRenderItem() && !isMultiToken) {
        return this.doRenderItem(this.actor, actionId)
      }

      const knownCharacters = ['character', 'creature']

      // If single actor is selected and not a multitoken action
      if (this.actor && !isMultiToken) {
        await this.#handleAction(
          event,
          this.actor,
          this.token,
          actionTypeId,
          actionId,
          false
        )
        return
      }

      const controlledTokens = canvas.tokens.controlled.filter((token) =>
        knownCharacters.includes(token.actor?.type)
      )

      // If multiple actors are selected
      for (const token of controlledTokens) {
        const actor = token.actor
        await this.#handleAction(event, actor, token, actionTypeId, actionId, isMultiToken)
      }
    }

    /**
     * Handle action hover
     * Called by Token Action HUD Core when an action is hovered on or off
     * @override
     * @param {object} event        The event
     * @param {string} encodedValue The encoded value
     */
    async handleActionHover (event, encodedValue) {
      // This method will be implemented in a future update
      // for handling hover events on actions
    }

    /**
     * Handle group click
     * Called by Token Action HUD Core when a group is right-clicked while the HUD is locked
     * @override
     * @param {object} event The event
     * @param {object} group The group
     */
    async handleGroupClick (event, group) {
      // This method will be implemented in a future update
      // for handling group click events when the HUD is locked
    }

    /**
     * Handle action
     * @private
     * @param {object} event        The event
     * @param {object} actor        The actor
     * @param {object} token        The token
     * @param {string} actionTypeId The action type id
     * @param {string} actionId     The actionId
     * @param {boolean} isMultiToken Whether this is a multitoken action
     */
    async #handleAction (event, actor, token, actionTypeId, actionId, isMultiToken = false) {
      try {
        switch (actionTypeId) {
          case 'item':
            this.#handleItemAction(event, actor, actionId)
            break
          case 'utility':
            this.#handleUtilityAction(token, actionId)
            break
          case 'check':
            this.#handleCheckAction(event, actor, token, actionId, isMultiToken)
            break
          default:
            console.warn(`Unknown action type: ${actionTypeId}`)
        }
      } catch (error) {
        ui.notifications.error(`Error handling action: ${error.message}`)
      }
    }

    /**
     * Handle item action
     * @private
     * @param {object} event    The event
     * @param {object} actor    The actor
     * @param {string} actionId The action id
     */
    #handleItemAction (event, actor, actionId) {
      const item = actor.items.get(actionId)
      try {
        item.roll(event)
      } catch (error) {
        ui.notifications.error(`Error rolling item: ${error.message}`)
      }
    }

    /**
     * Handle check action
     * @private
     * @param {object} event       The event
     * @param {object} actor       The actor
     * @param {object} token       The token object
     * @param {string} checkValue  The check value to roll
     * @param {boolean} isMultiToken Whether this is a multitoken action
     */
    #handleCheckAction (event, actor, token, checkValue, isMultiToken = false) {
      try {
        if (!actor) {
          console.warn('Cannot roll check: No actor available')
          return
        }

        if (!actor.rollCheck) {
          console.warn(`Actor ${actor.name} (${actor.id}) does not have a rollCheck method`)
          return
        }

        actor.rollCheck(checkValue, token.document)
      } catch (error) {
        ui.notifications.error(`Error rolling check: ${error.message}`)
      }
    }

    /**
     * Handle utility action
     * @private
     * @param {object} token    The token
     * @param {string} actionId The action id
     */
    async #handleUtilityAction (token, actionId) {
      try {
        switch (actionId) {
          case 'endTurn':
            if (game.combat?.current?.tokenId === token.id) {
              await game.combat?.nextTurn()
            }
            break
          default:
            console.warn(`Unknown utility action: ${actionId}`)
        }
      } catch (error) {
        ui.notifications.error(`Error handling utility action: ${error.message}`)
      }
    }
  }
})
