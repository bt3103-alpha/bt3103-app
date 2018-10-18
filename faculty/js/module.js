const Module = {
    props: ["show_extra_data"],
    template: `
    <div class='module-page'>
        <div class='container'>
            <h1>{{$route.params.module}}</h1>
            <ul class=" module-nav nav nav-pills nav-fill">
                <li class='nav-item'>
                    <router-link class='nav-link' to='demographics'>Demographics</router-link>
                </li>
                <li class='nav-item'>
                    <router-link class='nav-link' to='academics'>Academics</router-link>
                </li>
                <li class='nav-item'>
                    <router-link class='nav-link' to='enrolment'>Student Enrolment</router-link>
                </li>
            </ul>
        </div>
        <transition name='fade'>
            <router-view class='child-view' :show_extra_data='show_extra_data'></router-view>
        </transition>
    </div>`
};

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

const ModuleDemographics = {
    data() {
        return {
            grades: [],
            degrees: [],
            yearsChart: null,
            currGradesChart: null,
            facultiesChart: null,
            academicLoadChart: null
        };
    },
    mounted() {
        this.fetchData();

        this.yearsChart = donutChart("yearsChart", [
            "Year 1",
            "Year 2",
            "Year 3",
            "Year 4"
        ]);
        this.currGradesChart = barChart(
            "currGradesChart",
            "rgba(100, 155, 255, 0.6)",
            ["First", "Second Upper", "Second Lower", "Third", "Pass", "Fail"]
        );
        this.facultiesChart = barChart(
            "facultiesChart",
            "rgba(100, 155, 255, 0.6)"
        );
        this.academicCareerChart = donutChart("academicCareerChart");
        this.academicLoadChart = donutChart("academicLoadChart");
    },
    methods: {
        updateChart(chart, data) {
            chart.data.labels = data.labels;
            chart.data.datasets[0].data = data.counts;
            chart.update();
        },
        fetchData() {
            var vue = this;
            fetch("/bt3103-app/backend/faculty/demographics/" + this.$route.params.module)
                .then(function(response) {
                    return response.json();
                })
                .then(function(json) {
                    vue.grades = json.grades;
                    vue.degrees = json.degrees;

                    // Update years
                    vue.yearsChart.data.datasets[0].data = json.years;
                    vue.yearsChart.update();

                    // Update current grades
                    vue.currGradesChart.data.datasets[0].data =
                        json.curr_grades;
                    vue.currGradesChart.update();

                    // Update faculties
                    vue.updateChart(vue.facultiesChart, json.faculty);

                    // Update academic careers
                    vue.updateChart(
                        vue.academicCareerChart,
                        json.academic_career
                    );

                    // Update academic careers
                    vue.updateChart(vue.academicLoadChart, json.academic_load);
                });
        }
    },
    watch: {
        $route(to, from) {
            this.fetchData();
        }
    },
    template: `<div class='container-fluid'>
    <div class='chart-rows'>
        <div class='demographic-chart card'>
            <h2>Years of incoming students</h2>
            <p>Your current students are made up of:</p>
            <canvas id="yearsChart" width="100" height="70"></canvas>
        </div>
        <div class='demographic-chart card'>
            <h2>Academic careers of incoming students</h2>
            <p>Your current students are:</p>
            <canvas id="academicCareerChart" width="100" height="70"></canvas>
        </div> 
        <div class='demographic-chart card'>
            <h2>Academic load of incoming students</h2>
            <p>Your current students are:</p>
            <canvas id="academicLoadChart" width="100" height="70"></canvas>
        </div>
        <div class='demographic-chart card'>
            <h2>Faculties of incoming students</h2>
            <p>Your current students belong to the following faculties:</p>
            <canvas id="facultiesChart" width="100" height="70"></canvas>
        </div>
        <div class='demographic-chart card'>
            <h2>Grades of incoming students</h2>
            <p>Your current students have the following grades:</p>
            <canvas id="currGradesChart" width="100" height="70"></canvas>
        </div> 
        <div class='demographic-chart card'>
            <h2>Degrees</h2>
            <p>Your current students are currently pursuing:</p>
            <table class='table table-sm table-hover'>
                <thead class='thead-light'>
                    <tr>
                        <th>Degree Name</th>
                        <th>No.</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for='degree in degrees'>
                        <td>{{degree[0]}}</td>
                        <td>{{degree[1]}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    </div>`
};

const ModuleAcademics = {
    props: ["show_extra_data"],
    data() {
        return {
            attendanceCapChart: null,
            webcastCapChart: null,
            pastGradesChart: null,
            predicted_scores: [],
            prereqs: [],
            prereqCharts: {},
            display: false // whether we should display the charts
        };
    },
    mounted() {
        this.buildCharts();
    },
    // watch: {
    //     show_extra_data(newVar, oldVar) {
    //         // Redisplay charts
    //         setTimeout(this.buildCharts, 100);
    //     }
    // },
    methods: {
        buildCharts: function() {
            this.display = false;

            this.pastGradesChart = barChart(
                "pastGradesChart",
                "rgba(100, 155, 255, 0.6)",
                ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D+", "D", "F"]
            );

            // if (this.show_extra_data) {
                this.attendanceCapChart = scatterChart(
                    "attendanceCapChart",
                    "rgba(54, 162, 235, 0.6)",
                    "Attendance Rate",
                    "CAP"
                );
                this.webcastCapChart = scatterChart(
                    "webcastCapChart",
                    "rgba(255, 99, 132, 0.6)",
                    "Webcast Watch Rate",
                    "CAP"
                );
            // }
            this.fetchData();
        },
        fetchData: function() {
            var vue = this;
            fetch("/bt3103-app/backend/faculty/academics/" + this.$route.params.module)
                .then(function(response) {
                    return response.json();
                })
                .then(function(json) {
                    // Update past grades
                    vue.pastGradesChart.data.datasets[0].data = json.grades;
                    vue.pastGradesChart.update();

                    // Show predicted problem students
                    vue.predicted_scores = json.pred_scores;

                    // if (vue.show_extra_data) {
                        vue.attendanceCapChart.data.datasets[0].data =
                            json.attendance_cap;
                        vue.attendanceCapChart.update();
                        vue.webcastCapChart.data.datasets[0].data =
                            json.webcast_cap;
                        vue.webcastCapChart.update();

                        // Show prereq grades
                        vue.prereqs = json.prereqs;

                        // We set a timeout so that the DOM
                        // has time to update
                        setTimeout(function() {
                            for (var i = 0; i < json.prereqs.length; i++) {
                                vue.prereqCharts[i] = barChart(
                                    "prereqGradesChart" +
                                        json.prereqs[i].module_code,
                                    "rgba(75, 192, 192, 0.6)",
                                    [
                                        "A+",
                                        "A",
                                        "A-",
                                        "B+",
                                        "B",
                                        "B-",
                                        "C+",
                                        "C",
                                        "D+",
                                        "D",
                                        "F"
                                    ]
                                );
                                vue.prereqCharts[i].data.datasets[0].data =
                                    json.prereqs[i].grades;
                                vue.prereqCharts[i].update();
                            }
                        }, 200);
                    // }

                    vue.display = true;
                });
        }
    },
    template: `<div class='container-fluid'>
        <div v-if='!display' style='text-align: center; margin-top: 48px; opacity: 0.5'>
            <i class='fas fa-spinner fa-pulse fa-lg'></i>
        </div>
        <div v-bind:class='["chart-rows", display ? "" : "hide"]'>
            <div class='demographic-chart card'>
                <h2>Historical grades</h2>
                <p>The students who took this class in previous semesters got the following grades:</p>
                <canvas id="pastGradesChart" width="100" height="70"></canvas>
            </div>
            <div :class='["demographic-chart", "card", show_extra_data ? "":"hide"]'>
                <h2>Attendance vs CAP</h2>
                <div>
                    <span class='badge badge-warning'>Uses mocked up data</span>
                </div>
                <p>Your current students are:</p>
                <canvas id="attendanceCapChart" width="100" height="70"></canvas>
            </div>
            <div :class='["demographic-chart", "card", show_extra_data ? "":"hide"]'>
                <h2>Webcast vs CAP</h2>
                <div>
                    <span class='badge badge-warning'>Uses mocked up data</span>
                </div>
                <p>Your current students are:</p>
                <canvas id="webcastCapChart" width="100" height="70"></canvas>
            </div>
            <div :class='["demographic-chart", "card", show_extra_data ? "":"hide"]' v-for='prereq in prereqs'>
                <h2>Grades for {{prereq.module_code}}</h2>
                <div>
                    <span class='badge badge-success'>Uses third-party data</span>
                </div>
                <canvas :id='"prereqGradesChart"+prereq.module_code' width='100' height='70'></canvas>
            </div>
            <div class='wide-chart card'>
                <h2>Predicted Problematic Students</h2>
                <table class='table table-sm table-hover'>
                    <thead>
                        <tr>
                            <th>Student Token</th>
                            <th>Score</th>
                            <th>Influencing Modules</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for='student in predicted_scores'>
                            <td>{{student[0]}}</td>
                            <td style='text-align:right;'>{{student[1].toFixed(2)}}</td>
                            <td>
                                <span class='badge badge-light' v-for='module in student[2]' style='margin-right: 3px;'>{{module.code}} ({{module.score}})</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>`
};

const ModuleEnrolment = {
    props: ["show_extra_data"],
    data() {
        return {
            enrolment: []
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData: function() {
            var vue = this;
            fetch("/bt3103-app/backend/faculty/enrolment/" + this.$route.params.module)
                .then(function(response) {
                    return response.json();
                })
                .then(function(json) {
                    vue.enrolment = json;
                });
        }
    },
    template: `
    <div class='container-fluid'><transition name='fade'>
        <table class='table table-hover' v-if='enrolment.length > 0'>
            <thead class='thead-light'>
                <tr>
                    <th>Token</th>
                    <th>Faculty</th>
                    <th>Degree</th>
                    <th>Acad Career</th>
                    <th>Admit Term</th>
                    <th>CAP</th>
                    <th v-if='show_extra_data'>Attendance Rate <span class='badge badge-warning'>Mocked up data</span></th>
                    <th v-if='show_extra_data'>Webcast Rate <span class='badge badge-warning'>Mocked up data</span></th>
                    <th>&nbsp;</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for='row in enrolment'>
                    <td>{{row.token}}</td>
                    <td>{{row.faculty_descr}}</td>
                    <td>{{row.degree_descr}}</td>
                    <td>{{row.academic_load_descr}} {{row.academic_career}}</td>
                    <td>{{row.admit_term_descr}}</td>
                    <td>{{row.CAP}}</td>
                    <td v-if='show_extra_data'>{{row.attendance}}%</td>
                    <td v-if='show_extra_data'>{{row.webcast}}%</td>
                    <td><a :href='"mailto:"+row.token+"@u.nus.edu?subject=["+$route.params.module+"] "' class='btn btn-info'><i class='fas fa-envelope'></i></a></td>
                </tr>
            </tbody>
        </table>
    </transition></div>`
};
