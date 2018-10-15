const Module = {
    template: `
    <div class='module-page'>
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
        <transition name='fade'>
            <router-view class='child-view'></router-view>
        </transition>
    </div>`
};

const ModuleDemographics = {
    data() {
        return {
            grades: [],
            degrees: [], 
            yearsChart: null,
            pastGradesChart: null,
            currGradesChart: null
        };
    },
    mounted() {
        this.fetchData();

        this.yearsChart = new Chart(document.getElementById("yearsChart"), {
            type: "pie",
            data: {
                labels: ["Year 1", "Year 2", "Year 3", "Year 4"],
                datasets: [
                    {
                        label: "No. of students",
                        data: [0, 0, 0, 0],
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.6)",
                            "rgba(54, 162, 235, 0.6)",
                            "rgba(255, 206, 86, 0.6)",
                            "rgba(75, 192, 192, 0.6)"
                        ]
                    }
                ]
            },
            options: {
                cutoutPercentage: 50,
                animation: {
                    animateScale: true
                }
            }
        });

        this.currGradesChart = new Chart(document.getElementById("currGradesChart"), {
            type: "bar",
            data: {
                labels: ['First', 'Second Upper', 'Second Lower', 'Third', 'Pass', 'Fail'],
                datasets: [
                    {
                        label: "No. of students",
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: "rgba(100, 155, 255, 0.6)"
                    }
                ]
            }, 
            options: {
                layout: {
                    padding: {
                        left: 10,
                        right: 10
                    }
                }
            }
        });

        this.pastGradesChart = new Chart(document.getElementById("pastGradesChart"), {
            type: "bar",
            data: {
                labels: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D+", "D", "F"],
                datasets: [
                    {
                        label: "No. of students",
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: "rgba(100, 155, 255, 0.6)"
                    }
                ]
            }
        });

    },
    methods: {
        fetchData() {
            var vue = this;
            fetch("/backend/faculty/demographics/" + this.$route.params.module)
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
                    for (let i = 0; i < json.curr_grades.length; i++) {
                        vue.currGradesChart.data.datasets[0].data[i] = json.curr_grades[i][1];
                    }
                    vue.currGradesChart.update();
                    
                    // Update past grades
                    for (let i = 0; i < json.grades.length; i++) {
                        vue.pastGradesChart.data.datasets[0].data[i] = json.grades[i][1];
                    }
                    vue.pastGradesChart.update();
                });
        }
    },
    watch: {
        $route(to, from) {
            this.fetchData();
        }
    },
    template: `<div>
    <div class='row'>
        <div class='demographic-chart card'>
            <h2>Years of incoming students</h2>
            <p>Your current students are made up of:</p>
            <canvas id="yearsChart" width="100" height="70"></canvas>
        </div>
        <div class='demographic-chart card'>
            <h2>Grades of incoming students</h2>
            <p>Your current students have the following grades:</p>
            <canvas id="currGradesChart" width="100" height="70"></canvas>
        </div>
    </div>
    <div class='row'>
        <div class='demographic-chart card'>
            <h2>Historical grades</h2>
            <p>The students who took this class in previous semesters got the following grades:</p>
            <canvas id="pastGradesChart" width="100" height="70"></canvas>
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

const ModuleAcademics = { template: "<div>Academics stuff here</div>" };

const ModuleEnrolment = { 
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
            fetch("/backend/faculty/enrolment/" + this.$route.params.module)
                .then(function(response) {
                    return response.json();
                })
                .then(function(json) {
                    vue.enrolment = json;
                });
        }
    }, 
    template: `
    <transition name='fade'>
    <table class='table table-hover' v-if='enrolment.length > 0'>
        <thead class='thead-light'>
            <tr>
                <th>Token</th>
                <th>Degree</th>
                <th>Admit Term</th>
                <th>CAP</th>
                <th>Attendance Rate</th>
                <th>Webcast Rate</th>
                <th>&nbsp;</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for='row in enrolment'>
                <td>{{row.token_json}}</td>
                <td>{{row.degrees}}</td>
                <td>{{row.admit_term}}</td>
                <td>{{row.CAP}}</td>
                <td>{{row.attendance}}%</td>
                <td>{{row.webcast}}%</td>
                <td><a :href='"mailto:"+row.token_json+"@u.nus.edu?subject=["+$route.params.module+"] "' class='btn btn-info'><i class='fas fa-envelope'></i></a></td>
            </tr>
        </tbody>
    </table>
    </transition>`
 };
