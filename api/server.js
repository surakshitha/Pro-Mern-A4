require('dotenv').config();
const fs = require('fs');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

// Mongo DB setup
const { MongoClient } = require('mongodb');

const url = process.env.DB_URL || 'mongodb+srv://cs649mongouser:mongopwd@self-learn-cluster.df4am.mongodb.net/cs649-inventory-management?retryWrites=true';

let db;

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function productAdd(_, { product }) {
  const newProduct = Object.assign({}, product);
  newProduct.id = await getNextSequence('products');
  const result = await db.collection('products').insertOne(newProduct);
  const savedProduct = await db.collection('products').findOne({ _id: result.insertedId });
  return savedProduct;
}

async function productList() {
  const products = await db.collection('products').find({}).toArray();
  return products;
}

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

// Resolver definitions
const resolvers = {
  Query: {
    productList,
  },
  Mutation: {
    productAdd,
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync('schema.graphql', 'utf-8'),
  resolvers,
});

const app = express();
const port = process.env.API_SERVER_PORT || 4000;

server.applyMiddleware({ app, path: '/graphql' });

(async function start() {
  try {
    await connectToDb();
    app.listen(port, () => {
      console.log(`API server started on port ${port}`);
    });
  } catch (err) {
    console.log('ERROR: ', err);
  }
}());
