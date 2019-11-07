'use strict';

//const subscriber = require('./subscriber');
var res = {}

exports.list = () => {
  const list = {}
  list.nodeslist_all_nodes();
  list_all_topics();
}

const vmstat = () => {
  const { spawn } = require('child_process');
  const shell = spawn('vmstat');

  shell.stdout.on('data', (data) => {
    let stdout = [];
    stdout = data.toString().split(/\s+/);
    let tx2 = {'cpu':{'usr': stdout[13],
      'sys': stdout[14],
      'idl':stdout[15],
      'iow': stdout[16]},
      'mem':{'swpd':stdout[3],
      'free':stdout[4],
      'buff':stdout[5],
      'cshe':stdout[6]}};
    res.tx2 = tx2;
  });
}

const list_all_nodes = () => {
    const { spawn } = require('child_process');
    const ros = spawn('rosnode',['list']);
    
    ros.stdout.on('data', (data) => {
      let json = {};
      json = [];
      data = data.toString().split(/(\r?\n)/g);
      data.forEach((item, index) => {
        if (data[index] !== '\n' && data[index] !== '') {
              json.push(data[index].replace('\n',''))
        };
      });
      res.nodes = json;
    });

    ros.stderr.on('data', (data) => {
      res.nodes = 'REQUEST ERROR';
    });

};

const list_all_topics = () => {
    const { spawn } = require('child_process');
    const ros = spawn('rostopic',['list']);
    
    ros.stdout.on('data', (data) => {
      let json = {};
      json = [];
      data = data.toString().split(/(\r?\n)/g);
      data.forEach((item, index) => {
        if (data[index] !== '\n' && data[index] !== '') {
              json.push(data[index])
        };
      });
      res.topics = json;
    });

    ros.stderr.on('data', (data) => {
      res.topics = 'REQUEST ERROR';
    });

};
/*
const node_info = (node) => {
  const { spawn } = require('child_process');
  const ros = spawn('rosnode',['info',node]);
  
  ros.stdout.on('data', (data) => {
   let json = {'node':{'name':'/' + node,'pid':0}};
    data = data.toString().split('\n');
    let field = 0;
    data.forEach((item, index) => {
      if (data[index].includes('Pid:')) {
        json.node.pid = parseInt(data[index].replace("Pid: ",""));
      };
      if (data[index].includes('Publications')) {
        json.publications = [];
        field = 1
      };
      if (data[index].includes('*') && field == 1) {
        json.publications.push(data[index].replace(' * ',''));
      };
      if (data[index].includes('Subscriptions')) {
        json.subscriptions = [];
        field = 2
      };
      if (data[index].includes('*') && field == 2) {
        json.subscriptions.push(data[index].replace(' * ',''));
      };
      if (data[index].includes('Services')) {
        json.services = [];
        field = 3
      };
      if (data[index].includes('*') && field == 3) {
        json.services.push(data[index].replace(' * ',''));
      };
      if (data[index].includes('contacting') && field == 3) {
        field = 0;
      };
    });
    res.info = json;
  });
};

topic_info = function(req, res) {
  const { spawn } = require('child_process');
  const ros = spawn('rostopic',['info',req.params.topicName]);
  
  ros.stdout.on('data', (data) => {
    let json = {};
    json.topics = [];
    data = data.toString().split(/(\r?\n)/g);
    data.forEach((item, index) => {
      if (data[index] !== '\n' && data[index] !== '') {
            json.topics.push(data[index])
      };
    });
    res.json(json);
  });

  ros.stderr.on('data', (data) => {
    res.json('REQUEST ERROR');
  });

};

subscriber = function(req, res) {
  res.json(subscriber.topics);
};
*/

setTimeout(make_respons,250);