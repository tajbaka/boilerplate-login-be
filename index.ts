import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import router from './router';
import passport from 'passport';
import session from 'express-session';

//Database setup
mongoose.connect('mongodb+srv://test:1234@cluster0.syyx1.mongodb.net/boilerdb?retryWrites=true&w=majority')

//App Setup
const app = express();
app.use(morgan('combined')); //for logging incoming requests
app.use(bodyParser.json({ type: `*/*` })); //use to parse incoming requests into json
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({ credentials: true, origin: 'http://localhost:3000'}));
router(app);

//Server Setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('Server listening on port', port);

