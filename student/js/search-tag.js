mod_codes = [];

fetch("https://bt3103-jasminw.firebaseio.com/tags.json")
    .then(response => {
        return response.json();
    })
    .then(json => {
        mod_codes = json;
      }
    );

    /**
     * Looks for tags in the firebase that matches the input text 
     * @param {string} param input text that was searched
     * @returns {list} list of tags that matches or contain the input text
     */
function searchtagjs(param) {
    let results = [];

    if (param.length == 0) {
        return results;
    }

    param = param.toLowerCase();

    for (tag in mod_codes) {
        if (tag.startsWith(param)) {
            if (!results.includes(tag)) {
                results.push(tag);
                if (results.length >= 10) {
                    return results;
                }
            }
        }
    }
    return results;
}
