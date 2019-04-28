require("dotenv").config();

var inquirer = require("inquirer");
var axios = require("axios");
var Spotify = require('node-spotify-api');
var keys = require("./keys.js");
var moment = require("moment");
var spotify = new Spotify(keys.spotify);
var fs = require("fs");

var userCommand = process.argv[2];
var dataInfo = process.argv.slice(3).join(" ");

var liribot = {
    prompt: function () {
        inquirer
            .prompt([
                {
                    type: "list",
                    name: "command",
                    message: "How can I help you?",
                    choices: ["movie-this", "spotify-this-song", "concert-this", "do-what-it-says", "quit"]
                }, {
                    type: "input",
                    name: "name",
                    message: "Who are you???"
                }
            ]);
    },
    getMovie: function (movieName) {
        if (movieName == undefined) {
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
        );
    },

    getArtist: function (artist) {
        return artist.name;
    },

    getSpotify: function (songName) {
        if (songName === undefined) {
            songName = "The Sign";
        }
        spotify.search({ type: 'track', query: songName }, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
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
            console.log(data);
            liribot.log(data);
        });
    },

    getConcert: function (artistName) {
        if (artistName == undefined) {
            console.log("please enter artist name!");
        }
        var queryUrl = "https://rest.bandsintown.com/artists/" + artistName + "/events?app_id=codingbootcamp";
        axios.get(queryUrl).then(
            function (response) {
                var concertData = response.data;
                if (!concertData.length) {
                    console.log("No results found for " + artistName);
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
        );
    },

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

    log: function (data) {
        fs.appendFile("log.txt", JSON.stringify(data) + "\n", function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Content Added!");
            }
        });
    },

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
            case ("do-what-it-says"):
                liribot.doWhatItSays();
                break;
            default:
                console.log("Sorry! I didn't get that");
        }
    }
}

liribot.run(userCommand, dataInfo);


