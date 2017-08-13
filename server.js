require('colors');

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const isDeveloping = process.env.NODE_ENV !== 'production';
const config = require(isDeveloping ? './build/webpack.dev.conf.js' : './build/webpack.prod.conf.js');

const port = isDeveloping ? 3000 : process.env.PORT;

const logger = require('morgan');

const app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
/*var options = { stream: {
    write: function (data) {
      console.log(data);
    }
  }
};
var iologger = require('socket.io-logger')(options);
io.use(iologger);*/

var dbconfig = require('./config/database');
var User = require("./models/user");
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

mongoose.connect(dbconfig.database, {
  useMongoClient: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.use(logger('dev'));

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

io.on('connection', function(socket) {
  console.log("user connected");

  // OK
  socket.on('reg', function(obj) {
    if (!obj.username || !obj.password) {
      socket.emit("reg", {
        success: false,
        msg: "Username and password are needed!"
      });
    } else {
      var newUser = new User({
        username: obj.username,
        password: obj.password
      });
      newUser.save(function(err) {
        if (err) {
          socket.emit("reg", {
            success: false,
            msg: 'Username already exists.'
          });
        } else {
          socket.emit("reg", {
            success: true,
            msg: 'Successful created new user.'
          });
        }
      });
    }
  });

  // OK
  socket.on('lin', function(obj) {
    if (!obj.username || !obj.password) {
      socket.emit("lin", {
        success: false,
        msg: "Authentication failed. Username and password are needed."
      });
    } else {
      User.findOne({
        username: obj.username
      }, function(err, user) {
        if (err) throw err;

        if (!user) {
          socket.emit("lin", {
            success: false,
            msg: 'Authentication failed. User not found.'
          });
        } else {
          // check if password matches
          user.comparePassword(obj.password, function(err, isMatch) {
            if (isMatch && !err) {
              // if user is found and password is right create a token
              var token = jwt.sign({ username: user.username }, dbconfig.secret, {
                expiresIn: 60 * 60
              });
              // return the information including token as JSON
              socket.emit("lin", {
                success: true,
                jwt: token,
                msg: 'Authentication success!'
              });
            } else {
              socket.emit("lin", {
                success: false,
                msg: 'Authentication failed. Wrong password.'
              });
            }
          });
        }
      });
    }
  });

  // OK
  setInterval(function() {
    socket.removeAllListeners("auth");
    socket.emit("auth", {
      jwtreq: true
    });
    socket.once("auth", function(obj) {
      if (obj.jwt) {
        jwt.verify(obj.jwt, dbconfig.secret, function(err, decoded) {
          if (err) {
            /*
              err = {
                name: 'TokenExpiredError',
                message: 'jwt expired',
                expiredAt: 1408621000
              }
            */
            socket.emit("data", {
              success: false,
              msg: "JWT expired."
            });
          } else {
            User.findOne({
              id: decoded.id
            }, function(err, user) {
              if (err) {
                //return done(err, false);
                socket.emit("data", {
                  success: false,
                  msg: "Database error."
                });
              } else {
                if (user) {
                  //done(null, user);
                  socket.emit("data", {
                    success: true,
                    date: Date()
                  });
                } else {
                  //done(null, false);
                  socket.emit("data", {
                    success: false,
                    msg: "User not found."
                  });
                }
              }
            });
          }
        });
      }
    });
  }, 5000);

  // OK
  socket.on('data', function(obj) {
    if (obj.jwt) {
      jwt.verify(obj.jwt, dbconfig.secret, function(err, decoded) {
        if (err) {
          /*
            err = {
              name: 'TokenExpiredError',
              message: 'jwt expired',
              expiredAt: 1408621000
            }
          */
          socket.emit("data", {
            success: false,
            msg: "JWT expired."
          });
        } else {
          User.findOne({
            username: decoded.username
          }, function(err, user) {
            if (err) {
              //return done(err, false);
              socket.emit("data", {
                success: false,
                msg: "Database error."
              });
            } else {
              if (user) {
                //done(null, user);
                console.log('message from ' + user.username + ': ' + obj.msg);
                socket.emit("data", {
                  success: true
                });
              } else {
                //done(null, false);
                socket.emit("data", {
                  success: false,
                  msg: "User not found."
                });
              }
            }
          });
        }
      });
    } else {
      socket.emit("data", {
        success: false,
        msg: "JWT expired."
      });
    }
  });

  socket.on('changePassword', function(obj) {
    if (obj.jwt) {
      jwt.verify(obj.jwt, dbconfig.secret, function(err, decoded) {
        if (err) {
          /*
            err = {
              name: 'TokenExpiredError',
              message: 'jwt expired',
              expiredAt: 1408621000
            }
          */
          socket.emit("changePassword", {
            success: false,
            msg: "JWT expired."
          });
        } else {
          User.findOne({
            username: decoded.username
          }, function(err, user) {
            if (err) {
              //return done(err, false);
              socket.emit("changePassword", {
                success: false,
                msg: "Database error."
              });
            } else {
              if (user) {
                //done(null, user);
                user.comparePassword(obj.oldPassword, function(err, isMatch) {
                  if (isMatch && !err) {
                    user.password = obj.newPassword;
                    user.save((err) => {
                      if (err) {
                        socket.emit("changePassword", {
                          success: false,
                          msg: "Database error."
                        });
                      } else {
                        socket.emit("changePassword", {
                          success: true
                        });
                      }
                    })
                  } else {
                    socket.emit("changePassword", {
                      success: false,
                      msg: 'Wrong old password.'
                    });
                  }
                });
              } else {
                //done(null, false);
                socket.emit("changePassword", {
                  success: false,
                  msg: "User not found."
                });
              }
            }
          });
        }
      });
    } else {
      socket.emit("changePassword", {
        success: false,
        msg: "JWT expired."
      });
    }
  });

  socket.on('userInfo', function(obj) {
    if (obj.jwt) {
      jwt.verify(obj.jwt, dbconfig.secret, function(err, decoded) {
        if (err) {
          /*
            err = {
              name: 'TokenExpiredError',
              message: 'jwt expired',
              expiredAt: 1408621000
            }
          */
          socket.emit("userInfo", {
            success: false,
            msg: "JWT expired."
          });
        } else {
          User.findOne({
            username: decoded.username
          }, function(err, user) {
            if (err) {
              //return done(err, false);
              socket.emit("userInfo", {
                success: false,
                msg: "Database error."
              });
            } else {
              if (user) {
                //done(null, user);
                socket.emit("userInfo", {
                  success: true,
                  info: {
                    login: user.username
                  }
                });
              } else {
                //done(null, false);
                socket.emit("userInfo", {
                  success: false,
                  msg: "User not found."
                });
              }
            }
          });
        }
      });
    } else {
      socket.emit("data", {
        success: false,
        msg: "JWT expired."
      });
    }
  });

  socket.once('disconnect', function() {
    console.log('user disconnected');
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

/*app.listen(port, function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up h1ttp://127.0.0.1:%s/ in your browser.', port, port);
});*/

/*app.listen(port, function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://127.0.0.1:%s/ in your browser.', port, port);
});*/
