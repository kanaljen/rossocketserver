// Setup socket and child process as globals
const io = require("socket.io"),
  server = io.listen(8000),
  { spawn } = require("child_process"),
  { parseNodeInfo, parseTopicInfo } = require("./api/rosparser"),
  RosNode = require("./api/rosnode"),
  node = new RosNode(),
  jetson = require("./api/jetson");
let unicornState = "Unknown";

// IIFE function for calling the braoadcast functions
(function() {
  setTimeout(broadcast, 250, "rosnode");
  setTimeout(broadcast, 250, "rostopic");
  setTimeout(statBroadcaster, 250);
  node.addSubscriber("/TX2_unicorn_state", "std_msgs/Int32", handleState);
})();

// Promised based function for calling rosnode/rostopic list, calls itself at the end
function broadcast(type) {
  return new Promise((resolve, reject) => {
    const child = spawn(type, ["list"]);
    child.stdout.on("data", data => resolve(data));
    child.stderr.on("data", data => reject(data));
  })
    .then(list => {
      json = [];
      list = list.toString().split(/(\r?\n)/g);
      for (const item of list) {
        if (item !== "\n" && item !== "") {
          if (!item.includes("/rostopic")) {
            json.push(item.replace("\n", ""));
          }
        }
      }
      server.emit(type, json);
    })
    .catch(e => {
      server.emit(type, null);
    })
    .finally(function() {
      setTimeout(broadcast, 1000, type);
    });
}

function statBroadcaster() {
  let values = jetson.tx2Stats();
  server.emit("stats", values);
  setTimeout(statBroadcaster, 1000);
}

// Event listner for the socket
server.on("connection", socket => {
  console.info(`webclient connected [id=${socket.id}]`);
  socket.on("disconnect", () => {
    console.info(`webclient disconnected [id=${socket.id}]`);
  });
  socket.on("nodeinfo", e => {
    rosInfo("rosnode", e);
  });
  socket.on("topicinfo", e => {
    rosInfo("rostopic", e);
  });
  socket.on("navigation", e => {
    node.publishJson("navigation", e);
  });
  socket.on("lidartext", e => {
    node.publishJson("lidartext", e);
  });
  socket.on("reqstate", e => {
    socket.emit("state", unicornState);
  });

  function rosInfo(type, item) {
    return new Promise((resolve, reject) => {
      const child = spawn(type, ["info", item]);
      child.stdout.on("data", data => resolve(data));
      child.stderr.on("data", data => reject(data));
    })
      .then(data => {
        if (type == "rosnode") {
          socket.emit(item, parseNodeInfo(data));
        } else if (type == "rostopic") {
          socket.emit(item, parseTopicInfo(data));
        }
      })
      .catch(data => {
        socket.emit(item, null);
      });
  }
});

// Subscriber callsbacks
function handleState(msg) {
  let state = "";
  switch (msg.data) {
    case 0:
      state = "Idle";
      break;
    case 1:
      state = "Navigating";
      break;
    case 2:
      state = "Lift";
      break;
    case 3:
      state = "Aligning";
      break;
    case 4:
      state = "Reversing";
      break;
    default:
      state = "Unknown";
  }
  server.emit("state", state);
  unicornState = state;
}
