# minecraftHawkEye
Minecraft bot for equations when shooting an arrow

This program / bot is based on <a href="https://github.com/PrismarineJS/mineflayer" target="_blank">mineflayer</a> repository

Everyone:
- Get huge data from shootouts.
- Get the data of the parabolic arrow (all parabollic data)
- When you have clear data to obtain the "gravity" equation for arrows

Done
- Bot can shoot an arrow
- Bot shoot arrows and get start / end points and time


Install:
- Install Novde version 10+
- Install Git
- git clone https://github.com/sefirosweb/minecraftHawkEye.git
- cd minecraftHawkEye
- npm install
- node index.js

Usage:

Please change config.js data for access to your server,

```js
module.exports = {
    port: 22222,
    host: 'XXXX',
    usernameA: 'Archer',
    usernameB: "Looker"
};
```
Go to:
X=> 0
Y=> 3
Z=> 0

Clear area or use a plain world (see screenshots)

- node index.js

In world give a bow + arrows:
/give Archer bow{Enchantments:[{id:unbreaking,lvl:100}]} 1
/give Archer minecraft:arrow 6000

And done, the bots fires automatically and change the grade of 0,01 every shot until 90º the they reset to 0º
