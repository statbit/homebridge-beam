# homebridge-beam
[Beam Labs Beam Projector](http://beamlabsinc.com) plugin for [Homebridge](https://github.com/nfarina/homebridge)

Currently, this plugin activates the projector as a switch. 
This way you can turn on the projector by saying "Hey Siri, turn on the Beam Projector".  

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-beam
3. Update your configuration file. See sample config.json snippet below. 

# Configuration

Configuration sample:

```
    accessories : [ 
      {
        "accessory": "Beam",
        "name": "Beam Projector",
        "macAddress" : "XX:XX:XX:XX:XX:XX", 
        "host": "<ip address of beam>",
        "port": "13456"
      }
    ]
```

Fields: 

* "accessory": Must always be "Beam" (required)
* "name": Can be anything (required)
* "macAddress" : The mac address of the host machine running homebridge in XX:XX:XX:XX:XX:XX format
* "host": IP Address of your beam like "10.0.1.4" or "192.168.1.12"
* "port" : the beam supports port 13456 and 13457 -- either port will work

