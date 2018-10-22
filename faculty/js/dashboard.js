async function getMainModuleInfo(module_code) {
    console.log('3')
    return fetch('/bt3103-app/backend/faculty/main/' + module_code)
        .then((resp) => {
            console.log('4')
            return resp.json()
        })
}

const Dashboard = {
    props: ["modules"],
    data() {
        return {
            modules_info: []
        }


    },
    created() {
        this.updateModuleInfo();
    },
    methods: {
        updateModuleInfo: function () {
            console.log('vue', this);
            const vue = this;
            for (mod in this.modules) {
                console.log("2!")
                getMainModuleInfo(this.modules[mod]).then((resp) => {
                    console.log('vue2', this);
                    vue.modules_info.push(resp);
                    console.log(vue.modules_info)
                })
            }

        },
        updateModules: function () {
            const vue = this;
            modules.append()
        }
    },


    template:
    `<div class='container module-page'>
        <h1> Overview of Modules</h1>
        <div class='chart-rows'>
            <div class='wide-chart card' v-for='mod in modules_info'>
                <div class = "row">
                    <div class='col-12'>
                        <h2>{{mod["module_code"]}}</h2>
                        <i class='fas fa-user'></i>
                    </div>
                </div>

                <div class="row">
                    <div class="col-3">
                        <p>Number of Students: {{mod["number of students"]}}</p>
                    </div>
                    <div class="col-3">
                        <p>Number of Unfinished Webcasts: {{mod["number of webcasts unfinished"]}}</p>
                    </div>
                    <div class="col-3">
                        <p>Number of Unviewed Forum: {{mod["unviewed forum"]}}</p>
                    </div>
                    <div class="col-3">
                        <p>Tutorial Attendance: {{mod["tutorial attendance"]}}% </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
}
