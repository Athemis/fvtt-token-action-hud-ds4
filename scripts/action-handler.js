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
      this.#buildSkills("check", "checks");
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
    #buildSkills(actionType, groupId) {
      const actions = Object.entries(this.actor.system.checks).map(
        (ability) => {
          const abilityId = ability[0];
          const id = `${actionType}-${abilityId}`;
          const label = coreModule.api.Utils.i18n(
            `DS4.Checks${abilityId.charAt(0).toUpperCase() + abilityId.slice(1)}`,
          );
          const name = coreModule.api.Utils.i18n(
            `DS4.Checks${abilityId.charAt(0).toUpperCase() + abilityId.slice(1)}`,
          );
          const img = CONFIG.DS4.icons.checks[abilityId];
          const listName = `${actionType}${coreModule.api.Utils.i18n(`DS4.Checks${abilityId}`)}`;
          const encodedValue = [actionType, abilityId].join(this.delimiter);
          const info1 = { text: ability[1].value };
          return {
            id,
            name,
            img,
            encodedValue,
            info1,
            listName,
          };
        },
      );
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
        const abilityId = item[1].id;
        const id = `${actionType}-${item[1].id}`;
        const label = item[1].name;
        const name = item[1].name;
        const listName = `${actionType}${label}`;
        const encodedValue = [actionType, abilityId].join(this.delimiter);
        const img = item[1].img;
        const info2 = {
          text: "",
          class: "custominfo",
        };
        const cssClass = "";
        return {
          id,
          name,
          encodedValue,
          info2,
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
        const abilityId = item[1].id;
        const id = `${actionType}-${item[1].id}`;
        const label = item[1].name;
        const name = item[1].name;
        const listName = `${actionType}${label}`;
        const encodedValue = [actionType, abilityId].join(this.delimiter);
        const img = item[1].img;
        const info2 = {
          text: "",
          class: "custominfo",
        };
        const cssClass = "";
        return {
          id,
          name,
          encodedValue,
          info2,
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
      const actions = Object.entries(
        this.actor.items.filter(
          (el) =>
            itemTypes.includes(el.type) &&
            el.system.attackType === "melee" &&
            (this.displayUnequipped || el.system.equipped === true),
        ),
      ).map((item) => {
        const abilityId = item[1].id;
        const id = `${actionType}-${item[1].id}`;
        const label = item[1].name;
        const name = item[1].name;
        const listName = `${actionType}${label}`;
        const encodedValue = [actionType, abilityId].join(this.delimiter);
        const img = item[1].img;
        const info2 = {
          text: (() => {
            // Check if weaponBonus exists
            const hasWeaponBonus = item[1].system?.weaponBonus !== undefined;
            const weaponBonusText = hasWeaponBonus
              ? `${item[1].system.weaponBonus}`
              : "";

            // Check if opponentDefense exists
            const hasOpponentDefense =
              item[1].system?.opponentDefense !== undefined;
            const opponentDefenseText = hasOpponentDefense
              ? `${item[1].system.opponentDefense}`
              : "";

            // Construct info text accordingly in format 'weaponBonus/opponentDefense'
            // Replace missing or undefined values with zeros
            if (hasWeaponBonus && hasOpponentDefense) {
              return `${weaponBonusText}/${opponentDefenseText}`;
            } else if (hasWeaponBonus) {
              return weaponBonusText + "/0";
            } else if (hasOpponentDefense) {
              return "0/" + opponentDefenseText;
            } else {
              return "";
            }
          })(),
          class: "custominfo",
        };
        const cssClass = "";
        return {
          id,
          name,
          encodedValue,
          info2,
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

      const actions = Object.entries(
        this.actor.items.filter(
          (el) =>
            itemTypes.includes(el.type) &&
            el.system.attackType === "ranged" &&
            (this.displayUnequipped || el.system.equipped === true),
        ),
      ).map((item) => {
        const abilityId = item[1].id;
        const id = `${actionType}-${item[1].id}`;
        const label = item[1].name;
        const name = item[1].name;
        const listName = `${actionType}${label}`;
        const encodedValue = [actionType, abilityId].join(this.delimiter);
        const img = item[1].img;
        const info2 = {
          text: (() => {
            // Check if weaponBonus exists
            const hasWeaponBonus = item[1].system?.weaponBonus !== undefined;
            const weaponBonusText = hasWeaponBonus
              ? `${item[1].system.weaponBonus}`
              : "";
            // Check if opponentDefense exists
            const hasOpponentDefense =
              item[1].system?.opponentDefense !== undefined;
            const opponentDefenseText = hasOpponentDefense
              ? `${item[1].system.opponentDefense}`
              : "";

            // Construct info text accordingly in format 'weaponBonus/opponentDefense'
            // Replace missing or undefined values with zeros
            if (hasWeaponBonus && hasOpponentDefense) {
              return `${weaponBonusText}/${opponentDefenseText}`;
            } else if (hasWeaponBonus) {
              return weaponBonusText + "/0";
            } else if (hasOpponentDefense) {
              return "0/" + opponentDefenseText;
            } else {
              return "";
            }
          })(),
          class: "custominfo",
        };
        const cssClass = "";
        return {
          id,
          name,
          encodedValue,
          info2,
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
