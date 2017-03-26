/**
 * Created by ILYASANATE on 26/03/2017.
 */
const jwt=require('jsonwebtoken');

var data={
    id: 10
};
var token=jwt.sign(data,'123abc');
console.log("TOKEN",token);

var decoded=jwt.verify(token,'123abc');
console.log("Decoded: ",decoded);