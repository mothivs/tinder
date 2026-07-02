# Learning Goals

Background:
- 10+ years frontend engineer
- Learning backend through Namaste NodeJS
- Building Dev Tinder as primary learning project

Objectives:
- Strong Node.js fundamentals
- Database design
- API design
- Authentication
- Redis
- PostgreSQL
- Event-driven architecture
- Microservices
- System design

Priority:
1. Learn backend engineering deeply
2. Learn architecture patterns
3. Understand scaling concepts
4. Build production-like projects



//# Middleware
//#--------------------------------------/
/**
app.use("/",(req,res)=>{
  //^Route Handlers(RH)
})
**1 route can have muliple RHs
** app.use(ROUTE , RH1, RH2, RH3) 
 */

app.use("/user-role", (req, res, next) => {
  console.log("RH1");
  res.send("response back")
  next()
  //res.send("response back")
},
  (req, res, next) => {
    console.log("RH2");
    res.send("response back 2")
    next();
  },
)

app.use("/admin", adminAuth);
app.get("/admin", (req, res) => {
  try {
    throw new Error("There is something paranormal here")
    res.send("Gave all admin creds")
  }
  catch (err) {
    res.status(400).send("Bad Request!" + err)
  }
})

app.post("/admin", (req, res) => {
  res.send("Posted all admin creds")
})


@TODO
1. Finish pagination first - From Deepseek then next task.
2. schema methods
3. pre save functions
4. ref and populate