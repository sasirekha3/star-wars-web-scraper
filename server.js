const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const fs = require('fs')
const app = express()
const port = 9999

const movieMap = {
    "episode1": {
        "name": "The Phantom Menace",
        "year": "1999",
        "characters": {
            "QUI-GON": "Qui-Gon Jinn",
            "OBI-WAN": "Obi-Wan Kenobi",
            "THREEPIO": "C-3PO",
            "AMIDALA": "Padmé Amidala",
            "ANAKIN": "Anakin Skywalker",
            "PALPATINE": "Palpatine",
            "DARTH SIDIOUS": "Darth Sidious",
            "SHMI": "Shmi Skywalker",
            "JAR JAR": "Jar Jar Binks",
            "MACE WINDU": "Mace Windu",
            "DARTH MAUL": "Darth Maul",
            "NUTE": "Nute Gunray",
            "YODA": "Yoda"
        },
        "sequence": "1",
        "url": "https://www.imsdb.com/scripts/Star-Wars-The-Phantom-Menace.html"
    },
    "episode2": {
        "name": "Attack of the Clones",
        "year": "2002",
        "characters": {
            "OBI-WAN": "Obi-Wan Kenobi",
            "THREEPIO": "C-3PO",
            "PADMÉ": "Padmé Amidala",
            "AMIDALA": "Padmé Amidala",
            "ANAKIN": "Anakin Skywalker",
            "PALPATINE": "Palpatine",
            "DARTH SIDIOUS": "Darth Sidious",
            "COUNT DOOKU": "Count Dooku / Darth Tyranus",
            "JANGO FETT": "Jango Fett",
            "BOBA FETT": " Boba Fett",
            "SHMI": "Shmi Skywalker",
            "JAR JAR": "Jar Jar Binks",
            "MACE WINDU": "Mace Windu",
            "NUTE": "Nute Gunray",
            "NUTE GUNRAY": "Nute Gunray",
            "YODA": "Yoda"
        },
        "sequence": "2",
        "url": "https://www.imsdb.com/scripts/Star-Wars-Attack-of-the-Clones.html"
    },
    "episode3": {
        "name": "Revenge of the Sith",
        "year": "2005",
        "characters": {
            "OBI-WAN": "Obi-Wan Kenobi",
            "THREEPIO": "C-3PO",
            "PADME": "Padmé Amidala",
            "AMIDALA": "Padmé Amidala",
            "ANAKIN": "Anakin Skywalker",
            "PALPATINE": "Palpatine",
            "DARTH SIDIOUS": "Darth Sidious",
            "COUNT DOOKU": "Count Dooku / Darth Tyranus",
            "JANGO FETT": "Jango Fett",
            "BOBA FETT": " Boba Fett",
            "JAR JAR": "Jar Jar Binks",
            "MACE WINDU": "Mace Windu",
            "MACE": "Mace Windu",
            "NUTE": "Nute Gunray",
            "NUTE GUNRAY": "Nute Gunray",
            "YODA": "Yoda"
        },
        "sequence": "3",
        "url": "https://www.imsdb.com/scripts/Star-Wars-Revenge-of-the-Sith.html"
    },
    "episode4": {
        "name": "A New Hope",
        "year": "1977",
        "characters": {
            "LUKE": "Luke Skywalker",
            "HAN": "Han Solo",
            "BEN": "Obi-Wan (Ben) Kenobi",
            "BEN'S VOICE": "Ben Kenobi's Voice",
            "THREEPIO": "C-3PO",
            "VADER": "Darth Vader",
            "LEIA": "Leia Organa",
            "TARKIN": "Grand Moff Tarkin",
            "JABBA": "Jabba The Hutt"
        },
        "sequence": "4",
        "url": "https://www.imsdb.com/scripts/Star-Wars-A-New-Hope.html"
    },
    "episode5": {
        "name": "The Empire Strikes Back",
        "year": "1980",
        "characters": {
            "LUKE": "Luke Skywalker",
            "HAN": "Han Solo",
            "BEN": "Obi-Wan (Ben) Kenobi",
            "THREEPIO": "C-3PO",
            "VADER": "Darth Vader",
            "LEIA": "Leia Organa",
            "LANDO": "Lando Calrissian",
            "RIEEKAN": "General Rieekan",
            "BOBA FETT": "Boba Fett",
            "PIETT": "Admiral Piett",
            "YODA": "Yoda"
        },
        "sequence": "5",
        "url": "https://www.imsdb.com/scripts/Star-Wars-The-Empire-Strikes-Back.html"
    },
    "episode6": {
        "name": "Return of the Jedi",
        "year": "1983",
        "characters": {
            "LUKE": "Luke Skywalker",
            "HAN": "Han Solo",
            "BEN": "Obi-Wan (Ben) Kenobi",
            "THREEPIO": "C-3PO",
            "VADER": "Darth Vader",
            "LEIA": "Leia Organa",
            "LANDO": "Lando Calrissian",
            "JERJERROD": "Moff Jerjerrod",
            "BOBA FETT": "Boba Fett",
            "PIETT": "Admiral Piett",
            "YODA": "Yoda"
        },
        "sequence": "6",
        "url": "https://www.imsdb.com/scripts/Star-Wars-Return-of-the-Jedi.html"
    }
}

function getDialogs(episode) {
    return axios({
        method: 'GET',
        url: movieMap[episode].url
    });
}

async function storeDialogs(episode) {
    let getDialogsResult = await getDialogs(episode);
    if (getDialogsResult.hasOwnProperty("data")) {
        // if (err) return console.error(err);
        let body = getDialogsResult.data;

        let $ = cheerio.load(body); // use cheerio to load the HTML page received in the response into $
        
        // for episodes 2, 4, 5, 6
        if ((episode == "episode2") || (episode == "episode4") || (episode == "episode5") || (episode == "episode6")) {
            let pre = $('.scrtext').find("pre");
            let subheading = "", sceneTitle = "", characterFlag = 0, character = "";
            $(pre)
                .contents().each(function () { // for each content element of the pre tag
                    let content = $(this).text().trim();
                    if (this.nodeType === 1 && (content.includes("INT") || content.includes("EXT"))) { // check if the element is a scene title
                        sceneTitle = content;
                    } else if (this.nodeType === 1) { // check if the element is a subheading 
                        subheading = content;
                        characterFlag = 1;
                    } else if (this.nodeType === 3) { //check if the element is the dialog itself
                        if (movieMap[episode].characters.hasOwnProperty(subheading) && characterFlag === 1) { // if the subheading above this dialog belongs to our list of characters above, then store the dialog
                            character = subheading;
                            let onlyQuote = content.includes("\n\n") ? content.split("\n\n")[0] : content; // ignore description that is not part of dialog

                            // if a dialog is displayed in multiple lines, then concatenate each line to make 1 string
                            let parts = onlyQuote.split("\n");
                            let quote = "";
                            for (index in parts) {
                                quote = quote + " " + parts[index].trim();
                            }

                            characterFlag = 0; //reset the characterFlag

                            var record = {};
                            record["movie"] = movieMap[episode]["name"];
                            record["year"] = movieMap[episode]["year"];
                            record["sequence"] = movieMap[episode]["sequence"];
                            record["prequelOrSequel"] = movieMap[episode]["prequelOrSequel"];
                            // AMIDALA and NUTE have multiple represenations in the manuscript, convert it into one for each.
                            record["character"] = character == "PADMÉ" ? "AMIDALA" : ((character == "NUTE GUNRAY") ? "NUTE" : character); //
                            record["sceneTitle"] = sceneTitle;
                            record["quote"] = quote.trim();
                            fs.appendFileSync("StarWars_sequels_v1.json", JSON.stringify(record) + ",");
                        }
                    }
                });
        } else if (episode == "episode1") {
            let pre = $('.scrtext').find("pre");
            let sceneTitle = "", characterFlag = 0, character = "";
            $(pre)
                .contents().each(function () { // for each content element of the pre tag
                    let content = $(this).text();
                    if (this.nodeType === 1 && (content.includes("INT") || content.includes("EXT"))) { // check if the element is a scene title
                        sceneTitle = content;
                    } else if (this.nodeType === 3) { // if the element is not a scene title, it is either a dialog or description
                        let quote = "";
                        let dialogArray = content.split("\n"); // collect everything under a scene into an array
                        dialogArray.forEach(function (e, i, a) { 
                            let testCharacter = dialogArray[i].split(":")[0];
                            testCharacter = testCharacter.trim();
                            if (movieMap[episode].characters.hasOwnProperty(testCharacter)) { // if the character is a valid character
                                character = testCharacter;
                                characterFlag = 1;

                                // store all the dialog next to the character's name in that line
                                let testDialog = dialogArray[i].split(":")[1];
                                quote = quote + testDialog.trim();

                            } else if (dialogArray[i] != '' && !dialogArray[i].includes(":") && characterFlag == 1) { // if it is continuation of a dialog concantenate it
                                quote = quote + " " + dialogArray[i]; 
                            } else if (characterFlag == 1) { // if the dialog has ended, store the dialog
                                characterFlag = 0;
                                var record = {};
                                record["movie"] = movieMap[episode]["name"];
                                record["year"] = movieMap[episode]["year"];
                                record["sequence"] = movieMap[episode]["sequence"];
                                record["character"] = character;
                                record["sceneTitle"] = sceneTitle.replace(/[\n]/g, "");
                                record["quote"] = quote.trim();
                                fs.appendFileSync("StarWars_sequels_v1.json", JSON.stringify(record) + ",");
                            }
                        })

                    }
                });
        } else if (episode == "episode3") {
            let pre = $('.scrtext');
            let sceneTitle = "", character = "";
            $(pre)
                .contents().each(function () { // for each content element of the .scrtext class
                    let content = $(this).text();
                    if (this.nodeType === 1 && (content.includes("INT") || content.includes("EXT"))) { // check if the element is a scene title
                        sceneTitle = content;
                    } else if (this.nodeType === 3) { // if the element is not a scene title, it is either a dialog or description
                        let quote = "";
                        let dialogArray = content.split("\n"); // collect everything under a scene into an array
                        dialogArray.forEach(function (e, i, a) {
                            let testCharacter = dialogArray[i].split(":")[0];
                            testCharacter = testCharacter.trim();
                            if (movieMap[episode].characters.hasOwnProperty(testCharacter)) { // if the character is a valid character
                                character = testCharacter;

                                // store all the dialog next to the character's name in that line
                                let testDialog = dialogArray[i].split(":")[1];
                                quote = quote + testDialog.trim();
                                
                                var record = {};
                                record["movie"] = movieMap[episode]["name"];
                                record["year"] = movieMap[episode]["year"];
                                record["sequence"] = movieMap[episode]["sequence"];
                                // AMIDALA and MACE WINDU have multiple represenations in the manuscript, convert it into one for each.
                                record["character"] = character == "PADME" ? "AMIDALA" : ((character == "MACE") ? "MACE WINDU" : character);
                                record["sceneTitle"] = sceneTitle.replace(/[\n]/g, "");
                                record["quote"] = quote.trim();
                                fs.appendFileSync("StarWars_sequels_v1.json", JSON.stringify(record) + ",");
                            }

                        })

                    }
                });
        }
    } else {
        console.log("No dialogs found for " + episode);
    }
    console.log(episode + " done!");
}


app.get('/getDialogs', (req, res) => {
    fs.appendFileSync("StarWars_sequels_v1.json", "[");
    let movieSequences = [1, 2, 3, 4, 5, 6];

    // Iterate through each movie's dialogs and store them into a json file
    for (var i in movieSequences) {
        let episode = "episode" + movieSequences[i];
        storeDialogs(episode);
    }
    
    res.send("Web crawler has started! Check node console for done state.");
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))