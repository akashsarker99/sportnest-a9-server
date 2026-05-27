const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());
dotenv.config();
const port = process.env.PORT

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