const Student = {
    props: ['show_extra_data', 'modules'],
    data() {
        return {
            token: '',
            information: {},
            curr_modules: [], 
            past_modules: [], 
            extra_data: ['Attendance Rate', 'Webcast Rate'], 
        }
    }, 
    created() {
        this.update_student_info();
    }, 
    watch: {
        $route() {
            this.update_student_info();
        }
    }, 
    methods: {
        update_student_info: function() {
            // Fetch student information
            // Update data
            this.token = this.$route.params.student;
            fetch('/bt3103-app/backend/faculty/student/' + this.token)
                .then((resp) => {
                    return resp.json();
                })
                .then((json) => {
                    this.information = json.information;
                    this.curr_modules = json.curr_modules;
                    this.past_modules = json.past_modules;
                })
            this.name = '';
        }
    }, 
    template: `
        <div class='module-page' style='margin-bottom: 48px;'>
            <transition name='fade'>
                <div class='container' v-if='Object.keys(information).length > 0'>
                    <h1>{{name}} <code>({{token}})</code></h1>
                    <h2>Student Information</h2>
                    <table class='table'>
                        <tbody>
                            <tr v-for='item in information' v-if='(extra_data.indexOf(item.name) > -1 && show_extra_data) || extra_data.indexOf(item.name) == -1'>
                                <td>
                                    <strong>{{item.name}}</strong> &nbsp; &ndash; &nbsp; 
                                    <i>{{item.description}}</i>&nbsp;
                                    <span v-if='extra_data.indexOf(item.name) > -1' class='badge badge-warning'>mocked up data</span>
                                </td>
                                <td style='white-space:nowrap;'>{{item.value}}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div v-if='curr_modules.length > 0'>
                        <h2>Modules being taken this semester:</h2>
                        <div class='chart-rows'>
                            <router-link :to='"/"+module.module_code' tag='div' v-for='module in curr_modules' v-if='modules.indexOf(module.module_code) > -1' class='module-card module-card-owned' :key='module.module_code'>
                                <div v-if='show_extra_data' class='module-title'>{{module.module_code}} - {{module.nusmods_name}}</div>
                                <div v-else class='module-title'>{{module.module_code}} - {{module.course_title}}</div>
                            </router-link>
                            <div v-for='module in curr_modules' v-if='modules.indexOf(module.module_code) == -1' class='module-card' :key='module.module_code'>
                                <div v-if='show_extra_data' class='module-title'>{{module.module_code}} - {{module.nusmods_name}}</div>
                                <div v-else class='module-title'>{{module.module_code}} - {{module.course_title}}</div>
                            </div>
                        </div>
                        <div v-if='show_extra_data'>(Module names <span class='badge badge-success'>third-party data</span>)</div>
                    </div>

                    <div v-if='past_modules.length > 0'>
                        <h2>Past Modules</h2>
                        <div class='chart-rows'>
                            <router-link :to='"/"+module.module_code' tag='div' v-for='module in past_modules' v-if='modules.indexOf(module.module_code) > -1' class='module-card module-card-owned' :key='module.module_code'>
                                <div v-if='show_extra_data' class='module-title'>{{module.module_code}} - {{module.nusmods_name}}</div>
                                <div v-else class='module-title'>{{module.module_code}} - {{module.course_title}}</div>
                                <p>Taken in {{module.term}}<br />Final grade: {{module.final_grade}}</p>
                            </router-link>
                            <div v-for='module in past_modules' v-if='modules.indexOf(module.module_code) == -1' class='module-card' :key='module.module_code'>
                                <div v-if='show_extra_data' class='module-title'>{{module.module_code}} - {{module.nusmods_name}}</div>
                                <div v-else class='module-title'>{{module.module_code}} - {{module.course_title}}</div>
                                <p>Taken in {{module.term}}<br />Final grade: {{module.final_grade}}</p>
                            </div>
                        </div>
                        <div v-if='show_extra_data'>(Module names <span class='badge badge-success'>third-party data</span>)</div>
                    </div> 



                </div>
            </transition>
        </div>
    `
}