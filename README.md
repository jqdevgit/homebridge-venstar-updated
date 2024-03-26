# homebridge-venstar-udpated

Homebridge plugin for Venstar Thermostats, forked from [homebridge-venstar-thermostats](https://github.com/maladr01d/homebridge-venstar-thermostats).

## Support and Difference from Original Plugin

I've set this up and tested it only with the [Venstar T7900 thermostat](https://venstar.com/thermostats/colortouch/). With the T7900, the original plugin would only *retrieve* the current temperature, set temperature and mode (e.g. heating or cooling). You could not *change* the set temperature or mode.

I've updated it so that you can now change the set temperature and the mode. I've also added the ability for it to pull in the **humidity** value from the thermostat, so you can use it as a humidity sensor in HomeKit. 

## Setup

* Add `homebridge-venstar-updated` via the Homebridge UI.
* Make sure your thermostat has Local API mode enabled. For the T7900, these are the steps:
    * Tap MENU.
    * Then Wi-Fi.
    * Then Local API Options.
    * If the top button says **Local API - OFF**, then tap it to turn it on. If it already says **Local API - ON**, then you don't need to do anything.
* Add the following to your JSON config in Homebridge. 

```json
{
    "platform": "VenstarThermostats",
    "thermostats": [
        {
            "name": "My Thermostat",
            "ip": "http://xxx.xxx.x.xx"
        }
    ]
}
```

The name can be whatever you want. The IP address must be the local IP address of the thermostat. To find this on the T7900:

* Tap MENU.
* Then Wi-Fi.
* Then WiFi Status.
* Here it will display the IP address of the unit.

Add multiple entries for additional thermostats.