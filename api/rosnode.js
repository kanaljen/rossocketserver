module.exports = class {
  constructor() {
    this.node = require("rosnodejs");
    this.node.initNode("TX2_jsNode", { onTheFly: true });
    this.nh = this.node.nh;
    this.std_msgs = this.node.require("std_msgs");
    setTimeout(this.addPublisher.bind(this), 5000);
  }
  addPublisher() {
    this.publisher = this.nh.advertise(
      "/web_commands",
      this.std_msgs.msg.String,
      { latching: true }
    );
  }
  addSubscriber(topic, type, callback) {
    this.nh.subscribe(topic, type, callback);
  }
  removeSubscriber(topic) {
    this.nh.unsubscribe(topic);
  }
  publishJson(type, json) {
    const object = {};
    object.type = type;
    object.payload = json;
    const msg = new this.std_msgs.msg.String();
    msg.data = JSON.stringify(object);
    this.publisher.publish(msg);
  }
};
