import { sectionOptions } from "./config.js";

const sectionOptionChoices = Object.entries(sectionOptions).map(([title, value]) => ({
  title: title.split('_').join(' '),
  value
}));

const questions = [
  {
    type: "text",
    name: "url",
    message: "What is the url of the page you want to work on?",
  },
  {
    type: "select",
    name: "sectionOption",
    message: "Which section do you want to replace?",
    choices: [
      ...sectionOptionChoices,
      { title: "Custom", value: "custom_section_option" },
    ],
  },
  //if custom is selected, prompt for custom selector
  {
    type: prev => (prev === "custom_section_option" ? "text" : null),
    name: "customSectionOption",
    message: "What is the selector for the section you want to replace?",
  },
  {
    type: "text",
    name: "assetName",
    message: "What is the name of your new asset?",
  },
];

export default questions;