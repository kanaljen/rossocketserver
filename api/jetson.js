var os = require("os");
var totMem = os.totalmem();

function tx2Stats() {
  const memPercent = ((totMem - os.freemem()) / totMem).toFixed(2);
  const cpus = os.cpus();
  const addedTimes = { working: 0, idle: 0 };
  cpus.forEach(element => {
    addedTimes.working += element.times.user;
    addedTimes.working += element.times.nice;
    addedTimes.working += element.times.sys;
    addedTimes.idle += element.times.idle;
  });
  const totCPU = addedTimes.working + addedTimes.idle;
  const cpuPercent = (addedTimes.working / totCPU).toFixed(2);
  const values = {
    cpu: Math.round(cpuPercent * 100),
    mem: Math.round(memPercent * 100)
  };
  return values;
}

module.exports.tx2Stats = tx2Stats;
