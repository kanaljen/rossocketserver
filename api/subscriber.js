var message = {}

function callback1(msg) { 
    message.TX2_jsPublisher_jsTopic = msg;
    exports.topics = message;
}

function callback2(msg) { 
    message.RIO_bumper_state = msg;
    exports.topics = message;
}

// Create node
const rosnodejs = require('rosnodejs');
rosnodejs.initNode('RIO_jsSubscriber',{ onTheFly: true });

// Node handle
const nh = rosnodejs.nh;
const std_msgs = rosnodejs.require('std_msgs');

// Subscribers
const sub1 = nh.subscribe('/TX2_jsPublisher_jsTopic', 'std_msgs/String');
const sub2 = nh.subscribe('/RIO_bumper_state', 'std_msgs/Bool');
sub1.on('message', callback1);
sub2.on('message', callback2);
