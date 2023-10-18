

const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);  
 const cookieSession = require('cookie-session');

const PORT = process.env.PORT || 3000;
 
const cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');  
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
    name: 'aps_session',
    keys: ['aps_secure_key'],
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days, same as refresh token
}));


app.use(express.json({ limit: '50mb' }));
app.use('/aps', require('./routes/endpoints/oauth'));
app.use('/aps', require('./routes/endpoints/dm'));
app.use('/aps', require('./routes/endpoints/bc'));
app.use('/aps', require('./routes/endpoints/takeoff'));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode).json(err);
});

app.set('port', process.env.PORT || 3000);
 
server.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); });


String.prototype.format =function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function(m, i){
        return args[i];
    });
  };