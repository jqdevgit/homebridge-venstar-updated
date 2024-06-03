const platformAccessory = require( './platformAccessory.js' );
const PLUGIN_NAME = 'homebridge-venstar-updated';
const PLATFORM_NAME = 'VenstarThermostats';

class VenstarThermostatsPlatform {

	constructor( log, config, api ) {

		this.log = log;
		this.config = config;
		this.api = api;
		this.Service = this.api.hap.Service;
		this.Characteristic = this.api.hap.Characteristic;
		this.accessories = [] // This is used to track restored cached accessories
		this.log.debug( 'Finished initializing platform:', PLATFORM_NAME );
		this.api.on( 'didFinishLaunching', () => {
			log.debug( 'Executed didFinishLaunching callback');
			this.discoverDevices();
		} );
	}

	configureAccessory( accessory ) {

		this.log.info( 'Loading accessory from cache:', accessory.displayName );
		this.accessories.push( accessory );
	}

	getThermostats() {

		if ( this.config.thermostats == undefined ) {
			console.log( 'Thermostats must be defined in the config file.' );
			return {}
		}

		return this.config.thermostats
	}

	async discoverDevices() {

		const devices = this.getThermostats();

		for ( const device of devices ) {

			var uuid;

			if ( device.sensor == 1 ) { uuid = this.api.hap.uuid.generate( 'venstar' + '.' + device.name + '.'+ device.ip + '.'+ device.sensor ); }
			else { uuid = this.api.hap.uuid.generate( 'venstar' + '.' + device.name + '.'+ device.ip ); }
			
			const existingAccessory = this.accessories.find( ( accessory ) => accessory.UUID === uuid );

			if ( existingAccessory ) {

				this.log.info( 'Restoring existing accessory from cache:', device.name );

				if ( device.sensor == 1 ) { new platformAccessory.VenstarThermostatsPlatformOutdoorSensorAccessory( this, existingAccessory, device.ip ); }
				else { new platformAccessory.VenstarThermostatsPlatformAccessory( this, existingAccessory, device.ip ); }
			}
			else {

				this.log.info( 'Adding new accessory:', device.name, device.ip );

				const accessory = new this.api.platformAccessory( device.name, uuid );
				accessory.context.device = device;
				if ( device.sensor == 1 ) { new platformAccessory.VenstarThermostatsPlatformOutdoorSensorAccessory( this, accessory, device.ip ); }
				else { new platformAccessory.VenstarThermostatsPlatformAccessory( this, accessory, device.ip ); }

				this.api.registerPlatformAccessories( PLUGIN_NAME, PLATFORM_NAME, [
					accessory,
				] );
			}
		}
	}
}

module.exports = ( api ) => {
	api.registerPlatform( PLUGIN_NAME, PLATFORM_NAME, VenstarThermostatsPlatform );
}