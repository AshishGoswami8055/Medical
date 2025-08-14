const admin = require('../models/admin.model');
const chemist = require('../models/chemist.model');
const passport = require('passport');
const MR = require('../models/MR.model');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// Passport Strategy for JWT

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
     passReqToCallback: true,
}

passport.use(new JwtStrategy(opts, async function (req, payload, done) {
    try {
        let adminData = await admin.findById(payload.id);
        if (adminData) {
            req.adminUser = adminData; // Attach admin data to request
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

passport.use("chemist-jwt", new JwtStrategy(opts, async function (req, payload, done) {
    try {
        const chemistData = await chemist.findById(payload.id)
        if (chemistData) {
            req.chemistUser = chemistData; // Attach chemist data to request
            return done(null, chemistData)
        } else {
            return done(null, false)
        }
    } catch (err) {
        return done(err, false)
    }
}));

passport.use("mr-jwt", new JwtStrategy(opts, async function (req,payload, done) {
    try {
        const mrData = await MR.findById(payload.id)
        if (mrData) {
            req.mrUser = mrData; // Attach MR data to request
            return done(null, mrData)
        } else {
            return done(null, false)
        }
    } catch (err) {
        return done(err, false)
    }
}));

module.exports = passport;