const puppeteer = require('puppeteer');
const url = "https://subastas.boe.es/"

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
    await page.select('#ID_provincia','39')
    // Accion de click sobre el elemento HTML 'boton' dentro de 'input'
    await page.click('input.boton')
    // Espero a que el siguiente selector (los cuadros de los resultados) aparezca para poder hacer scraping una vez cargado
    await page.waitForSelector(".listadoResult ul li.resultado-busqueda")

    //  Analisis de la referencia de cada oferta y el resto, iterando en los resultados
    const rows = await page.$$(".listadoResult ul li.resultado-busqueda");

    console.log(`Subastas activas: ${rows.length}`)
    for (let i=0; i<rows.length; i++){
        const row = rows[i]
        const numSubasta = await row.$eval("h3", element => element.innerText)
        const estado = await row.$eval("p:nth-of-type(1)", element => element.innerText)
        console.log(numSubasta)
        console.log(estado)
        console.log("\n")
    }


    // Close browsers   
    // browser.close();
}

// Run the function
run();