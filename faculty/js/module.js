async function getModuleInfo(module_code) {
    return fetch('/bt3103-app/backend/module_description/' + module_code)
        .then((resp) => {
            return resp.json()
        })
}

const Module = {
    props: ["show_extra_data"],
    data() {
        return {
            module_name: ''
        }
    },
    created() {
        this.updateModuleInfo();
    },
    watch: {
        $route(to, from) {
            this.updateModuleInfo();
        }
    },
    methods: {
        updateModuleInfo: function() {
            const vue = this;
            getModuleInfo(this.$route.params.module)
                .then((resp)=>{
                    vue.module_name = resp.title;
                })
        }
    },
    template: `
    <div class='module-page'>
        <div class='container'>
            <h1>{{$route.params.module}}</h1>
            <p v-if='show_extra_data && module_name != ""' class='lead'>{{module_name}} &nbsp; <span class='badge badge-success'>Third-party data</span></p>
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
            chart.data.datasets[0].tooltips = data.students;
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
            semesterWorkloadChart: null,
            currGradesChart: null,
            predicted_scores: [],
            prereqs: [],
            prereqsTags:{},
            prereqCharts: {},
            display: false // whether we should display the charts
        };
    },
    mounted() {

        this.buildCharts();

    },
    methods: {
        updatePrereqsTags: async function (prereqList) {
            const vue = this;
            for (var i = 0; i < vue.prereqs.length; i++) {
                await getModuleInfo(this.prereqs[i].module_code).then((resp) => {
                    vue.prereqsTags[vue.prereqs[i].module_code] = resp;
                    //var obj = {};
                    //obj[vue.prereqs[index].module_code] = resp;
                    //vue.prereqsTags.push(obj);
                    //vue.prereqsTags.push(obj);
                })
            }
            for (var i = 0; i < vue.prereqs.length; i++){
                console.log(JSON.stringify(vue.prereqsTags));
                someToolTipText = vue.prereqsTags[vue.prereqs[i].module_code]["tags"];
                tippy("#" + vue.prereqs[i].module_code + "-header", {
                    content: someToolTipText,
                    delay: 100,
                    arrow: true,
                    arrowType: 'round',
                    size: 'large',
                    duration: 500,
                    animation: 'scale'
                    });
                };
        },

        buildCharts: function() {
            this.display = false;

            this.currGradesChart = barChart(
                "currGradesChart",
                "rgba(100, 155, 255, 0.6)",
                ["4.50 & above", "4.00 - 4.49", "3.50 - 3.99", "3.00 - 3.49", "2.00 - 2.99", "Below 2.00"]
            );

            this.pastGradesChart = barChart(
                "pastGradesChart",
                "rgba(100, 155, 255, 0.6)",
                ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D+", "D", "F"]
            );

            this.semesterWorkloadChart = barChart(
                "semesterWorkloadChart",
                "rgba(100, 155, 255, 0.6)"
            )

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
            this.fetchData();
    },
        fetchData: function() {
            var vue = this;
            fetch("/bt3103-app/backend/faculty/academics/" + this.$route.params.module)
                .then(function(response) {

                    return response.json();

                })
                .then(function(json) {
                    // Update current grades
                    vue.currGradesChart.data.datasets[0].data = json.curr_grades;
                    vue.currGradesChart.data.datasets[0].tooltips = json.curr_grades_students;
                    vue.currGradesChart.update();

                    // Update past grades
                    vue.pastGradesChart.data.datasets[0].data = json.grades.counts;
                    vue.pastGradesChart.data.datasets[0].tooltips = json.grades.students;
                    vue.pastGradesChart.update();

                    // Semester workload
                    vue.semesterWorkloadChart.data.datasets[0].data = json.semester_workload.counts;
                    vue.semesterWorkloadChart.data.datasets[0].tooltips = json.semester_workload.students;
                    vue.semesterWorkloadChart.data.labels = json.semester_workload.labels;
                    vue.semesterWorkloadChart.update();

                    // Show predicted problem students
                    vue.predicted_scores = json.pred_scores;

                    vue.attendanceCapChart.data.datasets[0].data =
                        json.attendance_cap;
                    vue.attendanceCapChart.update();
                    vue.webcastCapChart.data.datasets[0].data =
                        json.webcast_cap;
                    vue.webcastCapChart.update();

                    // Show prereq grades
                    vue.prereqs = json.prereqs;

                    // VIENNA HERE -jasmine
                    vue.updatePrereqsTags(vue.prereqs);
                    // can remove log. should return empty {} -jasmine
                    console.log(JSON.stringify(vue.prereqsTags));

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
                                json.prereqs[i].grades.counts;
                            vue.prereqCharts[i].data.datasets[0].tooltips =
                                json.prereqs[i].grades.students;
                            vue.prereqCharts[i].update();
                        }

                    /* for (var i = 0; i < vue.prereqs.length; i++){
                        console.log(JSON.stringify(vue.prereqsTags));
                        someToolTipText = vue.prereqsTags[vue.prereqs[i].module_code]["tags"];
                        tippy("#" + vue.prereqs[i].module_code + "-header", {
                            content: someToolTipText,
                            delay: 100,
                            arrow: true,
                            arrowType: 'round',
                            size: 'large',
                            duration: 500,
                            animation: 'scale'
                            });
                        }; */


                    }, 200);

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
                <h2>Grades of incoming students</h2>
                <p>Your current students have the following grades:</p>
                <canvas id="currGradesChart" width="100" height="70"></canvas>
            </div>
            <div class='demographic-chart card'>
                <h2>Past grades of incoming students</h2>
                <p>Your current students got the following grades in their previous modules:</p>
                <canvas id="pastGradesChart" width="100" height="70"></canvas>
            </div>
            <div class='demographic-chart card'>
                <h2>Semester Workload</h2>
                <p>Your current students are currently taking this number of modules this semester:</p>
                <canvas id="semesterWorkloadChart" width="100" height="70"></canvas>
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
                <div :id='prereq.module_code+ "-header"'> {{prereq.module_code}}</div>
            </div>
            <div class='wide-chart card'>
                <h2>Predicted Problematic Students</h2>
                <p>A statistical model was run to predict which students may fare better or worse than the average.
                This is based on historical data, by comparing past students' grades and which modules they have
                taken, to what incoming students have also taken before. </p>
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
            enrolment: [],
            prereqs: [],
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData: function() {
            var vue = this;
            fetch('/bt3103-app/backend/prereqs/' + this.$route.params.module)
                .then((response) => {
                    return response.json();
                })
                .then((json) => {
                    vue.prereqs = json;
                })
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
                    <th>Acad Plan</th>
                    <th>Acad Career</th>
                    <th>Admit Term</th>
                    <th>CAP</th>
                    <th v-if='show_extra_data'>Attendance Rate <span class='badge badge-warning'>Mocked up data</span></th>
                    <th v-if='show_extra_data'>Webcast Rate <span class='badge badge-warning'>Mocked up data</span></th>
                    <th v-if='show_extra_data && prereqs.length > 0'>Prereqs Taken <span class='badge badge-success'>Using third-party data</span></th>
                    <th>&nbsp;</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for='row in enrolment'>
                    <td>{{row.token}}</td>
                    <td>{{row.faculty_descr}}</td>
                    <td>{{row.academic_plan_descr}}</td>
                    <td>{{row.academic_load_descr}} {{row.academic_career}}</td>
                    <td>{{row.admit_term_descr}}</td>
                    <td>{{row.CAP}}</td>
                    <td v-if='show_extra_data'>{{row.attendance}}%</td>
                    <td v-if='show_extra_data'>{{row.webcast}}%</td>
                    <td v-if='show_extra_data && prereqs.length > 0'>{{row.prereqs}}</td>
                    <td><a :href='"mailto:"+row.token+"@u.nus.edu?subject=["+$route.params.module+"] "' class='btn btn-info'><i class='fas fa-envelope'></i></a></td>
                </tr>
            </tbody>
        </table>
    </transition></div>`
};
