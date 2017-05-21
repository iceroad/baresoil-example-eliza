// This handler function is always the first function that is called on each
// new client connection. As a result, it is a good place for loading data,
// authenticating the user, and doing other connection set-up work.
var _ = require('lodash'),
    ElizaBot = require('elizabot');

module.exports = function(sessionRequest, cb) {
  // Create an instance of ElizaBot.
  this.eliza = new ElizaBot();

  // Maintain a conversation history for each IP address.
  this.$history = [];

  // Get prior conversation history, indexed by IP address.
  var dbKeys = [{
    table: 'conversations',
    key: this.baseConnection.remoteAddress,
  }];
  return this.svclib.KVDataStore.get(dbKeys, function(err, kvPairs) {
    if (err) {
      console.error('KVDataStore.get() returned an error:', err);
      return cb();  // no error, allow client to connect
    }
    if (kvPairs[0].exists) {
      // Have a prior conversation, save it to $history.
      this.$history = _.isArray(kvPairs[0].value) ? kvPairs[0].value : [];
    }

    // This will show up in your application's logs.
    console.error(
        'Starting session with conversation:', this.$history);

    // Send a "user_event" event to the client with the conversation history.
    // See app.js for the client-side rendering component.
    this.sendEvent('conversation_history', this.$history);

    // The callback must be invoked in order to start the session.
    return cb();
  }.bind(this));
};
