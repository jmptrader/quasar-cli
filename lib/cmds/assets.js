'use strict';

var
  fs = require('../file-system'),
  _ = require('lodash'),
  files = {
    page: [
      ['/config.', '.yml'],
      ['/css/style.', '.styl', true],
      ['/html/view.', '.html', true],
      ['/js/script.', '.js']
    ],
    layout: [
      ['/layout.', '.html', true],
      ['/layout.', '.js']
    ]
  };

function renameAsset(assetType, oldName, newName) {
  var
    returnValue = 0,
    src = fs.getPathToFolderFromApp('src/' + assetType + 's/' + oldName),
    dest = fs.getPathToFolderFromApp('src/' + assetType + 's/' + newName)
    ;

  /* istanbul ignore if */
  if (fs.move(src, dest)) {
    return 1;
  }

  _.forEach(files[assetType], function(file) {
    if (returnValue) {
      return;
    }

    if (file[2]) {
      if (
        fs.exists(dest + file[0] + oldName + file[1]) &&
        fs.move(dest + file[0] + oldName + file[1], dest + file[0] + newName + file[1])
      ) {
        returnValue = 1;
        return;
      }
    }
    else if(fs.move(dest + file[0] + oldName + file[1], dest + file[0] + newName + file[1])) {
      returnValue = 1;
      return;
    }
    if (
      fs.exists(dest + file[0] + oldName + file[1]) &&
      fs.move(dest + file[0] + oldName + file[1], dest + file[0] + newName + file[1])
    ) {
      returnValue = 1;
      return;
    }
  });

  if (assetType === 'layout') {
    var
      data,
      nodefs = require('fs'),
      filename = dest + '/layout.' + newName + '.js'
      ;

    data = nodefs.readFileSync(filename, 'utf8');

    nodefs.writeFileSync(
      filename,
      data.replace(new RegExp('layout.' + oldName + '.html', 'g'), 'layout.' + newName + '.html'),
      'utf8'
    );
  }

  return returnValue;
}

function create(assetType, program, name) {
  var
    src = fs.getPathToAsset(assetType),
    dest = fs.getPathToFolderFromApp('src/' + assetType + 's/'),
    title = _.capitalize(assetType)
    ;

  if (fs.exists(dest + '/' + name)) {
    program.log.error(title + ' already exists.');
    return 1;
  }

  program.log.info('Generating Quasar App ' + title + '...');

  /* istanbul ignore next */
  if (fs.copy(src, dest)) {
    program.log.error('Cannot copy files.');
    return 1;
  }

  program.log.success('Template copied.');

  /* istanbul ignore next */
  if (renameAsset(assetType, '___' + assetType + '___', name)) {
    program.log.error('Cannot rename ' + title + ' template.');
    fs.remove(fs.getPathToFolderFromApp('src/' + assetType + 's/___' + assetType + '___'));
    return 1;
  }

  program.log.success('Quasar ' + title, name.green, 'created.');
  return 0;
}

function rename(assetType, program, oldName, newName) {
  var
    src = fs.getPathToFolderFromApp('src/' + assetType + 's/' + oldName),
    dest = fs.getPathToFolderFromApp('src/' + assetType + 's/' + newName),
    title = _.capitalize(assetType)
    ;

  if (!fs.exists(src)) {
    program.log.error(title + ' does not exists.');
    return 1;
  }
  if (fs.exists(dest)) {
    program.log.error(title + ' with new name already exists.');
    return 1;
  }

  program.log.info('Renaming Quasar App ' + title + '...');

  /* istanbul ignore next */
  if (renameAsset(assetType, oldName, newName)) {
    program.log.error('Cannot rename App ' + title + '.');
    return 1;
  }

  program.log.success('Quasar', title, oldName.green, 'renamed to', newName.green, '.');
  return 0;
}


module.exports = {
  create: create,
  rename: rename
};