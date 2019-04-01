const Pusher = require("pusher");

const {
  PUSHER_APP_ID,
  PUSHER_APP_KEY,
  PUSHER_APP_SECRET,
  PUSHER_APP_CLUSTER
} = process.env;

var pusher = new Pusher({
  appId: PUSHER_APP_ID,
  key: PUSHER_APP_KEY,
  secret: PUSHER_APP_SECRET,
  cluster: PUSHER_APP_CLUSTER,
  encrypted: true
});

module.exports = pusher;
