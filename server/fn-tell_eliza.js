// This handler function is invoked each time the user sends a message.
// The "this" reference is to the same object that $session was called with.
var _ = require('lodash'),
    saveHistory = require('./save-history');

module.exports = function(userInput, cb) {
  // Trim user input to a reasonable maximum length.
  userInput = userInput.substr(0, 140);
  if (userInput.length < 2) {
    return cb(new Error('Please type something longer.'));
  }

  // Save user inputs to sandbox log.
  console.error(`User says: "${userInput}"`);

  // Save conversation to history, created in the $session handler.
  var history = this.$history;
  history.push({
    who: 'user',
    text: userInput,
    time: Date.now(),
  });

  // Pass the input to Elizabot and save its reply.
  var reply = this.eliza.transform(userInput);

  history.push({
    who: 'ELIZA',
    text: reply,
    time: Date.now(),
  });

  // Delete older messages in history.
  if (history.length > 100) {
    history.splice(0, history.length - 100);
  }

  // Wait for inputs to accumulate before triggering a write to KVDataStore
  // to store the update conversation history.
  saveHistory(
      this.svclib.KVDataStore, this.baseConnection.remoteAddress, history);

  // Return ElizaBot's reply to the client.
  return cb(null, reply);
};

