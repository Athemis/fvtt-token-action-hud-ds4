import { SystemManager } from './system-manager.js'
import { MODULE, REQUIRED_CORE_MODULE_VERSION } from './constants.js'

Hooks.on('tokenActionHudCoreApiReady', async () => {
  /**
     * Return the SystemManager and requiredCoreModuleVersion to Token Action HUD Core
     */
  try {
    const module = game.modules.get(MODULE.ID)
    if (!module) {
      console.error(`${MODULE.ID} module not found`)
      return
    }

    module.api = {
      requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
      SystemManager
    }

    Hooks.call('tokenActionHudSystemReady', module)
    console.log(`${MODULE.ID} | System ready`)
  } catch (error) {
    console.error(`${MODULE.ID} | Error initializing module:`, error)
  }
})

// Log initialization
Hooks.once('init', () => {
  console.log(`${MODULE.ID} | Initializing DS4 Token Action HUD`)
})
