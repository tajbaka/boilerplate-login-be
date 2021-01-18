import jwt from 'jwt-simple';

import { secretString } from '../config';
import { UserModel } from '../models/user';

const tokenForUser = (user: any) => {
    const iat = new Date().getTime();
    return jwt.encode({ sub: user._id, iat }, secretString);
}

export const home = (req: any, res: any, next: any) => {
    res.send('home');
}

export const signUp = (req: any, res: any, next: any) => {
    const body = req.body;
    const { email, password } = body;

    if(!email || !password) {
        res.status(422).send({ error: 'You must provide email and password' });
    }

    UserModel.findOne({ email }, (err, exisitingUser) => {
        if(err){
            return next(err);
        }

        if(exisitingUser){
            res.status(422).send({ error: 'Email in use' });
        }
        else {
            UserModel.find().sort({ counter: -1 }).limit(1).then((element: any) => {
                let counter = 0;
                if(element.length > 0){
                    counter =  element[0].counter + 1; 
                }
                const user = new UserModel({
                    email,
                    password,
                    counter
                });
        
                user.save((err) => {
                    if(err){
                        return next(err);
                    }
                    res.json({ token: tokenForUser(user) });
                });
            });
        }

        
    });
}

export const signIn = (req: any, res: any) => {
    const user = req.user;
    res.json({ token: tokenForUser(user) });
};

export const facebookSignIn = (req: any, res: any) => {
    const user = req.user;
    res.json({ token: tokenForUser(user) });
};

export const loginSuccess = (req: any, res: any) => {
    const user = req.user;
    if(user){
        res.json({ token: tokenForUser(user) });
    }
    else {
        res.status(422).send({ error: 'Unauthorized' });
    }
};

export const googleSignIn = (req: any, res: any) => {
    // console.log('here1');
}