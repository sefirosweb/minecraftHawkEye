# minecraftHawkEye
Minecraft bot for equations when shooting an arrow

This program / bot is based on <a href="https://github.com/PrismarineJS/mineflayer" target="_blank">mineflayer</a> repository

Install:
- Install Novde version 10+
- npm i minecrafthawkeye


Usage: file.js server port username password

```
example.js youserver.es 12345
```

```js
// file: example.js

const mineflayer = require('mineflayer');
const { hawkEye, getPlayer } = require('minecrafthawkeye');

const bot = mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: process.argv[4] ? process.argv[4] : 'Archer',
    password: process.argv[5]
})

hawkEye.load(bot);

bot.on('spawn', function() {
    bot.chat('/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1');
    bot.chat('/give Archer minecraft:arrow 300');
    bot.chat('/time set day');
    bot.chat('/kill @e[type=minecraft:arrow]');

    bot.chat('Ready!');

    let target = getPlayer(bot);
    if (!target)
        return false;

    // Auto attack every 1,2 secs until target is dead or is to far away
    hawkEye.attack(target);

    // If you force stop attack use:
    // hawkEye.stop();
});

```

In world give a bow + arrows: \
/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1 \
/give Archer minecraft:arrow 6000

All is done, when is attack mode they get best posibilty for impact, and shot arrow every 1,2 secs (max power)

I'm glad I can help you, do we help each other?

