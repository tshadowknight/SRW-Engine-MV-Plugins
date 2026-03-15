import ScriptsLocTab from "./ScriptsLocTab.js";
import BattleLocTab from "./BattleLocTab.js";
import NamesLocTab from "./NamesLocTab.js";
import AbilitiesLocTab from "./AbilitiesLocTab.js";

export default function LocalizationUI(container, mainUIHandler) {
	this._container = container;
	this._mainUIHandler = mainUIHandler;
	this._activeTab = 'scripts';
	this._currentLocale = null;
	this._scriptsTab = new ScriptsLocTab();
	this._battleTab = new BattleLocTab();
	this._namesTab = new NamesLocTab();
	this._abilitiesTab = new AbilitiesLocTab();
}

LocalizationUI.prototype._getLocales = function() {
	var loc = ENGINE_SETTINGS.LOCALIZATION;
	return (loc && loc.LOCALES) ? loc.LOCALES : [];
};

LocalizationUI.prototype._currentTab = function() {
	if (this._activeTab === 'scripts') return this._scriptsTab;
	if (this._activeTab === 'battle') return this._battleTab;
	if (this._activeTab === 'abilities') return this._abilitiesTab;
	return this._namesTab;
};

LocalizationUI.prototype._esc = function(str) {
	return String(str).replace(/'/g, '&apos;').replace(/"/g, '&quot;');
};

LocalizationUI.prototype._escHtml = function(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

LocalizationUI.prototype.show = function() {
	var _this = this;
	var locales = this._getLocales();
	var tab = this._currentTab();

	if (!this._currentLocale && locales.length > 0) {
		this._currentLocale = locales[0].name;
		this._scriptsTab.loadData(this._currentLocale);
		this._battleTab.loadData(this._currentLocale);
		this._namesTab.loadData(this._currentLocale);
		this._abilitiesTab.loadData(this._currentLocale);
	}

	tab.buildIndex();
	tab.initSelection();
	var stats = tab.getStats();

	var dis = locales.length === 0 ? ' disabled' : '';
	var localeConfigured = locales.length > 0;

	var content = "<div id='localization_editor'>";

	// Tab bar
	content += "<div class='loc_tab_bar'>";
	content += "<div class='loc_tab" + (this._activeTab === 'scripts' ? ' active' : '') + "' data-tab='scripts'>Scripts</div>";
	content += "<div class='loc_tab" + (this._activeTab === 'battle' ? ' active' : '') + "' data-tab='battle'>Battle Quotes</div>";
	content += "<div class='loc_tab" + (this._activeTab === 'names' ? ' active' : '') + "' data-tab='names'>Names</div>";
	content += "<div class='loc_tab" + (this._activeTab === 'abilities' ? ' active' : '') + "' data-tab='abilities'>Abilities</div>";
	content += "</div>";

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
	content += "<button id='save_loc'" + dis + ">Save</button>";
	content += "<button id='export_xlsx'" + dis + ">Export XLSX</button>";
	content += "<button id='import_xlsx'" + dis + ">Import XLSX</button>";
	if (this._activeTab === 'scripts') {
		content += "<button id='refresh_index'>Refresh Files</button>";
		content += "<button id='tag_scripts'>Tag Scripts</button>";
	} else if (this._activeTab === 'battle') {
		content += "<button id='refresh_battle'>Refresh</button>";
		content += "<button id='tag_battle_text'>Tag Battle Text</button>";
	} else if (this._activeTab === 'abilities') {
		content += "<button id='refresh_abilities'>Refresh</button>";
	}
	content += "</div>";
	content += "<div class='control_group loc_global_stats'>";
	content += "<span>" + stats.translated + " / " + stats.total + " translated</span>";
	if (stats.totalWords != null) {
		content += "<span class='loc_global_word_count'>" + stats.translatedWords + " / " + stats.totalWords + " words</span>";
	}
	content += "</div>";
	content += "</div>"; // edit_controls

	// Two-pane layout
	content += "<div class='editor_ui'>";
	content += tab.renderLeftPane();
	content += tab.renderRightPane(localeConfigured);
	content += "</div>"; // editor_ui

	content += "</div>"; // localization_editor

	this._container.innerHTML = content;

	var fileList = this._container.querySelector('.loc_file_list');
	if (fileList) fileList.scrollTop = tab._fileListScrollTop || 0;

	this._hook(tab);
};

LocalizationUI.prototype._hook = function(tab) {
	var _this = this;
	var c = this._container;

	// Tab switching
	c.querySelectorAll('.loc_tab').forEach(function(el) {
		el.addEventListener('click', function() {
			var t = this.getAttribute('data-tab');
			if (t !== _this._activeTab) { _this._activeTab = t; _this.show(); }
		});
	});

	// Locale select
	var localeSelect = c.querySelector('#locale_select');
	if (localeSelect) {
		localeSelect.addEventListener('change', function() {
			if ((_this._scriptsTab.modified || _this._battleTab.modified || _this._namesTab.modified || _this._abilitiesTab.modified) && !confirm('Discard unsaved changes?')) {
				this.value = _this._currentLocale;
				return;
			}
			_this._currentLocale = this.value;
			_this._scriptsTab.loadData(_this._currentLocale);
			_this._battleTab.loadData(_this._currentLocale);
			_this._namesTab.loadData(_this._currentLocale);
			_this._abilitiesTab.loadData(_this._currentLocale);
			_this.show();
		});
	}

	// Save (saves both tabs)
	var saveBtn = c.querySelector('#save_loc');
	if (saveBtn) {
		saveBtn.addEventListener('click', function() {
			if (_this._currentLocale) {
				_this._scriptsTab.saveData(_this._currentLocale);
				_this._battleTab.saveData(_this._currentLocale);
				_this._namesTab.saveData(_this._currentLocale);
				_this._abilitiesTab.saveData(_this._currentLocale);
			}
			if (_this._mainUIHandler) _this._mainUIHandler.clearModified();
			_this.show();
		});
	}

	// Export / Import (tab-aware)
	var exportBtn = c.querySelector('#export_xlsx');
	if (exportBtn) {
		exportBtn.addEventListener('click', function() { tab.exportXlsx(_this._currentLocale); });
	}

	var importBtn = c.querySelector('#import_xlsx');
	if (importBtn) {
		importBtn.addEventListener('click', function() {
			tab.importXlsx(function() {
				if (_this._mainUIHandler) _this._mainUIHandler.setModified();
				_this.show();
			});
		});
	}

	// Scripts-specific buttons
	var refreshIndex = c.querySelector('#refresh_index');
	if (refreshIndex) {
		refreshIndex.addEventListener('click', function() { _this._scriptsTab.resetIndex(); _this.show(); });
	}

	var tagScripts = c.querySelector('#tag_scripts');
	if (tagScripts) {
		tagScripts.addEventListener('click', function() {
			DataManager.tagTextScriptsForLocalization();
			_this._scriptsTab.resetIndex();
			_this.show();
		});
	}

	// Battle-specific buttons
	var refreshBattle = c.querySelector('#refresh_battle');
	if (refreshBattle) {
		refreshBattle.addEventListener('click', function() { _this._battleTab.resetIndex(); _this.show(); });
	}

	var tagBattle = c.querySelector('#tag_battle_text');
	if (tagBattle) {
		tagBattle.addEventListener('click', function() {
			DataManager.tagBattleTextForLocalization();
			_this._battleTab.resetIndex();
			_this.show();
		});
	}

	// Abilities-specific buttons
	var refreshAbilities = c.querySelector('#refresh_abilities');
	if (refreshAbilities) {
		refreshAbilities.addEventListener('click', function() { _this._abilitiesTab.resetIndex(); _this.show(); });
	}

	// Delegate pane-specific hooks to the active tab
	tab.hookPane(c,
		function() { _this.show(); },
		function() { if (_this._mainUIHandler) _this._mainUIHandler.setModified(); }
	);
};
