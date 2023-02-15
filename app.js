const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

let workItems=[];

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://bittersweet:Yoloyo*252@cluster0.ggwn3lv.mongodb.net/todolistDB",{useNewUrlParser: true});
const itemsSchema = {
    name : String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name:"Welcome to your Todo List!"
});

const item2 = new Item({
    name:"Hit the + button to add an item"
});

const item3 = new Item({
    name:"<-- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const day = date();

app.get("/", function(req,res){

    Item.find({}, function(err, foundItems){
        if( foundItems.length === 0 ) {
           Item.insertMany(defaultItems, function(err){
            if (err){
                console.log(err);
            }
            else {
                console.log("Inserted successfully!")
            }
            });
            res.redirect("/"); 
        } 
        else {
            res.render("List",{
                listTitle: day,
                newListItems: foundItems
            });
        }
    });
});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    //console.log(itemName);
    if(listName === day){
        item.save(function(){
            res.redirect("/");
        });
    } else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.Checkbox;
    const listName = req.body.listName;

    if(listName === day){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("succesfully deleted an item");
                res.redirect("/");
            }
        });
    } else {
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.pull({ _id: checkedItemId }); 
            foundList.save(function(){
 
                res.redirect("/" + listName);
            });
          });
    } 
});

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName}, function(err,foundList){
        if(!err){
            if(!foundList){
                //create a new list
                const list = new List ({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else{
                //show an existing list
                res.render("list",{
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    });
});

app.post("/work", function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.get("/about", function(req,res){
    res.render("about");
});

app.listen(3000,function(){
    console.log("Server is up on port 3000");
});
