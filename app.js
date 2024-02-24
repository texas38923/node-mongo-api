const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');

//init app and middleware:
const app = express();
app.use(express.json()); //middleware to use req.body

//db connection:
let db;

connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log('app is listening on port 3000');
    });
    db = getDb();
  }
});

//routes:
app.get('/books', (req, res) => {
  let books = [];

  db.collection('bookstore')
    .find() //cursor toArray , forEach --> works in batches of a particular size to avoid MLE
    .sort({ author: 1 })
    .forEach((book) => books.push(book)) //async, promise returned
    .then(() => {
      res.status(200).json(books);
    })
    .catch(() => {
      res.status(500).json({ error: 'could not fetch the document' });
    });
});

//finding a single document:
app.get('/books/:id', (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection('bookstore')
      .findOne({ _id: new ObjectId(req.params.id) }) //ObjectId must be 12bytes or 24hex characters to be a valid BSON type;
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json({ error: 'could not fetch the document' });
      });
  } else {
    res.status(500).json({ error: 'not a valid doc id' });
  }
});

//postman -> used to simulate api commands / backup testing;

app.post('/books', (req, res) => {
  const book = req.body;

  db.collection('bookstore')
    .insertOne(book)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: 'could not create new doc' });
    });
});

app.delete('/books/:id', (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection('bookstore')
      .deleteOne({ _id: new ObjectId(req.params.id) }) //ObjectId must be 12bytes or 24hex characters to be a valid BSON type;
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: 'could not delete the doc' });
      });
  } else {
    res.status(500).json({ error: 'not a valid doc id' });
  }
});

//to update:
app.patch('/books/:id', (req, res) => {
  const updates = req.body;

  if (ObjectId.isValid(req.params.id)) {
    db.collection('bookstore')
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates }) //ObjectId must be 12bytes or 24hex characters to be a valid BSON type;
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: 'could not update the doc' });
      });
  } else {
    res.status(500).json({ error: 'not a valid doc id' });
  }
});
