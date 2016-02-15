var Service, Characteristic;
var WebSocket = require("ws");

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-beam", "Beam", BeamAccessory);
};


function BeamAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.on_state = false;
  this.config = {
    host : config.host,
    port : config.port,
  }

  this.service = new Service.Switch(this.name);
  this.service.getCharacteristic(Characteristic.On).on('set', this.setState.bind(this));
  this.service.getCharacteristic(Characteristic.On).on('get', this.getState.bind(this));

  this.toggle.bind(this)();

}

BeamAccessory.prototype.toggle = function() {
  var address = "ws://" + this.config.host + ":" + this.config.port + "/";
  var client = new WebSocket(address);

  client.on('close', function close() {
    console.log("websocket Closed");
  });

  client.on('open', function open() {
    console.log("Websocket connected to " + address);
    client.send("screen;0;0", function() {
      client.close();
    });
  });
}


BeamAccessory.prototype.getState = function(callback) {
  callback(null, this.on_state);
}

BeamAccessory.prototype.setState = function(state, callback) {
  this.toggle();
  callback(null);
}

BeamAccessory.prototype.getServices = function() {
  return [this.service];
}
