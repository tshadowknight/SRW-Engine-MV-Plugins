import BaseLocTab from "./BaseLocTab.js";

export default function NamesLocTab() {
	BaseLocTab.call(this);
	this._currentGroup = null;
}

NamesLocTab.prototype = Object.create(BaseLocTab.prototype);
NamesLocTab.prototype.constructor = NamesLocTab;

NamesLocTab.GROUPS = [
	{ key: 'actor',     label: 'Ally Pilots',   dataVar: '$dataActors'  },
	{ key: 'enemy',     label: 'Enemy Pilots',  dataVar: '$dataEnemies' },
	{ key: 'mech',      label: 'Mechs',         dataVar: '$dataClasses' },
	{ key: 'weapon',    label: 'Weapons',       dataVar: '$dataWeapons' },
	{ key: 'stageInfo', label: 'Stage Names',   sourceType: 'srwConfig', configVar: 'stageInfo' },
];

NamesLocTab.prototype.loadData = function(localeName) {
	this._localeData = this._loadJsonFile('data/localization/' + localeName + '_names.json');
	this.modified = false;
};

NamesLocTab.prototype.saveData = function(localeName) {
	this._saveJsonFile('data/localization/' + localeName + '_names.json', this._localeData);
	this.modified = false;
};

NamesLocTab.prototype._getDataArray = function(dataVar) {
	if (typeof window[dataVar] !== 'undefined' && window[dataVar]) return window[dataVar];
	return null;
};

NamesLocTab.prototype._entryId = function(groupKey, id) {
	return groupKey + '_' + id;
};

NamesLocTab.prototype._getGroupEntries = function(group) {
	if (group.sourceType === 'srwConfig') {
		const config = (typeof $SRWConfig !== 'undefined') ? $SRWConfig[group.configVar] : null;
		if (!config || typeof config !== 'object') return [];
		return Object.keys(config)
			.map(k => parseInt(k))
			.filter(k => !isNaN(k))
			.sort((a, b) => a - b)
			.map(k => ({ id: k, name: config[k].name || '' }))
			.filter(e => e.name);
	}
	const arr = this._getDataArray(group.dataVar);
	if (!arr) return [];
	const entries = [];
	for (let i = 1; i < arr.length; i++) {
		if (arr[i] && arr[i].name) {
			entries.push({ id: i, name: arr[i].name });
		}
	}
	return entries;
};

NamesLocTab.prototype.buildIndex = function() {};

NamesLocTab.prototype.resetIndex = function() {};

NamesLocTab.prototype.initSelection = function() {
	if (!this._currentGroup) {
		this._currentGroup = NamesLocTab.GROUPS[0].key;
	}
};

NamesLocTab.prototype.getStats = function() {
	var _this = this;
	var total = 0, translated = 0, totalWords = 0, translatedWords = 0;
	NamesLocTab.GROUPS.forEach(function(group) {
		var entries = _this._getGroupEntries(group);
		total += entries.length;
		entries.forEach(function(entry) {
			var t = _this._localeData[_this._entryId(group.key, entry.id)];
			if (t && String(t).trim()) translated++;
		});
		var ws = _this._getGroupWordStats(group);
		totalWords += ws.original;
		translatedWords += ws.translated;
	});
	return { total: total, translated: translated, totalWords: totalWords, translatedWords: translatedWords };
};

NamesLocTab.prototype._countGroupTranslated = function(group) {
	var _this = this;
	var count = 0;
	this._getGroupEntries(group).forEach(function(entry) {
		var t = _this._localeData[_this._entryId(group.key, entry.id)];
		if (t && String(t).trim()) count++;
	});
	return count;
};

NamesLocTab.prototype._getGroupWordStats = function(group) {
	var _this = this;
	var original = 0, translated = 0;
	this._getGroupEntries(group).forEach(function(entry) {
		original += _this._countWords(entry.name);
		var t = _this._localeData[_this._entryId(group.key, entry.id)];
		if (t && String(t).trim()) translated += _this._countWords(String(t));
	});
	return {original: original, translated: translated};
};

NamesLocTab.prototype.renderLeftPane = function() {
	var _this = this;
	var content = "<div class='list_pane'><div class='loc_file_list'>";

	NamesLocTab.GROUPS.forEach(function(group) {
		var entries = _this._getGroupEntries(group);
		var translated = _this._countGroupTranslated(group);
		var isSelected = group.key === _this._currentGroup;
		content += _this._renderListEntry('data-group', group.key, group.label, translated, entries.length, isSelected, _this._getGroupWordStats(group));
	});

	content += "</div></div>";
	return content;
};

NamesLocTab.prototype.renderRightPane = function(localeConfigured) {
	var _this = this;

	var content = "<div class='edit_pane'>";
	content += "<div class='loc_pane_header'>";

	var currentGroupDef = NamesLocTab.GROUPS.find(function(g) { return g.key === _this._currentGroup; });

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
				var id = _this._entryId(currentGroupDef.key, entry.id);
				var t = _this._localeData[id];
				var translationText = t ? String(t) : '';
				content += _this._renderEntry(
					id,
					String(entry.id),
					_this._escHtml(entry.name),
					'loc_name_translation',
					translationText,
					null
				);
			});
		}
	}

	content += "</div></div>";
	return content;
};

NamesLocTab.prototype.hookPane = function(container, redraw, onModified) {
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

	container.querySelectorAll('.loc_name_translation').forEach(function(ta) {
		ta.addEventListener('change', function() {
			var id = this.getAttribute('data-id');
			var text = this.value.trim();
			if (text === '') {
				delete _this._localeData[id];
			} else {
				_this._localeData[id] = text;
			}
			_this.modified = true;
			onModified();
		});
	});
};

NamesLocTab.prototype.exportXlsx = function(localeName) {
	var XLSX = require('xlsx');
	var _this = this;
	var rows = [['group', 'id', 'original', 'translation']];
	NamesLocTab.GROUPS.forEach(function(group) {
		_this._getGroupEntries(group).forEach(function(entry) {
			var id = _this._entryId(group.key, entry.id);
			var t = _this._localeData[id];
			rows.push([group.key, entry.id, entry.name, t ? String(t) : '']);
		});
	});
	var wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Name Localization');
	this._xlsxDownload(wb, localeName + '_names_localization.xlsx');
};

NamesLocTab.prototype.importXlsx = function(onComplete) {
	var _this = this;
	this._xlsxPickFile(function(rows) {
		if (rows.length < 2) { alert('Invalid or empty file.'); return; }
		// columns: group, id, original, translation
		for (var i = 1; i < rows.length; i++) {
			var row = rows[i];
			if (row.length < 4) continue;
			var groupKey = String(row[0] == null ? '' : row[0]).trim();
			var entryId  = String(row[1] == null ? '' : row[1]).trim();
			var translation = String(row[3] == null ? '' : row[3]).trim();
			if (!groupKey || !entryId) continue;
			var id = groupKey + '_' + entryId;
			if (translation === '') {
				delete _this._localeData[id];
			} else {
				_this._localeData[id] = translation;
			}
		}
		_this.modified = true;
		onComplete();
	});
};
