var env=process.env.NODE_ENV || 'development';

if(env==='development' || env==='test'){
    var config=require('./config.json');

    var config_enviroment_fields=config[env];
    //console.log(Object.keys(config_enviroment_fields));

    Object.keys(config_enviroment_fields).forEach((key)=>{
        process.env[key]=config_enviroment_fields[key];
    });
}