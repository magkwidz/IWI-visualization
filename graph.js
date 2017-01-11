/**
 * Created by magda_000 on 11/12/2016.
 */

$(function() {

var	margin = {top: 200, right: 50, bottom: 60, left: 50};
var width = $( window ).width() - margin.left - margin.right;
var height = $( window ).height() - margin.top - margin.bottom;

var factor = 3;
var farDistance = 200;
var precision = 2;
var radius = 5;

var color = d3.scale.category20();

function toFixed(value, precision) {
    var precision = precision || 0,
        power = Math.pow(10, precision),
        absValue = Math.abs(Math.round(value * power)),
        result = (value < 0 ? '-' : '') + String(Math.floor(absValue / power));

    if (precision > 0) {
        var fraction = String(absValue % power),
            padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
        result += '.' + padding + fraction;
    }
    return result;
}


Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
}

var force = d3.layout.force()
    .charge(-120)
    .gravity(0.01)
    .linkDistance(function (d) {
        return d.distance;
    })
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.csv("full.csv").get(function (error, rows) {

    var groups=[];
    var graph = {
        "nodes": [],
        "links": []
    }
    for (var i = 0; i < rows.length; i++) {
        var node = {};
        node.name = rows[i].lang;
        node.group = rows[i].group;
        node.root = false;
        node.hasLink = false;
        graph.nodes.push(node);
        groups.push(rows[i].group);
    }

    //var res = Math.max.apply(Math,graph.nodes.map(function(o){return o.group;}))
    //alert('Max group = ' + res);

    for (var i = 0; i < rows.length; i++) {
        for (var j = 0; j < graph.nodes.length; j++) {

            if (i < j && (rows[i].group === rows[j].group )) {
                var link = {};
                link.source = i;
                link.target = j;
                link.value = 2;
                link.group = rows[i].group;
                link.gSource = rows[i].group;
                link.gTarget = rows[j].group;
                link.root = false,
                link.distance = 10;
                graph.nodes[i].hasLink = true;
                graph.nodes[j].hasLink = true;
                graph.links.push(link);
            }
        }
    }

    // adding any link to group those without any groups
    for (var i = 0; i < graph.nodes.length; i++) {
        if (!graph.nodes[i].hasLink) {
            var smallest = 10;
            var smallestIndex = -1;
            for (var j = 0; j < rows.length; j++) {
                if (i != j) {
                    var distance = parseFloat(rows[i][graph.nodes[j].name]);
                    if (distance < smallest) {
                        smallest = distance;
                        smallestIndex = j;
                    }
                }
            }
            var link = {};
            link.source = i;
            link.target = smallestIndex;
            link.value = 1;
            link.group = "noGroup";
            link.gSource = rows[i].group;
            link.gTarget = rows[smallestIndex].group;
            link.root = false,
            link.distance = farDistance;
            graph.links.push(link);
        }
    }

    // add nodes of all groups
    var uniquesGroups = groups.unique();
    for (var i = 0; i < uniquesGroups.length; i++) {
        var node = {};
        node.group = uniquesGroups[i];
        node.name = "Grupa: " + node.group;
        node.root = true;
        node.hasLink = false;
        graph.nodes.push(node);
    }

    // add links between groups where there are less than two links
    var newLinks = [
        {source: 1, target: 19, value: 1, root: false, group:"noGroup", gSource: rows[1].group, gTarget: rows[19].group , distance: farDistance},
        {source: 1, target: 15, value: 1, root: false, group:"noGroup", gSource: rows[1].group, gTarget: rows[15].group, distance: farDistance},
        {source: 25, target: 5, value: 1, root: false, group:"noGroup", gSource: rows[25].group, gTarget: rows[5].group, distance: farDistance},
        {source: 16, target: 12, value: 1, root: false, group:"noGroup", gSource: rows[16].group, gTarget: rows[12].group, distance: farDistance},
        {source: 14, target: 4, value: 1, root: false, group:"noGroup", gSource: rows[14].group, gTarget: rows[4].group, distance: farDistance},
        {source: 12, target: 10, value: 1, root: false, group:"noGroup", gSource: rows[12].group, gTarget: rows[10].group, distance: farDistance},
        {source: 24, target: 15, value: 1, root: false, group:"noGroup", gSource: rows[24].group, gTarget: rows[15].group, distance: farDistance},
        {source: 27, target: 16, value: 1, root: false, group:"noGroup", gSource: rows[27].group, gTarget: rows[16].group, distance: farDistance},
        {source: 23, target: 3, value: 1, root: false, group:"noGroup", gSource: rows[23].group, gTarget: rows[3].group, distance: farDistance},
        {source: 6, target: 5, value: 1, root: false, group:"noGroup", gSource: rows[6].group, gTarget: rows[5].group, distance: farDistance},
        {source: 1, target: 19, value: 1, root: false, group:"noGroup", gSource: rows[1].group, gTarget: rows[19].group, distance: farDistance},
    ]

    for (var i = 0; i < newLinks.length; i++) {
        graph.links.push(newLinks[i]);
    }

    // recalculate distances based on their real distances
    // smallest - 5px, biggest - 80px
    var smallestDistance = 666.0;
    var biggestDistance = -1.0;
    for (var i = 0; i < rows.length; i++) {
        for (var j = i + 1; j < rows.length; j++) {
            var distance = parseFloat(rows[i][rows[j].lang]);
            if (distance < smallestDistance) {
                smallestDistance = distance;
            }
            if (distance > biggestDistance) {
                biggestDistance = distance;
            }
        }
    }

    for (var i = 0; i < graph.links.length; i++) {
        var foundDistance = parseFloat(rows[graph.links[i].source][rows[graph.links[i].target].lang]);
        graph.links[i].distance = 5.0 + 75.0 * (foundDistance - smallestDistance) / (biggestDistance - smallestDistance);
    }


    var currentLinks = graph.links.length;
    // add links for group to group
    for (var i = 0; i < currentLinks; i++) {
        if (graph.links[i].group === "noGroup") {
            var link = graph.links[i];
            console.log(graph.links[i]);
            var indexSource = graph.nodes.map(function(e) { return e.name; }).indexOf("Grupa: " + link.gSource);
            var indexTarget = graph.nodes.map(function(e) { return e.name; }).indexOf("Grupa: " + link.gTarget);
            graph.links.push({
                                source: indexSource,
                                target: indexTarget,
                                value: 1.8,
                                root: true,
                                group: "noGroup",
                                gSource: link.gSource,
                                gTarget: link.gTarget,
                                distance: link.distance
                            }
                        );
        }
    }


    force.nodes(graph.nodes);
    force.links(graph.links);


    force.linkDistance(function (link) {
       // console.log("Source:" + link.source.name + "--->" + " Target: " + link.target.name + "distance: " + link.distance);
        return factor * link.distance;
    });

    force.start();


    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    var link = svg.selectAll(".gLink")
        .data(graph.links)
        .enter().append("g")
        .attr("class", "gLink")
        .attr("group", function (d) {
            return (d.source.group === d.target.group) ? d.source.group : "noGroup";
        })
        .attr("gSource", function (d) {
            return d.source.group;
        })
        .attr("gTarget", function (d) {
            return d.target.group;
        })
        .attr("nSource", function (d) {
            return d.source.name;
        })
        .attr("nTarget", function (d) {
            return d.target.name;
        })
        .attr("distance", function (d) {
            return d.distance.toFixed(precision);
        })
        .append("line")
        .attr("class", "link")
        .attr("class", function (d) {
            return (d.value === 1) ? "link_dashed" :  (d.value === 2) ?  "link_continuous" : "link_dashed_root"
        })
        .style("stroke-width", function (d) {
            return d.value;
        })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // Append text to Link edges
    var linkText = svg.selectAll(".gLink")
        .data(force.links())
        .append("text")
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .attr("x", function(d) {
            if (d.target.x > d.source.x) { return (d.source.x + (d.target.x - d.source.x)/2); }
            else { return (d.target.x + (d.source.x - d.target.x)/2); }
        })
        .attr("y", function(d) {
            if (d.target.y > d.source.y) { return (d.source.y + (d.target.y - d.source.y)/2); }
            else { return (d.target.y + (d.source.y - d.target.y)/2); }
        })
        .attr("fill", "Black")
        .style("font", "normal 12px Arial")
        .attr("dy", ".25em")
        .text(function(d) {
            return d.distance.toFixed(precision) });

    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("group", function (d) {
            return d.group;
        })
        .attr("root", function (d) {
            return d.root;
        })
        .attr("class", function (d) {
            return (d.root) ? "node root" :  "node"
        })
        .attr("name", function (d) {
            return d.name;
        })
        .style("opacity", 1)
        .call(force.drag);

    node.append("circle")
        .attr("r", function(d) {
            return (d.hasLink === true) ? 2*radius : radius;
        })
        .attr("root", function(d) {
            return d.root;
        })
        .attr("group", function (d) {
            return d.group;
        })
        .style("fill", function (d) {
            return color(d.group);
        });

    node.append("text")
        .attr("dx", 15)
        .attr("dy", ".25em")
        .text(function (d) {
            return d.name
        });

    force.on("tick", function () {
        link.attr("x1", function (d) {
            return d.source.x;
        })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        d3.selectAll("circle")
            .attr("cx", function(d) { return d.x = Math.max(2*radius, Math.min(width - 2*radius, d.x)); })
            .attr("cy", function(d) { return d.y = Math.max(2*radius, Math.min(height - 2*radius, d.y)); });

        d3.selectAll("circle[root=true][group='2']")
            .attr("cx", function(d) { return d.x = 300; })
            .attr("cy", function(d) { return d.y = 300; });

        var rootCircle =  d3.selectAll("circle[root=false]")[0];
        var linq = Enumerable.From(rootCircle);
        var rootResult =
            linq.GroupBy(function(x){return x.getAttribute("group");})
                .Select(function(x){return {
                    count:x.Count(),
                    group:x.Key(),
                    cx: x.Average(function(y){return y.getAttribute("cx")|0;}),
                    cy: x.Average(function(y){return y.getAttribute("cy")|0;}) };})

                .ToArray();
        //console.log(rootResult);

        for (var i = 0; i < rootResult.length; i++) {
            var circle = rootResult[i];
            if (circle.count > 1) {
                d3.select("circle[root=true][group='" + circle.group + "']")
                    .attr("cx", function (d) {
                        return d.x = circle.cx;
                    })
                    .attr("cy", function (d) {
                        return d.y = circle.cy;
                    });
            }
            else {
                //d3.select("g.node[root=true][group='" + circle.group + "']").remove();
               /* d3.select("circle[root=true][group='" + circle.group + "']")
                    .attr("cx", function (d) {
                        return d.x = circle.cx;
                    })
                    .attr("cy", function (d) {
                        return d.y = circle.cy;
                    });
                    */
            }
        }

        d3.selectAll("text").attr("x", function (d) {
            return d.x;
        })
            .attr("y", function (d) {
                return d.y;
            });

        linkText
            .attr("x", function(d) {
                if (d.target.x > d.source.x) { return (d.source.x + (d.target.x - d.source.x)/2); }
                else { return (d.target.x + (d.source.x - d.target.x)/2); }
            })
            .attr("y", function(d) {
                if (d.target.y > d.source.y) { return (d.source.y + (d.target.y - d.source.y)/2); }
                else { return (d.target.y + (d.source.y - d.target.y)/2); }
            });
    });
});

});