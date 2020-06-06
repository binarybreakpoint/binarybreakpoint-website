// ==UserScript==
// @name         Clip Zipper
// @namespace    http://binarybreakpoint.win
// @version      0.2
// @description  Downloads Clip attachments as a single zip file
// @author       X
// @match        https://clip.unl.pt/utente/*/documentos*
// @grant        none
// ==/UserScript==

(function() {
    let totalCount = 0;
    let downloadCount = 0;
    let zip = null;

    //JsZip to zip the files, FileSaver to download it
    $.getScript("https://stuk.github.io/jszip/dist/jszip.js");
    $.getScript("https://stuk.github.io/jszip-utils/dist/jszip-utils.js");
    $.getScript("https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js");

    //eg."Análise Matemática - Acetatos.zip"
    function getZipName(){
        let $selections = $(".barra_de_escolhas .seleccionado")
        let $category = $selections.eq($selections.length - 1);
        let categoryName = $category.text().split(/\s*\(\d+\)/)[0];
        let className = $("a[href*='/unidade_curricular']").eq(0).text();
        let year = $("table td:first-child[bgcolor='#aaaaa0']").text();
        return className+" ("+year+") - "+categoryName+".zip";
    }

    function download(zip) {
        zip.generateAsync({type: "blob"})
            .then((blob)=>{
                saveAs(blob, getZipName());
            })
            .catch((err)=>{
                alert("Erro a fazer download do zip");
                console.error(err);
            })
    };

    //decodes either Unicode Decimal or ISO-8859
    function properDecode(str){
        try { return $('<div>').html(decodeURIComponent(str)).text();}
        catch (e){ return unescape(str) }
    }

    function addFile(url) {
        let name = properDecode(url.split("&oin=").pop());

        fetch(url)
            .then(resp => resp.blob())
            .then(blob => zip.file(name, blob))
            .catch((err) => {
                alert('Não foi possível adicionar o ficheiro ' + name)
            })
            .finally(()=>{
                if (++downloadCount == totalCount) download(zip);
                $("#down-count").text(downloadCount);
            })
    }

    function getAllFiles() {
        let $files = $('tt[title="Ver/Abrir"]');
        zip = new JSZip();
        totalCount = $files.length;
        downloadCount = 0;

        $files.each(function() {
            let url = $(this).parent().attr("href");
            addFile(url);
        })
        $("#download-progress").show();
        $("#total-count").text(totalCount);
        $("#down-count").text(downloadCount);
    }

    function addHTML() {
        let $header = $("th.center[colspan='6'][bgcolor='#95AEA8']");
        if ($header.length) {
            $header.append("<a href='#' id='download-all-btn'>(Download todos)</a>" +
                "<p class='hidden' id='download-progress'><span id='down-count'></span>/<span id='total-count'></span> Ficheiros descarregados...</p>");
            $header.find('#download-all-btn').click(getAllFiles);
            $("#download-progress").hide();
        }
    }

    addHTML();

})();
