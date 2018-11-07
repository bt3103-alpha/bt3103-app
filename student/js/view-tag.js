function searchTags() {
    let results = search(document.getElementById("tag_search").value);
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
