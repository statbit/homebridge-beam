var Service, Characteristic;
var net = require("net");

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

  this.off.bind(this)();
}


BeamAccessory.prototype.communicate = function(callback) {
  var client = new net.Socket();
  client.connect(13456, '192.168.1.11', function() {
    console.log("connected to beam");
    callback(client);
  });

  client.on('data', function(data) {
    console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
  });

  client.on('close', function() {
    console.log('Connection closed to beam');
  });
}

BeamAccessory.prototype.off = function() {
  this.communicate(function(client) {
    client.write("user;Kyle;xx\n");
    client.write("led;0;1\n");
    client.write("led;0;0\n");
  });
  this.on_state = true;
}

BeamAccessory.prototype.on = function() {
  this.communicate(function(client) {
    client.write("user;Kyle;xx\n");
    client.write("led;0;1\n");
    client.write("screen;0;0\n");
  });
  this.on_state = true;
}

BeamAccessory.prototype.getState = function(callback) {
  callback(null, this.on_state);
}

BeamAccessory.prototype.setState = function(state, callback) {
  if(state) {
    this.on();
  } else {
    this.off();
  }

  callback(null);
}

BeamAccessory.prototype.getServices = function() {
  return [this.service];
}

