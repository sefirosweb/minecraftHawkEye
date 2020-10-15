# minecraftHawkEye
Minecraft bot for equations when shooting an arrow

This program / bot is based on <a href="https://github.com/PrismarineJS/mineflayer" target="_blank">mineflayer</a> repository

Install:
- Install Novde version 10+
- npm i minecrafthawkeye


Usage: 

First load mineflayer and minecrafthawkeye, and load plugin into mineflayer
```js
const mineflayer = require('mineflayer')
const minecraftHawkEye = require('minecrafthawkeye');
bot.loadPlugin(minecraftHawkEye)
```

Now you can request functions
```js
// Get an a player entity:
const playerEntity = bot.hawkEye.getPlayer(playername) // If emtpy return first player found
// Auto attack every 1,2 secs to target
bot.hawkEye.autoAttack(target) // You can put blockPosition, see example,
// Stop auto attack
bot.hawkEye.stop()
// One Shot
bot.hawkEye.autoAttack(target)

// Get Yaw and Pitch
bot.hawkEye.getMasterGrade(target, speed) // speed (Vec3) if optional, but this is use for calc the intersection between arrow and new target position

// Simple one shot to Yaw and Pitch
bot.hawkEye.simplyShot = function (yaw, pitch) // Pitch = Grades in radians
```

A simply example in one file:

```js
// file: example.js
const mineflayer = require('mineflayer')
const minecraftHawkEye = require('minecrafthawkeye');

const bot = mineflayer.createBot({
    host: process.argv[2],
    port: parseInt(process.argv[3]),
    username: process.argv[4] ? process.argv[4] : 'Archer',
    password: process.argv[5]
})
bot.loadPlugin(minecraftHawkEye)

bot.on('spawn', function() {
    bot.chat('/give ' + bot.username + ' bow{Enchantments:[{id:unbreaking,lvl:100}]} 1')
    bot.chat('/give ' + bot.username + ' minecraft:arrow 300')
    bot.chat('/time set day')
    bot.chat('/kill @e[type=minecraft:arrow]')

    bot.chat('Ready!')

    // Get target for block position, use whatever you need
    const target = bot.hawkEye.getPlayer()
    console.log(target)
    if (!target) {
        return false
    }

    // Auto attack every 1,2 secs until target is dead or is to far away
    bot.hawkEye.autoAttack(target)
        // If you force stop attack use:
        // hawkEye.stop();

    // Use one shot time with calc:
    // bot.hawkEye.oneShot(target);

    // If you want to shot in XYZ position:
    /*
          const blockPosition = {
                  position: {
                      x: 244.5,
                      y: 75.5,
                      z: -220
                  },
                  isValid: true // Fake to is "alive"
              }
          // bot.hawkEye.oneShot(blockPosition);
          // bot.hawkEye.autoAttack(blockPosition);
      */
})
```

In world give a bow + arrows: \
/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1 \
/give Archer minecraft:arrow 6000

All is done, when is attack mode they get best posibilty for impact, and shot arrow every 1,2 secs (max power)

I'm glad I can help you, do we help each other?

