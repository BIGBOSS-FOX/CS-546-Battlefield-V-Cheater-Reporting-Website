## CS546 Final Project: Battlefield V Reporting Website ##

### Group Member:
- Cheng Liang
- Daniel Kramer
- Daoyuan Chen
- Divya Goalla
- Tahsin Yavuz

### GitHub Link:
https://github.com/cliang6/CS_546_Game_Cheater_Report

### Setup Guide:
1.  "npm install": Install all the modules
2.  "npm run-script seed": Seed the database with initial data
3.  "npm start": Start Web server

### User Guide:
- All initial users have a default Password: 123

- 3 admin accounts' usernames: (The inital 3 admins' usernames appeared in the presentation video were changed so that it's easier to identify them) 
    - admin1    (RIP "oX_-oBIGBOSS-FoX")
    - admin2    (RIP "OADF-SunnyJetTw")
    - admin3    (RIP "elementofprgress")

- Other initial accounts' usernames:
    - PrecisionWing
    - Lumen-NyaRuko
    - HeroLonely_PvP
    - CanadianMason
    - AGI4RexIegend01
    - 7gates_of_hell
    - Silk2g
    - _Ecli9seS7y
    - HuyaTV-11748951
    - MBT_Layzan
    - Lt-Zomb1e
    - Superiorities
    - HEHLL1225
    - SYM-Incarnate
    - FLOT-Crotan
    - leonid_47
    - AZGD-HungMammoth

- For visitors:
    - search any existing player
    - view cheater list
    - view player profile page
    - sign up a new account

- For logged-in players:
    - create report on any other player except yourself and admins
    - write comments on report
    - have 1 chance to appeal if you are deemed as a cheater by admins
    - change avatar

- For every admin:
    - have access to poll triggered by certain amount of reports
    - vote reported player "legit" or "suspicious" or "cheater"

- Cheater judgement:
    - There are total 5 status for normal player: "innocent", "processing", "legit", "suspicious", "cheater"
    - Every player starts with "innocent"
    - 1 report received will change status from "innocent" to "processing" and trigger a poll
    - Status stays "processing" until all 3 admins cast their votes
    - All 3 admins vote "cheater", the reported player's status will change from "processing" to "cheater"
    - All 3 admins vote "legit", the reported player's status will change from "processing" to "legit"
    - Other vote combination will change the reported player's status from "processing" to "suspicious"
    - If the player is in "cheater" status, he/she will have only 1 chance to apeeal.
    - 1 appeal will change status from "cheater" to "processing" and trigger a poll
    - If the player is in "suspicious" status, 1 new report will change status from "suspicious" to "processing" and trigger a poll
    - If the player is in "legit" status, 5 new reports will change status from "legit" to "processing" and trigger a poll

