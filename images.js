function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
function addstacktile(card){
    let doubletile = document.createElement("div");
    let tile1 = document.createElement("div");
    tile1.classList.add("exptile1", card);
    tile1.style.backgroundImage = "url('Regular/"+card+".png')";
    doubletile.classList.add("doubletile");
    doubletile.appendChild(tile1);
    let tile2 = document.createElement("div");
    tile2.classList.add("exptile2", card);
    tile2.style.backgroundImage = "url('Regular/"+card+".png')";
    doubletile.classList.add("doubletile");
    doubletile.appendChild(tile2);
    let playerHand = document.getElementById("player-exposed");
    playerHand.appendChild(doubletile);
}
//update hand on screen
function updateplayerhand(hand,exposed =[]) {
    //update player hand
    let playerHand = document.getElementById("player-hand");
    var card = 0;
    var tile = 0;
    removeAllChildNodes(playerHand);
    for (let i = 0; i < hand.length; i++) {
        card = hand[i];
        if (card == 1000){
            continue;
        }
        tile = document.createElement("div");
        tile.classList.add("tile", card ,"hand");
        if (!i) {
            tile.style.marginLeft = '40px';
        }
        tile.addEventListener("click", function() {
            socket.emit('action', elements.classList(1));
        });
        tile.style.backgroundImage = "url('Regular/"+card+".png')";
        playerHand.appendChild(tile);
        
    }
    //update player exposed
    playerHand = document.getElementById("player-exposed");
    removeAllChildNodes(playerHand);
    if (exposed.length>0) {
        for (let i=exposed.length-1; i>=0; i--) {
            //check type
            switch (exposed[i][1][1]) {
                case 0: //暗槓
                    for (let j=0; j < 4; j++) {
                        card = exposed[i][0][j];
                        tile = document.createElement("div");
                        tile.classList.add("exptile", card);
                        tile.style.backgroundImage = "url('Regular/"+card+".png')";
                        if (j==0 || j==3) {
                            tile.style.backgroundImage ="url('Regular/Back.png')";
                        }
                        playerHand.appendChild(tile);
                    }
                    break;
                case 1: //明槓
                    for (let j=0; j < 4; j++) {
                        card = exposed[i][0][j];
                        tile = document.createElement("div");
                        tile.classList.add("exptile", card);
                        tile.style.backgroundImage = "url('Regular/"+card+".png')";
                        switch (exposed[i][1][0]) {
                            case 1: //下家
                                if (j==3) {
                                    tile.style.transform = 'rotate(90deg)';
                                    tile.style.marginLeft = '4px';
                                    tile.style.marginRight = '11px';
                                    tile.style.top = '18px'
                                }
                                break;
                            case 2: //對家
                                if (j==1) {
                                    tile.style.transform = 'rotate(90deg)';
                                    tile.style.marginLeft = '4px';
                                    tile.style.marginRight = '11px';
                                    tile.style.top = '18px'
                                }
                                break;
                            case 3: //上家
                                if (j==0) {
                                    tile.style.transform = 'rotate(90deg)';
                                    tile.style.marginLeft = '4px';
                                    tile.style.marginRight = '11px';
                                    tile.style.top = '18px'
                                }
                                break;
                        }
                        playerHand.appendChild(tile);
                    }
                    break;
                case 2: //加槓
                    switch (exposed[i][1][0]) {
                        case 1: //下家
                            addstacktile(exposed[i][0][0]);
                            card = exposed[i][0][0];
                            tile = document.createElement("div");
                            tile.classList.add("exptile", card);
                            tile.style.backgroundImage = "url('Regular/"+card+".png')";
                            playerHand.appendChild(tile);
                            tile = document.createElement("div");
                            tile.classList.add("exptile", card);
                            tile.style.backgroundImage = "url('Regular/"+card+".png')";
                            playerHand.appendChild(tile);
                            break;
                        case 2: //對家
                            card = exposed[i][0][0];
                            tile = document.createElement("div");
                            tile.classList.add("exptile", card);
                            tile.style.backgroundImage = "url('Regular/"+card+".png')";
                            playerHand.appendChild(tile);
                            addstacktile(exposed[i][0][0]);
                            tile = document.createElement("div");
                            tile.classList.add("exptile", card);
                            tile.style.backgroundImage = "url('Regular/"+card+".png')";
                            playerHand.appendChild(tile);
                            break;
                        case 3: //上家
                            card = exposed[i][0][0];
                            tile = document.createElement("div");
                            tile.classList.add("exptile", card);
                            tile.style.backgroundImage = "url('Regular/"+card+".png')";
                            playerHand.appendChild(tile);
                            tile = document.createElement("div");
                            tile.classList.add("exptile", card);
                            tile.style.backgroundImage = "url('Regular/"+card+".png')";
                            playerHand.appendChild(tile);
                            addstacktile(exposed[i][0][0]);
                            break;
                    }
                    break; //break case2                  
                case 3: //吃
                    card = exposed[i][0][2];
                    tile = document.createElement("div");
                    tile.classList.add("exptile", card);
                    tile.style.backgroundImage = "url('Regular/"+card+".png')";
                    tile.style.transform = 'rotate(90deg)';
                    tile.style.marginLeft = '4px';
                    tile.style.marginRight = '11px';
                    tile.style.top = '18px'
                    playerHand.appendChild(tile);
                    card = exposed[i][0][1];
                    tile = document.createElement("div");
                    tile.classList.add("exptile", card);
                    tile.style.backgroundImage = "url('Regular/"+card+".png')";
                    playerHand.appendChild(tile);
                    card = exposed[i][0][0];
                    tile = document.createElement("div");
                    tile.classList.add("exptile", card);
                    tile.style.backgroundImage = "url('Regular/"+card+".png')";
                    playerHand.appendChild(tile);
                    break; //break case3
                case 4: //碰
                    for (let j=0; j < 3; j++) {
                        card = exposed[i][0][j];
                        tile = document.createElement("div");
                        tile.classList.add("exptile", card);
                        tile.style.backgroundImage = "url('Regular/"+card+".png')";
                        switch (exposed[i][1][0]) {
                            case 1: //下家
                                if (j==2) {
                                    tile.style.transform = 'rotate(90deg)';
                                    tile.style.marginLeft = '4px';
                                    tile.style.marginRight = '11px';
                                    tile.style.top = '18px'
                                }
                                break;
                            case 2: //對家
                                if (j==1) {
                                    tile.style.transform = 'rotate(90deg)';
                                    tile.style.marginLeft = '4px';
                                    tile.style.marginRight = '11px';
                                    tile.style.top = '18px'
                                }
                                break;
                            case 3: //上家
                                if (j==0) {
                                    tile.style.transform = 'rotate(90deg)';
                                    tile.style.marginLeft = '4px';
                                    tile.style.marginRight = '11px';
                                    tile.style.top = '18px'
                                }
                                break;
                        }
                        playerHand.appendChild(tile);
                    }
                break; //break case4
            }
        }
    }
}
//turn on button num
function enablebutton(num) {
//create a button
var button = document.createElement("button");
//get the button area
const buttonarea = document.getElementById("button-area");
switch (num) {
    case 0: //吃
        //set the text
        button.innerHTML = "吃";
        //add an event listener
        button.addEventListener("click", function(){
            alert("Chi!!!");
        });
        //give class and id to it
        button.classList.add("action-button");
        button.id = 'button-0';
        //child the button to the area
        buttonarea.appendChild(button);
        break;
    case 1: //碰
        //set the text
        button.innerHTML = "碰";
        //add an event listener
        button.addEventListener("click", function(){
            alert("Pong!!!");
        });
        //give class and id to it
        button.classList.add("action-button");
        button.id = 'button-1';
        //child the button to the area
        buttonarea.appendChild(button);
        break;
    case 2: //明槓
        //set the text
        button.innerHTML = "槓";
        //add an event listener
        button.addEventListener("click", function(){
            alert("Kan!!!");
        });
        //give class and id to it
        button.classList.add("action-button");
        button.id = 'button-2';
        //child the button to the area
        buttonarea.appendChild(button);
        break;
    case 3: //暗槓or加槓
        //set the text
        button.innerHTML = "槓";
        //add an event listener
        button.addEventListener("click", function(){
            alert("Kan!!!");
        });
        //give class and id to it
        button.classList.add("action-button");
        button.id = 'button-3';
        //child the button to the area
        buttonarea.appendChild(button);
        break;
    case 4: //立直
        //set the text
        button.innerHTML = "立直";
        //add an event listener
        //button.addEventListener("click", function(){
        //    alert("riichi!!!");
        //});
        //give class and id to it
        button.classList.add("action-button");
        button.id = 'button-4';
        //child the button to the area
        buttonarea.appendChild(button);
        break;
    case 5: //開立直
        //set the text
        button.innerHTML = "開立直";
        //add an event listener
        button.addEventListener("click", function(){
            alert("open-riici!!!");
        });
        //give class and id to it
        button.classList.add("action-button");
        button.id = 'button-5';
        //child the button to the area
        buttonarea.appendChild(button);
        break;
    case 6: //榮和
        //set the text
        button.innerHTML = "榮和";
        //add an event listener
        button.addEventListener("click", function(){
            alert("Ron!!!");
        });
        //give class and id to it
        button.classList.add("action-button");
        button.id = 'button-6';
        //child the button to the area
        buttonarea.appendChild(button);
        break;
        break;
    case 7: //自摸
        //set the text
        button.innerHTML = "自摸";
        //add an event listener
        button.addEventListener("click", function(){
            alert("zumo!!!");
        });
        //give class and id to it
        button.classList.add("action-button");
        button.id = 'button-7';
        //child the button to the area
        buttonarea.appendChild(button);
        break;
    case 8: //跳過
        //set the text
        button.innerHTML = "跳過";
        //add an event listener
        button.addEventListener("click", function(){
            alert("skip!!!");
        });
        //give class and id to it
        button.classList.add("action-button");
        button.id = 'button-9';
        //child the button to the area
        buttonarea.appendChild(button);
        break;
        break;    
    default: console.error("Invalid number of button")
}
}
export {updateplayerhand, enablebutton};