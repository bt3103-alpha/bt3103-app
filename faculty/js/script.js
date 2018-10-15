var app;

const routes = [
    {
        path: "/:module",
        component: Module,
        children: [
            { path: "demographics", component: ModuleDemographics },
            { path: "academics", component: ModuleAcademics },
            { path: "enrolment", component: ModuleEnrolment },
            { path: '', redirect: 'demographics' }
        ]
    },
    { path: "/", component: Dashboard },
    { path: "*", redirect: "/" }
];

window.onload = function() {
    const router = new VueRouter({
        routes, 
        linkActiveClass: "active",
    });

    app = new Vue({
        el: "#app",
        router,
        data: {
            name: "Chris",
            modules: ["BT3103", "CS3244"]
        }
    });
};
