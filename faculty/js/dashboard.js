async function getMainModuleInfo(module_code) {
    return fetch('/bt3103-app/backend/faculty/main/' + module_code)
        .then((resp) => {
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
            const vue = this;
            for (mod in this.modules) {
                getMainModuleInfo(this.modules[mod]).then((resp) => {
                    vue.modules_info.push(resp);
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
        <h1> Your Teaching Modules</h1>
        <div class='chart-rows'>
            <div class='wide-chart card' v-for='mod in modules_info'>
                <div class = "row">
                    <div class='col-12 overview-module-code-tag'>
                    <router-link :to='"/"+mod["module_code"]' class='overview-module-code'>{{mod["module_code"]}}</router-link>
                    </div>
                </div>

                <div class="row module-rows">
                    <div class="col-3" >
                        <div class= "overview-numfonts">{{mod["number of students"]}}</div>
                        <div class="overview-fonts"> Number of students</div>
                        <i class='fas fa-user fa-2x'></i>
                    </div>
                    <div class="col-3">
                        <div class= "overview-numfonts">{{mod["number of webcasts unfinished"]}}</div>
                        <div class="overview-fonts">Did not complete webcast  </div>
                        <i class='fas fa-desktop fa-2x'></i>
                    </div>
                    <div class="col-3">
                        <div class= "overview-numfonts">{{mod["unviewed forum"]}}</div>
                        <div class="overview-fonts">Forums not viewed</div>
                        <i class='fas fa-comments fa-2x'></i>
                    </div>
                    <div class="col-3">
                        <div class= "overview-numfonts">{{mod["tutorial attendance"]}}% </div>
                        <div class="overview-fonts">Tutorial attendance rate</div>
                        <i class='fas fa-clipboard-check fa-2x'></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
}
