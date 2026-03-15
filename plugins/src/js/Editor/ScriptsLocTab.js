import BaseLocTab from "./BaseLocTab.js";
import FaceManager from "./FaceManager.js";

export default function ScriptsLocTab() {
	BaseLocTab.call(this);
	this._index = null;
	this._currentFile = null;
}

ScriptsLocTab.prototype = Object.create(BaseLocTab.prototype);
ScriptsLocTab.prototype.constructor = ScriptsLocTab;

ScriptsLocTab.prototype.loadData = function(localeName) {
	this._localeData = this._loadJsonFile('data/localization/' + localeName + '.json');
	this.modified = false;
};

ScriptsLocTab.prototype.saveData = function(localeName) {
	this._saveJsonFile('data/localization/' + localeName + '.json', this._localeData);
	this.modified = false;
};

ScriptsLocTab.prototype.buildIndex = function() {
	if (this._index) return;
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

	this._index = {files: fileOrder, entries: entries};
};

ScriptsLocTab.prototype.resetIndex = function() {
	this._index = null;
};

ScriptsLocTab.prototype.initSelection = function() {
	if (!this._currentFile && this._index && this._index.files.length > 0) {
		this._currentFile = this._index.files[0];
	}
};

ScriptsLocTab.prototype._getFileWordStats = function(file) {
	var _this = this;
	var original = 0, translated = 0;
	(_this._index.entries[file] || []).forEach(function(entry) {
		original += _this._countWords(entry.originalLines.join(' '));
		var t = _this._localeData[entry.id];
		if (t && (Array.isArray(t) ? t.join('').trim() : String(t).trim()) !== '') {
			translated += _this._countWords(Array.isArray(t) ? t.join(' ') : t);
		}
	});
	return {original: original, translated: translated};
};

ScriptsLocTab.prototype.getStats = function() {
	var _this = this;
	var total = 0, translated = 0, totalWords = 0, translatedWords = 0;
	if (!this._index) return {total: 0, translated: 0, totalWords: 0, translatedWords: 0};
	this._index.files.forEach(function(file) {
		var entries = _this._index.entries[file] || [];
		total += entries.length;
		translated += _this._countTranslated(entries);
		var ws = _this._getFileWordStats(file);
		totalWords += ws.original;
		translatedWords += ws.translated;
	});
	return {total: total, translated: translated, totalWords: totalWords, translatedWords: translatedWords};
};

ScriptsLocTab.prototype.renderLeftPane = function() {
	var _this = this;
	var content = "<div class='list_pane'><div class='loc_file_list'>";

	if (this._index.files.length === 0) {
		content += "<div class='loc_empty'>No tagged .mvs files found in text_scripts/</div>";
	}

	var groups = {}, groupOrder = [];
	var stageRe = /^STAGE(\d+)$/i;
	this._index.files.forEach(function(file) {
		var slashIdx = file.indexOf('/');
		var folder = slashIdx !== -1 ? file.slice(0, slashIdx) : '';
		if (!groups[folder]) { groups[folder] = []; groupOrder.push(folder); }
		groups[folder].push(file);
	});
	groupOrder.sort(function(a, b) {
		var aStage = stageRe.exec(a), bStage = stageRe.exec(b);
		if (aStage && bStage) return parseInt(aStage[1]) - parseInt(bStage[1]);
		return a < b ? -1 : a > b ? 1 : 0;
	});
	groupOrder.forEach(function(folder) {
		if (folder) content += "<div class='loc_folder_header'>" + _this._escHtml(folder) + "</div>";
		groups[folder].forEach(function(file) {
			var entries = _this._index.entries[file] || [];
			var translated = _this._countTranslated(entries);
			var label = folder ? file.slice(folder.length + 1) : file;
			content += _this._renderListEntry('data-file', file, label, translated, entries.length, file === _this._currentFile, _this._getFileWordStats(file));
		});
	});

	content += "</div></div>";
	return content;
};

ScriptsLocTab.prototype.renderRightPane = function(localeConfigured) {
	var _this = this;
	var currentEntries = this._currentFile ? (this._index.entries[this._currentFile] || []) : [];
	var translatedCount = this._countTranslated(currentEntries);

	var originalWords = 0, translatedWords = 0;
	currentEntries.forEach(function(entry) {
		originalWords += _this._countWords(entry.originalLines.join(' '));
		var t = _this._localeData[entry.id];
		if (t && (Array.isArray(t) ? t.join('').trim() : String(t).trim()) !== '') {
			translatedWords += _this._countWords(Array.isArray(t) ? t.join(' ') : t);
		}
	});

	var content = "<div class='edit_pane'>";
	content += "<div class='loc_pane_header'>";
	if (this._currentFile) {
		content += "<span class='loc_pane_filename'>" + this._escHtml(this._currentFile) + "</span>";
		content += "<span class='loc_pane_stats'>" + translatedCount + " / " + currentEntries.length + " translated</span>";
		content += "<span class='loc_pane_word_count'>" + translatedWords + " / " + originalWords + " words</span>";
	}
	content += "</div>";
	content += "<div class='commands_scroll'>";

	if (!localeConfigured) {
		content += "<div class='loc_empty'>Add locales to LOCALIZATION.LOCALES in Engine.conf.js to get started.</div>";
	} else if (!this._currentFile) {
		content += "<div class='loc_empty'>Select a script file on the left.</div>";
	} else if (currentEntries.length === 0) {
		content += "<div class='loc_empty'>No localization IDs found in this file.</div>";
	} else {
		currentEntries.forEach(function(entry) {
			var t = _this._localeData[entry.id];
			var translationText = t ? (Array.isArray(t) ? t.join('\n') : t) : '';
			var portrait = "<div class='loc_portrait' data-speakerraw='" + _this._esc(entry.speakerRaw) + "'></div>";
			var originalHtml = entry.originalLines.length > 0
				? entry.originalLines.map(function(l) { return _this._escHtml(l); }).join('<br>')
				: '<em>(no text lines)</em>';
			content += _this._renderEntry(entry.id, entry.speakerRaw, originalHtml, 'loc_translation', translationText, portrait);
		});
	}

	content += "</div></div>";
	return content;
};

ScriptsLocTab.prototype.hookPane = function(container, redraw, onModified) {
	var _this = this;

	var fileList = container.querySelector('.loc_file_list');
	if (fileList) {
		fileList.addEventListener('scroll', function() { _this._fileListScrollTop = this.scrollTop; });
	}

	container.querySelectorAll('.loc_file_entry[data-file]').forEach(function(el) {
		el.addEventListener('click', function() {
			_this._currentFile = this.getAttribute('data-file');
			redraw();
		});
	});

	container.querySelectorAll('.loc_translation').forEach(function(ta) {
		ta.addEventListener('change', function() {
			var id = this.getAttribute('data-id');
			var text = this.value;
			if (text.trim() === '') {
				delete _this._localeData[id];
			} else {
				_this._localeData[id] = text.split('\n');
			}
			_this.modified = true;
			onModified();
		});
	});

	container.querySelectorAll('.loc_portrait').forEach(function(el) {
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

ScriptsLocTab.prototype.exportXlsx = function(localeName) {
	var XLSX = require('xlsx');
	var _this = this;
	var rows = [['file', 'id', 'speaker', 'original', 'translation']];
	this._index.files.forEach(function(file) {
		(_this._index.entries[file] || []).forEach(function(entry) {
			var t = _this._localeData[entry.id];
			var translation = t ? (Array.isArray(t) ? t.join('\n') : t) : '';
			rows.push([file, entry.id, entry.speakerRaw, entry.originalLines.join('\n'), translation]);
		});
	});
	var wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Localization');
	this._xlsxDownload(wb, localeName + '_localization.xlsx');
};

ScriptsLocTab.prototype.importXlsx = function(onComplete) {
	var _this = this;
	this._xlsxPickFile(function(rows) {
		if (rows.length < 2) { alert('Invalid or empty file.'); return; }
		// columns: file, id, speaker, original, translation
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
		_this.modified = true;
		onComplete();
	});
};
