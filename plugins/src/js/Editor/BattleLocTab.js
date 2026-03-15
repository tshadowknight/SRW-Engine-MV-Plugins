import BaseLocTab from "./BaseLocTab.js";
import FaceManager from "./FaceManager.js";

export default function BattleLocTab() {
	BaseLocTab.call(this);
	this._index = null;
	this._currentUnit = null;
}

BattleLocTab.prototype = Object.create(BaseLocTab.prototype);
BattleLocTab.prototype.constructor = BattleLocTab;

BattleLocTab.prototype.loadData = function(localeName) {
	this._localeData = this._loadJsonFile('data/localization/' + localeName + '_battle.json');
	this.modified = false;
};

BattleLocTab.prototype.saveData = function(localeName) {
	this._saveJsonFile('data/localization/' + localeName + '_battle.json', this._localeData);
	this.modified = false;
};

BattleLocTab.prototype.buildIndex = function() {
	if (this._index) return;
	var fs = require('fs');
	var filePath = 'data/BattleText.json';
	if (!fs.existsSync(filePath)) { this._index = {units: [], entries: {}}; return; }

	var data;
	try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
	catch(e) { this._index = {units: [], entries: {}}; return; }

	var units = [];
	var entries = {};
	var hookOrder = ['battle_intro', 'retaliate', 'attacks', 'evade', 'damage', 'damage_critical',
	                 'destroyed', 'support_defend', 'support_attack', 'no_counter', 'received_buff'];

	function addEntry(unitKey, hookKey, subtype, q) {
		if (!q || typeof q !== 'object') return;
		if(!Array.isArray(q)){
			q = [q];
		}
		for(let entry of q){
			if(entry.locId){
				var id = entry.locId.replace(/^#/, '');
				if (!entries[unitKey]) { entries[unitKey] = []; units.push(unitKey); }
				entries[unitKey].push({id: id, hookKey: hookKey, subtype: subtype, originalText: entry.text || '', faceName: entry.faceName || '', faceIndex: entry.faceIndex || 0, displayName: entry.displayName || ''});
			}			
		}		
	}

	function collectSubtypes(unitKey, hookKey, subtypeData) {
		Object.keys(subtypeData).forEach(function(subtype) {
			var arr = subtypeData[subtype];
			if (Array.isArray(arr)) arr.forEach(function(q) { addEntry(unitKey, hookKey, subtype, q); });
		});
	}

	function collectUnit(unitKey, unitData, context) {
		hookOrder.forEach(function(hookName) {
			var hook = unitData[hookName];
			if (!hook || typeof hook !== 'object') return;
			var suffix = context !== 'default' ? ' [' + context + ']' : '';
			if (hookName === 'attacks') {
				Object.keys(hook).sort().forEach(function(attackId) {
					collectSubtypes(unitKey, hookName + '/' + attackId + suffix, hook[attackId]);
				});
			} else {
				collectSubtypes(unitKey, hookName + suffix, hook);
			}
		});
	}

	function processSection(sectionData, context) {
		['actor', 'enemy'].forEach(function(unitType) {
			if (!sectionData[unitType]) return;
			Object.keys(sectionData[unitType])
				.sort(function(a, b) { return parseInt(a) - parseInt(b); })
				.forEach(function(unitId) {
					collectUnit(unitType + ':' + unitId, sectionData[unitType][unitId], context);
				});
		});
	}

	if (data.default) processSection(data.default, 'default');
	if (data.stage && Object.keys(data.stage).length > 0) processSection(data.stage, 'stage');
	if (Array.isArray(data.event)) {
		data.event.forEach(function(ev) {
			if (ev && ev.data) processSection(ev.data, ev.refId || 'event');
		});
	}

	this._index = {units: units, entries: entries};
};

BattleLocTab.prototype.resetIndex = function() {
	this._index = null;
};

BattleLocTab.prototype.initSelection = function() {
	if (!this._currentUnit && this._index && this._index.units.length > 0) {
		this._currentUnit = this._index.units[0];
	}
};

BattleLocTab.prototype._getUnitWordStats = function(unitKey) {
	var _this = this;
	var original = 0, translated = 0;
	(_this._index.entries[unitKey] || []).forEach(function(entry) {
		original += _this._countWords(entry.originalText);
		var t = _this._localeData[entry.id];
		if (t && (Array.isArray(t) ? t.join('').trim() : String(t).trim()) !== '') {
			translated += _this._countWords(Array.isArray(t) ? t.join(' ') : t);
		}
	});
	return {original: original, translated: translated};
};

BattleLocTab.prototype.getStats = function() {
	var _this = this;
	var total = 0, translated = 0, totalWords = 0, translatedWords = 0;
	if (!this._index) return {total: 0, translated: 0, totalWords: 0, translatedWords: 0};
	this._index.units.forEach(function(unitKey) {
		var entries = _this._index.entries[unitKey] || [];
		total += entries.length;
		translated += _this._countTranslated(entries);
		var ws = _this._getUnitWordStats(unitKey);
		totalWords += ws.original;
		translatedWords += ws.translated;
	});
	return {total: total, translated: translated, totalWords: totalWords, translatedWords: translatedWords};
};

BattleLocTab.prototype._getUnitLabel = function(unitKey) {
	var parts = unitKey.split(':');
	var unitType = parts[0];
	var unitId = parseInt(parts[1]);
	if (unitType === 'actor' && typeof $dataActors !== 'undefined' && $dataActors && $dataActors[unitId]) {
		return $dataActors[unitId].name || ('Actor ' + parts[1]);
	}
	if (unitType === 'enemy' && typeof $dataEnemies !== 'undefined' && $dataEnemies && $dataEnemies[unitId]) {
		return $dataEnemies[unitId].name || ('Enemy ' + parts[1]);
	}
	return (unitType === 'actor' ? 'Actor ' : 'Enemy ') + parts[1];
};

BattleLocTab.prototype.renderLeftPane = function() {
	var _this = this;
	var content = "<div class='list_pane'><div class='loc_file_list'>";

	if (this._index.units.length === 0) {
		content += "<div class='loc_empty'>No tagged battle quotes found. Use Tag Battle Text to add localization IDs.</div>";
	} else {
		var actorUnits = this._index.units.filter(function(k) { return k.startsWith('actor:'); });
		var enemyUnits = this._index.units.filter(function(k) { return k.startsWith('enemy:'); });

		var renderGroup = function(unitKeys) {
			unitKeys.forEach(function(unitKey) {
				var entries = _this._index.entries[unitKey] || [];
				var translated = _this._countTranslated(entries);
				content += _this._renderListEntry('data-unit', unitKey, _this._getUnitLabel(unitKey), translated, entries.length, unitKey === _this._currentUnit, _this._getUnitWordStats(unitKey));
			});
		};

		if (actorUnits.length > 0) { content += "<div class='loc_folder_header'>Actors</div>"; renderGroup(actorUnits); }
		if (enemyUnits.length > 0) { content += "<div class='loc_folder_header'>Enemies</div>"; renderGroup(enemyUnits); }
	}

	content += "</div></div>";
	return content;
};

BattleLocTab.prototype._getHookLabel = function(hookKey) {
	// hookKey format: "attacks/{id}" or "attacks/{id} [context]"
	var attacksMatch = /^attacks\/(\d+)(\s|$)/.exec(hookKey);
	if (attacksMatch) {
		var weaponId = parseInt(attacksMatch[1]);
		var weaponName = (typeof $dataWeapons !== 'undefined' && $dataWeapons && $dataWeapons[weaponId])
			? $dataWeapons[weaponId].name
			: null;
		var suffix = hookKey.slice(attacksMatch[0].trimEnd().length);
		return weaponName ? ('attacks: ' + weaponName + suffix) : hookKey;
	}
	return hookKey;
};

BattleLocTab.prototype.renderRightPane = function(localeConfigured) {
	var _this = this;
	var unitEntries = this._currentUnit ? (this._index.entries[this._currentUnit] || []) : [];
	var translatedCount = this._countTranslated(unitEntries);

	var originalWords = 0, translatedWords = 0;
	unitEntries.forEach(function(entry) {
		originalWords += _this._countWords(entry.originalText);
		var t = _this._localeData[entry.id];
		if (t && (Array.isArray(t) ? t.join('').trim() : String(t).trim()) !== '') {
			translatedWords += _this._countWords(Array.isArray(t) ? t.join(' ') : t);
		}
	});

	var content = "<div class='edit_pane'>";
	content += "<div class='loc_pane_header'>";
	if (this._currentUnit) {
		content += "<span class='loc_pane_filename'>" + this._escHtml(this._getUnitLabel(this._currentUnit)) + "</span>";
		content += "<span class='loc_pane_stats'>" + translatedCount + " / " + unitEntries.length + " translated</span>";
		content += "<span class='loc_pane_word_count'>" + translatedWords + " / " + originalWords + " words</span>";
	}
	content += "</div>";
	content += "<div class='commands_scroll'>";

	if (!localeConfigured) {
		content += "<div class='loc_empty'>Add locales to LOCALIZATION.LOCALES in Engine.conf.js to get started.</div>";
	} else if (!this._currentUnit) {
		content += "<div class='loc_empty'>Select a unit on the left.</div>";
	} else if (unitEntries.length === 0) {
		content += "<div class='loc_empty'>No tagged battle quotes found for this unit.</div>";
	} else {
		var currentHookKey = null;
		unitEntries.forEach(function(entry) {
			if (entry.hookKey !== currentHookKey) {
				currentHookKey = entry.hookKey;
				content += "<div class='loc_hook_header'>" + _this._escHtml(_this._getHookLabel(entry.hookKey)) + "</div>";
			}
			var t = _this._localeData[entry.id];
			var translationText = t ? (Array.isArray(t) ? t.join('\n') : t) : '';
			var speakerName = entry.displayName || _this._getUnitLabel(_this._currentUnit);
			var portrait = "<div class='loc_portrait' data-facename='" + _this._esc(entry.faceName) + "' data-faceindex='" + entry.faceIndex + "'></div>";
			content += _this._renderEntry(entry.id, speakerName, _this._escHtml(entry.originalText), 'loc_battle_translation', translationText, portrait);
		});
	}

	content += "</div></div>";
	return content;
};

BattleLocTab.prototype.hookPane = function(container, redraw, onModified) {
	var _this = this;

	var fileList = container.querySelector('.loc_file_list');
	if (fileList) {
		fileList.addEventListener('scroll', function() { _this._fileListScrollTop = this.scrollTop; });
	}

	container.querySelectorAll('.loc_file_entry[data-unit]').forEach(function(el) {
		el.addEventListener('click', function() {
			_this._currentUnit = this.getAttribute('data-unit');
			redraw();
		});
	});

	container.querySelectorAll('.loc_portrait[data-facename]').forEach(function(el) {
		var faceName = el.getAttribute('data-facename');
		var faceIndex = parseInt(el.getAttribute('data-faceindex')) || 0;
		if (faceName) FaceManager.loadFaceByParams(faceName, faceIndex, el);
	});

	container.querySelectorAll('.loc_battle_translation').forEach(function(ta) {
		ta.addEventListener('change', function() {
			var id = this.getAttribute('data-id');
			var text = this.value;
			if (text.trim() === '') {
				delete _this._localeData[id];
			} else {
				_this._localeData[id] = text;
			}
			_this.modified = true;
			onModified();
		});
	});
};

BattleLocTab.prototype.exportXlsx = function(localeName) {
	var XLSX = require('xlsx');
	var _this = this;
	var rows = [['unit', 'hook', 'subtype', 'id', 'original', 'translation']];
	this._index.units.forEach(function(unitKey) {
		(_this._index.entries[unitKey] || []).forEach(function(entry) {
			var t = _this._localeData[entry.id];
			var translation = t ? (Array.isArray(t) ? t.join('\n') : t) : '';
			rows.push([unitKey, entry.hookKey, entry.subtype, entry.id, entry.originalText, translation]);
		});
	});
	var wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Battle Localization');
	this._xlsxDownload(wb, localeName + '_battle_localization.xlsx');
};

BattleLocTab.prototype.importXlsx = function(onComplete) {
	var _this = this;
	this._xlsxPickFile(function(rows) {
		if (rows.length < 2) { alert('Invalid or empty file.'); return; }
		// columns: unit, hook, subtype, id, original, translation
		for (var i = 1; i < rows.length; i++) {
			var row = rows[i];
			if (row.length < 6) continue;
			var id = String(row[3] == null ? '' : row[3]).trim();
			var translation = String(row[5] == null ? '' : row[5]);
			if (!id) continue;
			if (translation.trim() === '') {
				delete _this._localeData[id];
			} else {
				_this._localeData[id] = translation;
			}
		}
		_this.modified = true;
		onComplete();
	});
};
