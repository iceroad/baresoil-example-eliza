var _ = require('lodash');

function TriggerHistorySave(KVDataStore, remoteAddress, history) {
  KVDataStore.set([{
    table: 'conversations',
    key: remoteAddress,
    value: history,
  }], function(err) {
    if (err) {
      console.error('Could not save conversation:', err);
    } else {
      console.error('Saved conversation history, lines:', history.length);
    }
  })
}

// A "debounced" function waits until user activity quiets down after a short
// bursty period before actually triggering the wrapped function. 2 seconds is
// chosen here as a reasonable value for human-machine interaction.
module.exports = _.debounce(TriggerHistorySave, 2000);    // 2000 ms = 2 seconds
