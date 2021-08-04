const JSONfilename = "AllTransferCoursesBySchool.json";
const JSONfilepath = "/ProjectRTP/"

let JSONfile = "";
let lastQuery = "";

function onClick(){
    if(JSONfile === ""){
        fetch(JSONfilepath+JSONfilename)
            .then(response => response.json())
            .then(data => {
                JSONfile = data;
                queryAndReplace();
            });
    } else {
        queryAndReplace();
    }
}

function queryAndReplace(){
    let query = document.getElementById("button-input").value;
    if(query !== lastQuery && query !== null && !(query.length===0)){
        removeAllChildNodes(document.getElementById("search-content"));
        modify_document(query);
        lastQuery = query;
    }
}

function modify_document(query){
    let result = queryJSON(query,'rpi_id');
    document.getElementById("search-count").innerText = "Found " + result.length + " matches for " + query + ".";
    for(let i = 0; i < result.length; i++) {
        let div = document.createElement("div");
        div.innerHTML = "<p>School: " + result[i][0] + ", " + result[i][2]
            + "<br>Transfer Class Title: " + result[i][1].other_school_title + "<br>Transfer Class ID: " + result[i][1].other_school_id
            + "<br>RPI Class: " + result[i][1].rpi_title + "<br>RPI Class ID: " + result[i][1].rpi_id
            + "<br>Credits at RPI: " + result[i][1].rpi_credits + "</p>";
        document.getElementById("search-content").appendChild(div);
    }
}

function queryJSON(query,query_type = 'rpi_id'){
    let matches = [];
    try {
        let content = JSONfile;
        console.log(query);
        for (let i = 0; i < content.schools.length; ++i) {
            for (let j = 0; j < content.schools[i].courses.length; ++j) {
                const course = content.schools[i].courses[j];
                const school = content.schools[i].name;
                const state = content.schools[i].state;

                let attribute = course.rpi_id;
                if(query_type === 'rpi_id'){
                    attribute = course.rpi_id;
                } else if(query_type === 'rpi_title'){
                    attribute = course.rpi_title;
                } else if(query_type === 'school'){
                    attribute = school;
                } else if(query_type === 'location'){
                    attribute = state;
                }

                if (attribute.toUpperCase().includes(query.toUpperCase())) {
                    //console.log("\n" + school + ":");
                    //console.log(course)
                    matches.push([school, course, state]);
                }
            }
        }
        console.log("\nMatches: " + matches.length);
    } catch (err) {
        console.log('Failed to search JSON file', err);
    }
    return matches;
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}