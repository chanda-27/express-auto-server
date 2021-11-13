// Main (required)
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const { MongoClient, ObjectID } = require('mongodb');
require('dotenv').config()

// dotENV (required)
const { DB_NAME, DB_USERNAME, DB_PASS, CARCOL, RVWCOL, USERCOL, ORDCOL } = process.env;
const port = process.env.PORT || 3344;
console.log(DB_NAME, DB_USERNAME, DB_PASS, CARCOL, RVWCOL, USERCOL, ORDCOL);

// Middlewares
app.use(cors())
app.use(bodyParser.json())


const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASS}@cluster0.lq9rh.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  // Cars Collection
  const carsCollection = client.db(DB_NAME).collection(CARCOL);
  console.log("DB Connected on", port);

  // Add Car API
  app.post('/cars', (req, res) => {
    const newCar = req.body;
    console.log('adding new package', newCar);
    carsCollection.insertOne(newCar)
    .then(result => {
      console.log('inserted count:', result.insertedCount);
      res.send(result)
    })
  })

  // All Cars List API
  app.get('/cars', (req, res) => {
    carsCollection.find()
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  // Load Single Car
  app.get('/cars/:id', (req, res) => {
    console.log(req.params);
    const id = ObjectID(req.params.id);
    carsCollection.find({_id: id})
    .toArray((err, documents) => {
      res.send(documents[0]);
    })
  })

  // Delete Car
  app.delete('/cars/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    carsCollection.deleteOne({_id: id})
    .then(result => {
      res.send(result);
    })
  })

  // Order Collection
  const ordersCollection = client.db(DB_NAME).collection(ORDCOL);

  // Order Collections Setup
  app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    console.log(newOrder);
    ordersCollection.insertOne(newOrder)
    .then(result => {
      console.log('inserted count:', result);
      res.send(result)
    })
  })

  app.get('/orders', (req, res) => {
    console.log(req.query.email);
    ordersCollection.find({ownerEmail: req.query.email})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })
  
  app.get('/allOrders', (req, res) => {
    ordersCollection.find()
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  app.patch('/updateOrder/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    ordersCollection.updateOne(
      {_id: id},
      {
        $set: {status: req.body.status}
      }
    )
    .then(result => {
      res.send(result);
    })
  })

  app.delete('/deleteOrder/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    ordersCollection.deleteOne({_id: id})
    .then(result => {
      res.send(result);
    })
  })

  // Reviews Collection
  const reviewsCollection = client.db(DB_NAME).collection(RVWCOL);

  // Add Review API
  app.post('/reviews', (req, res) => {
    const review = req.body;
    console.log('adding new review', review);
    reviewsCollection.insertOne(review)
    .then(result => {
      console.log('inserted count:', result.insertedCount);
      res.send(result)
    })
  })

  // Add Review API
  app.get('/reviews', (req, res) => {
    reviewsCollection.find()
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  // Users Collection
  const usersCollection = client.db(DB_NAME).collection(USERCOL);

  // Add User API
  app.post('/users', (req, res) => {
    const user = req.body;
    console.log('adding new user', user);
    usersCollection.insertOne(user)
    .then(result => {
      console.log('inserted count:', result.insertedCount);
      res.send(result)
    })
  })

  // All Users List API
  app.get('/users/:email', async (req, res) => {
    const email = req.params.email;
    console.log(email);
    const query = { email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user.role === 'admin') isAdmin = true;
    console.log({isAdmin});
    res.json({isAdmin});
  })

  // All Users List API
  app.put('/users/admin', (req, res) => {
    const user = req.body;
    const filter = { email: user.email }
    const updateDoc = { $set: { role: 'admin' } }
    const result = usersCollection.updateOne(filter, updateDoc)
    result.then((result) => res.send(result))
  })

  // Root Path
  app.get('/', (req, res) => {
    res.send("Hello, Viewers! This URL from Heroku is available now!")
  })
});




app.listen(port)