/**
 * Module-based constants
 */
export const MODULE = {
  ID: "token-action-hud-ds4",
};

/**
 * Core module
 */
export const CORE_MODULE = {
  ID: "token-action-hud-core",
};

/**
 * Core module version required by the system module
 */
export const REQUIRED_CORE_MODULE_VERSION = "2.0";

/**
 * Groups
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
  token: { id: "token", name: "tokenActionHud.token", type: "system" },
};
