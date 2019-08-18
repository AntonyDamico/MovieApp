var bodyParser = require("body-parser"),
methodOverride = require("method-override"),
       express = require("express"),
		   app = express(),
	  mongoose = require("mongoose"),
	   request = require("request");


mongoose.connect("mongodb://localhost:27017/Movie_App", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
var listSchema = new mongoose.Schema({
	title: String
});
var List = mongoose.model("List", listSchema);

// RESTFUL ROUTES

app.get("/", function(req, res){
	res.render("landing");
});



app.get("/search", function(req, res){
	var apiKey = "api_key=a25db5f3dd1c7773e519d5f7b85493fa";
	var query = req.query.search;
	var type = req.query.platform;
	var url = "https://api.themoviedb.org/3/search/" + type + "?" + apiKey + "&query=" + query;
	var urlTrending = "https://api.themoviedb.org/3/trending/movie/week?" + apiKey;
	// 	============================

	if (req.query.search == undefined) {
		request(urlTrending, function(error, response, body){
			if(!error && response.statusCode == 200) {
				var data = JSON.parse(body);
				List.find({}, function(err, lists){
					if(err) {
						console.log(err);
					} else {
						res.render("search", {data: data, lists: lists});
					}
				});
			}
		});
	} else {
		request(url, function(error, response, body){
			if(!error && response.statusCode == 200) {
				var data = JSON.parse(body);
				List.find({}, function(err, lists){
					if(err) {
						console.log(err);
					} else {
						res.render("search", {data: data, lists: lists});
					}
				});
			}
		});
	}
	
});

//POST ROUTE
app.post("/search", function(req, res){
	List.create(req.body.list, function(err, newList){
		if (err) {
			res.render("landing");
		} else {
			res.redirect("/search");
		}
	});
});

// SHOW ROUTE
app.get("/search/:id", function(req, res){
	List.findById(req.params.id, function(err, foundList){
		if(err){
			res.redirect("/");
		} else {
			res.render("search", {list:foundList});
		}
	});
});

//DELETE ROUTE
app.delete("/search/:id", function(req, res){
	List.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
		} else {
			res.redirect("/search");
		}
	});
});


app.listen(3000, process.env.IP, function(req, res){
	console.log("Film's Organizer has Started!");
});