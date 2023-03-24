import fs from "fs";
import axios from "axios";
import cheerio from "cheerio";
import chokidar from "chokidar";
import prompts from "prompts";
import liveServer from "live-server";
import questions from "./questions.js";
import config from "./config.js";
import * as normalize from "./normalize.js";

//wait for user input from questions.js
const response = await prompts(questions);

const pageUrl = response.url;
const assetName = response.assetName;
const sectionOption = response.customSectionOption ?? response.sectionOption;


const findBaseUrl = (url) => {
  return url.origin;
};

const baseUrl = findBaseUrl(new URL(pageUrl));

//find the host from the url
const findPageHost = (url) => {
  return url.hostname.replace("https://", "");
};

const pageHost = findPageHost(new URL(baseUrl));

// Modify the headers object of requestOptions to update pageHost
config.requestOptions.headers.host = pageHost;

const fetchHtml = async () => {
  if (!fs.existsSync("../src")) {
    fs.mkdirSync("../src");
  }
  try {
    const response = await axios.get(pageUrl, config.requestOptions);
    const baseHtml = response.data;
    const updatedHtml = normalize.normalizeLinks(baseHtml, baseUrl);
    fs.writeFileSync("LOCAL_PROD.html", updatedHtml);
    console.log("Creating new asset file");
    fs.writeFileSync(`../src/${assetName}.html`, "");
  } catch (error) {
    console.error(error);
  }
};

fetchHtml();


const replaceSection = (html, selector, newHtml) => {
  const $ = cheerio.load(html);
  $(selector).first().html(newHtml);
  return $.html();
};


// Function passed to chokidar to watch for file changes
const handleChange = (path) => {
  console.log(`File ${path} has been changed - updating html`);
  const localLp = fs.readFileSync("./LOCAL_PROD.html", "utf8");
  const newAsset = fs.readFileSync(`../src/${assetName}.html`, "utf8");
  const updatedHtml = replaceSection(localLp, sectionOption, newAsset);
  fs.writeFileSync("./LOCAL_PROD.html", updatedHtml);
};

//watch new asset for changes with chokidar
const watcher = chokidar.watch("../src", {
  persistent: true,
});

watcher.on("ready", () =>
  console.log("Initial scan complete. Ready for changes")
);
watcher.on("change", handleChange);


//TODO: add function to wait for local prod to exist
liveServer.start(config.serverParams.localProd);

//start live server for src folder
liveServer.start(config.serverParams.src);
