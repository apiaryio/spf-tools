const child_process = require('child_process');

function callSpfTools(cb) {
  process.env.PATH = `${process.env.PATH}:${process.env.LAMBDA_TASK_ROOT}/scripts:${process.env.LAMBDA_TASK_ROOT}/bin`;
  var options = {
      env: process.env
  };

  var compare_command = `compare.sh ${process.env.DOMAIN} ${process.env.ORIG_SPF}`;
  console.log("Running", compare_command);

  child_process.exec(compare_command, options, (error, stdout, stderr) => {
    if (error) {
      // assuming the compare script failed due to the records not matching
      if (error.code == 1) {
        var update_command = `despf.sh ${process.env.ORIG_SPF} | normalize.sh | simplify.sh | mkblocks.sh ${process.env.DOMAIN} | DOMAIN=${process.env.DOMAIN} ORIG_SPF=${process.env.ORIG_SPF} DRY_RUN=${process.env.DRY_RUN} node ./scripts/plugins/akamai.js`;
        console.log("Running", update_command);
        child_process.exec(update_command, options, (error, stdout, stderr) => {
          return cb(error, stdout, stderr);
        });
      }
      else {
        return cb(error);
      }
      }
      // all is good and records don't have to be changed
      else {
        return cb(error, stdout, stderr);
      }
  });
}

function handler(event, context, cb) {
  if (!event.DOMAIN || !event.ORIG_SPF) {
    return cb("Event should contain DOMAIN and ORIG_SPF");
  }
  process.env.DOMAIN = event.DOMAIN;
  process.env.ORIG_SPF = event.ORIG_SPF;

  if (parseInt(event.DRY_RUN) == 1) {
    process.env.DRY_RUN = 1;
  }
  callSpfTools((error, stdout, stderr) => {
    console.log(stderr);
    console.log(stdout);
    if (error) {
      return cb("Failed with error " + error);
    }
    else {
      return cb(null, "All is good");
    }
  });
}

module.exports = {
  callSpfTools : callSpfTools,
  handler : handler
}
