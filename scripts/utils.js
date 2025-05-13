import { MODULE } from './constants.js'

export let Utils = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Utility functions
     */
    Utils = class Utils {
        /**
         * Get setting
         * @param {string} key               The key
         * @param {string=null} defaultValue The default value
         * @returns {string}                 The setting value
         */
        static getSetting (key, defaultValue = null) {
            let value = defaultValue ?? null
            try {
                value = game.settings.get(MODULE.ID, key)
            } catch (error) {
                coreModule.api.Logger.debug(`Error fetching setting '${key}': ${error.message}`)
            }
            return value
        }

        /**
         * Set setting
         * @param {string} key   The key
         * @param {string} value The value
         * @returns {Promise<string|null>} The updated value or null if there was an error
         */
        static async setSetting (key, value) {
            try {
                const result = await game.settings.set(MODULE.ID, key, value)
                coreModule.api.Logger.debug(`Setting '${key}' successfully set to '${value}'`)
                return result
            } catch (error) {
                coreModule.api.Logger.error(`Error setting '${key}': ${error.message}`)
                return null
            }
        }
        
        /**
         * Validates if an object has the expected properties
         * @param {object} obj - The object to validate
         * @param {string[]} requiredProps - Array of required property names
         * @returns {boolean} True if the object has all required properties
         */
        static validateObject(obj, requiredProps) {
            if (!obj || typeof obj !== 'object') return false
            return requiredProps.every(prop => prop in obj)
        }
    }
})
