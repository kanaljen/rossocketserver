// Setup socket and child process as globals
const
  io = require('socket.io'),
  server = io.listen(8000),
  const { spawn } = require('child_process')

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

// Function for parsing the stdout from rosnode info nodename
function parseNodeInfo(data) {
  let parsed = {puplications: [],
                subscriptions: [],
                services: [],
                pid: 0}
  data = data.toString().split('\n')
  cat = -1
  for (let item of data) {
    if(item.includes('Pid:'))parsed.pid = parseInt(item.replace('Pid:','')) 
    else if(item.includes(':'))cat += 1
    else if(item.includes('*')){
      if(cat == 0)parsed.puplications.push(item.replace(' * ',''))
      else if(cat == 1)parsed.subscriptions.push(item.replace(' * ',''))
      else if(cat == 2)parsed.services.push(item.replace(' * ',''))
    }
  }
  return parsed
}

// Function for parsing the stdout from rostopic info topicname
function parseTopicInfo(data) {
  let parsed = {publishers: [],
                type: '',
                subscribers: []}
  data = data.toString().split('\n')
  cat = -1
  for (let item of data) {
    if(item.includes('Type: '))parsed.type = item.replace('Type: ','') 
    else if(item.includes('ers:'))cat += 1
    else if(item.includes('*')){
      if(cat == 0)parsed.publishers.push(item.replace(' * ',''))
      else if(cat == 1)parsed.subscribers.push(item.replace(' * ',''))
    }
  }
  return parsed
}

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
