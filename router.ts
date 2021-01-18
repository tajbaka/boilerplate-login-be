import { home, signUp, signIn, facebookSignIn, loginSuccess, getUsers, googleSignIn } from './controllers';
import passport from 'passport';
import './services/passport';

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignIn = passport.authenticate('local', { session: false });
const googleAuth = passport.authenticate('google', {
    session: true,
    successRedirect: "http://localhost:3000/login/success",
});

const facebookAuth = passport.authenticate('facebook', { 
    session: true,
    successRedirect: "http://localhost:3000/login/success",
});

const routerFunction = (app: any) => {
    app.get('/', requireAuth, home);
    app.post('/signin',requireSignIn, signIn);
    app.post('/signup', signUp);

    app.get('/auth/google', passport.authenticate('google', { scope: ' https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'}), googleSignIn);
    app.get('/auth/google/callback', googleAuth);

    app.get('/auth/facebook', passport.authenticate('facebook'));
    app.get('/auth/facebook/callback', facebookAuth, facebookSignIn);
    
    app.get('/login/success', loginSuccess);
    app.get('/get-users', getUsers);
}; 

export default routerFunction;