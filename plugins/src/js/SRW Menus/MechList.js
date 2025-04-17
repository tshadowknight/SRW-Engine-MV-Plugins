import Window_CSS from "./Window_CSS.js";
import "./style/MechList.css";

export default function MechList(container, pages, unitProvider){
	this._container = container;
	this._usedPages = pages;
	this._unitProvider = unitProvider;
	this._currentInfoPage = 0;
	if(this._usedPages){
		this._currentInfoPage = this._usedPages[0];
	}	
	this._currentPage = 0;	
	this._currentSelection = 0;
	this._maxPageSize = 5;
	this._currentSortIdx = -1;
	
	this.defineContent();
	this._maxInfoPage = Object.keys(this._pageInfo).length;
	this._sortDirection = 1;
	this._touchObservers = {};
	this._observers = {};
}


MechList.prototype = Object.create(Window_CSS.prototype);
MechList.prototype.constructor = MechList;

var Window_CSS_getAvailableUnits = Window_CSS.prototype.getAvailableUnits;
MechList.prototype.getAvailableUnits = function(){
	if(this._unitProvider){
		return this._unitProvider.getAvailableUnits();
	} else {
		return Window_CSS_getAvailableUnits.call(this);
	}
}

MechList.prototype.rowEnabled = function(actor){
	if(this._unitProvider){
		return this._unitProvider.rowEnabled(actor);
	} else {
		return true;
	}
}

MechList.prototype.setCurrentSelection = function(value){
	this._currentSelection = value;
}


MechList.prototype.setMaxPageSize = function(amount){
	this._maxPageSize = amount;
}

MechList.prototype.isPageUsed = function(idx){
	if(!this._usedPages || this._usedPages.indexOf(idx) != -1){
		return true;
	}
}

MechList.prototype.defineContent = function(){
	var _this = this;
	function createReferenceData(mech){
		return {
			SRWStats: {
				pilot: {
					abilities: []
				},
				mech: mech
			},
			SRWInitialized: true
		}	
	}
	function mechIcon(pilot, mech){
		if(!mech.classData){
			return "";
		}
		return "<div class='list_mech_icon' data-mech='"+mech.classData.id+"'></div>";
	}
	function mechName(pilot, mech){
		if(!mech.classData){
			return "";
		}
		return mech.classData.name;
	}
	function mechTeam(pilot, mech){
		var result = "";						
		var deploySlot = -1;
		if(!pilot.isEmpty){
			deploySlot = $statCalc.getCurrentDeploySlot(pilot.actorId());
		}
		if(deploySlot != -1){
			result+=(deploySlot*1) + 1;
		} else {
			result+="--";
		}	
		return result;
	}
	function getUnitData(unit){
		return {pilot: unit, mech: unit.SRWStats.mech};
	}
	function compareMechName(a, b){
		var customSort = {};
		if(ENGINE_SETTINGS.CUSTOM_MECH_NAME_SORT){
			customSort = ENGINE_SETTINGS.CUSTOM_MECH_NAME_SORT;
		} 
		var nameA;
		var unitData = getUnitData(a).mech.classData;
		if(!unitData){
			nameA = "";
		} else {
			if(customSort[unitData.id]){
				nameA = customSort[unitData.id];
			} else {
				nameA = unitData.name;
			}			
		}
		
		var nameB;
		var unitData = getUnitData(b).mech.classData;
		if(!unitData){
			nameB = "";
		} else {
			if(customSort[unitData.id]){
				nameB = customSort[unitData.id];
			} else {
				nameB = unitData.name;
			}			
		}
		return nameA.localeCompare(nameB) * _this._sortDirection;
	}
	function compareMechTeam(a, b){
		var result;
		var aVal = mechTeam(getUnitData(a).pilot);
		var bVal = mechTeam(getUnitData(b).pilot);
		if(aVal == "--" && bVal == "--"){
			result = 0;
		} else if(aVal == "--"){
			result = -1;
		} else if(bVal == "--"){
			result = 1;
		} else {
			result = aVal - bVal;
		}
		return result * _this._sortDirection;
	}
	function hasActiveMechAbilities(mech, list){
		var ctr = 0;
		var result = false;
		while(!result && ctr < list.length){
			result = $statCalc.applyStatModsToValue(createReferenceData(mech), 0, list[ctr++]);
		}
		return result ? true : false;
	}
	function compareMechAbilities(a, b, abilities){
		var aHasAbility = hasActiveMechAbilities(getUnitData(a).mech, abilities);
		var bHasAbility = hasActiveMechAbilities(getUnitData(b).mech, abilities);
		var result;
		if(aHasAbility == bHasAbility){
			result = 0;
		} else if(aHasAbility){
			result = -1;
		} else if(bHasAbility){
			result = 1;
		}
		return result * _this._sortDirection;
	}
	this._pageInfo = {
		0: {
			cssClass: "pilot_stats", 
			title: APPSTRINGS.MECHLIST.tab_pilot_level,
			sortStart: 1,
			content: [
				{
					title: "",
					contentFunction: mechIcon,
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_mech,
					contentFunction: mechName,
					compareFunction: compareMechName
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_team,
					contentFunction: mechTeam,
					compareFunction: compareMechTeam
				}, 
				{
					title: "",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return "<div class='list_pilot_icon' data-pilot='"+pilot.actorId()+"'></div>";
					},
					noSort: true
				},
				{
					title:  APPSTRINGS.MECHLIST.column_pilot,
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return pilot.name()
					},
					compareFunction: function(a, b){
						var nameA = getUnitData(a).pilot.name();
						var nameB = getUnitData(b).pilot.name();
						return nameA.localeCompare(nameB) * _this._sortDirection;
					}
				},
				{
					title: "Lv",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return $statCalc.getCurrentLevel(pilot);
					},
					compareFunction: function(a, b){
						return $statCalc.getCurrentLevel(getUnitData(a).pilot) - $statCalc.getCurrentLevel(getUnitData(b).pilot)  * _this._sortDirection;						
					}
				}
			]
		},
		1: {
			cssClass: "mech_stats_1", 
			title: APPSTRINGS.MECHLIST.tab_mech_stats,
			sortStart: 1,
			content: [
				{
					title: "",
					contentFunction: mechIcon,
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_mech,
					contentFunction: mechName,
					compareFunction: compareMechName
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_team,
					contentFunction: mechTeam,
					compareFunction: compareMechTeam
				}, 
				{
					title: "HP",
					contentFunction: function(pilot, mech){
						return mech.stats.calculated.maxHP;
					},
					compareFunction: function(a, b){
						return (getUnitData(a).mech.stats.calculated.maxHP - getUnitData(b).mech.stats.calculated.maxHP) * _this._sortDirection;						
					}
				},
				{
					title: "EN",
					contentFunction: function(pilot, mech){						
						return mech.stats.calculated.maxEN;
					},
					compareFunction: function(a, b){
						return (getUnitData(a).mech.stats.calculated.maxEN - getUnitData(b).mech.stats.calculated.maxEN) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.MECHSTATS.move,
					contentFunction: function(pilot, mech){					
						return mech.stats.calculated.move;
					},
					compareFunction: function(a, b){
						return (getUnitData(a).mech.stats.calculated.move - getUnitData(b).mech.stats.calculated.move) * _this._sortDirection;						
					}
				}
			]
		},
		2: {
			cssClass: "mech_stats_2", 
			title: APPSTRINGS.MECHLIST.tab_mech_stats,
			sortStart: 1,
			content: [
				{
					title: "",
					contentFunction: mechIcon,
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_mech,
					contentFunction: mechName,
					compareFunction: compareMechName
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_team,
					contentFunction: mechTeam,
					compareFunction: compareMechTeam
				}, 
				{
					title: APPSTRINGS.MECHSTATS.armor,
					contentFunction: function(pilot, mech){
						return mech.stats.calculated.armor;
					},
					compareFunction: function(a, b){
						return (getUnitData(a).mech.stats.calculated.armor - getUnitData(b).mech.stats.calculated.armor) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.MECHSTATS.mobility,
					contentFunction: function(pilot, mech){						
						return mech.stats.calculated.mobility;
					},
					compareFunction: function(a, b){
						return (getUnitData(a).mech.stats.calculated.mobility - getUnitData(b).mech.stats.calculated.mobility) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.MECHSTATS.accuracy,
					contentFunction: function(pilot, mech){					
						return mech.stats.calculated.accuracy;
					},
					compareFunction: function(a, b){
						return (getUnitData(a).mech.stats.calculated.accuracy - getUnitData(b).mech.stats.calculated.accuracy) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.GENERAL.label_AIR,
					contentFunction: function(pilot, mech){					
						return mech.stats.calculated.terrain.air;
					},
					compareFunction: function(a, b){
						return (getUnitData(a).mech.stats.calculated.terrain.air.localeCompare(getUnitData(b).mech.stats.calculated.terrain.air)) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.GENERAL.label_LND,
					contentFunction: function(pilot, mech){					
						return mech.stats.calculated.terrain.land;
					},
					compareFunction: function(a, b){
						return (getUnitData(a).mech.stats.calculated.terrain.land.localeCompare(getUnitData(b).mech.stats.calculated.terrain.land)) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.GENERAL.label_SEA,
					contentFunction: function(pilot, mech){					
						return mech.stats.calculated.terrain.water;
					},
					compareFunction: function(a, b){
						return (getUnitData(a).mech.stats.calculated.terrain.water.localeCompare(getUnitData(b).mech.stats.calculated.terrain.water)) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.GENERAL.label_SPC,
					contentFunction: function(pilot, mech){					
						return mech.stats.calculated.terrain.space;
					},
					compareFunction: function(a, b){
						return (getUnitData(a).mech.stats.calculated.terrain.space.localeCompare(getUnitData(b).mech.stats.calculated.terrain.space)) * _this._sortDirection;						
					}
				}
			]
		},
		3: {
			cssClass: "mech_ability", 
			title: APPSTRINGS.MECHLIST.tab_mech_ability,
			sortStart: 1,
			content: [
				{
					title: "",
					contentFunction: mechIcon,
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_mech,
					contentFunction: mechName,
					compareFunction: compareMechName
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_team,
					contentFunction: mechTeam,
					compareFunction: compareMechTeam
				}, 
				{
					title: APPSTRINGS.MECHSTATS.repair,
					contentFunction: function(pilot, mech){
						if(hasActiveMechAbilities(mech, ["heal"])){
							return "Y";
						} else {
							return "N";
						}
					},
					compareFunction: function(a, b){
						return compareMechAbilities(a, b, ["heal"]);
					}
				},
				{
					title: APPSTRINGS.MECHSTATS.resupply,
					contentFunction: function(pilot, mech){						
						if(hasActiveMechAbilities(mech, ["resupply"])){
							return "Y";
						} else {
							return "N";
						}
					},
					compareFunction: function(a, b){
						return compareMechAbilities(a, b, ["resupply"]);
					}
				},
				{
					title: APPSTRINGS.MECHSTATS.shield,
					contentFunction: function(pilot, mech){					
						if(hasActiveMechAbilities(mech, ["shield"])){
							return "Y";
						} else {
							return "N";
						}
					},
					compareFunction: function(a, b){
						return compareMechAbilities(a, b, ["shield"]);
					}	
				},
				{
					title: APPSTRINGS.MECHSTATS.barrier,
					contentFunction: function(pilot, mech){	
						var referenceData = createReferenceData(mech);
						if(hasActiveMechAbilities(mech, ["threshold_barrier", "reduction_barrier", "percent_barrier"])){							
							return "Y";
						} else {
							return "N";
						}
					},
					compareFunction: function(a, b){
						return compareMechAbilities(a, b, ["threshold_barrier", "reduction_barrier", "percent_barrier"]);
					}					
				}
			]
		}, 4: {
			cssClass: "mech_upgrades", 
			title: APPSTRINGS.MECHLIST.tab_upgrade_level,
			sortStart: 1,
			content: [
				{
					title: "",
					contentFunction: mechIcon,
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_mech,
					contentFunction: mechName,
					compareFunction: compareMechName
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_team,
					contentFunction: mechTeam,
					compareFunction: compareMechTeam
				}, 
				{
					title: APPSTRINGS.MECHLIST.column_upgrade_percent,
					contentFunction: function(pilot, mech){
						return $statCalc.getOverallModificationLevel(createReferenceData(mech))+"%";
					},
					compareFunction: function(a, b){
						return ($statCalc.getOverallModificationLevel(createReferenceData(getUnitData(a).mech)) - $statCalc.getOverallModificationLevel(createReferenceData(getUnitData(b).mech)))  * _this._sortDirection;						
					}				
				},
				{
					title: APPSTRINGS.MECHLIST.column_weapon_level,
					contentFunction: function(pilot, mech){
						return $statCalc.getWeaponUpgradeLevel(createReferenceData(mech));
					},
					compareFunction: function(a, b){
						return ($statCalc.getWeaponUpgradeLevel(createReferenceData(getUnitData(a).mech)) - $statCalc.getWeaponUpgradeLevel(createReferenceData(getUnitData(b).mech)))  * _this._sortDirection;						
					}
				}
			]
		}, 5: {
			cssClass: "pilot_default", 
			title: APPSTRINGS.MECHLIST.tab_mech,
			sortStart: 1,
			content: [
				{
					title: "",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return "<div class='list_pilot_icon' data-pilot='"+pilot.actorId()+"'></div>";
					},
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_pilot,
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return pilot.name()
					},
					compareFunction: function(a, b){
						var nameA = getUnitData(a).pilot.name();
						var nameB = getUnitData(b).pilot.name();
						return nameA.localeCompare(nameB) * _this._sortDirection;
					}
				}, 
				{
					title: "Lv",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return $statCalc.getCurrentLevel(pilot);
					},
					compareFunction: function(a, b){
						return ($statCalc.getCurrentLevel(getUnitData(a).pilot) - $statCalc.getCurrentLevel(getUnitData(b).pilot))  * _this._sortDirection;						
					}
				},
				{
					title:  APPSTRINGS.MECHLIST.column_team,
					contentFunction: mechTeam,
					compareFunction: compareMechTeam
				}, 
				{
					title: "",
					contentFunction: mechIcon,
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_mech,
					contentFunction: mechName,
					compareFunction: compareMechName
				}, 
			]
		}, 6: {
			cssClass: "pilot_ability_1", 
			title: APPSTRINGS.MECHLIST.tab_ability,
			sortStart: 1,
			content: [
				{
					title: "",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return "<div class='list_pilot_icon' data-pilot='"+pilot.actorId()+"'></div>";
					},
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_pilot,
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return pilot.name()
					},
					compareFunction: function(a, b){
						var nameA = getUnitData(a).pilot.name();
						var nameB = getUnitData(b).pilot.name();
						return nameA.localeCompare(nameB) * _this._sortDirection;
					}
				}, 
				{
					title: "Lv",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return $statCalc.getCurrentLevel(pilot);
					},
					compareFunction: function(a, b){
						return $statCalc.getCurrentLevel(getUnitData(a).pilot) - $statCalc.getCurrentLevel(getUnitData(b).pilot)  * _this._sortDirection;						
					}
				},
				{
					title:  APPSTRINGS.MECHLIST.column_team,
					contentFunction: mechTeam,
					compareFunction: compareMechTeam
				}, 
				{
					title: APPSTRINGS.PILOTSTATS.melee,
					contentFunction: function(pilot, mech){					
						return $statCalc.getPilotStat(pilot, "melee");
					},
					compareFunction: function(a, b){
						return ($statCalc.getPilotStat(getUnitData(a).pilot, "melee") - $statCalc.getPilotStat(getUnitData(b).pilot, "melee")) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.PILOTSTATS.ranged,
					contentFunction: function(pilot, mech){					
						return $statCalc.getPilotStat(pilot, "ranged");
					},
					compareFunction: function(a, b){
						return ($statCalc.getPilotStat(getUnitData(a).pilot, "ranged") - $statCalc.getPilotStat(getUnitData(b).pilot, "ranged")) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.PILOTSTATS.skill,
					contentFunction: function(pilot, mech){					
						return $statCalc.getPilotStat(pilot, "skill");
					},
					compareFunction: function(a, b){
						return ($statCalc.getPilotStat(getUnitData(a).pilot, "skill") - $statCalc.getPilotStat(getUnitData(b).pilot, "skill")) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.PILOTSTATS.defense,
					contentFunction: function(pilot, mech){					
						return $statCalc.getPilotStat(pilot, "defense");
					},
					compareFunction: function(a, b){
						return ($statCalc.getPilotStat(getUnitData(a).pilot, "defense") - $statCalc.getPilotStat(getUnitData(b).pilot, "defense")) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.PILOTSTATS.evade,
					contentFunction: function(pilot, mech){					
						return $statCalc.getPilotStat(pilot, "evade");
					},
					compareFunction: function(a, b){
						return ($statCalc.getPilotStat(getUnitData(a).pilot, "evade") - $statCalc.getPilotStat(getUnitData(b).pilot, "evade")) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.PILOTSTATS.hit,
					contentFunction: function(pilot, mech){					
						return $statCalc.getPilotStat(pilot, "hit");
					},
					compareFunction: function(a, b){
						return ($statCalc.getPilotStat(getUnitData(a).pilot, "hit") - $statCalc.getPilotStat(getUnitData(b).pilot, "hit")) * _this._sortDirection;						
					}
				},
			]
		}, 7: {
			cssClass: "pilot_ability_2", 
			title: APPSTRINGS.MECHLIST.tab_ability,
			sortStart: 1,
			content: [
				{
					title: "",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return "<div class='list_pilot_icon' data-pilot='"+pilot.actorId()+"'></div>";
					},
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_pilot,
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return pilot.name()
					},
					compareFunction: function(a, b){
						var nameA = getUnitData(a).pilot.name();
						var nameB = getUnitData(b).pilot.name();
						return nameA.localeCompare(nameB) * _this._sortDirection;
					}
				}, 
				{
					title: "Lv",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return $statCalc.getCurrentLevel(pilot);
					},
					compareFunction: function(a, b){
						return $statCalc.getCurrentLevel(getUnitData(a).pilot) - $statCalc.getCurrentLevel(getUnitData(b).pilot)  * _this._sortDirection;						
					}
				},
				{
					title:  APPSTRINGS.MECHLIST.column_team,
					contentFunction: mechTeam,
					compareFunction: compareMechTeam
				}, 
				{
					title: "PP",
					contentFunction: function(pilot, mech){			
						if(pilot.isEmpty){
							return "";
						}
						return $statCalc.getCurrentPP(pilot);
					},
					compareFunction: function(a, b){
						return ($statCalc.getCurrentPP(getUnitData(a).pilot) - $statCalc.getCurrentPP(getUnitData(b).pilot)) * _this._sortDirection;						
					}
				},
				{
					title: "SP",
					contentFunction: function(pilot, mech){			
						if(pilot.isEmpty){
							return "";
						}
						return $statCalc.getCurrentSP(pilot);
					},
					compareFunction: function(a, b){
						return ($statCalc.getCurrentSP(getUnitData(a).pilot) - $statCalc.getCurrentSP(getUnitData(b).pilot)) * _this._sortDirection;						
					}
				},
				{   //isAce	icon
					title: "",
					contentFunction: function(pilot, mech){	
						if(pilot.isEmpty){
							return "";
						}
						if($statCalc.isAce(pilot)){
							return "Ace";
						} else {
							return "";
						}
						
					},
					compareFunction: function(a, b){
						return ($statCalc.isAce(getUnitData(a).pilot) - $statCalc.isAce(getUnitData(b).pilot)) * _this._sortDirection;						
					}
				},
				{   
					title: APPSTRINGS.MECHLIST.column_kills,
					contentFunction: function(pilot, mech){	
						if(pilot.isEmpty){
							return "";
						}
						return $statCalc.getKills(pilot);
						
					},
					compareFunction: function(a, b){
						return ($statCalc.getKills(getUnitData(a).pilot) - $statCalc.getKills(getUnitData(b).pilot)) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.GENERAL.label_AIR,
					contentFunction: function(pilot, mech){					
						return $statCalc.getPilotTerrain(pilot, "air");
					},
					compareFunction: function(a, b){
						return ($statCalc.getPilotTerrain(getUnitData(a), "air").localeCompare($statCalc.getPilotTerrain(getUnitData(b), "air"))) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.GENERAL.label_LND,
					contentFunction: function(pilot, mech){					
						return $statCalc.getPilotTerrain(pilot, "land");
					},
					compareFunction: function(a, b){
						return ($statCalc.getPilotTerrain(getUnitData(a), "land").localeCompare($statCalc.getPilotTerrain(getUnitData(b), "land"))) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.GENERAL.label_SEA,
					contentFunction: function(pilot, mech){					
						return $statCalc.getPilotTerrain(pilot, "water");
					},
					compareFunction: function(a, b){
						return ($statCalc.getPilotTerrain(getUnitData(a), "water").localeCompare($statCalc.getPilotTerrain(getUnitData(b), "water"))) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.GENERAL.label_SPC,
					contentFunction: function(pilot, mech){					
						return $statCalc.getPilotTerrain(pilot, "space");
					},
					compareFunction: function(a, b){
						return ($statCalc.getPilotTerrain(getUnitData(a), "space").localeCompare($statCalc.getPilotTerrain(getUnitData(b), "space"))) * _this._sortDirection;						
					}
				}
			]
		},8: {
			cssClass: "pilot_special_skill", 
			title: APPSTRINGS.MECHLIST.tab_special_skills,
			sortStart: 1,
			content: [
				{
					title: "",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return "<div class='list_pilot_icon' data-pilot='"+pilot.actorId()+"'></div>";
					},
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_pilot,
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return pilot.name()
					},
					compareFunction: function(a, b){
						var nameA = getUnitData(a).pilot.name();
						var nameB = getUnitData(b).pilot.name();
						return nameA.localeCompare(nameB) * _this._sortDirection;
					}
				}, 
				{
					title: "Lv",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return $statCalc.getCurrentLevel(pilot);
					},
					compareFunction: function(a, b){
						return $statCalc.getCurrentLevel(getUnitData(a).pilot) - $statCalc.getCurrentLevel(getUnitData(b).pilot)  * _this._sortDirection;						
					}
				},
				{
					title:  APPSTRINGS.MECHLIST.column_team,
					contentFunction: mechTeam,
					compareFunction: compareMechTeam
				}, 
				{
					title: APPSTRINGS.MECHLIST.column_support_attack,
					contentFunction: function(pilot, mech){					
						var level = $statCalc.applyStatModsToValue(pilot, 0, ["support_attack"]);
						if(level){
							return "Lv "+level;
						} else {
							return "";
						}
					},
					compareFunction: function(a, b){
						return ($statCalc.applyStatModsToValue(getUnitData(a), 0, ["support_attack"]) - $statCalc.applyStatModsToValue(getUnitData(b), 0, ["support_attack"])) * _this._sortDirection;						
					}
				},
				{
					title: APPSTRINGS.MECHLIST.column_support_defend,
					contentFunction: function(pilot, mech){					
						var level = $statCalc.applyStatModsToValue(pilot, 0, ["support_defend"]);
						if(level){
							return "Lv "+level;
						} else {
							return "";
						}
					},
					compareFunction: function(a, b){
						return ($statCalc.applyStatModsToValue(getUnitData(a), 0, ["support_defend"]) - $statCalc.applyStatModsToValue(getUnitData(b), 0, ["support_defend"])) * _this._sortDirection;						
					}
				},
			]
		}, 9: {
			cssClass: "pilot_upgrade", 
			title: APPSTRINGS.MECHLIST.tab_mech,
			sortStart: 1,
			content: [
				{
					title: "",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return "<div class='list_pilot_icon' data-pilot='"+pilot.actorId()+"'></div>";
					},
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_pilot,
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return pilot.name()
					},
					compareFunction: function(a, b){
						var nameA = getUnitData(a).pilot.name();
						var nameB = getUnitData(b).pilot.name();
						return nameA.localeCompare(nameB) * _this._sortDirection;
					}
				}, 
				{
					title: "PP",
					contentFunction: function(pilot, mech){			
						if(pilot.isEmpty){
							return "";
						}
						return $statCalc.getCurrentPP(pilot);
					},
					compareFunction: function(a, b){
						return ($statCalc.getCurrentPP(getUnitData(a).pilot) - $statCalc.getCurrentPP(getUnitData(b).pilot)) * _this._sortDirection;						
					}
				},
				{
					title: "Lv",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return $statCalc.getCurrentLevel(pilot);
					},
					compareFunction: function(a, b){
						return $statCalc.getCurrentLevel(getUnitData(a).pilot) - $statCalc.getCurrentLevel(getUnitData(b).pilot)  * _this._sortDirection;						
					}
				},
				{
					title:  APPSTRINGS.MECHLIST.column_team,
					contentFunction: mechTeam,
					compareFunction: compareMechTeam
				}, 
				{
					title: "",
					contentFunction: mechIcon,
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_mech,
					contentFunction: mechName,
					compareFunction: compareMechName
				}, 
			]
		}, 10: {
			cssClass: "equip", 
			title: APPSTRINGS.MECHLIST.tab_pilot_level,
			sortStart: 1,
			content: [
				{
					title: "",
					contentFunction: mechIcon,
					noSort: true
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_mech,
					contentFunction: mechName,
					compareFunction: compareMechName
				}, 
				{
					title:  APPSTRINGS.MECHLIST.column_team,
					contentFunction: mechTeam,
					compareFunction: compareMechTeam
				}, 
				{
					title: APPSTRINGS.MECHLIST.column_slots,
					contentFunction: function(pilot, mech){
						var equipInfo = $statCalc.getEquipInfo(pilot || createReferenceData(mech));
						var content = "";
						content+="<div class='slot_container scaled_width scaled_height'>"
						for(var i = 0; i < equipInfo.length; i++){
							content+="<div class='slot_icon "+(equipInfo[i] ? "used" : "")+" scaled_width scaled_height'>"
							
							content+="</div>";
						}
						content+="</div>";
						return content;
					},
					compareFunction: function(a, b){
						var equipA = $statCalc.getEquipInfo(createReferenceData(getUnitData(a).mech));
						var equipB = $statCalc.getEquipInfo(createReferenceData(getUnitData(b).mech));
						return equipA.length - equipB.length;
					}
				}, 
				{
					title: "",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return "<div class='list_pilot_icon' data-pilot='"+pilot.actorId()+"'></div>";
					},
					noSort: true
				},
				{
					title:  APPSTRINGS.MECHLIST.column_pilot,
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return pilot.name()
					},
					compareFunction: function(a, b){
						var nameA = getUnitData(a).pilot.name();
						var nameB = getUnitData(b).pilot.name();
						return nameA.localeCompare(nameB) * _this._sortDirection;
					}
				},
				{
					title: "Lv",
					contentFunction: function(pilot, mech){
						if(pilot.isEmpty) return "";
						return $statCalc.getCurrentLevel(pilot);
					},
					compareFunction: function(a, b){
						return $statCalc.getCurrentLevel(getUnitData(a).pilot) - $statCalc.getCurrentLevel(getUnitData(b).pilot)  * _this._sortDirection;						
					}
				}
			]
		},
	}
	
	function generateAttributeColumnConfig(){
		return {
			title: APPSTRINGS.MECHLIST.column_attribute,
			contentFunction: function(pilot, mech){
				let content = "";
				let attr1 = $statCalc.getParticipantAttribute(pilot, "attribute1");
				if(attr1){
					let attrInfo = ENGINE_SETTINGS.ATTRIBUTE_DISPLAY_NAMES[attr1] || {};
					content+="<div class='attribute_indicator scaled_text fitted_text'>";		
					content+="<img data-img='img/system/attribute_"+attr1+".png'>";		
					//content+=attrInfo.name || attr1;
					content+="</div>";
				}
				return content;
			},
			compareFunction: function(a, b){
				let attrA = String($statCalc.getParticipantAttribute(a, "attribute1") || "");
				let attrB = String($statCalc.getParticipantAttribute(b, "attribute1") || "");
				return attrA.localeCompare(attrB);
			}
		};
	}
	
	if(ENGINE_SETTINGS.ENABLE_ATTRIBUTE_SYSTEM){
		this._pageInfo[0].content.push(generateAttributeColumnConfig());
		this._pageInfo[5].content.push(generateAttributeColumnConfig());
	}
}

MechList.prototype.setUnitModeActor = function(){
	this._unitMode = "actor";
}

MechList.prototype.getCurrentInfoPage = function(){
	return this._currentInfoPage;
}

MechList.prototype.getCurrentSelection = function(){	
	var availableUnits =  this.sortViewData();
	var idx = this._currentSelection + this._currentPage * this._maxPageSize;
	if(idx >= availableUnits.length){
		this._currentSelection = 0;
		this._currentPage = 0;
		idx = 0;
		this.requestRedraw();
	}
	var unit = availableUnits[idx];
	
	if(unit){
		let mech;
		if(unit.isSubPilot && unit.mainPilot){
			mech = unit.mainPilot.SRWStats.mech;
		} else {
			mech = unit.SRWStats.mech;
		}
		return {mech: mech, actor: unit};
	} else {
		return null;
	}	
}

MechList.prototype.getCurrentPageAmount = function(){
	this._availableUnits = this.sortViewData();
	var start = this._currentPage * this._maxPageSize;
	if(start + this._maxPageSize >= this._availableUnits.length){
		return this._availableUnits.length - start;
	} else {
		return this._maxPageSize;
	}
}

MechList.prototype.toggleSortOrder = function(){
	this._sortDirection*=-1;
}

MechList.prototype.incrementSelection = function(){
	this._currentSelection++;
	if(this._currentSelection >= this.getCurrentPageAmount()){
		this._currentSelection = 0;
	}
	if(this.getCurrentPageAmount() > 1){
		SoundManager.playCursor();
	} 
}

MechList.prototype.decrementSelection = function(){
	this._currentSelection--;
	if(this._currentSelection < 0){
		this._currentSelection = this.getCurrentPageAmount() - 1;
	}
	if(this.getCurrentPageAmount() > 1){
		SoundManager.playCursor();
	} 
}

MechList.prototype.incrementPage = function(){
	this._availableUnits = this.getAvailableUnits();
	var originalPage = this._currentPage;
	this._currentPage++;
	if(this._currentPage * this._maxPageSize >= this._availableUnits.length){
		this._currentPage = 0;
	}
	this.validateCurrentSelection();
	if(this._currentPage != originalPage){
		SoundManager.playCursor();
	}
	
}

MechList.prototype.decrementPage = function(){
	this._availableUnits = this.getAvailableUnits();
	var originalPage = this._currentPage;
	this._currentPage--;
	if(this._currentPage < 0){
		if(this._availableUnits.length  == 0){
			this._currentPage = 0;
		} else {
			this._currentPage = Math.ceil(this._availableUnits.length / this._maxPageSize) - 1;
		}		
		if(this._currentPage < 0){
			this._currentPage = 0;
		}
	}
	this.validateCurrentSelection();
	if(this._currentPage != originalPage){
		SoundManager.playCursor();
	}
}

MechList.prototype.incrementInfoPage = function(){
	this._currentInfoPage++;
	this._currentSortIdx = -1;
	if(this._currentInfoPage >= this._maxInfoPage){
		this._currentInfoPage = 0;
	}
	var sanityCounter = 20;
	while(!this.isPageUsed(this._currentInfoPage) && sanityCounter > 0){
		this._currentInfoPage++;		
		if(this._currentInfoPage >= this._maxInfoPage){
			this._currentInfoPage = 0;
		}
		sanityCounter--;
	}
}

MechList.prototype.decrementInfoPage = function(){
	this._currentInfoPage--;
	this._currentSortIdx = -1;
	if(this._currentInfoPage < 0){
		this._currentInfoPage = this._maxInfoPage - 1;
	}
	var sanityCounter = 20;
	while(!this.isPageUsed(this._currentInfoPage) && sanityCounter > 0){
		this._currentInfoPage--;
		if(this._currentInfoPage < 0){
			this._currentInfoPage = this._maxInfoPage - 1;
		}
		sanityCounter--;
	}
}

MechList.prototype.incrementSortIdx = function(){
	var contentDef = this._pageInfo[this._currentInfoPage];
	this._currentSortIdx++;
	if(this._currentSortIdx >= contentDef.content.length){
		this._currentSortIdx = 0;
	}
	var sanityCounter = 20;
	while(contentDef.content[this._currentSortIdx].noSort && sanityCounter > 0){
		this._currentSortIdx++;
		if(this._currentSortIdx >= contentDef.content.length){
			this._currentSortIdx = 0;
		}
		sanityCounter--;
	}
	
}

MechList.prototype.decrementSortIdx = function(){
	var contentDef = this._pageInfo[this._currentInfoPage];
	this._currentSortIdx--;
	if(this._currentSortIdx < 0){
		this._currentSortIdx = contentDef.content.length - 1;
	}
	var sanityCounter = 20;
	while(contentDef.content[this._currentSortIdx].noSort && sanityCounter > 0){
		this._currentSortIdx--;
		if(this._currentSortIdx < 0){
			this._currentSortIdx = contentDef.content.length - 1;
		}
		sanityCounter--;
	}
}

MechList.prototype.createComponents = function(){
	this._listDiv = document.createElement("div");
	this._listDiv.id = "mech_list_control";
	this._pageDiv = document.createElement("div");
	this._pageDiv.id = "mech_list_control_page";
	this._pageDiv.classList.add("scaled_text");
	this._topBorder = document.createElement("div");
	this._topBorder.id = "mech_list_control_top_border";
	this._listDetails = document.createElement("div");
	this._listDetails.id = "mech_list_control_details";
	this._pageIndicator = document.createElement("div");
	this._pageIndicator.classList.add("page_indicator");
	this._pageIndicator.id = "mech_list_page_indicator";
	this._container.appendChild(this._listDetails);	
	this._container.appendChild(this._listDiv);	
	this._container.appendChild(this._pageDiv);	
	this._container.appendChild(this._topBorder);	
	this._container.appendChild(this._pageIndicator);	
}



MechList.prototype.sortViewData = function() {
	var _this = this;
	var viewIdxs = this.getAvailableUnits();
	if(viewIdxs && viewIdxs.length){
		var contentDef = _this._pageInfo[_this._currentInfoPage];
		var sortItem = contentDef.content[_this._currentSortIdx];
		if(sortItem.compareFunction){		
			viewIdxs = viewIdxs.sort(sortItem.compareFunction);
		}
	}
	return viewIdxs;
}

MechList.prototype.redraw = function() {
	var _this = this;	
	var contentDef = _this._pageInfo[_this._currentInfoPage];
	if(_this._currentSortIdx == -1){
		_this._currentSortIdx = contentDef.sortStart;
	}
	
	var sortedViewData =  _this.sortViewData();
	var tableContent = "";
	tableContent+="<div class='unit_list_table "+contentDef.cssClass+" scaled_text' id='mech_list_table'>";
	tableContent+="<div class='list_table_row scaled_height'>";
	
		
	for(var i = 0; i < contentDef.content.length; i++){
		tableContent+="<div class='list_table_block header scaled_text "+(i == _this._currentSortIdx ? "sort_col" : "")+"'>";
		tableContent+="<span>"+contentDef.content[i].title+"</span>";
		tableContent+="</div>";
	}
	
	tableContent+="</div>";
	
	var pageOffset = this._currentPage * this._maxPageSize;
	var start = pageOffset;
	var end = Math.min(sortedViewData.length, (start + this._maxPageSize));
	for(var i = start; i < end; i++){				
		tableContent+="<div data-idx='"+(i - pageOffset)+"' class='list_table_row scaled_height "+(_this.rowEnabled(sortedViewData[i]) ? "on" : "off")+" "+(i == this._currentSelection + (_this._currentPage * _this._maxPageSize) ? "selected" : "")+"'>";
		
		for(var j = 0; j < contentDef.content.length; j++){
			tableContent+="<div class='list_table_block scaled_text fitted_text'>";
			tableContent+=contentDef.content[j].contentFunction(sortedViewData[i], sortedViewData[i].SRWStats.mech);
			tableContent+="</div>";
		}
		
		tableContent+="</div>"
	}
	tableContent+="</div>";
	this._listDiv.innerHTML = tableContent;
	var pilotIcons = this._listDiv.querySelectorAll(".list_pilot_icon");
	pilotIcons.forEach(function(pilotIcon){
		var pilotId = pilotIcon.getAttribute("data-pilot");
		_this.loadActorFace(pilotId, pilotIcon);
	});
	
	var mechIcons = this._listDiv.querySelectorAll(".list_mech_icon");
	mechIcons.forEach(function(mechIcon){
		var mechId = mechIcon.getAttribute("data-mech");
		_this.loadMechMiniSprite(mechId, mechIcon);
	});
	
	
	var maxPage = Math.ceil(sortedViewData.length / this._maxPageSize);
	if(maxPage < 1){
		maxPage = 1;
	}
	var content = "";
	content+="<img id='prev_page' src=svg/chevron_right.svg>";
	content+=(this._currentPage + 1)+"/"+maxPage;
	content+="<img id='next_page' src=svg/chevron_right.svg>";
	this._pageDiv.innerHTML = content;
	
	var pageIndicatorContent = "";
	var pageNumber = 1;
	for(var i = 0; i < this._maxInfoPage; i++){
		if(_this.isPageUsed(i)){
			var pageInfo = this._pageInfo[i];
			if(i == this._currentInfoPage){
				pageIndicatorContent+="<div class='page_block scaled_text selected'>";
				pageIndicatorContent+=pageInfo.title;
				pageIndicatorContent+="</div>"
			} else {
				pageIndicatorContent+="<div class='page_block scaled_text'>";
				pageIndicatorContent+=pageNumber;
				pageIndicatorContent+="</div>"
			}
			pageNumber++;
		}				
	}
	this._pageIndicator.innerHTML = pageIndicatorContent;
	
	var windowNode = this.getWindowNode();
	var entries = windowNode.querySelectorAll(".list_table_row");
	entries.forEach(function(entry){
		entry.addEventListener("click",function(){		
			var idx = this.getAttribute("data-idx"); 
			if(idx != null){
				idx*=1;
				if(idx == _this._currentSelection){
					_this.notifyTouchObserver("ok");	
			
				} else {
					_this._currentSelection = idx;
					_this.requestRedraw();
					_this.notifyObserver("redraw");					
				}
			}						
		});		
	});	
	
	windowNode.querySelector("#prev_page").addEventListener("click", function(){
		_this.notifyTouchObserver("left");
	});
	
	windowNode.querySelector("#next_page").addEventListener("click", function(){
		_this.notifyTouchObserver("right");
	});
	Graphics._updateCanvas();
}

