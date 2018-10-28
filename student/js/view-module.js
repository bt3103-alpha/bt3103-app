async function getModuleInfo(module_code) {
    return fetch('/bt3103-app/backend/module_description/' + module_code)
        .then((resp) => {
            console.log(resp)
            return resp.json()
        })
}

async function getPrereqs(module_code) {
    return fetch('/bt3103-app/backend/student/view-module/' + module_code)
        .then((resp) => {
            return resp.json()
        })
        .then((treeData) => {
            treeStuff(treeData)
        })
}

async function getTags(module_code) {
    return fetch('/bt3103-app/backend/module_description/' + module_code)
        .then((resp) => {
            return resp.json()
        })
}

function searchModules() {
    let results = search(document.getElementById("module_search").value);
    let resultsDiv = document.getElementById("search_results");
    resultsDiv.innerHTML = "";
    for (let i = 0; i < results.length; i++) {
        resultsDiv.innerHTML +=
            "<a href='view-module.html?name=" +
            results[i].code +
            "'>" +
            results[i].code +
            " - " +
            results[i].name +
            "</a>";
    }
}

window.onload = function () {
    app = new Vue({
        el: "#app",
        data: {
            module_code: "",
            module_name: "",
            name: "",
            module_description: "",
            //prereq_arr: [],
            //completed: [],
            //completed_dict: {},
            tag_arr: [],
            module_fb: true,
            teaching_fb: true,
            tAbility: null,
            tTimely: null,
            tInterest: null,
            module_fb_ratingAverage: 0,
            module_fb_ratingRounded: 0,
            module_fb_ratingCount: 0,
            module_fb_array: [],
            module_fb_arrayPercent: [0,0,0,0,0]
        },
        created() {
            let url = new URL(window.location.href);
            this.module_code = url.searchParams.get("name");
            const vuethis = this;
            // Fetch name
            fetch("https://bt3103-alpha-student.firebaseio.com/profile.json")
                .then(response => {
                    return response.json();
                })
                .then(json => {
                    this.name = json.name;
                });

            if (this.module_code != null) {
            // fetch module details and module name
            // fetch("https://bt3103-alpha-student.firebaseio.com/module_descriptions.json")
            fetch("/bt3103-app/backend/module_description/" + this.module_code)
                .then(response => {
                    return response.json();
                })
                .then(json => {
                    this.module_name = json.title;
                    this.module_description = json.description;
                    this.tag_arr = json.tags;

                    getPrereqs(this.module_code)
                });

            fetch("/bt3103-app/backend/student/view-module/feedbackM/" + this.module_code)
                .then(function(response) {
                    return response.json();
                })
                .then(function(json) {
                    console.log(json.data);
                    console.log('module');
                    vuethis.module_fb = json.data
                    if (vuethis.module_fb) {
                      vuethis.module_fb_ratingAverage = json.mRating['average'].toFixed(2);
                      vuethis.module_fb_ratingRounded = roundHalf(json.mRating['average']);
                      vuethis.module_fb_ratingCount = json.mRating['total'];
                      vuethis.module_fb_array = json.mRating['array'];
                      wordcloud(json.goodText,"#goodCloud", ['#2ab400','#8add77']);
                      wordcloud(json.badText,"#badCloud", ['#c90707', '#fca9a9']);
                      for(var i = 0, length = vuethis.module_fb_array.length; i < length; i++){
                          vuethis.module_fb_arrayPercent[i] = (vuethis.module_fb_array[i]/json.mRating['num_feedback'])*100;
                      }
                    }
                });

            fetch("/bt3103-app/backend/student/view-module/feedbackT/" + this.module_code)
                .then(function(response) {
                    return response.json();
                })
                .then(function(json) {
                    // Update faculties
                    vuethis.teaching_fb = json.data;
                    console.log(json.data);
                    console.log('teaching')
                    const a = [1,2,3,4,5]
                    if (vuethis.teaching_fb) {
                      vuethis.tAbility = donutChart("tAbility", ["SA","A","N","D","SD"],json.tAbility);
                      vuethis.tTimely = donutChart("tTimely", ["SA","A","N","D","SD"],json.tTimely);
                      vuethis.tInterest = donutChart("tInterest", ["SA","A","N","D","SD"],json.tInterest);
                    }
                });
            }
        }
    });
}

function roundHalf(num) {
    return Math.round(num*2)/2;
}

function treeStuff(treeData) {
    var margin = { top: 80, right: 120, bottom: 0, left: 120 },
        width = 960 - margin.right - margin.left,
        height = 350 - margin.top - margin.bottom;

    var i = 0,
        duration = 750,
        root;

    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.x, d.y]; });

    var svg = d3.select("#tree").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    root = treeData;

    update(root);

    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) { d.y = d.depth * 180; });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) { return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
            .on("click", click);

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeEnter.append("text")
            .attr("y", function (d) { return d.children || d._children ? -18 : 18; })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
            .text(function (d) { return d.name; })
            .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

        nodeUpdate.select("circle")
            .attr("r", 10)
            .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) { return "translate(" + source.x + "," + source.y + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function (d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = { x: source.x0, y: source.y0 };
                return diagonal({ source: o, target: o });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
}

// wordcloud font size uses text count
// cannot be too small, need to inflate/scale numbers
function checkSize(listword) {
  var count5 = 0;
  var count10 = 0;
  var i;
  for (i=0; i<listword.length; i++) {
    if (listword[i].size < 5) {count5++;}
    else if (listword[i].size < 10) {count10++;}

  }
  if (count5 > 5) {
    for (i=0; i<listword.length; i++) {
      listword[i].size = listword[i].size * 7.5
    }
  } else if (count10 > 5) {
    for (i=0; i<listword.length; i++) {
      listword[i].size = listword[i].size * 5.5
    }
  }
}


// student feeback wordcloud
function wordcloud(listword, id, colorRange) {
  var width = 300;
  var height = 200;
  var fill = ['#9CC0E7', '#EEEEEE', '#FCFCFC', "FAEACB", '#F7DBD7','#9CC0E7', '#EEEEEE', '#FCFCFC', "FAEACB", '#F7DBD7','#9CC0E7', '#EEEEEE', '#FCFCFC', "FAEACB", '#F7DBD7'];
  var fill2 = d3.scale.linear()
  .domain([0, 5])
  .range(colorRange);

  checkSize(listword);

  d3.layout.cloud()
    .size([width, height])
    .words(listword)
    .rotate(function() {
      return ~~(Math.random() * 1) * 90;
    })
    .fontSize(function(d) {
      return d.size;
    })
    .on("end", drawSkillCloud)
    .start();

  // Finally implement `drawSkillCloud`, which performs the D3 drawing:
  // apply D3.js drawing API
  function drawSkillCloud(words) {
      d3.select(id).append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + ~~(width / 2) + "," + ~~(height / 2) + ")")
          .selectAll("text")
          .data(words)
          .enter().append("text")
          .style("font-size", function(d) {
              return d.size + "px";
          })
          .style("-webkit-touch-callout", "none")
          .style("-webkit-user-select", "none")
          .style("-khtml-user-select", "none")
          .style("-moz-user-select", "none")
          .style("-ms-user-select", "none")
          .style("user-select", "none")
          .style("cursor", "default")
          .style("font-family", "Arial")
          .style("fill", function(d, i) {
              return fill2(i);
          })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) {
              return d.text;
          });
  }
  // set the viewbox to content bounding box (zooming in on the content, effectively trimming whitespace)
      var svg = document.getElementsByTagName("svg")[0];
      var bbox = svg.getBBox();
      var viewBox = [bbox.x, bbox.y, bbox.width, bbox.height].join(" ");
      svg.setAttribute("viewBox", viewBox);
}

function donutChart(id, labels = [], dat_a) {
    return new Chart(document.getElementById(id), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: false,
                    data: dat_a,
                    backgroundColor: [
                        "rgba(42, 180, 0, 0.6)",
                        "rgba(105, 208, 82, 0.6)",
                        "rgba(255, 235, 59, 0.5)",
                        "rgba(242, 65, 66, 0.6)",
                        "rgba(201, 7, 7, 0.6)"
                    ]
                }
            ]
        },
        options: {
            cutoutPercentage: 50,
            rotation: 0.5 * Math.PI,
            animation: {
                animateScale: true
            },
            legend: {display: false},
            scales: {
              yAxes: [{
                display: false,
                gridLines: {display: false}
              }],
              xAxes: [ {
                gridLines: {display: false}
              }]
            }

        }
    });
}
