const path = require("path")
const os = require('os')
module.exports = async (kernel) => {
  const platform = os.platform()
  const graphics = await kernel.system.graphics()
  const vendor = graphics.controllers[0].vendor
  let setup
  if (platform === "darwin") {
    setup = [{
      method: "shell.run",
      params: { message: "brew install cmake protobuf rust python@3.10 git wget", },
      //params: { message: "brew install protobuf rust wget", },
    }, {
      method: "shell.run",
      params: { message: "git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui automatic1111", path: path.resolve(__dirname) },
    }]
  } else {
    if (/amd/i.test(vendor)) {
      if (platform === 'win32') {
        setup = [{
          method: "shell.run",
          params: { message: "git clone https://github.com/lshqqytiger/stable-diffusion-webui-directml.git automatic1111", path: __dirname }
        }]
      } else {
        setup = [{
          method: "shell.run",
          params: { message: "git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui automatic1111", path: __dirname },
        }]
      }
    } else {
      setup = [{
        method: "shell.run",
        params: { message: "git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui automatic1111", path: __dirname },
      }]
    }
  }

  let run = setup.concat([{
    "uri": "./index.js",
    "method": "config",
    "params": {
      "legacy": true
    }
  }, {
    "method": "shell.start",
    "params": {
      "path": "automatic1111",
      "env": {
        "HF_HOME": "../huggingface"
      },
    }
  }, {
    "method": "shell.enter",
    "params": {
      "message": "{{os.platform() === 'win32' ? 'webui-user.bat' : 'bash webui.sh -f'}}",
      "on": [{
        "event": "/(http:\/\/[0-9.:]+)/",
        "return": "{{event.matches[0][1]}}"
      }]
    }
  }, {
    "method": "local.set",
    "params": {
      "url": "{{input}}"
    }
  }, {
    "method": "input",
    "params": {
      "title": "Install Success",
      "description": "Go back to the dashboard and launch the app!"
    }
  }, {
    "method": "browser.open",
    "params": {
      "uri": "/?selected=Stable Diffusion web UI"
    }
  }])
  return { run }
}
