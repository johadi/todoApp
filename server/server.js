require('./config/config');
const express=require('express');
const bodyParser=require('body-parser');
const {ObjectID} =require('mongodb');
const _=require('lodash');


var {mongoose}=require('./db/mongoose');
var {User}=require('./models/user');
var {Todo}=require('./models/todo');
var {authenticate}=require('./middlewares/authenticate');
var port=process.env.PORT;

var app=express();
app.use(bodyParser.json());

app.post('/todos',authenticate,(req,res)=>{
    var todo=new Todo({
        text: req.body.text,
        _creator: req.user._id
    });
    todo.save()
        .then(doc=>{
            res.send(doc);
        })
        .catch(err=>{
            res.status(400).send(err);
        })
});
app.get('/todos',authenticate,(req,res)=>{
    Todo.find({_creator: req.user._id}).then(todos=>{
        res.send({todos});
    }).catch(err=>res.status(400).send(err))
});
app.get('/todos/:id',authenticate,(req,res)=>{
    var id=req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findOne({_id: id,_creator: req.user._id})
        .then((todo)=>{
            if(!todo){
                return res.status(404).send();
            }
            return res.status(200).send({todo});
        })
        .catch(err=>res.send(400).send(err));
});
app.delete('/todos/:id',authenticate,(req,res)=>{
    var id=req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    })
        .then((todo)=>{
            if(!todo){
                return res.status(404).send();
            }
            return res.status(200).send({todo});
        })
        .catch(err=>res.status(400).send());
});
app.patch('/todos/:id',authenticate,(req,res)=>{
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

    Todo.findOneAndUpdate({_id: id,_creator: req.user._id},{$set: body},{new: true})
        .then((todo)=>{
            if(!todo) return res.status(404).send();

            return res.status(200).send({todo});
        })
        .catch(err=>res.status(400).send());
});
app.post('/users',(req,res)=>{
    var body=_.pick(req.body,['email','password']);

    //var user=new User(body);
    //user.save().then(user=>res.send(user)).catch(err=>res.send(err));

    var user=new User(body);
    user.save()
        .then(()=>{
            return user.generateAuthToken();
        })
        .then(token=>{
            res.header('x-auth',token).send(user);
        })
        .catch(err=>res.status(400).send(err));
});
app.get('/users/me',authenticate,(req,res)=>{
   if(req.user){
       return res.status(200).send(req.user);
   }
    return res.status(404).send();
});
app.get('/users/token',authenticate,(req,res)=>{
    if(req.token){
        return res.status(200).send(req.token);
    }
    return res.status(404).send();
});

app.post('/users/login',(req,res)=>{
    var body=_.pick(req.body,['email','password']);

    User.findByCredentials(body.email, body.password)
        .then(user=>{
            return user.generateAuthToken().then(token=>{
                return res.header('x-auth',token).send(user);
            });
        })
        .catch(err=>res.status(400).send(err));
});
app.delete('/users/me/token',authenticate,(req,res)=>{
    req.user.removeToken(req.token)
        .then(()=>res.status(200).send(),err=>{res.status(400).send(err)});
});
app.listen(port,(err)=>{
    if(err) return console.error(err);
    console.log('Server running on port '+port);
});

module.exports={app};