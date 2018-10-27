"use strict";

const fs = require("fs");
const path = require("path");
let Handlebars = require("handlebars");
let helpers = require("handlebars-helpers")({
  handlebars: Handlebars
});
let HandlebarsIntl = require("handlebars-intl");
HandlebarsIntl.registerWith(Handlebars);

const jsReportOptions = {
  templatingEngines: {
    strategy: "in-process",
    timeout: 50000,
    allowedModules: ["*"]
  },
  extensions: {
    "scripts": {
      "timeout": 30000,
      "allowedModules": "*" 
    },
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
    console: { transport: "console", level: "debug" }
  },
  allowLocalFilesAccess: true,
  autoTempCleanup: true,
  loadConfig: false,
  dataDirectory: path.join(__dirname, "data"),
};

const jsReport = require("jsreport-core")(jsReportOptions);
jsReport.use(require("jsreport-handlebars")());
jsReport.use(require("jsreport-phantom-pdf")());
jsReport.use(require("jsreport-fs-store")());
jsReport.use(require("jsreport-assets")());

const jsReportService = function() {
  //#region Private Member variables
  //#endregion Private Member variables

  //#region Private Methods

  const _renderReport = async function(parameters, pageArgs) {
    try {
      await jsReport.init();

      const reportResponse = await jsReport.render({
        template: {
          content: pageArgs.templateContent,
          engine: "handlebars",
          recipe: "phantom-pdf",
          helpers: `
          const handlebars = require('handlebars');

          const helpers = require('handlebars-helpers')({
            handlebars: handlebars
          });

          const HandlebarsIntl = require('handlebars-intl');
        `,
          phantom: {
            header: `<center><h3 style='color:rgba(105, 120, 130, 0.8)'>${
              pageArgs.header.title
            }</h3></center>`,
            footer:
              "<span id='pageNumber'>Página {#pageNum}</span><script type='text/javascript'> var elem = document.getElementById('pageNumber'); console.log('elem : '+elem); if (parseInt(elem.innerHTML) <= 3) { //hide page numbers for first 3 pages elem.style.display = 'none'; }</script>"
          }
        },
        data: parameters
      });

      fs.writeFileSync(`${pageArgs.reportName}.pdf`, reportResponse.content);

      return reportResponse;
    } catch (error) {
      console.log("Cannot render.");
      console.error(error);
      throw e;
    }
  };

  return {
    renderReport: _renderReport
  };
};

const htmpTmplTmpl = fs.readFileSync(
  path.join(__dirname, "templates/7gas_relatório_financeiro_II.tmpl.html"),
  "utf8"
);

var payload = JSON.parse(fs.readFileSync("data.json", "utf8"));

jsReportService().renderReport(
  Object.assign(payload, {
    stringify: JSON.stringify(payload)
  }),
  {
    reportName: "output/7GAS - Relatório Financeiro II",
    templateContent: htmpTmplTmpl,
    header: {
      title: "7GAS - Relatório Financeiro II"
    }
  }
);
