function searchTags() {
    let results = searchtagjs(document.getElementById("tag_search").value);
    let resultsDiv = document.getElementById("tag_search_results");
    resultsDiv.innerHTML = "";
    for (let i = 0; i < results.length; i++) {
        resultsDiv.innerHTML +=
            "<a href='view-tag.html?tag=" + results[i] + "'>"
            + results[i] +
            "</a>";
    }
}

function searchMod(results){
  let resultsDiv = document.getElementById("mod_search_results");
  resultsDiv.innerHTML = "";
  for (let key in results) {
      console.log(key);
      resultsDiv.innerHTML +=
          "<a href='view-module.html?name=" +
          key +
          "'>" +
          key +
          " - " +
          results[key].name +
          "</a> <br><br>";
  }
}

window.onload = function () {
    app = new Vue({
        el: "#app",
        data: {
            name: "",
            mod_list_all: {},
            tag_name: "",
            tag_modules: [],
            one_tag_result: {},
            mod_list_filtered: {},
            tag_count: 0
        },
        created() {
            let url = new URL(window.location.href);
            this.tag_name = url.searchParams.get("tag");
            console.log(this.tag_name);
            const vuethis = this;
            // Fetch name
            fetch("https://bt3103-alpha-student.firebaseio.com/profile.json")
                .then(response => {
                    return response.json();
                })
                .then(json => {
                    this.name = json.name;
                });

            // Fetch tags
            function getModList() {
              return fetch("https://bt3103-jasminw.firebaseio.com/tags.json")
                .then(response => {
                    return response.json();
                })
                .then(json => {
                    vuethis.one_tag_result = json[vuethis.tag_name]
                    vuethis.tag_count = vuethis.one_tag_result.count
                    vuethis.tag_modules = vuethis.one_tag_result.modules
                    console.log(vuethis.one_tag_result);
                  }
                );
            }
            // Fetch all module
            function getTagDict() {
              return fetch("https://api.nusmods.com/2018-2019/moduleList.json")
                .then(response => {
                    return response.json();
                })
                .then(json => {
                    for (let i = 0; i < json.length; i++) {
                        let code = json[i].ModuleCode;
                        let name = json[i].ModuleTitle;
                        let mod = { name: name, code: code };
                        vuethis.mod_list_all[code] = mod;
                    }

                });
            }

            function getTagDictModList() {
              return Promise.all([getTagDict(), getModList()]);
            }

            getTagDictModList()
              .then(([tagdict, modlist]) => {
                let temp_arr = vuethis.one_tag_result.modules;
                let temp_dict = {};
                for (let j=0; j<temp_arr.length; j++){
                  temp_dict[temp_arr[j]] = vuethis.mod_list_all[temp_arr[j]];
                }
                vuethis.mod_list_filtered = temp_dict;
                console.log(vuethis.mod_list_filtered);
                searchMod(vuethis.mod_list_filtered)
              })


        }
    });
}
