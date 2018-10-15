function searchModules() {
    let results = search(document.getElementById("module_search").value);
    let resultsDiv = document.getElementById("search_results");
    resultsDiv.innerHTML = "";
    for (let i = 0; i < results.length; i++) {
        resultsDiv.innerHTML +=
            "<a href='view-module.html?name=" +
            results[i].code +
            "'>" +
            results[i].code +
            " - " +
            results[i].name +
            "</a>";
    }
}

window.onload = function() {
    app = new Vue({
        el: "#app",
        data: {
            module_code: "",
            name: "",
            prereq_arr: [],
            completed: [],
            completed_dict: {},
            tag_arr: []
        },
        created() {
            let url = new URL(window.location.href);
            this.module_code = url.searchParams.get("name");
            if (this.module_code != null) {
                this.module_name = search_codes[this.module_code.toLowerCase()].name;
            }

            // Fetch name
            fetch("https://bt3103-alpha-student.firebaseio.com/profile.json")
                .then(response => {
                    return response.json();
                })
                .then(json => {
                    this.name = json.name;
                });

            // Get prereq and tags
            fetch("https://bt3103-prereq-tag.firebaseio.com/.json")
                .then(response => {
                    return response.json();
                })
                .then(json => {
                    this.prereq_arr = Object.keys(json[this.module_code].prereq);
                    // actually shouldnt be like this la should be from the database but for now i do this
                    this.completed = ["BT1101", "MA1521"];
                    for (premodule in this.prereq_arr) {
                        if (premodule in this.completed) {
                            this.completed_dict[premodule] = true;
                        } else {
                            this.completed_dict[premodule] = false;
                        }
                    }
                    // how will the data of this be ah
                    this.tag_arr = Object.keys(json[this.module_code].tag);
                });
        }
    });
};
