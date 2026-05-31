const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

const run = async () =>{
    try {
    await client.connect();
    const db = client.db('sportnestA9');
    const facilityCollection = db.collection('facilities');
    
    app.get('/facility', async(req, res)=>{
       const result = await facilityCollection.find().toArray();
       res.send(result);
    })
    app.get('/facility/:id', async(req, res)=>{
       const id = req.params.id;
      const result = await facilityCollection.findOne({_id: new ObjectId(id)})
      res.send(result)
    })
    app.post('/facility', async(req, res)=>{
      const newData = req.body;
      const result = await facilityCollection.insertOne(newData)
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