<?php 

    ini_set('max_input_vars', 50000);
    error_reporting(E_ALL);

    $db = new MySQLi("localhost", "tetris_app","Xb0xFriyay!", "crossyroad");
    // $db = new MySQLi("localhost", "tetris_app", "tetris", "flappybirds");

    $cmd = $_POST['cmd'] ? $_POST['cmd'] : "";
    $_POST['ip'] = $_SERVER['REMOTE_ADDR'];

    // CREATE TABLE `scores` ( `s_id` INT(8) NOT NULL AUTO_INCREMENT , `s_ip` INT(32) NOT NULL , `s_name` VARCHAR(255) NOT NULL , `s_data` JSON NOT NULL , PRIMARY KEY (`s_id`)) ENGINE = InnoDB;

    // ALTER TABLE `scores` ADD `s_score` BIGINT(16) NOT NULL DEFAULT '0' AFTER `s_data`;
    // ALTER TABLE `scores` ADD `x` TINYINT(1) NOT NULL DEFAULT '1' AFTER `s_score`;
    // ALTER TABLE `scores` ADD `s_date` TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `s_score`;
    // ALTER TABLE `scores` CHANGE `s_ip` `s_ip` VARCHAR(255) NOT NULL;


    // CREATE TABLE `system_config` ( `sc_id` INT NOT NULL AUTO_INCREMENT , `sc_on` TINYINT(1) NOT NULL , `sc_description` TEXT NOT NULL , `x` TINYINT(1) NOT NULL , PRIMARY KEY (`sc_id`)) ENGINE = InnoDB;

    // INSERT INTO `system_config` (`sc_id`, `sc_on`, `sc_description`, `x`) VALUES (NULL, '1', 'This is the system setting where player/players are allowed to access and play the game or not.', '1');

    switch ($cmd) {
        case "create_world_grid":
            echo json_encode(create_world_grid($_POST));
            break;
        case "update_score":
            update_score($_POST);
            break;
        case "get_scores":
            echo json_encode(get_scores());
            break;
        case "reset_scores":
            reset_scores();
            break;
        case "check_allow_config":
            echo json_encode(check_allow_config());
            break;
        case "allow_game":
            update_access(1);
            break;
        case "disallow_game":
            update_access();
            break;
        case "check_admin_access":
            echo json_encode(check_admin_access($_POST['pw']));
            break;
    }

    function create_world_grid($data) {
        
        $h = intval($data['h']);
        $w = intval($data['w']);

        // $h = rand(15, 25);
        // $w = rand(15, 25);

        $px = $data['px'];
        $grd = [];
        $sgrd = [];
        $mn = 4;
        for ($x = 0; $x < $w; $x++) {
            $md = 0; //modifier
            $ig = [];
            $dn = rand(0, 2);
            $cp = get_color(rand(0, 7));

            $my = rand(5, $h - $mn);

            if ($x < 50) {
                $md = rand(0, $my - 1);
            }
            
            if ($x < 101) {
                $md = rand(1, $my - 1);
            }

            if ($x < 151) {
                $md = rand(3, $my - 1);
            }

            if ($x > 150) {
                $md = rand(4, $my - 1);
            }

            $my = $my - $md;
            $mxg = $my + $mn;

            for ($y = 0; $y < $h; $y++) {    

                $dn = rand(0, 2);
                $cp = get_color(rand(0, 7));

                if ($x < 7) {
                    $t = [
                        'color' => "",
                        'design' => 0,
                        'block' => 0,
                    ];
                    array_push($ig, $t);
                    continue;
                }


                if ($x < 50) {

                    if ($x % 4 == 0) {
                        if ($y > $my && $y < $mxg) {
                            $t = [
                                'color' => "",
                                'design' => 0,
                                'block' => 0,
                            ];
                        } else {
                            $t = [
                                'color' => $cp,
                                'design' => $dn,
                                'block' => 1,
                            ];
                            if (!in_array($x, $sgrd)) { array_push($sgrd, $x); }
                        }
    
                    } else {
                        $t = [
                            'color' => "",
                            'design' => 0,
                            'block' => 0,
                        ];
                    }
                    array_push($ig, $t);
                    continue;
                } 

                if ($x < 101) {
                    
                    if ($x % 3 == 0) {
                        if ($y > $my && $y < $mxg) {
                            $t = [
                                'color' => "",
                                'design' => 0,
                                'block' => 0,
                            ];
                        } else {
                            $t = [
                                'color' => $cp,
                                'design' => $dn,
                                'block' => 1,
                            ];
                            if (!in_array($x, $sgrd)) { array_push($sgrd, $x); }
                        }
    
                    } else {
                        $t = [
                            'color' => "",
                            'design' => 0,
                            'block' => 0,
                        ];
                    }
                    array_push($ig, $t);
                    continue;
                }

                if ($x < 151) {
                    
                    if ($x % 2 == 0) {
                        if ($y > $my && $y < $mxg) {
                            $t = [
                                'color' => "",
                                'design' => 0,
                                'block' => 0,
                            ];
                        } else {
                            $t = [
                                'color' => $cp,
                                'design' => $dn,
                                'block' => 1,
                            ];
                            if (!in_array($x, $sgrd)) { array_push($sgrd, $x); }
                        }
    
                    } else {
                        $t = [
                            'color' => "",
                            'design' => 0,
                            'block' => 0,
                        ];
                    }
                    array_push($ig, $t);
                    continue;

                }

                if ($y > $my && $y < $mxg) {
                    $t = [
                        'color' => "",
                        'design' => 0,
                        'block' => 0,
                    ];
                } else {
                    $t = [
                        'color' => $cp,
                        'design' => $dn,
                        'block' => 1,
                    ];
                    if (!in_array($x, $sgrd)) { array_push($sgrd, $x); }
                }

                array_push($ig, $t);
                
            }
            array_push($grd, $ig);
        }

        $n_data = [
            "w" => $w,
            "h" => $h,
            "px" => $px,
            "grid" => $grd,
            "grid_level" => $sgrd,
            // "c" => $data['c'],
            // "d" => $data['d'],
            "c" => 1,
            "d" => 0,
            
        ];
        
        return $n_data;

    }

    function falling_objects($data) {

        $h = $data['h'];
        $w = $data['w'];
        $px = $data['px'];
        $g = $data['grid'];
        $c = $data['c'];
        $d = $data['d'];
        $et = [
            'color' => "",
            'design' => 0,
            'block' => 0,
        ];
        $c = 0;
        switch ($d) {
            case 0:
                for ($y = $h - 2; $y >= 0; $y--) {
                    for ($x = 0; $x < $w; $x++) {
                        if ($g[$y][$x]['block'] && $g[$y + 1][$x]['block'] == 0) {
                            $g[$y + 1][$x] = $g[$y][$x];
                            $g[$y][$x] = $et;
                            $c = 1;
                        }
                    }
                }
                break;
            case 1:
                for ($y = 1; $y < $h; $y++) {
                    for ($x = 0; $x < $w; $x++) {
                        if ($g[$y][$x]['block'] && $g[$y - 1][$x]['block'] == 0) {
                            $g[$y - 1][$x] = $g[$y][$x];
                            $g[$y][$x] = $et;
                            $c = 1;
                        }
                    }
                }
                break;
            case 2:
                for ($x = 1; $x < $w; $x++) {
                    for ($y = 0; $y < $h; $y++) {
                        if ($g[$y][$x]['block'] && $g[$y][$x - 1]['block'] == 0) {
                            $g[$y][$x - 1] = $g[$y][$x];
                            $g[$y][$x] = $et;
                            $c = 1;
                        }
                    }
                }
                break;
            case 3:
                for ($x = $w - 2; $x >= 0; $x--) {
                    for ($y = 0; $y < $h; $y++) {
                        if ($g[$y][$x]['block'] && $g[$y][$x + 1]['block'] == 0) {
                            $g[$y][$x + 1] = $g[$y][$x];
                            $g[$y][$x] = $et;
                            $c = 1;
                        }
                    }
                }
                break;
        }

        if ($c == 0) {
            $n_data = create_world_grid($data);
            $n_data["d"] = rand(0, 3);
        } else {
            $n_data = [
                "w" => $w,
                "h" => $h,
                "px" => $px,
                "grid" => $g,
                "c" => $c,
                "d" => $d,
            ];
        }
        
        return $n_data;        

    }

    function get_color($v) {
        $cArr = ["#2A0944", "#3FA796", "#FEC260", "#A10035", "#231955", "#1F4690", "#E8AA42", "#FFE5B4"];
        return $cArr[$v] ? $cArr[$v] : "";
    }

    function check_admin_access($pw) {
        $r_data = array();

        $r_data['access'] = false;  
        if ($pw === "xboxadmin1001") {
            $r_data['access'] = true;
        }

        return $r_data;
    }
    function check_allow_config() {
        global $db;

        $sql = "SELECT crsc_on, crsc_desc FROM cr_system_config WHERE 1 AND crsc_id = 1";
        $res = $db->query($sql)->fetch_assoc();
        return $res;

    }

    function update_access($a = 0) {
        global $db;

        $sql = "UPDATE cr_system_config SET crsc_on = $a WHERE 1 AND crsc_id = 1";
        $db->query($sql);

    }

    function update_score($data) {
        global $db;
        
        if (!$data['ip']) {
            return;
        }

        $sql = "SELECT crs_id, crs_score FROM cr_scores WHERE 1 AND crs_ip = \"{$data['ip']}\"";
        $res = $db->query($sql)->fetch_assoc();

        if (!$res['crs_id']) {


            $name = $data['name'] ? $data['name'] : "Name PLS";
            $sql = "INSERT INTO cr_scores (crs_ip, crs_name, crs_data, crs_score) VALUES ('{$data['ip']}', '{$name}', '" . json_encode($data) . "', '{$data['score']}')";
            $db->query($sql);    
            
        } else {

            $n_sql = "";

            if ($data['name']) {
                $n_sql = ", crs_name = \"{$data['name']}\"";
            }

            if ($res['crs_score'] < $data['score']) {
                $sql = "UPDATE cr_scores SET crs_data = '" . json_encode($data) . "', crs_score = \"{$data['score']}\", x = 1 {$n_sql} WHERE 1 AND crs_id = {$res['crs_id']}";
            } else {
                $sql = "UPDATE cr_scores SET crs_data = '" . json_encode($data) . "', x = 1 {$n_sql} WHERE 1 AND crs_id = {$res['crs_id']}";
            }
            $db->query($sql);
            
        }

        // echo $sql;
    }

    function get_scores() {
        global $db;

        $sql = "SELECT crs_name as name, crs_score as score FROM cr_scores WHERE 1 AND x = 1 ORDER BY crs_score DESC LIMIT 20";
        $rsArray = array();
        $result = $db->query($sql);

        while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
            array_push($rsArray, $rs);
        }


        return $rsArray;
    }

    function reset_scores() {
        global $db;

        $sql = "UPDATE cr_scores SET x = 0, crs_score = 0";
        $db->query($sql);
    }

?>