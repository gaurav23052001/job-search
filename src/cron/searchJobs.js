const cron=require('node-cron');
const runAgent=require('../agent/runAgent');
cron.schedule('0 * * * *',runAgent);
runAgent();