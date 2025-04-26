const admin = require('../models/admin.model');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// Passport Strategy for JWT

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

passport.use(new JwtStrategy(opts, async function (payload, done) {
    try {
        let adminData = await admin.findById(payload.id);
        if (adminData) {
            done(null, adminData);
        }
        else {
            done(null, false);
        }
    } catch (error) {
        console.error(error);
        done(error, false);
    }
}));

module.export = passport;