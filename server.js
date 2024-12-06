import express from 'express';
import http from 'http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import * as game from './main.js';
import * as hucheck from './hucheck.js';
import * as fs from 'fs';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));
const __dirname = dirname(fileURLToPath(import.meta.url));
app.get('/', (req, res) => res.sendFile(join(__dirname, 'index.html')));
app.get('/style.css', (req, res) => res.sendFile(join(__dirname, 'style.css')));

//create container for info in all rooms
var cankan = false;
var waitlist = [];
var roomsdata = {};
var onlinelist = [];
var ranint;
var namelist = [];
var proomlist = [];
var count;
var pnum;
var action;
var buhua = false;
var startwall = [];
var info = [{ // public
    rounds: 0,
    continueround: 0,
    riichideposit: 0,
    dora: [],
    currentplayer: 0,
    cardsremain: 112,
    lastdrawn: 0,
    lastdiscard: 0,
    lastplay:0,
    point:[35000,35000,35000],
}, { // private
    ura: [],
    wall:[],
    lastdrawn: 0,
}]
var player = [];
for (let i=0;i<3;i++){ // public
    player[i] = [{
    position: 0,
    exposed: [],
    riichi: false,
    ippasu: false,
    discard:[],
    seasontiles:0,
    name: "玩家"+String(i+1),
    menzen:true,
}, { // private
    hand: [1000],
    tenpai: {},
    winningtile: {},
    furiten: [],
}]
}

function checkplayer(playername,room) {
    if (roomsdata[room][4].includes(playername)){
        return true;
    }
    return false;
}

function rannum() {
    let num = Math.floor(Math.random() * 10000 + 20000);
    return num;
}

function dealhandtocurrentplayer(data) {
    action = game.deal(data);
    let curplynum = data[3][0]["currentplayer"];
    //check if buhua
    if (action === false){
        //return the info to player
        io.to(data[6][curplynum]).emit("drawaction", {hand: data[curplynum][1], action:0, last:data[3][1]['lastdrawn']});
    } else if (typeof action !== 'undefined') { 
        if (action.flat().length>0) {//check if can kan
        cankan = true;
        }   else {
        cankan = false;
        }
        //return the info to player
        if (cankan) {
            data[curplynum][1]['kanlist'] = action;
            io.to(data[6][curplynum]).emit("drawaction", {hand: data[curplynum][1], action:action, last:data[3][1]['lastdrawn']});
        } else {
            io.to(data[6][curplynum]).emit("drawaction", {hand: data[curplynum][1], action:1, last:data[3][1]['lastdrawn']});
        }              
    } else {
        io.to(data[6][curplynum]).emit("drawaction", {hand: data[curplynum][1], action:1, last:data[3][1]['lastdrawn']});
    }
}
//const startgameinfo = {info, player}; //create the info needed for starting the game

io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected with id adress: ${socket.handshake.address}`)
    socket.on("find", name => {
        console.log(`player ${name} finding for other player`)
        //check if player already online
        if (!onlinelist.includes(name) && typeof socket.tag == 'undefined') {
            //TODO: reconnection
            waitlist.push(name);
            onlinelist.push(name);
            socket.tag = [name];
        } else {
            socket.emit("ilegal name", name);
        }
        console.log(onlinelist);
        //when have enough player open the room and start the game
        if (waitlist.length >= 3) {
            //get the first three player
            namelist=[];
            namelist.push(waitlist.pop());
            namelist.push(waitlist.pop());
            namelist.push(waitlist.pop());
            //create a spectial id for the room
            while (true){
                ranint = Math.floor(Math.random() * 10000);
                //if id not used create gamedata and store it in the roomsdata specified by room id
                if (typeof roomsdata[ranint] === 'undefined') {
                    //create game data for the game
                    let player0 = JSON.parse(JSON.stringify(player[0]));
                    let player1 = JSON.parse(JSON.stringify(player[1]));
                    let player2 = JSON.parse(JSON.stringify(player[1]));
                    player0[0].name = namelist[0];
                    player1[0].name = namelist[1];
                    player2[0].name = namelist[2];
                    let gameinfo = JSON.parse(JSON.stringify(info));
                    //create private room number
                    count = 0;
                    let tempprivatelist = [];
                    while (count<3) {
                        pnum = rannum();
                        if (!proomlist.includes(pnum)) {
                            tempprivatelist.push(pnum);
                            proomlist.push(pnum);
                            count++;
                        }
                    }
                    //                       0      1       2       3         4         5       6       7 replay 8 waitaction
                    roomsdata[ranint] = [player0,player1,player2,gameinfo,[...namelist],0,tempprivatelist,[],[]];
                    break;
                }
            }
            //passing the room id to the client
            io.emit('found', {namelist,ranint});
        }
    })
    socket.on("join room", e => {
        //check if room exits
        if (typeof roomsdata[e.room] !== 'undefined') {
            //check player position and return gamedata
            switch (roomsdata[e.room][4].indexOf(e.name)) {
                case 0:
                    if (socket.tag[0] == e.name) {
                        socket.join(e.room);
                        socket.data.tag = 0;
                        socket.emit("joined room", {stat:roomsdata[e.room],position:0});
                        //join the private room
                        socket.join(roomsdata[e.room][6][0]);
                    }
                    
                    break;
                case 1:
                    if (socket.tag[0] == e.name) {
                        socket.join(e.room);
                        socket.data.tag = 1;
                        //send data frame to player
                        socket.emit("joined room", {stat:roomsdata[e.room],position:1});
                        //join the private room
                        socket.join(roomsdata[e.room][6][1]);
                    }
                    break;
                case 2:
                    if (socket.tag[0] == e.name) {
                        socket.join(e.room);
                        socket.data.tag = 2;
                        //send data frame to player
                        socket.emit("joined room", {stat:roomsdata[e.room],position:2});
                        //join the private room
                        socket.join(roomsdata[e.room][6][2]);
                    }
                    break;
                default:
                    break;
            }
        }
    })
    socket.on('ready', e => {
        if (checkplayer(socket.tag[0],e.room)) {
            roomsdata[e.room][5]++;
        }
        //start the game when all player ready
        if (roomsdata[e.room][5] >= 3) {
            //create wall and deal hands to player.S
            game.start(roomsdata[e.room]);
            //TODO:record the starting info (for rounds [start wall + actions])
            //oomsdata[e.room][0][1]["hand"] = [11,11,11,11,19,19,19,35,35,36,37,93,1000];
            //create replay frame for this round
            //let tempcopy = JSON.parse(JSON.stringify(roomsdata[e.room]));
            //roomsdata[e.room][7][0][0] = tempcopy;
            //send hand to player
            //player0
            io.to(roomsdata[e.room][6][0]).emit("hand update", {stat:roomsdata[e.room][0][1]['hand'],last:0,dora:roomsdata[e.room][3][0]['dora'][0]});
            //io.to(roomsdata[e.room][6][0]).emit("hand update", {stat:[11,11,56],last:0});
            //player1
            io.to(roomsdata[e.room][6][1]).emit("hand update", {stat:roomsdata[e.room][1][1]['hand'],last:0,dora:roomsdata[e.room][3][0]['dora'][0]});
            //io.to(roomsdata[e.room][6][1]).emit("hand update", {stat:[11,11,56],last:0});
            //player2
            io.to(roomsdata[e.room][6][2]).emit("hand update", {stat:roomsdata[e.room][2][1]['hand'],last:0,dora:roomsdata[e.room][3][0]['dora'][0]});
            //io.to(roomsdata[e.room][6][2]).emit("hand update", {stat:[19,19,56],last:0});
            //deal tile to first player
            dealhandtocurrentplayer(roomsdata[e.room],e.room);
            //roomsdata[e.room][0][1]['hand'] = [11,11,11,11,19,19,19,19,31,31,31,31,1000]
            
        }
    })
    //response to buhua
    socket.on("buhua", e => {
        //remove the tile
        roomsdata[e.room][socket.data.tag][1]['hand'].sort((a, b) => a-b);
        roomsdata[e.room][socket.data.tag][1]['hand'].pop();
        let hua = roomsdata[e.room][socket.data.tag][1]['hand'].pop();
        roomsdata[e.room][socket.data.tag][1]['hand'].push(1000);
        //tell all player someone buhua
        socket.to(e.room).emit("buhua", {room:e.room, player:socket.data.tag, tile:hua});
        //deal tile to player
        dealhandtocurrentplayer(roomsdata[e.room], e.room);
    })
    //response to action
    socket.on('action', act => {
        //check riichi or open riichi
        console.log(act);
        let turn = false;
        //check if the current player has the hand
        if (roomsdata[act.room][socket.data.tag][1]['hand'].includes(act.play)) {
            //move the hand from hand to discard
            let allLessThan100 = roomsdata[act.room][socket.data.tag][0]['discard'].every((item) => {
                return item < 100;
            });
            if (act.riichi == 2) {
                roomsdata[act.room][socket.data.tag][0]['riichi'] = 2;
                roomsdata[act.room][socket.data.tag][0]['ippasu'] = true;
            }
            if (act.riichi == 1) {
                roomsdata[act.room][socket.data.tag][0]['riichi'] = 1;
                roomsdata[act.room][socket.data.tag][0]['ippasu'] = true;
            } else {
                roomsdata[act.room][socket.data.tag][0]['ippasu'] = false;
            }
            //record the action
            roomsdata[act.room][7][roomsdata[act.room][7].length-1][1].push([0,act.play,act.player,act.riichi]);
            roomsdata[act.room][3][0]['lastplay'] = act.play;
            if (roomsdata[act.room][socket.data.tag][0]["riichi"] && allLessThan100) {
                roomsdata[act.room][socket.data.tag][1]['hand'].splice(roomsdata[act.room][socket.data.tag][1]['hand'].indexOf(act.play),1);
                roomsdata[act.room][socket.data.tag][0]['discard'].push(act.play+100);
                turn = true;
            } else {
                roomsdata[act.room][socket.data.tag][1]['hand'].splice(roomsdata[act.room][socket.data.tag][1]['hand'].indexOf(act.play),1);
                roomsdata[act.room][socket.data.tag][0]['discard'].push(act.play);
            }
            //check if is riichi
            if (act.riichi == 1) {
                io.to(act.room).emit('riichi', {player:socket.data.tag});
            } else if (act.riichi == 2) {
                io.to(act.room).emit('openriichi', {player:socket.data.tag,data:roomsdata[act.room][socket.data.tag][1]});
            }
            //change the player's tenpai
            if (typeof roomsdata[act.room][socket.data.tag][1]['tenpai'][act.play] !== 'undefined') {
                roomsdata[act.room][socket.data.tag][1]['winningtile'] = roomsdata[act.room][socket.data.tag][1]['tenpai'][act.play];
            } else {
                roomsdata[act.room][socket.data.tag][1]['tenpai'] = {};
            }
            //clear waitlist
            roomsdata[act.room][8] = [];
            //check any ron on the played tile
            let ronlist = [];
            //ron check for next player
            if (roomsdata[act.room][(socket.data.tag+1)%3][1]['winningtile'].length > 0) {
                if (roomsdata[act.room][(socket.data.tag+1)%3][1]['winningtile'].includes(act.play)) {
                    ronlist.push((socket.data.tag+1)%3);
                }
            }
            //roncheck for previous player
            if (roomsdata[act.room][(socket.data.tag+2)%3][1]['winningtile'].length > 0) {
                if (roomsdata[act.room][(socket.data.tag+2)%3][1]['winningtile'].includes(act.play)) {
                    ronlist.push((socket.data.tag+2)%3);
                    }
            }
            //transfer hand
            let np = [...roomsdata[act.room][(socket.data.tag+1)%3][1]['hand']];
            let pp = [...roomsdata[act.room][(socket.data.tag+2)%3][1]['hand']];
            np = np.map((e) => {
                if (e==30) {
                    return 35;
                } else if (e==50) {
                    return 55;
                } else {
                    return e;
                }
            })
            pp = pp.map((e) => {
                if (e==30) {
                    return 35;
                } else if (e==50) {
                    return 55;
                } else {
                    return e;
                }
            })
            np.sort((a,b) => {a-b});
            pp.sort((a,b) => {a-b});
            //check any pong
            let ponglist = [];
            if (np) {
                if (np[np.indexOf(act.play)+1] == act.play) {
                    ponglist.push((socket.data.tag+1)%3);
                }
            }
            if (pp) {
                if (pp[pp.indexOf(act.play)+1] == act.play) {
                    ponglist.push((socket.data.tag+2)%3);
                }
            }
            //check any kan
            let kanplayerlist = [];
            //console.log("np: ", np)
            //console.log("pp: ", pp)
            //console.log("play: ", act.play)
            if (np[np.indexOf(act.play)+2] == act.play) {
                kanplayerlist.push((socket.data.tag+1)%3);
            }
            if (pp[pp.indexOf(act.play)+2] == act.play) {
                    kanplayerlist.push((socket.data.tag+2)%3);
            }
            //tell all player the played tile
            if (turn) {
                io.to(act.room).emit("played", {room:act.room,tile:act.play+100,player:socket.data.tag,discard:roomsdata[act.room][socket.data.tag][0]['discard']});
            } else {
                io.to(act.room).emit("played", {room:act.room,tile:act.play,player:socket.data.tag,discard:roomsdata[act.room][socket.data.tag][0]['discard']});
            }
            
            //tell the player if they have available action
            if (ronlist.length>0) {
                ronlist.forEach((e) => {
                    socket.to(roomsdata[act.room][6][e]).emit("ask ron",{room:act.room});
                    if (!roomsdata[act.room][8].includes(e)) {
                        roomsdata[act.room][8].push(e);
                    }
                })
            }
            if (ponglist.length>0) {
                ponglist.forEach((e) => {
                    socket.to(roomsdata[act.room][6][e]).emit("ask pong",{room:act.room,tile:act.play});
                    if (!roomsdata[act.room][8].includes(e)) {
                        roomsdata[act.room][8].push(e);
                    }
                })
            }
            if (kanplayerlist.length>0) {
                if (kanplayerlist.length>0) {
                    kanplayerlist.forEach((e) => {
                        socket.to(roomsdata[act.room][6][e]).emit("ask kan",{room:act.room,tile:act.play});
                        if (!roomsdata[act.room][8].includes(e)) {
                            roomsdata[act.room][8].push(e);
                        }
                    })
                }
            }
            //change current player to next player and deal hand to current player
            console.log(roomsdata[act.room][8]);
            if (roomsdata[act.room][8].length == 0) {
                roomsdata[act.room][3][0]['currentplayer'] = (roomsdata[act.room][3][0]['currentplayer']+1)%3;
                dealhandtocurrentplayer(roomsdata[act.room],act.room);
            } else {
                for (let i=0; i<roomsdata[act.room][8].length; i++) {
                    io.to(roomsdata[act.room][6][roomsdata[act.room][8][i]]).emit("cancel", {room:act.room});
                }
            }
            roomsdata[act.room][3][0]['lastdiscard'] = act.play;
        }
    })
    socket.on("pong", e => {
        //check if can pong
        let legal = false;
        if (e.tile == 30) {
            if (roomsdata[e.room][3][0]['lastplay'] == 30) {
                //remove the tile
                roomsdata[e.room][roomsdata[e.room][3][0]['currentplayer']][0]['discard'].pop();
                roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(35),2);
                if ((e.player+1)%3 == roomsdata[e.room][3][0]['currentplayer']) {
                    roomsdata[e.room][e.player][0]['exposed'].push([[35,35,30],[roomsdata[e.room][3][0]['currentplayer'],4]]);
                    legal = true;
                } else {
                    roomsdata[e.room][e.player][0]['exposed'].push([[30,35,35],[roomsdata[e.room][3][0]['currentplayer'],4]]);
                    legal = true;
                }
                
            } else if (roomsdata[e.room][3][0]['lastplay'] == 35) {
                //remove the tile
                roomsdata[e.room][roomsdata[e.room][3][0]['currentplayer']][0]['discard'].pop();
                roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(35),1);
                roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(30),1);
                roomsdata[e.room][e.player][0]['exposed'].push([[35,30,35],[roomsdata[e.room][3][0]['currentplayer'],4]]);
                legal = true;
            }
        } else if (e.tile == 50) {
            if (roomsdata[e.room][3][0]['lastplay'] == 50) {
                //remove the tile
                roomsdata[e.room][roomsdata[e.room][3][0]['currentplayer']][0]['discard'].pop();
                roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(55),2);
                if ((e.player+1)%3 == roomsdata[e.room][3][0]['currentplayer']) {
                    roomsdata[e.room][e.player][0]['exposed'].push([[55,55,50],[roomsdata[e.room][3][0]['currentplayer'],4]]);
                    legal = true;
                } else {
                    roomsdata[e.room][e.player][0]['exposed'].push([[50,55,55],[roomsdata[e.room][3][0]['currentplayer'],4]]);
                    legal = true;
                }
                
            } else if (roomsdata[e.room][3][0]['lastplay'] == 55) {
                //remove the tile
                roomsdata[e.room][roomsdata[e.room][3][0]['currentplayer']][0]['discard'].pop();
                roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(55),1);
                roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(50),1);
                roomsdata[e.room][e.player][0]['exposed'].push([[55,50,55],[roomsdata[e.room][3][0]['currentplayer'],4]]);
                legal = true;
            }
        } else if (roomsdata[e.room][3][0]['lastplay'] == e.tile) {
            roomsdata[e.room][roomsdata[e.room][3][0]['currentplayer']][0]['discard'].pop();
            roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(e.tile),2);
            roomsdata[e.room][e.player][0]['exposed'].push([[e.tile,e.tile,e.tile],[roomsdata[e.room][3][0]['currentplayer'],4]]);
            legal = true;
        }
        if (legal) {
            roomsdata[e.room][0][0]['ippasu'] = false;
            roomsdata[e.room][1][0]['ippasu'] = false;
            roomsdata[e.room][2][0]['ippasu'] = false;
            roomsdata[e.room][e.player][0]['menzen'] = false;
            //check tenpai
            roomsdata[e.room][e.player][1]['tenpai'] = hucheck.tenpaiSQ(roomsdata[e.room][e.player][1]['hand']);
            //boardcast the pong
            let num = roomsdata[e.room][3][0]['currentplayer'];
            roomsdata[e.room][3][0]['currentplayer'] = e.player;
            io.to(e.room).emit("pong", {player:num,room:e.room,discard:roomsdata[e.room][num][0]["discard"],exposed:roomsdata[e.room][e.player][0]["exposed"],byplayer:e.player});
            io.to(roomsdata[e.room][6][e.player]).emit("pong reply", {tenpai:roomsdata[e.room][e.player][1]['tenpai'],hand:roomsdata[e.room][e.player][1]['hand']});
            //record action
            roomsdata[e.room][7][roomsdata[e.room][7].length-1][1].push([1,roomsdata[e.room][3][0]['lastplay'],e.player,roomsdata[e.room][e.player][0]["exposed"][roomsdata[e.room][e.player][0]["exposed"].length-1][0]]);
        }
    })
    //response to kan
    socket.on('kan', kan => {
        console.log(kan);
        console.log(roomsdata[kan.room]);
        roomsdata[kan.room][kan.player][0]['menzen'] = false;
        roomsdata[kan.room][0][0]['ippasu'] = false;
        roomsdata[kan.room][1][0]['ippasu'] = false;
        roomsdata[kan.room][2][0]['ippasu'] = false;
        //check if kan legal
        if (roomsdata[kan.room][socket.data.tag][1]['kanlist'].flat().includes(kan.kantile)) {
            //check type of kan
            if (roomsdata[kan.room][socket.data.tag][1]['kanlist'][0].includes(kan.kantile)) {
                //ankan
                //TODO:ron on kan and riichi check also check if cards left enought for kan
                //change data
                game.ankan(roomsdata[kan.room],socket.data.tag,kan.kantile);
                //tell all player ankan
                io.to(kan.room).emit("kan",{player:socket.data.tag,byplayer:kan.player,exposed:roomsdata[kan.room][socket.data.tag][0]['exposed'],type:"ankan",newdora:roomsdata[kan.room][3][0]["dora"][roomsdata[kan.room][3][0]["dora"].length-1]});
                //record action
                roomsdata[kan.room][7][roomsdata[kan.room][7].length-1][1].push([3,kan.kantile,socket.data.tag,roomsdata[kan.room][socket.data.tag][0]['exposed'][roomsdata[kan.room][socket.data.tag][0]['exposed'].length-1][0]]);
            } else {
                //addkan
                //TODO:ron on kan
                game.addkan(roomsdata[kan.room],socket.data.tag,kan.kantile);
                //tell all player ankan
                io.to(kan.room).emit("kan",{player:socket.data.tag,byplayer:kan.player,exposed:roomsdata[kan.room][socket.data.tag][0]['exposed'],type:"addkan",newdora:roomsdata[kan.room][3][0]["dora"][roomsdata[kan.room][3][0]["dora"].length-1]});
                //record action
                roomsdata[kan.room][7][roomsdata[kan.room][7].length-1][1].push([4,kan.kantile,socket.data.tag,roomsdata[kan.room][socket.data.tag][0]['exposed'][roomsdata[kan.room][socket.data.tag][0]['exposed'].length-1][0]]);
            }
            //deal the hand
            dealhandtocurrentplayer(roomsdata[kan.room],kan.room);
        }
    });
    socket.on("melded kan", e => {
        let playernow = roomsdata[e.room][3][0]['currentplayer'];
        roomsdata[e.room][e.player][0]['menzen'] = false;
        roomsdata[e.room][0][0]['ippasu'] = false;
        roomsdata[e.room][1][0]['ippasu'] = false;
        roomsdata[e.room][2][0]['ippasu'] = false;
        if (e.tile == 30) {
            roomsdata[e.room][playernow][0]['discard'].pop();
            roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(35),3);
            if ((e.player-playernow+3)%3 == 1) {
                roomsdata[e.room][e.player][0]['exposed'].push([[30,35,35,35],[playernow,1]]);
            } else {
                roomsdata[e.room][e.player][0]['exposed'].push([[35,35,35,30],[playernow,1]]);
            }
        } else if (e.tile == 35) {
            roomsdata[e.room][playernow][0]['discard'].pop();
            roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(35),2);
            roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(30),1);
            roomsdata[e.room][e.player][0]['exposed'].push([[35,30,35,35],[playernow,1]]);
        } else if (e.tile == 50) {
            roomsdata[e.room][playernow][0]['discard'].pop();
            roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(55),3);
            if ((e.player-playernow+3)%3 == 1) {
                roomsdata[e.room][e.player][0]['exposed'].push([[50,55,55,55],[playernow,1]]);
            } else {
                roomsdata[e.room][e.player][0]['exposed'].push([[55,55,55,50],[playernow,1]]);
            }
        } else if (e.tile == 55) {
            roomsdata[e.room][playernow][0]['discard'].pop();
            roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(55),2);
            roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(50),1);
            roomsdata[e.room][e.player][0]['exposed'].push([[55,50,55,55],[playernow,1]]);
        } else {
            roomsdata[e.room][playernow][0]['discard'].pop();
            roomsdata[e.room][e.player][1]['hand'].splice(roomsdata[e.room][e.player][1]['hand'].indexOf(e.tile),3);
            roomsdata[e.room][e.player][0]['exposed'].push([[e.tile,e.tile,e.tile,e.tile],[playernow,1]]);
        }
        roomsdata[e.room][3][0]['dora'].push(roomsdata[e.room][3][1]['wall'].pop());
        roomsdata[e.room][3][1]['ura'].push(roomsdata[e.room][3][1]['wall'].pop());
        //tell the player the change
        io.to(e.room).emit("melded kan", {room:e.room,player:playernow,exposed:roomsdata[e.room][e.player][0]['exposed'],discard:roomsdata[e.room][playernow][0]['discard'],byplayer:e.player,dora:roomsdata[e.room][3][0]['dora']});
        //io.to(roomsdata[e.room][6][e.player]).emit("melded kan reply", {})
        //record action
        roomsdata[e.room][7][roomsdata[e.room][7].length-1][1].push([2,e.tile,e.player,roomsdata[e.room][e.player][0]['exposed'][roomsdata[e.room][e.player][0]['exposed'].length-1][0]]);
        //change the player and deal hand
        roomsdata[e.room][3][0]['currentplayer'] = e.player;
        dealhandtocurrentplayer(roomsdata[e.room]);
    });
    //TODO:response to zumo
    socket.on('zumo', e => {
        //check if can zumo
        let zumo = hucheck.checktenpai(roomsdata[e.room][e.player][1]['hand']);
        if (Object.keys(zumo).length !== 0) {
            //get the winning points
            //game.getfan(roomsdata[e.room][e.player][1]['hand'])
            //emit to all that player zumo
            io.to(e.room).emit("zumo", {player:e.player,room:e.room,hand:roomsdata[e.room][e.player][1]['hand'],ura:roomsdata[e.room][3][1]['ura']});
        }
        //record action
        roomsdata[e.room][7][roomsdata[e.room][7].length-1][1].push([5,e.player]);
        //start a new round
        if (e.player == roomsdata[e.room][3][0]['rounds']%3) {
            roomsdata[e.room][3][0]['continueround']++;
        } else {
            roomsdata[e.room][3][0]['continueround'] = 0;
            roomsdata[e.room][3][0]['rounds']++;
        }
        roomsdata[e.room][3][0]['currentplayer'] = roomsdata[e.room][3][0]['rounds']%3;
        io.to(e.room).emit("new round", {data:roomsdata[e.room][3][0]});
        game.start(roomsdata[e.room]);
        //send hand to player
            //player0
            io.to(roomsdata[e.room][6][0]).emit("hand update", {stat:roomsdata[e.room][0][1]['hand'],last:0});
            //io.to(roomsdata[e.room][6][0]).emit("hand update", {stat:[11,11,56],last:0});
            //player1
            io.to(roomsdata[e.room][6][1]).emit("hand update", {stat:roomsdata[e.room][1][1]['hand'],last:0});
            //io.to(roomsdata[e.room][6][1]).emit("hand update", {stat:[11,11,56],last:0});
            //player2
            io.to(roomsdata[e.room][6][2]).emit("hand update", {stat:roomsdata[e.room][2][1]['hand'],last:0});
        console.log("hand: ", roomsdata[e.room][2][1]['hand']);
        dealhandtocurrentplayer(roomsdata[e.room]);
    })
    socket.on('ron', e => {
        //check if can ron
        let checkwinhand = [...roomsdata[e.room][e.player][1]['hand']];
        checkwinhand.push(roomsdata[e.room][3][0]["lastdiscard"]);
        let ron = hucheck.checktenpai(checkwinhand);
        if (Object.keys(ron).length !== 0) {
            //emit to all that player ron
            io.to(e.room).emit("ron", {winplayer:e.player,room:e.room,hand:roomsdata[e.room][e.player][1]['hand'],ura:roomsdata[e.room][3][1]['ura'],loseplayer:roomsdata[e.room][3][0]['currentplayer']});
        }
        //record action
        roomsdata[e.room][7][roomsdata[e.room][7].length-1][1].push([6,e.player]);
        //print out action list for checking

       /* //start a new round
        if (e.player == roomsdata[e.room][3][0]['rounds']%3) {
            roomsdata[e.room][3][0]['continueround']++;
        } else {
            roomsdata[e.room][3][0]['continueround'] = 0;
            roomsdata[e.room][3][0]['rounds']++;
        }
        roomsdata[e.room][3][0]['currentplayer'] = roomsdata[e.room][3][0]['rounds']%3;
        io.to(e.room).emit("new round", {data:roomsdata[e.room][3][0]});
        game.start(roomsdata[e.room]);
        //send hand to player
            //player0
            io.to(roomsdata[e.room][6][0]).emit("hand update", {stat:roomsdata[e.room][0][1]['hand'],last:0});
            //io.to(roomsdata[e.room][6][0]).emit("hand update", {stat:[11,11,56],last:0});
            //player1
            io.to(roomsdata[e.room][6][1]).emit("hand update", {stat:roomsdata[e.room][1][1]['hand'],last:0});
            //io.to(roomsdata[e.room][6][1]).emit("hand update", {stat:[11,11,56],last:0});
            //player2
            io.to(roomsdata[e.room][6][2]).emit("hand update", {stat:roomsdata[e.room][2][1]['hand'],last:0});
        dealhandtocurrentplayer(roomsdata[e.room]);*/
    })
    socket.on('skip', e => {
        roomsdata[e.room][8].splice(roomsdata[e.room][8].indexOf(socket.data.tag),1);
        if (roomsdata[e.room][8].length == 0) {
            roomsdata[e.room][3][0]['currentplayer'] = (roomsdata[e.room][3][0]['currentplayer']+1)%3;
            dealhandtocurrentplayer(roomsdata[e.room]);
        }
    })
    //TODO:fix the logout counting system
    socket.on('disconnect', () => {
        console.log("client disconnected with tag: ", socket.tag)
        onlinelist = onlinelist.filter(name => {return name!==socket.tag});
        waitlist = waitlist.filter(name => {return name!==socket.tag});
    })
})

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`))

