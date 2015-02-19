var url = require('url');
var path = require('path');

module.exports = {
    config: {
      fontScale: {
        type: 'number',
        default: 1.2,
        minimum: 0.5,
        maximum: 3
      },
      fontFamily: {
        type: 'string',
        default: "Inconsolata, Monaco, Consolas, 'Courier New', Courier"
      }
    },
    activate: function() {
        atom.commands.add("atom-workspace", "git-log:show", function(event) {
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

        return atom.workspace.addOpener(function(uri) {
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
