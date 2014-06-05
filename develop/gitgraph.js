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
    return config;
};

GitGraph.prototype.set_position = function(data) {
    var _i, _len, _col;
    var curr_row, curr_col;
    var branch_flag;
    var branches = [];

    curr_row = curr_col = 0;
    this.branches = [];
    branch_flag = false;

    var branch_search = function(commit) {
        var i, len;
        for(i=0; len = branches.length, i < len; i++) {
            if(commit.parents.indexOf(branches[i].parent) > -1) {
                //branches.splice(i, 1);
                return branches[i].column;
            }
        }
        return false;
    }

    for(_i=0; _len = data.length, _i < _len; _i++) {
        var commit = data[_i];
        var position = {};

        // Am i branching???
        if(commit.parents.length > 1) {
            var branch = {};
            branch.parent = commit.parents[0];
            branch.column = curr_col;
            branches.push(branch);
            branch_flag = true;
        }

        // skip parent check for current commit
        if(branch_flag) {
            position.column = curr_col;
            curr_col++;
            branch_flag = false;
        }
        else if((_col = branch_search(commit)) !== false) {
            position.column = curr_col;
            curr_col = _col;
        }
        else {
            position.column = curr_col;
        }
        position.row = curr_row++;
        commit.position = position;
   }
}

GitGraph.prototype.render = function(data) {
    var self = this;
    var svg = d3.select("body").append("svg")
                .attr("width", 600)
                .attr("height", 600);

    var circles = svg.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle");

    var circle_attributes = circles
                            .attr("cx", function(d) { return (self.config.left_margin + (d.position.column * self.config.branch_spacing)) })
                            .attr("cy", function(d) { return (self.config.top_margin + (d.position.row * self.config.circle_spacing)) })
                            .attr("r", function(d) { return self.config.circle.radius })
                            .attr("stoke-width", function(d) { return self.config.circle.stroke })
                            .attr("fill", "#aeaeae")
                            .attr("stroke", "#000");
    return svg;
};


module.exports = GitGraph;
