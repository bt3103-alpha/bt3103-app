const Module = {
    template: `
    <div>
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
            years: []
        };
    },
    created() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            var vue = this;
            fetch("/backend/faculty/demographics/"+this.$route.params.module)
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                vue.grades = json.grades;
                vue.degrees = json.degrees;
                vue.years = json.years;
            })
        }
    }, 
    watch: {
        '$route' (to, from) {
            this.fetchData();
        }
    }, 
    template: `<div>
    <div class='row'>
        <div class='col'>
        <year-chart :data="years"></year-chart>
        </div>
        <div class='col'>
        </div>
    </div>
    <div class='row'>
        <div class='col'>
        </div>
        <div class='col'>
        </div>
    </div>
    </div>`
};

const ModuleAcademics = { template: "<div>Academics stuff here</div>" };
const ModuleEnrolment = { template: "<div>Enrolment stuff here</div>" };

// 