"use strict";
const path = require("path");
const configOptions = {
  templatingEngines: {
    strategy: "in-process",
    timeout: 50000,
    allowedModules: ["*"]
  },
  extensions: {
    assets: {
      enable: true,
      // wildcard pattern for accessible linked or external files
      allowedFiles: "**/**.*",
      // enables access to files not stored as linked assets in jsreport store
      searchOnDiskIfNotFoundInStore: true,
      // root url used when embedding assets as links {#asset foo.js @encoding=link}
      rootUrlForLinks: ".",
      // make all assets accessible to anonymous requests
      publicAccessEnabled: true
    }
  },
  phantom: {
    allowLocalFilesAccess: true
  },
  logger: {
    console: { transport: "console", level: "debug" },
    file: {
      transport: "file",
      level: "info",
      filename: "logs/jsreport.log.txt"
    },
    error: {
      transport: "file",
      level: "error",
      filename: "logs/jsreport.error.txt"
    }
  },
  allowLocalFilesAccess: true,
  autoTempCleanup: true,
  loadConfig: false,
  dataDirectory: path.join(__dirname, "data")
};


module.exports = () => configOptions;