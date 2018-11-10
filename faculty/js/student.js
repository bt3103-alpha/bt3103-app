const Student = {
    props: ['show_extra_data'],
    data() {
        return {
            token: '',
            student: {}
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
                    this.student = json;
                })
            this.name = '';
        }
    }, 
    template: `
        <div class='module-page'>
            <div class='container' v-if='Object.keys(student).length > 0'>
                <h1>{{name}} <code>({{token}})</code></h1>
                <table class='table'>
                    <tbody>
                        <tr v-for='item in student'>
                            <td><strong>{{item.name}}</strong> &nbsp; &ndash; &nbsp; <i>{{item.description}}</i></td>
                            <td style='white-space:nowrap;'>{{item.value}}</td>
                        </tr>
                    </tbody>
                </table>
                <div>
                    <h2>Modules Taken</h2>
                </div>
            </div>
        </div>
    `
}