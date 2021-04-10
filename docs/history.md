## 1.2.7
* Added tridents! now you can trow tridents with perfect shot
## 1.2.6
* Great improve CPU optimization
    * Add prismarine-world for use a iterator function, check a raycast between each arrow position
    * Added in bow.js example with drawing raycast of each tick arrow position and blockcolision with iterator
## 1.2.5
* Fix grammar
## 1.2.4
* Added a arrowTrajectoryPoints in the result of getMasterGrade function
* Added example of arrow trayecotry preview on bow.js example
## 1.2.3
* Fixed bug with crossbow enchant
## 1.2.2
* Fixed oneShot (break from 1.2.1)
* Adding more supports!
    * Add snowball
    * Add ender pearl
    * Add splash potions
    * Add eggs
    * Added examples example
## 1.2.1
* Optimized crossbow speed, with enchant3 now is a machine gun!
* Optimized autoattack, now have 2 events separatly for optimize getGrades and Calculate if bow/crossbow is ready to shot
* Added crossbow example with enchant 3
    * Caution max echant lvl is 5 because more than 5 the time is negative! Formula => 1250 - ((lvl ? lvl : 0) * 250)
## 1.2
* Update packages dependency
## 1.1.0
* Important: Now getMasterGrade need a weapon for calculate! from: bot.hawkEye.getMasterGrade(bot, target, speed) to  bot.hawkEye.getMasterGrade(bot, target, speed, weapon)
* Adding crossbow support!
* Added example for use with crossbow
* Added in in autoAttack & oneShot default weapon bow (this must be use of example)
## 1.0.8
* Fixed bug on "small" targets (spiders), if the target is mob or player calculates the height and shot in the middle
* Fixed small bug from start arrow position, this cause some times wrong targets
* Added dynamic precission factor, when arrow is very near of target, split calculation to * 5, for avoid wrong grade calc
## 1.0.7
* Added docs/history.md
* No fixed bugs and methods
* Removed rubish code
* Standarized code (npx standard --fix)
## 1.0.6
* From: bot.hawkEye.getMasterGrade(bot, target, speed);
* To: bot.hawkEye.getMasterGrade(target, speed);
## 1.0.5
* Change bot to plugin method
## 1.0.4
* First functional version