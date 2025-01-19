const fs = require('fs');
const path = require('path');

function loadCommands(bot) {
  const commandList = path.join(__dirname, '../commands');

  fs.readdirSync(commandList).forEach(file => {
    if (file.endsWith('.js')) {
      const command = require(path.join(commandList, file));
      command(bot);
      console.log(`${file} - успешно загружено.`);
    }
  });
}

module.exports = loadCommands;
