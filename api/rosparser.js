// Function for parsing the stdout from rosnode info nodename
function parseNodeInfo(data) {
  let parsed = { puplications: [], subscriptions: [], services: [], pid: 0 };
  data = data.toString().split("\n");
  cat = -1;
  for (let item of data) {
    if (item.includes("Pid:")) parsed.pid = parseInt(item.replace("Pid:", ""));
    else if (item.includes(":")) cat += 1;
    else if (item.includes("*")) {
      if (cat == 0) parsed.puplications.push(item.replace(" * ", ""));
      else if (cat == 1) parsed.subscriptions.push(item.replace(" * ", ""));
      else if (cat == 2) parsed.services.push(item.replace(" * ", ""));
    }
  }
  return parsed;
}

// Function for parsing the stdout from rostopic info topicname
function parseTopicInfo(data) {
  let parsed = { publishers: [], type: "", subscribers: [] };
  data = data.toString().split("\n");
  cat = -1;
  for (let item of data) {
    if (item.includes("Type: ")) parsed.type = item.replace("Type: ", "");
    else if (item.includes("ers:")) cat += 1;
    else if (item.includes("*")) {
      if (cat == 0) parsed.publishers.push(item.replace(" * ", ""));
      else if (cat == 1) parsed.subscribers.push(item.replace(" * ", ""));
    }
  }
  return parsed;
}

module.exports = {
  parseNodeInfo,
  parseTopicInfo
};
