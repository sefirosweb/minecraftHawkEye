# minecraftHawkEye
Minecraft bot for equations when shooting an arrow

This program / bot is based on <a href="https://github.com/PrismarineJS/mineflayer" target="_blank">mineflayer</a> repository

Install:
- Install nodejs >= 14 from nodejs.org
- npm i minecrafthawkeye

Usage: 

First load mineflayer and minecrafthawkeye, and load plugin into mineflayer
```js
const mineflayer = require('mineflayer')
const minecraftHawkEye = require('minecrafthawkeye');
bot.loadPlugin(minecraftHawkEye)
const weapon = 'bow'
```

Now you can request functions
```js
// Get an a player entity:
const playerEntity = bot.hawkEye.getPlayer(playername) // If emtpy return first player found
// Auto attack every 1,2 secs to target
bot.hawkEye.autoAttack(target, weapon) // You can put blockPosition, see example,
// Stop auto attack
bot.hawkEye.stop()
// One Shot
bot.hawkEye.oneshot(target, weapon)

// Get Yaw and Pitch
bot.hawkEye.getMasterGrade(target, speed, weapon) // speed (Vec3) if optional, but this is use for calc the intersection between arrow and new target position

// Simple one shot you need to put manually Yaw and Pitch
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
    bot.chat('/give ' + bot.username + ' bow{Enchantments:[{id:unbreaking,lvl:3}]} 1')
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

    weapon = 'bow'
    // Auto attack every 1,2 secs until target is dead or is to far away
    bot.hawkEye.autoAttack(target, weapon)
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

## Valid list of weapons or items that can calculate the perfect shot or launch it directly
```js
const validWeapons = ['bow', 'crossbow', 'snowball', 'ender_pearl', 'egg', 'splash_potion', 'trident']
```

I'm glad I can help you, do we help each other?

# TODOs
No TODOs!
Anyone have more ideas? :D
* Maybe create a best documentation =P

