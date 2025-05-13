// System Module Imports
import { Utils } from "./utils.js";

export let ActionHandler = null;

Hooks.once("tokenActionHudCoreApiReady", async (coreModule) => {
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
    async buildSystemActions(groupIds) {
      // Set actor and token variables
      this.actors = !this.actor ? this._getActors() : [this.actor];
      this.actorType = this.actor?.type;

      // Settings
      this.displayUnequipped = Utils.getSetting("displayUnequipped");

      // Set items variable
      if (this.actor) {
        let items = this.actor.items;
        items = coreModule.api.Utils.sortItemsByName(items);
        this.items = items;
      }

      if (this.actorType === "character" || this.actorType === "creature") {
        this.#buildCharacterActions();
      } else if (!this.actor) {
        this.#buildMultipleTokenActions();
      }
    }

    /**
     * Build character actions
     * @private
     */
    #buildCharacterActions() {
      this.#buildWeapons("item", ["weapon"]);
      this.#buildSpells("item", ["spell"]);
      this.#buildChecks("check", "checks");
    }

    /**
     * Build multiple token actions
     * @private
     * @returns {object}
     */
    #buildMultipleTokenActions() {}

    /**
     * Build Skills
     * @private
     * @param {string} actionType
     * @param {string} groupId
     */
    #buildChecks(actionType, groupId) {
      const actions = Object.entries(this.actor.system.checks).map((check) => {
        const checkId = check[0];
        const id = `${actionType}-${checkId}`;
        const label = coreModule.api.Utils.i18n(
          `DS4.Checks${checkId.charAt(0).toUpperCase() + checkId.slice(1)}`,
        );
        const name = coreModule.api.Utils.i18n(
          `DS4.Checks${checkId.charAt(0).toUpperCase() + checkId.slice(1)}`,
        );
        const img = CONFIG.DS4.icons.checks[checkId];
        const listName = `${actionType}${coreModule.api.Utils.i18n(`DS4.Checks${checkId}`)}`;
        const encodedValue = [actionType, checkId].join(this.delimiter);
        const infoText = { text: check[1].valueOf() };
        return {
          id,
          name,
          img,
          encodedValue,
          info1: infoText,
          listName,
        };
      });
      const groupData = { id: groupId, type: "system" };
      console.log(actions, groupData);
      this.addActions(actions, groupData);
    }

    /**
     * Build Spells
     * @private
     * @param {string} groupId
     * @param {string} itemTypes
     */
    #buildSpells(groupId, itemTypes) {
      this.#buildSpellcastingSpells(groupId, itemTypes);
      this.#buildTargetedSpellcastingSpells(groupId, itemTypes);
    }

    /**
     * Build Spellcasting Spells
     * @private
     * @param {string} groupId
     * @param {string} itemTypes
     */
    #buildSpellcastingSpells(groupId, itemTypes) {
      const actionType = groupId;
      const actions = Object.entries(
        this.actor.items.filter(
          (el) =>
            itemTypes.includes(el.type) &&
            el.system.spellType === "spellcasting" &&
            (this.displayUnequipped || el.system.equipped === true),
        ),
      ).map((item) => {
        const itemId = item[1].id;
        const id = `${actionType}-${item[1].id}`;
        const label = item[1].name;
        const name = item[1].name;
        const listName = `${actionType}${label}`;
        const encodedValue = [actionType, itemId].join(this.delimiter);
        const img = item[1].img;
        const infoText = {
          text: this.actor.system.combatValues.spellcasting.total.valueOf(),
          class: "custominfo",
        };
        const cssClass = "";
        return {
          id,
          name,
          encodedValue,
          info1: infoText,
          img,
          cssClass,
          listName,
        };
      });
      const groupData = { id: "spellcasting", type: "system" };
      this.addActions(actions, groupData);
    }

    /**
     * Build Targeted Spellcasting Spells
     * @private
     * @param {string} groupId
     * @param {string} itemTypes
     */
    #buildTargetedSpellcastingSpells(groupId, itemTypes) {
      const actionType = groupId;
      const actions = Object.entries(
        this.actor.items.filter(
          (el) =>
            itemTypes.includes(el.type) &&
            el.system.spellType === "targetedSpellcasting" &&
            (this.displayUnequipped || el.system.equipped === true),
        ),
      ).map((item) => {
        const itemId = item[1].id;
        const id = `${actionType}-${item[1].id}`;
        const label = item[1].name;
        const name = item[1].name;
        const listName = `${actionType}${label}`;
        const encodedValue = [actionType, itemId].join(this.delimiter);
        const img = item[1].img;
        const infoText = {
          text: this.actor.system.combatValues.targetedSpellcasting.total.valueOf(),
          class: "custominfo",
        };
        const cssClass = "";
        return {
          id,
          name,
          encodedValue,
          info1: infoText,
          img,
          cssClass,
          listName,
        };
      });
      const groupData = { id: "targeted_spellcasting", type: "system" };
      this.addActions(actions, groupData);
    }

    /**
     * Build Weapons
     * @private
     * @param {string} groupId
     * @param {string} itemTypes
     */
    #buildWeapons(groupId, itemTypes) {
      this.#buildMeleeWeapons(groupId, itemTypes);
      this.#buildRangedWeapons(groupId, itemTypes);
    }

    /**
     * Build Melee Weapons
     * @private
     * @param {string} groupId
     * @param {string} itemTypes
     */
    #buildMeleeWeapons(groupId, itemTypes) {
      const actionType = groupId;
      const meleeAttack = this.actor.system.combatValues.meleeAttack.total;
      const actions = Object.entries(
        this.actor.items.filter(
          (el) =>
            itemTypes.includes(el.type) &&
            el.system.attackType === "melee" &&
            (this.displayUnequipped || el.system.equipped === true),
        ),
      ).map((item) => {
        const itemId = item[1].id;
        const id = `${actionType}-${item[1].id}`;
        const label = item[1].name;
        const name = item[1].name;
        const listName = `${actionType}${label}`;
        const encodedValue = [actionType, itemId].join(this.delimiter);
        const img = item[1].img;
        const weaponBonus = item[1].system.weaponBonus;
        const infoText = {
          text: meleeAttack + weaponBonus,
          class: "custominfo",
        };
        const cssClass = "";
        return {
          id,
          name,
          encodedValue,
          info1: infoText,
          img,
          cssClass,
          listName,
        };
      });
      const groupData = { id: "melee", type: "system" };
      this.addActions(actions, groupData);
    }

    /**
     * Build Ranged Weapons
     * @private
     * @param {string} groupId
     * @param {string} itemTypes
     */
    #buildRangedWeapons(groupId, itemTypes) {
      const actionType = groupId;
      const rangedAttack = this.actor.system.combatValues.rangedAttack.total;
      const actions = Object.entries(
        this.actor.items.filter(
          (el) =>
            itemTypes.includes(el.type) &&
            el.system.attackType === "ranged" &&
            (this.displayUnequipped || el.system.equipped === true),
        ),
      ).map((item) => {
        const itemId = item[1].id;
        const id = `${actionType}-${item[1].id}`;
        const label = item[1].name;
        const name = item[1].name;
        const listName = `${actionType}${label}`;
        const encodedValue = [actionType, itemId].join(this.delimiter);
        const img = item[1].img;
        const weaponBonus = item[1].system.weaponBonus;
        const infoText = {
          text: rangedAttack + weaponBonus,
          class: "custominfo",
        };
        const cssClass = "";
        return {
          id,
          name,
          encodedValue,
          info1: infoText,
          img,
          cssClass,
          listName,
        };
      });
      const groupData = { id: "ranged", type: "system" };
      this.addActions(actions, groupData);
    }
  };
});
