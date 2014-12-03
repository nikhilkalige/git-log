var GitLogInput = require("./git-log-input-class");

GitLogInput.prototype.initialize = function(uri) {
    this.uri = uri;
    this.on('core:confirm', (function(self) {
        return function(e) {
            self.confirm();
        };
    })(this));

    this.on('core:cancel', (function(self) {
        return function(e) {
            self.detach();
        };
    })(this));

    this.attach();
}

GitLogInput.prototype.toggle = function() {
    if(this.hasParent()) {
      return this.detach;
    }
    else {
      return this.attach();
    }
}

GitLogInput.prototype.confirm = function() {
    var page, uri;
    count = this.inputEditor.getText();
    if(isNaN(count))
        return;
    uri = this.uri + count;
    atom.workspace.open(uri);
    return this.detach();
};

GitLogInput.prototype.attach = function() {
    atom.workspaceView.append(this);
    return this.inputEditor.focus();
};

GitLogInput.prototype.detach = function() {
    var selectEditorFocused;
    if (!this.hasParent()) {
        return;
    }
    selectEditorFocused = this.inputEditor.isFocused;
    this.inputEditor.setText('');
    GitLogInput.__super__.detach.apply(this, arguments);
};

module.exports = GitLogInput;
