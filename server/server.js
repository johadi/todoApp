require('./config/config');
const express=require('express');
const bodyParser=require('body-parser');
const {ObjectID} =require('mongodb');
const _=require('lodash');


var {mongoose}=require('./db/mongoose');
var {User}=require('./models/user');
var {Todo}=require('./models/todo');
var port=process.env.PORT;

var app=express();
app.use(bodyParser.json());

app.post('/todos',(req,res)=>{
   console.log(req.body);
    //return res.json(req.body);
    var todo=new Todo({
        text: req.body.text
    });
    todo.save()
        .then(doc=>{
            res.send(doc);
        })
        .catch(err=>{
            res.status(400).send(err);
        })
});
app.get('/todos',(req,res)=>{
    Todo.find().then(todos=>{
        res.send({todos});
    }).catch(err=>res.status(400).send(err))
});
app.get('/todos/:id',(req,res)=>{
    var id=req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findById(id)
        .then((todo)=>{
            if(!todo){
                return res.status(404).send();
            }
            return res.status(200).send({todo});
        })
        .catch(err=>res.send(400).send(err));
});
app.delete('/todos/:id',(req,res)=>{
    var id=req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id)
        .then((todo)=>{
            if(!todo){
                return res.status(404).send();
            }
            return res.status(200).send({todo});
        })
        .catch(err=>res.status(400).send());
});
app.patch('/todos/:id',(req,res)=>{
    var id=req.params.id;
    var body=_.pick(req.body,['text','completed']);

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    if(_.isBoolean(body.completed)&& body.completed){
        body.completedAt=new Date().getTime();
    }else{
        body.completed=false;
        body.completedAt=null;
    }

    Todo.findByIdAndUpdate(id,{$set: body},{new: true})
        .then((todo)=>{
            if(!todo) return res.status(404).send();

            return res.status(200).send({todo});
        })
        .catch(err=>res.status(400).send());
});
app.post('/users',(req,res)=>{
    var body=_.pick(req.body,['email','password']);

    var user=new User(body);
    user.save()
        .then(()=>{
            return user.generateAuthToken();
        })
        .then(token=>{
            res.header('x-auth',token).send(user);
        })
        .catch(err=>res.status(400).send(err));
})
app.listen(port,(err)=>{
    if(err) return console.error(err);
    console.log('Server running on port '+port);
});

module.exports={app};