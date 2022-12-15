/* eslint-disable import/no-unresolved */
/* eslint-disable class-methods-use-this */

const vscode = require('vscode');

class HueSensorsProvider {
  constructor(sensors) {
    const self = this;
    self.sensors = sensors;
    self.eventEmitter = new vscode.EventEmitter();
    self.onDidChangeTreeData = self.eventEmitter.event;
  }

  refresh() {
    const self = this;
    self.eventEmitter.fire();
  }

  getTreeItem(element) {
    return element;
  }

  async getChildren() {
    let items = [];
    try {
      items = global.sensors.map((sensor) => {
        let sensorName = sensor.name;
        if (sensor.type === 'ZLLTemperature') {
          sensorName = `${sensorName} (${sensor.state.temperature / 100})`;
        }
        const treeItem = new vscode.TreeItem(
          sensorName,
          vscode.TreeItemCollapsibleState.None,
        );
        return treeItem;
      });
    } catch (error) {
      throw error;
    }

    return items;
  }
}

module.exports = HueSensorsProvider;
