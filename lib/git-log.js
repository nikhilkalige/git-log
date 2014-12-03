var url = require('url');
var path = require('path');

module.exports = {
    configDefaults: {
        fontScale: 1.2,
        commitLimit: 100
    },

    activate: function() {
        atom.workspaceView.command("git-log:show", function(event) {
            trigger_open(null, null);
        })

        atom.workspaceView.command("git-log:show-from", function(event) {
            var path;
            if((path = check_repo_validity()) !== null) {
                var uri = "git-log://" + path + '?';
                var GitLogInput = require('./git-log-input');
                return new GitLogInput(uri);
            }
        })

        return atom.workspace.registerOpener(function(uri) {
            var error, host, pathname, protocol, ref, para;
            try {
                ref = url.parse(uri);
                protocol = ref.protocol;
                host = ref.host;
                pathname = ref.pathname;
                query = ref.query;
            }
            catch (_error) {
                error = _error;
                return;
            }

            if(protocol !== "git-log:")
                return;

            uri = uri.split('?')[0];
            var old_pane = atom.workspace.paneForUri(uri);
            if (old_pane) {
                old_pane.destroyItem(old_pane.itemForUri(uri));
            }

            para = query.split('/');
            var GitLogView = require('./git-log-view');
            return new GitLogView(host, para[0], para[1]);
        });
    }
};

var trigger_open = function(commit_skip, current_file) {
    var path;
    if((path = check_repo_validity()) !== null) {
        var uri = "git-log://" + path + '?';
    }
    if((commit_skip == null) & (current_file == null)) {
        atom.workspace.open(uri + '0' + '/' + '0');
    }
    else if((commit_skip != null) & (current_file == null)) {
        atom.workspace.open(uri + commit_skip + '/' + 0);
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
