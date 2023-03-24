This app allows the user to scrape prod for a brand and have live-updates while working on a new asset file that is injected into the html for the prod page, and auto refreshed on save. 

When the build/watch script is ran, you're prompted for your final server path, ex) `content/seasonal-content/landing-pages...` and your asset is automatically built to work on staging - relative image/src/link paths are transformed to the proper format.

For example: 

This: `<link rel="stylesheet" href="http://127.0.0.1:8182/styles/style.css" />`

Will become this: `<link rel="stylesheet" href="your/path/to/the/server/styles/style.css?$staticlink$" />`


In short, this allows for live reload while working on any asset. No more copy/pasting code from your editor to DW to see changes. That means the ability to use sass, even for simple things like promo tabs, and have it auto compile to css - just upload the built html file to DW when you're done. This also makes working with JS much easier - just save your file to see changes. 

Overall, this app:

1. Asks the user for the page and part of the page (full lp, promo tab, etc.) they're working on.
2. Sends a GET request to the URL of that page and saves the response HTML to a local file.
3. Writes an empty HTML file for the new asset to be worked on.
4. Watches for changes to the new asset file and replaces a selected section of the local HTML file with the new asset file's HTML on file change.
6. Starts two instances of live-server, one for the local HTML file and one for the "src" folder.
  
This allows for assets to be built using all relativepaths, that are then transformed to staging paths when thebuild script is ran. 

- Must use node 16.0.0 or higher

## To do

- [x] Make is so page is selected just by pasting a url
- [ ] Add more section options
- [ ] Create script alias to run from the root
- [x] Create build script that transforms all links to DW links
- [ ] Allow for hardcoded staging or prod links prior to build/watch
