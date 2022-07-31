let Service, Characteristic, Accessory, UUID
const platformAccessory = require('./platformAccessory.js');
const PLUGIN_NAME = 'homebridge-venstar-thermostats'
const PLATFORM_NAME = 'VenstarThermostats'

class VenstarThermostatsPlatform {
	constructor(log, config, api) {
		this.log = log
		this.config = config
		this.api = api
		this.Service = this.api.hap.Service;
		this.Characteristic = this.api.hap.Characteristic;
		// this is used to track restored cached accessories
		this.accessories = []
		this.log.debug("Finished initializing platform:", PLATFORM_NAME);
        this.api.on("didFinishLaunching", () => {
            log.debug("Executed didFinishLaunching callback");
            this.discoverDevices();
        });
	}
	configureAccessory(accessory) {
		this.log.info("Loading accessory from cache:", accessory.displayName);
		this.accessories.push(accessory);
	}

	getThermostats() {
		if (this.config.thermostats == undefined) {
			console.log('Thermostats must be defined in the config file')
			return {}
		}
		return this.config.thermostats
	}

	async discoverDevices() {

		const devices = this.getThermostats();

		for (const device of devices) {
			const uuid = this.api.hap.uuid.generate('venstar' + '.' + device.name + '.'+ device.ip);
			const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);
			if (existingAccessory) {
				this.log.info("Restoring existing accessory from cache:", device.name);
				new platformAccessory.VenstarThermostatsPlatformAccessory(this, existingAccessory, device.ip);
			} else {
                this.log.info("Adding new accessory:", device.name, device.ip);
                const accessory = new this.api.platformAccessory(device.name, uuid);
                accessory.context.device = device;
                new platformAccessory.VenstarThermostatsPlatformAccessory(this, accessory, device.ip);
                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
                    accessory,
                ]);
            }
		}
	}
}

module.exports = (api) => {
	api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, VenstarThermostatsPlatform);
}

/*
module.exports = function (homebridge) {
  //Service = homebridge.hap.Service
  //Characteristic = homebridge.hap.Characteristic
  //Accessory = homebridge.hap.Accessory
  //UUID = homebridge.hap.uuid
  homebridge.registerPlatform(
    PLUGIN_NAME,
    PLATFORM_NAME,
    VenstarThermostatsPlatform,
    true
  )

}
  */