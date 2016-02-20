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
  this.off();
}

function writeTo(client, command) {
  return new Promise((resolve, reject) => {
    client.write(command + "\n", () => {
      resolve(client);
    });
  });
}

function wait(timeout, client) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {resolve(client)}, timeout);
  });
}

BeamAccessory.prototype.communicate = function() {
  return new Promise((resolve, reject) => {
    var client = new net.Socket();
    client.connect(this.config.port, this.config.host, () => {
      resolve(client);
    });
    client.on('close', () => { this.log('Connection closed to beam') });
  });
}

BeamAccessory.prototype.off = function() {
  this.communicate().then(client => {
    return wait(200, client)
  }).then(client => {
    return writeTo(client, "user;Kyle;xx")
  }).then(client => {
    return wait(200, client)
  }).then(client => {
    return writeTo(client, "led;0;3")
  }).then(client => {
    return wait(200, client)
  }).then(client => {
    return writeTo(client, "")
  }).then(client => {
    return wait(200, client)
  }).then(client => {
    this.on_state = false;
    this.log("Beam off");
    client.destroy()
  });
}

BeamAccessory.prototype.on = function() {
  return this.communicate().then(client => {
    return wait(200, client)
  }).then(client => {
    return writeTo(client, "user;Kyle;xx")
  }).then(client => {
    return wait(200, client)
  }).then(client => {
    return writeTo(client, "led;0;3")
  }).then(client => {
    return wait(200, client)
  }).then(client => {
    return writeTo(client, "screen;0;0")
  }).then(client => {
    return wait(200, client)
  }).then(client => {
    return writeTo(client, "")
  }).then(client => {
    return wait(200, client)
  }).then(client => {
    this.log("Beam on");
    this.on_state = true;
    client.destroy()
    return this.on_state;
  });
}

BeamAccessory.prototype.getState = function(callback) {
  callback(null, this.on_state);
}

BeamAccessory.prototype.setState = function(state, callback) {
  if(state) {
    this.on().then((state) =>{ callback(null); });
  } else {
    this.off().then((state) => { callback(null) });
  }
}

BeamAccessory.prototype.getServices = function() {
  return [this.service];
}

