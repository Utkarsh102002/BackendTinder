const express = require("express");
const app = express();
app.listen(8000,()=>{
    console.log("Server is successfuly listening on port 8000");
});
app.use("/test",(req,res)=>{
    res.send("Hello from the Server")
})
app.use("/hello", (req, res) => {
  res.send("Hello hello baiyaa ji");
});