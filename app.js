const bodyParser = require('body-parser')
const express = require('express')

const app = express()
const port = 2500

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

let items = ["Opiči wowa malo", "Idi na faks", "Spremi se za šetnju"];
let workItems = [];


app.get('/', function(req, res) 
{

    let currentDate = new Date();
    let options =
    {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    let day = currentDate.toLocaleDateString("sr-Latn-RS", options).toUpperCase();

    res.render("index",{listTitle: day, addItem:items});
});

app.get("/work", function(req,res)
{
    res.render("index",{listTitle: "Work List", addItem:workItems});
});

app.get("/about", function(req,res)
{
    res.render("about");
}

);



app.post("/", function(req,res)
{
    let workSpace = req.body.list;

    let itemForList = req.body.newItem;
    if(workSpace === "Work")
    {
        workItems.push(itemForList);
        res.redirect("/work");
    }
    else
    {
        items.push(itemForList);
        res.redirect("/");
    }

});

app.listen(port, function(req,res)
{
   console.log(`Server is running on port ${port}!`);
});