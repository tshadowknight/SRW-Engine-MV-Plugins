import FaceManager from "./FaceManager.js";

export default function LocalizationUI(container, mainUIHandler) {
	this._container = container;
	this._mainUIHandler = mainUIHandler;
	this._currentLocale = null;
	this._localeData = {};
	this._scriptIndex = null; // built once per session: {files: [], entries: {file: [{id, speakerRaw, originalLines}]}}
	this._currentFile = null;
	this._modified = false;
}

LocalizationUI.prototype._getLocales = function() {
	var loc = ENGINE_SETTINGS.LOCALIZATION;
	return (loc && loc.LOCALES) ? loc.LOCALES : [];
};

LocalizationUI.prototype._loadLocaleData = function(localeName) {
	var fs = require('fs');
	var filePath = 'data/localization/' + localeName + '.json';
	if (fs.existsSync(filePath)) {
		try {
			return JSON.parse(fs.readFileSync(filePath, 'utf8'));
		} catch(e) {
			console.error('LocalizationUI: failed to parse ' + filePath, e);
		}
	}
	return {};
};

LocalizationUI.prototype._saveLocaleData = function() {
	if (!this._currentLocale) return;
	var fs = require('fs');
	var dir = 'data/localization';
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
	fs.writeFileSync(dir + '/' + this._currentLocale + '.json', JSON.stringify(this._localeData, null, 2), 'utf8');
};

LocalizationUI.prototype._buildScriptIndex = function() {
	if (this._scriptIndex) return;
	var fs = require('fs');
	var path = require('path');
	var scriptDir = 'text_scripts';
	var fileOrder = [];
	var entries = {};
	var locIdRe = / #([0-9]+)$/;

	function findMvsFiles(dir) {
		var files = [];
		if (!fs.existsSync(dir)) return files;
		fs.readdirSync(dir, {withFileTypes: true}).forEach(function(e) {
			var full = path.join(dir, e.name);
			if (e.isDirectory()) {
				files = files.concat(findMvsFiles(full));
			} else if (e.name.endsWith('.mvs')) {
				files.push(full);
			}
		});
		return files;
	}

	findMvsFiles(scriptDir).forEach(function(file) {
		var content = fs.readFileSync(file, 'utf8');
		var lines = content.split('\n');
		var fileEntries = [];
		var inBlock = false;

		for (var i = 0; i < lines.length; i++) {
			var trimmed = lines[i].trim();
			if (trimmed === '/*' || trimmed === '[script]') { inBlock = true; continue; }
			if (trimmed === '*/' || trimmed === '[/script]') { inBlock = false; continue; }
			if (inBlock) continue;

			if (trimmed.startsWith('*')) {
				var match = locIdRe.exec(lines[i].trimEnd());
				if (match) {
					var id = match[1];
					var speakerRaw = trimmed.slice(1).replace(locIdRe, '').trim();
					var originalLines = [];
					var j = i + 1;
					while (j < lines.length) {
						var next = lines[j].trim();
						if (!next || next.startsWith('*') || next.startsWith('[') ||
							next.startsWith('//') || next.startsWith('#') ||
							next.startsWith('{') || next.startsWith('}')) break;
						originalLines.push(next.replace(locIdRe, '').trim());
						j++;
					}
					fileEntries.push({id: id, speakerRaw: speakerRaw, originalLines: originalLines});
				}
			}
		}

		if (fileEntries.length > 0) {
			var relPath = path.relative(scriptDir, file).replace(/\\/g, '/');
			fileOrder.push(relPath);
			entries[relPath] = fileEntries;
		}
	});

	this._scriptIndex = {files: fileOrder, entries: entries};
};

LocalizationUI.prototype.show = function() {
	this._buildScriptIndex();
	var _this = this;
	var locales = this._getLocales();

	if (!this._currentLocale && locales.length > 0) {
		this._currentLocale = locales[0].name;
		this._localeData = this._loadLocaleData(this._currentLocale);
	}
	if (!this._currentFile && this._scriptIndex.files.length > 0) {
		this._currentFile = this._scriptIndex.files[0];
	}

	var totalEntries = 0, totalTranslated = 0;
	this._scriptIndex.files.forEach(function(file) {
		var entries = _this._scriptIndex.entries[file] || [];
		totalEntries += entries.length;
		entries.forEach(function(entry) {
			var t = _this._localeData[entry.id];
			if (t && (Array.isArray(t) ? t.join('').trim() : String(t).trim()) !== '') totalTranslated++;
		});
	});

	var content = "<div id='localization_editor'>";

	// Top controls
	content += "<div class='edit_controls'>";
	content += "<div class='control_group'>";
	content += "<label class='control_label'>Locale:</label>";
	content += "<select id='locale_select'>";
	if (locales.length === 0) {
		content += "<option value=''>(none configured)</option>";
	} else {
		locales.forEach(function(locale) {
			var sel = locale.name === _this._currentLocale ? ' selected' : '';
			content += "<option value='" + _this._esc(locale.name) + "'" + sel + ">" + _this._escHtml(locale.name) + "</option>";
		});
	}
	content += "</select>";
	content += "</div>";
	content += "<div class='control_group'>";
	var dis = locales.length === 0 ? ' disabled' : '';
	content += "<button id='save_loc'" + dis + ">Save</button>";
	content += "<button id='export_xlsx'" + dis + ">Export XLSX</button>";
	content += "<button id='import_xlsx'" + dis + ">Import XLSX</button>";
	content += "<button id='refresh_index'>Refresh Files</button>";
	content += "</div>";
	content += "<div class='control_group loc_global_stats'>";
	content += "<span>" + totalTranslated + " / " + totalEntries + " translated</span>";
	content += "</div>";
	content += "</div>"; // edit_controls

	// Two-pane layout
	content += "<div class='editor_ui'>";

	// Left pane: file list
	content += "<div class='list_pane'>";
	content += "<div class='loc_file_list'>";
	if (this._scriptIndex.files.length === 0) {
		content += "<div class='loc_empty'>No tagged .mvs files found in text_scripts/</div>";
	}
	// Group files by top-level folder
	var groups = {}; // folder -> [file, ...]
	var groupOrder = [];
	var stageRe = /^STAGE(\d+)$/i;
	this._scriptIndex.files.forEach(function(file) {
		var slashIdx = file.indexOf('/');
		var folder = slashIdx !== -1 ? file.slice(0, slashIdx) : '';
		if (!groups[folder]) { groups[folder] = []; groupOrder.push(folder); }
		groups[folder].push(file);
	});
	groupOrder.sort(function(a, b) {
		var aStage = stageRe.exec(a);
		var bStage = stageRe.exec(b);
		if (aStage && bStage) return parseInt(aStage[1]) - parseInt(bStage[1]);
		return a < b ? -1 : a > b ? 1 : 0;
	});
	groupOrder.forEach(function(folder) {
		if (folder) {
			content += "<div class='loc_folder_header'>" + _this._escHtml(folder) + "</div>";
		}
		groups[folder].forEach(function(file) {
			var entries = _this._scriptIndex.entries[file] || [];
			var count = entries.length;
			var translated = 0;
			entries.forEach(function(entry) {
				var t = _this._localeData[entry.id];
				if (t && (Array.isArray(t) ? t.join('').trim() : String(t).trim()) !== '') translated++;
			});
			var isActive = file === _this._currentFile ? ' selected' : '';
			var label = folder ? file.slice(folder.length + 1) : file;
			var complete = count > 0 && translated === count;
			content += "<div class='loc_file_entry" + isActive + "' data-file='" + _this._esc(file) + "'>";
			content += "<div class='loc_file_name'>" + _this._escHtml(label) + "</div>";
			content += "<div class='loc_file_count" + (complete ? " complete" : "") + "'>" + translated + "/" + count + "</div>";
			content += "</div>";
		});
	});
	content += "</div>"; // loc_file_list
	content += "</div>"; // list_pane

	// Right pane: entries
	content += "<div class='edit_pane'>";
	var currentEntries = this._currentFile ? (this._scriptIndex.entries[this._currentFile] || []) : [];
	var translatedCount = 0;
	currentEntries.forEach(function(entry) {
		var t = _this._localeData[entry.id];
		if (t && (Array.isArray(t) ? t.join('').trim() : String(t).trim()) !== '') translatedCount++;
	});
	content += "<div class='loc_pane_header'>";
	if (this._currentFile) {
		content += "<span class='loc_pane_filename'>" + _this._escHtml(this._currentFile) + "</span>";
		content += "<span class='loc_pane_stats'>" + translatedCount + " / " + currentEntries.length + " translated</span>";
	}
	content += "</div>";
	content += "<div class='commands_scroll'>";
	if (locales.length === 0) {
		content += "<div class='loc_empty'>Add locales to LOCALIZATION.LOCALES in Engine.conf.js to get started.</div>";
	} else if (!this._currentFile) {
		content += "<div class='loc_empty'>Select a script file on the left.</div>";
	} else if (currentEntries.length === 0) {
		content += "<div class='loc_empty'>No localization IDs found in this file.</div>";
	} else {
		currentEntries.forEach(function(entry) {
			var t = _this._localeData[entry.id];
			var translationText = t ? (Array.isArray(t) ? t.join('\n') : t) : '';
			content += "<div class='loc_entry'>";
			content += "<div class='loc_portrait' data-speakerraw='" + _this._esc(entry.speakerRaw) + "'></div>";
			content += "<div class='loc_entry_body'>";
			content += "<div class='loc_entry_header'>";
			content += "<span class='loc_id'>#" + _this._escHtml(entry.id) + "</span>";
			content += "<span class='loc_speaker'>" + _this._escHtml(entry.speakerRaw) + "</span>";
			content += "</div>";
			content += "<div class='loc_original'>";
			if (entry.originalLines.length > 0) {
				content += entry.originalLines.map(function(l) { return _this._escHtml(l); }).join('<br>');
			} else {
				content += "<em>(no text lines)</em>";
			}
			content += "</div>";
			content += "<textarea class='loc_translation' data-id='" + _this._esc(entry.id) + "' rows='3' placeholder='Translation...'>" + _this._escHtml(translationText) + "</textarea>";
			content += "</div>";
			content += "</div>";
		});
	}
	content += "</div>"; // commands_scroll
	content += "</div>"; // edit_pane

	content += "</div>"; // editor_ui
	content += "</div>"; // localization_editor

	this._container.innerHTML = content;
	this._hook();
};

LocalizationUI.prototype._hook = function() {
	var _this = this;
	var c = this._container;

	var localeSelect = c.querySelector('#locale_select');
	if (localeSelect) {
		localeSelect.addEventListener('change', function() {
			if (_this._modified && !confirm('Discard unsaved changes?')) {
				this.value = _this._currentLocale;
				return;
			}
			_this._currentLocale = this.value;
			_this._localeData = _this._loadLocaleData(_this._currentLocale);
			_this._modified = false;
			_this.show();
		});
	}

	c.querySelectorAll('.loc_file_entry').forEach(function(el) {
		el.addEventListener('click', function() {
			_this._currentFile = this.getAttribute('data-file');
			_this.show();
		});
	});

	c.querySelectorAll('.loc_translation').forEach(function(ta) {
		ta.addEventListener('change', function() {
			var id = this.getAttribute('data-id');
			var text = this.value;
			if (text.trim() === '') {
				delete _this._localeData[id];
			} else {
				_this._localeData[id] = text.split('\n');
			}
			_this._modified = true;
			if (_this._mainUIHandler) _this._mainUIHandler.setModified();
		});
	});

	var saveBtn = c.querySelector('#save_loc');
	if (saveBtn) {
		saveBtn.addEventListener('click', function() {
			_this._saveLocaleData();
			_this._modified = false;
			if (_this._mainUIHandler) _this._mainUIHandler.clearModified();
			_this.show();
		});
	}

	var exportBtn = c.querySelector('#export_xlsx');
	if (exportBtn) {
		exportBtn.addEventListener('click', function() { _this._exportXlsx(); });
	}

	var importBtn = c.querySelector('#import_xlsx');
	if (importBtn) {
		importBtn.addEventListener('click', function() { _this._importXlsx(); });
	}

	var refreshBtn = c.querySelector('#refresh_index');
	if (refreshBtn) {
		refreshBtn.addEventListener('click', function() {
			_this._scriptIndex = null;
			_this.show();
		});
	}

	c.querySelectorAll('.loc_portrait').forEach(function(el) {
		var speakerRaw = el.getAttribute('data-speakerraw') || '';
		var parts = speakerRaw.trim().split(/\s+/);
		var characterId = parts[0];
		var expressionId = parts[1] || 0;
		if (!characterId || characterId === 'TEXT' || !$scriptCharactersLoader) return;
		var characterDef = $scriptCharactersLoader.getData()[characterId];
		if (!characterDef) return;
		var expressionInfo = characterDef.expressions[expressionId] || characterDef.expressions[0];
		if (!expressionInfo) return;
		FaceManager.loadFaceByParams(expressionInfo.face, expressionInfo.index, el);
	});
};

LocalizationUI.prototype._exportXlsx = function() {
	if (!this._currentLocale) return;
	var _this = this;
	var XLSX = require('xlsx');
	var rows = [['file', 'id', 'speaker', 'original', 'translation']];

	this._scriptIndex.files.forEach(function(file) {
		(_this._scriptIndex.entries[file] || []).forEach(function(entry) {
			var t = _this._localeData[entry.id];
			var translation = t ? (Array.isArray(t) ? t.join('\n') : t) : '';
			rows.push([file, entry.id, entry.speakerRaw, entry.originalLines.join('\n'), translation]);
		});
	});

	var wb = XLSX.utils.book_new();
	var ws = XLSX.utils.aoa_to_sheet(rows);
	XLSX.utils.book_append_sheet(wb, ws, 'Localization');

	var wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
	var blob = new Blob([wbout], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
	var a = document.createElement('a');
	var url = URL.createObjectURL(blob);
	a.href = url;
	a.download = this._currentLocale + '_localization.xlsx';
	document.body.appendChild(a);
	a.click();
	setTimeout(function() {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 0);
};

LocalizationUI.prototype._importXlsx = function() {
	var _this = this;
	var XLSX = require('xlsx');
	var input = document.createElement('input');
	input.type = 'file';
	input.accept = '.xlsx,.ods';
	input.addEventListener('change', function() {
		if (!this.value) return;
		var fs = require('fs');
		var wb = XLSX.read(fs.readFileSync(this.value), {type: 'buffer'});
		var ws = wb.Sheets[wb.SheetNames[0]];
		var rows = XLSX.utils.sheet_to_json(ws, {header: 1});
		if (rows.length < 2) { alert('Invalid or empty file.'); return; }
		// Skip header (row 0); columns: file, id, speaker, original, translation
		for (var i = 1; i < rows.length; i++) {
			var row = rows[i];
			if (row.length < 5) continue;
			var id = String(row[1] == null ? '' : row[1]).trim();
			var translation = String(row[4] == null ? '' : row[4]);
			if (!id) continue;
			if (translation.trim() === '') {
				delete _this._localeData[id];
			} else {
				_this._localeData[id] = translation.split('\n');
			}
		}
		_this._modified = true;
		if (_this._mainUIHandler) _this._mainUIHandler.setModified();
		_this.show();
	});
	input.click();
};

LocalizationUI.prototype._esc = function(str) {
	return String(str).replace(/'/g, '&apos;').replace(/"/g, '&quot;');
};

LocalizationUI.prototype._escHtml = function(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
