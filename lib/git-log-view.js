var GitLogView = require("./git-log-class");
var BufferedProcess = require("atom").BufferedProcess;
var LogParser = require("./logparser");
var GitGraph = require("./gitgraph");
var $ = require("atom").$;

var __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
};

var safe_tags = function(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
};

GitLogView.prototype.initialize = function(repo_name) {
    var settings = atom.config.getSettings();

    this.info_panel.hide();
    this.path = repo_name;
    this.font_size = settings.editor.fontSize * settings['git-log'].fontScale;
    this.line_height = Math.round(this.font_size * settings.editor.lineHeight);
    this.get_log();

    this.resize_started = __bind(this.resize_started, this);
    this.resize_table = __bind(this.resize_table, this);
    this.resize_stopped = __bind(this.resize_stopped, this);
    this.hide = __bind(this.info_panel.hide, this);
}

GitLogView.prototype.get_log = function() {
    this.log = null;
    var concat = function(self) {
        return function(data) {
            if(self.log == null) {
                self.log = "";
            }
            self.log += data;
        }
    }(this);

    var display_log = function(self) {
        return function(data) {
            self.log_callback();
        }
    }(this);

    var args = ['log', '--decorate=full', '--date=default', '--pretty=fuller', '--all', '--parents', '--numstat', '--topo-order', '--raw'];
    var options = {};
    options.cwd = atom.project.getRepo().getWorkingDirectory();
    return new BufferedProcess({
        command: 'git',
        args: args,
        options: options,
        stdout: concat,
        stderr: function(data) {console.log(data.toString())},
        exit: display_log
    });
};

GitLogView.prototype.log_callback = function(data) {
    this.parser();

    this.min_width = Math.floor(this.width()/10);

    this.fill_content();
    this.on('mousedown', '.resize-handle', (function(self) {
        return function(e) {
            self.resize_started(e);
        };
    })(this));
    this.on('core:cancel core:close', (function(self) {
        return function(e) {
            self.info_panel.hide();
        };
    })(this));
};

GitLogView.prototype.parser = function() {
    this.log = LogParser(this.log);
    var graph = new GitGraph(this.main_panel.graph.list, this.log, this.line_height);
};

GitLogView.prototype.fill_content = function() {
    var i, len;
    var main_panel = this.main_panel;
    for(i=0; len = this.log.length, i < len; i++) {
        var log = this.log[i];
        main_panel.comments.add_content(log.message);
        main_panel.commit.add_content(log.sha1.slice(0,7));

        var date = log.author_date.split(/ /);

        main_panel.date.add_content(date[2] + ' ' + date[1] + ' ' + date[4] + ' ' + date[3].slice(0,5));
        main_panel.author.add_content(log.author_name + ' <' + log.author_email + '>');
    }

    this.css({
        'font-size': this.font_size + 'px',
        'line-height': this.line_height + 'px'
    });

    // create background for the graph column by adding inline style sheet
    var style = document.createElement("style");
    this.append(style);
    var sheet = style.sheet;
    var width = main_panel.graph.outerWidth();
    var left = width + 1;
    sheet.addRule(".comments p::before, .comments p::after",
        "width:" + width + "px;" +
        "left: -" + left + "px;"
    );

    // click handlers for each commit added to parent
    main_panel.table.on("click", "p", (function(self) {
        return function(e) {
            if(!self.info_panel.isVisible())
                self.info_panel.show();

            self.info_panel.info_data.empty();
            self.info_panel.info_image.empty();
            self.info_panel.info_file.find('.list').empty();
            var line_no = $(this).index();
            var commit_data = self.log[line_no];

            // background line higlighting
            if(self.previous_line != null)
                self.main_panel.find('p:nth-child(' + self.previous_line + ')')
                    .css('background-color', '');

            self.previous_line = line_no + 1;
            self.main_panel.find('p:nth-child(' + self.previous_line + ')')
                    .css('background-color', 'rgba(13,128,215,0.65)');
            
            self.info_panel.add_content("Commit:", commit_data.sha1 + " [" + commit_data.sha1.slice(0,7) +"]" );
            self.info_panel.add_content("Parents:", commit_data.parents.map(function(str) {
                    return str.slice(0,10);
                }).join(", ")
            );
            self.info_panel.add_content("Author:", commit_data.author_name + ' <' + commit_data.author_email + '>');
            var date = commit_data.author_date.split(/ /);
            self.info_panel.add_content("Date:", date[2] + ' ' + date[1] + ' ' + date[4] + ' ' + date[3].slice(0,8))
            
            // add committer related information
            if(commit_data.committer_name != commit_data.author_name) {
                self.info_panel.add_content("Committer:", commit_data.committer_name + ' <' + commit_data.committer_email + '>');
                date = commit_data.commit_date.split(/ /);
                self.info_panel.add_content("Commit Date:", date[2] + ' ' + date[1] + ' ' + date[4] + ' ' + date[3].slice(0,8))
            }

            // remove refs/heads or refs/remotes
            if(commit_data.refs.length > 0)
                self.info_panel.add_content("Labels:", commit_data.refs.map(function(str) {
                    return str.replace(/^.*\/(remotes|heads)\//,'');
                }).join(", "));
            self.info_panel.info_data.append('<p>' + safe_tags(commit_data.message).replace(/\n/g, '<br>') + "</p>");
            self.info_panel.info_image.append('<img src="' + safe_tags(self.get_image(commit_data.author_email)) + '"/>')

            if(commit_data.committer_name != commit_data.author_name) {
                self.info_panel.info_image.append('<img src="' + safe_tags(self.get_image(commit_data.committer_email)) + '"/>')
            }

            // fill the file information
            var i, len, temp, status_text;

            self.info_panel.info_file.show();
            if(commit_data.file_line_diffs.length == 0)
                self.info_panel.info_file.hide();

            for(i=1; len=commit_data.file_line_diffs.length, i<len;i++) {
                temp = commit_data.file_line_diffs[i];

                if(temp[3] == 'A')
                    status_text = 'added';
                else if(temp[3] == 'D')
                    status_text = 'deleted';
                else
                    status_text = 'modified';
                self.info_panel.status.add_content(status_text);
                
                index = temp[2].lastIndexOf('/');
                self.info_panel.name.add_content(temp[2].slice(index + 1));
                self.info_panel.path.add_content(
                    (index >= 0) ? temp[2].slice(0, index) : ''
                );
                
                self.info_panel.addition.add_content(temp[0]);
                self.info_panel.deletion.add_content(temp[1]);
            }
        };
    })(this));
}

GitLogView.prototype.getTitle = function() {
    return "Git-log: " + this.path;
};

GitLogView.prototype.getUri = function() {
    return "git-log://" + this.path;
};

GitLogView.prototype.get_image = function(email) {
    var crypto = require('crypto');
    var base = "http://www.gravatar.com/avatar/";
    return base + crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex') + "?s=64";
};

GitLogView.prototype.resize_started = function(event) {
    this.pos={};
    this.pos.pointer_x = event.pageX;
    this.pos.left = $(event.target).position().left;

    this.pos.left_col = $(event.target).parents('.column');
    this.pos.right_col = $(this.pos.left_col.next());

    this.pos.left_width = this.pos.left_col.width();
    this.pos.right_width = this.pos.right_col.width();

    $(document).on('mousemove.git-log', this.resize_table);
    $(document).on('mouseup.git-log', this.resize_stopped);
    return false;
};

GitLogView.prototype.resize_table = function(event) {
    if(!this.pos)
        return;

    var x = event.pageX - this.pos.pointer_x + this.pos.left;
    this.pos.x = x;

    var inc = this.pos.x - this.pos.left;

    var w = this.pos.left_width + inc;
    var w2 = this.pos.right_width - inc;

    w = Math.max(this.min_width, w);
    w2 = Math.max(this.min_width, w2);

    //this.pos.left_col.width(w + 'px');
    //this.pos.right_col.width(w2 + 'px');

    this.pos.left_col.css('flex-basis', w + 'px');
    this.pos.right_col.css('flex-basis', w2 + 'px');
    return false;
}

GitLogView.prototype.resize_stopped = function(event) {
    this.pos = null;
    $(document).off('mousemove.git-log', this.resize_table);
    $(document).off('mouseup.git-log', this.resize_stopped);
}

module.exports = GitLogView;
