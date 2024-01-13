# ShootTheTraitor

Online Javascript game built for browsers that works on AWS Cloud

## Structure:
>serverBackend.js  (\)
>>index.html (\public\index.html)
>>>serverFrontend.js (\public\js\serverFrontend.js)

## Flow:
- *serverBackend handles server side, calculations regarding game mechanics and movement happens here* <br>
- *serverFrontend handles client side, visual calculations happens here* <br>
- *index is static version of page handles username form and Leaderboard parts* <br>
 
## Instructions:
### Local:
1. Run `serverBackend.js` with the command `node serverBackend.js`
2. Connect to ``localhost:3000``

### Cloud:
1. Connect to `ec2-52-202-235-141.compute-1.amazonaws.com:3000`


