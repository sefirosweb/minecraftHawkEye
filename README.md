# minecraftHawkEye
Module for the Minecraft bot, hit 100% of the time with the bow, using the equations of parabolic shooting with friction

This module is based on bot of <a href="https://github.com/PrismarineJS/mineflayer" target="_blank">mineflayer</a> repository

This calculate the trajectory of arrow / snowballs... to ensure which is the best angle to hit,

They can hit from 120 blocks away!

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
// Get an a entity
// Example get te player entity, If emtpy return first player found
const playerEntity = bot.hawkEye.getPlayer(playername) 

// Auto attack every 1,2 secs to target
bot.hawkEye.autoAttack(target, weapon)

// Stop auto attack
bot.hawkEye.stop()

// Fire only 1 shot
bot.hawkEye.oneshot(target, weapon)

// Otherwise you can get Yaw and Pitch
bot.hawkEye.getMasterGrade(target, speedInVec3, weapon)
// With Yaw and Pitch you can use yourself bot.look(yaw,pitch) adn activate / deactivate main hand to fire


// Similar has oneshot but need yo add manually the Pitch and Way in radians
bot.hawkEye.simplyShot(yaw, pitch)

// If you want the result of calculation of arrow trajectory you can use that
bot.hawkEye.calculateArrowTrayectory(currentPosition, currentSpeed, pitch, yaw, 'bow')

// Start to check if any player / mob or any incoming to bot
// CAUTION: This use a lot of CPU, because on each tick game calculate all nearby mobs or players
bot.hawkEye.startRadar()
bot.hawkEye.stopRadar()

// Return a array of mobs & players are looking in your direction
bot.hawkEye.detectAim()

// Return list of arrows are in "air" just now
bot.hawkEye.detectProjectiles()


```

A example in one file:

```js
// ** Grant OP to Archer **
// file: example.js
const mineflayer = require('mineflayer')
const minecraftHawkEye = require('minecrafthawkeye');
const Vec3 = require('Vec3')

const bot = mineflayer.createBot({
    host: process.argv[2] ? process.argv[2] : 'localhost',
    port: process.argv[3] ? parseInt(process.argv[3]) : 25565,
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
                  position: new Vec3(244.5, 75.5, -220),
                  isValid: true
              }
          // bot.hawkEye.oneShot(blockPosition);
          // bot.hawkEye.autoAttack(blockPosition);
      */
})
```
All is done, when is attack mode they get best possibility for impact, and shot arrow every 1,2 secs (max power)

## Valid list of weapons or items that can calculate the perfect shot or launch it directly
```
bow
crossbow
snowball
ender_pearl
egg
splash_potion
trident
```

Events:

When but uses autoAttack and the mob is gone (killed o dissapeared)
```ts
bot.on('auto_shot_stopped', (target: Entity | OptionsMasterGrade) => {
    ///
})
```
When radar is active and some player or mob are aim you dispatch this event
```ts
bot.on('target_aiming_at_you', (entity: Entity, arrowTrajectory: Array<Vec3>) => {
    ///
})
```
When radar is active and When arrow are incoming and can be hit bot this event is dispatched
```ts
bot.on('incoming_projectil', (projectil: Projectil, arrowTrajectory: Array<Vec3>) => {
    ///
})
```

I'm glad I can help you, do we help each other?

# Videos:
https://www.youtube.com/watch?v=InMkncDnYTA

https://www.youtube.com/watch?v=jjl4mMyL7hk

https://www.youtube.com/watch?v=OHX3u8Nrrp8

https://www.youtube.com/watch?v=VKg5xiww5Lo

# TODOs
No TODOs!
Anyone have more ideas? :D
