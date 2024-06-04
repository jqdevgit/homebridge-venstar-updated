# homebridge-venstar-udpated

Homebridge plugin for Venstar Thermostats, forked from [homebridge-venstar-thermostats](https://github.com/maladr01d/homebridge-venstar-thermostats).

## Support and difference from original plugin

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

## Separate accessory for outdoor sensor

In version 0.2.2 I introduced a new feature that lets you add a separate accessory for an outdoor sensor. Many heat pump models (can) have a temperature sensor on them. And certain Venstar thermostat models (e.g. the T7900, which is what I test with) have the ability to read the temperature from this sensor. 

To add the outdoor sensor as a separate accessory, you need only add it to the existing config file. For example:

```json
{
    "platform": "VenstarThermostats",
    "thermostats": [
        {
            "name": "My Thermostat",
            "ip": "http://xxx.xxx.x.xx"
        },
        {
            "name": "Outside Temperature",
            "ip": "http://xxx.xxx.x.xx",
            "sensor": 1
        }
    ]
}
```

You'll see that the first entry ("My Thermostat") is the original thermostat entry from above. The second entry ("Outside Temperature") is the new one for the outdoor sensor. The name can be whatever you want. The IP address must be the local IP address of the thermostat (instructions above for finding this).

The key part is the `"sensor": 1`. That tells the plugin to add a temperature sensor accessory (instead of a full thermostat accessory) and to pull in the data from the outdoor sensor attached to the thermostat.

If (as will most often be the case) this outdoor sensor is part of the same thermostat you wish to control via HomeKit, than you put the same IP address for the sensor entry as you did for the thermostat entry.

At the moment, it is coded to only look for (and, as such, will only work with what is configured as) the outdoor sensor, and will not work with any other additional sensor(s) you have configured on your thermostat.