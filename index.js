var Service, Characteristic;
var net = require("net");

var timeout = 500;
var long_timeout = 3000;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-beam", "Beam", BeamAccessory);
};

function BeamAccessory(log, config) {
  this.log = log;
  this.config = config

  // Got to make a guess since there is no way to
  // determine the state of the beam projector.
  this.on_state = false;

  this.service = new Service.Switch(this.config.name);
  this.service.getCharacteristic(Characteristic.On).on('set', this.setState.bind(this));
  this.service.getCharacteristic(Characteristic.On).on('get', this.getState.bind(this));
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

    client.on('close', () => { this.log("Connection closed to beam") });
    client.on('data', (data) => {this.log("received:" + data) });
  });
}

// turning off process: current APIs only offer a toggle, so we turn it on to turn it off
//
// connect to the beam (unfortunately this also turns on the beam grr)
// wait 3 seconds -- there is a huge variance in how long it takes to turn on the beam, so we wait...
// send the 'turn off' command
BeamAccessory.prototype.off = function() {
  return this.communicate().then(client => {
    return wait(timeout, client)
  }).then(client => {
    return writeTo(client, "user;Homebridge;" + this.config.macAddress)
  }).then(client => {
    return wait(long_timeout, client)
  }).then(client => {
    return writeTo(client, "screen;0;0")
  }).then(client => {
    return wait(timeout, client)
  }).then(client => {
    return writeTo(client, "")
  }).then(client => {
    this.on_state = false;
    this.log("Beam off");
    client.destroy()
  });
}

// turning on process:
//
// Connect to beam -- this actually turns on the beam, but we need to wait to make sure
// it actually turned on before handing control back to homebridge.
BeamAccessory.prototype.on = function() {
  return this.communicate().then(client => {
    return wait(timeout, client)
  }).then(client => {
    return writeTo(client, "user;Homebridge;" + this.config.macAddress)
  }).then(client => {
    return wait(long_timeout, client)
  }).then(client => {
    return writeTo(client, "")
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

