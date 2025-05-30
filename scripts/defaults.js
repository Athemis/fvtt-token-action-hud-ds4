import { GROUP } from './constants.js'

/**
 * Default layout and groups
 * @type {Object|null}
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
  try {
    const groups = GROUP
    Object.values(groups).forEach((group) => {
      group.name = coreModule.api.Utils.i18n(group.name)
      group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`
    })
    const groupsArray = Object.values(groups)
    DEFAULTS = {
      layout: [
        {
          nestId: 'weapons',
          id: 'weapons',
          name: coreModule.api.Utils.i18n('DS4.ItemTypeWeaponPlural'),
          groups: [
            { ...groups.melee, nestId: 'weapons_melee' },
            { ...groups.ranged, nestId: 'weapons_ranged' }
          ]
        },
        {
          nestId: 'spells',
          id: 'spells',
          name: coreModule.api.Utils.i18n('DS4.ItemTypeSpellPlural'),
          groups: [
            { ...groups.spellcasting, nestId: 'spells_spellcasting' },
            {
              ...groups.targeted_spellcasting,
              nestId: 'spells_tspellcasting'
            }
          ]
        },
        {
          nestId: 'checks',
          id: 'checks',
          name: coreModule.api.Utils.i18n('DS4.Checks'),
          groups: [{ ...groups.checks, nestId: 'checks_checks' }]
        },
        {
          nestId: 'utility',
          id: 'utility',
          name: coreModule.api.Utils.i18n('tokenActionHud.utility'),
          groups: [{ ...groups.token, nestId: 'utility_token' }]
        }
      ],
      groups: groupsArray
    }
  } catch (error) {
    console.error(`Error setting up default layout: ${error.message}`)
  }
})
