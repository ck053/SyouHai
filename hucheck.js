//constant
//const validTile = [11,19,31,32,33,34,35,36,37,38,39,51,52,53,54,55,56,57,58,59,65,69,73,77,81,85,89];
//const card = [31,32,33,34,35,36,37,38,39];
function unzip(number) {
    // Convert the number to a string so we can split it into an array of digits
    const numberString = number.toString();
    const digits = numberString.split('');
  
    // Convert the array of digits to an array of numbers
    const numbers = digits.map(digit => parseInt(digit, 10));
  
    // Add 30 to each number in the array
    const numbersPlus30 = numbers.map(number => number + 30);
  
    return numbersPlus30;
  }
function addNewVariableToObject(obj, key, value) {
    if (obj.hasOwnProperty(key)) {
      if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else {
        obj[key] = [obj[key], value];
      }
    } else {
      obj[key] = value;
    }
    return obj;
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
function hasFiveOrMoreSameElements(arr) {
    const elementCount = {};
  
    for (let i = 0; i < arr.length; i++) {
      const element = arr[i];
      if (elementCount[element]) {
        elementCount[element]++;
      } else {
        elementCount[element] = 1;
      }
  
      if (elementCount[element] >= 5) {
        return true;
      }
    }
  
    return false;
  }
//check independence
function independent(array1, array2) {
    for (let i = 0; i < array1.length; i++) {
      for (let j = 0; j < array2.length; j++) {
        if (array1[i] === array2[j]) {
          return false;
        }
      }
    }
    return true;
  }
function upperstraightchecking(hand){
    let copy = [...hand].sort((a,b) => b-a);
    //remove all samehand
    const orgsethand = new Set(copy);
    //remake into array
    let sethand = [];
    orgsethand.forEach(function(value){
        sethand.push(value);
    })
    const abshand = [...sethand];
    if (sethand[0]-2 == sethand[2]){
        return[sethand[0],sethand[1],sethand[2]];
    }
    for (let i=0; i<sethand.length;i++){
        if (sethand[i]-2 == sethand[i+2]){
            let hu = true;
            let checklist = [];
            for (let j=0; j<i; j++){   
                checklist[j] = sethand[j]; 
            }
            let ttriplist = checktrips(hand);
            if (ttriplist==false){
                return [abshand[i],abshand[i+1],abshand[i+2]]
            }
            for (let j=0; j<i; j++){
                var constrips =[];
                if(!ttriplist.flat().includes(checklist[j])){
                    hu = false;
                } else{
                    let tempvar = [];
                    tempvar.push(checklist[j]);
                    tempvar.push(checklist[j]);
                    tempvar.push(checklist[j]);
                    constrips.push(tempvar);
                }
            }
            if (!hu){
                return false;
            } else{
                return [abshand[i],abshand[i+1],abshand[i+2]]
            }
        }
    }
    return [0,0,0]; //對對 or not hu
}
function lowerstraightchecking(hand){
    let copy = [...hand].sort((a,b) => a-b);
    //remove all samehand
    const orgsethand = new Set(copy);
    //remake into array
    let sethand = [];
    orgsethand.forEach(function(value){
        sethand.push(value);
    })
    const abshand = [...sethand];
    if (sethand[0]+2 == sethand[2]){
        return[sethand[0],sethand[1],sethand[2]];
    }
    for (let i=0; i<sethand.length;i++){
        if (sethand[i]+2 == sethand[i+2]){
            let hu = true;
            let checklist = [];
            for (let j=0; j<i; j++){   
                checklist[j] = sethand[j]; 
            }
            let ttriplist = checktrips(hand);
            if (ttriplist==false){
                return [abshand[i],abshand[i+1],abshand[i+2]]
            }
            for (let j=0; j<i; j++){
                var constrips =[];
                if(!ttriplist.flat().includes(checklist[j])){
                    hu = false;
                } else{
                    let tempvar = [];
                    tempvar.push(checklist[j]);
                    tempvar.push(checklist[j]);
                    tempvar.push(checklist[j]);
                    constrips.push(tempvar);
                }
            }
            if (!hu){
                return false;
            } else{
                return [abshand[i],abshand[i+1],abshand[i+2]]
            }
        }
    }
    return [0,0,0]; //對對 or not hu
}
//check straight from both side if yes return [upperstraight array, lowerstraight array] if no return false
function checkstraight(hand){
    var constrips =[];
    let list = [lowerstraightchecking(hand), upperstraightchecking(hand)];
    if (list[0]) {
        return list;
    } else{
        return false;
    }
}
//remove straights from hand
function removestraight(myArray,removeArray){
    let copyremoveArray = [...removeArray];
    const filteredArray = myArray.filter((num, index) => {
        if (copyremoveArray.includes(num)) {
            copyremoveArray.splice(copyremoveArray.indexOf(num), 1);
          return false;
        } else {
          return true;
        }
      });
    return filteredArray;
}
/*function removestraight(myArray,removeArray){
    const filteredArray = myArray.filter((num, index) => {
        if (removeArray.includes(num)) {
            removeArray.splice(removeArray.indexOf(num), 1);
          return false;
        } else {
          return true;
        }
      });
    return filteredArray;
}*/
//check for trips return array of all trips, return false if no trips
function checktrips(array) {
    array = [...array].sort((a,b) => a-b);
    let result = [];
    let trigger = false;
    for (let i=0; i < array.length-1; i++){
        if (array[i] == array[i+2]){
            result.push(array[i]);
            trigger = true;
        }
    }
    if (trigger){
        const orgsethand = new Set(result);
        //remake into array
        let sethand = [];
        let subsethand = [];
        orgsethand.forEach(function(value){
            subsethand.push(value);
            subsethand.push(value);
            subsethand.push(value);
            sethand.push(subsethand);
            subsethand = [];
        })
        return sethand;
    }
    return false;
  }
//remove trips
function removetrips(mainarray, referarray){
    for (let i=0; i<referarray.length; i++){
        if((referarray[i]==0)||(referarray[i][0]==0)){
            continue;
        }
        mainarray.splice(mainarray.indexOf(referarray[i][0]),3);
    }
    return mainarray;
}
//check pairs
function checkpairs(array) {
    array = [...array].sort((a,b) => a-b);
    let result = [];
    let trigger = false;
    for (let i=0; i < array.length-1; i++){
        if (array[i] == array[i+1]){
            result.push(array[i]);
            trigger = true;
        }
    }
    if (trigger){
        const orgsethand = new Set(result);
        //remake into array
        let sethand = [];
        orgsethand.forEach(function(value){
            sethand.push(value);
        })
        return sethand;
    }
    return false;
}
//if is a pinghu then must be able to remove straigh from one side completely
function checkpinghu(array) {
    let handcombine = [];
    let straightlist = [];
    if(!(straightlist = lowerstraightchecking(array))){
        return false;
    }
    //console.log(straightlist)
    const removedblock = [...straightlist];
    if (array.length == 0){
        return handcombine;
    }
    if (straightlist[0]==0 || !straightlist){
        return false;
    } else{
        array = removestraight(array,straightlist);
        if(handcombine = checkpinghu(array)){
            handcombine.push(removedblock);
            return handcombine;
        } else{
            return false;
        }
    }
}
//checkhu for a 3x hand
function checkhu(hand) {
    //get basic info of possible combinations
    var triplist = checktrips(hand);
    var constrips = [];
    //console.log(triplist)
    if (triplist==false){
        //console.log("fast leave")
        var pinghutest = [...hand];
        if(checkpinghu(pinghutest)){
            return true;
        } else {
            return false;
        }
    }
    var straightlist = checkstraight(hand);
    //if hand = 0 then hu
    if (hand.length == 0){
        return true;
    }
    //if number not adj. nor trips then no hu
    if (!(straightlist[0] && straightlist[1])){
        return false;
    }
    //console.log("remove required straight");
    //take out straight without including in a trips (first try lowerstraight then try upper repeat until no changes)
    while (true){
        let monitor = true;
        if (independent(straightlist[0],triplist.flat())){
            hand = removestraight(hand,straightlist[0]); //remove tile
            straightlist = checkstraight(hand); //update the list
            monitor = false //reverse monitor if action
        }
        if (!straightlist[0]||!straightlist[1]){
            //console.log("straight list empty", straightlist);
            return false;
        }
        if (independent(straightlist[1],triplist.flat())){
            hand = removestraight(hand,straightlist[1]); //remove tile
            straightlist = checkstraight(hand); //update the list
            monitor = false //reverse monitor if action
        }
        if (!straightlist[0]||!straightlist[1]){
            //console.log("straight list empty", straightlist);
            return false;
        }
        if (monitor || straightlist[0][0]==0 || straightlist[1][0]==0){
            break;
        }
    }
    //take out all trips if no available straight
    if (straightlist[0][0]==0 || straightlist[1][0]==0){
        //console.log("out by no straight")
        triplist = checktrips(hand);
        removetrips(hand,triplist);
        if (hand.length == 0){
            return true;
        } else{
            return false;
        }
    }
    //take out all needed trips
    //console.log("remove trips needed")
    //console.log(hand);
    //console.log(constrips);
    hand = removetrips(hand,constrips);
    //console.log(hand);
    //rergular victory check before entering recursion
    if (hand.length == 0){
        return true;
    }
    //check ping hu
    //console.log("check pinghu");
    //console.log("by hand:", hand)
    pinghutest = [...hand];
    if(checkpinghu(pinghutest)){
        return true;
    }
    triplist = checktrips(hand);
    //check if only one possible trips
    if (triplist.length==1){
        //pick all trips
        //console.log("pick away all trips");
        triplist = checktrips(hand);
        removetrips(hand,triplist);
        if (hand.length == 0){
        return true;
        }
        //check ping hu
        pinghutest = [...hand];
        if(checkpinghu(pinghutest)){
            return true;
        } else{
            return false;
        }

    } else {
        //console.log("Can't dedcuce hand by simple method")
        //console.log("Start solving by exhaustion")
        //console.log("now hand: ",hand)
        const abstrips = [...triplist];
        for (let i=0;i<2**triplist.length;i++){
            let temphand = [...hand];
            let tripsOn = [...abstrips];
            let a = i;
            let count = 0;
            while (true){
                if (a == 0){
                    break;
                }
                if (a%2){
                    tripsOn[count] = 0;
                }
                count++;
                a = Math.floor(a/2);
            }
            removetrips(temphand,tripsOn);
            //check ping hu
            if(checkpinghu(temphand)){
                return true;
            }
            triplist = abstrips;
        }
    }
    //console.log("none of the above")
    return false;
}
//check if a hand is all pair
function allpair(hand) {
    let savehand = [...hand];
    savehand.sort((a,b) => a-b);
    let len = savehand.length;
    for (let j=0; j<len/2;j++) {
        if (savehand[0]==savehand[1]) {
            savehand.splice(0,2);
        }
    }
    if (savehand.length==0) {
        return true;
    } else {
        return false;
    }
}
//hand = [31,31,31,31,32,32,32,32,33,33,33,34,34,34];
//console.log(checkhu(hand));
//check for winning for a 14 length hand
var counter = 0;
function checkWin(winhand, paircounter = 0) {
    //check if the hand is legal
    //console.log("hand is:", winhand)
    if ((winhand.length%3 != 2) && !paircounter){
        console.log("ilegal hand for checkWin")
        winhand.push(abc)
        return false;
    }
    //if hand is empty then its winning
    if (winhand.length == 0){
        return true;
    }
    //first sort the hand
    winhand.sort((a,b) => a-b);
    //get list of pair
    const pairlist = checkpairs(winhand);
    //if no pair must not be a winning hand
    if ((!pairlist) & (paircounter == 0)){
        return false;
    }
    //take away pairs and see if it is winning
    for (let i=0; i<pairlist.length; i++){
        //console.log("remove a pair", pairlist[i])
        //get a copy of hand
        let copyhand = [...winhand];
        //remove the pair
        copyhand.splice(winhand.indexOf(pairlist[i]),2);
        //check if is winning
        if (checkWin(copyhand, paircounter+1)){
            return true;
        }
        
        //console.log("Going to next for loop")
        //console.log("current i: ", i)
        //console.log("current pairlist: ", pairlist)
    }
    //for lines that remove one pairs only, check if is hu
    if (paircounter == 1){
        let copyhand = [...winhand];
        //console.log("checking hu for hand: ", copyhand)
        
        //console.log("Hand to check: ",copyhand)
        let test = '';
        if(test = checkhu(copyhand)){
            var test2 = test;
            //check if the hand is valid
            if (!hasFiveOrMoreSameElements(copyhand)){
                return true;
            }
        }
        //console.log("result: ",test)
    }
    return false;
}
//check for tenpai for normal mahjong hand or use to check win of hand with wild returned object that stored all possible cards that the wild card can be
function checktenpai(hand) {
    //first sort the hand
    hand.sort((a,b) => a-b);
    let validnumber = [11,19,31,32,33,34,35,36,37,38,39,51,52,53,54,55,56,57,58,59,65,69,73,77,81,85,89];
    let tenpaiObj = {};
    let uniqueTiles = [...new Set(hand)]; // Create a list of unique tiles in the hand
    uniqueTiles = uniqueTiles.sort(function(a,b){return a-b});
     
    let adjacentNumbers = [];
    for (let i = 0; i < uniqueTiles.length; i++) {
        let tile = uniqueTiles[i];
        let adjacent = [ tile - 1, tile, tile + 1];
        adjacentNumbers = adjacentNumbers.concat(adjacent);
    }
    let filteredAdjacentNumbers = [...new Set(adjacentNumbers.filter(num => validnumber.includes(num)))];
    // Iterate over each unique tile in the hand and add a random tile to form a 14-tile hand
    //runtime=0;
    //runtime_total=uniqueTiles.length*filteredAdjacentNumbers.length;
    for (let i = 0; i < uniqueTiles.length; i++) {
        if (uniqueTiles.includes(1000)){
            i=uniqueTiles.length-1;
        }
        let tile = uniqueTiles[i];
        let newhand = [...hand];
        newhand.splice(newhand.indexOf(tile),1); // Remove the chosen tile from the hand
        //console.log("Removing tile: ",tile);
        for (let j=0; j < filteredAdjacentNumbers.length; j++){
            let new2hand =  [...newhand];
            //runtime++;
            //console.log("Run time: ",runtime,"/",runtime_total);
            let randomTile = filteredAdjacentNumbers[j];
            new2hand.push(randomTile);  //Add the random tile to the new hand
            //console.log("Adding tile: ",randomTile);
            new2hand = new2hand.sort(function(a,b){return a-b}); // Create a copy of new2hand and sort it
            //console.log("new2hand passed to checkwin: ",new2hand);
            let winTiles = checkWin(new2hand); // Create a copy of new2hand and pass it to checkWin
            new2hand.splice(new2hand.indexOf(randomTile),1);
            //console.log(winTiles);
            // If the new hand is a winning hand, add the winning tiles to the tenpai object
            if (winTiles) {
                addNewVariableToObject(tenpaiObj, tile, randomTile);
            }
        }
    }
    
    return tenpaiObj;
  }
//get the winning combination for a 3x hand
function checkcomb(winninghand, removed = []) {
    //return if hand used up sucessfully
    if (winninghand.length == 0){
        return true;
    }
    //sort the hand
    winninghand.sort((a,b) => a-b);
    //check no. of trips
    let triplist = checktrips(winninghand);
    //take away a trips
    let temphand1 = [...winninghand];
    for (let i=0; i<triplist.length; i++){
        let removeinstance = [];
        removeinstance.push(triplist[i][0]);
        removeinstance.push(triplist[i][0]);
        removeinstance.push(triplist[i][0]);
        removetrips(temphand1,[triplist[i]]);
        if(checkcomb(temphand1, removed)){
            removed[2].push(removeinstance)
            return removed;
        }
    }
    let straightlist = checkstraight(winninghand);
    if (typeof straightlist[0] === 'undefined'){
        return false;
    }
    if (straightlist[0][0] === 0) {
        return false;
    }
    //take away a straight
    let temphand2 = [...winninghand];
    let copylist = [...straightlist];
    temphand2 = removestraight(temphand2,copylist[0]);
    if(checkcomb(temphand2, removed)){
        removed[1].push(straightlist[0])
        return removed;
    }
    return false;

}
//get all possible winning combination for a hand
function allcomb(allcombhand, exposed = [], card = 0) {
    allcombhand.sort((a,b) => a-b);
    //check if the hand is valid
    if (allcombhand.length%3 != 2){
        console.log("invalid hand to allcomb")
        return false;
    }
    //check if contains wildcard
    if (allcombhand.includes(1000)) {
        let list = checktenpai(allcombhand)[1000];
        let templist = [];
        if (typeof list !== 'undefined') {
            if (typeof list === 'number') {
                allcombhand.pop();
                allcombhand.push(list);
                allcombhand.sort((a,b) => a-b);
                templist = templist.concat(allcomb(allcombhand, exposed, list));
                allcombhand.splice(allcombhand.indexOf(list),1);
                allcombhand.push(1000);
            } else {
                for (let i=0; i < list.length; i++) {
                    allcombhand.pop();
                    allcombhand.push(list[i]);
                    allcombhand.sort((a,b) => a-b);
                    templist = templist.concat(allcomb(allcombhand, exposed, list[i]));
                    allcombhand.splice(allcombhand.indexOf(list[i]),1);
                    allcombhand.push(1000);
                }
            }
        }
        return templist;
    }
    //define an array for store info
    let allcomblist = [];
    //get the list of all pairs
    let combpairlist = checkpairs(allcombhand);
    for (let i=0; i<combpairlist.length; i++){
        allcombhand.splice(allcombhand.indexOf(combpairlist[i]),2); //delete a pair
        // check if is winning
        let comb = [[[combpairlist[i],combpairlist[i]],[],[]], exposed, card];
        if(comb[0] = checkcomb(allcombhand,comb[0])){
            let comb1 = JSON.parse(JSON.stringify(comb));
            allcomblist.push(comb1);
            if (comb[0][2].length >=3) {
                if (comb[0][2][0][0] == comb[0][2][2][0]+2) {
                    comb[0][1].push([comb[0][2][0][0],comb[0][2][0][0]-1,comb[0][2][0][0]-2]);
                    comb[0][1].push([comb[0][2][0][0],comb[0][2][0][0]-1,comb[0][2][0][0]-2]);
                    comb[0][1].push([comb[0][2][0][0],comb[0][2][0][0]-1,comb[0][2][0][0]-2]);
                    comb[0][2].splice(0,3);
                    allcomblist.push(comb);
                }
            }
            if (comb[0][2].length >=4) {
                if (comb[0][2][1][0] == comb[0][2][3][0]+2) {
                    comb[0][1].push([comb[0][2][1][0],comb[0][2][1][0]-1,comb[0][2][1][0]-2]);
                    comb[0][1].push([comb[0][2][1][0],comb[0][2][1][0]-1,comb[0][2][1][0]-2]);
                    comb[0][1].push([comb[0][2][1][0],comb[0][2][1][0]-1,comb[0][2][1][0]-2]);
                    comb[0][2].splice(1,3);
                    allcomblist.push(comb);
                }
            }
        } 
        allcombhand.push(combpairlist[i]);
        allcombhand.push(combpairlist[i]); //add back the pair
        allcombhand.sort((a,b) => a - b);
    }
    return allcomblist;

}
//check if a hand with one wild card is tenpai return the tile waiting list empty if noten
function tenpaiSQ(SQhand, exposed = []) {
    // check if hand is valid
    if ((SQhand.length % 3 != 2) || (!SQhand.includes(1000))) {
        console.log("invalid hand for tenpaiSQ")
        return false;
    }
    //first sort the hand
    SQhand.sort((a,b) => a-b);
    let validnumber = [11,19,31,32,33,34,35,36,37,38,39,51,52,53,54,55,56,57,58,59,65,69,73,77,81,85,89];
    let tenpaiSQObj = {};
    let uniqueTiles = [...new Set(SQhand)]; // Create a list of unique tiles in the hand
    uniqueTiles = uniqueTiles.sort(function(a,b){return a-b});
    uniqueTiles.pop()
    let adjacentNumbers = [];
    for (let i = 0; i < uniqueTiles.length; i++) {
        let tile = uniqueTiles[i];
        let adjacentSQ = [ tile - 2,tile - 1, tile, tile + 1, tile + 2];
        adjacentNumbers = adjacentNumbers.concat(adjacentSQ);
    }
    let filteredAdjacentNumbers = [...new Set(adjacentNumbers.filter(num => validnumber.includes(num)))];
    // Iterate over each unique tile in the hand and add a random tile to form a 14-tile hand
    //runtime=0;
    //runtime_total=uniqueTiles.length*filteredAdjacentNumbers.length;
    for (let i = 0; i < uniqueTiles.length; i++) {
        let tileSQ = uniqueTiles[i];
        let new3hand = [...SQhand];
        new3hand.splice(new3hand.indexOf(tileSQ),1); // Remove the chosen tile from the hand
        //check tenpai for all
        new3hand.pop();
        if (checkhu(new3hand) || allpair(new3hand)) {
            addNewVariableToObject(tenpaiSQObj, tileSQ, validnumber);
            continue;
        }
        new3hand.push(1000);
        //console.log("Removing tile: ",tile);
        for (let j=0; j < filteredAdjacentNumbers.length; j++){
            let new4hand =  [...new3hand];
            //runtime++;
            //console.log("Run time: ",runtime,"/",runtime_total);
            let randomTileSQ = filteredAdjacentNumbers[j];
            new4hand.push(randomTileSQ); // Add the random tile to the new hand
            //console.log("Adding tile: ",randomTile);
            new4hand = new4hand.sort(function(a,b){return a-b}); // Create a copy of new2hand and sort it
            //console.log("pass new2hand to check tenpai: ", new4hand);
            let tenpaiinfo = checktenpai(new4hand);
            let winTiles = !(typeof tenpaiinfo[1000] === 'undefined'); // Create a copy of new2hand and pass it to checkWin
            //console.log("Is it Tenpai: ", winTiles);
            //double check if win is valid
            //convert winning hand into real hand without wildcard
            
            
            //console.log(winTiles);
            // If the new hand is a winning hand, add the winning tiles to the tenpai object
            if (winTiles) {
                let trigger = false;
                    if (!typeof tenpaiinfo[1000].length === 'undefined'){
                        for (i=0;i<tenpaiinfo[1000].length;i++){
                            let new5hand = [...new4hand];
                            new5hand.sort((a,b) => a-b);
                            new5hand.pop();
                            new5hand.push(tenpaiinfo[1000][i]);
                            if (exposed.length>0){
                                new5hand.push(exposed);
                                new5hand.flat();
                            }
                            if (!hasFiveOrMoreSameElements(new5hand)) {
                                trigger = true;
                            }
                        }
                        
                    } else {
                        let new5hand = [...new4hand];
                        new5hand.sort((a,b) => a-b);
                        new5hand.pop();
                        new5hand.push(tenpaiinfo[1000]);
                        if (exposed.length>0){
                            new5hand.push(exposed);
                            new5hand.flat();
                        }
                        if (hasFiveOrMoreSameElements(new5hand)) {
                            trigger = true;
                        }
                    }
                    
                
                if (trigger) {
                    winTiles = false;
                }
            }
            if (winTiles) {
                addNewVariableToObject(tenpaiSQObj, tileSQ, randomTileSQ);
            }    
            new4hand.splice(new4hand.indexOf(randomTileSQ),1);//remove the tile
        }
    }

    return tenpaiSQObj;
}
console.log(allcomb([11,11,11,12,12,12,15,15,15,18,18,18,35,1000]))
export { checkpinghu, checkhu, checkWin, checktenpai, checkcomb, allcomb, tenpaiSQ};
//hand = [31, 31, 32, 32, 32, 33, 34, 35, 36, 37, 38, 39, 39, 39];
//hand = [11,31,31,31,32,32,33,33,34,34,35,35,57,1000];
//hand = [
//    31, 31, 31,   32, 32,
//    33, 33, 33,   34, 34,
//    35, 35, 57, 1000
 // ]
//hand = unzip(1111223344459);
//hand.push(1000);
//console.log(checktenpai(hand));
//console.log(checkhu(hand))
//console.log(checkWin(hand))
//console.log(checkcomb(hand))
//console.log(allcomb(hand))
/*handsreflash = 0;
while (true){
    handsreflash++;
    wall = [];
    hand = [];
    constrips =[];
    for (let i=0;i<card.length;i++){
        for(let j=0;j<4;j++){
            wall.push(card[i]);
        }
    }
    wall = shuffle(shuffle(wall));
    for (i=0;i<13;i++){
        hand.push(wall.pop());
    }
    hand.sort((a,b) => a-b)
    hand.push(1000);
    if (typeof checktenpai(hand)[1000] === 'undefined'){
        break;
    }
    }
//console.log(checkhu(hand))
//console.log(checkWin(hand))
//console.log(checktenpai(hand));
console.log(tenpaiSQ(hand))
console.log("the hand is: ", hand)
console.log("take ",handsreflash," times reflash to get the hand")*/