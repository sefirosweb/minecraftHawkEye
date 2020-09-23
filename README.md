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

Noe
Please change data for access to your server,

```js
const bot = mineflayer.createBot({
    username: 'Archer',
    port: 54758
})
bot.loadPlugin(pathfinder)
const botChecker = mineflayer.createBot({
    username: 'Looker',
    port: 54758
})
```
