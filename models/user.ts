import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
const MongoPaging = require('mongo-cursor-pagination');

const Schema = mongoose.Schema;

//Define model
const UserSchema = new Schema({
    counter: {
        type: Number,
        required: true
    },
    email: {
        type: String, 
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    displayName: {
        type: String,
        index: true, 
        sparse: true,
        unique: false
    },
    facebookId: {
        type: String,
        index: true, 
        sparse: true,
        unique: false
    },
    googleId: {
        type: String,
        index: true, 
        sparse: true,
        unique: false
    }
});

// On Save Hook, encrpyt password
UserSchema.pre('save', function (next){
    const user: any = this;

    //generate a salt then call the next callback
    if(user.password){
        bcrypt.genSalt(10, (err, salt) => {
            if(err) {
                return next(err);
            }

            //encrypt password
            if(user.password)
            bcrypt.hash(user.password, salt, null, (err, hash) => {
                if(err) return next(err);
                user.password = hash; // password = salt + hashed password
                next();
            })
        });
    }
    else {
        next();
    }
});

UserSchema.methods.comparePassword = function(candidatePassword: string, callback: Function) {
    bcrypt.compare(candidatePassword, this.password, (err: any, isMatch: Boolean) => {
        if(err) return callback(err);
        callback(null, isMatch);
    });
};

UserSchema.plugin(MongoPaging.mongoosePlugin, { name: 'paginateFN' });

//Export the model
export const UserModel = mongoose.model('user', UserSchema);
