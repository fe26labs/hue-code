/* eslint-disable class-methods-use-this */
const axios = require('axios');

class HueBridgeRepository {
  async getHueBridges() {
    const discoveryUrl = 'https://discovery.meethue.com/';
    try {
      const result = await axios.get(discoveryUrl);
      // Mapping
      const entities = result.data;
      return entities;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = HueBridgeRepository;
