var spf_update = require('./index.js');

process.env.LAMBDA_TASK_ROOT = ".";
process.env.DRY_RUN=1;
process.env.DOMAIN="apiary-staging.in";
process.env.ORIG_SPF="spf-orig.apiary-staging.in";
spf_update.callSpfTools((error, stdout, stderr) => {
  console.log('test error:', error);
  console.log('test stdout:', stdout);
  console.log('test stderr:', stderr);
  if (error) {
    throw(error);
  }
});
