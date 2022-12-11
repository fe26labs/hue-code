/* eslint-disable no-await-in-loop */
class HueService {
  constructor(hueLightsRepository) {
    const self = this;
    self.hueLightsRepository = hueLightsRepository;
  }

  processStart(lights, colour) {
    const self = this;
    const state = {
      on: true,
      sat: 254,
      bri: 254,
      hue: 10000,
      alert: 'lselect',
    };

    state.hue = HueService.getHue(colour);

    for (let i = 0; i < lights.length; i += 1) {
      self.hueLightsRepository.updateLightState(lights[i], state);
    }
  }

  processEnd(lights) {
    const self = this;
    const state = {
      on: false,
      alert: 'none',
    };

    state.hue = HueService.getHue();

    for (let i = 0; i < lights.length; i += 1) {
      self.hueLightsRepository.updateLightState(lights[i], state);
    }
  }

  async doubleFlash(lights, colour) {
    const self = this;
    await self.flash(lights, colour);
    await self.flash(lights, colour);
  }

  async flash(lights, colour) {
    const self = this;
    const state = {
      on: true,
      sat: 254,
      bri: 254,
      hue: 10000,
      alert: 'select',
    };

    state.hue = HueService.getHue(colour);

    for (let i = 0; i < lights.length; i += 1) {
      try {
        const lightId = lights[i];
        await self.hueLightsRepository.updateLightState(lightId, state);
      } catch (error) {
        throw error;
      }
    }
  }

  static getHue(colour) {
    let hue = 10000;
    switch (colour) {
      case 'red':
        hue = 0;
        break;
      case 'blue':
        hue = 46920;
        break;
      case 'green':
        hue = 25500;
        break;
      case 'white':
      default:
        break;
    }
    return hue;
  }
}

module.exports = HueService;
