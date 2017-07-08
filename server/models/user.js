/**
 * Created by ILYASANATE on 24/03/2017.
 */
const mongoose=require('mongoose');
const validator=require('validator');
const jwt=require('jsonwebtoken');
const _=require('lodash');
const bcrypt=require('bcrypt-nodejs');

var UserSchema=new mongoose.Schema({
    email: {type: String,minlength: 1,required: true,trim: true,unique: true,
        validate: {
            validator: validator.isEmail,message: '{VALUE} is not a valid email'
        }
    },
    password: {type: String,required: true,minlength:6},
    tokens: [{
        access: {type: String,required: true},
        token: {type: String,required: true}
    }]
});

UserSchema.methods.toJSON=function(){
    var user=this;
    var userObject=user.toObject();
    return _.pick(userObject,['_id','email']);
}

//generate token and save it to db whenever User model instance calls this method. (mostly used by find method during login route and registration route)
UserSchema.methods.generateAuthToken=function(){
    var user=this;
    var access='auth';
    var token=jwt.sign({_id: user._id.toHexString(),access},process.env.JWT_SECRET).toString();

    user.tokens.push({access,token});

    return user.save()
        .then(()=>{
            return token;
        });
};
UserSchema.methods.removeToken=function(token){
    var user=this;

    return user.update({$pull: {tokens: {token: token}}}) //removes token({token,access}) value from arrays of objects of tokens
}

UserSchema.statics.findByToken=function(token){//to be used by the authentication middleware anytime someone wants to access protected routes
    var User=this;
    var decoded;
    try{
        decoded=jwt.verify(token,process.env.JWT_SECRET);
    }catch(e){
        return new Promise((resolve,reject)=>{
            reject('authorization failed');
        });
        //return Promise.reject();
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};
//used in the login route with generateAuthToken() instance method
UserSchema.statics.findByCredentials=function(email,password){
    var User=this;
    return User.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject();
        }
        return new Promise((resolve,reject)=>{
            bcrypt.compare(password,user.password,(err,res)=>{
                if(res){
                    resolve(user);
                }else{
                    reject();
                }
            });
        });
    });
};
UserSchema.pre('save',function(next){
    var user=this;
    if(!user.isModified("password")) return next();//go to next operation if password is not given a value
    bcrypt.genSalt(10,function(err,salt){
        if(err) return next(err);
        bcrypt.hash(user.password,salt,null,function(err,hash){ //hash the password and return it as hash in the function parameter
            if(err) return next(err);
            user.password=hash; //assigning the hash value to password again which is now ready to be saved into the database
            next();
        });
    });
});
var User=mongoose.model('User',UserSchema);
module.exports={User}