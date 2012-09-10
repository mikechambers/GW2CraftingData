/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, fs, require, console */
var fs = require("fs");
var http = require("http");
var URL = require("url");

var craftingDisciplines = [
    "Armorsmith",
    //"Artificer",
    "Chef"
    //"Huntsman"
    //"Jeweler",
    //"Leatherworker",
    //"Tailor",
    //"Weaponsmith "
];

function parseData(data) {
    var tmp = data.substr(data.indexOf("{{Crafting/Item"));

    var itemBlobs = tmp.split("}}\n\n");
    var len = itemBlobs.length;
    
    var tmpItem;
    var name;
    var level;
    var i;
    var k;
    var ingredient;
    var amount;
    var recipes = [];
    var recipe;
    
    for (i = 0; i < len; i++) {
        tmpItem = itemBlobs[i].split("\n");
        
        recipe = {};
        
        recipe.name = tmpItem[1].split(" = ")[1];
        recipe.level = tmpItem[3].split(" = ")[1];
        recipe.ingredients = [];
        
        for (k = 4; k < tmpItem.length -  1; k++) {
            
            if (tmpItem[k].indexOf("|") < 0) {
                break;
            }
            
            ingredient = tmpItem[k].split(" = ")[1];
            amount = tmpItem[++k].split(" = ")[1];
            
            recipe.ingredients.push(
                {
                    "name" : ingredient,
                    "amount" : amount
                }
            );
            
        }
        recipes.push(recipe);
    }
    
    return recipes;
}

function readDataFromURL(dataURL, outputPath) {
    
    var url = URL.parse(dataURL);
    
    var options = {
        host : url.hostname,
        port : 80,
        path : url.path,
        method : "GET"
    };
    
    var bodyArr = [];
    
    var req = http.request(
        options,
        function (res) {
            res.on("data",
                function (chunk) {
                    bodyArr.push(chunk);
                });
            
            res.on("end",
                function () {
                    var data = bodyArr.join("");

                    var json = JSON.stringify(parseData(data));
                    
                    fs.writeFile(
                        outputPath,
                        json,
                        function (err) {
                            if (err) {
                                console.log(err);
                            }
                        }
                    );
                });
        }
    );
    
    req.on("error", function (e) {
        console.log(e.message);
    });
    
    req.write("\n");
    req.write("\n");
    req.end();
}

/*
function readDataFromFile(inputPath) {
    fs.readFile(
        inputPath,
        "utf8",
        function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            
            var json = JSON.stringify(parseData(data));
            
            fs.writeFile(
                outputPath,
                json,
                function (err) {
                    if (err) {
                        console.log(err);
                    }
                }
            );
        }
    );
}
*/

function main() {
    var disLen = craftingDisciplines.length;
    
    var url;
    var outputPath;
    var dis;
    var i;
    for (i = 0; i < disLen; i++) {
        dis = craftingDisciplines[i];
        url = "http://wiki.guildwars2.com/index.php?title=" + encodeURI(dis) + "&action=raw&section=3";
        outputPath = "../data/" + dis.toLowerCase() + ".json";
        
        console.log("Reading Data : " + dis);
        console.log(url);
        
        readDataFromURL(url, outputPath);
    }
}

main();

