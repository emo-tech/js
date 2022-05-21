const puppeteer = require('puppeteer');
const url = "https://www.baidu.com"

/*
// Pass URL as input parameters
const url = process.argv[2];
if (!url) {
    throw "Please provide a URL as the first argument";
}
*/

// Main function
async function run () {
    // Open browser and access URL
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    // Wait until it is loaded
    await page.goto(url, { waitUntil: 'networkidle2' });


    /****************************** Opcion 1: a través del mapa ***************************/
    /*
    const urlCantabria = await page.evaluate(() => {
        let provincias = document.querySelectorAll(".centrador #map area");
        let cantabria = Array.from(provincias).find(item => item.alt.includes('Cantabria'));
        return cantabria.href;
    })
    const pageCantabria = await browser.newPage();
    await pageCantabria.goto(urlCantabria);
    */

    /****************************** Opcion 2: a través del selector ***************************/
    // Uso el selector para buscar el elemento HTML con class=ID_provincia, y selecciono el item Nº39 (se podria también sacando el array y buscando por valor)
    // await page.select('#kw','39').

    // await page.evaluate(() => {
    // // document.getElementsByClassName('search-criteria-input').value = '';
    //     document.getElementById("kw").value = "";
    // });
    // await page.type('#kw', 'tesla', { delay: 10 });
    await page.type('#kw', 'tesla'); // 输入变慢，像一个用户
    // page.type('#kw', 'tesla', {delay: 1000}); // 输入变慢，像一个用户


    // Accion de click sobre el elemento HTML 'boton' dentro de 'input'
    await page.click('input[type="submit"]')
    
    // const resultListSelector = '#content_left div.new-pmd';
    const resultListSelector = '#content_left';

    // Espero a que el siguiente selector (los cuadros de los resultados) aparezca para poder hacer scraping una vez cargado
    await page.waitForSelector('#content_left div.new-pmd')

    //  Analisis de la referencia de cada oferta y el resto, iterando en los resultados
    const rows = await page.$$('#content_left div.new-pmd');

    console.log(rows)
    console.log(`result search: ${rows.length}`)



    for (let i=0; i<rows.length; i++) {
        try {
            const row = rows[i]
            const resultTitle = await row.$eval(".c-title", element => element.innerText)
            console.log(`第 ${i} 行的结果：`)
            console.log(`[${resultTitle}]`)
            // const estado = await row.$eval("p:nth-of-type(1)", element => element.innerText)
            // console.log(estado)
        console.log("\n")
        } catch (error) {
            console.log(error);
        }
        
    }


    // Close browsers   
    // browser.close();
}

// Run the function
run();