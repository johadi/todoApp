/**
 * Created by ILYASANATE on 26/03/2017.
 */
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');

var data={
    id: 10
};
var token=jwt.sign(data,'123abc');
console.log("TOKEN",token);

var decoded=jwt.verify(token,'123abc');
console.log("Decoded: ",decoded);

var password='123456';
var hashv;

bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(password,salt,(err,hash)=>{
        hashv=hash;
        console.log(`original psd: ${password}`);
        console.log(`hash psd: ${hashv}`);
        bcrypt.compare(password,hashv,(err,res)=>{
            console.log(res);
        })
    })
});