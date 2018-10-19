function barChart(id, colour, labels = [], tooltipData = []) {

    var dataset = {
        label: "No. of students",
        data: [],
        backgroundColor: colour,
        tooltips: tooltipData
    }

    return new Chart(document.getElementById(id), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [ dataset ]
        },
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
            }
        }
    });
}

function scatterChart(id, colour, xLabel, yLabel) {
    return new Chart(document.getElementById(id), {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "Student",
                    data: [],
                    backgroundColor: colour
                }
            ]
        },
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
            }
        }
    });
}
