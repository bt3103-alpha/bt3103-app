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

const ModuleDemographics = { template: "<div>Demographics stuff here</div>" };
const ModuleAcademics = { template: "<div>Academics stuff here</div>" };
const ModuleEnrolment = { template: "<div>Enrolment stuff here</div>" };
