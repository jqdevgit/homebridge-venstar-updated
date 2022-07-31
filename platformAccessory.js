const venstarAPI = require('./api.js')

class VenstarThermostatsPlatformAccessory {
	constructor(platform, accessory, uri) {
		this.platform = platform;
		this.accessory = accessory;
		this.uri = uri;
		// set accessory information
		this.accessory
            .getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, "Venstar")
            .setCharacteristic(this.platform.Characteristic.Model, "T2000")
            .setCharacteristic(this.platform.Characteristic.SerialNumber, "UNO");
        this.API = new venstarAPI.VenstarAPI(this.uri);
        this.State = new venstarAPI.GetInfoResponse();
        
        this.service =
            this.accessory.getService(this.platform.Service.Thermostat) ||
                this.accessory.addService(this.platform.Service.Thermostat);
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

       
        this.service
            .getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
            .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
            .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
            .onSet(this.handleTargetHeatingCoolingStateSet.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .onGet(this.handleCurrentTemperatureGet.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.TargetTemperature)
            .onGet(this.handleTargetTemperatureGet.bind(this))
            .onSet(this.handleTargetTemperatureSet.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
            .onGet(this.handleCoolingTemperatureGet.bind(this))
            .onSet(this.handleCoolingTemperatureSet.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
            .onGet(this.handleHeatingTemperatureGet.bind(this))
            .onSet(this.handleHeatingTemperatureSet.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
            .onGet(this.handleTemperatureDisplayUnitsGet.bind(this));
        // Fan Service
        const fanService = this.accessory.getService("Fan") ||
            this.accessory.addService(this.platform.Service.Fanv2, "Fan", "YourUniqueIdentifier-2");
        // create handlers for required characteristics
        fanService
            .getCharacteristic(this.platform.Characteristic.Active)
            .onGet(this.handleFanActiveGet.bind(this))
            .onSet(this.handleFanActiveSet.bind(this));

        // set up
        this.pullState();
            
    }
    
    async handleFanActiveGet() {
        this.pullState().then((state) => {
        	this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(state.fanstate);
        })
        return this.State.fanstate;
    }
    async handleFanActiveSet(value) {
        const fanValue = value ? 1 : 0;
        this.API.setControl("fan=" + fanValue);
        return value;
    }
    handleCurrentHeatingCoolingStateGet(callback) {
        this.pullState().then((state) => {
        	this.service.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState).updateValue(state.state);
        });
        return this.State.state;
    }
    async handleTargetHeatingCoolingStateGet() {
        this.pullState().then((state) => {
        	this.service.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState).updateValue(state.mode);
        });
        return this.State.mode;
    }
    async handleTargetHeatingCoolingStateSet(value) {
		let targetTemp;
		switch (value) {
			case 2:
           		targetTemp = this.State.cooltemp;
            	break;
        	case 1:
            	targetTemp = this.State.heattemp;
            	break;
        	default:
            	targetTemp = (this.State.heattemp + this.State.cooltemp) / 2;
            	break; 
			}
		this.service.getCharacteristic(this.platform.Characteristic.TargetTemperature).updateValue(targetTemp);
        this.API.setControl("mode=" + value);
    }
    async handleCurrentTemperatureGet() {
        this.pullState().then((state) => {
        	this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature).updateValue(state.spacetemp);
        });
        return this.State.spacetemp;
    }
    async handleTargetTemperatureGet() {
        this.pullState();
        let targetTemp;
        switch (this.State.mode) {
            case 2:
                targetTemp = this.State.cooltemp;
                break;
            case 1:
                targetTemp = this.State.heattemp;
                break;
            default:
                targetTemp = (this.State.heattemp + this.State.cooltemp) / 2;
                break;
        }
        return targetTemp;
    }
    async handleTargetTemperatureSet(value) {
        this.API.getInfo().then((test) => {
            let tempMode;
            if (test.mode == 2) {
                tempMode = "cooltemp";
            }
            else {
                tempMode = "heattemp";
            }
            value = this.convertTemp(value).toFixed(2).toString();
            this.API.setControl(tempMode + "=" + value);
        });
    }
    async handleCoolingTemperatureGet() {
        this.pullState().then((state) => {
        	this.service.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature).updateValue(state.cooltemp);
        });
        return this.State.cooltemp;
    }
    async handleCoolingTemperatureSet(value) {
        value = this.convertTemp(value).toFixed(2).toString();
        this.API.setControl("cooltemp=" + value);
    }
    async handleHeatingTemperatureGet() {
        this.pullState().then((state) => {
            this.service.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature).updateValue(state.heattemp);
        });
        return this.State.heattemp;
    }
    async handleHeatingTemperatureSet(value) {
        value = this.convertTemp(value).toFixed(2).toString();
        this.API.setControl("heattemp=" + value);
    }
    async handleTemperatureDisplayUnitsGet() {
        return this.State.tempunits == 0
            ? this.platform.Characteristic.TemperatureDisplayUnits.FAHRENHEIT
            : this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS;
    }
    
    async pullState() {
    	 return this.API.getInfo()
        	.then((res) => {
        		this.State = res;
        		this.convertTemps();
        		return res;
        	})
        	.catch((err) => {
        		throw err;
        	});
    }

    ftoc = function(temperature) {
  		return (temperature - 32) / 1.8;
	};
	ctof = function(temperature) {
  		return (temperature * 1.8) + 32;
	};
	usesFahrenheit = function() {
  		return this.State.tempunits === 0 ? true : false;
  	};
  	convertTemp = function(temperature) {
  		if (this.usesFahrenheit() == true) {
  			return this.ctof(temperature);
  		}
  		return temperature;
  	}
  	convertTemps = function() {
  		if (this.usesFahrenheit()) {
  			this.State.spacetemp = this.ftoc(this.State.spacetemp);
  			this.State.heattemp = this.ftoc(this.State.heattemp);
  			this.State.cooltemp = this.ftoc(this.State.cooltemp);
  			this.State.cooltempmin = this.ftoc(this.State.cooltempmin);
  			this.State.cooltempmax = this.ftoc(this.State.cooltempmax);
  			this.State.heattempmin = this.ftoc(this.State.heattempmin);
  			this.State.heattempmax = this.ftoc(this.State.heattempmax);
  		}
  	}
    
}

exports.VenstarThermostatsPlatformAccessory = VenstarThermostatsPlatformAccessory;