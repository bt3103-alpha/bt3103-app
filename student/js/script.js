function searchModules(search_id) {
    let results = search(document.getElementById(search_id).value);
    let resultsDiv = document.getElementById(search_id+"_results");
    resultsDiv.innerHTML = "";
    for (let i = 0; i < results.length; i++) {
        resultsDiv.innerHTML += "<a href='view-module.html?name="+results[i].code+"'>" + results[i].code + " - " + results[i].name + "</a>";
    }
}

const reset_schedule = [
    [
        { name: "BT1101", type: "module-core", mc: 4, grade: "A" },
        { name: "CS1010S", type: "module-core", mc: 4 },
        { name: "MKT1003X", type: "module-core", mc: 4 },
        { name: "RE2102", type: "module-ue", mc: 4},
        { name: "GEK1517", type: "module-ue", mc: 4}
    ],
    [
        { name: "BT2101", type: "module-core", mc: 4 },
        { name: "EC1301", type: "module-core", mc: 4 },
        { name: "PF2103", type: "module-ue", mc: 4}
    ],
    [
        { name: "IS4240", type: "module-pe", mc: 4 },
        { name: "General UE", type: "module-ue", mc: 4 },
        { name: "General PE", type: "module-pe", mc: 4 }
    ], 
    [], 
    [
        { name: 'DSC3216', type: 'module-pe', mc: 4 },
    ]
];

const reset_suggestions = [
    {
        core: [
            { name: "MA1521", type: "module-core", mc: 4 },
            { name: "ACC1002X", type: "module-core", mc: 4 },
            { name: "IS1103", type: "module-core", mc: 4 }
        ],
        pe: [],
        ue: [
            { name: "GER1000", type: "module-ue", mc: 4 },
            { name: "GET1030", type: "module-ue", mc: 4 }
        ]
    },
    {
        core: [
            { name: "CS1020", type: "module-core", mc: 4 },
            { name: "IS1105", type: "module-core", mc: 4 }
        ],
        pe: [{ name: "CS3244", type: "module-pe", mc: 4 }],
        ue: [{ name: "GEH1300", type: "module-ue", mc: 4 }]
    },
    {
        core: [{ name: "IE2110", type: "module-core", mc: 4 }],
        pe: [
            { name: "IS4241", type: "module-pe", mc: 4 },
            { name: "BT4015", type: "module-pe", mc: 4 },
            { name: "BT4221", type: "module-pe", mc: 4 }
        ],
        ue: [
            { name: "CM1502", type: "module-ue", mc: 4 },
            { name: "EL1101E", type: "module-ue", mc: 4 }
        ]
    },
    {
        core: [{ name: "DSC3215", type: "module-core", mc: 4 }],
        pe: [
            { name: "IS3221", type: "module-pe", mc: 4 },
            { name: "BT4013", type: "module-pe", mc: 4 },
            { name: "BT4014", type: "module-pe", mc: 4 }
        ],
        ue: []
    },
    {
        core: [],
        pe: [
            { name: "IS4302", type: "module-pe", mc: 4 },
            { name: "BT4211", type: "module-pe", mc: 4 },
            { name: "BT4222", type: "module-pe", mc: 4 }
        ],
        ue: []
    }
];

var app; // Vue app

window.onload = function() {
    const db = firebase
        .initializeApp({
            databaseURL: "https://bt3103-alpha-student.firebaseio.com"
        })
        .database();

    var scheduleRef = db.ref("schedule");
    var suggestionsRef = db.ref("suggestions");

    app = new Vue({
        el: "#app",
        firebase: {
            schedule: {
                source: db.ref("schedule"),
                asObject: true,
                readyCallback: function() {
                    // Append to schedule if missing semesters
                    this.fillMissingSemesters();
                }
            },
            suggestions: {
                source: db.ref("suggestions"),
                asObject: true
            }
        },
        data: {
            mode: "schedule",

            special_progs_dict: {
                "0": "not pursing any special programmes",
                "1": "pursuing a minor",
                "2": "pursing a double major",
                "3": "pursing a double degree"
            },

            grade_lookup: {
                "A+": 5,
                A: 5,
                "A-": 4.5,
                "B+": 4,
                B: 3.5,
                "B-": 3,
                "C+": 2.5,
                C: 2,
                "D+": 1.5,
                D: 1,
                F: 0
            },

            profile: {name: ""},
            num_years: 4,
            semesters: [],
            dragging: false,
            recommendation_semester: -1, // used for the dropdown on the right

            // used for selecting elective on the bottom
            select_elective_display: false,
            select_elective_semester: 0,
            select_elective_semester_item: 0,
            select_elective_type: "", // e.g. "Program"
            select_elective_type_short: "", // e.g. "pe"
            select_elective_suggested_mods: [],

            schedule: [],
            suggestions: []
        },
        created() {
            // Fetch Name
            fetch("https://bt3103-alpha-student.firebaseio.com/profile.json")
                .then(response => {
                    return response.json();
                })
                .then(json => {
                    this.profile = json;

                    // Create the list of semesters
                    for (let year = 1; year <= parseInt(this.profile.candidature); year++) {
                        this.semesters.push("Y" + year + "S1");
                        this.semesters.push("Y" + year + "S2");
                    }
                });
        },
        methods: {
            fillMissingSemesters: function() {
                for (var i = 0; i < this.semesters.length; i++) {
                    if (this.schedule[".value"][i] == null) {
                        this.schedule[".value"][i] = [];
                    }
                }
            },
            sumMCs: function(mods) {
                if (mods != null) {
                    let sum = 0;
                    for (var i = 0; i < mods.length; i++) {
                        sum += mods[i].mc;
                    }
                    return sum;
                } else {
                    return 0;
                }
            },
            changeGrade: function(input) {
                let new_grade = input[0];
                let sem_index = input[1];
                let mod_name = input[2];

                let sem = this.schedule[".value"][sem_index];

                for (var i = 0; i < sem.length; i++) {
                    if (sem[i].name == mod_name) {
                        sem[i]["grade"] = new_grade;
                        this.$forceUpdate();
                        return;
                    }
                }
            },
            calcCAP: function() {
                var capSum = 0;
                var MCs = 0;
                if (this.schedule[".value"] != null) {
                    for (
                        var sem_index = 0;
                        sem_index < this.schedule[".value"].length;
                        sem_index++
                    ) {
                        for (var i = 0; i < this.schedule[".value"][sem_index].length; i++) {
                            let mod = this.schedule[".value"][sem_index][i];

                            if (mod.grade != null && mod.grade != "-") {
                                capSum += this.grade_lookup[mod.grade] * mod.mc;
                                MCs += mod.mc;
                            }
                        }
                    }
                    if (MCs > 0) {
                        return (capSum / MCs).toFixed(2);
                    } else {
                        return "-";
                    }
                } else {
                    return "-";
                }
            },

            resetInfo: function() {
                scheduleRef.remove();
                suggestionsRef.remove();
                scheduleRef.update($.extend({}, reset_schedule));
                suggestionsRef.update($.extend({}, reset_suggestions));
                this.fillMissingSemesters();
            },

            syncModules: function() {
                // Sync with firebase
                scheduleRef.update($.extend({}, this.schedule[".value"]));
                suggestionsRef.update($.extend({}, this.suggestions[".value"]));
                this.fillMissingSemesters();
            }
        }
    });

    Vue.component("module-schedule", {
        props: ["name", "type", "sem", "mode", "grade", "module_index"],
        template:
            "\
        <div :class=\"['module', 'module-schedule', mode == 'schedule' ? ['draggable', type] : '']\" :key='name'>\
            <div class='module-header' v-if='mode == \"schedule\"'>\
                <a href='#' class='select-module module-general module-name' v-on:click='selectElective' v-if='name.includes(\"General\")'>\
                    {{ name }}\
                </a>\
                <a :href='\"view-module.html?name=\"+name' class='view-module module-name' v-else>\
                    {{ name }}\
                    <i style='margin-left: 6px;' class='fas fa-angle-right view-module-icon'></i>\
                </a>\
                <i class='fas fa-times module-delete' v-on:click='remove'></i>\
            </div>\
            <div class='module-header' v-else>\
                <span class='module-name'>\
                    {{ name }}\
                </span>\
            </div>\
            <div class='module-info'>\
                4 MCs\
            </div>\
            <transition name='slideRight'>\
            <div v-if='mode == \"cap\"' class='module-grade'>\
                <select :value='grade' @input=\"$emit('change-grade', [$event.target.value, sem, name])\">\
                    <option>-</option>\
                    <option>A+</option>\
                    <option>A</option>\
                    <option>A-</option>\
                    <option>B+</option>\
                    <option>B</option>\
                    <option>B-</option>\
                    <option>C+</option>\
                    <option>C</option>\
                    <option>D+</option>\
                    <option>D</option>\
                    <option>F</option>\
                </select>\
            </div>\
            </transition>\
        </div>\
        ",
        mounted() {
            if (this.grade == null) {
                app.changeGrade(["-", this.sem, this.name]);
            }
        },
        methods: {
            selectElective: function() {
                app.select_elective_display = true;
                app.select_elective_semester = this.sem;
                app.select_elective_type =
                    this.name.substring(8) == "PE" ? "Program" : "Unrestricted";
                app.select_elective_type_short = this.name.substring(8).toLowerCase();
                if (
                    app.suggestions[".value"][app.select_elective_semester] != null &&
                    app.suggestions[".value"][app.select_elective_semester][
                        app.select_elective_type_short
                    ] != null
                ) {
                    app.select_elective_suggested_mods =
                        app.suggestions[".value"][app.select_elective_semester][
                            app.select_elective_type_short
                        ];

                    app.select_elective_semester_item = this.module_index;
                }
            },
            remove: function() {
                for (let i = 0; i < app.schedule[".value"][this.sem].length; i++) {
                    if (app.schedule[".value"][this.sem][i].name == this.name) {
                        app.schedule[".value"][this.sem].splice(i, 1);
                        app.syncModules();
                        return;
                    }
                }
            }
        }
    });

    Vue.component("module-add", {
        props: ["name", "type"],
        template:
            "\
        <div class='module module-add' :class='[type, {draggable: !name.includes(\"General\")}]' :key='name'>\
            <span v-if='name.includes(\"General\")' class='module-general'>{{name}}</span>\
            <a v-else :href='\"view-module.html?name=\"+name'>{{name}}</a>\
            <span class='filler'></span>\
            <a href='#' v-on:click='addRecommendation(name, type)' class='module-add'><i class='fas fa-plus'></i></a>\
        </div>",
        methods: {
            addRecommendation: function(name, type) {
                // Get the module object that is being added
                let suggestionIndex = app.recommendation_semester;

                // If it's a general module, we can just add it in directly
                if (name.startsWith("General ")) {
                    let newModule = { name: name, type: type, mc: 4 };
                    app.schedule[".value"][app.recommendation_semester].push(newModule);
                    app.syncModules();
                    return;
                }

                let dict = app.suggestions[".value"][suggestionIndex];
                Object.keys(dict).forEach(function(key) {
                    // Iterate through core, pe and ue
                    let modulesList = dict[key];
                    for (var i = 0; i < modulesList.length; i++) {
                        // Iterate through the modules
                        if (modulesList[i].name == name) {
                            // This is the module that was added
                            app.schedule[".value"][app.recommendation_semester].push(
                                modulesList[i]
                            ); // Add to schedule
                            modulesList.splice(i, 1); // Remove from recommendations
                        }
                    }
                });

                app.syncModules();
            }
        }
    });

    Vue.component("module-replace", {
        props: ["name", "type"],
        template:
            "\
        <div class='module module-add' :class='type'>\
            <a :href='\"view-module.html?name=\"+name'>{{name}}</a>\
            <span class='filler'></span>\
            <a href='#' v-on:click='swapGeneralMod(name, type)' class='module-add'><i class='fas fa-plus'></i></a>\
        </div>",
        methods: {
            swapGeneralMod: function(name, type) {
                let mod =
                    app.schedule[".value"][app.select_elective_semester][
                        app.select_elective_semester_item
                    ];
                mod.name = name;
                mod.type = type;
                app.select_elective_display = false;

                // Remove from recommendation
                let suggestionsList =
                    app.suggestions[".value"][app.select_elective_semester][
                        app.select_elective_type_short
                    ];
                for (let i = 0; i < suggestionsList.length; i++) {
                    if (suggestionsList[i].name == name) {
                        suggestionsList.splice(i, 1);
                    }
                }
                app.syncModules();
            }
        }
    });
};
