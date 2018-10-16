var fs = require('fs');
var path = require('path');

const options = {
    tasks: { strategy: 'in-process' },
    extensions: {
        assets: {
            enable:true,
            // wildcard pattern for accessible linked or external files
            allowedFiles: "**/**.css",
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
    allowLocalFilesAccess:true,
    autoTempCleanup: false,
    loadConfig: false,
    dataDirectory: path.join(__dirname, 'data'),
    connectionString: { 'name': 'fs' }
}


const htmpTmpl = fs.readFileSync(path.join(__dirname, "/report.tmpl.html"), "utf8");
const jsReport = require('jsreport-core')(options);
jsReport.use(require('jsreport-handlebars')());
jsReport.use(require('jsreport-phantom-pdf')());
jsReport.use(require('jsreport-fs-store')());
jsReport.use(require('jsreport-assets')());

const jsReportService = function () {

    //#region Private Member variables
    //#endregion Private Member variables

    //#region Private Methods

    const _renderReport = function (data) {
        return jsReport.init().then(function () {
            return jsReport.render({
                template: {
                    content: htmpTmpl,
                    engine: 'handlebars',
                    recipe: 'phantom-pdf',
                    phantom: {

                        header: "<center><h3 style='color:rgba(105, 120, 130, 0.8)'>HF 990013</h3></center>",

                        footer: "<span id='pageNumber'>Página {#pageNum}</span><script type='text/javascript'> var elem = document.getElementById('pageNumber'); console.log('elem : '+elem); if (parseInt(elem.innerHTML) <= 3) { //hide page numbers for first 3 pages elem.style.display = 'none'; }</script>",
                    }
                },
                foo:'tews',
                data:{
                    trasactions:[{
                        transaction_id:0,
                        transaction_datetime: new Date().toISOString(),
                        credit_card_flag:"",
                        transaction_value:100,
                        fee:"2%",
                        discount:"2,0",
                        net_value:10
                    }]
                }
            })
                .then(function (resp) {
                    // console.log(resp.content.toString());
                    fs.writeFileSync('report1.pdf', resp.content);
                })
                .catch(e => {
                    console.log("Cannot render.");
                    console.error(e);
                    throw e;
                })
        }).catch(e => {
            console.error("Cannot init.");
            throw e;
        });
    };

    //#endregion Private Methods

    //#region Export to the public namespace only properties / methods we want to be public, leave the private ones hidden.

    return {
        renderReport: _renderReport,
    };

    //#endregion Export to the public namespace only properties
};

//module.exports = jsReportService;

jsReportService().renderReport()