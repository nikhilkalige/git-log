var url = require('url');
var path = require('path');

module.exports = {
    activate: function() {
        atom.workspaceView.command("git-log:show", function(event) {
            open_log_window();
        })

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
            return new GitLogView(host);
        });
    }
};

var open_log_window = function() {
    var path;
    if((path = check_repo_validity()) !== null) {
        //var id = atom.workspace.getActiveEditor().id;
        uri = "git-log://" + path;
        atom.workspace.open(uri);
    }
}

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
