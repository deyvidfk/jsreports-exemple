"use strict";

const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
require("handlebars-helpers")({
  handlebars: Handlebars
});
const HandlebarsIntl = require("handlebars-intl");
HandlebarsIntl.registerWith(Handlebars);
const jsReportOptions = require("./jsreport.cofig.js")();
const jsReport = require("jsreport-core")(jsReportOptions);
jsReport.use(require("jsreport-handlebars")());
jsReport.use(require("jsreport-phantom-pdf")());
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
      throw error;
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
