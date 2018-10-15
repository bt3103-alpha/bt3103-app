search_codes = {};
search_names = {};

fetch("https://api.nusmods.com/2018-2019/moduleList.json")
    .then(response => {
        return response.json();
    })
    .then(json => {
        for (let i = 0; i < json.length; i++) {
            let code = json[i].ModuleCode;
            let name = json[i].ModuleTitle;
            let mod = { name: name, code: code };
            search_codes[code.toLowerCase()] = mod;
            search_names[name.toLowerCase()] = mod;
        }
    });

function search(param) {
    let results = [];

    if (param.length == 0) {
        return results;
    }

    param = param.toLowerCase();

    for (code in search_codes) {
        if (code.startsWith(param)) {
            if (!results.includes(search_codes[code])) {
                results.push(search_codes[code]);
                if (results.length >= 10) {
                    return results;
                }
            }
        }
    }

    for (name in search_names) {
        if (name.startsWith(param)) {
            if (!results.includes(search_names[name])) {
                results.push(search_names[name]);
                if (results.length >= 10) {
                    return results;
                }
            }
        }
    }
    return results;
}
