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
    { path: "/", component: Dashboard },
    { path: "*", redirect: "/" }
];

function checkRefreshStatus() {
    fetch("/backend/fetch_data/status")
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
            modules: ["MA1505", "GER1000", "MA1506"],
            fetching_data: false,
            show_extra_data: true
        },
        methods: {
            fetch_data: function() {
                this.fetching_data = true;
                fetch("/backend/fetch_data");
                poll_status = setInterval(checkRefreshStatus, 500);
            }
        }
    });
};
