const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const messages = require('../messages')

router.get('/', (req, res) => {
    res.render('index', { randomEnding: shortid.generate(), message: getMessage(req.query) })
});

module.exports = router;

function getMessage(query) {
    if (!query.msg) return undefined;
    let message = { content: messages[query.msg].content, type: messages[query.msg].type }
    message.content = message.content.split('{ending}').join(query.ending);
    message.content = message.content.split('{url}').join(query.url);
    return message;
}