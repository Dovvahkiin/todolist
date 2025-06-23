const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 2500;

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// MONGOOSE

const connString = mongoose.connect("mongodb://localhost:27017/todolistDB");

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

const work = new Items(
    {
        name: "Go to work!"
    }
);

const work2 = new Items(
    {
        name: "Go to work again!"
    }
);

const work3 = new Items(
    {
        name: "Go to work one more time!"
    }
);

const defaultItems = [work,work2,work3];
/* 
 */

app.get('/', async function(req, res) 
{


    let currentDate = new Date();
    let options =
    {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    let day = currentDate.toLocaleDateString("sr-Latn-RS", options).toUpperCase();


    try
    {

        const dBitems = await Items.find({});

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


app.post("/", async function(req,res)
{

    let itemForList = req.body.newItem;

    try
    {
        const newItem = new Items({
            name: itemForList
        })
        newItem.save();
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
    const checkedItemDeletion = req.body.isChecked;

    try
    {
        await Items.findByIdAndDelete(checkedItemDeletion);
        console.log("Deleted an item with id: ",checkedItemDeletion);
        res.redirect("/");
    }
    catch(err)
    {
        console.log(err);
    }
    
})





app.listen(port, function(req,res)
{
   console.log(`Server is running on port ${port}!`);
});