// System Module Imports
import { ActionHandler } from './action-handler.js'
import { RollHandler as Core } from './roll-handler.js'
import { MODULE } from './constants.js'
import { DEFAULTS } from './defaults.js'
import * as systemSettings from './settings.js'

export let SystemManager = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
  /**
     * Extends Token Action HUD Core's SystemManager class
     */
  SystemManager = class SystemManager extends coreModule.api.SystemManager {
    /**
         * Returns an instance of the ActionHandler to Token Action HUD Core
         * Called by Token Action HUD Core
         * @override
         * @returns {ActionHandler} The ActionHandler instance
         */
    getActionHandler () {
      return new ActionHandler()
    }

    /**
         * Returns a list of roll handlers to Token Action HUD Core
         * Used to populate the Roll Handler module setting choices
         * Called by Token Action HUD Core
         * @override
         * @returns {Record<string, string>} The available roll handlers
         */
    getAvailableRollHandlers () {
      const coreTitle = 'Core Template'
      const choices = { core: coreTitle }
      return choices
    }

    /**
         * Returns an instance of the RollHandler to Token Action HUD Core
         * Called by Token Action HUD Core
         * @override
         * @param {string} rollHandlerId The roll handler ID
         * @returns {Core}               The RollHandler instance
         */
    getRollHandler (rollHandlerId) {
      let rollHandler
      switch (rollHandlerId) {
        case 'core':
        default:
          rollHandler = new Core()
          break
      }
      return rollHandler
    }

    /**
         * Returns the default layout and groups to Token Action HUD Core
         * Called by Token Action HUD Core
         * @override
         * @returns {Promise<object>} The default layout and groups
         */
    async registerDefaults () {
      return DEFAULTS
    }

    /**
         * Register Token Action HUD system module settings
         * Called by Token Action HUD Core
         * @override
         * @param {function} coreUpdate The Token Action HUD Core update function
         */
    registerSettings (coreUpdate) {
      systemSettings.register(coreUpdate)
    }

    /**
         * Returns styles to Token Action HUD Core
         * Called by Token Action HUD Core
         * @override
         * @returns {{template: {class: string, file: string, moduleId: string, name: string}}} The TAH system styles
         */
    registerStyles () {
      return {
        template: {
          class: 'tah-style-ds4-style', // The class to add to first DIV element
          file: 'tah-ds4-style', // The file without the css extension
          moduleId: MODULE.ID, // The module ID
          name: 'DS4 Style' // The name to display in the Token Action HUD Core 'Style' module setting
        }
      }
    }
  }
})
