// System Module Imports
import { Utils } from './utils.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
  /**
   * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
   */
  ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
    /**
     * Build system actions
     * Called by Token Action HUD Core
     * @override
     * @param {array} groupIds
     */
    async buildSystemActions (groupIds) {
      try {
        // Set actor and token variables
        this.actors = !this.actor ? this.#getSelectedActors() : [this.actor]

        // Settings
        this.displayUnequipped = Utils.getSetting('displayUnequipped')

        if (this.actor) {
          // Handle single actor
          this.actorType = this.actor.type

          // Set items variable
          let items = this.actor.items
          items = coreModule.api.Utils.sortItemsByName(items)
          this.items = items

          if (this.actorType === 'character' || this.actorType === 'creature') {
            this.#buildCharacterActions()
          }
        } else {
          // Handle multiple actors
          this.#buildMultipleTokenActions()
        }
      } catch (error) {
        console.error(`Error building system actions: ${error.message}`)
        ui.notifications?.error(
          `Error building system actions: ${error.message}`
        )
      }
    }

    /**
     * Build character actions
     * @private
     */
    #buildCharacterActions () {
      try {
        this.#buildWeapons('item', ['weapon'])
        this.#buildSpells('item', ['spell'])
        this.#buildChecks('check', 'checks')
      } catch (error) {
        console.error(`Error building character actions: ${error.message}`)
        ui.notifications?.error(
          `Error building character actions: ${error.message}`
        )
      }
    }

    /**
     * Build multiple token actions
     * @private
     * @returns {object}
     */
    #buildMultipleTokenActions () {
      if (!this.actors || this.actors.length === 0) return

      try {
        // Create a utility group for multiple token selection
        const groupData = { id: 'token', type: 'system' }

        // Add selected tokens count
        const tokenCountInfo = {
          id: 'token-count-info',
          name: `${this.actors.length} tokens selected`,
          encodedValue: ['utility', 'tokenCount'].join(this.delimiter),
          cssClass: 'inactive'
        }

        this.addActions([tokenCountInfo], groupData)

        // Add skill checks for multiple tokens
        if (this.actors && this.actors.length > 0) {
          this.#buildMultiTokenChecks('check', 'checks')
        }
      } catch (error) {
        console.error(
          `Error building multiple token actions: ${error.message}`
        )
      }
    }

    /**
     * Get all selected actors
     * @private
     * @returns {Array} Array of selected actors
     */
    #getSelectedActors () {
      try {
        const tokens = canvas.tokens.controlled
        if (!tokens || tokens.length === 0) return []

        return tokens
          .filter((token) => token.actor)
          .map((token) => token.actor)
      } catch (error) {
        console.error(`Error getting selected actors: ${error.message}`)
        return []
      }
    }

    /**
     * Build Checks
     * @private
     * @param {string} actionType
     * @param {string} groupId
     */
    #buildChecks (actionType, groupId) {
      try {
        if (!this.actor?.system?.checks) {
          console.warn('Actor is missing system.checks property')
          return
        }

        const actions = Object.entries(this.actor.system.checks).map(
          (check) => {
            const checkId = check[0]
            const capitalizedCheckId =
              checkId.charAt(0).toUpperCase() + checkId.slice(1)
            const translationKey = `DS4.Checks${capitalizedCheckId}`
            const id = `${actionType}-${checkId}`
            const name = coreModule.api.Utils.i18n(translationKey)
            const img = CONFIG.DS4.icons.checks[checkId]
            const listName = `${actionType}${coreModule.api.Utils.i18n(`DS4.Checks${checkId}`)}`
            const encodedValue = [actionType, checkId].join(this.delimiter)
            const infoText = { text: check[1].valueOf() }
            return {
              id,
              name,
              img,
              encodedValue,
              info1: infoText,
              listName
            }
          }
        // Sort actions alphabetically by listName for easier navigation
        ).sort((a, b) => a.listName.localeCompare(b.listName))
        const groupData = { id: groupId, type: 'system' }
        this.addActions(actions, groupData)
      } catch (error) {
        console.error(`Error building checks: ${error.message}`)
      }
    }

    /**
     * Build Checks for multiple tokens
     * @private
     * @param {string} actionType
     * @param {string} groupId
     */
    #buildMultiTokenChecks (actionType, groupId) {
      try {
        // Check if we have valid actors with check data
        const validActors = this.actors.filter(
          (actor) =>
            actor?.system?.checks &&
            Object.keys(actor.system.checks).length > 0
        )

        if (validActors.length === 0) {
          console.warn('No selected actors have valid check data')
          return
        }

        // Get check IDs from the first valid actor (assuming all actors have the same checks)
        const referenceActor = validActors[0]

        if (!referenceActor?.system?.checks) {
          console.warn('Reference actor is missing system.checks property')
          return
        }

        const checkIds = Object.keys(referenceActor.system.checks)

        if (checkIds.length === 0) {
          console.warn('Reference actor has no checks defined')
          return
        }

        const actions = checkIds
          .map((checkId) => {
            try {
              const capitalizedCheckId =
                checkId.charAt(0).toUpperCase() + checkId.slice(1)
              const translationKey = `DS4.Checks${capitalizedCheckId}`
              const id = `multitoken-${actionType}-${checkId}`
              const name = coreModule.api.Utils.i18n(translationKey)
              let img = ''

              // Safely access the icon if it exists
              try {
                img = CONFIG.DS4?.icons?.checks?.[checkId] || ''
              } catch (iconError) {
                console.warn(
                  `Could not find icon for check: ${checkId}`,
                  iconError
                )
              }

              const listName = `${actionType}${coreModule.api.Utils.i18n(`DS4.Checks${checkId}`)}`
              const encodedValue = ['multitoken', actionType, checkId].join(
                this.delimiter
              )

              // For multiple tokens, use a descriptive label to indicate multi-roll
              return {
                id,
                name,
                img,
                encodedValue,
                listName
              }
            } catch (innerError) {
              console.error(
                `Error building action for check ${checkId}: ${innerError.message}`
              )
              return null
            }
          })
          .filter((action) => action !== null) // Filter out any null actions

        if (actions.length === 0) {
          console.warn(
            'No valid actions were created for multiple token checks'
          )
          return
        }

        // Add a "Checks" header/group for multiple tokens
        const groupData = { id: groupId, type: 'system' }
        this.addActions(actions, groupData)
      } catch (error) {
        console.error(`Error building multiple token checks: ${error.message}`)
      }
    }

    /**
     * Build Spells
     * @private
     * @param {string} groupId
     * @param {string[]} itemTypes
     */
    #buildSpells (groupId, itemTypes) {
      try {
        this.#buildSpellsByType(
          groupId,
          itemTypes,
          'spellcasting',
          'spellcasting'
        )
        this.#buildSpellsByType(
          groupId,
          itemTypes,
          'targetedSpellcasting',
          'targeted_spellcasting'
        )
      } catch (error) {
        console.error(`Error building spells: ${error.message}`)
      }
    }

    /**
     * Build Spells by type
     * @private
     * @param {string} groupId - The group ID
     * @param {string[]} itemTypes - Array of item types to include
     * @param {string} spellType - Type of spell ("spellcasting" or "targetedSpellcasting")
     * @param {string} groupDataId - ID for the group data
     */
    #buildSpellsByType (groupId, itemTypes, spellType, groupDataId) {
      try {
        if (!this.actor?.system?.combatValues?.[spellType]?.total) {
          console.warn(`Actor is missing combatValues.${spellType}`)
          return
        }

        if (!this.actor.items) {
          console.warn('Actor has no items')
          return
        }

        const actionType = groupId
        const actions = Object.entries(
          this.actor.items.filter(
            (el) =>
              itemTypes.includes(el.type) &&
              el.system.spellType === spellType &&
              (this.displayUnequipped || el.system.equipped === true)
          )
        ).map((item) => {
          const itemId = item[1].id
          const id = `${actionType}-${item[1].id}`
          const label = item[1].name
          const name = item[1].name
          const listName = `${actionType}${label}`
          const encodedValue = [actionType, itemId].join(this.delimiter)
          const img = item[1].img
          // Get base spell value
          let spellValue =
            this.actor.system.combatValues[spellType].total.valueOf()

          // Add numerical modifier if it exists on the item
          try {
            const numericalMod = item[1].system.spellModifier?.numerical
            if (numericalMod !== undefined) {
              const numericValue = Number(numericalMod)
              if (isNaN(numericValue)) {
                throw new Error(
                  `Item spell modifier "${numericalMod}" cannot be converted to a number`
                )
              }
              spellValue += numericValue
            }
          } catch (error) {
            console.error(
              `Error processing spell modifier for ${item[1].name}: ${error.message}`
            )
          }

          const infoText = {
            text: spellValue,
            class: 'custominfo'
          }
          const cssClass = ''
          return {
            id,
            name,
            encodedValue,
            info1: infoText,
            img,
            cssClass,
            listName
          }
        // Sort actions alphabetically by listName for easier navigation
        }).sort((a, b) => a.listName.localeCompare(b.listName))
        const groupData = { id: groupDataId, type: 'system' }
        this.addActions(actions, groupData)
      } catch (error) {
        console.error(`Error building ${spellType} spells: ${error.message}`)
      }
    }

    /**
     * Build Weapons
     * @private
     * @param {string} groupId
     * @param {string[]} itemTypes
     */
    #buildWeapons (groupId, itemTypes) {
      try {
        this.#buildWeaponsByType(groupId, itemTypes, 'melee', 'melee')
        this.#buildWeaponsByType(groupId, itemTypes, 'ranged', 'ranged')
      } catch (error) {
        console.error(`Error building weapons: ${error.message}`)
      }
    }

    /**
     * Build Weapons by type
     * @private
     * @param {string} groupId - The group ID
     * @param {string[]} itemTypes - Array of item types to include
     * @param {string} attackType - Type of attack ("melee" or "ranged")
     * @param {string} groupDataId - ID for the group data
     */
    #buildWeaponsByType (groupId, itemTypes, attackType, groupDataId) {
      try {
        if (!this.actor?.system?.combatValues?.[`${attackType}Attack`]?.total) {
          console.warn(`Actor is missing combatValues.${attackType}Attack`)
          return
        }

        const actionType = groupId
        const attackValue =
          this.actor.system.combatValues[`${attackType}Attack`].total

        if (!this.actor.items) {
          console.warn('Actor has no items')
          return
        }

        const actions = Object.entries(
          this.actor.items.filter(
            (el) =>
              itemTypes.includes(el.type) &&
              el.system.attackType === attackType &&
              (this.displayUnequipped || el.system.equipped === true)
          )
        ).map((item) => {
          const itemId = item[1].id
          const id = `${actionType}-${item[1].id}`
          const label = item[1].name
          const name = item[1].name
          const listName = `${actionType}${label}`
          const encodedValue = [actionType, itemId].join(this.delimiter)
          const img = item[1].img
          const weaponBonus = item[1].system.weaponBonus || 0
          const infoText = {
            text: attackValue + weaponBonus,
            class: 'custominfo'
          }
          const cssClass = ''
          return {
            id,
            name,
            encodedValue,
            info1: infoText,
            img,
            cssClass,
            listName
          }
        // Sort actions alphabetically by listName for easier navigation
        }).sort((a, b) => a.listName.localeCompare(b.listName))
        const groupData = { id: groupDataId, type: 'system' }
        this.addActions(actions, groupData)
      } catch (error) {
        console.error(`Error building ${attackType} weapons: ${error.message}`)
      }
    }
  }
})
