/* eslint-disable class-methods-use-this */

const vscode = require('vscode');

class HueGroupsProvider {
  constructor(configuration) {
    const self = this;
    self.configuration = configuration;
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

  async getChildren(element) {
    const self = this;
    const selectedLightGroup = self.configuration.selectedLightGroup;
    let items = [];
    if (!element) {
      try {
        items = global.groups.map((group) => {
          let groupName = group.name;
          if (group.name === selectedLightGroup) {
            groupName += ' (selected)';
          }
          const treeItem = new vscode.TreeItem(
            groupName,
            vscode.TreeItemCollapsibleState.Collapsed,
          );
          treeItem.id = group.name;
          treeItem.description = group.type;
          return treeItem;
        });
      } catch (error) {
        throw error;
      }
    } else {
      const group = global.groups.find(g => g.name === element.id);
      for (let i = 0; i < group.lights.length; i += 1) {
        const light = global.lights.find(l => l.id === group.lights[i]);
        if (light) {
          const treeItem = new vscode.TreeItem(
            light.name, vscode.TreeItemCollapsibleState.None,
          );
          treeItem.tooltip = light.id;
          treeItem.description = light.type;
          items.push(treeItem);
        }
      }
    }
    return items;
  }
}

module.exports = HueGroupsProvider;
