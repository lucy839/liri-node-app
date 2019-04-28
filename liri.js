require("dotenv").config();

var axios = require("axios");
var Spotify = require('node-spotify-api');
var keys = require("./keys.js");
var moment = require("moment");
var spotify = new Spotify(keys.spotify);

// movie this
function getMovie(movieName) {
    if (movieName == undefined) {
        movieName = "Mr.Nobody";
    }
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
    axios.get(queryUrl).then(
        function (response) {
            var movieData = response.data;

            console.log("Title: " + movieData.Title);
            console.log("Year: " + movieData.Year);
            console.log("Rated: " + movieData.Rated);
            console.log("IMDB Rating: " + movieData.imdbRating);
            console.log("Country: " + movieData.Country);
            console.log("Language: " + movieData.Language);
            console.log("Plot: " + movieData.Plot);
            console.log("Actors: " + movieData.Actors);
            console.log("#------------------------------------#");
        }
    );
}

// this spotify
function getArtist(artist) {
    return artist.name;
};

function getSpotify(songName) {
    if (songName === undefined) {
        songName = "The Sign";
    }
    spotify.search({ type: 'track', query: songName }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        var songs = data.tracks.items;
        console.log(data);
        for (var i in songs) {
            console.log(i);
            console.log("artist(s): " + songs[i].artists.map(getArtist));
            console.log("song name: " + songs[i].name);
            console.log("preview song: " + songs[i].preview_url);
            console.log("album: " + songs[i].album.name);
            console.log("#------------------------------------#");
        }
    });
}

function getConcert(artistName) {
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
            console.log("Upcoming concerts for " + artistName + ":");
            for (var i in concertData) {
                var concert = concertData[i];
                console.log("Venue Name : " + concert.venue.name);
                console.log("Venue Location : " +
                    concert.venue.city +
                    "," +
                    (concert.venue.region || concert.venue.country)
                );
                console.log("Time : " + moment(concert.datetime).format("MM/DD/YYYY"));
                console.log("#------------------------------------#");
            }
        }
    );

}
function run(command, data) {
    switch (command) {
        case ("movie-this"):
            getMovie(data);
            break;
        case ("spotify-this-song"):
            getSpotify(data);
            break;
        case ("concert-this"):
            getConcert(data);
            break;
        case "do-what-it-says":
            doWhatItSays();
            break;
        default:
            console.log("Sorry! I didn't get that");
    }
}

run(process.argv[2], process.argv.slice(3).join(" "));


