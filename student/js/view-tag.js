/**
 * Looks for tag that was selected by user and links user to the view-tag page with the corresponding tag
 */
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

/**
 * Find the modules that have the corresponding tag, and links it to the corresponding view-module page
 */
function searchMod(results){
  let resultsDiv = document.getElementById("mod_search_results");
  resultsDiv.innerHTML = "";
  for (let key in results) {
      console.log(key);
      let url = '"view-module.html?name=' + key + '"';
      let row = "<tr style='cursor:pointer' onclick='DoNav(" + url + ");'>";
      row += "<td><a href='view-module.html?name=" + key + "'>" + key + "</a></td>";
      row += "<td><a href='view-module.html?name=" + key + "'>" + results[key].name + "</a></td>";
      row += '</tr>'
      resultsDiv.innerHTML += row;
  }
}

function DoNav(theUrl){
  console.log(theUrl);
 document.location.href = theUrl;
}

window.onload = function () {
    const db = firebase
        .initializeApp({
            databaseURL: "https://bt3103-jasminw.firebaseio.com"
        })
        .database();

    var tags_ref = db.ref("tags");
    app = new Vue({
        el: "#app",
        firebase: {
          tag_dict_db: {
              source: db.ref("tags"),
              asObject: true
          }
        },
        data: {
            name: "",
            mod_list_all: {},
            tag_name: "",
            tag_modules: [],
            one_tag_result: {},
            mod_list_filtered: {},
            tag_count: 0,
            tag_dict_vue: {},
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
            if (vuethis.tag_name != null) {

              // Fetch tags
              function getModList() {
                return fetch("/bt3103-app/backend/student/view-tag/" + vuethis.tag_name)
                  .then(response => {
                      return response.json()
                    })
                  .then(json => {
                      vuethis.one_tag_result = json
                      vuethis.tag_count = vuethis.one_tag_result.count
                      vuethis.tag_modules = vuethis.one_tag_result.modules
                      console.log(vuethis.one_tag_result);
                    });
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

              // allow both tag and module names to be complete fetch first
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
                  searchMod(vuethis.mod_list_filtered);
                  vuethis.increment(vuethis.tag_name, vuethis);
                })
            }
        },
        methods: {
            /**
             * Keep track of the number of times the tag was clicked in a local dictionary.
            */
          increment: function(tag_name, vuethis) {
            vuethis.tag_count++;
            tags_ref.child(tag_name).child('count').set(
              vuethis.tag_count
            )
            fetch('/bt3103-app/backend/student/view-tag/count/' + tag_name, {
              method: 'post',
              body: JSON.stringify({
                count: vuethis.tag_count
              }),
              headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
              }
            })
          }
        }
    });
}
