import * as hucheck from './hucheck.js';
//define variables
// 牌山 1x=萬 2x=索 3x=筒 z=1東2南3西4北5白6發7中 h=花
var wall = [];
const card = [11,19,31,32,33,34,35,36,37,38,39,51,52,53,54,55,56,57,58,59,65,69,73,77,81,85,89];
const menfeng = [65,65,65,69,69,69];
for (let i=0;i<card.length;i++){
    for(let j=0;j<4;j++){
        wall.push(card[i]);
    }
}
var player = [];
for (let i=0;i<3;i++){ // public
    player[i] = [{
    position: i,
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
var hand;
var activeuser;
var combinedhand;
wall.push(93,97,101,105);
var lastdrawn = 0;
var buhua = false;
var exposed;
var ktile;
/*
//Create Player Data Frame
var player = [];
for (i=0;i<3;i++){
    player[i] = {
        point: 35000,
        position: i,
        exposed: [],
        hand: [1000],
        tenpai: {},
        winningtile: {},
        riichi: false,
        ippasu: false,
        discard:[],
        seasontiles:0,
        furiten: false,
        name: "玩家"+String(i+1)
    }
}
player[0].next_player=player[1];
player[1].next_player=player[2];
player[2].next_player=player[0];
var info = {
  rounds: 0,
  continueround: 0,
  riichideposit: 0,
  dorafaceup: [],
  dorafacedown: [],
  currentplayer: 0,
  cardsremain: 112
}
var action = [];
var urturn = false;
var lastdrawn = 0;
var deal = true;
var activebutton = [];*/
//sort and pickout the drawn hand
function sorthand(sort) {
  sort.sort((a,b) => a-b);
  sort.splice(sort.indexOf(lastdrawn), 1);
  sort.push(lastdrawn);
  return sort;
}
function shuffle(array){
    let currentIndex = array.length, randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]]=[
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

function removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}

function replaceTiles(tilesInHand) {
    for (let i = 0; i < tilesInHand.length; i++) {
      if (tilesInHand[i]===20) {
        tilesInHand.splice(i, 1, 25);
      } else if (tilesInHand[i]===30) {
        tilesInHand.splice(i, 1, 35);
      }
    }
    return tilesInHand;
}

function hasSeasonTiles(shand) {
    for (let i = 0; i < shand.length; i++) {
      if (shand[i] >= 93 && shand[i] <= 105) {
        return shand[i];
      }
    }
    return false;
}

function checkFiveOrMore(array) {
    let count = 1;
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i] === array[i + 1]) {
        count++;
        if (count >= 5) {
          return true;
        }
      } else {
        count = 1;
      }
    }
    return false;
}
//Remove season tile and draw
function removeseason(hua) {
  hua.sort((a,b) => b-a);
  hua.splice(1,1);
  hua = sorthand(hua);
  return hua;
}
//Get all possible Kan for a hand and return them
function getkan(khand,exposed =[]) {
let listan = []; //list for store possible kans
let uniqueTiles = [...new Set(khand)];
//sort the hand
khand.sort((a,b) => a-b);
//check for an kan
let count = {};
for (let i=0; i<khand.length; i++){
  //if not in count add to count
  if (typeof count[khand[i]] === 'undefined') {
    count[khand[i]] = 1;
  } else {
    count[khand[i]]++;
  }
}
for (let i=0; i<uniqueTiles.length; i++){
  if (count[uniqueTiles[i]] >= 4) {
    listan.push(uniqueTiles[i]);
  }
}
//check for add kan
let listadd = [];
//find all pong in exposed
if (exposed.length != 0) {
  for (let i=0; i<exposed.length; i++) {
    if (exposed[i][0][0]==exposed[i][0][1] && exposed[i][0].length == 3) {
      if (khand.includes(exposed[i][0][0])) {
        listadd.push([exposed[i][0][0],i]); // i refer to the index of the relative trips
      }
    }
  }
}
//add two list together and return
return [listan,listadd];
}
//resolve all kan tile from hand
function removekan(khand,kan) {
  khand = khand.filter(function(a) {return a!==kan});
  return khand;
}
function fourofakind(array){
  array.sort((a,b) => a-b);
    let count = 1;
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i] === array[i + 1]) {
        count++;
        if (count >= 4) {
          return array[i];
        }
      } else {
        count = 1;
      }
    }
    return false;
}

//deal a tile for the current player and update the hand if needed
function dealCard() {
    //remove a card from wall
    const card = wall.pop();
    lastdrawn = card;
    //push the card into current player's hand
    activeuser.hand.push(card);
    //sort the hand
    activeuser.hand = sorthand(activeuser.hand);
    //update user's hand if needed
    if (info.currentplayer === player[0]){
      image.updateplayerhand(player[0].hand);
    }
}
function start(data){
  for (let i=0;i<3;i++){ // public
    data[i] = [{
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
  for (let i=0;i<3;i++) {
    if (data[3][0]['currentplayer'] == (i+1)%3) {
      data[i][0]['position'] = 1;
    }
    else if (data[3][0]['currentplayer'] == (i+2)%3) {
      data[i][0]['position'] = 2;
    }
  }
  //clear the wall and hands
  //reset the wall
  data[3][1]['wall'] = [];
  for (let i=0;i<card.length;i++){
    for(let j=0;j<4;j++){
      data[3][1]['wall'].push(card[i]);
    }
  }
  //shuffle the wall
  data[3][1]['wall'] = shuffle(shuffle(data[3][1]['wall']));
  //save newwall for record
  data[7].push([[...data[3][1]['wall']],[]]);
  console.log(data[7]);
  //deal hand to player
  for (let i=0; i<12; i++) {
    data[0][1]['hand'].push(data[3][1]['wall'].pop());
    data[1][1]['hand'].push(data[3][1]['wall'].pop());
    data[2][1]['hand'].push(data[3][1]['wall'].pop());
  }
  data[0][1]['hand'].sort((a,b) => a-b);
  data[1][1]['hand'].sort((a,b) => a-b);
  data[2][1]['hand'].sort((a,b) => a-b);
  //take card for dora
  data[3][0]['dora'].push(data[3][1]['wall'].pop());
  data[3][1]['ura'].push(data[3][1]['wall'].pop());
  //check tenpai

  //data[0][1]['hand'] = [31,34,11,19,35,35,36,36,36,36,52,77,1000];
  //data[1][1]['hand'] = [52,52,52,53,53,53,54,55,56,57,58,85,1000];
  //data[2][1]['hand'] = [11,11,11,19,19,19,31,31,31,32,33,34,1000];
  
  data[1][1]['hand'].push(11);
  let tenpailist1 = hucheck.tenpaiSQ(data[1][1]['hand']);
  if (typeof tenpailist1['11'] !== 'undefined') {
    data[1][1]['winningtile'] = tenpailist1['11'];
  }
  data[1][1]['hand'].splice(0,1);
  data[2][1]['hand'].push(11);
  let tenpailist2 = hucheck.tenpaiSQ(data[2][1]['hand']);
  if (typeof tenpailist2['11'] !== 'undefined') {
    data[2][1]['winningtile'] = tenpailist2['11'];
  }
  data[2][1]['hand'].splice(0,1);
  return;
}
function deal(data) { //deal card to current player, first check if need to buhua, then check for action and return;
  //pull a tile from wall to hand
  let card = data[3][1]['wall'].pop();
  activeuser = data[data[3][0]['currentplayer']];
  hand = activeuser[1]['hand'];
  hand.push(card);
  //record the card drawn
  data[3][1]['lastdrawn'] = card;
  
  //check if need to buhua
  if (hasSeasonTiles(hand)) {
    return false;
  }
  //get exposed
  exposed = [...activeuser[0]['exposed']];
  //combine exposed with hand
  let copyhand = [...hand];
  if (exposed.length>0) {
    for (let i=0; i<exposed.length; i++) {
      if (exposed[i][1][1]==0) {
        copyhand = copyhand.concat(exposed);
      }
    }
  }
  copyhand = copyhand.flat();
  copyhand.sort((a,b) => a-b);
  //create an action list
  let kanlist;
  //check for kan
  if (ktile = fourofakind(copyhand)) {
    //get kan list
    kanlist = getkan(hand, exposed)
    //special check for riichi
    if (activeuser[0]['riichi'] == 1) {
      if (kanlist[0].includes(data[3][1][2])){
        let newhand = [...hand];
        newhand.splice(data[player][1]["hand"].indexOf(data[3][1][2]),4);
        let newwiningtile = hucheck.checktenpai(newhand);
        if (newwiningtile == activeuser[1]['winningtile']) {
          kanlist = [[data[3][1][2]],[]];
        } else {
          kanlist = [[],[]];
        }
      }
    }
  }
  //check for tenpai
  activeuser[1]['winningtile'] = hucheck.checktenpai(hand);
  //check for zumo
  activeuser[1]['tenpai'] = hucheck.tenpaiSQ(hand);
  //return if can an kan
  return kanlist;
}
function ankan(data,player,tile) {
  //sort the hand
  data[player][1]["hand"].sort((a,b) => a-b);
  //remove the card from the player's hand
  data[player][1]["hand"].splice(data[player][1]["hand"].indexOf(tile),4);
  //add the ankan tile to the exposed
  data[player][0]["exposed"].push([[tile,tile,tile,tile],[0,0]]);
  //get the new dora and ura
  data[3][0]["dora"].push(data[3][1]["wall"].pop());
  data[3][1]["ura"].push(data[3][1]["wall"].pop());
}
//TODO:
function addkan(data,player,tile) {
  //sort the hand
  data[player][1]["hand"].sort((a,b) => a-b);
  //remove the card from the player's hand
  data[player][1]["hand"].splice(data[player][1]["hand"].indexOf(tile),1);
  //add the kan tile to the exposed
  let position = 0;
  for (let i = 0; i < 4; i++) {
    if (data[player][0]["exposed"][i][0][0] == tile) {
      position = i;
    }
  }
  originplayer = data[player][0]["exposed"][position][1][0];
  data[player][0]["exposed"][position] = [[tile,tile,tile,tile],[originplayer,1]];
  //get the new dora and ura
  data[3][0]["dora"].push(data[3][1]["wall"].pop());
  data[3][1]["ura"].push(data[3][1]["wall"].pop());
}
function areArraysEqual(arr1, arr2) {
  arr1.sort((a,b) => a-b);
  arr2.sort((a,b) => a-b);
  let areEqual = true;
  if (arr1.length !== arr2.length) {
    areEqual = false;
  } else {
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        areEqual = false;
        break;
      }
    }
  }
  return areEqual;
}
function anyArraysEqual(arrList) {
  for (let i = 0; i < arrList.length; i++) {
    for (let j = i + 1; j < arrList.length; j++) {
      if (areArraysEqual(arrList[i], arrList[j])) {
        return {i,j};
      }
    }
  }
  return false;
}
//TODO:
function getfan(winhand, data, player, wintile) {
  let fanlist = new Array(48).fill(0);
  //check menzen
  if (data[player][0]['menzen']) {
    //check zumo
    if (data[3]['currentplayer'] == player) {
      fanlist[2]++;
      fanlist[47]++;
    }
    //check riichi
    if (data[player][0]['riichi']) {
      fanlist[0]++;
      fanlist[47]++;
      if (data[player][0]['ippasu']) {
        fanlist[1]++;
        fanlist[47]++;
      }
    }
    //check pinghu
    let pinghu = false;
    if (winhand[0].flat().flat().length == 14){
      if (winhand[0][2].length == 0) {
        if (winhand[0][0][0] !== menfeng[data[3]['rounds']]) {
          if (winhand[0][0][0] !== 65+data[player][0]['position']*4) {
            for (let i=0; i < winhand[0][1].length; i++) {
              if (winhand[0][1][i][0] == wintile && winhand[0][1][i][2] == wintile) {
                pinghu = true; 
              }
            }
          }
        }
      }
    }
    if (pinghu) {
      fanlist[3]++;
      fanlist[47]++;
    }
    //一杯口 二杯口
    var stat;
    if (stat = anyArraysEqual(winhand[0][1])) {
      let newwinhand = [...winhand];
      newwinhand[1].splice(stat.j,1);
      newwinhand[1].splice(stat.i,1);
      if (anyArraysEqual(newwinhand)) {
        fanlist[8]++;
        fanlist[47]++;
      } else {
        fanlist[4]++;
        fanlist[47]++;
      }
    }
  }
  return fanlist;
}
function getpt(winhand, exposed = [], data, player, tile) {
  //sperate the hand into parts
  let hulist = hucheck.allcomb(winhand, exposed);
  let highfan = 0;
  for (let i=0; i<hulist.length; i++) {
    let fan = getfan(hulist[i], data, player, tile);
    hulist[i].push(fan);
    if (fan>highfan) {highfan = fan;}
  }
  return hulist;
}

export {start, deal,fourofakind,getkan,ankan,addkan};
//main game loop for holding the game
/*var ON = true;
while (ON) {
  //prepare for starting a round
  //shuffle the wall
  wall = shuffle(shuffle(wall));
  //deal 12 hands to each player
  for (var i=0; i<12; i++){
    player[0].hand[i+1] = wall.pop();
    player[1].hand[i+1] = wall.pop();
    player[2].hand[i+1] = wall.pop();
  }
  //sort player's hand
  player[0].hand.sort((a,b) => a-b);
  player[1].hand.sort((a,b) => a-b);
  player[2].hand.sort((a,b) => a-b);
  //display user's hand
  image.updateplayerhand(player[0].hand);
  //small loop for one single round that keeps deal hands and play until a player wins or wall used up
  while (ON) {
    //get current player's hand
    var activeuser = player[info.currentplayer];
    //check if need to deal a hand
    if (deal) {
      dealCard();
      //check if hands include season tile
      if (hasSeasonTiles(player[info.currentplayer].hand)){
        player[info.currentplayer].hand = removeseason(player[info.currentplayer].hand);
        activeuser.seasontiles++;
        continue;
      }
      //prepare for action and active the button
      //check for zumo
      if (!typeof hucheck.checktenpai(player[info.currentplayer].hand)[1000] === 'undefined'){
        activebutton.push(7);
      }
      //combine player's hand and exposed tile except kan
      let combinedhand = [...player[info.currentplayer].hand];
      if (activeuser.exposed.length != 0) {
        for (i=0; i<activeuser.exposed.length; i++){
          if (activeuser.exposed[i][1][1]==0) {
            combinedhand = combinedhand.concat(activeuser.exposed[i][0]);
          }
        }
      }
      combinedhand = combinedhand.flat();
      //check for kan
      if (fourofakind(player[info.currentplayer].hand)) {
        activebutton.push(3);
      } else if (fourofakind(combinedhand)) {
        activebutton.push(4);
      }
      //check for riichi(tenpai) and store tenpai vaule
      player[info.currentplayer].hand = [11,11,11,31,31,31,31,34,34,54,55,56,57,1000]
      image.updateplayerhand(player[info.currentplayer].hand);
      var tenpaiSQtemp = hucheck.tenpaiSQ(player[info.currentplayer].hand);
      activeuser.tenpai = tenpaiSQtemp;
      if (!(Object.keys(tenpaiSQtemp).length === 0 && tenpaiSQtemp.constructor === Object)) {
        if (!activeuser.furiten){
          activebutton.push(4)
        }
        activebutton.push(5);
      }
      //turn on the button available
      if (activebutton.length>0) {
        activebutton.sort((a,b) => a-b);
        for (i=0; i<activebutton.length; i++){
          image.enablebutton(activebutton[i]);
        }
        let button1 = document.getElementById('button-'+String(activebutton[0]));
            button1.style.marginLeft = "auto";
      }
    }
    action = [];
    //ask for player action [(0Kan, 1Play, 2Zumo), played tile (0 for no tile played)]
    //
    //
    // *TODO*
    //
    ///////////////////////
    //loop before getting an valid action
    player[info.currentplayer].hand = [11,11,11,19,19,19,32,33,34,35];
    player[info.currentplayer].exposed = [[[35,35,35],[2,4]]];
    image.updateplayerhand(player[info.currentplayer].hand,player[info.currentplayer].exposed);
    while (true) {
      ON = false;
      //check if choose to Kan
      if (action[0]==0) {
        //get possible Kan option
        let possiblekan = getkan(player[info.currentplayer].hand,activeuser.exposed);
        debugger;
        //check if multiple options
        if (possiblekan.flat().length > 1) {
        } else if (possiblekan.flat().length ==1) {
          //for one kan only resolve the kan directly
          //check if is ankan and resolve
          if (possiblekan[0].length == 1) {
            //remove the tile
            player[info.currentplayer].hand = removekan(player[info.currentplayer].hand, possiblekan[0][0]);
            // update the exposed
            let newexposed = [[possiblekan[0][0],possiblekan[0][0],possiblekan[0][0],possiblekan[0][0]],[0,0]];
            activeuser.exposed.push(newexposed);
            //update the image
            image.updateplayerhand(player[info.currentplayer].hand,activeuser.exposed);
            //break and return next deal step current player unchanged
            break;
          }
          debugger;
          //check if is addkan and resolve
          if (possiblekan[1].length == 1) {
            //remove the tile
            player[info.currentplayer].hand.splice(player[info.currentplayer].hand.indexOf(possiblekan[1][0][0]),1);
            //replace it with kan
            let newexposed = [[possiblekan[1][0][0],possiblekan[1][0][0],possiblekan[1][0][0],possiblekan[1][0][0]],[activeuser.exposed[possiblekan[1][0][1]][1][0],2]];
            activeuser.exposed[possiblekan[1][0][1]] = newexposed;
            //update the image
            image.updateplayerhand(player[info.currentplayer].hand,activeuser.exposed);
            //break and return next deal step current player unchanged
            break;
          }
        }
      }
      //check if choose to Play
      if (action[0]==0) {}
      break;
  }
  break;
}
  //resolve the winning hand and the point adjustment


  //do dajustment to rounds, riichi deposit and continuence, starting player (change current player), change postion if needed
  //check if game is ended
  if (false) {
    break;
  }
  break;
}
function riichi() {
  let possiblekan = getkan(player[info.currentplayer].hand,activeuser.exposed);
        debugger;
        //check if multiple options
        if (possiblekan.flat().length > 1) {
        } else if (possiblekan.flat().length ==1) {
          //for one kan only resolve the kan directly
          //check if is ankan and resolve
          if (possiblekan[0].length == 1) {
            //remove the tile
            player[info.currentplayer].hand = removekan(player[info.currentplayer].hand, possiblekan[0][0]);
            // update the exposed
            let newexposed = [[possiblekan[0][0],possiblekan[0][0],possiblekan[0][0],possiblekan[0][0]],[0,0]];
            activeuser.exposed.push(newexposed);
            //update the image
            image.updateplayerhand(player[info.currentplayer].hand,activeuser.exposed);
            //break and return next deal step current player unchanged
            
          }
          debugger;
          //check if is addkan and resolve
          if (possiblekan[1].length == 1) {
            //remove the tile
            player[info.currentplayer].hand.splice(player[info.currentplayer].hand.indexOf(possiblekan[1][0][0]),1);
            //replace it with kan
            let newexposed = [[possiblekan[1][0][0],possiblekan[1][0][0],possiblekan[1][0][0],possiblekan[1][0][0]],[activeuser.exposed[possiblekan[1][0][1]][1][0],2]];
            activeuser.exposed[possiblekan[1][0][1]] = newexposed;
            //update the image
            image.updateplayerhand(player[info.currentplayer].hand,activeuser.exposed);
            //break and return next deal step current player unchanged
            
          }
        }
}
let buttonadd = document.getElementById("button-4");
buttonadd.addEventListener("click" , function() {
  riichi();
});
debugger;*/
