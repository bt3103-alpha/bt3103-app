async function getModuleInfo(module_code) {
    return fetch('/bt3103-app/backend/module_description/' + module_code)
        .then((resp) => {
            return resp.json()
        })
}
        
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
            module_name: "",
            name: "",
            module_description: "",
            prereq_arr: [],
            completed: [],
            completed_dict: {},
            tag_arr: []
        },
        created() {
            let url = new URL(window.location.href);
            this.module_code = url.searchParams.get("name");

            if (this.module_code != null) {              
                const vue = this;
                getModuleInfo(this.module_code)
                    .then((resp)=>{
                        vue.module_name = resp.title;
                    })
                // this.module_name = search_codes[this.module_code.toLowerCase()].name;
            }

            // Fetch name
            fetch("https://bt3103-alpha-student.firebaseio.com/profile.json")
                .then(response => {
                    return response.json();
                })
                .then(json => {
                    this.name = json.name;
                });

            
        }
    });
};
