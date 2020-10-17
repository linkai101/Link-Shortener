const express = require('express');
const router = express.Router();
const url = require('url');

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DB_URI;

router.post('/', async (req, res) => {
    let client;
    req.body.ending  = req.body.ending.trim();
    req.body.url  = req.body.url.trim();

    // URL validation
    if (!validURL(req.body.url)) {
        res.json({ error: "Invalid url" });
        return;
    }

    // Ending validation
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const linksDb = client.db("links");
        const endingsCol = linksDb.collection("endings");
        const ending = await endingsCol.findOne({ ending: req.body.ending }, {});
        if (ending && ending.url != req.body.url) {
            if (req.accepts('html')) {
                res.redirect(url.format({
                    pathname: "/",
                    query: { "msg": "ending_taken", "ending": req.body.ending }
                }));
            } else res.json({ "error": "Ending taken", "ending": req.body.ending });
            return;
        }
        if (ending && ending.url == req.body.url) {
            // Ending already exists with same url
            if (req.accepts('html')) {
                res.redirect(url.format({
                    pathname: "/",
                    query: { "msg": "link_already_exists", "ending": req.body.ending, "url": req.body.url }
                }));
            } else res.json({ "error": "Link already exists", "ending": req.body.ending, "url": req.body.url });
            return;
        }
    } catch(err) {
        res.json({ error: err });
    } finally {
        await client.close();
    }

    // Creating new link
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const linksDb = client.db("links");
        const endingsCol = linksDb.collection("endings");
        
        await endingsCol.insertOne({ ending: req.body.ending, url: req.body.url, creationDate: Date.now(), lastUse: Date.now() });
    } catch(err) {
        res.json({ error: err });
    } finally {
        await client.close();
    }
    if (req.accepts('html')) {
        res.redirect(url.format({
            pathname: "/",
            query: { "msg": "link_created", "ending": req.body.ending, "url": req.body.url }
        }));
    } else res.json({ "msg": "Link created", "ending": req.body.ending, "url": req.body.url });
    return;
});


module.exports = router;

function validURL(url) {
    return /^(https?):\/\/[^\s$.?#].[^\s]*$/.test(url);
}