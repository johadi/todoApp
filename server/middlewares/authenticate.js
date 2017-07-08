const {User}=require('./../models/user');

var authenticate=(req,res,next)=>{
    var token=req.header('x-auth');
    User.findByToken(token)
        .then((user)=>{
            if(!user) return Promise.reject('user not found');
            req.user=user;
            req.token=token;
            next();
        })
        .catch(err=>res.status(401).send(err));
};

var authenticate2=(req,res,next)=>{
  var token=req.body.token;
  User.findByToken(token)
      .then((user)=>{
        if(!user) return Promise.reject('user not found');
        req.user=user;
        req.token=token;
        next();
      })
      .catch(err=>res.status(401).send(err));
};

module.exports={authenticate};
