'use strict';
var data = {
  ak: GlobalObj.GET_COOKIE('AuthKEY'),
  ud: new Object(),
  am: NaN
}

var Game = {
  UserInit: function(){
    $.post('/gameInit', {aKey: data.ak},function(d){
      data.ud.us = d;

      var img = new Image();
      img.src = '/data/users/avatar/'+d.userDATA.nick+'.jpg';
      img.onload = function(){$("#users_mini_ava").css({"background":"url(/data/users/avatar/"+d.userDATA.nick+".jpg)", "background-size": "contain"});};
      img.onerror = function(){$("#users_mini_ava").css({"background":"url(/data/users/avatar/nophoto.jpg)", "background-size": "contain"});};

      $("#users_game_nick_name").html(d.userDATA.nick);
      GlobalObj.PARSE_RANC(d.userDATA.rank);
      console.log(d)
    });
  },
  GlobalMessage(d, t){
    var GMC = document.createElement('div');
    GMC.className = 'GlobalMsgContainer';
    if($(".GlobalMsgContainer").length >= 1){
      GMC.style.top = (75 * $(".GlobalMsgContainer").length) + 25 + "px";
    }

    var GM = document.createElement('div');
    GM.className = "GM";
    var close_global = document.createElement('div');
    close_global.className = 'close_global';
    close_global.innerHTML = "X";
    var type_global = document.createElement('div');
    type_global.className = 'type_global';
    var author_global = document.createElement('div');
    author_global.className = 'author_global';
    var message_global = document.createElement('div');
    message_global.className = 'message_global';
    var texture_global = document.createElement('div');
    texture_global.className = 'texture_global';

    if(d.code === 500){

    }else{
      close_global.onclick = function(){
        $(this).parent().parent().remove();
      };
      author_global.innerHTML = d.author;
      message_global.innerHTML = d.error;
      GMC.append(GM);
      GM.append(close_global);
      GM.append(type_global);
      GM.append(author_global);
      GM.append(message_global);
      GM.append(texture_global);
      $("body").append(GMC);
      $(".GlobalMsgContainer").show();
      $(".NPC_DIALOGS,.NPC_IMAGE").hide();


      if(t !== undefined, t > 0){
        setTimeout(function(){
          $(GMC).remove();
        }, t);
      }
    }
  },
  CreateGameData: function(d){
    $(".GameNavButton_AB").remove();
    $("#SityImage").css({"background-image":"url(../../../data/location/image/"+d.locDATA.LOC_ID+".jpg)"})
    for(let l = 0; l < d.locGO.length; l++){
      let NewLoc = document.createElement("div");
      NewLoc.className = "GameNavButton_AB",
      NewLoc.innerHTML = "<div class='locIcon "+ d.locGO[l].type_loc +"'></div>"+d.locGO[l].name;
      NewLoc.id = 'Loc_'+d.locGO[l].LOC_ID;
      NewLoc.onclick = () => {
        Game.goLoc('Loc_'+d.locGO[l].LOC_ID);
      };
      $(".LeftNav .Button_area").append(NewLoc);
    }

    for(let n = 0; n < d.npcData.length; n++){
      let NewNPC = document.createElement("div");
      NewNPC.className = "GameNavButton_AB NPCIcon",
      NewNPC.innerHTML = d.npcData[n].name;
      NewNPC.id = 'NPC_'+d.npcData[n].idNPC;
      NewNPC.onclick = () => {
        Game.goNPC('NPC_'+d.npcData[n].idNPC, d.npcData[n].name);
      };
      $(".RightNav .Button_area").append(NewNPC);
    }
    $("#LocNameGlobal").html(d.locDATA.name);
    $("#LocInfoGlobal").html(d.locDATA.text);

    $(".messages-block:eq(1)").attr("onRoom","loc"+d.locDATA.LOC_ID);
    $("#ChatLocation").attr("chat","loc"+d.locDATA.LOC_ID);

    if(!CHAT.inited){
      CHAT.chat_init();
    }

    Game.loadDesign(false, '...');
  },
  LocationInit: function(){
    $.post('/locInit', {aKey: data.ak},function(d){
      data.ud.loc = d;
      Game.CreateGameData(d)
    });
  },
  otvetClick: function(npc, oid){
    console.log(npc);
    console.log(oid);
  },
  goLoc: function(e){
    $(".NPC_DIALOGS").hide(150);
    Game.loadDesign(true, 'Переходим на другую локацию...');
    $.post("/doLocGo",{l:e, aKey: data.ak},(d) => {
      if(d.code === 500){
        Game.CreateGameData(d);
        data.ud.loc = d;
        let m = '<div class="msg lg"><span class="msg_text lg">&#9658; Вы перешли на локацию: '+d.locDATA.name+'</span></div>';
        $(".messages-block:eq(1)").append(m);
        CHAT.JoinRoom(data.ud.loc.locDATA.LOC_ID);

        if(CHAT.selectChat !== "mainChat" && CHAT.selectChat !==  "ShopChat"){
          CHAT.selectChat = "loc"+data.ud.loc.locDATA.LOC_ID;
        }
        GlobalObj.socket.emit("ULL", {myLoc: data.ud.loc.locDATA.LOC_ID});
      }else{
        Game.GlobalMessage(d, 5000);
        Game.loadDesign(false, '...');
      }

    });
  },
  goNPC: function(e, name){
    $('.NPC_load').show();
    $(".NPC_DIALOGS").fadeIn(250);
    $.post("/doNPCGo",{n:e, aKey: data.ak},(d) => {
      if(d.code === 500){
        $(".NPC_OTVET span").remove();
        $(".NPC_TITLE").html(name)
        $(".NPC_TEXT").html(d.dlg);
        for(let ni = 0; ni < d.otv.split(',').length; ni++){
          var span = document.createElement('span');
          span.innerHTML = d.otv.split(',')[ni];
          span.id = "OTV_"+ni;
          span.onclick = function(){
            Game.otvetClick(e, "OTV_"+ni);
          };
          $(".NPC_OTVET").append(span);
        }
        $('.NPC_load').hide();

        $("#NPC_ART").css({
          "background-image":"url(../../../data/NPC/image/"+d.art+".png)"
        });


        $(".NPC_IMAGE").fadeIn(250);
        console.log(d);
      }else{
        Game.GlobalMessage(d)
      }
    });
  },
  clickMenu: function(){
    $(".BUTTON_MENU").click(function(){
      var index = $(".BUTTON_MENU").index(this);
      data.am = index;
      $(".block_of_modal").fadeIn(150);
      $(".modaB_content").hide();
      $(".block_of_modal .modaB_content:eq("+index+")").show();

      switch(index){
        case 0: var url = '/doProfile';break;
        case 1: var url = '/doItems';break;
        case 2: var url = '/doMonsters';break;
        case 3: var url = '/doMessage';break;
        case 4: var url = '/doFriends';break;
        case 5: var url = '/doClans';break;
        case 6: var url = '/doList';break;
      }

      let dou = {
        aKey: data.ak,
        n: data.ud.us.userDATA.nick
      };

      $.post(url, {d:dou}, function(res){
        alert("good");
      }).fail(function() {
        $(".block_of_modal").hide();
        $(".modaB_content").hide();
        Game.GlobalMessage({code: 450, author: "System", error: "Отказано в доступе!"}, 5000);
      });

    });
    $(".tabBtn").click(function(){
      if(data.am === 1){
          let i = $(".tabBtn").index(this);
          $(".tabBtn").removeClass("tabActive");
          $(".tabBtn:eq("+i+")").addClass("tabActive");
      }
    });
  },
  loadDesign: function(t,s){
    if(t){
      $(".load").show();
      $(".load_text").html(s);
    }else{
      $(".load").fadeOut(200);
      $(".load_text").html(s);
    }

    $(".NPC_CLOSE").click(() => {
      $(".NPC_DIALOGS").fadeOut(150);
    });

  },
  randomInteger: function (min, max) {
      var rand = min - 0.5 + Math.random() * (max - min + 1);
      rand = Math.round(rand);
      return rand;
  },
  ContextMenu: function(type){


    $('.ContextMenu').remove();

    if(type === 0){
      var contextMenu = document.createElement("div");
      contextMenu.className = "ContextMenu ma";
      var type1arr = ['Профиль','Настройки','Заменить аватарку', 'Пригласить друзей', 'Заблокировать' ,'Выйти'];
      for(let i = 0; i < type1arr.length; i++){
        var CMP = document.createElement('div');
        CMP.className = 'CMP';
        CMP.innerHTML = type1arr[i];
        contextMenu.append(CMP);
      }

      contextMenu.style.top = $("#users_mini_ava").offset().top + $("#users_mini_ava").height() + 10 + 'px';
      $('body').append(contextMenu);
    }else{
      $(".ma").remove();
    }
  },
  styles: function(){
    $(".smile_btn").click(function(){
      if($(".smiles_block").hasClass("show")){
        $(".smiles_block").removeClass("show")
      }else{
        $(".smiles_block").addClass("show")
      }
    });

    $(document).click(function(e) {
      switch(e.target.className){
        case "users_mini_ava":Game.ContextMenu(0); break;
        default: Game.ContextMenu(-1);
      }
    });



    if(screen.width > 800){
        setInterval(function () {
            var blinkTime = Game.randomInteger(1, 15);
            if (blinkTime > 12) {
                $(".lum-r .light").css({
                    "box-shadow": "none",
                    "background": "rgba(83, 86, 55, 0.78)"
                });
            } else {
                $(".lum-r .light").css({
                    "box-shadow": "rgba(255, 255, 0, 1) 0px 20px 140px 32px",
                    "background": "rgb(237, 255, 0) url(https://avatanplus.com/files/resources/mid/583ac15f0f27d158a5835b56.png)",
                    "background-size":"185px"
                });
            }
        }, 80);
    }
  },
  parallax: function(){
    $(document).on('mousemove',function(e){
      // console.log(e)
    });
  },
  init: function(){
    Game.parallax();
    Game.UserInit();
    Game.LocationInit();
    Game.styles();
    Game.clickMenu();
  }
};

$(document).ready(function(){
  Game.init();
});
