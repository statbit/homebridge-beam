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

  client.on('data', function(data) { });

  client.on('close', function() {
    console.log('Connection closed to beam');
  });
}

function after(timeout, callback) {
  setTimeout(callback, timeout);
}

BeamAccessory.prototype.off = function() {
  this.communicate(function(client) {
    client.write("user;Kyle;xx\n", function() {
      client.write("led;3;3\n", function() {
        client.write("led;0;3\n", function() {
          client.destroy();
        });
      });
    });
  });
  console.log("Beam off");
  this.on_state = false;
}

BeamAccessory.prototype.on = function() {
  this.communicate(function(client) {
    client.write("user;Kyle;xx\n", function() {
      client.write("led;3;3\n", function() {
        client.write("led;0;3\n", function() {
          client.write("screen;0;0\n", function() {
            client.destroy();
          });
        });
      });
    });
  });
  console.log("Beam on");
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

