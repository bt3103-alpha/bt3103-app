
function barChart(id, colour, labels = []) {
    return new Chart(document.getElementById(id), {
        type: "bar", 
        data: {
            labels: labels, 
            datasets: [
                {
                    label: "No. of students",
                    data: [],
                    backgroundColor: colour
                }
            ]
        },
        options: {
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                }
            }, 
            scales: {
                yAxes: [{
                    ticks: { beginAtZero: true }
                }]
            }
        }
    })
}

function scatterChart(id, colour, xLabel, yLabel) {
    return new Chart(document.getElementById(id), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Student',
                data: [], 
                backgroundColor: colour
            }]
        }, 
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: xLabel
                    }
                }], 
                yAxes: [{
                    type: 'linear',
                    position: 'left',
                    scaleLabel: {
                        display: true,
                        labelString: yLabel
                    }
                }]
            }
        }
    })
}