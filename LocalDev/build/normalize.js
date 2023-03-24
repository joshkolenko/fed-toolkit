
const normalizeLinks = (html, url) => {
  console.log("Updating relative links");
  const linkRegex = /(?<=href="|src=")\/[^"]*/g;
  return html.replace(linkRegex, `${url}$&`);
};

//TODO: add functions to remove unnecessary JS and HTML

// export all functions
export { normalizeLinks };
