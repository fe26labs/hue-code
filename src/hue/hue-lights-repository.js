/* eslint-disable class-methods-use-this */
const axios = require('axios');


class HueLightsRepository {
  /**
   * @constructor
   * @param {*} configuration  - configuration settings for the reponsitory.
   */
  constructor(configuration) {
    const self = this;
    self.configuration = configuration;
  }

  async getLight(id) {
    const self = this;
    const url = `http://${self.configuration.bridgeIp}/api/${self.configuration.userId}/lights/${id}`;
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets a list of hue lights.
   * @returns a list of hue lights.
   */
  async getLights() {
    const self = this;
    const url = `http://${self.configuration.bridgeIp}/api/${self.configuration.userId}/lights`;
    try {
      const result = await axios.get(url);
      const groupIds = Object.keys(result.data);
      const groups = [];
      for (let i = 0; i < groupIds.length; i += 1) {
        const groupId = groupIds[i];
        const group = result.data[groupId];
        group.id = groupId;
        groups.push(group);
      }
      return groups;
    } catch (error) {
      throw error;
    }
  }

  async updateLightState(id, state) {
    const self = this;
    const url = `http://${self.configuration.bridgeIp}/api/${self.configuration.userId}/lights/${id}/state`;
    try {
      const result = await axios.put(url, state);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = HueLightsRepository;
