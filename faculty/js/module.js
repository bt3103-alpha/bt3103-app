async function getModuleInfo(module_code) {
    return fetch('/bt3103-app/backend/module_description/' + module_code)
        .then((resp) => {
            return resp.json()
        })
}

/**
 * Root element that loads all module-related data
 */
const Module = {
    props: ["show_extra_data", 'student_enrolment', 'module_prereqs'],
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
        /**
         * Get the title of the module, given it's code
         * Called when first created, and then whenever 
         * the route changes. 
         */
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
            <p v-if='show_extra_data && module_name != ""' class='lead' style='display: flex; align-items: flex-start;'>{{module_name}} &nbsp; <span class='badge badge-success' style='font-size: 8px; font-weight:400;'>third-party data</span></p>
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
            <router-view class='child-view' :show_extra_data='show_extra_data' :module_prereqs='module_prereqs' :student_enrolment='student_enrolment'></router-view>
        </transition>
    </div>`
};

/**
 * Loaded by the Demographics tab. 
 * 
 * Pulls data from the /backend/faculty/demographics/ endpoint.
 */
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
        //this.academicCareerChart = donutChart("academicCareerChart");
        this.academicLoadChart = donutChart("academicLoadChart");
    },
    methods: {
        /**
        * Update the charts at a given ``div``
        * @param {string} chart
        * @param {string} data for the charts
        */
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

                    /**
                    // Update academic careers
                    vue.updateChart(
                        vue.academicCareerChart,
                        json.academic_career
                    );**/

                    // Update academic careers
                    vue.updateChart(vue.academicLoadChart, json.academic_load);
                });
        },
        /**
        * Drilldown function to show more information on the students ``div``
        * @param {list} students list
        * 
        * shows the student modal
        */
        showStudents(listofStudents){
            results =[]
            for(let j=0; j< app.student_enrolment.length;j++){
                if(listofStudents.includes(app.student_enrolment[j].token)){
                    results.push(app.student_enrolment[j]);
                }
            }
            app.studentFilter = results;
            $("#studentModal").modal();

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
        <!-- Remove Academic Careers due to feedback -->
        <!--<div class='demographic-chart card'>
            <h2>Academic careers of incoming students</h2>
            <p>Your current students are:</p>
            <canvas id="academicCareerChart" width="100" height="70"></canvas>
        </div>-->
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
            <h2>Majors of incoming students</h2>
            <p>Your current students are currently pursuing:</p>
            <table class='table table-sm table-hover'>
                <thead class='thead-light'>
                    <tr>
                        <th>Degree Name</th>
                        <th>No.</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for='degree in degrees' v-on:click= showStudents(degree[2]) style='cursor:pointer;'>
                        <td>{{degree[0]}}</td>
                        <td>{{degree[1]}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    </div>`
};
/**
 * Loaded by the Academic tab. 
 * 
 * Pulls data from the /backend/faculty/academics/byfac endpoint.
 */
const ModuleAcademics = {
    props: ["show_extra_data"],
    data() {
        return {
            Jsondata: null,
            selected: 'all',
            filters: [],
            attendanceCapChart: null,
            webcastCapChart: null,
            pastGradesChart: null,
            semesterWorkloadChart: null,
            currGradesChart: null,
            predicted_scores_good: [],
            predicted_scores_bad: [],
            prereqs: [],
            prereqsTags:{},
            prereqCharts: {},
            module_tag_counts: [], 
            display: false // whether we should display the charts
        };
    },
    mounted() {
        var vue = this;
        vue.fetchData().then(function(Jsondata){
            vue.buildCharts();
        })

    },
    watch: {
        // whenever selected changes, this function will run
        selected: function (newSelected, oldSelected) {
            this.updateCharts();
        }
      },
    methods: {
        /**
        * Drilldown function to show more information on the students ``div``
        * @param {list} students list
        * 
        * shows the student modal
        */
        showStudents(listofStudents){
            results =[]
            for(let j=0; j< app.student_enrolment.length;j++){
                if(listofStudents.includes(app.student_enrolment[j].token)){
                    results.push(app.student_enrolment[j]);
                }
            }
            app.studentFilter = results;
            $("#studentModal").modal();

            },
        /**
        * Update any prerequisites tags at a given ``div``
        * Also updates the tooltip that display the Prerequisites Tags
        * 
        * @param {list} prerequisites list of prereqs
        */
        updatePrereqsTags: async function (prereqList) {
            const vue = this;
            for (var i = 0; i < vue.prereqs.length; i++) {
                await getModuleInfo(this.prereqs[i].module_code).then((resp) => {
                    vue.prereqsTags[vue.prereqs[i].module_code] = resp;
                })
            }
            for (var i = 0; i < vue.prereqs.length; i++){
                someToolTipText = "";
                tags = vue.prereqsTags[vue.prereqs[i].module_code]["tags"];
                for (let i = 0; i < tags.length; i++) {
                    someToolTipText += '<span class="badge badge-info" style="font-weight:100;">' + tags[i] + '</span> &nbsp;'
                }
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
        /**
        * Build All the Charts for Academics Dashboard using barChart() and scatterChart()
        * 
        */
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
            this.updateCharts();
            this.display = true;
        },

        updateCharts: function() {
            this.updateCurrentGrades();
            this.updatePastGrades();
            this.updatePredictedStudents();
            this.updateSemesterWorkload();
            this.updateAttnWeb();
            this.updatePrereqCharts();
        },

        fetchData: async function() {
            var vue = this;
            await fetch("/bt3103-app/backend/faculty/academics/byfac/" + this.$route.params.module)
                .then(function(response) {
                    return response.json();
                })
                .then(function(json) {
                    vue.Jsondata = json;
                    vue.prereqs = json['all'].prereqs;
                    vue.updatePrereqsTags(vue.prereqs);
                    // Get all the faculties + all into selected list
                    for (var key in json){
                        if (key != 'tags') {
                            vue.filters.push(key);
                        }
                    }

                    // Store the tag counts
                    vue.module_tag_counts = json.tags
                })
            return vue.Jsondata

            },
        /**
        * Update Current Grades of Student for particular module
        * 
        * Add Current Grades data to be displayed on the charts
        * 
        * Add tooltip data to display as tooltips in chart function
        */
        updateCurrentGrades: function(){
            var vue = this;
            filter = vue.selected;
            vue.currGradesChart.data.datasets[0].data = vue.Jsondata[filter].curr_grades;
            vue.currGradesChart.data.datasets[0].tooltips = vue.Jsondata[filter].curr_grades_students;
            vue.currGradesChart.update();


        },
        /**
        * Update Past Grades of Student for particular module
        * 
        * Add Past Grades data to be displayed on the charts
        * 
        * Add tooltip Data to display as tooltips in chart function
        */
        updatePastGrades: function(){
            var vue = this;
            filter = vue.selected;
            vue.pastGradesChart.data.datasets[0].data = vue.Jsondata[filter].grades.counts;
            vue.pastGradesChart.data.datasets[0].tooltips = vue.Jsondata[filter].grades.students;
            vue.pastGradesChart.update();
        },
        /**
        * Update Semester Workload of Student for particular module
        * 
        * Add Semester Workload data to be displayed on the charts
        * 
        * Add tooltip Data to display as tooltips in chart function
        */
        updateSemesterWorkload: function(){
            var vue = this;
            filter = vue.selected;
            vue.semesterWorkloadChart.data.datasets[0].data = vue.Jsondata[filter].semester_workload.counts;
            vue.semesterWorkloadChart.data.datasets[0].tooltips = vue.Jsondata[filter].semester_workload.students;
            vue.semesterWorkloadChart.data.labels = vue.Jsondata[filter].semester_workload.labels;
            vue.semesterWorkloadChart.update();

        },
        /**
        * Update Predicted Students for particular module
        * 
        * Add Predicted Students data to be displayed on the charts
        * 
        * Add tooltip Data to display as tooltips in chart function
        */
        updatePredictedStudents: function(){
            var vue = this;
            filter = vue.selected;
            vue.predicted_scores_good = vue.Jsondata[filter].pred_scores_good;
            vue.predicted_scores_bad = vue.Jsondata[filter].pred_scores_bad;
        },
        /**
        * Update Attendance and Webcast Rates of Student for particular module
        * 
        * Add Attendance and Webcast Rates data to be displayed on the charts
        * 
        * Add tooltip Data to display as tooltips in chart function
        */
        updateAttnWeb: function(){
            var vue = this;
            filter = vue.selected;
            vue.attendanceCapChart.data.datasets[0].data = vue.Jsondata[filter].attendance_cap;
            vue.attendanceCapChart.data.datasets[0].tooltips = vue.Jsondata[filter].attendance_cap_students;
            vue.attendanceCapChart.update();


            vue.webcastCapChart.data.datasets[0].data = vue.Jsondata[filter].webcast_cap;
            vue.webcastCapChart.data.datasets[0].tooltips = vue.Jsondata[filter].webcast_cap_students;
            vue.webcastCapChart.update();

        },
        /**
        * Update Prerequisites of Student for particular module
        * 
        * Add Prerequisites data to be displayed on the charts
        * 
        * Add tooltip Data to display as tooltips in chart function
        */
        updatePrereqCharts: function (){
            var vue = this;
            filter = vue.selected;
            for (var i = 0; i < vue.Jsondata[filter].prereqs.length; i++) {
                vue.prereqCharts[i] = barChart(
                    "prereqGradesChart" +
                    vue.Jsondata[filter].prereqs[i].module_code,
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
                    vue.Jsondata[filter].prereqs[i].grades.counts;
                vue.prereqCharts[i].data.datasets[0].tooltips =
                    vue.Jsondata[filter].prereqs[i].grades.students;
                vue.prereqCharts[i].update();
            }

        }
    },



    template: `<div class='container-fluid'>
        <div v-if='!display' style='text-align: center; margin-top: 48px; opacity: 0.5'>
            <i class='fas fa-spinner fa-pulse fa-lg'></i>
        </div>
        <div v-bind:class='["chart-rows", display ? "" : "hide"]'>
        <div class = 'container-fluid'>
            Filter by
            <select v-model="selected" class='form-control' style='width: unset; display: inline; margin-left: 6px;' >
                <option v-for='filter in filters'>
                    {{ filter}}
                </option>
            </select>
            </div>
            <div class='demographic-chart card'>
                <h2>CAP of incoming students</h2>
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
            <div class='demographic-chart card' v-if='module_tag_counts.length > 0'>
                <h2>Tag Interest</h2>
                <p>Students are interested in:</p>
                <div>
                    <span v-for='tag in module_tag_counts' class='badge badge-light' style='margin: 3px; white-space: unset;'>{{tag.tag}} ({{tag.count}})</span>
                </div>
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
                <button :id='prereq.module_code + "-header"' class='btn btn-outline-info' style='margin-top: 12px;'> Hover for more information on {{prereq.module_code}}</button>
            </div>
            <div class='wide-chart card'>
                <h2>Predicted Students To Lookout For</h2>
                <p>A statistical model was run to predict which students may fare better or worse than the average.
                This is based on historical data, by comparing past students' grades and which modules they have
                taken, to what incoming students have also taken before. </p>
                <div class='row'>
                    <div class='col-6'>
                        <p class='lead'>May be ahead of the class:</p>
                        <table class='table table-sm table-hover'>
                            <thead>
                                <tr>
                                    <th>Student Token</th>
                                    <th>Score</th>
                                    <th>Influencing Modules</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-on:click= showStudents(student[0]) style='cursor:pointer;' v-for='student in predicted_scores_good'>
                                    <td>{{student[0]}}</td>
                                    <td style='text-align:right;'>{{student[1].toFixed(2)}}</td>
                                    <td>
                                        <span class='badge badge-light' v-for='module in student[2]' style='margin-right: 3px;'>{{module.code}}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class='col-6'>
                        <p class='lead'>May need some time to catch up:</p>
                        <table class='table table-sm table-hover'>
                            <thead>
                                <tr>
                                    <th>Student Token</th>
                                    <th>Score</th>
                                    <th>Influencing Modules</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-on:click= showStudents(student[0]) style='cursor:pointer;' v-for='student in predicted_scores_bad'>
                                    <td>{{student[0]}}</td>
                                    <td style='text-align:right;'>{{student[1].toFixed(2)}}</td>
                                    <td>
                                        <span class='badge badge-light' v-for='module in student[2]' style='margin-right: 3px;'>{{module.code}}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>`
};

Vue.component('module-enrolment-table', {
    props: ['data', 'show_extra_data', 'prereqs'],
    template: `
        <table class='table' v-if='data.length > 0'>
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
                <tr v-for='row in data'>
                    <td><router-link :to='"/view-student/"+row.token' class='btn btn-outline-primary' data-dismiss="modal">{{row.token}}</router-link></td>
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
        </table>`
})
/**
 * Loaded by the Enrolment tab. 
 * 
 * Pulls data from the /backend/faculty/enrolment/ endpoint.
 * 
 * Display the module enrolment table, the student modal
 * 
 */
const ModuleEnrolment = {
    props: ["show_extra_data", 'student_enrolment', 'module_prereqs'],
    template: `
    <div class='container-fluid'><transition name='fade'>
        <module-enrolment-table :data='student_enrolment' :show_extra_data='show_extra_data' :prereqs='module_prereqs'></module-enrolment-table>
    </transition></div>`
};
