var fs = require('fs');
var fse = require('fs-extra');
var gfm = require('get-module-file');
var pkginfo = require('pkginfo')(module, 'dependencies');

module.exports = function publish(path) {

  var package_json = JSON.parse(fse.readFileSync('package.json', 'utf8'));
  var readme = 'README.md';
  var localDocs = './docs/index.md';

  // Copy the project README to ./docs/index.md - this is your jumping-off point
  fse.copySync(readme, localDocs);

  // Copy dependency skill READMEs into dependency-named sub-dirs as index.md files
  // and as we go, remember the descriptions from each project, to be inserted
  // into the main page (./docs/index.md)
  var dependencyIds = Object.keys(package_json.dependencies);
  var mainLinkSection = "";
  var description = null;
  var currentDependency = "";
  var node_modules = './node_modules';

  console.log(dependencyIds);

  for (i = 0; i < dependencyIds.length; i++) {
    currentDependency = dependencyIds[i];
    console.dir("currentDependency: " + currentDependency);
    // TODO: below line hangs if no .node_modules is found.  
    // Need to handle this and give an error message saying "Please run npm install."
    var readmeFile = gfm.sync(node_modules, currentDependency, readme); 

    console.dir("Got current readme: " + readmeFile);

    if (readmeFile != false) {
      console.dir("There is a readme file to publish.");
      fse.copySync(readmeFile, './docs/' + currentDependency + '/index.md');
      console.dir("Published skill's ReadME file to the docs folder: " + readmeFile);
    }  else {
      console.dir("No index.md file found to publish for " + readmeFile);
    }

    // Get the description of the current dependency from it's package.json (for use in the main page link text)
    var dependencyPackageFileLoc = gfm.sync(node_modules, currentDependency, 'package.json');

    var file = fs.readFileSync(dependencyPackageFileLoc, 'utf8');
    var matches = file.match(/"description": "[a-zA-Z0-9 :\/()-]*"/);

    if (matches[0] != null) {
      description = JSON.parse('{' + matches[0] + '}')["description"];
    }
    else if (description == null) {
      description = currentDependency;
    }

    mainLinkSection += "  * [" + description + "](./" + currentDependency + ")\n";

    console.dir("Published and post-processed all skills");

  }

}
