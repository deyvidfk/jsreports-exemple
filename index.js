const fs = require('fs');
const path = require('path');
const htmpTmpl = fs.readFileSync(path.join(__dirname, "/report.tmpl.html"), "utf8");
const jsReportOptions = {
    tasks: { strategy: 'in-process' },
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
        console: { transport: "console", "level": "debug" }
    },
    allowLocalFilesAccess: true,
    autoTempCleanup: false,
    loadConfig: false,
    dataDirectory: path.join(__dirname, 'data'),
    connectionString: { 'name': 'fs' }
};

const jsReport = require('jsreport-core')(jsReportOptions);
jsReport.use(require('jsreport-handlebars')());
jsReport.use(require('jsreport-phantom-pdf')());
jsReport.use(require('jsreport-fs-store')());
jsReport.use(require('jsreport-assets')());

const jsReportService = function () {

    //#region Private Member variables
    //#endregion Private Member variables

    //#region Private Methods

    const _renderReport = async function (parameters, pageArgs) {

        try {

            await jsReport.init();

            const reportResponse = await jsReport.render({
                template: {
                    content: htmpTmpl,
                    engine: 'handlebars',
                    recipe: 'phantom-pdf',
                    phantom: {
                        header: `<center><h3 style='color:rgba(105, 120, 130, 0.8)'>${pageArgs.header.title}</h3></center>`,
                        footer: "<span id='pageNumber'>Página {#pageNum}</span><script type='text/javascript'> var elem = document.getElementById('pageNumber'); console.log('elem : '+elem); if (parseInt(elem.innerHTML) <= 3) { //hide page numbers for first 3 pages elem.style.display = 'none'; }</script>",
                    }
                },                
                data: parameters
            });

            fs.writeFileSync(`${pageArgs.fileName}.pdf`, reportResponse.content);

            return reportResponse;

        } catch (error) {

            console.log("Cannot render.");
            console.error(error);
            throw e;
        }
    };

    //#endregion Private Methods

    //#region Export to the public namespace only properties / methods we want to be public, leave the private ones hidden.

    return {
        renderReport: _renderReport,
    };

    //#endregion Export to the public namespace only properties
};

//module.exports = jsReportService;


const it = [];

for (let index = 0; index < 40; index++) {
    it.push(
        {
            id: index,
            datetime: new Date().toISOString(),
            creditCardFlag: "",
            value: 100,
            fee: "2%",
            discount: "2,0",
            netValue: 10
        })
}

jsReportService().renderReport({
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    issueDate: new Date().toISOString(),
    operator: {
        name: "STONE"
    },
    company: {
        cnpj: "23213213213123",
    },
    transactionCount: 2,
    sales: {
        totalsPerColumns: {
            transactionValue: 100,
            fee: "2%",
            discount: "2,0",
            netValue: 10
        },
        trasactions: [{
            flag: "MasterCard",
            totalsPerColumns: {
                transactionValue: 100,
                fee: "2%",
                discount: "2,0",
                netValue: 10
            },
            items: [
                {
                    id: 0,
                    datetime: new Date().toISOString(),
                    creditCardFlag: "",
                    value: 100,
                    fee: "2%",
                    discount: "2,0",
                    netValue: 10
                }
            ]
        },
        {
            flag: "VISA",
            totalsPerColumns: {
                transactionValue: 100,
                fee: "2%",
                discount: "2,0",
                netValue: 10
            },
            items: it
        }]
    }
},{
    fileName:"7GAS - Relatório Financeiro II",
    header:{
        title:"7GAS - Relatório Financeiro II"
    }
})