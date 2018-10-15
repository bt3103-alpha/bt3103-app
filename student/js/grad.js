class Module {
    constructor(name) {
        this.name = name;
        this.level = parseInt(name.match(/\d/));
        this.dept = name.substring(0, name.indexOf(this.level));
    }
}

class Requirement {
    /**
     *
     * @param {list} details List of requirements to be met
     * @param {int} req_num Number of the requirements that need to be met. Default: 1
     * @param {string} field If applicable, what field to check for requirements (e.g. name, level). Default: name
     * @param {list} subset List of module names which have to fulfill the requirements
     * @param {list} ofWhichs List of further requirements that those who pass the first this requirement must fulfill
     */
    constructor(details, req_num, field, subset, ofWhichs) {
        this.details = details;
        this.req_num = req_num;
        this.field = field;
        this.curr_modules = [];
        this.passed = null;
        this.subset = subset;
        this.ofWhichs = ofWhichs;
        
        if (this.req_num == null) {
            // this.req_num = this.details.length;
            this.req_num = 1;
        }

        if (this.field == null) {
            this.field = "name";
        }
    }

    // Returns string version of requirement
    toString() {
        let output = "";
        let bracket = false;

        // Specify quantity
        if (this.details.length > 1) {
            if (this.req_num == 1) {
                output += "either ";
                // bracket = true;
            } else if (this.req_num == this.details.length) {
                bracket = true;
            } else {
                output += "at least " + this.req_num + " from ";
                // bracket = true;
            }
            if (bracket) {
                output += "(";
            }
        }

        // List field, if not name
        if (this.field != "name") {
            output += "at least " + this.req_num;
        }

        // List details
        for (let i = 0; i < this.details.length; i++) {
            if (i > 0) {
                if (i == this.details.length - 1) {
                    if (this.req_num > 1) {
                        output += " and ";
                    } else {
                        output += " or ";
                    }
                } else {
                    output += ", ";
                }
            }

            switch (this.field) {
                case "name":
                    if (typeof this.details[i] == "string") {
                        output += "<a href='view-module.html?name="+String(this.details[i])+"' class='module-link'>" + String(this.details[i]) + "</a>";
                    } else {
                        output += String(this.details[i]);
                    }
                    break;
                case "level":
                    output += " level " + this.details[0] + "k modules";
                    break;
            }
        }

        if (this.subset != null && this.subset.length > 0) {
            output += " from ";
            for (let i = 0; i < this.subset.length; i++) {
                if (i > 0) {
                    if (i == this.subset.length - 1) {
                        output += " and ";
                    } else {
                        output += ", ";
                    }
                }
                if (typeof this.subset[i] == "string") {
                    output += "<a href='view-module.html?name="+String(this.subset[i])+"' class='module-link'>" + String(this.subset[i]) + "</a>";
                } else {
                    output += String(this.subset[i]);
                }
            }
        }

        if (bracket) {
            output += ")";
        }

        if (this.ofWhichs != null) {
            output += ", of which ";
            for (let i = 0; i < this.ofWhichs.length; i++) {
                output += this.ofWhichs[i].toString();
            }
        }

        return output;
    }

    checkOfWhichs() {
        if (this.ofWhichs == null) {
            return true;
        } else {
            for (let i = 0; i < this.ofWhichs.length; i++) {
                if (!this.ofWhichs[i].pass(this.curr_modules)) {
                    return false;
                }
            }
        }
        return true;
    }

    // Check if these requirements are met
    eval(modules) {

        const log = "at least 5 level 4k modules" == this.toString();

        this.curr_modules = [];
        let req_left = this.req_num;
        for (let detail_index = 0; detail_index < this.details.length; detail_index++) {
            // If detail is another req, check if pass
            // Else, loop through modules and see if it meets
            if (
                typeof this.details[detail_index] == "string" ||
                typeof this.details[detail_index] == "number"
            ) {
                // Module itself
        
                for (let i = 0; i < modules.length; i++) {
                    if (modules[i][this.field] == this.details[detail_index]) {
                        req_left--;
                        this.curr_modules.push(modules[i]);
                        if (req_left == 0) {
                            return this.checkOfWhichs();
                        }
                    }
                }
            } else {
                // Nested requirement
                if (this.details[detail_index].pass(modules)) {
                    req_left--;
                    this.curr_modules = this.curr_modules.concat(this.details[detail_index].curr_modules);
                    if (req_left == 0) {
                        return this.checkOfWhichs();
                    }
                }
            }
        }

        return false;
    }

    pass(modules) {
        if (this.passed == null) {
            this.passed = this.eval(modules);
        }
        return this.passed;
    }

    // Check which modules currently fulfill the requirement
    currentModules() {
        let output = "<ul class='grad_modules_taken'>";
        for (let i = 0; i < this.curr_modules.length; i++) {
            output +=
                "<li><a href='view-module.html?name=" +
                this.curr_modules[i].name +
                "'>" +
                this.curr_modules[i].name +
                "</a></li>";
        }
        output += "</ul>";
        return output;
    }
}

const listA = [
    "DSC3224",
    "DBA3712",
    "IE3120",
    "IS3240",
    "BT4013",
    "BT4016",
    "BT4221",
    "BT4212",
    "DSC4213",
    "DBA4811",
    "IS4241",
    "IS4250",
    new Requirement(["MKT4415C", "MKT4420"])
];

const listB = [
    "CS3244",
    new Requirement(["DSC3216", "DBA3803"]),
    new Requirement(["BSP4513", "BSE4711"]),
    "BT4012",
    "BT4015",
    "BT4221",
    "IS4241",
    "IE4210",
    "ST4240",
    "ST4245"
];

const listC = ["IS3221", "IS3261", "BT4014", "IS4228", "IS4302"];

const allPEs = listA.concat(listB).concat(listC);
var uniquePEs = [];

for (let i = 0; i < allPEs.length; i++) {
    if (!uniquePEs.includes(allPEs[i])) {
        uniquePEs.push(allPEs[i]);
    }
}

var requirements = [
    new Requirement(["ACC1002X"]),
    new Requirement(["BT1101"]),
    new Requirement(["CS1010S"]),
    new Requirement(["CS1020"]),
    new Requirement(["EC1301"]),
    new Requirement(["IS1103"]),
    new Requirement(["IS1105", "IS3103"]),
    new Requirement(["IS1112", "BT2102"]),
    new Requirement(["MA1311", "MA1101R"]),
    new Requirement(["MA1521", "MA1102R"]),
    new Requirement(["MKT1003X"]),
    new Requirement(["BT2101"]),
    new Requirement(["IE2110", "DSC3214", "DBA3701"]),
    new Requirement(["IS2101"]),
    new Requirement([
        new Requirement(["ST2131", "ST2132"], 2),
        new Requirement(["ST2334", "CS2010"], 2)
    ]),
    new Requirement(["BT3101"]),
    new Requirement(["BT3102"]),
    new Requirement(["DSC3215"]),
    new Requirement(["BT3103", "IS4240"]),
    new Requirement(["ST3131", "BT4240"]),
    new Requirement(listA, 2),
    new Requirement(listB, 2),
    new Requirement(uniquePEs, 6, 'name', null, [
        new Requirement([4], 5, "level")
    ]),
    new Requirement(['IS4010']),
    // new Requirement(uniquePEs, 6),
    // new Requirement([4], 5, "level", uniquePEs),
];

var profile = {};
var modules = [];

// Fetch Name
fetch("https://bt3103-alpha-student.firebaseio.com/profile.json")
    .then(response => {
        return response.json();
    })
    .then(json => {
        document.getElementById("profile_name").innerHTML = json.name;
    });

fetch("https://bt3103-alpha-student.firebaseio.com/schedule.json")
    .then(response => {
        return response.json();
    })
    .then(json => {
        // Prepare list of modules
        for (let sem_index = 0; sem_index < json.length; sem_index++) {
            if (json[sem_index] == null) {
                continue;
            }
            for (let i = 0; i < json[sem_index].length; i++) {
                modules.push(new Module(json[sem_index][i].name));
            }
        }

        // Display list of requirements and whether they are met
        displayRequirements();
    });

function displayRequirements() {
    let tbl = document.getElementById("table_body");
    tbl.innerHTML = "";
    for (let req_id = 0; req_id < requirements.length; req_id++) {
        let req = requirements[req_id];
        let row = "<tr><td>";

        // Draw tick/cross if they have met the requirement
        let req_pass = req.pass(modules);
        if (req_pass) {
            row += "<i class='fas fa-check colour-green'></i>";
        } else {
            row += "<i class='fas fa-times colour-red'></i>";
        }

        row += "</td><td>" + req.toString() + "</td><td>" + req.currentModules() + "</td></tr>";
        tbl.innerHTML += row;
    }
}
