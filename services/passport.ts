import passport from 'passport';
import passportJwt, { StrategyOptions } from 'passport-jwt';
import OAuthStrategy from 'passport-google-oauth';
import FacebookStrategy from 'passport-facebook';

import { UserModel } from '../models/user';
import { secretString, googleClientId, googleClientSecret, facebookClientID, facebookClientSecret } from '../config';
import passportLocal, { IStrategyOptions } from 'passport-local';


const { Strategy, ExtractJwt } = passportJwt;
const { Strategy: LocalStrategy } = passportLocal;

//Setup options for jwt strategy
const jwtOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('auth'),
    secretOrKey: secretString
};

//Create Jwt strategy
const jwtLogin = new Strategy(jwtOptions, (payload: any, done: any) => {
    //payload is decoded jwt token
    
    UserModel.findById(payload.sub, (err, user) => {
        if(err) return done(err, false);

        if(user) {
            return done(null, user);
        }

        return done(null, false);
    });
});

const localOptions: IStrategyOptions = {
    usernameField: 'email',
}

const localLogin = new LocalStrategy(localOptions, (email: string, password: string, done: Function) => {
    UserModel.findOne({ email }, (err: any, user: any) => {
        if(err) return done(err, false);
        if(!user) return done(null, false);
        
        //compare password if username exists
        user.comparePassword(password, (err: any, isMatch: boolean) => {
            if(err) return done(err, false);
            if(!isMatch) return done(null, false);
            return done(null, user);
        });
    });
});

const googleLogin = new OAuthStrategy.OAuth2Strategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: "/auth/google/callback"
  },
  (accessToken: any, refreshToken: any, profile: any, done: any) => {
        const email = profile.emails[0].value;
        const { familyName: lastName, givenName: firstName } = profile.name;
        UserModel.findOne({ email }, (err: any, user: any) => {
            if(err) return done(err, false);
            if(!user) {
                UserModel.find().sort({ counter: -1 }).limit(1).then((element: any) => {
                    let counter = 0;
                    if(element.length > 0){
                        counter =  element[0].counter + 1; 
                    }
                    const userModel = new UserModel({
                        googleId: profile.id,
                        email,
                        firstName,
                        lastName,
                        counter
                    });

                    userModel.save((err: any) => {
                        if(err){
                            return done(err, false);
                        }
                        return done(null, userModel);
                    });
                });
            }
            else {
                user.firstName = firstName;
                user.lastName = lastName;
                user.googleId = profile.id;
                user.save((err: any) => {
                    return done(null, user);
                });
            }
        });
  }
);

const facebookLogin = new FacebookStrategy.Strategy({
    clientID: facebookClientID,
    clientSecret: facebookClientSecret,
    callbackURL: "/auth/facebook/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    UserModel.findOne({ facebookId: profile.id }, (err: any, user: any) => {
        if(err) return done(err, false);
        const { displayName, id: facebookId } = profile;

        if(!user) {
            UserModel.find().sort({ counter: -1 }).limit(1).then((element: any) => {
                let counter = 0;
                if(element.length > 0){
                    counter =  element[0].counter + 1; 
                }
                const userModel = new UserModel({
                    displayName,
                    facebookId,
                    counter
                });

                userModel.save((err: any) => {
                    if(err){
                        return done(err, false);
                    }
                    return done(null, userModel);
                });
            });
        }
        
        else {
            user.facebookId = facebookId;
            user.displayName = displayName;
            user.save((err: any) => {
                return done(null, user);
            });
        }
    });
});

passport.serializeUser(function(user: any, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

//Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
passport.use(googleLogin);
passport.use(facebookLogin);