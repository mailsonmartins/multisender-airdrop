var express = require ('express');

const multisender = require('./multisender.js');

const app = express();

app.get('/', (req, res) => {
    var resposta = multisender.multisender();
    return res.send(resposta);
});

app.listen(3000, function() {
    console.log('Server rodando na porta 3000');
});
