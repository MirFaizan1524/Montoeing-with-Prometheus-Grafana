const express = require("express");
const app = express();
const promClient = require('prom-client');
const responseTime = require("response-time"); 
let portNumber =  process.env.PORT_NUMBER || 4000;

const collectDefaultMetrics = promClient.collectDefaultMetrics;

   collectDefaultMetrics({register:promClient.register});  
// MiddleWares:
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Making Custom Metrics:
 const reqResTime = new promClient.Histogram({
      name: "http_request_response_time",
      help: "This tells  time taken by request and response",
      labelNames:["method","route","status_code"],
      buckets:[1,10,50,100,200,500,1000,2000,3000]
 });
 const totalRequestCounter = new promClient.Counter({
     name:"total_req",
     help:"Tells us total requests on a specific route"

 })
 app.use(responseTime((req,res,time)=>{
         totalRequestCounter.inc();
        reqResTime.labels({
             method:req.method,
             route:req.url,
             status_code:req.statusCode 
        }).observe(time);
 })) 

// possible Routes

app.get('/',(req,res)=>{
    res.send("Welcome To the homePage");
})

app.get('/metrics',async(req,res)=>{
     res.setHeader('Content-Type',promClient.register.contentType);
     const metrics = await promClient.register.metrics(); 
    //  console.log(metrics);
    res.send(metrics);
})


app.listen(portNumber,()=>{
    console.log(`Listening To the PortNumber ${portNumber}`);
})
