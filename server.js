import express from 'express';
import http from 'http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import * as game from './main.js';

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
    lastdrawn:0, // ctreate for client but never update
}, { // private
    ura: [],
    wall:[],
    lastdrawn:0,
}]
var player = [];
for (let i=0;i<3;i++){ // public
    player[i] = [{
    point: 35000,
    position: i,
    exposed: [],
    riichi: false,
    ippasu: false,
    discard:[],
    seasontiles:0,
    name: "玩家"+String(i+1),
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
    if (!action){
        //return the info to player
        io.to(data[6][curplynum]).emit("drawaction", {hand: data[curplynum][1], action:0, last:data[3][1]['lastdrawn']});
    } else { 
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
    }
}
//const startgameinfo = {info, player}; //create the info needed for starting the game

io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected with id adress: ${socket.handshake.address}`)
    socket.on("find", name => {
        console.log(`player ${name} finding for other player`)
        //check if player already online
        if (!onlinelist.includes(name) && typeof socket.tag == 'undefined') {
            //TODO:check if player already in room if yes do reconnection instead
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
                    let replay = [];
                    //                       0      1       2       3         4         5       6           7
                    roomsdata[ranint] = [player0,player1,player2,gameinfo,[...namelist],0,tempprivatelist,replay];
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
            startwall = game.start(roomsdata[e.room]);
            //TODO:record the starting info (for rounds [start wall + actions])
            roomsdata[e.room][0][1]["hand"] = [11,11,11,11,19,19,19,35,35,36,37,93,1000];
            //create replay frame for this round
            let replay = [,,[]]; // [roomsdata,starting wall, action]
            roomsdata[e.room][7].push(replay);
            roomsdata[e.room][7][0][1] = [...startwall];
            let tempcopy = JSON.parse(JSON.stringify(roomsdata[e.room]));
            roomsdata[e.room][7][0][0] = tempcopy;
            //send hand to player
            //player0
            io.to(roomsdata[e.room][6][0]).emit("hand update", {stat:roomsdata[e.room][0][1]['hand'],last:0});
            //player1
            io.to(roomsdata[e.room][6][1]).emit("hand update", {stat:roomsdata[e.room][1][1]['hand'],last:0});
            //player2
            io.to(roomsdata[e.room][6][2]).emit("hand update", {stat:roomsdata[e.room][2][1]['hand'],last:0});
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
        roomsdata[e.room][socket.data.tag][1]['hand'].pop();
        roomsdata[e.room][socket.data.tag][1]['hand'].push(1000);
        //deal tile to player
        dealhandtocurrentplayer(roomsdata[e.room], e.room);
    })
    //response to action
    socket.on('action', act => {
        //check riichi or open riichi
        console.log(act);
        //check if the current player has the hand
        if (roomsdata[act.room][socket.data.tag][1]['hand'].includes(act.play)) {
            //move the hand from hand to discard
            roomsdata[act.room][socket.data.tag][1]['hand'].splice(roomsdata[act.room][socket.data.tag][1]['hand'].indexof(act.play),1);
            roomsdata[act.room][socket.data.tag][0]['discard'].push(act.play);
            //change the player's tenpai
            if (typeof roomsdata[act.room][socket.data.tag][1]['tenpai'][act.play] !== 'undefined') {
                roomsdata[act.room][socket.data.tag][1]['tenpai'] = roomsdata[act.room][socket.data.tag][1]['tenpai'][act.play];
            } else {
                roomsdata[act.room][socket.data.tag][1]['tenpai'] = {};
            }
            //calculate the possible action
            //check any ron on the played tile
            let ronlist = [];
            //ron check for next player
            if (roomsdata[act.room][(socket.data.tag+1)%3][1]['winningtile'].includes()) {
                ronlist.push((socket.data.tag+1)%3);
            }
            //roncheck for previous player
            if (roomsdata[act.room][(socket.data.tag+2)%3][1]['winningtile'].includes()) {
                ronlist.push((socket.data.tag+2)%3);
            }
            //check any pong
            let ponglist = [];
            if (roomsdata[act.room][(socket.data.tag+1)%3][1]['hand']) {
                if (roomsdata[act.room][(socket.data.tag+1)%3][1]['hand'][roomsdata[act.room][(socket.data.tag+1)%3][1]['hand'].indexOf(act.play)+1] == act.play) {
                    ponglist.push((socket.data.tag+1)%3);
                }
            }
            if (roomsdata[act.room][(socket.data.tag+2)%3][1]['hand']) {
                if (roomsdata[act.room][(socket.data.tag+2)%3][1]['hand'][roomsdata[act.room][(socket.data.tag+2)%3][1]['hand'].indexOf(act.play)+1] == act.play) {
                    ponglist.push((socket.data.tag+2)%3);
                }
            }
            //check any kan
            let kanplayerlist = [];
            if (roomsdata[act.room][(socket.data.tag+1)%3][1]['hand']) {
                if (roomsdata[act.room][(socket.data.tag+1)%3][1]['hand'][roomsdata[act.room][(socket.data.tag+1)%3][1]['hand'].indexOf(act.play)+1] == act.play) {
                    kanplayerlist.push((socket.data.tag+1)%3);
                }
            }
            if (roomsdata[act.room][(socket.data.tag+2)%3][1]['hand']) {
                if (roomsdata[act.room][(socket.data.tag+2)%3][1]['hand'][roomsdata[act.room][(socket.data.tag+2)%3][1]['hand'].indexOf(act.play)+1] == act.play) {
                    kanplayerlist.push((socket.data.tag+2)%3);
                }
            }
            //tell all player the played tile
            socket.emit("played", {room:act.room,tile:act.play});
            //tell the player if they have available action
            if (ronlist.length>0) {
                ronlist.forEach((e) => {
                    socket.to(roomsdata[act.room][6][e]).emit("ask ron",{room:act.room});
                })
            }
            if (ponglist.length>0) {
                if (ponglist.length>0) {
                    ponglist.forEach((e) => {
                        socket.to(roomsdata[act.room][6][e]).emit("ask pong",{room:act.room});
                    })
                }
            }
            if (kanplayerlist.length>0) {
                if (kanplayerlist.length>0) {
                    kanplayerlist.forEach((e) => {
                        socket.to(roomsdata[act.room][6][e]).emit("ask kan",{room:act.room});
                    })
                }
            }
            //change current player to next player and deal hand to current player
        }
    })
    //response to kan
    socket.on('kan', kan => {
        //check if kan legal
        if (roomsdata[kan.room][socket.data.tag][1]['kanlist'].flat().includes(kan.kantile)) {
            //check type of kan
            if (roomsdata[kan.room][socket.data.tag][1]['kanlist'][0].includes(kan.kantile)) {
                //ankan
                //TODO:ron on kan and riichi check also check if cards left enought for kan
                //change data
                game.ankan(roomsdata[kan.room],socket.data.tag,kan.kantile);
                //tell all player ankan
                io.to(kan.room).emit("kan",{kanplayer:socket.data.tag,kantile:kan.kantile,type:"ankan",newdora:roomsdata[kan.room][3][0]["dora"][roomsdata[kan.room][3][0]["dora"].length-1]});
            } else {
                //addkan
                //TODO:ron on kan
                game.addkan(roomsdata[kan.room],socket.data.tag,kan.kantile);
                //tell all player ankan
                io.to(kan.room).emit("kan",{kanplayer:socket.data.tag,kantile:kan.kantile,type:"addkan",newdora:roomsdata[kan.room][3][0]["dora"][roomsdata[kan.room][3][0]["dora"].length-1]});
            }
            //deal the hand
            dealhandtocurrentplayer(roomsdata[kan.room],kan.room);
        }
    });
    //TODO:response to zumo
    socket.on('zumo', e => {
        console.log(e);
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

