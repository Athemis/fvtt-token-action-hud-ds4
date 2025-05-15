import { MODULE } from './constants.js'

/**
 * Register module settings
 * Called by Token Action HUD Core to register Token Action HUD system module settings
 * @param {function} coreUpdate Token Action HUD Core update function
 */
export function register (coreUpdate) {
  try {
    game.settings.register(MODULE.ID, 'displayUnequipped', {
      name: game.i18n.localize(
        'tokenActionHud.ds4.settings.displayUnequipped.name'
      ),
      hint: game.i18n.localize(
        'tokenActionHud.ds4.settings.displayUnequipped.hint'
      ),
      scope: 'client',
      config: true,
      type: Boolean,
      default: false,
      onChange: (value) => {
        try {
          coreUpdate(value)
        } catch (error) {
          console.error(`Error in displayUnequipped onChange: ${error.message}`)
        }
      }
    })
  } catch (error) {
    console.error(`Error registering settings: ${error.message}`)
  }
}
