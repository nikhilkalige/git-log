var url = require('url');

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
            /** Check valid repository */
            var repository = Promise.all(atom.project.getDirectories().map(
                atom.project.repositoryForDirectory.bind(atom.project)));
            repository.then(function(repos) {
                if(repos.length > 0) {
                    var repo_list = [];
                    var name;

                    for(var i=0; i<repos.length; i++) {
                        if(repos[i] == null)
                            continue;
                        repos[i].repo_name = repos[i].getWorkingDirectory().match(/([^\/]*)\/*$/)[1];
                        repo_list.push(repos[i]);
                    }
                    var RepoView = require('./git-repo-list.coffee');

                    new RepoView(repo_list);
                }
            });


            /*var path;
            if((path = check_repo_validity()) !== null) {
                var uri = "git-log://" + path;
                var old_pane = atom.workspace.paneForUri(uri);
                if (old_pane) {
                    old_pane.destroyItem(old_pane.itemForUri(uri));
                }
                atom.workspace.open(uri);
            }*/
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
    var repository = Promise.all(atom.project.getDirectories().map(
        atom.project.repositoryForDirectory.bind(atom.project)))

    repository.then(function(repos) {
        if(repos.length > 0)
            return repos;
        else
            return null;
    });

    return null;
    /*if(repository !== null) {
        var repo_path = repository.getWorkingDirectory();
        return path.basename(repo_path);
    }
    else {
        return null;
    }*/
};
