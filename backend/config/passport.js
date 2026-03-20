const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// --- Google Strategy ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const role = req.query.state || 'customer';
        console.log('--- OAuth Debug ---');
        console.log('Provider: Google');
        console.log('State-derived Role:', role);
        console.log('Profile Email:', profile.emails[0].value);
        
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              role: role,
              isVerified: true
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
} else {
  console.log('Google OAuth not configured (missing or placeholder Client ID)');
}

// --- GitHub Strategy ---
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'your_github_client_id') {
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const role = req.query.state || 'customer';
        let user = await User.findOne({ githubId: profile.id });
        
        if (!user) {
          const email = profile.emails ? profile.emails[0].value : `${profile.username}@github.com`;
          user = await User.findOne({ email });
          
          if (user) {
            user.githubId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName || profile.username,
              email: email,
              githubId: profile.id,
              role: role,
              isVerified: true
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
} else {
  console.log('GitHub OAuth not configured (missing or placeholder Client ID)');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
