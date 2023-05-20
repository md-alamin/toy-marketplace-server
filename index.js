const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// app.options('*', cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gt8d3ye.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		// await client.connect();

		const toysCollection = client.db('marvelToys').collection('toysCollection');

		const indexKeys = { name: 1 };
		const indexOption = { name: 'SearchByName' };
		const result = toysCollection.createIndex(indexKeys, indexOption);

		// all toys
		app.get('/allToys', async (req, res) => {
			const cursor = await toysCollection.find().limit(20).toArray();
			res.send(cursor);
		});

		// search by name
		app.get('/allToys/search/:text', async (req, res) => {
			const search = req.params.text;
			console.log(search);
			const result = await toysCollection
				.find({ name: { $regex: search, $options: 'i' } })
				.toArray();
			res.send(result);
		});

		// subcategory
		app.get('/subcategory/avengers', async (req, res) => {
			const query = { sub_category: 'Avengers' };
			const cursor = await toysCollection.find(query).toArray();
			res.send(cursor);
		});
		app.get('/subcategory/guardians', async (req, res) => {
			const query = { sub_category: 'Guardians of the Galaxy' };
			const cursor = await toysCollection.find(query).toArray();
			res.send(cursor);
		});
		app.get('/subcategory/xmen', async (req, res) => {
			const query = { sub_category: 'X-Men' };
			const cursor = await toysCollection.find(query).toArray();
			res.send(cursor);
		});

		// add toys
		app.post('/addToy', async (req, res) => {
			const toy = req.body;
			const result = await toysCollection.insertOne(toy);
			res.send(result);
		});

		// find a toy to show details
		app.get('/toy/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await toysCollection.findOne(query);
			res.send(result);
		});

		// user
		app.get('/user/:email', async (req, res) => {
			const email = req.params.email;
			const query = { seller_email: email };
			console.log(email);
			const cursor = await toysCollection.find(query).toArray();
			res.send(cursor);
		});

		// sort by price
		app.get('/sort/:email', async (req, res) => {
			const email = req.params.email;
			const sort = req.query.sort;
			console.log(sort, email);
			const query = { seller_email: email };
			const cursor = await toysCollection
				.find(query)
				.sort({ price: sort })
				.collation({ locale: 'en_US', numericOrdering: true })
				.toArray();
			res.send(cursor);
		});

		// update toy
		app.put('/update/:id', async (req, res) => {
			const id = req.params.id;
			const body = req.body;
			const filter = { _id: new ObjectId(id) };
			const updateDoc = {
				$set: {
					price: body.price,
					quantity: body.quantity,
					description: body.description,
				},
			};
			const result = await toysCollection.updateOne(filter, updateDoc);
			res.send(result);
		});

		// delete toy
		app.delete('/delete/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await toysCollection.deleteOne(query);
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		// await client.db('admin').command({ ping: 1 });
		// console.log(
		// 	'Pinged your deployment. You successfully connected to MongoDB!'
		// );
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('Toy store is running');
});

app.listen(port, () => {
	console.log('Toy store is running on port number', port);
});
