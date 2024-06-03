// Venstar api interface
require( 'whatwg-fetch' );

class GetInfoResponse {

	constructor() {

		this.name = 'THERMOSTAT';
		this.mode = 0;
		this.state = 0;
		this.activestage = 0;
		this.fan = 0;
		this.fanstate = 0;
		this.tempunits = 0;
		this.schedule = 0;
		this.schedulepart = 0;
		this.away = 0;
		this.spacetemp = 0;
		this.heattemp = 10;
		this.cooltemp = 10;
		this.cooltempmin = 10;
		this.cooltempmax = 35;
		this.heattempmin = 10;
		this.heattempmax = 30;
		this.setpointdelta = 0;
		this.availablemodes = 0;
		this.hum = 0;
	}
}

class GetSensorsResponse {

	constructor() {

		this.sensors;
	}
}

exports.GetInfoResponse = GetInfoResponse;
exports.GetSensorsResponse = GetSensorsResponse;

class VenstarAPI {

	constructor( address ) {

		this.uri = address;
	}
	
	async getInfo() {

		return fetch( `${this.uri}/query/info` )
			.then( response=> {
				if( ! response.ok ) {
					throw new Error( 'Network Error: Couldn\'t get status update from thermostat.' );
				}
				return response.json();
			} )
			.catch( ( err ) => {
				throw err;
			} );
	}

	async getSensors() {

		return fetch( `${this.uri}/query/sensors` )
			.then( response=> {
				if( ! response.ok ) {
					throw new Error( 'Network Error: Couldn\'t get sensor info from thermostat.' );
				}
				return response.json();
			} )
			.catch( ( err ) => {
				throw err;
			} );
	}

	async setControl( data ) {

		console.log( 'Setting control data: ' + data );

		return fetch( `${this.uri}/control`, {
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		} )
			.then( ( res ) => res.json() )
			.catch( ( err ) => console.log( err ) );
	}
}

exports.VenstarAPI = VenstarAPI;
