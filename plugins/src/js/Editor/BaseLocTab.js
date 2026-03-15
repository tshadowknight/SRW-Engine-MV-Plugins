export default function BaseLocTab() {
	this._localeData = {};
	this._fileListScrollTop = 0;
	this.modified = false;
}

BaseLocTab.prototype._esc = function(str) {
	return String(str).replace(/'/g, '&apos;').replace(/"/g, '&quot;');
};

BaseLocTab.prototype._escHtml = function(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

BaseLocTab.prototype._countWords = function(str) {
	if (!str) return 0;
	return String(str).trim().split(/\s+/).filter(function(w) { return w.length > 0; }).length;
};

BaseLocTab.prototype._countTranslated = function(entries) {
	var localeData = this._localeData;
	var count = 0;
	entries.forEach(function(entry) {
		var t = localeData[entry.id];
		if (t && (Array.isArray(t) ? t.join('').trim() : String(t).trim()) !== '') count++;
	});
	return count;
};

BaseLocTab.prototype._loadJsonFile = function(filePath) {
	var fs = require('fs');
	if (fs.existsSync(filePath)) {
		try {
			return JSON.parse(fs.readFileSync(filePath, 'utf8'));
		} catch(e) {
			console.error('Failed to parse ' + filePath, e);
		}
	}
	return {};
};

BaseLocTab.prototype._saveJsonFile = function(filePath, data) {
	var fs = require('fs');
	var dir = filePath.substring(0, filePath.lastIndexOf('/'));
	if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

BaseLocTab.prototype._xlsxDownload = function(wb, filename) {
	var XLSX = require('xlsx');
	var wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
	var blob = new Blob([wbout], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
	var a = document.createElement('a');
	var url = URL.createObjectURL(blob);
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	setTimeout(function() { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 0);
};

BaseLocTab.prototype._xlsxPickFile = function(callback) {
	var input = document.createElement('input');
	input.type = 'file';
	input.accept = '.xlsx,.ods';
	input.addEventListener('change', function() {
		if (!this.value) return;
		var fs = require('fs');
		var XLSX = require('xlsx');
		var wb = XLSX.read(fs.readFileSync(this.value), {type: 'buffer'});
		var ws = wb.Sheets[wb.SheetNames[0]];
		var rows = XLSX.utils.sheet_to_json(ws, {header: 1});
		callback(rows);
	});
	input.click();
};

// Renders a .loc_file_entry row for the left pane list
// wordStats: optional {original, translated} word counts; omit to hide
BaseLocTab.prototype._renderListEntry = function(dataAttr, dataValue, label, translated, count, isActive, wordStats) {
	var complete = count > 0 && translated === count;
	var c = "<div class='loc_file_entry" + (isActive ? ' selected' : '') + "' " + dataAttr + "='" + this._esc(dataValue) + "'>";
	c += "<div class='loc_file_name'>" + this._escHtml(label) + "</div>";
	c += "<div class='loc_file_count" + (complete ? ' complete' : '') + "'>" + translated + "/" + count + "</div>";
	if (wordStats != null) {
		c += "<div class='loc_file_words'>" + wordStats.translated + "/" + wordStats.original + "w</div>";
	}
	c += "</div>";
	return c;
};

// Renders a .loc_entry row for the right pane
// prependHtml: optional HTML inserted before loc_entry_body (e.g. portrait)
BaseLocTab.prototype._renderEntry = function(id, speaker, originalHtml, textareaCls, translationText, prependHtml) {
	var c = "<div class='loc_entry'>";
	if (prependHtml) c += prependHtml;
	c += "<div class='loc_entry_body'>";
	c += "<div class='loc_entry_header'>";
	c += "<span class='loc_id'>#" + this._escHtml(id) + "</span>";
	c += "<span class='loc_speaker'>" + this._escHtml(speaker) + "</span>";
	c += "</div>";
	c += "<div class='loc_original'>" + originalHtml + "</div>";
	c += "<textarea class='" + textareaCls + "' data-id='" + this._esc(id) + "' rows='3' placeholder='Translation...'>" + this._escHtml(translationText) + "</textarea>";
	c += "</div>";
	c += "</div>";
	return c;
};
