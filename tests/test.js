const BootLoader = require("../src/libs/boot-loader");
const config = require('./config');
const redis = require('redis');
const redisClient = redis.createClient({ url: 'redis://0.0.0.0:6379' });
const bootLoader =  new BootLoader(config);

bootLoader.init()
  .then((res) => {
    
    setTimeout(() => {
      
      for (let i = 0; i< 100000; i++) {
        
        res[0].pushToQueue(' t - ' + i);
      }
    }, 3000)
  })
  .catch(err => console.log(err));

