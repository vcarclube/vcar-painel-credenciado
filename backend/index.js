const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const http = require('http');

app.use(cors({
    origin: '*'
}));
 
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const credenciadoRoute = require('./routes/credenciadoRoute');
const agendamentosRoute = require('./routes/agendamentosRoute');
const uploadRoute = require('./routes/uploadsRoute');
const pontoAtendimentoRoute = require('./routes/pontoAtendimentoRoute');
const avaliacoesRoute = require('./routes/avaliacoesRoute');
const scannerPlacaRoute = require('./routes/scannerPlacaRoute');

app.use('/credenciado', credenciadoRoute);
app.use('/agendamentos', agendamentosRoute);
app.use('/uploads', uploadRoute);
app.use('/ponto-atendimento', pontoAtendimentoRoute);
app.use('/avaliacoes', avaliacoesRoute);
app.use('/scanner', scannerPlacaRoute);

if(process.env.DEVELOPMENT_MODE == "true"){
    var httpServer = http.createServer(app);
    httpServer.listen(process.env.PORT);
}else{
    var httpServer = http.createServer(app);
    httpServer.listen(process.env.PORT);
}