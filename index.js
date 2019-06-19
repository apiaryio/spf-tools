const lambda = require('./lambda/functions/spf-update/index.js');
const config = require('./lambda/functions/spf-update/config.json')

let event = {};

const spfCheckEvent = process.env.SPF_CHECK_EVENT;
if (spfCheckEvent && config.SPF_CHECK_EVENT_TYPES[spfCheckEvent]) {
  event = config.SPF_CHECK_EVENT_TYPES[spfCheckEvent];
}

lambda.handler(event, {}, (err, msg) => {
  if (err) {
    console.error(err);
  } else {
    console.log('DONE:', msg);
  }
});
