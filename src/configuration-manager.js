class ConfigurationManager {
  get userId() { return this.context.globalState.get('userId'); }

  set userId(value) { this.context.globalState.update('userId', value); }

  get bridgeIp() { return this.context.globalState.get('bridgeIp'); }

  set bridgeIp(value) { this.context.globalState.update('bridgeIp', value); }

  get selectedLightGroup() { return this.context.globalState.get('selectedLightGroup'); }

  set selectedLightGroup(value) { this.context.globalState.update('selectedLightGroup', value); }

  constructor(context) {
    const self = this;
    self.context = context;
  }
}

module.exports = ConfigurationManager;
