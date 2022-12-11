/* eslint-disable class-methods-use-this */
const axios = require('axios');

class HueUserRepository {
  static get LINK_BUTTON_NOT_PRESSED_ERROR_CODE() { return 'link-button-not-pressed'; }

  constructor(configuration) {
    const self = this;
    self.configuration = configuration;
  }

  async getUser() {
    const self = this;
    const url = `http://${self.configuration.bridgeIp}/api`;
    try {
      const result = await axios.post(url, {
        devicetype: 'hue-code',
      });
      if (result.data[0].error) {
        throw new Error(HueUserRepository.LINK_BUTTON_NOT_PRESSED_ERROR_CODE);
      } else {
        const userId = result.data[0].success.username;
        return userId;
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = HueUserRepository;
