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


const listSchema = 
{
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("list",listSchema);
/* 
 */

let day = "TODAY";

app.get('/', async function(req, res) 
{


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
    const itemSubmit = req.body.list; // parameter

        const newItem = new Items({
            name: itemForList
        })
    try
    {
        if(itemSubmit === day)
        {
        await newItem.save();
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


app.get("/:parameter", async function(req,res)
{
    const paramName = req.params.parameter;

    try
    {
        const test = await List.findOne({name:paramName});
        if(!test)
        {
            console.log("WTF ARE YOU LOOKING FOR");
        const list = new List({
        name: paramName,
        items: defaultItems
          })
          await list.save();
    
        res.render("index", { listTitle: paramName, addItem: list.items });

        }
        else
        {
            console.log("HI THERE WE ARE");
            res.render("index", { listTitle: paramName, addItem: test.items });

        }
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