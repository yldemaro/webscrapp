const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
// const cnx = require("./conex_mysql");

const PORT = process.env.PORT || 5000;

const app = express();

// app.use("/", express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
  res.send("Hola mundo")
})

app.post("/screenshot", async (req, res) => {
  // console.log(req.body);

  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--disable-extensions"],
  });
  const page = await browser.newPage();
  await page.goto(req.body.url);

  const allResultsSelector = "body";

  await page.waitForSelector(allResultsSelector, {
    visible: true,
  });

  const resultsSelector =
    'pre[style="word-wrap: break-word; white-space: pre-wrap;"]';
  await page.waitForSelector(resultsSelector);

  const textoHtml = await page.evaluate((resultsSelector) => {
    const contentHtml = Array.from(document.querySelectorAll(resultsSelector));
    return contentHtml.map((content) => {
      const contenido = content.textContent.trim();
      return contenido;
    });
  }, resultsSelector);

  let resJSON = JSON.parse(textoHtml);

  var urlImagen = "";

  urlImagen = resJSON.tradeMark?.markImageURI;
  console.log(urlImagen);

  if (urlImagen != undefined) {
    var viewSource = await page.goto(urlImagen);

    const allResultsSelector2 = "body";
    await page.waitForSelector(allResultsSelector2, {
      visible: true,
    });

    const resultsSelector2 = "img";
    await page.waitForSelector(resultsSelector2);

    fs.writeFile(
      "./public/imagenes/" + req.body.exp + ".jpeg",
      await viewSource.buffer(),
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }
    );
  }

  const carpeta = "public/" + req.body.codPais + "/2022-79/";
  const nameFileJson = carpeta + req.body.exp + ".json";
  fs.writeFileSync(nameFileJson, JSON.stringify(resJSON));

  res.json({
    success: true,
    id: req.body.exp,
    nameFileJson,
    urlImagen: urlImagen || "",
  });
});

app.listen(PORT, () => {
  // cnx.conectar();
  console.log("server has started in port ", PORT);
});
