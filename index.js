const express = require("express");
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bgffskc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    const brands = client.db('tech-hunt').collection('brands');
    const productCollection = client.db('tech-hunt').collection('productCollection');
    const userCollection = client.db('tech-hunt').collection('userCollection');
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    app.get('/brands', async (req, res) => {
      const cursor = brands.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/products/:name', async (req, res) => {
      const name = req.params.name;
      const query = { brand: `${name.charAt(0).toUpperCase()}${name.slice(1, name.length)}` }
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.findOne(query);
      res.send(result);
    });
    app.get('/users/:uid', async(req, res) => {
      const id = req.params.uid;
      const query = {uid: id}
      const result = await userCollection.findOne(query);
      res.send(result);
    })
    app.patch('/users/:uid', async(req, res) => {
      const uid = req.params.uid;
      const query = {uid : uid}
      const newItem = req.body;
      const updatedItem = {
        $addToSet : {
          "items" : {name: newItem.name, brand: newItem.brand, photo: newItem.photo, price: newItem.price, quantity: newItem.quantity}
        }
      }
      const result = await userCollection.updateOne(query, updatedItem);
      res.send(result);
    })

    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
    app.post('/users', async(req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send("You are now in the home directory of the tech-hunt server!");
})

app.listen(port, () => {
  console.log(`Server is running at the port: ${port}`);
})