// include dotenv package for reading and setting environment variables
require("dotenv").config();

// Import the inquirer npm package
var inquirer = require("inquirer");
// Import the axios npm package
var axios = require("axios");
// Import the node-spotify-api npm package
var Spotify = require('node-spotify-api');
// Import the api keys
var keys = require("./keys.js");
// Import the moment npm package
var moment = require("moment");
// Import the FS package for read/write
var fs = require("fs");

// Initialize spotify Api using the key
var spotify = new Spotify(keys.spotify);

// liribot object that contains liribot functions
var liribot = {
    // Function to search and get movie
    getMovie: function (movieName) {
        if (movieName == "") {
            movieName = "Mr.Nobody";
        }
        var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
        axios.get(queryUrl).then(
            function (response) {
                var movieData = response.data;

                var data = {
                    "Title ": movieData.Title,
                    "Year ": movieData.Year,
                    "Rated ": movieData.Rated,
                    "IMDB Rating ": movieData.imdbRating,
                    "Rotten Tomatoes Rating ": movieData.Ratings[1].Value,
                    "Country ": movieData.Country,
                    "Language ": movieData.Language,
                    "Plot ": movieData.Plot,
                    "Actors ": movieData.Actors
                };
                console.log(data);
                liribot.log(data);
            }
        ).catch(function (error) {
            console.log('Error. No result found for '+ movieName);
        });
    },

    // Function to help getting artist name
    getArtist: function (artist) {
        return artist.name;
    },

    // Function to search and get song
    getSpotify: function (songName) {
        if (songName == "") {
            songName = "The Sign";
        }
        spotify.search({ type: 'track', query: songName }, function (err, data) {
            if (err) {
                return console.log('Error : ' + err);
            }

            var songs = data.tracks.items;
            var data = [];
            for (var i in songs) {
                data.push({
                    "artist(s) ": songs[i].artists.map(liribot.getArtist),
                    "song name ": songs[i].name,
                    "preview song ": songs[i].preview_url,
                    "album ": songs[i].album.name,
                });
            }
            if (data.length) {
                console.log(data);
                liribot.log(data);
            } else {
                console.log('Error. No result found for ' + songName);
            }
        });
    },

    // Function to search and get song
    getConcert: function (artistName) {
        if (artistName == "") {
            console.log("please enter artist name!");
            return;
        } else {
            var queryUrl = "https://rest.bandsintown.com/artists/" + artistName + "/events?app_id=codingbootcamp";
            axios.get(queryUrl).then(
                function (response) {
                    var concertData = response.data;
                    if (!concertData.length) {
                        console.log("No concert data given yet for " + artistName);
                        return;
                    }

                    var data = [];
                    data.push("Upcoming concerts for " + artistName + ":");
                    for (var i in concertData) {
                        var concert = concertData[i];
                        data.push(
                            concert.venue.city +
                            "," +
                            (concert.venue.region || concert.venue.country) +
                            " at " +
                            concert.venue.name +
                            " " +
                            moment(concert.datetime).format("MM/DD/YYYY")
                        );
                    }
                    console.log(data);
                    liribot.log(data);
                }
            ).catch(function (error) {
                console.log("Error. No results found for " + artistName);
            });
        }
    },

    // Function to read from random.txt and run liribot using info given by that text
    doWhatItSays: function () {
        fs.readFile("random.txt", "utf8", function (error, data) {
            if (error) {
                return console.log(error);
            }
            
            var dataArr = data.split(",");
            if (dataArr.length == 2) {
                liribot.run(dataArr[0], dataArr[1]);
            } else if (dataArr.length == 1) {
                liribot.run(dataArr[0]);
            }
        });
    },

    // Function to log/append data searched into text file
    log: function (data) {
        fs.appendFile("log.txt", JSON.stringify(data) + "\n", function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Content Added!");
            }
        });
    },

    // Function to actually run liribot functions above
    run: function (command, info) {
        switch (command) {
            case ("movie-this"):
                liribot.getMovie(info);
                break;
            case ("spotify-this-song"):
                liribot.getSpotify(info);
                break;
            case ("concert-this"):
                liribot.getConcert(info);
                break;
            default:
                console.log("Sorry! I didn't get that");
        }
    }
}

var options;
// user object that contains prompt functions
var user = {
    // function to get command from the user and call to get Info
    userPrompt: function () {
        inquirer
            .prompt([
                {
                    type: "list",
                    name: "command",
                    message: "How can I help you?",
                    choices: ["movie-this", "spotify-this-song", "concert-this", "do-what-it-says"]
                }
            ]).then(function (inquirerResponse) {
                var command = inquirerResponse.command;
                switch (command) {
                    case ("movie-this"):
                        options = "movie";
                        user.getInfo(command);
                        break;
                    case ("spotify-this-song"):
                        options = "song";
                        user.getInfo(command);
                        break;
                    case ("concert-this"):
                        options = "artist";
                        user.getInfo(command);
                        break;
                    case ("do-what-it-says"):
                        liribot.doWhatItSays();
                        setTimeout(user.end, 5000);
                        break;
                }
            });
    },

    // Function to get info and actually call liribo.run function to run
    getInfo: function (command) {
        inquirer
            .prompt([{
                type: "input",
                name: "info",
                message: "Please enter " + options + " name!"
            }]).then(function (inquirerResponse) {
                var dataInfo = inquirerResponse.info;
                liribot.run(command, dataInfo);
                setTimeout(user.end, 3000);
            });
    },

    // Function to ask use if they want to command again
    end: function(){
        inquirer
        .prompt({
          name: "again",
          type: "confirm",
          message: "Would you like to command again??"
        })
        .then(function(answer) {
          if (answer.again === true) {
            user.userPrompt();
          } else {
            console.log("Come back again soon!");
          }
        });
    }
}

// Call userPrompt function from user object.. this starts the app!
user.userPrompt();


