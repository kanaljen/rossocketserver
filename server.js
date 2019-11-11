// Setup socket and child process as globals
const
  io = require('socket.io'),
  server = io.listen(8000),
  { spawn } = require('child_process'),
  { parseNodeInfo, parseTopicInfo } = require('./api/rosparser'),
  RosNode = require('./api/rosnode'),
  node = new RosNode();

// node.addSubscriber('/commands', 'std_msgs/String', callback1);
// node.publishJson({type:'setState',payload:'idle'});


// IIFE function for calling the braoadcast functions
(function() {
  setTimeout(broadcast,250,'rosnode')
  setTimeout(broadcast,250,'rostopic')
})()

// Promised based function for calling rosnode/rostopic list, calls itself at the end
function broadcast(type) {
  return new Promise((resolve, reject) => {
    const child = spawn(type,['list'])
    child.stdout.on('data', (data) => resolve(data))
    child.stderr.on('data', (data) => reject(data))
  }).then((list) => {
    json = []
    list = list.toString().split(/(\r?\n)/g)
    for (const item of list) {
      if (item !== '\n' && item !== '') {
        json.push(item.replace('\n',''))
      }
    }
    server.emit(type, json)
  }).catch((e) => {
    server.emit(type, null)
  }).finally(function() { setTimeout(broadcast,1000,type) })
}

// Event listner for the socket
server.on("connection", (socket) => {
  console.info(`webclient connected [id=${socket.id}]`)
  socket.on("disconnect", () => {
    console.info(`webclient disconnected [id=${socket.id}]`)
  })
  socket.on('nodeinfo', (e) => {
    rosInfo('rosnode',e)
  })
  socket.on('topicinfo', (e) => {
    rosInfo('rostopic',e)
  })
  socket.on('navigation', (e) => {
    node.publishJson('navigation',e)
  })
  socket.on('lidartext', (e) => {
    node.publishJson('lidartext',e)
  })

  function rosInfo(type,item) {
    return new Promise((resolve, reject) => {
      const child = spawn(type,['info',item])
      child.stdout.on('data', (data) => resolve(data))
      child.stderr.on('data', (data) => reject(data))
    }).then((data) => {
      if(type == 'rosnode'){
        socket.emit(item, parseNodeInfo(data))
      }
      else if (type == 'rostopic'){
        socket.emit(item, parseTopicInfo(data))
      }
    }).catch((data) => {
      socket.emit(item, null)
    })
  }
})

/*
function tx2_mem() {
  return new Promise((resolve, reject) => {
    const child = spawn('cat',['/proc/meminfo'])
    child.stdout.on('data', (data) => resolve(data))
    child.stderr.on('data', (data) => reject(data))
  }).then((data) => { 
    let memory = []
    memory.push(parseInt(data.toString().replace(/ +(?= )/g,'').split('\n')[0].split(' ')[1]))
    memory.push(parseInt(data.toString().replace(/ +(?= )/g,'').split('\n')[1].split(' ')[1]))
    memory.push(memory[0]-memory[1])
    console.log(memory)
    server.emit('tx2mem',memory)
  }).catch((e) => {
    server.emit('tx2mem',null)
  }).finally(function() { setTimeout(tx2_mem,3000) })
}
*/
