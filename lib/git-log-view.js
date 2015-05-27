var GitLogView = require("./git-log-class");
var BufferedProcess = require("atom").BufferedProcess;
var LogParser = require("./logparser");
var GitGraph = require("./gitgraph");
var $ = require("atom-space-pen-views").$;

var __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
};

var safe_tags = function(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
};

GitLogView.prototype.initialize = function(repo) {
    var editorFontSize = atom.config.get('editor.fontSize');
    var editorLineHeight = atom.config.get('editor.lineHeight');
    var fontScale = atom.config.get('git-log.fontScale');
    this.font_family = atom.config.get('git-log.fontFamily');
    this.repo = repo;
    this.info_panel.hide();
    this.path = repo.repo_name;

    this.font_size = editorFontSize * fontScale;
    this.line_height = Math.round(this.font_size * editorLineHeight);

    this.get_log();

    //this.resize_started = __bind(this.resize_started, this);
    //this.resize_table = __bind(this.resize_table, this);
    //this.resize_stopped = __bind(this.resize_stopped, this);
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
    options.cwd = this.repo.getWorkingDirectory();

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

    //this.min_width = Math.floor(this.width()/10);

    this.fill_content();
    /**
    this.on('mousedown', '.resize-handle', (function(self) {
        return function(e) {
            self.resize_started(e);
        };
    })(this));
**/
    atom.commands.add('.git-log', 'core:cancel', (function(self) {
        return function(e) {
            self.info_panel.hide();
        };
    })(this));

    atom.commands.add('.git-log', 'core:close', (function(self) {
        return function(e) {
            self.info_panel.hide();
        };
    })(this));

    atom.commands.add('.git-log', 'core:move-up', (function(self) {
        return function(e) {
            if((self.previous_line == null) || (self.previous_line == 1))
                return;

            var data = self.get_target_line(null, self.previous_line - 1);
            self.handle_scroll(data[0], 1);
            self.select_display_info(data[0], data[1]);
        };
    })(this));

    atom.commands.add('.git-log', 'core:move-down', (function(self) {
        return function(e) {
            if((self.previous_line == null) || (self.previous_line == self.log.length))
                return;

            var data = self.get_target_line(null, self.previous_line + 1);
            self.handle_scroll(data[0], 0);
            self.select_display_info(data[0], data[1]);
        };
    })(this));
};

GitLogView.prototype.parser = function() {
    this.log = LogParser(this.log);
    var graph = new GitGraph(this.main_panel.graph, this.log, this.line_height, 2);
};

GitLogView.prototype.fill_content = function() {
    var create_main_row = function(log) {
        var html = '<tr><td><p> &nbsp;</p></td>';
        html += '<td><p>' + log.message.split('\n')[0] + '</p></td>';
        html += '<td><p>' + log.sha1.slice(0, 7)+ '</p></td>';

        var date = log.author_date.split(/ /);

        html += '<td><p>' + date[2] + ' ' + date[1] + ' ' + date[4] + ' ' + date[3].slice(0,5) + '</p></td>'
        html += '<td><p>' + log.author_name +  '</p></td>'
        html += '</tr>'

        return html;
    };

    var set_widths = function(svg_width) {
        var total = main_panel.width();
        var diff = total - svg_width;

        // allocate widths in this ratio 70:10:10:10
        main_panel.comments.width(diff * .7);
        diff = diff * 0.1;
        main_panel.commit.width(diff);
        main_panel.date.width(diff);
        main_panel.author.width(diff);
    }

    var i, len;
    var main_panel = this.main_panel;
    for(i=0; len = this.log.length, i < len; i++) {
        var log = this.log[i];
        main_panel.body.append(create_main_row(log));
    }

    this.css({
        'font-family': this.font_family,
        'font-size': this.font_size + 'px',
        'line-height': this.line_height + 'px'
    });

    main_panel.graph.css('top', main_panel.find('thead').height());

    var svg_width = main_panel.graph.width();
    main_panel.find('thead th:first-child').width(svg_width);
    set_widths(svg_width);

    main_panel.body.on("click", "tr", (function(self) {
        return function(e) {
            var data = self.get_target_line(e);
            self.select_display_info(data[0], data[1]);
        };
    })(this));
}

GitLogView.prototype.getTitle = function() {
    return "Git-log: " + this.path;
};

GitLogView.prototype.getURI = function() {
    return "git-log://" + this.path;
};

GitLogView.prototype.onDidChangeTitle = function() {
    return;
};

GitLogView.prototype.onDidChangeModified = function() {
    return;
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

GitLogView.prototype.get_target_line = function(event, line) {
    var line_no, target;
    if(event == null) {
        line_no = line;
        target = this.main_panel.body.find('tr:nth-child(' + line_no + ')');
    }
    else {
        line_no = $(event.currentTarget).index() + 1;
        target = $(event.currentTarget);
    }
    return [target, line_no];
};

GitLogView.prototype.handle_scroll = function(target, dir) {
    var offset_trigger = 3;
    var line_height = $(target).height() + 2; // accounting for the margin
    offset_trigger = offset_trigger * line_height;
    var window_height = this.main_panel.height();
    // move up
    if(dir == 1) {
        if(target.offset().top < offset_trigger) {
            this.main_panel.scrollTop(this.main_panel.scrollTop() - line_height);
        }
    }

    else if(dir == 0) {
        if(target.offset().top > (window_height - offset_trigger)) {
            this.main_panel.scrollTop(this.main_panel.scrollTop() + line_height);
        }
    }
};

GitLogView.prototype.select_display_info = function(target, line_no) {
    if(!this.info_panel.isVisible())
        this.info_panel.show();

    this.info_panel.info_data.empty();
    this.info_panel.info_image.empty();
    this.info_panel.body.empty();

    var commit_data = this.log[line_no - 1];

    // background line higlighting
    if(this.previous_line != null)
        this.main_panel.body.find('tr:nth-child(' + this.previous_line + ')')
            .removeClass('log-highlight');

    this.previous_line = line_no;
    target.addClass('log-highlight');

    this.info_panel.add_content("Commit:", commit_data.sha1 + " [" + commit_data.sha1.slice(0,7) +"]" );
    this.info_panel.add_content("Parents:", commit_data.parents.map(function(str) {
            return str.slice(0,10);
        }).join(", ")
    );
    this.info_panel.add_content("Author:", commit_data.author_name + ' <' + commit_data.author_email + '>');
    var date = commit_data.author_date.split(/ /);
    this.info_panel.add_content("Date:", date[2] + ' ' + date[1] + ' ' + date[4] + ' ' + date[3].slice(0,8))

    // add committer related information
    if(commit_data.committer_name != commit_data.author_name) {
        this.info_panel.add_content("Committer:", commit_data.committer_name + ' <' + commit_data.committer_email + '>');
        date = commit_data.commit_date.split(/ /);
        this.info_panel.add_content("Commit Date:", date[2] + ' ' + date[1] + ' ' + date[4] + ' ' + date[3].slice(0,8))
    }

    // remove refs/heads or refs/remotes
    if(commit_data.refs.length > 0)
        this.info_panel.add_content("Labels:", commit_data.refs.map(function(str) {
            return str.replace(/^.*\/(remotes|heads)\//,'');
        }).join(", "));
    this.info_panel.info_data.append('<p>' + safe_tags(commit_data.message).replace(/\n/g, '<br>') + "</p>");
    this.info_panel.info_image.append('<img src="' + safe_tags(this.get_image(commit_data.author_email)) + '"/>')

    if(commit_data.committer_name != commit_data.author_name) {
        this.info_panel.info_image.append('<img src="' + safe_tags(this.get_image(commit_data.committer_email)) + '"/>')
    }

    // fill the file information
    var i, len, temp, status_text;

    var create_row = function(temp) {
        var temp, status_text, index;
        var html = '<tr>';

        if(temp[3] == 'A')
            status_text = 'added';
        else if(temp[3] == 'D')
            status_text = 'deleted';
        else
            status_text = 'modified';
        html += '<td><p>' + status_text + '</p></td>';

        index = temp[2].lastIndexOf('/');
        html += '<td><p>' + temp[2].slice(index + 1) + '</p></td>';
        html += '<td><p>' + ((index >= 0) ? temp[2].slice(0, index) : '&nbsp;') + '</p></td>'
        html += '<td><p>' + temp[0] +  '</p></td>';
        html += '<td><p>' + temp[1] +  '</p></td>';
        html += '</tr>';

        return html;
    };

    this.info_panel.info_file.show();
    if(commit_data.file_line_diffs.length == 0)
        this.info_panel.info_file.hide();

    var i, len, temp;
    for(i=1; len=commit_data.file_line_diffs.length, i<len;i++) {
        temp = create_row(commit_data.file_line_diffs[i]);
        this.info_panel.body.append(temp);
    }
};

module.exports = GitLogView;
