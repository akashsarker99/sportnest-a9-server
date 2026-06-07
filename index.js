const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000

const uri = process.env.MONGODB_URI

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);

const verifyToken = async (req, res, next) =>{
  const authHeader = req?.headers.authorization
  if(!authHeader){
    return res.status(401).json({message: "Unauthorized"})
  }
  const token = authHeader.split(" ")[1]
    if(!token){
    return res.status(401).json({message: "Unauthorized"})
  }
   try {
    const {payload} = await jwtVerify(token, JWKS)
    next();
   } catch (error) {
      res.status(403).json({message: "Forbidden"})
   }
}

const run = async () =>{
    try {
    await client.connect();
    const db = client.db('sportnestA9');
    const facilityCollection = db.collection('facilities');
    const bookingCollection = db.collection('bookings');
    
    app.get('/facility', async(req, res)=>{
      const search = req.query.search || "";
      const sport = req.query.sport || "";
      const query = {};
      if (search) { 
        query.name = {$regex: search, $options: "i"};
      } 
      if (sport) {
        query.facility_type = { $in: [sport] };
      }
       const result = await facilityCollection.find(query).toArray();
       res.send(result);
    })
    app.get('/facility/:id', verifyToken, async(req, res)=>{
       const id = req.params.id;
      const result = await facilityCollection.findOne({_id: new ObjectId(id)})
      res.json(result)
    })
    app.post('/facility', verifyToken, async(req, res)=>{
      const newData = req.body;
      const result = await facilityCollection.insertOne(newData)
      res.json(result);
    })
    app.get('/my-facilities/:email', verifyToken, async(req, res)=>{
      const email = req.params.email;
      const result = await facilityCollection.find({owner_email: email}).toArray();
      res.json(result);
    })
    app.patch('/facility/:id', verifyToken, async(req, res)=>{
         const id = req.params.id;
         const updatedFacility = req.body;
         const result = await facilityCollection.updateOne(
          {_id: new ObjectId(id)},
          {$set: updatedFacility});
          res.json(result);
    })
    app.delete('/facility/:id' , verifyToken, async(req, res)=>{
      const id = req.params.id;
      const result = await facilityCollection.deleteOne({_id: new ObjectId(id)})
      res.json(result);
    })
    app.post('/booking', verifyToken, async(req, res)=>{
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);
      res.json(result);
    })
    app.get('/booking/:userid',verifyToken, async(req, res)=>{
      const userid = req.params.userid
      const result = await bookingCollection.find({userId: userid}).toArray();
      res.json(result);
    })
    app.delete('/booking/:id', verifyToken, async(req, res)=>{
      const id = req.params.id;
      const result = await bookingCollection.deleteOne({_id: new ObjectId(id)});
      res.json(result);
    })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send("Server is running")
})
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})