const canvas = document.getElementById("game_canvas");
const ctx = canvas.getContext("2d");
const screen = document.getElementById("game-wrapper");
const game_lose = document.getElementById("lose-gif");
const cmbtmr = document.getElementById("combotmr");

game_lose.src = "images/explosion.gif";

const game_vals = {
    x : 10,
    xx : 4,
    y : 2500,
    yy : 10,
    lvl : 0,
    lvli : 1000,
    lvlts : 0,
    lvltsArr : {},
    lvltsi : {},
    scale : 40,
    ga : [],
    gad : {},
    lvlArr : [],
    lvlb : {},
    state : "booting",
    wo : {},
    lo : {},
}

const crossy = {
    x : 7,
    y : 0,
    k : "",
    anii : 1,
    anits : 0,
    aniint : 100,
    kpint : 100,
    kpts : 0,
    score : 0,
    y_prev: 0,
    count : 0, //# of space
    lastspc: 0, //time since last space (forward jump)
    bonus: 0, //bonus points
    bonuspts: 3, //points per combo
    mxcombo: 0, //highest combo
    combo: 0, //current combo
    time: 3, //time limit to retain combo
    timerID : null //used to reset timer
}

var j_sound = new Audio("audio/jump.mp3");
var d_sound = new Audio("audio/die.mp3");
var bg_sound = new Audio("audio/bg_music.mp3");

function redirectToWebsite(url){
    window.location.href = url;
}

window.addEventListener("keydown", (e) => {
    
    if (game_vals.state === "playing") {
        if (crossy.k === "") {
            
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    crossy.k = "Space";
                    break;
                case "KeyA":
                case "ArrowLeft":
                    crossy.k = "KeyA";
                    break;
                case "KeyD":
                case "ArrowRight":
                    crossy.k = "KeyD";
                    break;
                case "KeyS":
                case "ArrowDown":
                    crossy.k = "KeyS";
                    break;
                case "Space":
                    crossy.k = "Space";
                    break;
            }
        }
    }
})

bg_sound.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

var imgList = ["froggy.png", "obstacles.png"];
var imgArr = {};
var imgAni = {};
imgAni["froggy"] = [0, 139, 278, 417, 556, 695, 834, 973, 1112, 1251, 1390, 1529];

var imgObs = {};
imgObs["moat"] = [1023, 267, 144, 72];
imgObs["lvltiles"] = [324, 417, 47, 52];
imgObs["road"] = [138, 955, 81, 80];
imgObs["water"] = [674, 963, 83, 56];
// Road
imgObs["cr1"] = [169, 501, 149, 120];
imgObs["cr2"] = [346, 501, 149, 120];
imgObs["cr3"] = [524, 501, 149, 120];
imgObs["cl1"] = [675, 681, 149, 120];
imgObs["cl2"] = [853, 681, 149, 120];
imgObs["cl3"] = [1031, 681, 149, 120];

// Water
imgObs['ww1'] = [844, 147, 103, 75];
imgObs['ww2'] = [848, 95, 80, 47];
imgObs['ww3'] = [670, 410, 143, 63];
imgObs['ww4'] = [670, 410, 143, 63];

//lvl designs
imgObs['ld1'] = [863, 269, 124, 70];
imgObs['ld2'] = [700, 266, 124, 70];
// imgObs['ld3'] = [863, 269, 124, 70];
// imgObs['ld4'] = [700, 266, 124, 70];

//froggy 139 x 117

check_allow_config();

function check_allow_config() {
    
    let r_data = {};
    r_data['cmd'] = "check_allow_config";
    
    // Calling API's
    $.ajax({
        url : "api/crossy_db.php",
        type : "post",
        data : r_data,
        success : (res) => {
            if (JSON.parse(res)['crsc_on'] != 1) {
                alert("Game access not allowed");
                document.body.innerHTML = "";
            } else {
                setTimeout( () => {
                    check_allow_config();
                }, 5000);
            }
        }
    })

}

function update_score_db() {
    
    let f_data = {};
    f_data['cmd'] = "update_score";
    f_data['score'] = crossy.score;
    f_data['name'] = document.getElementById("name").value;
    f_data['data'] = crossy;
    f_data['combo'] = crossy.mxcombo;
    
    $.ajax({
        url : "api/crossy_db.php",
        type : "post",
        data : f_data,
        success : (res) => {

            setTimeout( () => {
                update_score_db();
            }, 3000);

        }
    })

}

boot_process(0, imgList.length, imgList)
function boot_process(i = 0, m = 0, arr = []) {

    if (i >= m) {
        // initialize();
        document.getElementById("play_button").style.display = "block";
        window.requestAnimationFrame(update);
        return;
    }
    

    let tmpI = new Image();
    tmpI.src = "images/" + arr[i];

    tmpI.onload = () => {

        let t = arr[i].split(".");
        imgArr[t[0]] = tmpI;
        i++;
        boot_process(i, m, arr);
    }

}

function play_now() {
    let nme = document.getElementById("name");
    if (nme.value) {
        document.getElementById("play_button").style.display = "none";
        update_score_db();
        initialize();
    } else {
        alert("Please input name and team");
        nme.focus();
    }
    
}

function initialize() {

    game_lose.style.display = "none";

    game_vals.ga = [];

    crossy.x = Math.round(game_vals.x / 2);
    crossy.y = 0;
    crossy.k = "";
    crossy.anii = 1;
    crossy.anits = 0;
    crossy.aniint = 100;
    crossy.kpint = 100;
    crossy.kpts = 0;
    crossy.score = 0;
    crossy.y_prev = 0;
    crossy.count = 0; 
    crossy.lastspc = 0; 
    crossy.bonus = 0; 
    crossy.bonuspts = 3; 
    crossy.mxcombo = 0; 
    crossy.combo = 0; 
    crossy.time = 3; 
    crossy.timerID = null; 


    // canvas.width = (game_vals.x - game_vals.xx) * game_vals.scale;
    canvas.width = game_vals.x * game_vals.scale;
    canvas.height = game_vals.yy * game_vals.scale;
    screen.width = game_vals.x * game_vals.scale;
    screen.height = game_vals.yy * game_vals.scale;
    let lvl = 1;
    let tl = 0;
    

    let lvlbl = ["road", "road", "road", "water"];

    for (let y = 0; y < game_vals.y; y++) {
        let tmpA = [];
        

        if (tl == lvl) {
            // Design backrounds
            game_vals.gad[y] = 2; // static
            game_vals.lvlArr.push(y);

        } else {

            game_vals.lvlb[y] = lvlbl[random(3, 0)];
            // game_vals.lvlb[y] = "road";
            game_vals.lvltsArr[y] = 0;
            game_vals.lvltsi[y] = random(1000, 600);

            if (game_vals.lvlb[y] != "road") {
                game_vals.gad[y] = 2;
            } else {
                if (random(1, 0) > 0) {
                    game_vals.gad[y] = 1;
                } else {
                    game_vals.gad[y] = 0;
                }
            }
            

        }

        for (let x = 0; x < game_vals.x; x++) {

            if (y == 0) {
                tmpA.push(0);
                // Moat design
            } else if (tl == lvl) {
                tmpA.push(0);
                // no obstacles
                if (random(9, 0) > 6) {
                    if (!game_vals.lo[y]) { game_vals.lo[y] = {} }
                    game_vals.lo[y][tmpA.length - 1] = "ld" + random(2, 1);
                }
            } else {
                if (random(9, 0) > 2) {
                    tmpA.push(0);
                    if (game_vals.lvlb[y] === "water") {
                        if (!game_vals.wo[y]) { game_vals.wo[y] = {} }
                        game_vals.wo[y][tmpA.length - 1] = "ww" + random(4, 1);
                    }
                    
                } else {

                    if (game_vals.lvlb[y] === "road") {

                        if (game_vals.gad[y] == 1) {
                            tmpA.push("cl" + random(3,1));
                        } else {
                            tmpA.push("cr" + random(3,1));
                        }
                    } else if (game_vals.lvlb[y] === "water") {
                        tmpA.push("water");
                    } else {
                        tmpA.push(0);
                    }
                }
            }
        }    

        if (tl >= lvl) { 
            tl = 0;
            lvl++; 
        }

        if (y > 0) { tl++; }
        game_vals.ga.push(tmpA);
    }

    game_vals.state = "playing";

}



function game_mechanics(ts) {
    
    let gy = crossy.y >= 4 ? 4 : 0;
    let iy = 0;
    for (let y = crossy.y - gy; y < game_vals.y; y++) {
        
        if (y == 0) { continue; }
        if (iy >= game_vals.yy * 2) { break; }
        if (game_vals.lvltsArr[y] >= 0 && (ts - game_vals.lvltsArr[y] >= game_vals.lvltsi[y])) {
            if (game_vals.gad[y] == 1) {
                game_vals.ga[y].push(game_vals.ga[y].shift());
            } else if (game_vals.gad[y] == 0) {
                game_vals.ga[y].splice(0, 0, game_vals.ga[y].pop());
            }
            game_vals.lvltsArr[y] = ts;
        }
        
        iy++;
    }
    game_vals.lvlts = ts;

}

function check_status(ts) {
    

    if (game_vals.lvlb[crossy.y] === "road") {
        let xs;
        if (game_vals.lvltsArr[crossy.y] >= 0 && (ts - game_vals.lvltsArr[crossy.y] < game_vals.lvltsi[crossy.y])) { xs = (1 * (Math.round(ts - game_vals.lvltsArr[crossy.y]) / game_vals.lvltsi[crossy.y])); }
        if (game_vals.ga[crossy.y][crossy.x]) {
            if (xs < .60) { 
                game_vals.state = "game_over"; 
            }
        }

        if (game_vals.gad[crossy.y] == 1) {
            if (crossy.x + 1 <= game_vals.x  && game_vals.ga[crossy.y][crossy.x + 1]) {
                if (xs > .40) { 
                    game_vals.state = "game_over"; 
                }
            }
        } else {
            if (crossy.x - 1 >= 0 && game_vals.ga[crossy.y][crossy.x - 1]) {
                if (xs > .60) { 
                    game_vals.state = "game_over"; 
                }
            }
        }
    } else {
        if (game_vals.ga[crossy.y][crossy.x]) {
            game_vals.state = "game_over";
        }
    }

    // score = row # + bonus points
    crossy.score = crossy.y + crossy.bonus;

}

function score_check() {
    document.getElementById("score").innerText = crossy.score;
}

function combo_check() {
    document.getElementById("combo").innerText = crossy.combo;
}

function draw(ts) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let iy = 0;
    let gy = crossy.y >= 4 ? crossy.y - 4 : 0;

    for (let y = gy; y < game_vals.y; y++) {
    // for (let y = crossy.y; y < game_vals.y; y++) {
    
        if (iy >= game_vals.yy) { 
            break; 
        }

        for (let x = 0; x < game_vals.x; x++) {
            if (game_vals.lvlb[y]) {
                ctx.save();
                // ctx.fillRect(x * game_vals.scale, (game_vals.yy - 1 - iy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);
                ctx.drawImage(imgArr["obstacles"], imgObs[game_vals.lvlb[y]][0], imgObs[game_vals.lvlb[y]][1], imgObs[game_vals.lvlb[y]][2], imgObs[game_vals.lvlb[y]][3], x * game_vals.scale, (game_vals.yy - 1 - iy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);
                ctx.restore();
                if (game_vals.lvlb[y] === "water") {
                    if (game_vals.wo[y] && game_vals.wo[y][x]) {
                        ctx.save();
                        ctx.drawImage(imgArr["obstacles"], imgObs[game_vals.wo[y][x]][0], imgObs[game_vals.wo[y][x]][1], imgObs[game_vals.wo[y][x]][2], imgObs[game_vals.wo[y][x]][3], (x * game_vals.scale), (game_vals.yy - 1 - iy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);
                        ctx.restore();
                    }
                }
            }
        }
        
        for (let x = 0; x < game_vals.x; x++) {
            
            if (y == 0) {
                ctx.save();
                // ctx.fillRect(x * game_vals.scale, (game_vals.yy - 1 - iy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);
                ctx.drawImage(imgArr["obstacles"], imgObs["moat"][0], imgObs["moat"][1], imgObs["moat"][2], imgObs["moat"][3], x * game_vals.scale, (game_vals.yy - 1 - iy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);
                ctx.restore();

            } else {

                if (game_vals.lvlArr.includes(y)) {
                    ctx.save();
                    // ctx.fillRect(x * game_vals.scale, (game_vals.yy - 1 - iy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);
                    ctx.drawImage(imgArr["obstacles"], imgObs["lvltiles"][0], imgObs["lvltiles"][1], imgObs["lvltiles"][2], imgObs["lvltiles"][3], x * game_vals.scale, (game_vals.yy - 1 - iy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);

                    if (game_vals.lo[y] && game_vals.lo[y][x]) {
                        ctx.drawImage(imgArr["obstacles"], imgObs[game_vals.lo[y][x]][0], imgObs[game_vals.lo[y][x]][1], imgObs[game_vals.lo[y][x]][2], imgObs[game_vals.lo[y][x]][3], x * game_vals.scale, (game_vals.yy - 1 - iy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);
                    }

                    ctx.restore();

                }


                if (game_vals.lvlb[y] === "road") {
                    if (game_vals.ga[y][x]) {
                        // Transition
                        let xs;
                        if (game_vals.lvltsArr[y] >= 0 && (ts - game_vals.lvltsArr[y] < game_vals.lvltsi[y])) {
                            xs = (1 * (Math.round(ts - game_vals.lvltsArr[y]) / game_vals.lvltsi[y])) * game_vals.scale;
                            if (game_vals.gad[y] == 1) {
                                xs = xs * -1;
                            }
                        }
                        ctx.save();
                        ctx.drawImage(imgArr["obstacles"], imgObs[game_vals.ga[y][x]][0], imgObs[game_vals.ga[y][x]][1], imgObs[game_vals.ga[y][x]][2], imgObs[game_vals.ga[y][x]][3], (x * game_vals.scale) + xs, (game_vals.yy - 1 - iy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);
                        
                        ctx.restore();
                    }
                } else if (game_vals.lvlb[y] === "water") {
                    if (game_vals.ga[y][x]) {
                        ctx.save();
                        ctx.drawImage(imgArr["obstacles"], imgObs[game_vals.ga[y][x]][0], imgObs[game_vals.ga[y][x]][1], imgObs[game_vals.ga[y][x]][2], imgObs[game_vals.ga[y][x]][3], (x * game_vals.scale), (game_vals.yy - 1 - iy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);
                        
                        ctx.restore();
                    }
                }

            }
        }
        iy++;
        
    }

    let pgy = crossy.y <= 4 ? crossy.y : 4;
    ctx.save();
    //hitbox
    // ctx.fillStyle = "green";
    // ctx.fillRect(crossy.x * game_vals.scale, (game_vals.yy - 1 - pgy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);
    // let ia = imgAni['froggy'];
    
    ctx.drawImage(imgArr['froggy'], imgAni['froggy'][crossy.anii], 0, 139, 117, crossy.x * game_vals.scale, (game_vals.yy - 1 - pgy) * game_vals.scale, 1 * game_vals.scale, 1 * game_vals.scale);
    //ctx. drawImage(source, source_x, source_y, source_w, source_h, dest_x, dest_y, dest_w, dest_h)
    
    ctx.restore();
    


}

function anim_proc(ts) {

    if (ts - crossy.anits >= crossy.aniint) {
        
        switch (crossy.anii) {
            case 0:
                crossy.anii = 2;
                break;
            case 2:
                crossy.anii = 3;
                break;
            case 3:
                crossy.anii = 1;
                break;
            case 9:
                crossy.anii = 10;
                break;
            case 10:
                crossy.anii = 11;
                break;
            case 11:
                crossy.anii = 8;
                break;
            case 6:
                crossy.anii = 5;
                break;
            case 5:
                crossy.anii = 4;
                break;
            case 4:
                crossy.anii = 7;
                break;
        }

        crossy.anits = ts;
    }

}

function update(ts) {

    if (game_vals.state === "booting") { 
        window.requestAnimationFrame(update); 
        return;
    }
    check_status(ts);
    if (game_vals.state === "game_over") {
        // redirectToWebsite('http://192.168.70.203/pbubble/');
        if (crossy.timerID){
            clearTimeout(crossy.timerID);
            crossy.timerID = null;
        }
        cmbtmr.innerText = "";
        // crossy.timerID = null;
        // clearTimeout(crossy.timerID);
        // combotimer(3);
        play_sound(d_sound);
        // // alert("Game Over");

        
        game_lose.style.display = 'block';

        
        setTimeout( () => {
            initialize();
            window.requestAnimationFrame(update);
        }, 1500);
        return;
    }
    
    game_mechanics(ts);
    anim_proc(ts);
    // add ts so as not to spam

    //movement animation
    if (ts - crossy.kpts >= crossy.kpint) {
        if (crossy.k != "") {
            switch (crossy.k) {
                case "KeyA":
                    if (crossy.x > 0) { 
                        crossy.anii = 6;
                        crossy.x--; 
                    }
                    play_sound(j_sound);
                    // crossy.count = 0;
                    // crossy.combo = 0;
                    break;

                case "KeyD":
                    if (crossy.x < game_vals.x - 1) { 
                        crossy.anii = 10;
                        crossy.x++; 
                    }
                    // crossy.count = 0;
                    // crossy.combo = 0;
                    play_sound(j_sound);
                    break;

                case "KeyS":
                    if (crossy.y > 0) { crossy.y--; }
                    crossy.anii = 0;
                    crossy.count = 0;
                    crossy.combo = 0;
                    play_sound(j_sound);
                    break;
                    
                case "Space":
                    //check time limit for combo
                    if(ts - crossy.lastspc > 3000){
                        crossy.count = 0;
                        crossy.combo = 0;
                    }
                    
                    play_sound(j_sound);

                    //check if player is actually moving forward (check if space is valid)
                    if (crossy.y == crossy.y_prev){
                        crossy.count++;
                        crossy.lastspc = ts;

                        if (crossy.count >= 3){
                            //increase score per jump
                            crossy.bonus += crossy.bonuspts;
                            console.log("orig score", crossy.y)
                            console.log("bonus points", crossy.bonus)
                            crossy.combo ++;

                            if (crossy.combo > crossy.mxcombo){
                                crossy.mxcombo = crossy.combo;
                            }
                            combotimer();
                        }
                        crossy.y_prev++;    
                    }

                    // Obstacle
                    if (!game_vals.lo[crossy.y + 1] || (game_vals.lo[crossy.y + 1] && game_vals.lo[crossy.y + 1][crossy.x] != "ld1")) {
                        crossy.y++;    
                    }
                    crossy.anii = 0;
                    break;
            }
            crossy.k = "";
        }
        crossy.kpts = ts;
    }
    score_check();
    combo_check();
    draw(ts);
    
    window.requestAnimationFrame(update);

}

function combotimer(t=0){
    //reset timer if new one starting
    if (t === 0 && crossy.timerID){
        clearTimeout(crossy.timerID);
        crossy.timerID = null;
    }
    
    //clear timer if finished
    if (t >= crossy.time){
        cmbtmr.innerText = "";
        crossy.timerID = null;
        return;
    }

    // if (!crossy.timerID) {
    //     cmbtmr.innerText = "";
    // }

    let remainingtime = crossy.time - t;
    cmbtmr.innerText = remainingtime + "s";

    //recursive function
    crossy.timerID = setTimeout(() => {
            t++;
            return combotimer(t);
    }, 1000);

}

function play_sound(sfx){
    if (sfx) {
        sfx.pause();
        sfx.currentTime = 0;
    }

    sfx.play();
}


/**
 * 
 * Helper functions
 * 
 */

function random(max, min) {

    return Math.round(Math.random() * (max - min)) + min;

}








