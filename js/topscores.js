check_admin_pw();

function check_admin_pw() {
    let pw = prompt("Type in Password", "");
    if (pw) {

        let r_data = {};
        r_data['cmd'] = "check_admin_access";
        r_data['pw'] = pw;

        $.ajax({
            url : "api/crossy_db.php",
            type : "post",
            data : r_data,
            success : (res) => {
                res = JSON.parse(res);
                if (res['access']) {
                    get_scores();
                    // screen_adjustment();
                } else {
                    check_admin_pw();
                }
                
            }
        })
    } else {
        check_admin_pw();
    }
}

function start_timer(t = 0, m = 0) {

    if (m == 0) { 
        m = 1500; 
        hide_display('start_timer');
    }
    if (t >= m) {
        alert("Game Finished");
        show_display('start_timer');
        let tmr = document.getElementById("timer");
        tmr.innerText = "";
        return;
    }

    let tmr = document.getElementById("timer");

    let tme = (((m - t) / 60) + "").split(".");

    let mins = tme[0];
    let secs = tme[1] ? Math.round(parseFloat("." + tme[1]) * 60).toFixed(0) : 0;
    tmr.innerText = mins + ":" + secs + " Time Left";

    setTimeout( () => {
        t++;
        return start_timer(t, m);
    }, 1000);
}

function screen_adjustment() {

    let m = 150;
    let m_cont = document.getElementById("m_cont");
    // m_cont.style.width = (window.innerWidth - 250) + "px";
    // m_cont.style.maxWidth = (window.innerWidth - 250) + "px";
    m_cont.style.height = (window.innerHeight - m) + "px";
    m_cont.style.maxHeight = (window.innerHeight - m) + "px";
    m_cont.style.marginTop = (m / 2) + "px";


    let lg = document.getElementById("left_graphs");
            
    if (lg.offsetWidth >= 400) {
        document.getElementById("2").width = 400;
        document.getElementById("a").width = 400;
    } else {
        document.getElementById("2").style.width = 100 + "%";
        // document.getElementById("a").style.width = 100 + "%";
        document.getElementById("a").height = lg.offsetWidth;
    }

    let rg = document.getElementById("right_graphs");
    
    if (rg.offsetWidth >= 400) {
        document.getElementById("b").width = 400;
    } else {
        document.getElementById("b").style.width = 100 + "%";
        document.getElementById("b").height = rg.offsetWidth;
    }


}

function get_scores() {

    let r_data = {};
    r_data['cmd'] = "get_scores";

    $.ajax({
        url : "api/crossy_db.php",
        type : "post",
        data : r_data,
        success : (res) => {
            // console.log(JSON.parse(res));
            create_table_view(JSON.parse(res));
            setTimeout( () => {
                get_scores();
            }, 1000);
        }
    }) 


}

function reset_scores() {

    if (!confirm("Reset Scoreboard?")) {
        return;
    }

    let r_data = {};
    r_data['cmd'] = "reset_scores";

    $.ajax({
        url : "api/crossy_db.php",
        type : "post",
        data : r_data,
        success : () => {
            alert("Scoreboard Resetted");
        }
    }) 

}

function grant_game_access(ag = 0) {

    let r_data = {};
    if (ag == 1) {
        r_data['cmd'] = "allow_game";
    } else {
        r_data['cmd'] = "disallow_game";
    }
    $.ajax({
        url : "api/crossy_db.php",
        type : "post",
        data : r_data,
        success : () => {
            
            if (ag) {
                alert("Game Access Allowed");
            } else {
                alert("Game Access Not Allowed");
            }
        }
    })
}

function create_table_view(data) {

    let tbl = document.getElementById("scoreboard");
    tbl.innerHTML = "";


    let h = document.createElement("thead");
    let thr = document.createElement("th");
    h.appendChild(thr);
    for (let k in data[0]) {
        let th = document.createElement("th");
        th.innerText = k.toUpperCase();
        h.appendChild(th);
    }
    tbl.appendChild(h);

    
    let b = document.createElement("tbody");
    
    for (let i = 0; i < data.length; i++) {
        let tr = document.createElement("tr");

        let tdr = document.createElement("td");
        tdr.classList.add("td-custom");
        tdr.innerText = (i + 1);

        if (i < 10) {
            let fa = document.createElement("i");
            fa.classList.add("fas");
            fa.classList.add("fa-trophy");
            fa.classList.add("px-2");

            if (i < 3) {
                fa.classList.add("gold");
            }

            tdr.appendChild(fa);
        }
        
        tr.appendChild(tdr);

        for (let k in data[i]) {
            let td = document.createElement("td");
            td.classList.add("td-custom");
            td.innerText = data[i][k];
            tr.appendChild(td);
        }
        b.appendChild(tr);
    }

    tbl.appendChild(b);

}

function show_display(dom_id = "") {
    if (!dom_id) { return; }
    if (!document.getElementById(dom_id)) { return; }
    document.getElementById(dom_id).style.display = "block";
}

function hide_display(dom_id = "") {
    if (!dom_id) { return; }
    if (!document.getElementById(dom_id)) { return; }
    document.getElementById(dom_id).style.display = "none";
}