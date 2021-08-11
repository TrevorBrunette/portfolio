const JSONfilename = "AllTransferCoursesBySchool.json";
const versionFilename = "json-version";
const filepath = "/ProjectRTP/";

let JSONfile = JSON.parse(localStorage.getItem("jsonData"));
let localVersion = localStorage.getItem("jsonVersion");
let webVersion = "";

onLoad();

function onLoad() {
    fetchVersion();
}

function onClick() {
    queryAndReplace();
}

function checkVersion() {
    if(localVersion === null || webVersion === ""){
        console.log("Version not cached. Caching version.");
        if(webVersion === ""){
            console.log("Bye af");
        } else if(webVersion === localVersion) {
            console.log("Found webVersion equal to localVersion: " + webVersion);
        } else {
            console.log("Found webVersion: " + webVersion + " where localVersion: " + localVersion + ". Updating...");
            localVersion = webVersion;
            fetchJSON();
        }
    } else if(JSONfile === null){
        console.log("JSON file not present. Fetching new JSON.");
        fetchJSON();
    } else {
        console.log("Version file and JSON file found.");
        if(webVersion === localVersion) {
            console.log("Found webVersion equal to localVersion: " + webVersion);
        } else {
            console.log("Found webVersion: " + webVersion + " where localVersion: " + localVersion + ". Updating...");
            localVersion = webVersion;
            fetchJSON();
        }
    }
}

function fetchVersion() {
    fetch(filepath+versionFilename)
        .then(version => {
            version.text().then((result_text) => {
                webVersion = result_text;
                console.log("Found localVersion: " + localVersion);
                console.log("Found webVersion: " + webVersion);
                window.localStorage.setItem("jsonVersion", webVersion);
                checkVersion();
            });

        }).catch((reason) => {
        console.log("Failed to get version: " + reason);
    });
}

function fetchJSON() {
    fetch(filepath+JSONfilename)
        .then(response => response.json())
        .then(data => {
            console.log("We got JSON");
            JSONfile = data;
            window.localStorage.setItem("jsonData", JSON.stringify(JSONfile));
        }).catch((reason) => {
        console.log("Failed to get JSON: " + reason);
    });
}

function queryAndReplace() {
    let query = ["", "", ""];
    let empty = true;
    let doQuery = false;
    query[0] = document.getElementById("rpi_title_id-input").value;
    query[1] = document.getElementById("school-input").value;
    query[2] = document.getElementById("location-input").value;
    for(let i = 0; i < 3; ++i){
        if(query[i].length!==0){
            empty = false;
        }
        if(query[i] !== null && !empty){
            doQuery = true;
        }
    }
    if(doQuery){
        removeAllChildNodes(document.getElementById("search-content"));
        modify_document(query);
    }
}

function modify_document(query) {
    let result = sortBy(queryJSON(query), document.getElementById("sort").value);
    let searchText = "";
    for(let i = 0; i < 3; ++i){
        if(query[i].length!==0){
            if(searchText.length!==0){
                searchText += ", ";
            }
            searchText += query[i];

        }
    }

    document.getElementById("search-count").innerText = "Found " + result.length + " matches for query: " + searchText;
    for(let i = 0; i < result.length; i++) {
        let div = document.createElement("div");
        div.innerHTML = "<p>School: " + result[i].school + ", " + result[i].loc
            + "<br>Transfer Class Title: " + result[i].other_school_title + "<br>Transfer Class ID: " + result[i].other_school_id
            + "<br>RPI Class: " + result[i].rpi_title + "<br>RPI Class ID: " + result[i].rpi_id
            + "<br>Credits at RPI: " + result[i].rpi_credits + "</p>";
        document.getElementById("search-content").appendChild(div);
    }
}

function queryJSON(query) {
    let matches = [];
    try {
        let content = JSONfile;
        //console.log(query);
        for (let i = 0; i < content.schools.length; ++i) {
            for (let j = 0; j < content.schools[i].courses.length; ++j) {
                const course = content.schools[i].courses[j];
                course.school = content.schools[i].name;
                course.loc = content.schools[i].state;

                let courseChecked = queryCourse(course, query[0].toUpperCase(), query[1].toUpperCase(), query[2].toUpperCase());
                if(courseChecked !== null){
                    matches.push(course);
                }

            }
        }
        //console.log("Matches: " + matches.length);
    } catch (err) {
        console.log('Failed to search JSON file', err);
    }
    return matches;
}

function queryCourse(course, query_rpi_title_id, query_school, query_location){
    let rpi_id = course.rpi_id.toUpperCase();
    let rpi_name = course.rpi_title.toUpperCase();
    let course_school = course.school.toUpperCase();
    let course_state = course.loc.toUpperCase();

    if(((query_rpi_title_id.length===0 || rpi_id.includes(query_rpi_title_id)) || (query_rpi_title_id.length===0 || rpi_name.includes(query_rpi_title_id))) &&
        (query_school.length===0 || course_school.includes(query_school)) && (query_location.length===0 || course_state.includes(query_location))){
        return course;
    }
    return null;
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function sortBy(courses, by) {
    if(by === "class_name"){
        return courses.sort(function(a,b){
            return a.rpi_title > b.rpi_title ? 1 : (a.rpi_title < b.rpi_title ? -1 : 0);
        });
    } else if(by === "class_id"){
        return courses.sort(function(a,b){
            return a.rpi_id > b.rpi_id ? 1 : (a.rpi_id < b.rpi_id ? -1 : 0);
        });
    } else if(by === "location"){
        return courses.sort(function(a,b){
            return a.loc > b.loc ? 1 : (a.loc < b.loc ? -1 : 0);
        });
    } else { // if by school (default)
          return courses;
    }
}