d3 = require('./../node_modules/d3');

function GitGraph(data) {
    this.config = this.set_config(20);
    this.set_position(data);
    var svg = this.render(data);
    return svg;
}

GitGraph.prototype.set_config = function(line_height) {
    var config = {};
    var circle_radius_percent = 20;
    var circle_stroke_percent = 8;
    var branch_spacing_percent = 60;
    var line_width_percent = 10;

    var percentage = function(percent) {
        return (line_height * percent)/100;
    }

    config.circle = {};
    config.circle.radius = percentage(circle_radius_percent);
    config.circle.stroke = percentage(circle_stroke_percent);
    config.circle_spacing = line_height;
    config.branch_spacing = percentage(branch_spacing_percent);
    config.line_width = percentage(line_width_percent);
    config.left_margin = line_height / 2;
    config.top_margin = line_height / 2;
    config.cross_height = 40/100;
    return config;
};

GitGraph.prototype.set_position = function(data) {
    var _i, _len;
    var curr_row, curr_col;
    var branches = [];

    curr_row = curr_col = 0;

    var get_free_column = function() {
        var i, len;
        for(i=0; len = branches.length, i < len; i++) {
            if(branches[i] == null)
                return i;
        }
        return len;
    }

    var update_branch = function(parent, col) {
        branches[col] = parent;
    }

    var create_branch = function(commit) {
        var i, len, index, my_col, par_col;
        var par, sha1;

        if((index = branches.indexOf(commit.sha1)) > -1) {
            my_col = index;
        }
        else {
            my_col = get_free_column();
        }
        while((index = branches.indexOf(commit.sha1)) > -1) {
            branches[index] = null;
        }

        for(i=0; len = commit.parents.length, i < len; i++) {
            par = commit.parents[i];

            if((index = branches.indexOf(par)) > -1) {
                if((branches[my_col] == null))
                    update_branch(par, my_col);
            }
            else {
                if(len == 1 || i == 0) {
                    // dont create new branch
                    update_branch(par, my_col);
                }
                else {
                    par_col = get_free_column();
                    update_branch(par, par_col);
                }
            }
        }
        return my_col;
    }

    for(_i=0; _len = data.length, _i < _len; _i++) {
        var commit = data[_i];
        var position = {};

        position.column = create_branch(commit);
        position.row = curr_row++;
        commit.position = position;
   }
}

GitGraph.prototype.commit_search = function(data, commit) {
    var i, len;
    for(i=0; len = data.length, i < len; i++) {
        if(data[i].sha1 === commit)
            return i;
    }
};

GitGraph.prototype.lines = function(data) {
    var create_mid_point = function(start, end, height) {
        var point = {};
        if(start.x == end.x) {
            return false;
        }
        else if(start.x < end.x) {
            point.x = end.x;
            point.y = start.y + height;
        }
        else {
            point.x = start.x;
            point.y = end.y - height;
        }
        return point;
    };

    var i, len;
    var height = this.config.cross_height;
    var line_array = [];
    for(i=0; len = data.length, i < len; i++) {
        var commit, j, _len;
        commit = data[i];

        for(j=0; _len = commit.parents.length, j < _len; j++) {
            var line = [];
            var p1,p2,p3;
            p1={}; p2={}; p3={};

            p1.x = commit.position.column;
            p1.y = commit.position.row;
            line.push(p1);

            var index = this.commit_search(data, commit.parents[j]);
            var parent = data[index];
            p3.x = parent.position.column;
            p3.y = parent.position.row;

            if((p2 = create_mid_point(p1, p3, height)) !== false) {
                line.push(p2);
            }

            line.push(p3);
            line_array.push(line);
        }
    }
    return line_array;
};

GitGraph.prototype.render = function(data) {
    var line_array = this.lines(data);
    var self = this;
    var svg = d3.select("body").append("svg")
                .attr("width", 600)
                .attr("height", 4000);

    var line_group = svg.append("g");
    var circle_group = svg.append("g");

    circle_group
        .attr("stoke-width", function(d) { return self.config.circle.stroke })
        .attr("fill", "#aeaeae")
        .attr("stroke", "#000");

    var circles = circle_group.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return (self.config.left_margin + (d.position.column * self.config.branch_spacing)) })
            .attr("cy", function(d) { return (self.config.top_margin + (d.position.row * self.config.circle_spacing)) })
            .attr("r", function(d) { return self.config.circle.radius });

    var line = d3.svg.line()
            .x(function(d) { return (self.config.left_margin + (d.x * self.config.branch_spacing)); })
            .y(function(d) { return (self.config.top_margin + (d.y * self.config.circle_spacing)); });

    line_group
        .attr("stroke", "#000")
        .attr("stroke-width", this.config.line_width)
        .attr("fill", "none");

    var lines = line_group
            .selectAll("path")
            .data(line_array)
            .enter()
            .append("path")
            .attr("d", line);

    return svg;
};


module.exports = GitGraph;
