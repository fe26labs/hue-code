// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const ConfigurationManager = require('./src/configuration-manager.js');
const HueService = require('./src/hue/hue-service.js');
const HueBridgesRepository = require('./src/hue/hue-bridges-repository.js');
const HueUsersRepository = require('./src/hue/hue-users-repository.js');
const HueGroupsRepository = require('./src/hue/hue-groups-repository.js');
const HueGroupsProvider = require('./src/hue-groups-provider.js');
const HueLightsRepository = require('./src/hue/hue-lights-repository.js');
const HueLightsProvider = require('./src/hue-lights-provider.js');
const HueSensorsRepository = require('./src/hue/hue-sensors-repository.js');
const HueSensorsProvider = require('./src/hue-sensors-provider.js');
const HueBridgesProvider = require('./src/hue-bridges-provider.js');

global.bridges = [];
global.lights = [];
global.groups = [];
global.sensors = [];

const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

const configuration = new ConfigurationManager(null);
const hueGroupsRepository = new HueGroupsRepository(configuration);
const hueLightsRepository = new HueLightsRepository(configuration);
const hueSensorsRepository = new HueSensorsRepository(configuration);
const hueBridgesRepository = new HueBridgesRepository();
global.hueUsersRepository = new HueUsersRepository(configuration);

const hueGroupsProvider = new HueGroupsProvider(configuration);
const hueLightsProvider = new HueLightsProvider(global.lights);
const hueSensorsProvider = new HueSensorsProvider(global.sensors);
const hueBridgesProvider = new HueBridgesProvider(global.bridges);

const hueService = new HueService(hueLightsRepository);

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function selectLightGroupCommand() {
  const items = global.groups.map(group => group.name);
  try {
    const result = await vscode.window.showQuickPick(items, { placeHolder: 'Select the light group you wish to enable.' });
    configuration.selectedLightGroup = result;
    await enableCommand();
    return result;
  } catch (error) {
    throw error;
  }
}

function selectBridge() {
  const items = global.bridges.map(bridge => `${bridge.id}:${bridge.internalipaddress}`);
  try {
    const result = vscode.window.showQuickPick(items, { placeHolder: 'Multiple bridges detected. Please select the one you wish to sync with.' });
    const itemArray = result.split(':');
    const bridge = itemArray[1];
    return bridge;
  } catch (error) {
    throw Error(error);
  }
}

async function getBridges() {
  global.bridges = await hueBridgesRepository.getHueBridges();
  // refresh the bridge provider
}

async function getBridge() {
  try {
    await getBridges();
    if (global.bridges && global.bridges.length > 0) {
      if (global.bridges.length > 1) {
        configuration.bridgeIp = await selectBridge();
      } else {
        configuration.bridgeIp = global.bridges[0].internalipaddress;
      }
    }
    // get the user
  } catch (error) {
    throw error;
  }
}

async function pollUser(context, progress) {
  for (let i = 1; i < 100; i += 1) {
    try {
      const userId = await global.hueUsersRepository.getUser();
      context.globalState.update('userId', userId);
      return userId;
    } catch (error) {
      if (error.message === HueUsersRepository.LINK_BUTTON_NOT_PRESSED_ERROR_CODE) {
        progress.report({ increment: 1, message: 'Still trying to connect! - make sure to press the bridge button...' });
        await sleep(1000);
      } else {
        throw error;
      }
    }
  }
  // throw timeout error
  return null;
}

async function pairBridge(context) {
  try {
    const progressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: 'Paring with Hue Bridge',
      cancellable: true,
    };
    const userId = await vscode.window.withProgress(progressOptions, (progress, token) => {
      token.onCancellationRequested(() => {
        vscode.window.showInformationMessage('Cancelled Hue Bridge Pairing.');
      });

      progress.report({ increment: 0, message: 'Press the link button on the top of your Hue Bridge' });

      return new Promise((resolve) => {
        pollUser(context, progress).then((result) => {
          global.connected = true;
          resolve(result);
        }).catch((reason) => {
          global.connected = false;
          throw reason;
        });
      });
    });
    return userId;
  } catch (error) {
    throw error;
  }
}

async function connectHue(context) {
  try {
    await getBridge();
  } catch (error) {
    throw error;
  }

  try {
    await pairBridge(context);
  } catch (error) {
    throw error;
  }

  if (!configuration.selectedLightGroup) {
    await selectLightGroupCommand();
  }

  await enableCommand();
}

function connectHueCommand(context) {
  connectHue(context).then(() => {
    vscode.window.showInformationMessage('Bridge Paired');
  }).catch((reason) => {
    console.error(reason);
    vscode.window.showErrorMessage('Error Connecting to Bridge');
  });
}

async function enableCommand() {
  try {
    await testConnection();
    global.enabled = true;
    refreshStateBarText();
  } catch (error) {
    global.enabled = false;
    refreshStateBarText();
    console.error(error);
    throw error;
  }
}

function disableCommand() {
  global.enabled = false;
  hueService.doubleFlash(getSelectGroupLightIds(), 'red');
  refreshStateBarText();
}

function displayMenuCommand(context) {
  const quickPickItems = [];
  const disconnectLabel = '$(circle-slash) Disconnect';
  const disableLabel = '$(eye-closed) Disable';
  const enableLabel = '$(eye) Enable';
  const connectLabel = '$(plug) Connect';
  const selectLightGroupLabel = '$(settings) Select Light Group';
  if (global.connected) {
    quickPickItems.push({ label: disconnectLabel, description: `Disconnect from your Hue Bridge (${configuration.bridgeIp})` });
    if (configuration.selectedLightGroup) {
      if (global.enabled) {
        quickPickItems.push({ label: disableLabel, description: 'Disable Hue Code' });
      } else {
        quickPickItems.push({ label: enableLabel, description: 'Enable Hue Code' });
      }
    }
    let selectLightGroupDescription = 'To get started, select a light group.';
    if (configuration.selectedLightGroup) {
      selectLightGroupDescription = `${configuration.selectedLightGroup}, currently selected`;
    }
    quickPickItems.push({ label: selectLightGroupLabel, description: selectLightGroupDescription });
  } else {
    quickPickItems.push({ label: connectLabel, description: 'Connect to your Hue Bridge' });
  }
  vscode.window.showQuickPick(quickPickItems, { placeHolder: 'Select what you want to do' }).then((command) => {
    switch (command.label) {
      case connectLabel:
        connectHueCommand(context);
        break;
      case enableLabel:
        enableCommand();
        break;
      case disableLabel:
        disableCommand();
        break;
      case selectLightGroupLabel:
        selectLightGroupCommand();
        break;
      default:
        break;
    }
  });
}

function registerCommands(context) {
  context.subscriptions.push(vscode.commands.registerCommand('huecode.displayMenu', () => displayMenuCommand(configuration, context)));
}

function getSelectedGroup() {
  const selectedGroup = global.groups.find(group => group.name === configuration.selectedLightGroup);
  return selectedGroup;
}

function getSelectGroupLightIds() {
  const lightIds = getSelectedGroup().lights;
  return lightIds;
}

function registerActivies() {

  vscode.window.onDidChangeActiveTextEditor(() => { if (global.enabled) { hueService.flash(getSelectGroupLightIds(), 'white'); } });

  vscode.debug.onDidStartDebugSession(() => {
    if (global.enabled) {
      hueService.processStart(getSelectGroupLightIds(), 'red');
    }
  });

  vscode.debug.onDidTerminateDebugSession(() => { if (global.enabled) { hueService.processEnd(getSelectGroupLightIds()); } });

  vscode.window.onDidOpenTerminal(() => { if (global.enabled) { hueService.flash(getSelectGroupLightIds(), 'green'); } });
  vscode.window.onDidCloseTerminal(() => { if (global.enabled) { hueService.flash(getSelectGroupLightIds(), 'red'); } });
}

function registerProviders() {
  vscode.window.registerTreeDataProvider('groups', hueGroupsProvider);
  vscode.window.registerTreeDataProvider('lights', hueLightsProvider);
  vscode.window.registerTreeDataProvider('sensors', hueSensorsProvider);
  vscode.window.registerTreeDataProvider('bridges', hueBridgesProvider);
}

function refreshStateBarText() {
  if (global.connected) {
    if (global.enabled) {
      statusBarItem.text = `$(light-bulb) Hue Code ($(radio-tower) ${configuration.selectedLightGroup})`;
    } else {
      statusBarItem.text = '$(light-bulb) Hue Code (Disabled)';
    }
  } else {
    statusBarItem.text = '$(light-bulb) Hue Code (Disconnected)';
  }
}

function registerStatusBar() {
  statusBarItem.command = 'huecode.displayMenu';
  statusBarItem.tooltip = 'Click to view Hue Code menu.';
  statusBarItem.show();
}


async function loadHueResources() {
  getBridges();
  global.lights = await hueLightsRepository.getLights();
  global.sensors = await hueSensorsRepository.getSensors();

  global.groups = await hueGroupsRepository.getGroups();
  
  if (configuration.selectedLightGroup) {
    if (!getSelectedGroup()) {
      configuration.selectedLightGroup = null;
      global.enabled = false;
      vscode.window.showErrorMessage('Selected light group not available.');
    }
  }

  // Refresh providers
  hueGroupsProvider.refresh();
  hueLightsProvider.refresh();
  hueBridgesProvider.refresh();
  hueSensorsProvider.refresh();
}

async function testConnection() {
  if (configuration.bridgeIp && configuration.userId) {
    try {
      await loadHueResources();

      if (getSelectedGroup()) {
        const lightsIds = getSelectGroupLightIds();
        await hueService.doubleFlash(lightsIds, 'blue');
      }
      global.connected = true;
    } catch (error) {
      global.connected = false;
    }
  }
  refreshStateBarText();
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
async function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand('extension.sayHello', function () {
  // The code you place here will be executed every time your command is executed
  configuration.context = context;

  await testConnection();

  registerProviders();
  registerActivies();
  registerCommands(context);
  registerStatusBar();

  setInterval(loadHueResources, 30000);

  // context.subscriptions.push(items to dispose when deactivated);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
