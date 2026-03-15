import FaceManager from "./FaceManager.js";

export default function ScriptCharactersUI(container, mainUIHandler) {
	this._container = container;
	this._mainUIHandler = mainUIHandler;
	this._data = null;
	this._currentKey = null;
	this._modified = false;
	this._listScrollTop = 0;
}

ScriptCharactersUI.prototype._esc = function(str) {
	return String(str).replace(/'/g, '&apos;').replace(/"/g, '&quot;');
};

ScriptCharactersUI.prototype._escHtml = function(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

ScriptCharactersUI.prototype._loadData = function() {
	var fs = require('fs');
	var filePath = 'data/ScriptCharacters.json';
	if (fs.existsSync(filePath)) {
		try {
			this._data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		} catch(e) {
			console.error('Failed to parse ScriptCharacters.json', e);
			this._data = {};
		}
	} else {
		this._data = {};
	}
	this._modified = false;
};

ScriptCharactersUI.prototype._saveData = function() {
	var fs = require('fs');
	fs.writeFileSync('data/ScriptCharacters.json', JSON.stringify(this._data, null, 2), 'utf8');
	this._modified = false;
	if (this._mainUIHandler) this._mainUIHandler.clearModified();
};

ScriptCharactersUI.prototype._getSortedKeys = function() {
	return Object.keys(this._data).sort(function(a, b) {
		return a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0;
	});
};

ScriptCharactersUI.prototype._initSelection = function() {
	if (!this._currentKey || !this._data[this._currentKey]) {
		var keys = this._getSortedKeys();
		this._currentKey = keys.length > 0 ? keys[0] : null;
	}
};

ScriptCharactersUI.prototype.show = function() {
	if (!this._data) this._loadData();
	this._initSelection();
	var _this = this;

	var content = "<div id='script_characters_editor'>";

	// Top controls
	content += "<div class='edit_controls'>";
	content += "<div class='control_group'>";
	content += "<button id='sc_save'>Save</button>";
	content += "<button id='sc_reload'>Reload File</button>";
	content += "<button id='sc_add_char'>+ Add Character</button>";
	content += "</div>";
	content += "</div>";

	// Two-pane layout
	content += "<div class='editor_ui'>";

	// Left pane
	content += "<div class='list_pane'><div class='loc_file_list'>";
	var keys = this._getSortedKeys();
	keys.forEach(function(key) {
		var char = _this._data[key];
		var exprCount = char.expressions ? Object.keys(char.expressions).length : 0;
		var isSelected = key === _this._currentKey;
		content += "<div class='loc_file_entry" + (isSelected ? ' selected' : '') + "' data-key='" + _this._esc(key) + "'>";
		content += "<div class='loc_file_name'>" + _this._escHtml(key) + "</div>";
		content += "<div class='loc_file_count'>" + exprCount + " expr</div>";
		content += "</div>";
	});
	content += "</div></div>";

	// Right pane
	content += "<div class='edit_pane'>";
	content += "<div class='loc_pane_header'>";
	if (this._currentKey) {
		content += "<span class='loc_pane_filename'>" + this._escHtml(this._currentKey) + "</span>";
	}
	content += "</div>";
	content += "<div class='commands_scroll'>";

	if (!this._currentKey) {
		content += "<div class='loc_empty'>Select a character on the left, or add a new one.</div>";
	} else {
		content += this._renderCharacterForm(this._currentKey, this._data[this._currentKey]);
	}

	content += "</div></div>";
	content += "</div>"; // editor_ui
	content += "</div>"; // script_characters_editor

	this._container.innerHTML = content;

	var fileList = this._container.querySelector('.loc_file_list');
	if (fileList) fileList.scrollTop = this._listScrollTop || 0;

	this._hookUI();
};

ScriptCharactersUI.prototype._renderCharacterForm = function(key, char) {
	var _this = this;
	var nameVar = char.nameVar != null ? char.nameVar : -1;
	var actorId = char.actorId != null ? char.actorId : 0;
	var expressions = char.expressions || {};
	var exprIndices = Object.keys(expressions).sort(function(a, b) {
		var ai = parseInt(a), bi = parseInt(b);
		if (!isNaN(ai) && !isNaN(bi)) return ai - bi;
		return a < b ? -1 : a > b ? 1 : 0;
	});

	var c = "<div class='sc_char_form'>";

	// Key
	c += "<div class='sc_field_section'>";
	c += "<div class='sc_field_row'>";
	c += "<label class='sc_label'>Key</label>";
	c += "<input type='text' id='sc_key_input' value='" + this._esc(key) + "' class='sc_text_input'>";
	c += "<button id='sc_rename_btn' class='sc_inline_btn'>Rename</button>";
	c += "</div>";
	c += "</div>";

	// nameVar
	c += "<div class='sc_field_section'>";
	c += "<div class='sc_field_row'>";
	c += "<label class='sc_label'>Name Variable</label>";
	c += "<input type='number' id='sc_name_var' value='" + nameVar + "' class='sc_num_input'>";
	c += "<span class='sc_hint'>(-1 = none)</span>";
	c += "</div>";
	c += "</div>";

	// actorId
	c += "<div class='sc_field_section'>";
	c += "<div class='sc_field_row'>";
	c += "<label class='sc_label'>Actor ID</label>";
	c += "<input type='number' id='sc_actor_id' value='" + actorId + "' class='sc_num_input'>";
	c += "<span class='sc_hint'>(0 = none)</span>";
	c += "</div>";
	c += "</div>";

	// Expressions
	c += "<div class='sc_section_header'>";
	c += "<span>Expressions</span>";
	c += "<button id='sc_add_expr'>+ Add Expression</button>";
	c += "</div>";

	if (exprIndices.length === 0) {
		c += "<div class='loc_empty'>No expressions defined.</div>";
	} else {
		exprIndices.forEach(function(idx) {
			var expr = expressions[idx];
			c += "<div class='sc_expr_entry' data-expr-idx='" + idx + "'>";
			c += "<div class='loc_portrait sc_expr_portrait' data-facename='" + _this._esc(expr.face || '') + "' data-faceindex='" + (expr.index || 0) + "'></div>";
			c += "<div class='sc_expr_body'>";
			c += "<div class='sc_expr_row'>";
			c += "<label class='sc_label'>Index</label>";
			c += "<input type='text' class='sc_expr_key_input sc_text_input' value='" + _this._esc(idx) + "' data-expr-idx='" + idx + "'>";
			c += "</div>";
			c += "<div class='sc_expr_row'>";
			c += "<label class='sc_label'>Name</label>";
			c += "<input type='text' class='sc_expr_name sc_text_input' value='" + _this._esc(expr.name || '') + "' data-expr-idx='" + idx + "' placeholder='(optional)'>";
			c += "</div>";
			c += "<div class='sc_expr_row'>";
			c += "<label class='sc_label'>Face</label>";
			c += "<input type='text' class='sc_face_name sc_text_input' value='" + _this._esc(expr.face || '') + "' data-expr-idx='" + idx + "'>";
			c += "<input type='number' class='sc_face_idx sc_num_input' value='" + (expr.index || 0) + "' min='0' max='7' data-expr-idx='" + idx + "'>";
			c += "<button class='sc_face_pick sc_inline_btn' data-expr-idx='" + idx + "'>Pick...</button>";
			c += "</div>";
			c += "</div>";
			c += "<button class='sc_del_expr' data-expr-idx='" + idx + "'>×</button>";
			c += "</div>";
		});
	}

	// Delete character
	c += "<div class='sc_danger_zone'>";
	c += "<button id='sc_delete_char'>Delete Character</button>";
	c += "</div>";

	c += "</div>"; // sc_char_form
	return c;
};

ScriptCharactersUI.prototype._hookUI = function() {
	var _this = this;
	var c = this._container;

	// List scroll tracking
	var fileList = c.querySelector('.loc_file_list');
	if (fileList) {
		fileList.addEventListener('scroll', function() { _this._listScrollTop = this.scrollTop; });
	}

	// Character selection
	c.querySelectorAll('.loc_file_entry[data-key]').forEach(function(el) {
		el.addEventListener('click', function() {
			_this._currentKey = this.getAttribute('data-key');
			_this.show();
		});
	});

	// Save
	var saveBtn = c.querySelector('#sc_save');
	if (saveBtn) {
		saveBtn.addEventListener('click', function() {
			_this._saveData();
			_this.show();
		});
	}

	// Reload
	var reloadBtn = c.querySelector('#sc_reload');
	if (reloadBtn) {
		reloadBtn.addEventListener('click', function() {
			if (_this._modified && !confirm('Discard unsaved changes?')) return;
			_this._data = null;
			_this._currentKey = null;
			_this.show();
		});
	}

	// Add character
	var addBtn = c.querySelector('#sc_add_char');
	if (addBtn) {
		addBtn.addEventListener('click', function() {
			var key = prompt('Character key:');
			if (!key || !key.trim()) return;
			key = key.trim();
			if (_this._data[key]) { alert('Key "' + key + '" already exists.'); return; }
			_this._data[key] = { nameVar: -1, expressions: {} };
			_this._currentKey = key;
			_this._setModified();
			_this.show();
		});
	}

	if (!this._currentKey) return;

	// Rename
	var renameBtn = c.querySelector('#sc_rename_btn');
	if (renameBtn) {
		renameBtn.addEventListener('click', function() {
			var newKey = c.querySelector('#sc_key_input').value.trim();
			if (!newKey || newKey === _this._currentKey) return;
			if (_this._data[newKey]) { alert('Key "' + newKey + '" already exists.'); return; }
			_this._data[newKey] = _this._data[_this._currentKey];
			delete _this._data[_this._currentKey];
			_this._currentKey = newKey;
			_this._setModified();
			_this.show();
		});
	}

	// nameVar
	var nameVarInput = c.querySelector('#sc_name_var');
	if (nameVarInput) {
		nameVarInput.addEventListener('change', function() {
			_this._data[_this._currentKey].nameVar = parseInt(this.value) || -1;
			_this._setModified();
		});
	}

	// actorId
	var actorIdInput = c.querySelector('#sc_actor_id');
	if (actorIdInput) {
		actorIdInput.addEventListener('change', function() {
			var val = parseInt(this.value) || 0;
			if (val === 0) {
				delete _this._data[_this._currentKey].actorId;
			} else {
				_this._data[_this._currentKey].actorId = val;
			}
			_this._setModified();
		});
	}

	// Add expression
	var addExprBtn = c.querySelector('#sc_add_expr');
	if (addExprBtn) {
		addExprBtn.addEventListener('click', function() {
			var char = _this._data[_this._currentKey];
			if (!char.expressions) char.expressions = {};
			var existing = Object.keys(char.expressions).map(Number);
			var newIdx = existing.length > 0 ? Math.max.apply(null, existing) + 1 : 0;
			char.expressions[String(newIdx)] = { face: '', index: 0 };
			_this._setModified();
			_this.show();
		});
	}

	// Delete character
	var delCharBtn = c.querySelector('#sc_delete_char');
	if (delCharBtn) {
		delCharBtn.addEventListener('click', function() {
			if (!confirm('Delete character "' + _this._currentKey + '"?')) return;
			delete _this._data[_this._currentKey];
			_this._currentKey = null;
			_this._setModified();
			_this.show();
		});
	}

	// Expression key rename
	c.querySelectorAll('.sc_expr_key_input').forEach(function(input) {
		input.addEventListener('change', function() {
			var oldIdx = this.getAttribute('data-expr-idx');
			var newIdx = this.value.trim();
			if (!newIdx || newIdx === oldIdx) return;
			var expressions = _this._data[_this._currentKey].expressions;
			if (expressions[newIdx] != null) { alert('Index "' + newIdx + '" already exists.'); this.value = oldIdx; return; }
			expressions[newIdx] = expressions[oldIdx];
			delete expressions[oldIdx];
			_this._setModified();
			_this.show();
		});
	});

	// Expression name
	c.querySelectorAll('.sc_expr_name').forEach(function(input) {
		input.addEventListener('change', function() {
			var idx = this.getAttribute('data-expr-idx');
			var val = this.value.trim();
			if (val) {
				_this._data[_this._currentKey].expressions[idx].name = val;
			} else {
				delete _this._data[_this._currentKey].expressions[idx].name;
			}
			_this._setModified();
		});
	});

	// Face name inputs
	c.querySelectorAll('.sc_face_name').forEach(function(input) {
		input.addEventListener('change', function() {
			var idx = this.getAttribute('data-expr-idx');
			_this._data[_this._currentKey].expressions[idx].face = this.value;
			_this._setModified();
			var faceIdx = parseInt(c.querySelector('.sc_face_idx[data-expr-idx="' + idx + '"]').value) || 0;
			var portrait = c.querySelector('.sc_expr_entry[data-expr-idx="' + idx + '"] .sc_expr_portrait');
			if (portrait && this.value) FaceManager.loadFaceByParams(this.value, faceIdx, portrait);
		});
	});

	// Face index inputs
	c.querySelectorAll('.sc_face_idx').forEach(function(input) {
		input.addEventListener('change', function() {
			var idx = this.getAttribute('data-expr-idx');
			_this._data[_this._currentKey].expressions[idx].index = parseInt(this.value) || 0;
			_this._setModified();
			var faceName = _this._data[_this._currentKey].expressions[idx].face;
			var portrait = c.querySelector('.sc_expr_entry[data-expr-idx="' + idx + '"] .sc_expr_portrait');
			if (portrait && faceName) FaceManager.loadFaceByParams(faceName, parseInt(this.value) || 0, portrait);
		});
	});

	// Face pick buttons
	c.querySelectorAll('.sc_face_pick').forEach(function(btn) {
		btn.addEventListener('click', function(e) {
			var idx = this.getAttribute('data-expr-idx');
			var expr = _this._data[_this._currentKey].expressions[idx];
			FaceManager.showFaceSelector(e, expr.face || '', expr.index || 0, this).then(function(result) {
				if (result.status === 'updated') {
					expr.face = result.faceName;
					expr.index = parseInt(result.faceIndex) || 0;
					_this._setModified();
					_this.show();
				}
			});
		});
	});

	// Delete expression buttons
	c.querySelectorAll('.sc_del_expr').forEach(function(btn) {
		btn.addEventListener('click', function() {
			var idx = this.getAttribute('data-expr-idx');
			delete _this._data[_this._currentKey].expressions[idx];
			_this._setModified();
			_this.show();
		});
	});

	// Load portraits
	c.querySelectorAll('.sc_expr_portrait[data-facename]').forEach(function(el) {
		var faceName = el.getAttribute('data-facename');
		var faceIndex = parseInt(el.getAttribute('data-faceindex')) || 0;
		if (faceName) FaceManager.loadFaceByParams(faceName, faceIndex, el);
	});
};

ScriptCharactersUI.prototype._setModified = function() {
	this._modified = true;
	if (this._mainUIHandler) this._mainUIHandler.setModified();
};
