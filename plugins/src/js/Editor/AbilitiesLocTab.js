import BaseLocTab from "./BaseLocTab.js";

export default function AbilitiesLocTab() {
	BaseLocTab.call(this);
	this._currentGroup = null;
	this._entriesCache = {};
}

AbilitiesLocTab.prototype = Object.create(BaseLocTab.prototype);
AbilitiesLocTab.prototype.constructor = AbilitiesLocTab;

AbilitiesLocTab.GROUPS = [
	{ key: 'spirit',         label: 'Spirits',          configVar: 'spirits'                                        },
	{ key: 'pilotAbility',   label: 'Pilot Abilities',  configVar: 'pilotAbilties'                                  },
	{ key: 'mechAbility',    label: 'Mech Abilities',   configVar: 'mechAbilties'                                   },
	{ key: 'weaponEffect',   label: 'Weapon Effects',   configVar: 'weaponEffects'                                  },
	{ key: 'itemEffect',     label: 'Item Effects',     configVar: 'itemEffects'                                    },
	{ key: 'abilityZone',    label: 'Ability Zones',    configVar: 'abilityZones',    noDesc: true                  },
	{ key: 'abilityZoneStr', label: 'Zone Templates',   configVar: 'abilityZonesLocalizationSet', sourceType: 'locSet' },
	{ key: 'abilityCommand', label: 'Ability Commands', configVar: 'abilityCommands'                                },
];

AbilitiesLocTab.prototype.loadData = function(localeName) {
	this._localeData = this._loadJsonFile('data/localization/' + localeName + '_abilities.json');
	this.modified = false;
};

AbilitiesLocTab.prototype.saveData = function(localeName) {
	this._saveJsonFile('data/localization/' + localeName + '_abilities.json', this._localeData);
	this.modified = false;
};

AbilitiesLocTab.prototype.buildIndex = function() {};

AbilitiesLocTab.prototype.resetIndex = function() {
	this._entriesCache = {};
};

AbilitiesLocTab.prototype.initSelection = function() {
	if (!this._currentGroup) {
		this._currentGroup = AbilitiesLocTab.GROUPS[0].key;
	}
};

AbilitiesLocTab.prototype._getGroupEntries = function(group) {
	if (this._entriesCache[group.key]) return this._entriesCache[group.key];
	var entries = [];

	if (group.sourceType === 'locSet') {
		var locSet = (typeof $SRWConfig !== 'undefined') ? $SRWConfig[group.configVar] : null;
		if (locSet && typeof locSet === 'object') {
			Object.keys(locSet).forEach(function(key) {
				entries.push({ idx: key, name: key, desc: String(locSet[key]) });
			});
		}
		this._entriesCache[group.key] = entries;
		return entries;
	}

	var config = (typeof $SRWConfig !== 'undefined') ? $SRWConfig[group.configVar] : null;
	if (typeof config !== 'function') {
		this._entriesCache[group.key] = entries;
		return entries;
	}
	var collector = {
		addDefinition: function() {
			var idx  = arguments[0];
			var name = arguments[1] || '';
			var desc = arguments[2];
			var descStr = '';
			if (typeof desc === 'function') {
				try {
					var result = desc(1);
					if (typeof result === 'string') {
						descStr = result;
					} else if (result && typeof result === 'object') {
						descStr = result.ally || result.enemy || '';
					}
				} catch(e) {}
			} else if (desc != null) {
				descStr = String(desc);
			}
			entries.push({ idx: idx, name: String(name), desc: descStr });
		}
	};
	try { config.call(collector); } catch(e) {}
	this._entriesCache[group.key] = entries;
	return entries;
};

AbilitiesLocTab.prototype._getTranslation = function(groupKey, idx) {
	var section = this._localeData[groupKey];
	var t = section && section[String(idx)];
	return (t && typeof t === 'object') ? t : {};
};

AbilitiesLocTab.prototype._isEntryTranslated = function(groupKey, idx) {
	var t = this._getTranslation(groupKey, idx);
	return (t.name && String(t.name).trim() !== '') || (t.desc && String(t.desc).trim() !== '');
};

AbilitiesLocTab.prototype._setTranslationField = function(groupKey, idx, field, val) {
	var key = String(idx);
	if (val) {
		if (!this._localeData[groupKey]) this._localeData[groupKey] = {};
		if (!this._localeData[groupKey][key]) this._localeData[groupKey][key] = {};
		this._localeData[groupKey][key][field] = val;
	} else {
		var section = this._localeData[groupKey];
		if (section && section[key]) {
			delete section[key][field];
			if (!Object.keys(section[key]).length) delete section[key];
			if (!Object.keys(section).length) delete this._localeData[groupKey];
		}
	}
};

AbilitiesLocTab.prototype._countGroupTranslated = function(group) {
	var _this = this;
	var count = 0;
	this._getGroupEntries(group).forEach(function(entry) {
		if (_this._isEntryTranslated(group.key, entry.idx)) count++;
	});
	return count;
};

AbilitiesLocTab.prototype._getGroupWordStats = function(group) {
	var _this = this;
	var original = 0, translated = 0;
	this._getGroupEntries(group).forEach(function(entry) {
		if (group.sourceType === 'locSet') {
			original += _this._countWords(entry.desc);
		} else if (group.noDesc) {
			original += _this._countWords(entry.name);
		} else {
			original += _this._countWords(entry.name) + _this._countWords(entry.desc);
		}
		var t = _this._getTranslation(group.key, entry.idx);
		if (t.name && String(t.name).trim()) translated += _this._countWords(t.name);
		if (t.desc && String(t.desc).trim()) translated += _this._countWords(t.desc);
	});
	return { original: original, translated: translated };
};

AbilitiesLocTab.prototype.getStats = function() {
	var _this = this;
	var total = 0, translated = 0, totalWords = 0, translatedWords = 0;
	AbilitiesLocTab.GROUPS.forEach(function(group) {
		var entries = _this._getGroupEntries(group);
		total += entries.length;
		translated += _this._countGroupTranslated(group);
		var ws = _this._getGroupWordStats(group);
		totalWords += ws.original;
		translatedWords += ws.translated;
	});
	return { total: total, translated: translated, totalWords: totalWords, translatedWords: translatedWords };
};

AbilitiesLocTab.prototype.renderLeftPane = function() {
	var _this = this;
	var content = "<div class='list_pane'><div class='loc_file_list'>";
	AbilitiesLocTab.GROUPS.forEach(function(group) {
		var entries = _this._getGroupEntries(group);
		var translated = _this._countGroupTranslated(group);
		var isSelected = group.key === _this._currentGroup;
		content += _this._renderListEntry('data-group', group.key, group.label, translated, entries.length, isSelected, _this._getGroupWordStats(group));
	});
	content += "</div></div>";
	return content;
};

AbilitiesLocTab.prototype._renderAbilityEntry = function(group, entry) {
	var t = this._getTranslation(group.key, entry.idx);
	var c = "<div class='loc_entry'>";
	c += "<div class='loc_entry_body'>";
	c += "<div class='loc_entry_header'>";
	c += "<span class='loc_id'>#" + this._escHtml(String(entry.idx)) + "</span>";
	c += "<span class='loc_speaker'>" + this._escHtml(entry.name) + "</span>";
	c += "</div>";
	c += "<div class='loc_ability_field'>";
	c += "<span class='loc_ability_field_label'>Name</span>";
	c += "<div class='loc_original'>" + this._escHtml(entry.name) + "</div>";
	c += "<input type='text' class='loc_name_translation loc_ability_name_input' data-group='" + this._esc(group.key) + "' data-idx='" + this._esc(String(entry.idx)) + "' value='" + this._esc(t.name || '') + "' placeholder='Translation...'>";
	c += "</div>";
	if (entry.desc && !group.noDesc) {
		c += "<div class='loc_ability_field'>";
		c += "<span class='loc_ability_field_label'>Desc</span>";
		c += "<div class='loc_original'>" + this._escHtml(entry.desc) + "</div>";
		c += "<textarea class='loc_battle_translation loc_ability_desc_input' data-group='" + this._esc(group.key) + "' data-idx='" + this._esc(String(entry.idx)) + "' rows='2' placeholder='Translation...'>" + this._escHtml(t.desc || '') + "</textarea>";
		c += "</div>";
	}
	c += "</div>";
	c += "</div>";
	return c;
};

AbilitiesLocTab.prototype._renderLocSetEntry = function(group, entry) {
	var t = this._getTranslation(group.key, entry.idx);
	var c = "<div class='loc_entry'>";
	c += "<div class='loc_entry_body'>";
	c += "<div class='loc_entry_header'>";
	c += "<span class='loc_speaker'>" + this._escHtml(entry.name) + "</span>";
	c += "</div>";
	c += "<div class='loc_ability_field'>";
	c += "<span class='loc_ability_field_label'>Template</span>";
	c += "<div class='loc_original'>" + this._escHtml(entry.desc) + "</div>";
	c += "<textarea class='loc_battle_translation loc_ability_locset_input' data-group='" + this._esc(group.key) + "' data-idx='" + this._esc(String(entry.idx)) + "' rows='2' placeholder='Translation...'>" + this._escHtml(t.desc || '') + "</textarea>";
	c += "</div>";
	c += "</div>";
	c += "</div>";
	return c;
};

AbilitiesLocTab.prototype.renderRightPane = function(localeConfigured) {
	var _this = this;
	var currentGroupDef = AbilitiesLocTab.GROUPS.find(function(g) { return g.key === _this._currentGroup; });
	var sectionClass = (currentGroupDef && currentGroupDef.sourceType) ? ' loc_section_' + currentGroupDef.sourceType : '';

	var content = "<div class='edit_pane" + sectionClass + "'>";
	content += "<div class='loc_pane_header'>";
	if (currentGroupDef) {
		var entries = this._getGroupEntries(currentGroupDef);
		var translated = this._countGroupTranslated(currentGroupDef);
		var ws = this._getGroupWordStats(currentGroupDef);
		content += "<span class='loc_pane_filename'>" + this._escHtml(currentGroupDef.label) + "</span>";
		content += "<span class='loc_pane_stats'>" + translated + " / " + entries.length + " translated</span>";
		content += "<span class='loc_pane_word_count'>" + ws.translated + " / " + ws.original + " words</span>";
	}
	content += "</div>";
	content += "<div class='commands_scroll'>";

	if (!localeConfigured) {
		content += "<div class='loc_empty'>Add locales to LOCALIZATION.LOCALES in Engine.conf.js to get started.</div>";
	} else if (!currentGroupDef) {
		content += "<div class='loc_empty'>Select a group on the left.</div>";
	} else {
		var entries = this._getGroupEntries(currentGroupDef);
		if (entries.length === 0) {
			content += "<div class='loc_empty'>No entries found.</div>";
		} else {
			entries.forEach(function(entry) {
				if (currentGroupDef.sourceType === 'locSet') {
					content += _this._renderLocSetEntry(currentGroupDef, entry);
				} else {
					content += _this._renderAbilityEntry(currentGroupDef, entry);
				}
			});
		}
	}

	content += "</div></div>";
	return content;
};

AbilitiesLocTab.prototype.hookPane = function(container, redraw, onModified) {
	var _this = this;

	var fileList = container.querySelector('.loc_file_list');
	if (fileList) {
		fileList.addEventListener('scroll', function() { _this._fileListScrollTop = this.scrollTop; });
	}

	container.querySelectorAll('.loc_file_entry[data-group]').forEach(function(el) {
		el.addEventListener('click', function() {
			_this._currentGroup = this.getAttribute('data-group');
			redraw();
		});
	});

	container.querySelectorAll('.loc_ability_name_input').forEach(function(input) {
		input.addEventListener('change', function() {
			var groupKey = this.getAttribute('data-group');
			var idx = this.getAttribute('data-idx');
			_this._setTranslationField(groupKey, idx, 'name', this.value.trim());
			_this.modified = true;
			onModified();
		});
	});

	container.querySelectorAll('.loc_ability_desc_input').forEach(function(ta) {
		ta.addEventListener('change', function() {
			var groupKey = this.getAttribute('data-group');
			var idx = this.getAttribute('data-idx');
			_this._setTranslationField(groupKey, idx, 'desc', this.value.trim());
			_this.modified = true;
			onModified();
		});
	});

	container.querySelectorAll('.loc_ability_locset_input').forEach(function(ta) {
		ta.addEventListener('change', function() {
			var groupKey = this.getAttribute('data-group');
			var idx = this.getAttribute('data-idx');
			_this._setTranslationField(groupKey, idx, 'desc', this.value.trim());
			_this.modified = true;
			onModified();
		});
	});
};

AbilitiesLocTab.prototype.exportXlsx = function(localeName) {
	var XLSX = require('xlsx');
	var _this = this;
	var rows = [['category', 'id', 'original_name', 'original_desc', 'translation_name', 'translation_desc']];
	AbilitiesLocTab.GROUPS.forEach(function(group) {
		_this._getGroupEntries(group).forEach(function(entry) {
			var t = _this._getTranslation(group.key, entry.idx);
			rows.push([group.key, entry.idx, entry.name, entry.desc, t.name || '', t.desc || '']);
		});
	});
	var wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Abilities Localization');
	this._xlsxDownload(wb, localeName + '_abilities_localization.xlsx');
};

AbilitiesLocTab.prototype.importXlsx = function(onComplete) {
	var _this = this;
	this._xlsxPickFile(function(rows) {
		if (rows.length < 2) { alert('Invalid or empty file.'); return; }
		// columns: category, id, original_name, original_desc, translation_name, translation_desc
		for (var i = 1; i < rows.length; i++) {
			var row = rows[i];
			if (row.length < 5) continue;
			var groupKey = String(row[0] == null ? '' : row[0]).trim();
			var idx      = String(row[1] == null ? '' : row[1]).trim();
			if (!groupKey || idx === '') continue;
			var tName = String(row[4] == null ? '' : row[4]).trim();
			var tDesc = row.length >= 6 ? String(row[5] == null ? '' : row[5]).trim() : '';
			if (!tName && !tDesc) {
				var section = _this._localeData[groupKey];
				if (section && section[idx]) {
					delete section[idx];
					if (!Object.keys(section).length) delete _this._localeData[groupKey];
				}
			} else {
				if (!_this._localeData[groupKey]) _this._localeData[groupKey] = {};
				_this._localeData[groupKey][idx] = {};
				if (tName) _this._localeData[groupKey][idx].name = tName;
				if (tDesc) _this._localeData[groupKey][idx].desc = tDesc;
			}
		}
		_this.modified = true;
		onComplete();
	});
};
