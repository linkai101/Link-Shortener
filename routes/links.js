const express = require('express');
const router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DB_URI;

router.get('/:ending', async (req, res) => {
    let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const linksDb = client.db("links");
        const endingsCol = linksDb.collection("endings");
        const ending = await endingsCol.findOne({ ending: req.params.ending }, {});

        if (ending) {
            res.redirect(ending.url);
        } else {
            res.status(404);
            res.type('txt').send('404: Not found');
        }
        await endingsCol.updateOne({ ending: ending.ending }, { $set: { lastUse: Date.now() } });

        return;
    } catch(err) {
        res.json({ error: err });
    } finally {
        await client.close();
    }
});

module.exports = router;