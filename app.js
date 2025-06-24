const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();
const port = 2500;

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// MONGOOSE

const connString = mongoose.connect(`mongodb+srv://admin-bogabet:same1700@cluster0.tdjwbiq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/todolistDB`);

// schema for items
const itemSchema = mongoose.Schema(
    {
        name:
        {
            required: true,
            type: String
        }
    }
)

// model for items
const Items = mongoose.model("item",itemSchema);

const listSchema = 
{
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("list",listSchema);

//making default items for new parameters
const work = new Items({
        name: "Welcome to my ToDoList!"
    }
);
const work2 = new Items({
        name: "Type down what you have to do and press +"
    }
);
const work3 = new Items({
        name: "<-- Click here and remove a item from the list"
    }
);

const defaultItems = [work,work2,work3];

let day = "TODAY"; // basic title

app.get('/', async function(req, res) 
{
    try
    {
        const dBitems = await Items.find({}); // getting items and storing into constant
        if(dBitems.length === 0) 
        {
            Items.insertMany(defaultItems);
            res.redirect("/");
        }
        else
        {
         res.render("index",{listTitle: day, addItem:dBitems});
        }
    }
    catch(err)
    {
        console.log(err)
    }
});


app.post("/", async function(req,res) // form for adding new items into our toDoList
{

    let itemForList = req.body.newItem; // input field
    const itemSubmit = req.body.list; // submit button which has value of listTitle 
    const newItem = new Items({
            name: itemForList
        })

    try
    {
        if(itemSubmit === day)
        {
             await newItem.save(); //saving item in our default (home) todoList
             res.redirect("/");
        }
        else
        {
            const tester = await List.findOne({name:itemSubmit}) //tester var becomes list object from database where the name is itemSubmit value which button name which value is title(and which xd, is name of the list)
            tester.items.push(newItem); // pushes items in the list from above (with newItem which is in ejs input for new items)
            await tester.save();
            res.redirect("/"+ itemSubmit);
        }
    }
    catch(err)
    {
        console.log(err);
    }
    finally
    {
         res.redirect("/");
    }
});


app.post("/delete", async function(req,res)
{
    const checkedItemDeletion = req.body.isChecked; // id of a selected item in todoList using checkbox
    const listNameChecker = req.body.listNameChecker; // listTitle which will be used to match desired array from Lists collection
    
    try
    {
        if(listNameChecker === day)
        {
             await Items.findByIdAndDelete(checkedItemDeletion);
             console.log("Deleted an item with id: ",checkedItemDeletion);
             res.redirect("/");
        }
        else
        {
            await List.findOneAndUpdate({name: listNameChecker},{$pull:{items:{_id:checkedItemDeletion}}});
            // findOneAndUpdate({whatDoWeWantToUpdate},{HowAreWeGonnaUpdateIt})
            // in second condition, we used $pull operator and we specified something that we want to pull from which is an items array
            // then we provided query for matching the item, we used id for match so _id of array have to be the same with item that we selected in our app (checkedItemDeletion).
            // The $pull oeprator removes an existing area with matched condition

            console.log("Deleted an item with id: ", checkedItemDeletion);
            res.redirect("/"+listNameChecker);
        }

    }
    catch(err)
    {
        console.log(err);
    }
})

app.get("/:parameter", async function(req,res)
{
    const paramName = _.capitalize(req.params.parameter); // using lodash we fixed routing, so whatever spelling we type for example HOMe, it will return Home capitalized.
    // because later paramName is used as listTitle and listTitle is used for rendering pages.

    try
    {
        const test = await List.findOne({name:paramName});
        if(!test)
        {
            console.log("There is no such List! I am creating a new one!");
            const list = new List({
                name: paramName,
                items: defaultItems
            })
            await list.save();
            res.render("index", { listTitle: paramName, addItem: list.items });
        }
        else
        {
            console.log("Match Founded. List exists.");
            res.render("index", { listTitle: paramName, addItem: test.items });
        }
    }
    catch(err)
    {
        console.log(err);
    }
})

app.listen(process.env.PORT || port, function(req,res)
{
    if(port === 2500)
    {
        console.log("Server is running on port "+ port);
    }
    else
    {
        console.log("Server is running on port "+ process.env.PORT);
    }
    
});