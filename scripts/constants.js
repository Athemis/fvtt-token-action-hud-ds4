/**
 * Module-based constants
 * @type {{ID: string}}
 */
export const MODULE = {
  ID: "token-action-hud-ds4",
};

/**
 * Core module
 * @type {{ID: string}}
 */
export const CORE_MODULE = {
  ID: "token-action-hud-core",
};

/**
 * Core module version required by the system module
 * @type {string}
 */
export const REQUIRED_CORE_MODULE_VERSION = "2.0";

/**
 * Groups configuration for the Token Action HUD
 * @type {Object<string, {id: string, name: string, type: string, listName?: string}>}
 */
export const GROUP = {
  spellcasting: {
    id: "spellcasting",
    name: "DS4.CombatValuesSpellcasting",
    type: "system",
  },
  targeted_spellcasting: {
    id: "targeted_spellcasting",
    name: "DS4.CombatValuesTargetedSpellcasting",
    type: "system",
  },
  melee: {
    id: "melee",
    name: "DS4.AttackTypeMelee",
    type: "system",
  },
  ranged: {
    id: "ranged",
    name: "DS4.AttackTypeRanged",
    type: "system",
  },
  checks: {
    id: "checks",
    name: "DS4.Checks",
    type: "system",
  },
  token: { 
    id: "token", 
    name: "tokenActionHud.token", 
    type: "system" 
  },
};
