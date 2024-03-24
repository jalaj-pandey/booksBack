const express = require('express')
const app = express()
const port = process.env.PORT || 5000 
const cors = require('cors');

app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// MongoDB Configuration

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://bookStore:bookswap12@cluster0.7gnrw4m.mongodb.net/?retryWrites=true&w=majority";

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
    // create a collection of documents
    const booksCollection = client.db("BookInventory").collection("books");
    const Checkout = client.db('BookInventory').collection("Checkout");

    //checkout req
    app.post('/api/checkout', async (req, res) => {
      try {
        const cheks =  req.body;
        const savedCheckout = await Checkout.insertOne(cheks);
        res.json(savedCheckout);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });



    // Insert a book to the database : post method
    app.post('/upload-book',  async(req,res) =>{
        const data = req.body;
        const result = await booksCollection.insertOne(data);
        res.send(result);
    } )

    // Get All Books From the database
    // app.get("/all-books", async (req,res) =>{
    //     const books = booksCollection.find();
    //     const result = await books.toArray();
    //     res.send(result);
    // })

    // Update a book data : patch or update 
    app.patch("/book/:id", async(req,res) =>{
        const id = req.params.id; 
        const updateBookData = req.body;
        const filter = {_id:new ObjectId(id)};
        const options = {upsert:true};
        const updateDoc = {
            $set:{
                ...updateBookData
            }
        }
        // update
        const result = await booksCollection.updateOne(filter,updateDoc,options);
        res.send(result);
    })

    // Delete a book data
    app.delete("/book/:id", async(req,res) =>{
        const id = req.params.id;
        const filter = {_id:new ObjectId(id)};
        const result = await booksCollection.deleteOne(filter);
        res.send(result);
    })

    // GET a book data

    app.get("/book/:id", async(req,res) =>{
        const id = req.params.id;
        const filter = {_id:new ObjectId(id)};
        const result = await booksCollection.findOne(filter);
        res.send(result);
    })

    // Find By category
    app.get("/all-books", async(req,res) =>{
        let query = {};
        if(req.query?.category){
            query = {category:req.query.category}
        }
        const result = await booksCollection.find(query).toArray();
        res.send(result);
    })

    app.get('/user-books/:id', async (req, res) => {
      let query = {};
        if(req.query?.sellerID){
            query = {sellerID:req.query.sellerID}
        }
        const result = await booksCollection.find(query).toArray();
        res.send(result);
    });

    app.get('/api/books/search/:bookTitle', async (req, res) => {
      try {
          const { bookTitle } = req.params;
          // Assuming 'booksCollection' is your MongoDB collection
          const books = await booksCollection.find({ bookTitle: { $regex: bookTitle, $options: 'i' } }).toArray();
          // The $regex operator performs a case-insensitive search for bookTitle within the 'title' field
          res.json(books);
      } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Server Error' });
      }
  });
  


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})