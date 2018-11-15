/**
 * Creates a bar chart at a given ``div``
 * @param {string} id HTML id of div to place chart in
 * @param {string} colour Colour of bar chart columns
 * @param {list} labels X axis labels (optional)
 * @param {list} tooltipData Data to display as tooltips
 */
function barChart(id, colour, labels = [], tooltipData = []) {
    
    var dataset = {
        label: "No. of students",
        data: [],
        backgroundColor: colour,
        tooltips: tooltipData
    };

    var data = {
        labels: labels, 
        datasets: [ dataset ]
    };

    return new Chart(document.getElementById(id), {
        type: "bar",
        data: data,
        options: {
            layout: {
                padding: {
                    left: 10,
                    right: 10
                }
            },
            scales: {
                yAxes: [
                    {
                        ticks: { beginAtZero: true }
                    }
                ]
            },
            hover : {
                onHover: function(e) {
                    var point = this.getElementAtEvent(e);
                    if (point.length) e.target.style.cursor = 'pointer';
                    else e.target.style.cursor = 'default';
                }
            }, 
            tooltips: {
                enabled: false,
                custom: function(tooltipModel) {
                    const tooltipContent = tooltipData;
                    var tooltipEl = document.getElementById("chartjs-tooltip");

                    // Create element on first render
                    if (!tooltipEl) {
                        tooltipEl = document.createElement("div");
                        tooltipEl.id = "chartjs-tooltip";
                        tooltipEl.innerHTML = "";
                        document.body.appendChild(tooltipEl);
                    }

                    // Hide if no tooltip
                    if (tooltipModel.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }

                    tooltipEl.classList.remove("above", "below", "no-transform");
                    if (tooltipModel.yAlign) {
                        tooltipEl.classList.add(tooltipModel.yAlign);
                    } else {
                        tooltipEl.classList.add("no-transform");
                    }

                    // Set Text
                    content = tooltipModel.body[0].lines[0] + "<ul>"

                    let tooltips = dataset.tooltips[tooltipModel.dataPoints[0].index]
                    
                    // tooltipData = tooltipModel.dataPoints[0].index
                    for (let i = 0; i < tooltips.length; i++) {
                        content += "<li>" + tooltips[i] + "</li>";
                    }

                    tooltipEl.innerHTML = content + "</ul>";

                    // `this` will be the overall tooltip
                    var position = this._chart.canvas.getBoundingClientRect();

                    // Display, position, and set styles for font
                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.position = "absolute";
                    tooltipEl.style.left =
                        position.left + window.pageXOffset + tooltipModel.caretX + 10 + "px";
                    tooltipEl.style.top =
                        position.top + window.pageYOffset + tooltipModel.caretY + "px";
                    tooltipEl.style.pointerEvents = "none";
                }
            } ,
            onClick: (evt, item) => {
                let tooltips = dataset.tooltips;
                if (item[0] == null) {
                    return
                }
                for (let i = 0 ; i < data.labels.length; i++) {
                    if (data.labels[i] == item[0]._model.label) {
                        // This is the label we want
                        let tokens = tooltips[i];
                        results = []
                        console.log(app.student_enrolment.length)
                        for (let j = 0; j < app.student_enrolment.length; j++) {
                            if (tokens.includes(app.student_enrolment[j].token)) {
                                results.push(app.student_enrolment[j]);
                            }
                        }
                        app.studentFilter = results;
                        break;
                    }
                }
                $("#studentModal").modal();
                
            }
        }
    });
}

/**
 * Creates a scatter plot at a given ``div``
 * @param {string} id HTML id of ``div`` to place chart in
 * @param {string} colour Colour of points in plot
 * @param {string} xLabel Label of x axis
 * @param {string} yLabel Label of y axis
 * @param {list} tooltipData Data to display as tooltips
 */
function scatterChart(id, colour, xLabel, yLabel, tooltipData = []) {
    var dataset = {
        label: "No. of students",
        data: [],
        backgroundColor: colour,
        tooltips: tooltipData
    };

    var data = {
        datasets: [ dataset ],
        current: null
    };
    return new Chart(document.getElementById(id), {
        type: "scatter",
        data: data,
        options: {
            scales: {
                xAxes: [
                    {
                        type: "linear",
                        position: "bottom",
                        scaleLabel: {
                            display: true,
                            labelString: xLabel
                        }
                    }
                ],
                yAxes: [
                    {
                        type: "linear",
                        position: "left",
                        scaleLabel: {
                            display: true,
                            labelString: yLabel
                        }
                    }
                ]
            },
            hover : {
                onHover: function(e) {
                    var point = this.getElementAtEvent(e);
                    if (point.length) e.target.style.cursor = 'pointer';
                    else e.target.style.cursor = 'default';
                }
            }, 
            tooltips: {
                enabled: false,
                custom: function(tooltipModel) {
                    const tooltipContent = tooltipData;
                    var tooltipEl = document.getElementById("chartjs-tooltip");

                    // Create element on first render
                    if (!tooltipEl) {
                        tooltipEl = document.createElement("div");
                        tooltipEl.id = "chartjs-tooltip";
                        tooltipEl.innerHTML = "";
                        document.body.appendChild(tooltipEl);
                    }

                    // Hide if no tooltip
                    if (tooltipModel.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }

                    tooltipEl.classList.remove("above", "below", "no-transform");
                    if (tooltipModel.yAlign) {
                        tooltipEl.classList.add(tooltipModel.yAlign);
                    } else {
                        tooltipEl.classList.add("no-transform");
                    }

                    // Set Text
                    content = tooltipModel.body[0].lines[0] + "<ul>"

                    let tooltips = dataset.tooltips[tooltipModel.dataPoints[0].index]
                    data.current = tooltips
                    // tooltipData = tooltipModel.dataPoints[0].index
                    //for (let i = 0; i < tooltips.length; i++) {
                    //    content += "<li>" + tooltips[i] + "</li>";
                    //}

                    tooltipEl.innerHTML = tooltips + "</ul>";

                    // `this` will be the overall tooltip
                    var position = this._chart.canvas.getBoundingClientRect();

                    // Display, position, and set styles for font
                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.position = "absolute";
                    tooltipEl.style.left =
                        position.left + window.pageXOffset + tooltipModel.caretX + 10 + "px";
                    tooltipEl.style.top =
                        position.top + window.pageYOffset + tooltipModel.caretY + "px";
                    tooltipEl.style.pointerEvents = "none";
                }
            } ,
            onClick: (evt, item) => {
                let tooltips = dataset.tooltips;
                if (item[0] == null) {
                    return
                }
                let tokens = data.current
                console.log(tokens)
                results = []
                console.log(app.student_enrolment)
                for (let j = 0; j < app.student_enrolment.length; j++) {

                    if (tokens ==  (app.student_enrolment[j].token)) {
                        results.push(app.student_enrolment[j]);
                        break;
                    }
                }
                app.studentFilter = results;
                

                $("#studentModal").modal();
                
            }
        }
    });
}
/**
 * Creates a donut chart at a given ``div``
 * @param {string} id HTML id of ``div`` to place chart in
* @param {list} labels (optional)
 */
function donutChart(id, labels = []) {
    return new Chart(document.getElementById(id), {
        type: "pie",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "No. of students",
                    data: [],
                    backgroundColor: [
                        "rgba(54, 162, 235, 0.6)",
                        "rgba(255, 99, 132, 0.6)",
                        "rgba(75, 192, 192, 0.6)",
                        "rgba(255, 206, 86, 0.6)"
                    ]
                }
            ]
        },
        options: {
            cutoutPercentage: 50,
            rotation: 0.5 * Math.PI,
            animation: {
                animateScale: true
            }
        }
    });
}