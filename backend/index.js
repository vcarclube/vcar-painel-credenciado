const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const http = require('http');

app.use(cors({
    origin: '*'
}));
 
app.use(bodyParser.json({limit: '700mb'}));
app.use(bodyParser.urlencoded({limit: '700mb', extended: true}));

const credenciadoRoute = require('./routes/credenciadoRoute');
const agendamentosRoute = require('./routes/agendamentosRoute');
const uploadRoute = require('./routes/uploadsRoute');
const pontoAtendimentoRoute = require('./routes/pontoAtendimentoRoute');
const avaliacoesRoute = require('./routes/avaliacoesRoute');
const scannerPlacaRoute = require('./routes/scannerPlacaRoute');
const retornoServicoRoute = require('./routes/retornoServicoRoute');
const espelhoRoute = require('./routes/espelhoRoute');
const servicosRoute = require('./routes/servicosRoute');

app.use('/credenciado', credenciadoRoute);
app.use('/agendamentos', agendamentosRoute);
app.use('/uploads', uploadRoute);
app.use('/ponto-atendimento', pontoAtendimentoRoute);
app.use('/avaliacoes', avaliacoesRoute);
app.use('/scanner', scannerPlacaRoute);
app.use('/retorno-servico', retornoServicoRoute);
app.use('/espelho', espelhoRoute);
app.use('/servico', servicosRoute);

if(process.env.DEVELOPMENT_MODE == "true"){
    var httpServer = http.createServer(app);
    httpServer.listen(process.env.PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${process.env.PORT} (modo desenvolvimento)`);
    });
}else{
    var httpServer = http.createServer(app);
    httpServer.listen(process.env.PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${process.env.PORT} (modo produção)`);
    });
}