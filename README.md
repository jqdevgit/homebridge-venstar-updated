# homebridge-venstar-thermostats
Homebridge plugin for Venstar Explorer Mini Thermostats

## Support
This plugin has only been tested on the Venstar Explorer Mini thermostats. It should work on other Venstar models but there are no guarantees. Some functions may not be supported but basic mode, temperature, and fan controls work.

## Setup
- Add `homebridge-venstar-thermostats` in your Homebridge Config UI X web interface
- Make sure your thermostat has Local API mode turned on in its settings
- Add to your config.json: 
```
"platforms": [
  {
    "platform": "VenstarThermostats",
    "thermostats": [
    {
      "name": "Living Room Thermostat",
      "ip": "http://xxx.xxx.x.xx"
    }
]
```
The name can be whatever you want, and the ip address must be the local ip address of the thermostat.

Add multiple entries for additional thermostats.

