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
    var circle_stroke_percent = 5.5;
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
    var _i, _len;
    var curr_row, curr_col;
    curr_row = curr_col = 0;
    this.branches = [];

    for(_i=0; _len = data.length, _i < _len; _i++) {
        var commit = data[_i];
        var position = {};

        // I am the first commit
        if(_i == 0) {
            position.row = position.column = 0;
            commit.position = position;
            curr_row++;
            continue;
        }

        position.row = curr_row++;
        position.column = curr_col;
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
