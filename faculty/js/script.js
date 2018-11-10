var app;
var poll_status;

const routes = [
    {
        path: "/:module",
        component: Module,
        children: [
            { path: "demographics", component: ModuleDemographics },
            { path: "academics", component: ModuleAcademics },
            { path: "enrolment", component: ModuleEnrolment },
            { path: "", redirect: "demographics" }
        ]
    }, 
    { 
        path: "/view-student/:student", 
        component: Student
    }, 
    { path: "/", component: Dashboard },
    { path: "*", redirect: "/" }
];

function checkRefreshStatus() {
    fetch("/bt3103-app/backend/fetch_data/status")
        .then(function(response) {
            return response.json();
        })
        .then(updateRefreshStatus);
}

function updateRefreshStatus(json) {
    document.getElementById("fetch_data_progress").style.width =
        json.progress + "%";
    if (json.progress == 100) {
        clearInterval(poll_status);
        setTimeout(function() {
            app.fetching_data = false;
        }, 800); // set delay so that the bar can reach full
    }
}

window.onload = function() {
    const router = new VueRouter({
        routes,
        linkActiveClass: "active"
    });

    app = new Vue({
        el: "#app",
        router,
        data: {
            name: "Chris",
            modules: ["MA1505", "GER1000", "MA1506", "EC3303", 'ST2334'],
            fetching_data: false,
            show_extra_data: true,

            student_enrolment: [], 
            module_prereqs: [], 

            studentFilter: [],
            studentFilterPrereqs: [],
        },
        methods: {
            fetch_data: function() {
                this.fetching_data = true;
                fetch("/bt3103-app/backend/fetch_data");
                poll_status = setInterval(checkRefreshStatus, 500);
            }, 
            get_module_data: function() {
                if (this.$route.params.module != undefined) {
                    var vue = this;

                    fetch('/bt3103-app/backend/prereqs/' + this.$route.params.module)
                        .then((response) => {
                            return response.json();
                        })
                        .then((json) => {
                            vue.module_prereqs = json;
                        })

                    fetch("/bt3103-app/backend/faculty/enrolment/" + this.$route.params.module)
                        .then(function(response) {
                            return response.json();
                        })
                        .then(function(json) {
                            vue.student_enrolment = json;
                        });
                }
            }
        }, 
        mounted() {
            this.get_module_data();
        }, 
        watch: {
            $route(to, from) {
                let module_to = to.params.module;
                let module_from = from.params.module;
                if (module_to != module_from) {
                    // Switched module
                    // Pull enrolment data
                    this.get_module_data();
                }
            }
        }
    });

    $("#studentModal").on('hidden.bs.modal', function(e) {
        app.studentFilter = []
        app.studentFilterPrereqs = []
    })
};
