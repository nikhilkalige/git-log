var url = require('url');
var path = require('path');

module.exports = {
    configDefaults: {
        fontScale: 1.2
    },

    activate: function() {
        atom.workspaceView.command("git-log:show", function(event) {
            var path;
            if((path = check_repo_validity()) !== null) {
                var uri = "git-log://" + path;
                var old_pane = atom.workspace.paneForUri(uri);
                if (old_pane) {
                    old_pane.destroyItem(old_pane.itemForUri(uri));
                }
                atom.workspace.open(uri);
            }
        })
        
        atom.workspaceView.command("git-log:show-for-current-file", function(event) {
            var repo = check_repo_validity();
            var file = check_current_file();
            if(repo !== null && file !== null) {
                var uri = "git-log://" + repo + '/' + file;
                var old_pane = atom.workspace.paneForUri(uri);
                if (old_pane) {
                    old_pane.destroyItem(old_pane.itemForUri(uri));
                }
                atom.workspace.open(uri);
            }
        });

        return atom.workspace.registerOpener(function(uri) {
            var error, host, pathname, protocol, ref;
            try {
                ref = url.parse(uri);
                protocol = ref.protocol;
                host = ref.host;
                pathname = ref.pathname;
            }
            catch (_error) {
                error = _error;
                return;
            }

            if(protocol !== "git-log:") {
                return;
            }
            var GitLogView = require('./git-log-view');
            return new GitLogView(host, pathname);
        });
    }
};

var check_repo_validity = function() {
    var repository = atom.project.getRepo();
    if(repository !== null) {
        var repo_path = repository.getWorkingDirectory();
        return path.basename(repo_path);
    }
    else {
        return null;
    }
}

var check_current_file = function() {
    var repo = atom.project.getRepo();
    var editor = atom.workspace.getActiveTextEditor();
    var filePath = (editor && editor.getPath()) ?
        repo.relativize(editor.getPath()) : null;
    
    if(filePath &&
      !repo.isPathIgnored(filePath) &&
      !/^(\/|\.\.)/.test(filePath)) {
      return filePath;
    }
    else {
      return null;
    }
};
