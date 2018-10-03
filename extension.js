game.import("extension",function(lib,game,ui,get,ai,_status){return {name:"Dota2",content:function (config,pack){
    lib.config.announcer=config.announcer;
    lib.config.rune=config.rune;
    get.linkFrom=function(skill){return lib.skill[skill].linkCharacters[0]};
    get.linkTo=function(skill){return lib.skill[skill].linkCharacters.slice(1)};
    game.linkFilter=function(player,skill){
        if(!lib.skill[skill].link) return false;
        var linkFrom=get.linkFrom(skill);
        var linkTo=get.linkTo(skill);
        return player.name==linkFrom&&game.hasPlayer(function(current){
            return linkTo.contains(current.name);
        });
    };
    get.d2_qihuan_skill=function(elements){
        var list=[0,0,0];
        for (var i=0;i<elements.length;i++) {
            switch(elements[i]){
                case 'd2_qihuan_quas':list[0]++;break;
                case 'd2_qihuan_wex':list[1]++;break;
                case 'd2_qihuan_exort':list[2]++;break;
            }
        }
        var num=list[0]*100+list[1]*10+list[2];
        var skill='none';
        switch(num){
            case 300:skill='d2_jisulengque';break;
            case 210:skill='d2_youlingmanbu';break;
            case 201:skill='d2_hanbingzhiqiang';break;
            case 120:skill='d2_qiangxijufeng';break;
            case 30:skill='d2_diancimaichong';break;
            case 21:skill='d2_lingdongxunjie';break;
            case 12:skill='d2_hundunyunshi';break;
            case 3:skill='d2_yangyanchongji';break;
            case 102:skill='d2_ronglujingling';break;
            case 111:skill='d2_chaozhenshengbo';break;
            default:break;
        }
        return skill;
    };
    get.d2_qihuan_elements=function(skill){
        var quas='d2_qihuan_quas';
        var wex='d2_qihuan_wex';
        var exort='d2_qihuan_exort';
        var elements=[];
        switch(skill){
            case 'd2_jisulengque':elements=[quas,quas,quas];break;
            case 'd2_youlingmanbu':elements=[quas,quas,wex];break;
            case 'd2_hanbingzhiqiang':elements=[quas,quas,exort];break;
            case 'd2_qiangxijufeng':elements=[quas,wex,wex];break;
            case 'd2_diancimaichong':elements=[wex,wex,wex];break;
            case 'd2_lingdongxunjie':elements=[wex,wex,exort];break;
            case 'd2_hundunyunshi':elements=[wex,exort,exort];break;
            case 'd2_yangyanchongji':elements=[exort,exort,exort];break;
            case 'd2_ronglujingling':elements=[quas,exort,exort];break;
            case 'd2_chaozhenshengbo':elements=[quas,wex,exort];break;
            default:break;
        }
        return elements;
    };
    get.itemLevel=function(player,keyword,subtype) {
        var name=player.getEquip(subtype).name;
        if (name.indexOf(keyword)!=1&&lib.skill[name].level) {
            return lib.skill[name].level;
        }
        return undefined;
    };
},precontent:function (Dota2){
    if(Dota2.enable){
        game.saveConfig('noname_Dota2_version',"1.4.2");
        var edit=lib.extensionMenu.extension_Dota2.edit;
        var deletex=lib.extensionMenu.extension_Dota2.delete;
        delete lib.extensionMenu.extension_Dota2.edit;
        delete lib.extensionMenu.extension_Dota2.delete;
        lib.extensionMenu.extension_Dota2.version={
            "name":"拓展版本："+lib.config.noname_Dota2_version,
            "clear":true,
            "onclick":function(){
                if(lib.updates===undefined||lib.updates.length==0) {
                    alert('读取updates.js失败');
                    return;
                }
                ui.click.configMenu();
                changeLog();
            },
        };
        lib.extensionMenu.extension_Dota2.update={
            "name":"更新此拓展",
            "clear":true,
            "onclick":function(){
                if(lib.updates===undefined||lib.updates.length==0) {
                    alert('读取updates.js失败');
                    return;
                }
                if(ui.noname_Dota2_update) {
                    alert('正在更新...');
                    return ;
                }
                var nextVersion=lib.nextVersion;
                if(nextVersion===undefined) {
                    alert('无可用更新。');
                    return ;
                }
                var list=lib.updates[nextVersion].files;
                var tmp=lib.updates[nextVersion].next;
                var lastestVersion=nextVersion;
                while(tmp) {
                    var list2=lib.updates[tmp].files;
                    for(var i=0;i<list2.length;i++) {
                        if(!list.contains(list2[i])) list.push(list2[i]);
                    }
                    lastestVersion=tmp;
                    tmp=lib.updates[tmp].next;
                }
                var n1=0,n2=list.length;
                var finish=false;
                ui.noname_Dota2_update=ui.create.system('Dota2:'+n1+'/'+n2,function(){
                    if(finish) window.location.reload();
                },true);
                multiDownload(list,function(){
                    n1++;
                    ui.noname_Dota2_update.innerHTML='Dota2:'+n1+'/'+n2;
                },null,function(){
                    ui.noname_Dota2_update.innerHTML='Dota2更新完成';
                    finish=true;
                    game.saveConfig('noname_Dota2_version',lastestVersion);
                })
            },
        };
        lib.extensionMenu.extension_Dota2.edit=edit;
        lib.extensionMenu.extension_Dota2.delete=deletex;

        var dir;
        var extDir;
        var ua=navigator.userAgent.toLowerCase();
        if(ua.indexOf('android')!=-1){
            dir=cordova.file.externalApplicationStorageDirectory;
        }
        else if(ua.indexOf('iphone')!=-1||ua.indexOf('ipad')!=-1){
            dir=cordova.file.documentsDirectory;
        }
        if(window.require&&window.__dirname){
            extDir=__dirname+'/extension/Dota2/';
        } else {
            extDir=dir+'/extension/Dota2/';
        }
        var site="https://raw.githubusercontent.com/Lucilor/noname-dota2/master/";
        // site="http://candypurity.com/kodexplorer/data/User/admin/home/document";
        var downloadFile;
        if(window.FileTransfer){
            downloadFile=function(url,folder,onsuccess,onerror){
                var fileTransfer = new FileTransfer();
                url=site+url;
                folder=extDir+folder;
                fileTransfer.download(encodeURI(url),folder,onsuccess,onerror);
            };
        } else {
            var fs=require('fs');
            var http=require('https');  
            var downloadFile=function(url,folder,onsuccess,onerror){
                url=site+url;
                var dir=folder.split('/');
                var str='';
                var download=function(){
                    try{
                        var file = fs.createWriteStream(extDir+'/'+folder);
                    }
                    catch(e){
                        onerror();
                    }
                    var request = http.get(url, function(response) {
                        var stream=response.pipe(file);
                        stream.on('finish',onsuccess);
                        stream.on('error',onerror);
                    });
                }
                var access=function(){
                    if(dir.length<=1){
                        download();
                    }
                    else{
                        str+='/'+dir.shift();
                        fs.access(extDir+str,function(e){
                            if(e){
                                try{
                                    fs.mkdir(extDir+str,access);
                                }
                                catch(e){
                                    onerror();
                                }
                            }
                            else{
                                access();
                            }
                        });
                    }
                }
                access();
            };
        }
        var multiDownload=function(list,onsuccess,onerror,onfinish){
            list=list.slice(0);
            var download=function(){
                if(list.length){
                    var current=list.shift();
                    downloadFile(current,current,function(){
                        if(onsuccess) onsuccess();
                        download();
                    },function(){
                        if(onerror) onerror();
                        download();
                    });
                }
                else{
                    if(onfinish) onfinish();
                }
            }
            download();
        };
        var changeLog=function(){
            var dialog=ui.create.dialog('hidden');
            dialog.style.height='calc(100%)';
            dialog.style.width='calc(100%)';
            dialog.style.left='0px';
            dialog.style.top='0px';
            dialog.classList.add('popped');
            dialog.classList.add('static');
            var div=ui.create.div('.menubutton.round','×',function(){
                dialog.delete();
            });
            div.style.left='calc(50% - 35px)';
            dialog.add(div);
            for(var i in lib.updates){
                var str=lib.config.noname_Dota2_version==i?'--当前版本':'';
                dialog.addText(i+'('+lib.updates[i].date+')'+str+'<br>',false);
                if(lib.updates[i].desc) dialog.addText(lib.updates[i].desc,false);
            };
            ui.window.appendChild(dialog);
        };
        var needUpdate=function(){
            ui.noname_Dota2_needUpdate=ui.create.system('Dota2拓展可更新',changeLog,true);
        };

        multiDownload(['updates.js'],null,null,function(){
            lib.init.js(extDir,"updates",function(){
                if(window.updates) {
                    lib.updates=window.updates;
                    delete window.updates;
                    lib.extensionMenu.extension_Dota2.version.name="拓展版本："+lib.config.noname_Dota2_version;
                    lib.nextVersion=lib.updates[lib.config.noname_Dota2_version].next;
                    if(lib.nextVersion!=undefined)  {
                        needUpdate();
                    }
                }
            });
        });
        lib.arenaReady.push(function(){
            if(lib.nextVersion!=undefined)  {
                needUpdate();
            }
        });
    };
},help:{
    "Dota2":"<ul><li>阿哈利姆神杖<br>拥有神杖的英雄将领悟技能的奥义，技能描述中（奥义：...）的字段仅在装备神杖时生效。"+
                "<li>联动技<br>某些角色之间的联动，只有联动角色在场上且你与联动角色都是主武将时联动技才会生效。"+
                "<li>神符<br>新的一轮开始时，神符将刷新在场上一名随机角色（记为A）身上，其他角色可依次与A拼点，其中点数最大者获得神符。神符将在新的一轮开始时消失。发生以下情况时A直接获得神符：①A没有手牌；②没有角色与A拼点；③拼点点数最大者不止一名角色。"
},config:{
    "announcer":{"name":"连杀配音","init":"default","item":{"default":"默认","crystalMaiden":"水晶室女","monkeyKing":"齐天大圣","disable":"关闭"},"intro":"选择连杀配音"},
    "rune":{"name":"神符","init":true,"intro":"开启或关闭神符玩法"}
},package:{
    character:{
        character:{
            "d2_blessingAngel":["female","qun",4,["d2_junheng","d2_shengdi","d2_biyou"],["des:人们的祈祷是有用的，赐福天使终临人世。只要有她在，就连最危险的绝境都依然充满希望。"]],
            "d2_shadowDance":["female","shu",3,["d2_souhun","d2_qianren"],["des:无所谓正邪好坏，只要是榜单上的人，她都乐意去用他们的灵魂换钱。"]],
            "d2_crystalMaiden":["female","wei",3,["d2_aoshu","d2_bingfeng","d2_hanyu","d2_binghuo_bing"],["des:水晶室女莉莱出生在一个气候温和的地区，与性子火爆的姐姐莉娜一起长大，她很快就发现她天生对冰元素的吸引力给周围所有人制造了麻烦。只要她在附近坐下休息，井水和山泉瞬间就会被冻住；成熟的庄稼被寒霜冻伤，果园变成了冰的迷宫，然后垮塌损毁。当他们无奈的父母把莉娜送到南方后，又把莉莱流放到了寒冷北方的冰川残骸，一个隐居在蓝心冰川顶峰的寒冰巫师收留了她。经过长期的学习后，巫师认为莉莱已经能够独立的修习冰冻魔法了，于是他便降入冰川内开始千年的冬眠。从那以后，莉莱的冰冻法术变的愈发精湛，而现在，她的魔法已无可匹敌。"]],
            "d2_rubick":["male","wu",3,["d2_chuancheng","d2_ruohua","d2_tayin"],["des:所有法师都会点魔法，其中一部分通过长时间的学习应该也能成为巫师，然而只有其中最有天赋的，才有资格成为魔导师。法师们都是一样，虽然相互认识，但却并不相互尊重。在整个魔法界，拉比克已经算是著名的斗士和学者，不过他自己也没想过自己是当魔导师的料，直到他第17次外出刺杀。他和往常一样将那些失败者从高台上抛下，轮到第12个人时，他猛然的发现自己的生命是如此的无趣。曾经很简单的短暂法术干扰或者空手召唤火焰都能让他兴奋不已，而现在对他来说已经是意料之中的事情。他渴求更大的挑战。于是，他戴上了战斗面具，做了每个试图超越的巫师都会做的事：扬言要杀死一名魔导师。拉比克很快就发现对一个魔导师宣战的后果就是对整个魔导师群体宣战，他们将愤怒倾泻在他身上。每个魔导师的咒语都是势不可挡的能量洪流，每次攻击都是精确的杀招。然而很快魔导师们就发现了一些诡异的事情：他们好像在被自己的法术攻击。魔法漩涡中隐约传来拉比克的轻笑，他隐秘的解读着魔导师们的法术，复制其中之一，然后用这个法术攻击另外一人，在魔导师之间制造着他精心编制的混乱。被背叛的愤怒开始在魔导师们中滋生，很快他们就开始相互攻击，因为他们也不确定究竟是谁攻击了自己。战斗终于停止，所有的魔导师都被他人的魔法灼烧，冻僵，甚至切成碎片，死伤惨重。拉比克则独自站在一旁，疲惫却欣喜，这次战斗让他获益颇丰。当他向隐修议会提出晋升的要求时，没有人敢置喙一句，议会中的幻寂十一长者一致同意，承认他为大魔导师。"]],
            "d2_abaddon":["male","wei",4,["d2_andun","d2_fanzhao"],["des:魔霭圣池，一个处于原初群石的裂缝，从中带有先兆力量的蒸汽不断溢出，作为家族力量的源泉，已经惠及数个世代。在居住于洞穴中的魔霭家族，每个新生儿都会在暗黑迷雾中接受沐浴，经过这样的洗礼，他们与大陆的神秘力量获得了内在的联系。随着他们长大，内心坚信自己的使命是誓死保护世袭的传统和领域的风俗——实际上他们守护的不过就是圣池本身。而迷雾的作用原理尚不明朗。 当初生的亚巴顿沐浴在圣池中时，众人都表示事情并不对劲。孩子的双眼里闪耀出洞察之光，在场所有人都大吃一惊，神父们纷纷交头接耳。而他之后的成长道路与所有魔霭族裔的传人并无差别——为战争接受训练，在危机时刻需要他挺身而出，率领家族的军队守卫先祖的大陆。但是亚巴顿总是特立独行。其他人挥着武器训练时，他喜欢在迷雾前沉思。他饱吸从圣池中涌出的蒸汽，开始学习将自己的灵魂与家族深处流出的力量相融合；他变成了被暗黑迷雾笼罩的怪物。 魔霭家族怨气冲天——不论老小都谴责他对自己的责任视而不见。但是亚巴顿驾临战场时，不满全都烟消云散，他们目睹了迷雾的强大力量让他恣意挥洒着生杀大权，族内任何领主都是望尘莫及。"]],
            "d2_terrorBlade":["male","shu",4,["d2_hunduan","d2_daoying","d2_mohua"],["des:恐怖利刃是恶魔中的掠夺者——这个无法无天的魔头就连恶魔都惧怕三分。他曾因对恶魔领主动了贼念，无视了所有规范他行为的基本法则，触犯了七度地狱的所有法规。他被好好上了一课：原来还有比地狱更可怕的地方。接下来是短暂又残酷的审问，最终他被打入了荒邪之狱，这是一个隐藏的位面，恶魔们将它们的同类囚禁在这里。荒邪之狱并不是普通的监狱，这是现实的暗黑镜像，恶魔经过判决都到这里来直视他们自身灵魂中的扭曲倒影。然而恐怖利刃不但没有受苦，反而将自身最邪恶的倒影转化成了操控自如的力量，并将他的恐怖全数释放。"]],
            "d2_mage":["female","shen",3,["d2_aomi","d2_yongheng"],["forbidai","des:学无止境。"]],
            "d2_boss_mage":["none","shen",7,["d2_boss_aomi","d2_boss_yongheng"],["boss","forbidai","bossallowed","des:学无止境。"]],
            "d2_megaCreep":["none","shen",5,["d2_baiban"],["forbidai","des:嗯...比普通小兵好一些。"]],
            "d2_invoker":["male","qun",3,["d2_qihuan"],["des:在创立之初，魔法本质上是一门记忆的艺术，有些人认为这才是其最强力的形式。它无需任何科技，也无需魔杖或者其他施法媒介，只需要你有一颗魔法师的心。所有的那些祭祀里面的象形符号也仅仅是帮助记忆的手段，初衷是为了让施法者能够回想起施放法术时那大量的细节以及步骤。在那个年代，最伟大的法师就是记忆天赋最高的人，然而魔法祈唤实在是太过艰深，因此所有的法师不得不有所专攻。即使是最刻苦的法师，将一辈子奉献给魔法，最多也只能掌握三到四个法术。普通的法师能掌握两个就心满意足了，而对于那些乡下的法师来说，只掌握一个法术也再正常不过——即使这样，在极少的真正需要使用魔法的场合，他还得借助魔典才能战胜自己的健忘。然而，在那些早期的施法者中，有一个例外，一个智力超群，记忆力惊人的天才，以祈求者的名字为人们所知。在年少时，祈求者就已经掌握了不下十种法术。是的，不是四五个，也不是七个，而是十个，而且他还能毫不费力的施放这些法术。他学到过更多的法术，但是因为觉得没用，试过一次以后就彻底从脑中遗忘，这样才能为其他更为有用的法术留出空间。这些法术就是包括永生之术——能让施法者永生的法术，那些在世界之初吟唱了这个法术的人现在还活得好好的（除非他们被物质毁灭了）。而大多数这样的准不朽者都低调的生活在我们中间，害怕他们的秘密泄露：然而祈求者不是一个喜欢隐藏自己的天赋的人。他来自远古，比任何人都要博学，而他的心智还有余力让他去思考他无穷的自我价值...以及更多的法术——他在世界毁灭之时的漫长暮色中用来自娱自乐的法术。"]],
            "d2_lina":["female","shu",3,["d2_polong","d2_chihun","d2_mieshen","d2_binghuo_huo"],["des:秀逗魔导士莉娜和她妹妹水晶室女莉莱从小就合不来，她们从童年开始就你来我往的争斗成为了当地人津津乐道的传奇故事。莉娜总是占上风，如果说水晶室女的天性纯良而诚实，那么莉娜则是火爆中带着放纵和聪慧。在两人分别用冰和火毁掉了一大半房子以后，她们气急败坏的父母终于意识到两人必须分开。作为姐姐，莉娜被送到了遥远的南方，纷争之国的燃烧沙漠，和她有耐心的姑妈一起生活，这里的气候对这位火爆的魔导士来说其实更舒服。她的到来让一潭死水的当地泛起了不小的涟漪，许多男人试图追求她，最后却拖着烧焦的手指头或者只剩半边的眉毛以及被摧毁的自信心狼狈离开。莉娜非常自信且骄傲，没有任何事物能抑制她的火焰。"]],
            "d2_wraithKing":["male","wu",4,["d2_minghuo","d2_chongsheng","d2_xuming"],["des: 奥斯塔里昂大帝那建造在敌人骸骨上的庞大帝国已经屹立了无数个年头了，他对自己的统治有着无尽的狂热，希望自己的集权统治能够永生不灭。他坚信，只要自己宫殿里的的白骨高塔建成，他就将万古不朽。然后他最终还是意识到自己这一想法的荒谬...白骨也会腐坏。出于对血肉之躯的不屑，他找到了一个更为长久的办法来维持自己的统治，冥魂之力，一种在某些黑暗生物死亡时释放出的纯粹的精神力量。出于国王的骄傲，在计划将冥魂精华灌入自己体内时，他认为最好自己也能拥有一副光耀不灭的躯体。在千年一遇的至日，冥魂之夜那一天，他启动了仪式，命令他的手下收集足够多的灵魂来完成他自己的不朽。王上终不朽，将士万骨枯。现在，冥魂大帝已不再迷恋他那闪光的王座——他拔出自己的巨剑外出征伐，被他征服的人，要献上自己无惧死亡的绝对忠诚。"]],
            "d2_drowRanger":["female","wei",3,["d2_bingjian","d2_kuangfeng","d2_zhuoyue"],["des:卓尔游侠名叫崔希丝，这个名字很适合矮小、有点像侏儒、令人生厌的卓尔人。但崔希丝并不是卓尔人。她的双亲在坐大篷车旅行时受到土匪的袭击，滥杀无辜的土匪激怒了附近爱好和平的卓尔人。战斗结束后，卓尔人发现了一个藏在马车残骸中的小女孩，他们一致同意不能让这个失去父母的孩子被抛弃。还是孩童时，崔希丝就展现出了她对那些卓尔人引以为傲的技术的天赋：隐秘、沉默、敏锐。如果不看身体，在精神上她就像一个被拐走后又回到自己真正家中的卓尔人孩童。但随着她的成长，她的个头比她的家人高了不少，她因此认为自己是个丑陋的卓尔人。即使她皮肤光滑且长的匀称，完全没有卓尔人的肉疣和粗糙的髯须。与收养她的部族疏远后，她独自居住在森林中。许多在森林中寻路的旅行者都说他们见过一个美丽得难以置信的游侠在树林深处凝视他们，而当他们试图接近时，她又消失的无影无踪。轻盈、隐秘的冷美人，她像无声的迷雾般移动。你听到的森林低语，其实是她命中敌人心脏的霜冻箭矢的破空之声。"]],
            "d2_oracle":["male","wei",3,["d2_diyan","d2_xunuo"],["forbidai","des:长年以来，西姆瑞国的首席星官从位于狂徒山脉高耸顶峰的象牙孵巢引入他们的神谕者，他们先寄存初成的胚胎，待其长大成人，成为训练有素的先知后将被送还大铭王的门下。 所有认定的神谕者均由一群苍白巫女抚养长大，他们的肉体形态并未离开我们大多数人所处的位面；而在同时，他们的灵魂在遥远的时空徜徉，几乎不受太空中其他星体的影响。先知们从宇宙漫游中归来后，他们的血肉之口中说出的话语全是火焰。这些神秘的言词将由西姆瑞的解命师们进行分析，从中找到未来的景象，与他国的外交对策，所有超自然军火的所在，确保大铭王的军队无论是在王庭中，还是战场上都能取得所有战斗的胜利。就这样过了数个世代，大铭书上写满了君王的胜仗和他们开辟的疆土。时光如梭，名为奈里夫的神谕者前来侍奉当朝的最后一位大铭王。 从一开始，奈里夫的预言就与众不同。他的预言看起来不仅是预示未来，更是改造未来。这位怪异的预言家用低哑的嗓音说出了未来的外交对策，但并非回答解命师们关于敌国的提问，而在一夜之间，西姆瑞人发现自己与新的敌人产生了冲突。解命师们感到自己的权位受到了动摇，马上把这些不利的进展推到新来的神谕者身上。他们要求大铭王免去他的职位，并祈求巫女收回这个不擅预言的先知，再送来一位名符其实的神谕者。但是接下来就听奈里夫描述了一个不详的梦，梦见了孵巢的毁灭，而没多久就传来了古老的学院在雪崩灾难中湮灭的消息。解命师们害怕遇到苍白巫女一样的命运，急忙躲开神谕者的注意，逃到了他们的议事厅。 不过，大铭王是极其注重实用性的人。他怀疑他的解命师只是因为过分胆小才得出这样的结论。他的道理是，既然有这样一位世间少见的神谕者，应该善加利用，扩张版图肯定能事半功倍。因此他将这些胆小的议臣全部降职，并把奈里夫提拔为左右手。尽管对奈里夫的天赋只是一知半解，他还是大胆地说出了他想要的结果，并劝诱奈里夫在预言中说出他的愿望。 起初，一切都很顺利。末代大铭王吹嘘自己收养的是命运的宠物，命运已被他玩弄于股掌。在他准备入侵天欲国的领土时，他企图强迫神谕者为他做出胜利在望的预言，但是只听到奈里夫静静地咕哝着，“事情将朝着两个方向发展。”此外他从奈里夫的口中撬不出更加确凿的言语。他本应将此作为警示，但是他对自己的军队还是很有信心。天欲国地处内陆，军备落后，而且处于孤立无援的状态。他认为“事情将朝着两个方向发展”说的是他那强大的军队将会获胜，而对方只能战败。 当然，现在我们就知道，他当时应该多从字面上去理解。即使是仔细研究评注详实的编年史，当天发生在天欲国宫殿外的战斗场景还是无法想象。怪事是在屠杀进行到一半时发生的，战场开始出现分歧。在每个关键时刻，现实都进行了分裂，变成了碎片。身负重伤和已经阵亡的士兵都站了起来，迈着坚定的步伐前进战斗。他们的思维也进行了分裂，战士们发现自己同时处于活与死的状态，处于存在与消逝的状态。胜利和失败也出现了分裂，所以双方军队都同时感受到了这两种战果。整个位面就像变成了挂满镜子的大厅，而所有的镜子都在无尽地碎裂。 开战双方直接所受的影响就是丧失神智。由于无法理解同时处于获胜和落败的状态，大铭王的思想散成了疯狂的尘埃。天真的天欲王也没有好下场。对立的另一半现实继续重复着分裂，在无尽的历史中回响，而这些现实中所有的居民也开始困惑，没多久就无法进行传统意义上的进食、穿着、防卫或繁殖等行为。 然而，早在回响结束之前，谨慎的西姆瑞解命师们已经抓住了奈里夫，将他五花大绑，并塞住他的嘴巴，用一艘空间飞船把他送出他们的位面，希望能将他摆脱，永远不能害他们。毫无疑问，对他们来说已经太迟了。对我们来说也是如此。"]],
            "d2_sniper":["male","shu",3,["d2_juji","d2_xiandan","d2_ansha"],["des:卡德尔·鹰眼出生在诺伦山脉的山谷中，这里的住民从太古以来就靠猎杀居住在村庄上方悬崖上的一种奇怪生物为生，他们从远距离杀死这种叫峭壁潜行兽的生物，然后收集他们掉下来的尸体。鹰眼是这些怪异住民中其中最棒的射手之一，对他来说，枪械是他身体的一部分，射击就和触摸一样自然。在征召之日，他即将在村庄中获得完全的地位时，他经历了古老的考验：从谷底一击射下一头悬崖上的潜行兽。打空则是耻辱。在全体村民的注视下，鹰眼射击了。一头潜行兽掉下来了；人群欢呼了。但当尸体被收起时，整个村子都沉默了，长老发现子弹穿过了潜行兽中间的眼睛后，紧紧的卡在了它的下颚骨中。这个凶兆正是黑暗预言的开端所描述的，按预言中所说，射出这发子弹的枪手将成为伟大的人，但也将被流放。狙击手鹰眼因此离开了他的人民，被他自己的技术所诅咒，在剩下的预言实现前不得回来，他必须成为战场上的传说。"]],
            "d2_dualSoul":["female","shen",3,["d2_gongsheng"],["des:一同欢喜，一同哭泣；心意相通，生死与共。"]],
            "d2_zeus":["male","wei",3,["d2_leiji","d2_jingdian","d2_leishen","d2_leiyun"],["des:天界之王，众神之父，宙斯对待英雄一向视如己出。然而在无数次与凡间的女性幽会时当场被抓后，宙斯接到了妻子给他下的最后通牒：“既然你这么喜欢凡人，就去当凡人吧。如果你能证明的忠诚，就回来做我永生的丈夫。不然的话，就去和你的创造物一起去死吧。”宙斯无奈的发现她的逻辑（和她的魔法）无懈可击，只好照她说的去做。从那以后宙斯洗心革面，在凡人面前不再多情，将爱留给他永生的女神。但为了证明他配得上永恒的爱妻，他必须在战场上，大获全胜。"]],
            "d2_phantomAssassin":["female","wei",3,["d2_yingbi","d2_mohu","d2_jietuo"],["des:通过占卜和预见，魅影之纱一直严格的甄选一些婴儿来抚养成人，成为她们的刺客。这是一个将刺杀视作神圣的自然法则的女刺客同盟。魅影之纱通过冥想和神谕来确定他们的暗杀目标。她们并不接受契约，也从不因为政治斗争或者金钱利益出手。她们的刺杀完全没有时间规律，似乎是随性为之：不管目标是执掌大权，还是耕田放牧，对她们来说并没有任何差别。即使这些刺杀行为有一个固定的套路，那也是只有组织成员才知道。目标在她们眼中都是牺牲品，而丧命于她们手中则是莫大的荣耀。作为幻影刺客，她们只有组织所赋予的身份，而任何一个幻影刺客都能填补另一个的空缺；她们甚至连代号都不为人知。也许成员有很多，也许只有几个。那谜样面纱之下的真相无人知晓。只有一个，在四下无人之时，那面纱会时不时的被隐秘低语所拂动，低语中，是她自己的名字：茉崔蒂。"]],
            "d2_phoenix":["female","shu",4,["d2_yanling","d2_zhikao","d2_xinxing"],["des:永世的黑暗中，光之守护者的第一个太阳之光轻微闪过，这一束有自我意识的光线注定要在虚空里发光发热。亿万年里，这一束炫目的光芒逐渐聚集了无穷的能量，爆发成了一颗超新星。在这烈火之中，如同其起源一样的光线向四下散射，穿越黑暗的海洋，到达各个星座。很快，这些光芒也将成为超新星，以同样的形式向外传递着光和热。这种奇迹一般的生命与重生将一直持续到创世神鬼斧神工的苍穹之上被完全点亮。在这无尽的轮回中，被凡人们称作凤凰的星星坍塌成型，和其先前的光芒一样，凤凰也一头扎入无尽宇宙，在其邻近的星系中散布光能。经过长久的轮回，逐渐有了意识，开始了解万物，机缘巧合下听闻有一处地方，由于宇宙的横生变故进行着经年累月的战斗。因此众星的新生儿化成了生物形态，渴望在最黑暗的地方闪耀他的光和热。"]],
            "d2_supernova":["none","shu",2,["d2_hengxing","d2_niepan"],["forbidai","des:凤凰的蛋。"]],
            "d2_monkeyKing":["male","shu",4,["d2_bangji","d2_huanbian","d2_houwang"],["des:500年来，他被一座大山压得动弹不得，露在外面的只有头颅。这座石头打造的监牢是由古神降下，为的是镇压他不成熟的暴乱。苔藓开始顺着他脸上的纹路生长，青草从他耳朵里萌发；慢慢地，他的双眼只能看到脸颊旁的土壤里长出的野花。大多数人都以为，与天庭诸神决战后他已不堪凌虐而消亡，流传的只有他的传说。但是，跟故事里一样，齐天大圣是不死之身。他一直在等待。直到诸神前来，给了他一个改过的机会。他忍住了。诸神道出了重获自由的条件时，他接受了他们的任务：护送一名年轻的僧人踏上朝圣之路，一路上保护他不受邪魔外道所侵，并且助他带回价值连城的圣物。同时，为这个神圣的任务虚心接受凡人的调遣，这样才能证明自己的改过。为了寻求改变，悟空向诸神实现了他的誓言，救赎了昔日反叛的罪孽。僧人在历经多番苦难后带着圣物安然返回了故土；而孙悟空——发现自己第一次可以与众神平起平坐——愿意一时放弃对冒险和荣耀的渴望。但是齐天大圣生性不喜清静...而得罪众神也绝不无聊。"]],
            "d2_legionCommander":["female","shu",4,["d2_qianggong","d2_juedou","d2_yongqi"],["des:这是全无征兆的一天。石堂城的城墙里突然传来一阵轰隆隆的声响，一团黑色云雾出现，数不尽的魔兽大军从中奔涌而出，他们的魔火和邪术让所有人措手不及。城内的老弱妇孺纷纷惨遭毒手。曾经所向披靡的石堂城军队，古铜军团闻讯火速赶来响应。他们由未尝一败的指挥官特蕾丝汀带领军团开进城内，只见沿途的巷道溅满了鲜血，市集燃起了熊熊大火。士兵们从敌人中杀出一条血路，到达这次入侵的源头：石堂城的城市广场，虚无裂隙在其中央，旁边则是魔军骇人的首领。 首领浑身笼罩着毁灭性的光芒，挥舞着一把大刀，他二话不说将一名士兵劈成了两半，只见尸首即刻开始腐烂。特蕾丝汀举起溅满鲜血的大刀，目光锁定在这怪物身上。他转过身来，对着她咧开嘴开始笑，牙齿乱得跟迷宫一般。他们全然不顾周遭的激烈战斗，向对方冲去。 两人迅速缠斗在一起。每个招数都被对方挡下，两人的拼死决斗就如舞蹈一般行云流水，古铜军团的士兵则在他们周围一一倒下。特蕾丝汀见对手一刀向她劈来，她纵身一跃，跳到了敌人的身后。局势就此出现了逆转。敌人见状不妙，马上变招，劈砍变成横切，从侧面向她切去，这时她刚站稳，马上为之一振见招拆招。两刀相碰，特蕾丝汀顺势使劲，将刀柄下满是节瘤的敌爪斩下，场上顿时血光一片。其他魔兽见到如此场面早已惊呆，特蕾丝汀趁机发动强攻，将她的长刀刺进敌人的心脏。魔物一声仰天哀嚎，震散了天上的乌云，他在痛苦的扭曲中化成了滚滚淤血。深渊的门户开始颤栗，维系裂隙的力量就如突现一样消失的无影无踪。剩下的入侵者也很快倒在了石堂城的铁骑之下。 尽管赢得了胜利，谁也没有心情庆祝：石堂城满目疮痍，伤亡无数。特蕾丝汀重新扬起战旗，召集了一群友军。她的愤怒随时都会爆发，誓要将深渊的魔物大军赶尽杀绝。谁敢作对，格杀勿论。"]],
            "d2_pudge":["male","qun",4,["d2_rougou","d2_xiuqu","d2_zhijie"],["des:在与囚尸岭南部遥遥相望的戮尽之地，一个肥胖的身影在夜晚不知疲倦地工作着——肢解、开膛、堆积死人的四肢和内脏，一切都是为了在黎明前把战场打扫干净。在这片被诅咒的地方，尸体不会腐烂和分解，虽然不会复活，但无论坟墓挖的有多深，它们都不会回归大地。屠夫帕吉的身边总是围绕着一群食腐鸟类，他为它们切好大小能够塞进鸟嘴的肉块，时间久了，他的技术也越来越成熟。嗖嗖嗖...嗖嗖嗖...唰...肉块就从骨头上掉下来，肌腱和韧带像湿纸一样被剥离。帕吉的兴趣在一开始只是屠宰，但时间一长，他对食尸也产生了兴趣。刚开始时只是这里吃一小块肉，那里小嗫一口血...但很快他就开始了自己的饕餮盛举，即使是躯干上最硬的部位他也像狗啃着骨头一样，津津有味地品尝。就算是面对死神都毫无惧色的猛士，看到屠夫，也是异常恐惧。"]],
            "d2_skywrathMage":["male","qun",3,["d2_aofa","d2_miyin","d2_shengyao","d2_aihen_ai"],["des:作为苍白之巢王庭的高阶法师，扎贡纳斯的生活非常困苦。他天生就宣誓保护荆棘王座之主，但是对现在的天怒女皇痛恨得咬牙切齿。身为出身高贵的年轻人，他与荆棘王座的第一继承人，天怒皇族的长公主曾是亲密无间的伙伴。他对她浓烈的爱意至死不渝，不过出于自身的身份，他全身心投入到奥术的学习中，努力去掌握天怒一族的法术。 由于对奥术的着迷，他没有发现王庭有人密谋背叛仙德尔莎，错失阻止阴谋的机会。在王庭的暴力政变瞬息而过，等他在如山的魔法书前抬起头来，发现他挚爱的老友已经无处寻觅。荆棘王座现在由仙德尔莎心肠歹毒的妹妹霸占，而扎贡纳斯无能为力。天怒法师拥有的魔力只会在他保护天怒皇族时才能掌控，所以奋起反抗荆棘王座只会让他一无是处。他坚守自己的岗位，相信总有一天他的真爱将回到应有的王位上。同时，仙德尔莎残破的肉体经由女神丝奎奥克的魔力成为复仇能量的化身，她也知晓天怒法师的暗恋。 在他梦想着让深爱的女皇重登苍白之巢时，他更渴望让仙德尔莎重拾健全的肉体形态。天性品行高尚，宅心仁厚的他侍奉王庭时阳奉阴违的举动让自己苦恼不已；但是最要命的是，想象着复仇之魂内心因为立场的对立而对他无比憎恨，他痛彻心扉。"]],
            "d2_vengefulSpirit":["female","qun",3,["d2_zheyu","d2_yuannu","d2_daozhi","d2_aihen_hen"],["des:天怒一族这种生物，即使最满足最安心的时候脾气也很暴躁，他们天生就会为了最微不足道的侮辱寻求复仇。然而复仇就是复仇之魂的本质所在。曾经作为一个自傲而残暴的天怒之子，仙德尔莎是苍白之巢的第一继承人，直到一个姐妹背叛了她，夺走了她的继承权。被暗杀者的陷阱困住以后，仙德尔莎以双翼为代价，逃出生天。用对于这一族最丢脸的方式：步行，颠簸逃离了。仙德尔莎明白天怒一族再也不会接受失去翅膀的她作为统治者。而且面对处于最高处的苍白之巢，没有能够飞翔的翅膀是无法接近的，她将无法碰到她的姐妹。不甘作为一个无法飞翔的废物苟活，她对于复仇的渴望超越了所有的俗世欲望，落难的公主向女神丝奎奥克达成了交易：放弃她残破的身体，换来的是精神能量化成的灵体，永世不灭，以复仇为动力，能在物质位面带来浩劫。她或许永远都不能飞翔，但她终将为自己报仇雪恨。 "]],
            "d2_stormSpirit":["male","wei",3,["d2_canying","d2_woliu","d2_leiling"],["des:风暴之灵，正如其名，是狂风和暴雨的野性凝成人形的自然之力。他狂放，乐天，恣意挥洒！就像个受人喜爱的大叔一样，他给所到之处充满欢乐的能量。但事实上，创造出他的是一起灾难。几个世代前，在悲叹山脉远处的平原上，很多人正因干旱和饥荒而挨饿。一个名叫风暴烈酒的元素使，使用禁忌的咒语召唤了风暴之灵，天真的向他祈求雨水。被称为雷神的暴风雨天神对这个凡人的放肆感到愤怒，打算用狂风和洪水把这片土地化为荒地。风暴烈酒完全不是天神的对手，直到最后他用了一个自杀性的咒语，将他和雷神的命运融在了一起，他用自己的身体作为牢笼捕获了雷神。被困在一起后，风暴烈酒那无限的幽默感与雷神疯狂的能量融合了，创造了乐天的雷神·风暴烈酒，一个以物质形态行于世间的天神。"]],
            "d2_emberSpirit":["male","shu",3,["d2_huoquan","d2_huodun","d2_huoling"],["des:悲叹山脉中无人问津的角落里，有一座荒废已久的光火堡。堡内演武堂已经空无一人，校场里满是落叶和灰尘。门窗禁闭的光火殿里放着一口玉石大釜，装满了灰烬，这是当年战争诗人——炘的火葬之地。炘培养了整整三代卫火盟的弟子，从修身养性的真经，到强身健体的武艺，炘悉心教导在堡外闯荡所需的一切本领。然而，作为众多弟子的师傅，他也不得不对付弟子在外惹来的敌人。在炘的暮年，他不敌对手，惨遭兵解。堡内的弟子在此后也奔走各方。一晃之间，数十年乃至数百年转瞬而过，弟子们不断地开枝散叶，而他的教义在口口相传之下慢慢地消逝。后来燃烧天神，一位好学的火神，被他传承的师德所打动，下凡来到了光火堡，重新点燃了灰烬。闪耀的余烬之中，炘的脸庞慢慢浮现，火焰环绕之下他显得格外沉静。为了让知识之火得以燎原，为了让寻求指引的世人接受教导，他已准备就绪。"]],
            "d2_earthSpirit":["male","wu",3,["d2_jushi","d2_cihua","d2_tuling"],["des:陆地上悬崖和峭壁之间的深处，有一层早已被高地矿工放弃的圣玉层。考林将军的雕像就是采用这种材料打造，深埋在地底，引领着一支数以万计的兵马俑。武士俑、军吏俑、说唱俑等等一应俱全，经过工匠的精心雕刻后在大地黑暗的怀抱中沉睡了上千年。 而工匠们没有想到的是，这奇玉之中流转着大地本身的灵魂——与星球一致的元素之力。当玉雕之灵发现自己与世界的生命隔断后，它就在千年的时光中汇聚自己的力量，最终冲上了地面，进入了光明。现在，伟大的大地之灵考林从容地走在地面之上，为大地而战；而土壤的深情怀抱之中埋藏着的大军将会受他召唤，变成残像横扫一切敌人。"]],
            "d2_centaurWarrunner":["male","shu",4,["d2_shuangren","d2_fanji","d2_benta"],["des:相传半人马所到之处，尸横遍野。对于名为战行者的半人马，这场面的确相当壮观。外界谣传，这杜鲁德大草原的四足部落里都是头脑简单，性格残暴的生物。他们虽有语言，但无文字；他们的文化没有图画记录，成型音乐，或是正式宗教。半人马认为，战斗是思想的完美阐释，自身实力的最高体现。如果杀戮是半人马部落中的艺术，那么战行者布拉德瓦登就是其中最伟大的艺术家。他获得主宰部落的地位是在古老的欧梅克斯竞技场，半人马部族千年以来聚集于此，行使他们格斗的权利。随着他声名远扬，不少观众都是不远千里前来目睹这名半人马的雄伟风姿。他总是第一个踏入竞技场，最后一个离开，在血肉横飞、刀光剑影中谱写着战斗的巨著。这是鲜血与钢铁织就的诗篇，飘扬在杀戮场上扬起的尘埃中。赛上暗淡的沙尘间看到的只有挥舞得眼花缭乱的兵器。 战行者将挑战者一个接一个地击败，直到竞技场里欢腾着他的名字，作为部族里无与匹敌的冠军，他感到异常孤独。他被授予竞技场的巨大腰带，系在他伟岸的身躯上。但是这死亡艺术家在他的胜利中只感到空虚。没有挑战的战士还有什么意义？那天强大的半人马就这样带着全新的目标奔出了欧梅克斯竞技场。在他的族人中，战行者是踏入竞技场中最为强大的战士。现在他要证明，自己是有史以来最为强大的斗士。"]],
            "d2_spectre":["female","wei",4,["d2_huangwu","d2_zheshe"],["des:和所有强大的能量都喜欢欺凌弱小一样，被称为墨丘利的幽鬼也是一个拥有着强横能量的存在，同样的，她对现实世界中的冲突和纷争无比着迷。然而她平时的幽鬼形态超越了常人的感知范围，因此每当她以实体形态出现时，她不得不损失一部分自我能量——尽管她也不愿意。在战斗中，她的自我意识逐渐散落并重新聚合，她也开始有了意识。她意识到了自己是幽鬼墨丘利——其他所有的鬼影都只是她自我的阴影。出于重新凝聚的打算，她开始专注，她的心智也在不断的成熟。只有等到她取得胜利或者彻底失败时，她那超物质的形态才会得以重聚。"]],
            "d2_ogreMagi":["male","qun",4,["d2_yanshu","d2_jingtong"],["des:普通食人魔的愚蠢正是一句俗话“蠢的像一袋石头一样”所形容的。在自然状况下，一只食人魔完全没有能力做任何事或下决定。他们不仅邋遢至极，有时一只食人魔还会发现自己吃完一头动物后居然被困在它的皮囊里。食人魔并非社会性生物，经常有人发现他们大岩石或者树桩亲昵的依偎在一起，显然是将这些东西错认成了他们的同类（这也许可以解释食人魔的低繁殖率）。然而，每一世代的食人魔中，都会诞生一只双头的食人魔魔法师，一出生就会立刻被授予传统名字：阿格隆·碎石者，这个名字属于它们种族历史上第一个以及或许是每一世代中唯一有智慧的食人魔。有两个脑袋的食人魔魔法师发现他可以比其他只有一个脑袋的生物更高效的行事。尽管食人魔魔法师无法赢得任何辩论（即使和它自己），但它天生就属于傻人有傻福，这命运中的意外收获让这个无法供养自己的种族在敌人的威胁和恶劣的天气下能繁荣起来。就好像是幸运女神对这个平均智商低下的种族的特别眷顾一样，她赐予了他们食人魔法师。她还能怎样呢？真是可怜的家伙们。"]],
            "d2_outworldDevourer":["male","wei",3,["d2_tianqiu","d2_jingqi","d2_shizhi"],["des:一个高傲且强横的种族中的一员，先兆者，徘徊于虚空裂隙，他是整个世界与创世深渊之间唯一的卫士。在这充斥着星体残片的殁境中，他凝视着天穹，警觉的提防着繁星之外那无底深渊中的任何骚动。在他非凡的智慧中，深藏着对先兆的敏锐洞察力和强烈共鸣，他心中那曲黑暗的协奏曲暗示着：总有一天，在这深渊之中，在那造化之外，会有某种东西醒来，并且注意到我们的世界。由于太专注于监视星体，殁境神蚀者对太阳附近的事件并不关心。然而，随着遗迹发出战争的召唤，随着心中那潜在的危机感不断扩大，殁境神蚀者展开双翼，向着我们的世界飞来。在预言中，先兆者的地位不言而喻：他的出现即是灾厄的征兆。何况，他已然亲临。"]],
            "d2_shadowFiend":["male","shu",3,["d2_souhun","d2_mowang","d2_wange"],["des:据说影魔奈文摩尔有着一个诗人的灵魂，事实上，他吞噬的诗人灵魂早已成千上万。千百年来，他收集了各式各样的灵魂，包括诗人，牧师，帝王，乞丐，奴隶，哲人，罪犯，当然，还有英雄。他拥有着世间所有种类的灵魂。然而没人知道他收集这些灵魂作何之用。从来没有人得以窥视影魔的魂渊之秘，他从魂渊中伸出灵魂触须，蔓延在精神位面。他是把灵魂一个个吞噬了？还是把灵魂堆积在他的影惧神殿里？又或是将灵魂浸在死灵之池中？难道他仅仅是一个被恶魔傀儡大师操纵着，通过位面裂口进入世界的傀儡？尽管众说纷纭，但根本没有人能看透他那黑暗光环下的层层邪恶。然而，如果你实在是很想知道那些灵魂的归宿，有个办法能帮你达成心愿：凡人，将你的灵魂奉献给影魔，或者等待魔王的收割！"]],
            "d2_io":["female","wei",3,["d2_jiban","d2_guozai","d2_jianglin"],["des:艾欧存在于所有地方和世间万物之内。敌人们诋毁它为灭绝者，学者们则尊崇它为闪动的神圣之眼，艾欧同时在所有位面存在着，它们可以在任何时候将自己身体的一小部分转化为物理存在。 就像伟大的双子骑士“暗”与“光”，还有一位来历已淹没在时间中的远古旅者一样，精灵守卫艾欧也是宇宙的基本法则，比时间还要古老，来自凡人无法理解的领域。艾欧不仅仅是物质内部的吸引力和排斥力的结合，它是将实体连接在一起的电荷的直观体现。只有将这些力量进行可控的扭曲，艾欧才能在物理位面被人感受到。作为一股善意、乐于合作的力量，艾欧将它的力量与其它人绑在一起，让盟友的力量得到强化。它的心思深不可测，它的力量无法想象，艾欧在物理位面穿梭着，是神秘宇宙的完美体现。"]],
            // "d2_grimStroke":["male","shu",3,["d2_shenbi","d2_moyong","d2_fuhun"],["des:雅致而老道，狡猾而残忍，天涯墨客挥出束缚着符文之力的毛笔，利用亵渎之墨引导邪恶的力量。从小被培养成族人的卫士，天涯墨客的成神之路反而是建立在他极其乐意的献祭之上。被原为保护之用的魔法吞噬后，天涯墨客的同胞们现在作为墨魂被永久束缚在他的毛笔中—他们痛苦的尖叫和恶毒的形态在他笔下每一幅画中呼之欲出。"]],
            "d2_weaver":["male","wei",3,["d2_suodi","d2_lianji","d2_huisu"],["des:创世之纱需要长期细心的照料，以防止其变得残破；因为一旦它散开了，整个世界就将毁于一旦。编织者的工作就是保持创世之纱的紧密，用现实之网修补它的破损。他们同样要防止那些在创世之纱的缺口上产卵或者侵蚀创世之纱的虫子，只要编织者稍微分心，这些家伙的幼虫就能吞噬掉整个宇宙。斯吉茨格尔是一名大师级的编织者，负责维护一块小补丁的紧密。然而这项任务并不能满足他，他经常唠叨过去那些原始的创造工作，对干完活就走人的世界纺织者也是颇有微词。他想创造，不想只是维护——他想按自己的设计编织出自己的世界。他开始在他负责的区域上做手脚，逐渐不能自拔，他的胆子也愈发的大，甚至私自改动了世界纺织者编织的图案。最后，守卫者来了，毁掉了编织者所作的一切，直接从创世之纱上去除了这一块，然后重新编织，却不让他参与其中。斯吉茨格尔现在孤身一人，被种群所弃，换做任何其他编织者，都会备受折磨。然而斯吉茨格尔却无比愉悦，因为他终于自由了，能够自由的创造，重头开始。他创造新世界所需的所有材料都触手可及。他只需要从缺口处将现在的世界撕裂。"]],
            
        },
        translate:{
            "d2_blessingAngel":"赐福天使",
            "d2_shadowDance":"影舞",
            "d2_crystalMaiden":"水晶室女",
            "d2_rubick":"拉比克",
            "d2_abaddon":"亚巴顿",
            "d2_terrorBlade":"恐怖利刃",
            "d2_mage":"寂静大法师",
            "d2_boss_mage":"寂静大法师",
            "d2_megaCreep":"超级兵",
            "d2_invoker":"祈求者",
            "d2_lina":"莉娜",
            "d2_wraithKing":"冥魂大帝",
            "d2_drowRanger":"卓尔游侠",
            "d2_oracle":"神谕者",
            "d2_sniper":"狙击手",
            "d2_dualSoul":"双生灵",
            "d2_zeus":"宙斯",
            "d2_phantomAssassin":"幻影刺客",
            "d2_phoenix":"凤凰",
            "d2_supernova":"凤凰蛋",
            "d2_monkeyKing":"齐天大圣",
            "d2_legionCommander":"军团指挥官",
            "d2_pudge":"帕吉",
            "d2_skywrathMage":"天怒法师",
            "d2_vengefulSpirit":"复仇之魂",
            "d2_stormSpirit":"风暴之灵",
            "d2_emberSpirit":"灰烬之灵",
            "d2_earthSpirit":"大地之灵",
            "d2_centaurWarrunner":"半人马战行者",
            "d2_spectre":"幽鬼",
            "d2_ogreMagi":"食人魔魔法师",
            "d2_outworldDevourer":"殁境神蚀者",
            "d2_shadowFiend":"影魔",
            "d2_io":"艾欧",
            "d2_grimStroke":"天涯墨客",
            "d2_weaver":"编织者",
        },
    },
    card:{
        card:{
            "d2_aghanims":{
                fullimage:true,
                type:"equip",
                subtype:"equip5",
                skills:["d2_aghanims"],
                nomod:true,
                nopower:true,
                unique:true,
                ai:{
                    equipValue:function(card,player) {
                        if(player.hasSkill('d2_chuancheng')) return 0;
                        return 20;
                    },
                },
            },
            "d2_observer":{
                enable:true,
                range:{
                    attack:1,
                },
                selectTarget:1,
                type:"basic",
                filterTarget:function (card,player,target){
                    return !target.hasSkill('d2_sentry');
                },
                content:function (){
                    if (target.hasSkill('d2_observer')) {
                        target.storage.d2_observer+=3;
                        target.syncStorage('d2_observer');
                    } else {
                        target.addSkill('d2_observer');
                    }
                },
                ai:{
                    order:2,
                    value:2,
                    useful:2,
                    result:{
                        target:function (player,target){
                            return -target.num('h');
                        },
                    },
                },
                fullimage:true,
            },
            "d2_sentry":{
                enable:true,
                range:{
                    attack:1,
                },
                selectTarget:1,
                type:"basic",
                filterTarget:true,
                content:function (){
                    if (target.hasSkill('d2_sentry')) {
                        target.removeSkill('d2_sentry');
                    } else {
                        target.removeSkill('d2_observer');
                        target.addSkill('d2_sentry');
                    }
                },
                ai:{
                    order:2,
                    value:2,
                    useful:2,
                    result:{
                        target:function (player,target){
                            if(target.hasSkill('d2_sentry')) return -1;
                            return 1;
                        },
                    },
                },
                fullimage:true,
            },
            "d2_monkeyKingBar":{
                fullimage:true,
                type:"equip",
                subtype:"equip1",
                nopower:true,
                nomod:true,
                skills:["d2_monkeyKingBar"],
                distance:{
                    attackFrom:-2,
                },
                ai:{
                    equipValue:function(card,player) {
                        if(player.hasSkill('d2_bangji')) return 0;
                        return 4;
                    },
                },
            },
            "d2_bloodStone":{
                type:"equip",
                subtype:"equip5",
                skills:["d2_bloodStone"],
                ai:{
                    equipValue:12,
                },
                nopower:true,
                nomod:true,
                fullimage:true,
                pDelay:false,
                loseDelay:false,
                onLose:function (){
                    delete player.storage.d2_bloodStone;
                    player.unmarkSkill('d2_bloodStone');
                },
                onEquip:function (){
                    player.storage.d2_bloodStone=2;
                    player.markSkill('d2_bloodStone');
                },
            },
            "d2_shivasGuard":{
                type:"equip",
                subtype:"equip2",
                skills:["d2_shivasGuard"],
                fullimage:true,
                ai:{
                    equipValue:8,
                },
                onLose:function (){
                    delete player.storage.d2_shivasGuard;
                    player.unmarkSkill('d2_shivasGuard');
                    var enemies=player.getEnemies();
                    var enemies2=[];
                    for(var i=0;i<enemies.length;i++){
                        if(enemies[i].countCards('h',{name:'sha'})) enemies2.push(enemies[i]);
                    }
                    if(enemies2.length==0) {
                        player.changeHujia(1);
                        player.update();
                        return;
                    }
                    if(enemies2.length==1) {
                        enemies2[0].discard(enemies2[0].getCards('h',{name:'sha'}).randomGet());
                        return;
                    }
                    for(var i=2;i>0;){
                        var e=enemies2.randomGet();
                        e.discard(e.getCards('h',{name:'sha'}).randomGet());
                        if(e.countCards('h',{name:'sha'})<1) enemies2.remove(e);
                        i--;
                    }
                },
                onEquip:function (){
                    player.storage.d2_shivasGuard=true;
                    player.markSkill('d2_shivasGuard');
                },
            },
            "d2_echoSabre":{
                fullimage:true,
                type:"equip",
                subtype:"equip1",
                skills:["d2_echoSabre"],
                distance:{
                    attackFrom:-1,
                },
                ai:{
                    equipValue:5,
                },
            },
            "d2_heartOfTarrasque":{
                type:"equip",
                subtype:"equip5",
                skills:["d2_heartOfTarrasque"],
                ai:{
                    equipValue:12,
                },
                nopower:true,
                nomod:true,
                fullimage:true,
                pDelay:false,
                loseDelay:false,
                onLose:function (){
                    player.loseMaxHp();
                    player.update();
                },
                onEquip:function (){
                    player.gainMaxHp();
                    player.update();
                },
            },
            "d2_dagon1":{
                fullimage:true,
                type:'equip',
                subtype:'equip5',
                nopower:true,
                nomod:true,
                unique:true,
                skills:['d2_dagon1'],
                ai:{
                    equipValue:6
                }
            },
            "d2_dagon2":{
                fullimage:true,
                type:'equip',
                subtype:'equip5',
                nopower:true,
                nomod:true,
                unique:true,
                skills:['d2_dagon2'],
                ai:{
                    equipValue:7
                }
            },
            "d2_dagon3":{
                fullimage:true,
                type:'equip',
                subtype:'equip5',
                nopower:true,
                nomod:true,
                unique:true,
                skills:['d2_dagon3'],
                ai:{
                    equipValue:8
                }
            },
            "d2_dagon4":{
                fullimage:true,
                type:'equip',
                subtype:'equip5',
                nopower:true,
                nomod:true,
                unique:true,
                skills:['d2_dagon4'],
                ai:{
                    equipValue:9
                }
            },
            "d2_dagon5":{
                fullimage:true,
                type:'equip',
                subtype:'equip5',
                nopower:true,
                nomod:true,
                unique:true,
                skills:['d2_dagon5'],
                ai:{
                    equipValue:10
                }
            },
            "d2_linkensSphere":{
                fullimage:true,
                type:'trick',
                global:'d2_linkensSphere',
                ai:{
                    value:6,
                    useful:3,
                },
            },
            "d2_bladeMail":{
                fullimage:true,
                type:'trick',
                global:'d2_bladeMail',
                ai:{
                    value:6,
                    useful:3,
                },
            },
            "d2_smokeOfDeceit":{
                fullimage:true,
                type:'trick',
                enable:true,
                selectTarget:[1,Infinity],
                filterTarget:true,
                content:function(){
                    target.draw();
                    target.addTempSkill('qianxing',{player:'phaseBegin'});
                },
                ai:{
                    order:1,
                    value:2,
                    useful:7,
                    result:{
                        target:1
                    }
                },
            },
            "d2_dust":{
                fullimage:true,
                type:'trick',
                enable:function(card,player){
                    return game.hasPlayer(function(current){
                        return current!=player&&current.hasSkill('qianxing');
                    });
                },
                selectTarget:-1,
                filterTarget:function(card,player,target){
                    return target==player;
                },
                modTarget:true,
                toself:true,
                chongzhu:function(card,player){
                    return !game.hasPlayer(function(current){
                        return current!=player&&current.hasSkill('qianxing');
                    });
                },
                content:function(){
                    var players=game.filterPlayer(function(current){
                        return current!=player&&current.hasSkill('qianxing');
                    });
                    player.line(players);
                    for(var i=0;i<players.length;i++){
                        players[i].removeSkill('qianxing');
                        players[i].randomDiscard();
                    }
                },
                ai:{
                    order:10,
                    value:2,
                    useful:4,
                    result:{
                        player:function(player,target){
                            if (game.hasPlayer(function(current){
                                return current!=player&&current.hasSkill('qianxing')&&get.attitude(player,current)<=0;
                            })) {
                                return 1;
                            }
                            return 0;
                        }
                    }
                },
            },
            "d2_forgedSpirit":{
                enable:true,
                fullimage:true,
                type:"d2_summonedUnit",
                vanish:true,
                usable:1,
                derivation:"d2_invoker",
                filterTarget:function (card,player,target){
                    return target!=player;
                },
                selectTarget:1,
                cardcolor:"red",
                content:function (){
                    'step 0'
                    target.changeHujia(-1);
                    target.update;
                    target.chooseToRespond({name:'shan'}).set('prompt2','否则'+get.translation(player)+'对你造成1点火属性伤害');
                    'step 1'
                    if(!result.bool){
                        target.damage('fire');
                    }
                },
                ai:{
                    value:8,
                    useful:4,
                    result:{
                        target:function (player,target){
                            if(target.hujia) return -2.5;
                            return -1.5;
                        },
                    },
                    order:10,
                },
                tag:{
                    respond:1,
                    respondShan:1,
                    damage:1,
                    natureDamage:1,
                    fireDamage:1,
                },
            },
            "d2_houzihousun":{
                enable:true,
                fullimage:true,
                type:"d2_summonedUnit",
                vanish:true,
                range:{
                    attack:1,
                },
                derivation:"d2_monkeyKing",
                filterTarget:function (card,player,target){
                    return target!=player;
                },
                selectTarget:1,
                content:function (){
                    var card;
                    var cards=target.getCards('h',{name:'tao'});
                    if (cards.length>0) {
                        var card=cards.randomGet();
                        player.gain(card,target);
                        target.$giveAuto(card,player);
                    } else {
                         player.useCard({name:'sha'},target,false);
                    }
                },
                ai:{
                    value:8,
                    useful:4,
                    expose:0.2,
                    result:{
                        target:-1,
                    },
                    order:10,
                },
                tag:{
                    damage:1,
                },
            },
        },
        skill:{
            "d2_aghanims":{
                trigger:{
                    player:"phaseUseEnd",
                },
                forced:true,
                content:function (){
                    if(player.countCards('h')>player.hp){
                        player.addTempSkill('d2_aghanims2');
                    } else {
                        player.draw(2);
                    }
                },
            },
            "d2_aghanims2":{
                mod:{
                    maxHandcard:function (player,num){
                        return num+2;
                    },
                },
            },
            "d2_observer":{
                trigger:{
                    player:["phaseAfter"],
                },
                forced:true,
                mark:true,
                temp:true,
                popup:false,
                intro:{
                    mark:function (dialog,content,player){
                        dialog.addText('手牌对所有人可见，剩余'+player.storage.d2_observer+'回合');
                        dialog.addSmall(player.storage.d2_observer_cards);
                    },
                    content:function (content,player){
                        return player.storage.d2_observer_cards;
                    },
                },
                init:function (player){
                    player.storage.d2_observer=3;
                    player.storage.d2_observer_cards=player.getCards('h');
                },
                onremove:function (player){
                    delete player.storage.d2_observer;
                    delete player.storage.d2_observer_cards;
                },
                content:function (){
                    player.storage.d2_observer--;
                    if(player.storage.d2_observer<=0){
                        player.removeSkill('d2_observer');
                    }
                    else{
                        player.updateMarks();
                    }
                },
                group:"d2_observer2",
            },
            "d2_observer2":{
                trigger:{
                    player:["gainEnd","loseEnd"],
                },
                temp:true,
                forced:true,
                popup:false,
                content:function (){
                    player.storage.d2_observer_cards=player.getCards('h');
                    player.updateMarks();
                },
            },
            "d2_sentry":{
                trigger:{
                    player:"phaseBefore",
                },
                forced:true,
                mark:true,
                temp:true,
                popup:false,
                intro:{
                    content:"不能成为【侦查守卫】、【过河拆桥】、【顺手牵羊】的目标，剩余#回合",
                },
                init:function (player){
                    player.storage.d2_sentry=3;
                },
                onremove:true,
                content:function (){
                    player.storage.d2_sentry--;
                    if(player.storage.d2_sentry<=0){
                        player.removeSkill('d2_sentry');
                    }
                    else{
                        player.updateMarks();
                    }
                },
                mod:{
                    targetEnabled:function (card){
                        if(card.name=='d2_observer'||card.name=='guohe'||card.name=='shunshou') return false;
                    },
                },
            },
            "d2_monkeyKingBar":{
                trigger:{
                    player:"shaBegin",
                },
                priority:10,
                forced:true,
                filter:function (event,player){
                    if (player.hasSkill('d2_bangji')) return true;
                    var check=Math.floor(Math.random()*100);
                    return check<75;
                },
                content:function (){
                    trigger.directHit=true;
                    trigger.untrigger();
                },
            },
            "d2_bloodStone":{
                trigger:{
                    player:"loseEnd",
                },
                intro:{
                    content:"共有#点血精能量",
                },
                forced:true,
                usable:3,
                filter:function (event,player){
                    return player.storage.d2_bloodStone&&_status.currentPhase==player;
                },
                content:function (){
                    player.storage.d2_bloodStone--;
                    player.updateMarks();
                    player.draw();
                },
                group:["d2_bloodStone2","d2_bloodStone3","d2_bloodStone4"],
            },
            "d2_bloodStone2":{
                trigger:{
                    player:"drawEnd",
                },
                usable:3,
                forced:true,
                filter:function (event,player){
                    return event.parent.name!='d2_bloodStone';
                },
                content:function (){
                    player.storage.d2_bloodStone++;
                    player.updateMarks();
                },
            },
            "d2_bloodStone3":{
                trigger:{
                    player:"damageEnd",
                },
                usable:1,
                forced:true,
                content:function (){
                    player.storage.d2_bloodStone=Math.floor(player.storage.d2_bloodStone*2/3);
                    player.updateMarks();
                },
            },
            "d2_bloodStone4":{
                trigger:{
                    source:"damageEnd",
                },
                usable:1,
                forced:true,
                content:function (){
                    player.storage.d2_bloodStone+=2;
                    player.updateMarks();
                },
            },
            "d2_shivasGuard":{
                trigger:{
                    player:"damageBefore",
                },
                forced:true,
                intro:{
                    content:"防止你下一次受到【杀】造成的伤害",
                },
                filter:function (event,player){
                    return event.card&&event.card.name=='sha'&&player.storage.d2_shivasGuard;
                },
                content:function (){
                    trigger.cancel();
                    player.storage.d2_shivasGuard=false;
                    player.unmarkSkill('d2_shivasGuard');
                },
                group:"d2_shivasGuard2",
            },
            "d2_shivasGuard2":{
                trigger:{
                    global:"roundStart",
                },
                forced:true,
                popup:false,
                content:function (){
                    player.markSkill('d2_shivasGuard');
                    player.storage.d2_shivasGuard=true;
                },
            },
            "d2_echoSabre":{
                trigger:{
                    player:'shaAfter'
                },
                usable:1,
                forced:true,
                filter:function(event,player){
                    return event.target.isAlive();
                },
                content:function(){
                    player.useCard(trigger.card,trigger.target);
                },
            },
            "d2_heartOfTarrasque":{
                trigger:{
                    global:'roundStart'
                },
                forced:true,
                filter:function(event,player){
                    return player.isMinHp()&&player.isDamaged();
                },
                content:function(){
                    player.recover();
                },
            },
            "d2_dagon":{
                enable:'phaseUse',
                usable:1,
                filter:function(event,player){
                    var level=get.itemLevel(player,'d2_dagon',5);
                    if(level>2) return true;
                    return game.hasPlayer(function(current){
                        return current!=player&&current.countCards('he');
                    });
                },
                filterTarget:function(card,player,target){
                    var name=player.getEquip(5).name;
                    if (name.indexOf('d2_dagon')!=1&&lib.skill[name].level) {
                        var level=lib.skill[name].level;
                        if (level<3) return target.countCards('he')>0&&target!=player;
                        return target!=player;
                    }
                    return false;
                },
                content:function(){
                    'step 0'
                    event.level=get.itemLevel(player,'d2_dagon',5);
                    player.judge(function(card){
                        event.judgeCard=card;
                    });
                    'step 1'
                    if(event.judgeCard&&target.countCards('h')){
                        target.chooseCard(true).ai=function(card){
                            return get.suit(card)==get.suit(event.judgeCard);
                        };
                    } else {
                        event.goto(5);
                    }
                    'step 2'
                    event.dialog=ui.create.dialog(get.translation(target)+'展示的手牌',result.cards);
                    event.videoId=lib.status.videoId++;
                    game.broadcast('createDialog',event.videoId,get.translation(target)+'展示的手牌',result.cards);
                    game.addVideo('cardDialog',null,[get.translation(target)+'展示的手牌',get.cardsInfo(result.cards),event.videoId]);
                    game.delay(2);
                    'step 3'
                    event.dialog.close();
                    game.addVideo('cardDialog',null,event.videoId);
                    game.broadcast('closeDialog',event.videoId);
                    'step 4'
                    if(get.suit(result.cards[0])==get.suit(event.judgeCard)) {
                        player.draw();
                        event.goto(6);
                    }
                    'step 5'
                    switch(event.level) {
                        case 1:
                            player.discardPlayerCard(target,'he','弃置'+get.translation(target)+'一张牌',true);
                            break;
                        case 2:
                            player.gainPlayerCard(target,'he','获得'+get.translation(target)+'一张牌',true);
                            break;
                        case 3:
                            target.damage(player);
                            break;
                        case 4:
                            target.damage(player);
                            if(target.countCards('he')) player.discardPlayerCard(target,'he','弃置'+get.translation(target)+'一张牌',true);
                            break;
                        case 5:
                            target.damage(player);
                            if(target.countCards('he')) player.gainPlayerCard(target,'he','获得'+get.translation(target)+'一张牌',true);
                            break;
                        default:break;
                    }
                    'step 6'
                    var level=event.level;
                    var card=player.getEquip('d2_dagon'+level);
                    if(card){
                        if(++level<6) card.init([card.suit,card.number,'d2_dagon'+level,card.nature]);
                    }
                },
                ai:{
                    order:1,
                    result:{
                        target:function(player,target){
                            var level=get.itemLevel(player,'d2_dagon',5);
                            var num=level<3?0:-3;
                            switch(target.countCards('h')) {
                                case 0:return num;break;
                                case 1:return -2.5;break;
                                case 2:return -2;break;
                                case 3:return -1.5;break;
                                case 4:return -1;break;
                                default:return -0.5;break;
                            }
                        }
                    },
                },
            },
            "d2_dagon1":{
                group:'d2_dagon',
                level:1,
            },
            "d2_dagon2":{
                group:'d2_dagon',
                level:2,
            },
            "d2_dagon3":{
                group:'d2_dagon',
                level:3,
            },
            "d2_dagon4":{
                group:'d2_dagon',
                level:4,
            },
            "d2_dagon5":{
                group:'d2_dagon',
                level:5,
            },
            "d2_linkensSphere":{
                trigger:{
                    target:'useCardToBefore'
                },
                forced:true,
                filter:function(event,player){
                    if(event.targets.length!=1||event.card==undefined) return false;
                    var card=event.card;
                    return player.countCards('h','d2_linkensSphere')>0&&(get.type(card)=='trick'||get.type(card)=='delay')&&event.player!=player;
                },
                content:function(){
                    var cards=player.getCards('h',{name:'d2_linkensSphere'});
                    player.discard(cards.randomGet());
                    trigger.cancel();
                    player.draw();
                },
            },
            "d2_bladeMail":{
                trigger:{
                    player:'damageEnd'
                },
                forced:true,
                filter:function(event,player){
                    return player.countCards('h','d2_bladeMail')>0&&event.parent.name!='d2_bladeMail'&&event.num>0&&event.source&&event.source!=player&&event.source.isAlive();
                },
                content:function(){
                    var cards=player.getCards('h',{name:'d2_bladeMail'});
                    player.discard(cards.randomGet());
                    player.line(trigger.source);
                    trigger.source.damage(player,trigger.nature);
                },
            },
        },
        translate:{
            "d2_aghanims":"阿哈利姆神杖",
            "d2_aghanims_info":"出牌阶段结束时，若你的手牌大于体力值，本回合内你的手牌上限+2；否则摸两张牌。",
            "d2_observer":"侦查守卫",
            "d2_observer_info":"出牌阶段对一名攻击范围内的角色使用，该角色的手牌对所有人可见，持续3回合。",
            "d2_sentry":"岗哨守卫",
            "d2_sentry_info":"出牌阶段对一名攻击范围内的角色使用，①该角色终止【岗哨守卫】的效果；②该角色终止【侦查守卫】的效果且不能成为【侦查守卫】、【过河拆桥】、【顺手牵羊】的目标，持续3回合。",
            "d2_monkeyKingBar":"金箍棒",
            "d2_monkeyKingBar_info":"锁定技，你的【杀】有75%的概率不可闪避。",
            "d2_forgedSpirit":"小火人",
            "d2_forgedSpirit_info":"出牌阶段限一次，对一名其他角色使用，该角色失去一点护甲并需打出一张【闪】，否则受到你造成的1点火属性伤害。",
            "d2_houzihousun":"猴子猴孙",
            "d2_houzihousun_info":"出牌阶段对一名攻击范围内的其他角色使用，若该角色手牌中有【桃】你获得其中一张，否则视为你对其使用一张【杀】。",
            "d2_summonedUnit":"召唤物",
            "d2_bloodStone":"血精石",
            "d2_bloodStone_info":"①每回合各限一次，你造成伤害后获得2点血精能量，受到伤害后失去1/3的血精能量（向下取整）；②每回合各限三次，你不因【血精石】的效果摸牌时获得1点血精能量，你于回合内失去牌时失去1点血精能量并摸一张牌。",
            "d2_shivasGuard":"希瓦的守护",
            "d2_shivasGuard_info":"锁定技，每回合限一次，防止你受到【杀】造成的伤害；当你失去装备区里的【希瓦的守护】时，随机弃置敌方角色手牌中的两张【杀】，若敌方角色手牌中没有【杀】，你获得一点护甲。",
            "d2_echoSabre":"回音战刃",
            "d2_echoSabre_info":"锁定技，每回合限一次，你的【杀】额外结算一次。",
            "d2_heartOfTarrasque":"恐鳌之心",
            "d2_heartOfTarrasque_info":"锁定技，①每轮开始时，若你的体力值为全场最少或之一，你回复一点体力；②当你装备恐鳌之心时你的体力上限+1。",
            "d2_dagon":"达贡",
            "d2_dagon1":"达贡之神力一",
            "d2_dagon1_info":"出牌阶段限一次，你可以进行一次判定并令一名有牌的其他角色展示一张与判定牌花色相同的手牌，若其无法如此做，你弃置其一张牌。升级达贡之神力。",
            "d2_dagon2":"达贡之神力二",
            "d2_dagon2_info":"出牌阶段限一次，你可以进行一次判定并令一名有牌的其他角色展示一张与判定牌花色相同的手牌，若其无法如此做，你获得其一张牌。升级达贡之神力。",
            "d2_dagon3":"达贡之神力三",
            "d2_dagon3_info":"出牌阶段限一次，你可以进行一次判定并令一名其他角色展示一张与判定牌花色相同的手牌，若其无法如此做，你对其造成一点伤害。升级达贡之神力。",
            "d2_dagon4":"达贡之神力四",
            "d2_dagon4_info":"出牌阶段限一次，你可以进行一次判定并令一名其他角色展示一张与判定牌花色相同的手牌，若其无法如此做，你对其造成一点伤害并弃置其一张牌。升级达贡之神力。",
            "d2_dagon5":"达贡之神力五",
            "d2_dagon5_info":"出牌阶段限一次，你可以进行一次判定并令一名其他角色展示一张与判定牌花色相同的手牌，若其无法如此做，你对其造成一点伤害并获得其一张牌。",
            "d2_linkensSphere":"林肯法球",
            "d2_linkensSphere_info":"其他角色使用锦囊牌指定你为唯一目标时，弃置手牌中的林肯法球，取消该牌并摸一张牌。",
            "d2_bladeMail":"刃甲",
            "d2_bladeMail_info":"其他角色对你造成伤害后，弃置手牌中的刃甲，对该角色造成一点伤害（此伤害不触发刃甲）。",
            "d2_smokeOfDeceit":'诡计之雾',
            "d2_smokeOfDeceit_info":"出牌阶段对任意名角色使用，这些角色摸一张牌并获得【潜行】直到其回合开始。",
            "d2_dust":"显影之尘",
            "d2_dust_info":"出牌阶段对自己使用，场上所有拥有【潜行】的其他角色失去潜行并随机弃置一张牌。场上没有拥有【潜行】的其他角色不能使用但能重铸。",
        },
        list:[["spade","13","d2_aghanims"],["diamond","5","d2_observer"],["diamond","6","d2_observer"],["diamond","7","d2_observer"],["club","5","d2_sentry"],["club","6","d2_sentry"],
             ["club","7","d2_sentry"],["diamond","5","d2_observer"],["diamond","6","d2_observer"],["diamond","7","d2_observer"],["club","5","d2_sentry"],["club","6","d2_sentry"],
             ["club","7","d2_sentry"],["club","6","d2_monkeyKingBar"],["diamond","13","d2_bloodStone"],["spade","9","d2_shivasGuard"],["spade","6","d2_echoSabre"],["heart","13","d2_heartOfTarrasque"],
             ["spade","6","d2_dagon1"],["diamond","1","d2_linkensSphere"],["diamond","1","d2_linkensSphere"],["spade","2","d2_bladeMail"],["spade","2","d2_bladeMail"],
             ["diamond","8","d2_smokeOfDeceit"],["diamond","9","d2_smokeOfDeceit"],["diamond","10","d2_smokeOfDeceit"],["club","8","d2_dust"],["club","9","d2_dust"],["club","10","d2_dust"]],
    },
    skill:{
        skill:{
            "_d2_dieAudio":{
                trigger:{
                    player:"dieBegin",
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                    return player.name.indexOf('d2_')>=0;
                },
                content:function (){
                    if(player.hasSkill('d2_aihen_ai')&&player.storage.d2_aihen_ai) return;
                    game.playAudio("../extension/Dota2/die/",player.name);
                },
            },
            "_d2_dietrigger":{
                trigger:{
                    source:"dieBegin",
                },
                priority:100,
                forced:true,
                popup:false,
                init:function (player){
                    player.storage.kills=0;
                },
                filter:function (event,player){
                    if(get.mode()=='stone') return false;
                    return lib.config.announcer!='disable';
                },
                content:function (){
                    var myTrigger = '';
                    if(!player.storage.kills) player.storage.kills=0;
                    switch(player.storage.kills++){
                        case 0:myTrigger='firstBlood';break;
                        case 1:myTrigger='doubleKill';break;
                        case 2:myTrigger='tripleKill';break;
                        case 3:myTrigger='ultraKill';break;
                        default:myTrigger='rampage';break;
                    }
                    event.trigger(myTrigger);
                },
            },
            "_d2_firstBlood":{
                skillAnimation:true,
                animationStr:"第一滴血",
                trigger:{
                    player:"firstBlood",
                },
                priority:100,
                forced:true,
                filter:function (event,player){
                    return !lib.storage.firstBlood;
                },
                content:function (){
                    lib.storage.firstBlood=true;
                    game.log(player,'拿下了第一滴血！');
                    game.playAudio("../extension/Dota2/announcer/"+lib.config.announcer,"_d2_firstBlood");
                    player.$damagepop('一血','unknownx');
                },
            },
            "_d2_doubleKill":{
                skillAnimation:true,
                animationStr:"双杀",
                trigger:{
                    player:"doubleKill",
                },
                priority:100,
                forced:true,
                content:function (){
                    game.log(player,'拿下了双杀！')
                    game.playAudio("../extension/Dota2/announcer/"+lib.config.announcer,"_d2_doubleKill");
                    player.$damagepop('双杀','unknownx');
                },
            },
            "_d2_tripleKill":{
                skillAnimation:true,
                animationStr:"三杀",
                trigger:{
                    player:"tripleKill",
                },
                priority:100,
                forced:true,
                content:function (){
                    game.log(player,'拿下了三杀！')
                    game.playAudio("../extension/Dota2/announcer/"+lib.config.announcer,"_d2_tripleKill");
                    player.$damagepop('三杀','unknownx');
                },
            },
            "_d2_ultraKill":{
                skillAnimation:true,
                animationStr:"疯狂杀戮",
                trigger:{
                    player:"ultraKill",
                },
                priority:100,
                forced:true,
                content:function (){
                    game.log(player,'正在疯狂杀戮！')
                    game.playAudio("../extension/Dota2/announcer/"+lib.config.announcer,"_d2_ultraKill");
                    player.$damagepop('疯狂杀戮','unknownx');
                },
            },
            "_d2_rampage":{
                skillAnimation:true,
                animationStr:"暴走",
                trigger:{
                    player:"rampage",
                },
                priority:100,
                forced:true,
                content:function (){
                    game.log(player,+'已经暴走啦！')
                    game.playAudio("../extension/Dota2/announcer/"+lib.config.announcer,"_d2_rampage");
                    player.$damagepop('暴走','unknownx');
                },
            },
            "_d2_rune":{
                trigger:{
                    global:'roundStart',
                },
                forced:true,
                popup:false,
                filter:function(event,player){
                    if(!lib.config.rune) return false;
                    if(!game.hasPlayer(function(current){
                        return current.storage._d2_rune;
                    })) {
                        game.filterPlayer().randomGet().storage._d2_rune=true;
                    }
                    if(game.runeNumber===undefined) game.runeNumber=1;
                    return player.storage._d2_rune&&game.runeNumber==game.roundNumber;
                },
                content:function(){
                    'step 0'
                    player.storage._d2_rune=false;
                    game.runeNumber++;
                    var list=['damage','illusion','arcane','haste','regeneration','invisibility','bounty'];
                    var rune='d2_rune_'+list.randomGet();
                    // rune='d2_rune_invisibility';
                    // player.popup(rune);  
                    player.chat('本次神符：'+get.translation(rune));
                    event.rune=rune;
                    var rivals=game.filterPlayer(function(current){
                        return current!=player&&current.countCards('h');
                    });
                    if (!rivals.length||player.countCards('h')<1){
                        player.popup(event.rune);
                        player.addTempSkill(event.rune,'roundStart');
                        event.finish();
                    } else {
                        rivals.sortBySeat(player);
                        event.list=rivals;
                        event.torespond=[];
                    }
                    'step 1'
                    if(event.list.length){
                        event.current=event.list.shift();
                        event.current.chooseBool('是否响应'+get.translation(player)+'的'+get.translation(event.rune)+'？',function(event,player){
                            if(get.attitude(player,_status.event.source)>=0) return false;
                            var hs=player.getCards('h');
                            var dutag=player.hasSkillTag('nodu');
                            for(var i=0;i<hs.length;i++){
                                var value=get.value(hs[i],player);
                                if(hs[i].name=='du'&&dutag) continue;
                                if(value<0) return true;
                                if(!_status.event.hasTarget){
                                    if(hs[i].number>=8&&value<=7) return true;
                                    if(value<=3) return true;
                                }
                                else if(_status.event.hasTarget%2==1){
                                    if(hs[i].number>=11&&value<=6) return true;
                                }
                            }
                            return false;
                        }).set('source',player).set('hasTarget',event.torespond.length);
                    }
                    else{
                        event.goto(3);
                    }
                    'step 2'
                    if(result.bool){
                        event.torespond.push(event.current);
                        event.current.line(player,'green');
                        event.current.popup('响应');
                        game.log(event.current,'响应了'+get.translation(event.rune));
                        game.delayx(0.5);
                    }
                    event.goto(1);
                    'step 3'
                    if(event.torespond.length==0){
                        event.myRune=true;
                    }
                    else{
                        event.myRune=false;
                        player.chooseToCompare(event.torespond).callback=lib.skill._d2_rune.callback;
                    }
                    'step 4'
                    if(event.myRune){
                        player.popup(event.rune);
                        player.addTempSkill(event.rune,'roundStart');
                    } else {
                        event.winningPlayer.popup(event.rune);
                        event.winningPlayer.addTempSkill(event.rune,'roundStart');
                    }
                },
                callback:function(){
                    var winningNum=event.parent.parent.winningNum;
                    if(winningNum==event.card2.number) {
                        event.parent.parent.myRune=true;
                        return;
                    }
                    if(event.card1.number>=event.card2.number&&(event.card1.number>=winningNum||winningNum==undefined)){
                        event.parent.parent.winningNum=event.card1.number;
                        event.parent.parent.winningPlayer=player;
                    } else {
                        event.parent.parent.myRune=false;
                        if(winningNum<event.card2.number||winningNum==undefined){
                            event.parent.parent.winningNum=event.card2.number;
                            event.parent.parent.winningPlayer=target;
                        }
                    } 
                },
            },
            "d2_rune_damage":{
                trigger:{
                    source:'damageBegin'
                },
                forced:true,
                popup:false,
                mark:true,
                marktext:'符',
                init:function(player){
                    player.storage.d2_rune_damage=1;
                },
                intro:{
                    content:'你使用【杀】造成的伤害+1'
                },
                filter:function(event,player){
                    return event.card&&event.card.name=='sha';
                },
                content:function(){
                    trigger.num++;
                },
            },
            "d2_rune_illusion":{
                trigger:{
                    target:'useCardToBefore'
                },
                forced:true,
                popup:false,
                mark:true,
                marktext:'符',
                init:function(player){
                    player.storage.d2_rune_illusion=2;
                },
                intro:{
                    content:'每回合限一次，每当你成为其他角色的牌的目标时取消之并摸一张牌'
                },
                usable:1,
                filter:function(event,player){
                    return event.card&&event.player!=player;
                },
                content:function(){
                    trigger.cancel();
                    player.draw();
                },
            },
            "d2_rune_arcane":{
                trigger:{
                    player:'phaseDrawBefore'
                },
                forced:true,
                popup:false,
                mark:true,
                marktext:'符',
                init:function(player){
                    player.storage.d2_rune_arcane=3;
                },
                intro:{
                    content:'摸牌阶段摸牌数+2，手牌上限+2'
                },
                content:function(){
                    trigger.num+=2;
                },
                mod:{
                    maxHandcard:function (player,num){
                        return num+=2;
                    },
                },
            },
            "d2_rune_haste":{
                trigger:{
                    player:["gainEnd","loseEnd"],
                },
                forced:true,
                popup:false,
                mark:true,
                marktext:'符',
                init:function(player){
                    player.storage.d2_rune_haste=4;
                    var list=[];
                    for(var i=1;i<=5;i++){
                        if(!player.getEquip(i)){
                            var name=get.inpile('equip'+i).randomGet();
                            if(name){
                                var card=game.createCard(name);
                                list.push(card);
                                player.equip(card)._triggered=null;
                            }
                        }
                    }
                    if(list.length){
                        player.$draw(list);
                    }
                    player.storage.d2_rune_haste_lose=list;
                    player.storage.d2_rune_haste_gain=[];
                },
                onremove:function(player){
                    var cards=player.storage.d2_rune_haste_lose;
                    player.lose(cards)._triggered=null;
                    player.$throw(cards);
                    game.delay(0.7);
                    ui.clear();
                    delete player.storage.d2_rune_haste_lose;
                    delete player.storage.d2_rune_haste_gain;
                },
                intro:{
                    mark:function(dialog,content,player){
                        dialog.addText('新的一轮开始时你失去这些牌：');
                        if(player.storage.d2_rune_haste_lose.length) dialog.addSmall(player.storage.d2_rune_haste_lose);
                        else dialog.addText('（无）');
                    },
                    content:function(storage,player){
                        return '新的一轮开始时你失去这些牌：'+get.translation(player.storage.d2_rune_haste_equip);
                    }
                },
                filter:function(event,player){
                    for(var i=0;i<event.cards.length;i++){
                        if(player.storage.d2_rune_haste_lose.contains(event.cards[i])||player.storage.d2_rune_haste_gain.contains(event.cards[i])) return true;
                    }
                    return false;
                },
                content:function(){
                    for(var i=0;i<trigger.cards.length;i++){
                        if(trigger.name=='lose') {
                            player.storage.d2_rune_haste_lose.remove(trigger.cards[i]);
                            player.storage.d2_rune_haste_gain.push(trigger.cards[i]);
                        }
                        if(trigger.name=='gain') {
                            player.storage.d2_rune_haste_gain.remove(trigger.cards[i]);
                            player.storage.d2_rune_haste_lose.push(trigger.cards[i]);
                        }
                    }
                }
            },
            "d2_rune_regeneration":{
                trigger:{
                    player:['phaseBegin','phaseAfter']
                },
                forced:true,
                popup:false,
                mark:true,
                marktext:'符',
                init:function(player){
                    player.storage.d2_rune_regeneration=5;
                },
                intro:{
                    content:'准备阶段及结束阶段，你回复一点体力'
                },
                content:function(){
                    player.recover();
                },
            },
            "d2_rune_invisibility":{
                mark:true,
                marktext:'符',
                init:function(player){
                    player.storage.d2_rune_invisibility=6;
                    player.addAdditionalSkill('d2_rune_invisibility','qianxing');
                },
                intro:{
                    content:'获得【潜行】直到新的一轮开始'
                },
            },
            "d2_rune_bounty":{
                trigger:{
                    player:'phaseBegin'
                },
                forced:true,
                popup:false,
                mark:true,
                marktext:'符',
                init:function(player){
                    player.storage.d2_rune_bounty=7;
                },
                intro:{
                    content:'准备阶段，你令任意名角色摸一张牌'
                },
                content:function(){
                    'step 0'
                    player.chooseTarget('赏金神符：令任意名角色摸一张牌',true,[0,Infinity],function(card,player,target){
                        return true;
                    }).set('ai',function(target){
                        return get.attitude(player,target);
                    });
                    'step 1'
                    if(result.bool){
                        var targets=result.targets;
                        player.line(result.targets,'green');
                        game.asyncDraw(targets);
                    }
                },
            },
            
            "d2_junheng":{
                trigger:{
                    player:"phaseBegin",
                },
                forced:true,
                content:function (){
                    'step 0'
                    player.chooseTarget('均衡',true,function(card,player,target){
                        return true;
                    }).set('ai',function(target){
                        var attitude=get.attitude(_status.event.player,target);
                        if(attitude<0) return attitude;
                        var hp=target.hp;
                        var card=target.get('h').length;
                        if(hp==card) return 0;
                        var num=0;
                        if(card>hp){
                            if(hp==target.maxHp) return 0;
                            num+=(card-hp)*2;
                            if(hp==1) num+=1;
                        } else {
                            num+=hp-card;
                        }
                        return attitude+num;
                    });
                    'step 1' 
                    var target;
                    if(event.onlytarget){
                        target=event.onlytarget;
                    }
                    else if(result.targets&&result.targets.length){
                        target=result.targets[0];
                    }
                    var card=target.get('h').length;
                    var hp=target.hp;
                    if(hp>card){
                        target.draw(hp-card);
                    } else if (card>hp){
                        target.recover(card-hp);
                    }
                    player.line(target,'green');
                    game.log(target,'被均衡了。');
                },
                ai:{
                    expose:0.4,
                },
            },
            "d2_shengdi":{
                enable:"phaseUse",
                usable:1,
                filter:function (event,player){
                    return player.countCards('h',{type:'trick'})||player.countCards('h',{type:'delay'});
                },
                filterTarget:function (card,player,target){
                    return true;
                },
                selectTarget:[1,3],
                filterCard:function (card){
                    return get.type(card)=='trick'||get.type(card)=='delay';
                },
                selectCard:1,
                check:function (card){
                    return 6-get.value(card);
                },
                content:function (){
                    target.discard(target.get('j'));
                    target.addSkill('d2_shengdi2');
                    target.markSkill('d2_shengdi2');
                },
                ai:{
                    order:1,
                    threaten:1.5,
                    expose:0.3,
                    result:{
                        target:function (player,target){
                            if(target.get('j')) return 2;
                            return 1;
                        },
                    },
                },
            },
            "d2_shengdi2":{
                mark:true,
                marktext:"圣",
                intro:{
                    content:"下个准备阶段弃置判定区内的牌",
                },
                trigger:{
                    player:"phaseBegin",
                },
                forced:true,
                popup:false,
                content:function (){
                    player.discard(player.get('j'));
                    player.removeSkill('d2_shengdi2');
                },
            },
            "d2_biyou":{
                trigger:{
                    global:"dying",
                },
                priority:12,
                skillAnimation:"epic",
                animationStr:"天使庇佑",
                animationColor:"water",
                filter:function (event,player){
                    return player.maxHp>1;
                },
                check:function (event,player){
                    if(get.attitude(player,event.player)<=0) return false;
                    if(event.player==player&&player.maxHp==1) return false;
                    if(event.player.hp+player.get('h','tao').length>0) return false;
                    return true;
                },
                content:function (){
                    player.loseMaxHp();
                    var target=trigger.player;
                    var num=1-target.hp;
                    target.recover(num);
                    player.line(target,'green');
                    if(player.getEquip('d2_aghanims')){
                        target.draw(Math.min(5,target.maxHp));
                    }
                },
                ai:{
                    threaten:2,
                    save:true,
                    expose:1,
                },
            },
            "d2_souhun":{
                trigger:{
                    source:"damageBegin",
                },
                marktext:"魂",
                prompt:function (event,player){
                    return '是否对'+get.translation(event.player)+'发动【搜魂】';
                },
                filter:function (event,player){
                    var num=player.storage.d2_souhun;
                    if(player.getEquip('d2_aghanims')) return num>1;
                    return num>2;
                },
                check:function (event,player){
                    return get.attitude(player,event.player)<0;
                },
                init:function (player){
                    player.storage.d2_souhun=0;
                },
                intro:{
                    content:function (storage,player){
                        if(storage==0) {
                            return "尚未有灵魂。";
                        } else {
                            return "已搜集"+storage+"个灵魂。";
                        }
                    },
                },
                group:["d2_souhun2"],
                content:function (){
                    trigger.num++;
                    var num=3;
                    if(player.getEquip('d2_aghanims')) num=2;
                    player.storage.d2_souhun-=num;
                    player.syncStorage('d2_souhun');
                    if(player.storage.d2_souhun<=0) player.unmarkSkill('d2_souhun');
                    if(player.name!='d2_shadowDance'&&player.gender!='female') game.playAudio("../extension/Dota2","d2_souhun"+[3,4].randomGet());
                },
                ai:{
                    threaten:1.6,
                    expose:0.5,
                },
            },
            "d2_souhun2":{
                trigger:{
                    source:"damageEnd",
                },
                forced:true,
                popup:false,
                content:function (){
                    player.storage.d2_souhun++;
                    player.markSkill('d2_souhun');
                    if(player.hasSkill('d2_wange')) player.storage.d2_wange_souls++;
                    if(player.name!='d2_shadowDance'&&player.gender!='female') game.playAudio("../extension/Dota2","d2_souhun"+[1,2].randomGet());
                },
            },
            "d2_qianren":{
                enable:"phaseUse",
                usable:1,
                selectTarget:-1,
                delay:false,
                line:false,
                log:"notarget",
                multitarget:true,
                filter:function (event,player){
                    return player.countCards('h',{name:'sha'});
                },
                filterTarget:function (card,player,target){
                    return player.canUse('wanjian',target);
                },
                content:function (){
                    'step 0'
                    player.showHandcards();
                    'step 1'
                    player.discard(player.get('h',{name:'sha'}));
                    'step 2'
                    player.useCard({name:'wanjian'},targets);
                },
                ai:{
                    order:function (item,player){
                        var num=player.countCards('h',{name:'sha'});
                        if(num==1) return 10;
                        return 1;
                    },
                    threaten:1.6,
                    result:{
                        target:function (player,target){
                            return get.effect(target,{name:'wanjian'},player,target);
                        },
                    },
                },
            },
            "d2_aoshu":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseDrawBefore",
                },
                check:function (event,player){
                    if(player.skipList.contains('phaseUse')) return true;
                    if(player.countCards('h')>player.hp+2) return true;
                    var player=_status.event.player;
                    var num,players=game.filterPlayer();
                    return player.hasFriend();
                },
                content:function (){
                    trigger.cancel();
                    player.addSkill('d2_aoshu2');
                },
                ai:{
                    threaten:2,
                    expose:0.2,
                },
            },
            "d2_aoshu2":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseEnd",
                },
                forced:true,
                content:function (){
                    'step 0'
                    player.draw(2);
                    player.chooseTarget('选择至多2名其他角色摸一张牌',[1,2],function(card,player,target){
                        return player!=target;
                    }).set('ai',function(target){
                        return get.attitude(player,target);
                    });
                    'step 1'
                    if(result.bool){
                        var targets=result.targets;
                        player.line(result.targets,'green');
                        game.asyncDraw(targets);
                    }
                    player.removeSkill('d2_aoshu2');
                },
            },
            "d2_bingfeng":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"damageEnd",
                },
                priority:9,
                filter:function (event,player){
                    return event&&event.source&&!event.source.hasSkill('d2_bingfeng2')&&event.source!=player;
                },
                check:function (event,player){
                    return (get.attitude(player,event.source)<=0);
                },
                content:function (){
                    var target=trigger.source;
                    player.line(target,'thunder');
                    target.addTempSkill('d2_bingfeng2',{player:'phaseBegin'});
                },
                ai:{
                    threaten:0.7,
                    expose:0.1,
                },
            },
            "d2_bingfeng2":{
                unique:true,
                intro:{
                    content:"不能使用或打出基本牌",
                },
                mark:true,
                marktext:"冰",
                onremove:true,
                mod:{
                    cardEnabled:function (card,player){
                        if(get.type(card,'basic')=='basic') return false;
                    },
                    cardUsable:function (card,player){
                        if(get.type(card,'basic')=='basic') return false;
                    },
                    cardRespondable:function (card,player){
                        if(get.type(card,'basic')=='basic') return false;
                    },
                    cardSavable:function (card,player){
                        if(get.type(card,'basic')=='basic') return false;
                    },
                },
            },
            "d2_hanyu":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                mark:true,
                unique:true,
                skillAnimation:"epic",
                animationStr:"极寒领域",
                animationColor:"water",
                init:function (player){
                    player.storage.d2_hanyu=false;
                },
                filter:function (event,player){
                    if(player.storage.d2_hanyu) return false;
                    return true;
                },
                filterTarget:function (card,player,target){
                    return player!=target;
                },
                selectTarget:[0,3],
                multiline:true,
                line:"thunder",
                contentBefore:function (){
                    if(player.getEquip('d2_aghanims')){
                        for(var i=0;i<targets.length;i++){
                            targets[i].storage.d2_bingfeng2=player;
                            targets[i].addTempSkill('d2_bingfeng2',{player:'phaseAfter'});
                        }
                    }
                },
                content:function (){
                    if(target&&target.countCards('he')) {
                        player.discardPlayerCard(target,'he','极寒领域：弃置'+get.translation(target)+'一张牌',1);
                    }
                },
                contentAfter:function (){
                    player.storage.d2_hanyu=true;
                    player.addSkill(['d2_hanyu2','d2_hanyu3']);
                    player.awakenSkill('d2_hanyu');
                },
                ai:{
                    order:1,
                    result:{
                        player:function (player){
                            if(player.getEquip('d2_aghanims')) return 10;
                            if(lib.config.mode=='identity'&&game.zhu.isZhu&&player.identity=='fan'){
                                if(game.zhu.hp==1&&game.zhu.countCards('h')<=2) return 1;
                            }
                            var num=0;
                            var players=game.filterPlayer();
                            for(var i=0;i<players.length;i++){
                                var att=get.attitude(player,players[i]);
                                if(att>0) att=1;
                                if(att<0) att=-1;
                                if(players[i]!=player&&players[i].hp<=3){
                                    if(players[i].countCards('h')==0) num+=att/players[i].hp;
                                    else if(players[i].countCards('h')==1) num+=att/2/players[i].hp;
                                    else if(players[i].countCards('h')==2) num+=att/4/players[i].hp;
                                }
                                if(players[i].hp==1) num+=att*1.5;
                            }
                            if(player.hp==1){
                                return -num;
                            }
                            if(player.hp==2){
                                return -game.players.length/4-num;
                            }
                            return -game.players.length/3-num;
                        },
                        target:-2,
                    },
                },
                intro:{
                    content:"limited",
                },
            },
            "d2_hanyu2":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseEnd",
                },
                forced:true,
                mark:true,
                marktext:"域",
                init:function (player){
                    player.storage.d2_hanyu2=3;
                },
                filter:function (event,player){
                    return player.storage.d2_hanyu2;
                },
                intro:{
                    content:"剩余#回合",
                },
                content:function (){
                    'step 0'
                    player.storage.d2_hanyu2--;
                    if(player.storage.d2_hanyu2<=0){
                        delete player.storage.d2_hanyu2;
                        player.removeSkill(['d2_hanyu2','d2_hanyu3']);
                    };
                    player.syncStorage('d2_hanyu2');
                    player.chooseTarget('对至多2名角色造成一点伤害',[0,2],function(card,player,target){
                        return player!=target;
                    }).set('ai',function(target){
                        return get.damageEffect(target,player,player);
                    });
                    'step 1'
                    if(result.bool){
                        var targets=result.targets;
                        player.line(targets,'red');
                        for(var i=0;i<targets.length;i++){
                            targets[i].damage(player);
                        }
                    }
                },
                mod:{
                    cardEnabled:function (card,player){
                        return false;
                    },
                },
                ai:{
                    threaten:3,
                    effect:{
                        target:function (card,player,target){
                            if(get.tag(card,'damage')) return [1,-2];
                        },
                    },
                },
            },
            "d2_hanyu3":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"damageBegin",
                },
                forced:true,
                content:function (){
                    delete player.storage.d2_hanyu2;
                    player.removeSkill(['d2_hanyu2','d2_hanyu3']);
                },
            },
            "d2_binghuo_bing":{
                audio:"ext:Dota2:2",
                unique:true,
                link:true,
                linkCharacters:["d2_crystalMaiden","d2_lina"],
                skillAnimation:true,
                animationStr:"冰火之歌",
                trigger:{
                    player:"phaseBegin",
                },
                forced:true,
                init:function (player){
                    player.storage.d2_binghuo_bing=false;
                },
                filter:function (event,player){
                    return !player.storage.d2_binghuo_bing&&game.linkFilter(player,'d2_binghuo_bing');
                },
                content:function (){
                    player.storage.d2_binghuo_bing=true;
                    var lina=game.filterPlayer(function(current){
                        return current.name=='d2_lina';
                    });
                    player.line(lina);
                    for (var i = 0; i < lina.length; i++) {
                        lina[i].randomDiscard(2);
                    }
                    player.awakenSkill('d2_binghuo_bing');
                },
            },
            "d2_chuancheng":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseBegin",
                },
                forced:true,
                filter:function (event,player){
                    if(player.getEquip('d2_aghanims')||!get.cardPile('d2_aghanims')) return false;
                    return true;
                },
                content:function (){
                    var card=get.cardPile('d2_aghanims');
                    if(card){
                        player.equip(card);
                        player.$gain2(card);
                        game.delayx();
                    }
                },
                group:["d2_chuancheng2"],
            },
            "d2_chuancheng2":{
                audio:"ext:Dota2:1",
                trigger:{
                    global:"useCard",
                },
                forced:true,
                filter:function (event,player){
                    return event.card.name=='d2_aghanims'&&event.player!=player;
                },
                content:function (){
                    player.draw();
                },
            },
            "d2_ruohua":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                filter:function (event,player){
                    return player.countCards('h');
                },
                check:function (card){
                    return 5-get.value(card);
                },
                selectCard:[1,3],
                filterCard:true,
                filterTarget:function (card,player,target){
                    return player!=target&&!(target.hasSkill('d2_ruohua1')&&target.hasSkill('d2_ruohua2')&&target.hasSkill('d2_ruohua3'));
                },
                selectTarget:function (){
                    return ui.selected.cards.length;
                },
                content:function (){
                    var list=['d2_ruohua1','d2_ruohua2','d2_ruohua3'];
                    for(var i=0;i<list.length;i++){
                        if(target.hasSkill(list[i])){
                            list.splice(i--,1);
                        }
                    }
                    if(list.length){
                        target.addSkill(list.randomGet());
                    }
                },
                ai:{
                    order:2,
                    expose:0.2,
                    result:{
                        target:-1,
                    },
                },
            },
            "d2_ruohua1":{
                trigger:{
                    player:"phaseAfter",
                },
                forced:true,
                popup:false,
                mark:true,
                marktext:"弱",
                intro:{
                    content:"下个回合手牌上限-1",
                },
                init:function (player){
                    player.storage.d2_ruohua1=1;
                },
                content:function (){
                    player.removeSkill('d2_ruohua1');
                },
                mod:{
                    maxHandcard:function (player,num){
                        return num--;
                    },
                },
            },
            "d2_ruohua2":{
                trigger:{
                    player:"phaseDrawBefore",
                },
                mark:true,
                marktext:"弱",
                intro:{
                    content:"下个摸牌阶段少摸一张牌",
                },
                init:function (player){
                    player.storage.d2_ruohua2=2;
                },
                forced:true,
                popup:false,
                content:function (){
                    trigger.num--;
                    player.removeSkill('d2_ruohua2');
                },
            },
            "d2_ruohua3":{
                trigger:{
                    source:"damageBegin",
                },
                mark:true,
                marktext:"弱",
                intro:{
                    content:"下一次造成的伤害-1",
                },
                init:function (player){
                    player.storage.d2_ruohua3=3;
                },
                forced:true,
                popup:false,
                content:function (){
                    trigger.num--;
                    player.removeSkill('d2_ruohua3');
                },
            },
            "d2_tayin":{
                audio:"ext:Dota2:3",
                unique:true,
                enable:"phaseUse",
                usable:2,
                filter:function (event,player){
                    if(player.getStat('skill').d2_tayin&&!player.getEquip('d2_aghanims')) return false;
                    return true;
                },
                onremove:function (){
                    player.removeAdditionalSkill('d2_tayin');
                    player.unmarkSkill('d2_tayin');
                },
                filterTarget:function (card,player,target){
                    if (player==target) return false;
                    var names=[];
                    if(target.name&&!target.isUnseen(0)) names.add(target.name);
                    if(target.name1&&!target.isUnseen(0)) names.add(target.name1);
                    if(target.name2&&!target.isUnseen(1)) names.add(target.name2);
                    var pss=player.getSkills();
                    for(var i=0;i<names.length;i++){
                        var info=lib.character[names[i]];
                        if(info){
                            var skills=info[3];
                            for(var j=0;j<skills.length;j++){
                                if(lib.translate[skills[j]+'_info']&&lib.skill[skills[j]]&&
                                    !lib.skill[skills[j]].unique&&!pss.contains(skills[j])){
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                },
                createDialog:function (player,target,onlylist){
                    var names=[];
                    var list=[];
                    if(target.name&&!target.isUnseen(0)) names.add(target.name);
                    if(target.name1&&!target.isUnseen(0)) names.add(target.name1);
                    if(target.name2&&!target.isUnseen(1)) names.add(target.name2);
                    var pss=player.getSkills();
                    for(var i=0;i<names.length;i++){
                        var info=lib.character[names[i]];
                        if(info){
                            var skills=info[3];
                            for(var j=0;j<skills.length;j++){
                                if(lib.translate[skills[j]+'_info']&&lib.skill[skills[j]]&&
                                    !lib.skill[skills[j]].unique&&
                                    !pss.contains(skills[j])){
                                    list.push(skills[j]);
                                }
                            }
                        }
                    }
                    if (target.storage.d2_qihuan_skills) list=list.concat(target.storage.d2_qihuan_skills);
                    if(onlylist) return list;
                    var dialog=ui.create.dialog('forcebutton');
                    dialog.add('选择获得一项技能');
                    _status.event.list=list;
                    var clickItem=function(){
                        _status.event._result=this.link;
                        game.resume();
                    };
                    for(i=0;i<list.length;i++){
                        if(lib.translate[list[i]+'_info']){
                            var translation=get.translation(list[i]);
                            if(translation[0]=='新'&&translation.length==3){
                                translation=translation.slice(1,3);
                            }
                            else{
                                translation=translation.slice(0,2);
                            }
                            var item=dialog.add('<div class="popup pointerdiv" style="width:50%;display:inline-block"><div class="skill">【'+
                            translation+'】</div><div>'+lib.translate[list[i]+'_info']+'</div></div>');
                            item.firstChild.addEventListener('click',clickItem);
                            item.firstChild.link=list[i];
                        }
                    }
                    dialog.add(ui.create.div('.placeholder'));
                    return dialog;
                },
                check:function (card){
                    return 5-get.value(card);
                },
                content:function (){
                    "step 0"
                    // target.gain(cards,player);
                    event.skillai=function(list){
                        return get.max(list,get.skillRank,'item');
                    };
                    if(event.isMine()){
                        event.dialog=lib.skill.d2_tayin.createDialog(player,target);
                        event.switchToAuto=function(){
                            event._result=event.skillai(event.list);
                            game.resume();
                        };
                        _status.imchoosing=true;
                        game.pause();
                    }
                    else{
                        event._result=event.skillai(lib.skill.d2_tayin.createDialog(player,target,true));
                    }
                    "step 1"
                    _status.imchoosing=false;
                    if(event.dialog){
                        event.dialog.close();
                    }
                    var link=result;
                    player.removeAdditionalSkill('d2_tayin');
                    player.addAdditionalSkill('d2_tayin',link);
                    player.markSkillCharacter('d2_tayin',target,get.translation(link),lib.translate[link+'_info']);
                    player.storage.d2_tayin=target;
                    player.popup(link);
                    player.checkMarks();
                    game.log(player,'获得了技能','【'+get.translation(link)+'】');
                },
                ai:{
                    order:function (){
                        var player=_status.event.player;
                        if(player.getStat('skill').d2_tayin) return 1;
                        return 10;
                    },
                    result:{
                        player:1,
                    },
                },
                group:"d2_tayin2",
            },
            "d2_tayin2":{
                trigger:{
                    player:"phaseBegin",
                },
                popup:false,
                filter:function (event,player){
                    return player.storage.d2_tayin;
                },
                content:function (){
                    player.unmarkSkill('d2_tayin');
                    player.removeAdditionalSkill('d2_tayin');
                    delete player.storage.d2_tayin;
                },
                forced:true,
                popup:false,
            },
            "d2_andun":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                filterCard:function (card){
                    return get.color(card)=='black';
                },
                filter:function (event,player){
                    return player.countCards('h',{color:'black'});
                },
                check:function (card){
                    return 6-get.value(card);
                },
                filterTarget:true,
                selectTarget:1,
                selectCard:1,
                line:"thunder",
                content:function (){
                    'step 0'
                    if(target.hasSkill('d2_andun2')){
                        target.removeSkill('d2_andun2');
                        var current=target;
                        var name=target.storage.d2_andun2==player?'你':get.translation(target.storage.d2_andun2);
                        target.chooseTarget('你可以令'+name+'对你距离为1的一名角色造成1点伤害',function(card,player,target){
                            return player!=target&&get.distance(player,target)<=1;
                        }).ai=function(target){
                            return get.damageEffect(target,current,current);
                        };
                    } else {
                        target.addSkill('d2_andun2');
                        return;
                    }
                    'step 1'
                    if(result.bool){
                        var abaddon=target.storage.d2_andun2;
                        var target2=result.targets[0];
                        target.popup('d2_andun2');
                        abaddon.line(target2,'fire');
                        target2.damage(abaddon);
                    }
                    target.storage.d2_andun2=player;
                    target.addSkill('d2_andun2');
                },
                ai:{
                    order:5,
                    threaten:1.1,
                    expose:0.3,
                    result:{
                        player:function (player,target){
                            return 1;
                        },
                        target:function (player,target){
                            var current=target;
                            if(target.hasSkill('d2_andun2')){
                                var targets=game.filterPlayer(function(current){
                                    return get.distance(target,current)<=1&&target!=current&&get.attitude(current,target)<0;
                                });
                                if(targets.length<=0){
                                    return 0;
                                }else{
                                    return 2;
                                }
                            }
                            return 2;
                        },
                    },
                },
            },
            "d2_andun2":{
                trigger:{
                    player:"damageBegin",
                },
                forced:true,
                popup:false,
                priority:12,
                mark:true,
                marktext:"盾",
                intro:{
                    content:"抵挡1点伤害",
                },
                content:function (){
                    trigger.num--;
                },
                ai:{
                    threaten:0.8,
                },
                group:"d2_andun3",
            },
            "d2_andun3":{
                trigger:{
                    player:["damageEnd","damageZero"],
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                    return player.hasSkill('d2_andun2');
                },
                content:function (){
                    'step 0'
                    var name=player.storage.d2_andun2==player?'你':get.translation(player.storage.d2_andun2);
                    player.chooseTarget(1,'你可以令'+name+'对你距离为1的一名角色造成1点伤害',function(card,player,target){
                        return player!=target&&get.distance(player,target)<=1;
                    }).ai=function(target){
                        return get.damageEffect(target,player,player);
                    };
                    'step 1'
                    if(result.bool){
                        var abaddon=player.storage.d2_andun2;
                        var target=result.targets[0];
                        player.popup('d2_andun3');
                        abaddon.line(target,'thunder');
                        target.damage(abaddon);
                    }
                    player.removeSkill('d2_andun2');
                },
            },
            "d2_fanzhao":{
                audio:"ext:Dota2:2",
                unique:true,
                enable:"chooseToUse",
                round:5,
                filter:function (event,player){
                    if(event.type=='dying'){
                        if(player.hp!=0||player!=event.dying) return false;
                        return true;
                    }
                    else if(event.parent.name=='phaseUse'){
                        return true;
                    }
                    return false;
                },
                content:function (){
                    player.recover();
                    player.addTempSkill('d2_fanzhao2',{player:'phaseBegin'});
                    if(player.getEquip('d2_aghanims')){
                        player.addTempSkill('d2_chaofeng',{player:'phaseBegin'});
                    }
                },
                ai:{
                    order:1,
                    threaten:0.7,
                    save:true,
                    skillTagFilter:function (player){
                        if(player.storage.d2_fanzhao) return false;
                        if(player.hp>0) return false;
                    },
                    result:{
                        player:function (player){
                            if(player.hp==0) return 1;
                            if(player.hp<=1&&player.countCards('he')<=2) return 1;
                            if(player.hp<=1&&player.getEquip('d2_aghanims')) return 1;
                            return 0;
                        },
                    },
                    effect:{
                        target:function (card,player,target){
                            if(target.hp==1) return [1,-3];
                            return [1,1];
                        },
                    },
                },
                intro:{
                    content:"limited",
                },
                group:["d2_fanzhao_roundcount"],
            },
            "d2_fanzhao2":{
                trigger:{
                    player:["damageBefore","loseHpBefore"],
                },
                forced:true,
                mark:true,
                marktext:"返",
                intro:{
                    content:"减少体力改为回复等量体力",
                },
                content:function (){
                    player.recover(trigger.num);
                    trigger.cancel();
                    game.delay();
                },
                ai:{
                    threaten:0.1,
                    maixie:true,
                    nofire:true,
                    nothunder:true,
                    nodamage:true,
                    effect:{
                        target:function (card,player,target){
                            if(get.tag(card,'damage')||get.tag(card,'loseHp')){
                                if(target.maxHp-target.hp>0) return 2;
                                return 0.5;
                            }
                        },
                    },
                },
            },
            "d2_hunduan":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                round:2,
                filter:function (event,player){
                    return player.countCards('h');
                },
                filterTarget:function (card,player,target){
                    return player!=target&&Math.abs(player.hp-target.hp)==ui.selected.cards.length;
                },
                filterCard:function (card){
                    return true;
                },
                selectCard:[1,Infinity],
                check:function (card){
                    return 8-get.value(card);
                },
                content:function (){
                    var hp=target.hp;
                    target.hp=Math.min(player.hp,target.maxHp);
                    player.hp=Math.min(hp,player.maxHp);
                    player.update();
                    target.update();
                    game.log(player,'与',target,'的体力值交换了。');
                    if(player.getEquip('d2_aghanims')){
                        if(hp>target.hp){
                            target.chooseToDiscard('魂断弃牌',event.cards.length,'he',true);
                        } else {
                            target.draw(event.cards.length);
                        }
                    }
                },
                ai:{
                    order:13,
                    threaten:1.5,
                    expose:0.9,
                    result:{
                        target:function (player,target){
                            return (Math.min(player.hp,target.maxHp)-target.hp)*2;
                        },
                        player:function (player,target){
                            // if(player.hp==player.maxHp) return 0;
                            return (Math.min(target.hp,player.maxHp)-player.hp)*2-Math.abs(target.hp-player.hp);
                        },
                    },
                },
                group:["d2_hunduan_roundcount"],
            },
            "d2_daoying":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                group:"d2_daoying2",
                filter:function (event,player){
                    return game.hasPlayer(function(current){
                        return current.getEquip(1)&&current!=player;
                    });
                },
                filterTarget:function (card,player,target){
                    return player!=target&&target.getEquip(1);
                },
                intro:{
                    content:"card",
                },
                content:function (){
                    var card;
                    card=target.getEquip(1);
                    if(card){
                        player.markSkill('d2_daoying');
                        player.storage.d2_daoying=card;
                        player.updateMarks();
                        var info=get.info(card);
                        if(info.skills){
                            //player.addTempSkill(info.skills);
                            for(var i=0;i<info.skills.length;i++){
                                player.addTempSkill(info.skills[i]);
                            }
                        }
                    }
                },
                mod:{
                    attackFrom:function (from,to,distance){
                        if(from.storage.d2_daoying){
                            var info=get.info(from.storage.d2_daoying);
                            var attackRange=1;
                            if(info.distance) attackRange=-info.distance.attackFrom+1;
                            return distance-attackRange;
                        }
                    },
                },
                ai:{
                    order:10,
                    result:{
                        player:function (player,target){
                            return 1;
                        },
                    },
                    effect:{
                        target:function (card,player,target){
                            if(player==target&&get.subtype(card)=='equip1') return [1,-1];
                        },
                    },
                },
            },
            "d2_daoying2":{
                trigger:{
                    player:"phaseAfter",
                },
                forced:true,
                popup:false,
                content:function (){
                    player.unmarkSkill('d2_daoying');
                    delete player.storage.d2_daoying;
                },
            },
            "d2_mohua":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseBegin",
                },
                group:"d2_mohua2",
                forced:true,
                unique:true,
                init:function (player){
                    player.storage.d2_mohua=false;
                },
                intro:{
                    content:"limited",
                },
                filter:function (event,player){
                    return !player.storage.d2_mohua&&player.storage.d2_mohua2>=4;
                },
                skillAnimation:true,
                animationStr:"魔化",
                animationColor:"fire",
                content:function (){
                    'step 0'
                    player.loseMaxHp();
                    player.addSkill('d2_mohua3');
                    player.addSkill('d2_mohua4');
                    'step 1'
                    delete player.storage.d2_mohua2;
                    player.removeSkill('d2_mohua2');
                    player.storage.d2_mohua=true;
                    player.awakenSkill('d2_mohua');
                },
            },
            "d2_mohua2":{
                trigger:{
                    source:"damageAfter",
                },
                forced:true,
                mark:true,
                nopop:true,
                init:function (player){
                    player.markSkill('d2_mohua2');
                    player.storage.d2_mohua2=0;
                },
                intro:{
                    content:function (storage){
                        if(storage==0) return '未使用【杀】造成过伤害';
                        if(storage>=4) return '使用【杀】造成了'+storage+'次伤害，即将觉醒';
                        return '已使用【杀】造成'+storage+'次伤害';
                    },
                },
                filter:function (event){
                    return event.card&&event.card.name=='sha';
                },
                content:function (){
                    player.storage.d2_mohua2++;
                    player.updateMarks();
                },
            },
            "d2_mohua3":{
                mod:{
                    cardUsable:function (card,player,num){
                        if(card.name=='sha') return num+1;
                    },
                },
            },
            "d2_mohua4":{
                group:["d2_mohua4_sha","d2_mohua4_jiu"],
            },
            "d2_mohua4_sha":{
                enable:["chooseToRespond","chooseToUse"],
                filterCard:function (card,player){
                    return get.type(card)=='basic';
                },
                position:"he",
                viewAs:{
                    name:"sha",
                },
                viewAsFilter:function (player){
                    if(!player.countCards('he',{type:'basic'})) return false;
                },
                prompt:"将一张基本牌当杀使用或打出",
                check:function (card){return 4-get.value(card)},
                ai:{
                    skillTagFilter:function (player){
                        if(!player.countCards('he',{type:'basic'})) return false;
                    },
                    respondSha:true,
                    basic:{
                        useful:[5,1],
                        value:[5,1],
                    },
                    order:function (){
                        if(_status.event.player.hasSkillTag('presha',true,null,true)) return 10;
                        return 3;
                    },
                    result:{
                        target:function (player,target){
                            if(player.hasSkill('jiu')&&!target.getEquip('baiyin')){
                                if(get.attitude(player,target)>0){
                                    return -6;
                                }
                                else{
                                    return -3;
                                }
                            }
                            return -1.5;
                        },
                    },
                    tag:{
                        respond:1,
                        respondShan:1,
                        damage:function (card){
                            if(card.nature=='poison') return;
                            return 1;
                        },
                        natureDamage:function (card){
                            if(card.nature) return 1;
                        },
                        fireDamage:function (card,nature){
                            if(card.nature=='fire') return 1;
                        },
                        thunderDamage:function (card,nature){
                            if(card.nature=='thunder') return 1;
                        },
                        poisonDamage:function (card,nature){
                            if(card.nature=='poison') return 1;
                        },
                    },
                },
            },
            "d2_mohua4_jiu":{
                enable:["chooseToRespond","chooseToUse"],
                filterCard:function (card,player){
                    return get.type(card)=='basic';
                },
                position:"he",
                viewAs:{
                    name:"jiu",
                },
                viewAsFilter:function (player){
                    if(!player.countCards('he',{type:'basic'})) return false;
                },
                prompt:"将一张基本牌当酒使用或打出",
                check:function (card){return 4-get.value(card)},
                ai:{
                    skillTagFilter:function (player){
                        if(!player.countCards('he',{type:'basic'})) return false;
                    },
                    save:true,
                    basic:{
                        useful:function (card,i){
                            if(_status.event.player.hp>1){
                                if(i==0) return 4;
                                return 1;
                            }
                            if(i==0) return 7.3;
                            return 3;
                        },
                        value:function (card,player,i){
                            if(player.hp>1){
                                if(i==0) return 5;
                                return 1;
                            }
                            if(i==0) return 7.3;
                            return 3;
                        },
                    },
                    order:function (){
                        return get.order({name:'sha'})+0.2;
                    },
                    result:{
                        target:function (player,target){
                            if(target&&target.isDying()) return 2;
                            if(lib.config.mode=='stone'&&!player.isMin()){
                                if(player.getActCount()+1>=player.actcount) return 0;
                            }
                            var shas=player.getCards('h','sha');
                            if(shas.length>1&&player.getCardUsable('sha')>1){
                                return 0;
                            }
                            var card;
                            if(shas.length){
                                for(var i=0;i<shas.length;i++){
                                    if(lib.filter.filterCard(shas[i],target)){
                                        card=shas[i];break;
                                    }
                                }
                            }
                            else if(player.hasSha()&&player.needsToDiscard()){
                                if(player.countCards('h','hufu')!=1){
                                    card={name:'sha'};
                                }
                            }
                            if(card){
                                if(game.hasPlayer(function(current){
                                    return (get.attitude(target,current)<0&&
                                        target.canUse(card,current,true,true)&&
                                        !current.getEquip('baiyin')&&
                                        get.effect(current,card,target)>0);
                                })){
                                    return 1;
                                }
                            }
                            return 0;
                        },
                    },
                    tag:{
                        save:1,
                    },
                },
            },
            "d2_qihuan":{
                enable:"phaseUse",
                mark:true,
                usable:1,
                unique:true,
                init:function (player){
                    player.storage.d2_qihuan=[];
                    player.storage.d2_qihuan_skills=[];
                    player.storage.d2_qihuan_ai=[0,0,0];
                },
                onremove:function (player){
                    var list=player.storage.d2_qihuan_skills;
                    for (var i = 0; i < list.length; i++) {
                        player.removeSkill(list[i]);
                    }
                    delete player.storage.d2_qihuan;
                    delete player.storage.d2_qihuan_skills;
                },
                filter:function (event,player){
                    // return player.storage.d2_qihuan.length==3;
                    return true;
                },
                content:function (){
                    var skill=get.d2_qihuan_skill(player.storage.d2_qihuan);
                    if(skill=='none') {
                        game.playAudio("../extension/Dota2","d2_qihuan_fail"+[1,2].randomGet());
                        player.getStat('skill').d2_qihuan=0;
                        return;
                    }
                    player.popup(skill);
                    if (player.storage.d2_qihuan_skills.contains(skill)) {
                        game.playAudio("../extension/Dota2","d2_qihuan_fail"+[1,2].randomGet());
                        player.getStat('skill').d2_qihuan=0;
                        if(player.storage.d2_qihuan_skills[0]==skill) player.storage.d2_qihuan_skills.push(player.storage.d2_qihuan_skills.shift());
                    } else {
                        game.playAudio("../extension/Dota2","d2_qihuan"+[1,2].randomGet());
                        if(player.storage.d2_qihuan_skills.length>1) player.removeSkill(player.storage.d2_qihuan_skills.shift());
                        player.storage.d2_qihuan_skills.push(skill);
                        player.addSkill(skill);
                    }
                    // player.removeAdditionalSkill('d2_qihuan');
                    // player.addAdditionalSkill('d2_qihuan',player.storage.d2_qihuan_skills);
                },
                contentAfter:function (){
                    'step 0'
                    player.storage.d2_qihuan_ai=[0,0,0];
                    if(!player.getEquip('d2_aghanims')||!player.getStat('skill').d2_qihuan||player.storage.d2_qihuan.length<3) {event.finish();return;}
                    // game.playAudio("../extension/Dota2","d2_qihuan_scepter");
                    var list=[0,0,0];
                    var storage=player.storage.d2_qihuan;
                    for (var i = 0; i < storage.length; i++) {
                        switch(storage[i]){
                            case 'd2_qihuan_quas':list[0]++;break;
                            case 'd2_qihuan_wex':list[1]++;break;
                            case 'd2_qihuan_exort':list[2]++;break;
                        }
                    }
                    event.list=list;
                    if (list[0]) {
                        event.num=list[0];
                        player.chooseTarget('弃置一名角色'+list[0]+'张牌',function(card,player,target){
                            return target.countCards('he')>0;
                        }).ai=function(target){
                            return -get.attitude(player,target);
                        };
                    }
                    'step 1'
                    if (result.bool) {
                        player.discardPlayerCard(result.targets[0],'he','弃置'+event.num+'张牌',[1,event.num]);
                    }
                    var list=event.list;
                    if (list[1]) {
                        player.draw(2*list[1]);
                        player.chooseToDiscard(2*list[1],'弃置'+2*list[1]+'张牌','he',true);
                    }
                    if (list[2]) {
                        player.draw(list[2]);
                    }
                },
                intro:{
                    markcount:function (storage,player){
                        return 0;
                    },
                    content:function (storage,player){
                        var str='';
                        if(storage.length==0) return '无元素';
                        var str='当前元素：';
                        for (var i=0;i<storage.length;i++) {
                            str+=get.translation(storage[i]);
                        }
                        var list=player.storage.d2_qihuan_skills;
                        for (var i=0;i<list.length;i++) {
                            var elements=get.d2_qihuan_elements(list[i]);
                            var eStr='';
                            for(var j=0;j<elements.length;j++){
                                eStr+=get.translation(elements[j]);
                            }
                            str+='<br>【'+get.translation(list[i])+'（'+eStr+'）】：'+get.translation(list[i]+'_info');
                        }
                        return str;
                    },
                },
                group:["d2_qihuan_quas","d2_qihuan_wex","d2_qihuan_exort"],
                ai:{
                    threaten:1.6,
                    order:10,
                    result:{
                        player:function (player){
                            do{
                                player.storage.d2_qihuan_ai=[0,0,0];
                                if(player.hp<=2&&!player.storage.d2_youlingmanbu_roundcount||2-(game.roundNumber-player.storage.d2_youlingmanbu_roundcount)<=0) {
                                    player.storage.d2_qihuan_ai=[2,1,0];
                                    break;
                                }
                                if(player.storage.d2_chaozhenshengbo_roundcount==undefined||4-(game.roundNumber-player.storage.d2_chaozhenshengbo_roundcount)<=0) {
                                    player.storage.d2_qihuan_ai=[1,1,1];
                                    break;
                                }
                                var check=false;
                                var num=player.getEnemies().length;
                                if (num>1) {
                                    check=true;
                                } else {
                                    var target=player.getEnemies()[0];
                                    check=player.hp>1&&get.damageEffect(target,player,player,'fire');
                                }
                                if(check&&(player.storage.d2_yangyanchongji_roundcount==undefined||4-(game.roundNumber-player.storage.d2_yangyanchongji_roundcount)<=0)) {
                                    player.storage.d2_qihuan_ai=[0,0,3];
                                    break;
                                }
                                check=game.hasPlayer(function(current){
                                    return get.attitude(player,current)<=0&&current.isLinked();
                                });
                                if(check&&(player.storage.d2_hundunyunshi_roundcount==undefined||3-(game.roundNumber-player.storage.d2_hundunyunshi_roundcount)<=0)) {
                                    player.storage.d2_qihuan_ai=[0,1,2];
                                    break;
                                }
                                check=game.hasPlayer(function(current){
                                    return get.attitude(player,current)<=0&&!current.countCards('e')>1;
                                });
                                if(check&&(!player.storage.d2_qiangxijufeng_roundcount||3-(game.roundNumber-player.storage.d2_qiangxijufeng_roundcount)<=0)) {
                                    player.storage.d2_qihuan_ai=[1,2,0];
                                    break;
                                }
                                check=game.hasPlayer(function(current){
                                    return get.attitude(player,current)<=0&&!current.countCards('h')>2;
                                });
                                if(check&&(!player.storage.d2_diancimaichong_roundcount||3-(game.roundNumber-player.storage.d2_diancimaichong_roundcount)<=0)) {
                                    player.storage.d2_qihuan_ai=[0,3,0];
                                    break;
                                }
                                if(check&&(!player.storage.d2_jisulengque_roundcount||3-(game.roundNumber-player.storage.d2_jisulengque_roundcount)<=0)) {
                                    player.storage.d2_qihuan_ai=[3,0,0];
                                    break;
                                }
                                if(!player.storage.d2_ronglujingling_roundcount||3-(game.roundNumber-player.storage.d2_ronglujingling_roundcount)<=0) {
                                    player.storage.d2_qihuan_ai=[1,0,2];
                                    break;
                                }
                                if(!player.storage.d2_lingdongxunjie_roundcount||3-(game.roundNumber-player.storage.d2_lingdongxunjie_roundcount)<=0) {
                                    player.storage.d2_qihuan_ai=[0,2,1];
                                    break;
                                }
                                player.storage.d2_qihuan_ai=[2,0,1];
                            }while(false)
                            // game.log(player.storage.d2_qihuan_ai);
                            var skill=get.d2_qihuan_skill(player.storage.d2_qihuan);
                            // game.log(skill);
                            // game.log(player.storage.d2_qihuan_skills.contains(skill));
                            if(player.storage.d2_qihuan_skills.contains(skill)||player.storage.d2_qihuan.length<3) return 0;
                            return 1;
                        },
                    },
                },
            },
            "d2_qihuan_quas":{
                enable:"phaseUse",
                filter:function (event,player){
                    return !player.getStat('skill').d2_qihuan;
                },
                content:function (){
                    if (player.storage.d2_qihuan.length>=3) player.storage.d2_qihuan.shift();
                    player.storage.d2_qihuan.push('d2_qihuan_quas');
                    player.storage.d2_qihuan_ai[0]--;
                },
                mod:{
                    globalTo:function (from,to,distance){
                        var num=0;
                        if (to.storage.d2_qihuan) {
                            var list=to.storage.d2_qihuan;
                            for (var i = 0; i < list.length; i++) {
                                if(list[i]=='d2_qihuan_quas') num++;
                            }
                        }
                        return distance+num;
                    },
                },
                ai:{
                    order:11,
                    result:{
                        player:function (player){
                            return player.storage.d2_qihuan_ai[0];
                        },
                    },
                },
            },
            "d2_qihuan_wex":{
                enable:"phaseUse",
                filter:function (event,player){
                    return !player.getStat('skill').d2_qihuan;
                },
                check:function (event,player){
                    return player.storage.d2_qihuan_ai[1];
                },
                content:function (){
                    if (player.storage.d2_qihuan.length>=3) player.storage.d2_qihuan.shift();
                    player.storage.d2_qihuan.push('d2_qihuan_wex');
                    player.storage.d2_qihuan_ai[1]--;
                },
                mod:{
                    maxHandcard:function (player,num){
                        var num2=0;
                        if (player.storage.d2_qihuan) {
                            var list=player.storage.d2_qihuan;
                            for (var i = 0; i < list.length; i++) {
                                if(list[i]=='d2_qihuan_wex') num2++;
                            }
                        }
                        return num+num2;
                    },
                },
                ai:{
                    order:11,
                    result:{
                        player:function (player){
                            return player.storage.d2_qihuan_ai[1];
                        },
                    },
                },
            },
            "d2_qihuan_exort":{
                enable:"phaseUse",
                filter:function (event,player){
                    return !player.getStat('skill').d2_qihuan;
                },
                check:function (event,player){
                    return player.storage.d2_qihuan_ai[2];
                },
                content:function (){
                    if (player.storage.d2_qihuan.length>=3) player.storage.d2_qihuan.shift();
                    player.storage.d2_qihuan.push('d2_qihuan_exort');
                     player.storage.d2_qihuan_ai[2]--;
                },
                mod:{
                    globalFrom:function (from,to,distance){
                        var num=0;
                        if (from.storage.d2_qihuan) {
                            var list=from.storage.d2_qihuan;
                            for (var i = 0; i < list.length; i++) {
                                if(list[i]=='d2_qihuan_exort') num++;
                            }
                        }
                        return distance-num;
                    },
                },
                ai:{
                    order:11,
                    result:{
                        player:function (player){
                            return player.storage.d2_qihuan_ai[2];
                        },
                    },
                },
            },
            "d2_jisulengque":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                round:3,
                roundtext:"技能重置，元素组合：<font color='#4169E1'>冰</font><font color='#4169E1'>冰</font><font color='#4169E1'>冰</font>",
                filterTarget:function (card,player,target){
                    return target.countCards('h')>0;
                },
                content:function (){
                    var cards=target.getCards('h');
                    if(target.storage.d2_jisulengque2){
                        target.storage.d2_jisulengque2=target.storage.d2_jisulengque2.concat(cards);
                    }
                    else{
                        target.storage.d2_jisulengque2=cards;
                    }
                    game.addVideo('storage',target,['cards',get.cardsInfo(target.storage.d2_jisulengque2),'cards']);
                    target.addSkill('d2_jisulengque2');
                    target.lose(cards,ui.special);
                },
                ai:{
                    order:10,
                    result:{
                        player:1,
                        target:function (player,target){
                            if(target.hasSkillTag('noh')) return 3;
                            var num=-Math.sqrt(target.countCards('h'));
                            if(player.hasSha()&&player.canUse('sha',target)){
                                num-=2;
                            }
                            return num;
                        },
                    },
                },
                group:["d2_jisulengque_roundcount"],
            },
            "d2_jisulengque2":{
                trigger:{
                    player:"damageAfter",
                },
                forced:true,
                mark:true,
                marktext:"冷",
                intro:{
                    content:"cardCount",
                },
                content:function (){
                    if(player.storage.d2_jisulengque2){
                        player.gain(player.storage.d2_jisulengque2);
                        delete player.storage.d2_jisulengque2;
                    }
                    player.removeSkill('d2_jisulengque2');
                },
                group:"d2_jisulengque3",
            },
            "d2_jisulengque3":{
                trigger:{
                    player:"dieBegin",
                },
                forced:true,
                popup:false,
                content:function (){
                    player.$throw(player.storage.d2_jisulengque2,1000);
                    for(var i=0;i<player.storage.d2_jisulengque2.length;i++){
                        ui.discardPile.appendChild(player.storage.d2_jisulengque2[i]);
                    }
                    game.log(player,'弃置了',player.storage.d2_jisulengque2);
                    delete player.storage.d2_jisulengque2;
                    player.removeSkill('d2_jisulengque2');
                },
            },
            "d2_youlingmanbu":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                round:2,
                roundtext:"技能重置，元素组合：<font color='#4169E1'>冰</font><font color='#4169E1'>冰</font><font color='#BF3EFF'>雷</font>",
                content:function (){
                    player.addTempSkill('qianxing',{player:'phaseBefore'});
                },
                ai:{
                    order:1,
                    result:{
                        player:1,
                    },
                },
                group:["d2_youlingmanbu_roundcount"],
            },
            "d2_qiangxijufeng":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                round:3,
                roundtext:"技能重置，元素组合：<font color='#4169E1'>冰</font><font color='#BF3EFF'>雷</font><font color='#BF3EFF'>雷</font>",
                filterTarget:function (card,player,target){
                    return target.countCards('e')>0;
                },
                content:function (){
                    'step 0'
                    var cards=target.getCards('e');
                    event.cards=cards;
                    target.discard(cards);
                    'step 1'
                    var num=Math.floor(event.cards.length/2);
                    if(num>0) player.draw(num);
                },
                ai:{
                    order:10,
                    result:{
                        target:function (player,target){
                            return -target.countCards('e');
                        },
                    },
                },
                group:["d2_qiangxijufeng_roundcount"],
            },
            "d2_diancimaichong":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                round:3,
                roundtext:"技能重置，元素组合：<font color='#BF3EFF'>雷</font><font color='#BF3EFF'>雷</font><font color='#BF3EFF'>雷</font>",
                filterTarget:function (card,player,target){
                    return target.countCards('h')>0&&player!=target;
                },
                content:function (){
                    'step 0'
                    if(target.countCards('h')>=3){
                        target.chooseToDiscard('电磁脉冲：弃1张牌并令'+get.translation(player)+'摸2张牌；或取消并弃3张牌','h').set('ai',function(card){
                            if(target.countCards('h')>3) return 0;
                            return 20-get.value(card);
                        });
                    } else {
                        target.chooseToDiscard('电磁脉冲：弃1张牌并令'+get.translation(player)+'摸2张牌','h',true);
                    }
                    'step 1'
                    if(result.bool){
                        player.draw(2);
                    } else {
                        target.chooseToDiscard(3,'电磁脉冲：弃3张牌','h',true);
                    }
                },
                ai:{
                    order:10,
                    result:{
                        target:function (player,target){
                            if(target.countCards('h')<3) return -2;
                            return -1;
                        },
                    },
                },
                group:["d2_diancimaichong_roundcount"],
            },
            "d2_lingdongxunjie":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                round:3,
                roundtext:"技能重置，元素组合：<font color='#BF3EFF'>雷</font><font color='#BF3EFF'>雷</font><font color='#FFD700'>火</font>",
                filterTarget:function (card,player,target){
                    return !target.hasSkill('d2_lingdongxunjie2');
                },
                content:function (){
                    'step 0'
                    var list=[];
                    for(var i=0;i<lib.inpile.length;i++){
                        if(lib.card[lib.inpile[i]].subtype=='equip1'){
                            list.push(lib.inpile[i]);
                        }
                    }
                    if(!list.length){
                        event.finish();
                        return;
                    }
                    event.card=game.createCard(list.randomGet());
                    target.$draw(event.card);
                    game.delay();
                    'step 1'
                    target.equip(event.card);
                    target.draw();
                    target.addSkill('d2_lingdongxunjie2');
                },
                ai:{
                    order:10,
                    result:{
                        player:1,
                        target:function (player,target){
                            if(target.getEquip(1)) return 1;
                            return 2;
                        },
                    },
                },
                group:["d2_lingdongxunjie_roundcount"],
            },
            "d2_lingdongxunjie2":{
                trigger:{
                    player:"useCardAfter",
                },
                forced:true,
                popup:false,
                mark:true,
                intro:{
                    content:"下一张使用的【杀】额外结算一次",
                },
                filter:function (event,player){
                    if(event.parent.name=='d2_lingdongxunjie2') return false;
                    if(!event.targets||!event.card) return false;
                    if(get.info(event.card).complexTarget) return false;
                    if(!lib.filter.cardEnabled(event.card,player,event.parent)) return false;
                    if(event.card.name!='sha') return false;
                    var card=game.createCard(event.card.name,event.card.suit,event.card.number,event.card.nature);
                    var targets=event._targets||event.targets;
                    for(var i=0;i<targets.length;i++){
                        if(!targets[i].isIn()) return false;
                        if(!player.canUse({name:event.card.name},targets[i],false,false)){
                            return false;
                        }
                    }
                    return true;
                },
                content:function (){
                    var card=game.createCard(trigger.card.name,trigger.card.suit,trigger.card.number,trigger.card.nature);
                    player.useCard(card,(trigger._targets||trigger.targets).slice(0));
                    player.removeSkill('d2_lingdongxunjie2');
                },
            },
            "d2_hundunyunshi":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                round:3,
                roundtext:"技能重置，元素组合：<font color='#BF3EFF'>雷</font><font color='#FFD700'>火</font><font color='#FFD700'>火</font>",
                filterTarget:function (card,player,target){
                    return !target.hasSkill('d2_hundunyunshi2');
                },
                content:function (){
                    target.addSkill('d2_hundunyunshi2');
                },
                ai:{
                    order:10,
                    result:{
                        player:1,
                        target:function (player,target){
                            if(target.hasSkillTag('nofire')) return 0;
                            if(target.isLinked()) return -2;
                            return -1;
                        },
                    },
                },
                group:["d2_hundunyunshi_roundcount"],
            },
            "d2_hundunyunshi2":{
                trigger:{
                    player:"damageBegin",
                },
                forced:true,
                popup:false,
                mark:true,
                intro:{
                    content:"下一次即将受到伤害时，被横置（已横置则弃一张牌）且该伤害变为火属性（已为火属性则伤害+1）",
                },
                content:function (){
                    if(player.isLinked()){
                        player.discardPlayerCard(player,'he','混沌陨石：已横置，弃一张牌',1,true);
                    } else {
                        player.link();
                    }
                    if(trigger.nature=='fire'){
                        trigger.num++;
                    } else {
                        trigger.nature='fire';
                    }
                    player.removeSkill('d2_hundunyunshi2');
                },
            },
            "d2_yangyanchongji":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                round:4,
                roundtext:"技能重置，元素组合：<font color='#FFD700'>火</font><font color='#FFD700'>火</font><font color='#FFD700'>火</font>",
                content:function (){
                    var list=player.getEnemies();
                    var targets=list.randomGets([1,2].randomGet());
                    if(targets.length==1){
                        targets[0].damage('fire',2);
                        targets[0].addExpose(0.2);
                        player.line(targets[0],'fire');
                        player.loseHp();
                    }
                    else if(targets.length==2){
                        targets[0].damage('fire');
                        targets[0].addExpose(0.2);
                        player.line(targets[0],'fire');
                        targets[1].damage('fire');
                        targets[1].addExpose(0.2);
                        player.line(targets[1],'fire');
                    }
                },
                ai:{
                    order:12,
                    result:{
                        player:function (player,target){
                            var list=player.getEnemies();
                            if(player.hp<2&&list.length==1) return 0;
                            return 1;
                        },
                    },
                },
                group:["d2_yangyanchongji_roundcount"],
            },
            "d2_ronglujingling":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                round:3,
                roundtext:"技能重置，元素组合：<font color='#4169E1'>冰</font><font color='#FFD700'>火</font><font color='#FFD700'>火</font>",
                content:function (){
                    var cards=[];
                    for(var i=0;i<2;i++){
                        cards.push(game.createCard('d2_forgedSpirit'));
                    }
                    player.gain(cards,'gain2');
                },
                ai:{
                    order:12,
                    result:{
                        player:1,
                    },
                },
                group:["d2_ronglujingling_roundcount"],
            },
            "d2_hanbingzhiqiang":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                round:3,
                roundtext:"技能重置，元素组合：<font color='#4169E1'>冰</font><font color='#4169E1'>冰</font><font color='#FFD700'>火</font>",
                filterTarget:function (card,player,target){
                    return !target.hasSkill('d2_hanbingzhiqiang2');
                },
                selectTarget:1,
                content:function (){
                    player.discardPlayerCard(target,'he',get.prompt('d2_hanbingzhiqiang'),1,true);
                    target.addTempSkill('d2_hanbingzhiqiang2',{player:'phaseAfter'});
                },
                ai:{
                    order:10,
                    result:{
                        player:1,
                        target:-2,
                    },
                },
                group:["d2_hanbingzhiqiang_roundcount"],
            },
            "d2_hanbingzhiqiang2":{
                trigger:{
                    player:"phaseDrawBefore",
                },
                forced:true,
                popup:false,
                mark:true,
                intro:{
                    content:"进攻距离-2，摸牌阶段少摸一张牌",
                },
                content:function (){
                    trigger.num--;
                },
                mod:{
                    globalFrom:function (from,to,distance){
                        return distance+2;
                    },
                },
            },
            "d2_chaozhenshengbo":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                round:4,
                roundtext:"技能重置，元素组合：<font color='#4169E1'>冰</font><font color='#BF3EFF'>雷</font><font color='#FFD700'>火</font>",
                content:function (){
                    'step 0'
                    var list=player.getEnemies();
                    player.line(list,'thunder');
                    for(var i=0;i<list.length;i++){
                        list[i].addTempSkill('d2_chaozhenshengbo2',{player:'phaseAfter'});
                    }
                    game.delay();
                    var num=Math.floor(Math.random()*list.length)+1;
                    if(num>3) num=3;
                    var list2=list.randomGets(num);
                    player.line(list2,'thunder');
                    switch(num) {
                        case 1:
                            event.debuff=[list2[0],list2[0],list2[0]];
                            break;
                        case 2:
                            event.debuff=[list2[0],list2[0],list2[1]];
                            break;
                        case 3:
                            event.debuff=[list2[0],list2[1],list2[2]];
                            break;
                    }
                    'step 1'
                    if(event.debuff&&event.debuff.length){
                        player.line(event.debuff.shift().getDebuff(false).addExpose(0.1),'green');
                        event.redo();
                    }
                    'step 2'
                    game.delay();
                },
                ai:{
                    order:10,
                    result:{
                        player:1,
                    },
                },
                group:["d2_chaozhenshengbo_roundcount"],
            },
            "d2_chaozhenshengbo2":{
                forced:true,
                popup:false,
                mark:true,
                intro:{
                    content:"不能使用【杀】",
                },
                mod:{
                    cardEnabled:function (card,player){
                        if(card.name=='sha') return false;
                    },
                    cardUsable:function (card,player){
                        if(card.name=='sha') return false;
                    },
                },
            },
            "d2_polong":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                viewAs:{
                    name:"chiyuxi",
                },
                filter:function (event,player){
                    if(!lib.card.chiyuxi) return false;
                    return player.countCards('h',{color:'red'})>0;
                },
                filterCard:function (card,player){
                    return get.color(card)=='red';
                },
                filterTarget:function (card,player,target){
                    return player.canUse('chiyuxi',target);
                },
                check:function (card){
                    return 6-get.value(card);
                },
                ai:{
                    order:9.1,
                    wuxie:function (target,card,player,viewer){
                        if(get.attitude(viewer,target)>0&&target.countCards('h','shan')){
                            if(!target.countCards('h')||target.hp==1||Math.random()<0.7) return 0;
                        }
                    },
                    basic:{
                        order:9,
                        useful:1,
                        value:5,
                    },
                    result:{
                        target:function (player,target){
                            if(target.hasSkillTag('nofire')) return 0;
                            if(player.hasUnknown(2)) return 0;
                            var nh=target.countCards('h');
                            if(lib.config.mode=='identity'){
                                if(target.isZhu&&nh<=2&&target.hp<=1) return -100;
                            }
                            if(nh==0) return -2;
                            if(nh==1) return -1.7
                            return -1.5;
                        },
                    },
                    tag:{
                        respond:1,
                        respondShan:1,
                        damage:1,
                        natureDamage:1,
                        fireDamage:1,
                        multitarget:1,
                        multineg:1,
                    },
                },
            },
            "d2_chihun":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"useCard",
                },
                direct:true,
                filter:function (event,player){
                    var type=get.type(event.card,'trick');
                    return !player.hasSkill('d2_chihun2')&&type=='trick'&&game.hasPlayer(function(current){
                        return player.canUse('sha',current,false);
                    });
                },
                content:function (){
                    "step 0"
                    player.chooseTarget(get.prompt('d2_chihun'),function(card,player,target){
                        return player.canUse('sha',target,false);
                    }).ai=function(target){
                        return get.effect(target,{name:'sha',nature:'fire'},player,player);
                    }
                    "step 1"
                    if(result.bool){
                        player.logSkill('d2_chihun');
                        if(!event.isMine()){
                            game.delay();
                        }
                        player.useCard({name:'sha',nature:'fire'},result.targets,false);
                        player.addTempSkill('d2_chihun2');
                    }
                },
                ai:{
                    expose:0.2,
                    threaten:1.5,
                    noautowuxie:true,
                },
            },
            "d2_chihun2":{
            },
            "d2_mieshen":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                animationStr:"神灭斩",
                skillAnimation:"legend",
                animationColor:"fire",
                line:"fire",
                mark:true,
                unique:true,
                intro:{
                    content:"limited",
                },
                init:function (player){
                    player.storage.d2_mieshen=false;
                },
                filter:function (event,player){
                    return !player.storage.d2_mieshen&&player.countCards('h',{color:'red'})>1;
                },
                filterTarget:true,
                selectCard:2,
                filterCard:function (card){
                    return get.color(card)=='red';
                },
                content:function (){
                    if(player.getEquip('d2_aghanims')){
                        target.changeHujia(-target.hujia);
                        target.damage(player,3,'fire');
                    } else {
                        target.damage(player,2,'fire');
                    }
                    player.storage.d2_mieshen=true;
                    player.awakenSkill('d2_mieshen');
                },
                ai:{
                    order:1,
                    result:{
                        target:function (player,target){
                            var num=2;
                            if(player.getEquip('d2_aghanims')) num=3;
                            if(target.hp>num+1) return 0;
                            var eff=get.damageEffect(target,player,target,'fire');
                            if(target.hp>num) return eff/10;
                            return eff/Math.sqrt(target.hp);
                        },
                    },
                },
            },
            "d2_binghuo_huo":{
                audio:"ext:Dota2:2",
                unique:true,
                link:true,
                linkCharacters:["d2_lina","d2_crystalMaiden"],
                skillAnimation:true,
                animationStr:"冰火之歌",
                trigger:{
                    player:"phaseBegin",
                },
                forced:true,
                init:function (player){
                    player.storage.d2_binghuo_huo=false;
                },
                filter:function (event,player){
                    return !player.storage.d2_binghuo_huo&&game.linkFilter(player,'d2_binghuo_huo');
                },
                content:function (){
                    player.storage.d2_binghuo_huo=true;
                    var cm=game.filterPlayer(function(current){
                        return current.name=='d2_crystalMaiden';
                    });
                    player.line(cm);
                    for (var i = 0; i < cm.length; i++) {
                        cm[i].damage('fire');
                    }
                    player.awakenSkill('d2_binghuo_huo');
                },
            },
            "d2_minghuo":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:3,
                filter:function (event,player){
                    var list=[];
                    for(var i=0;i<ui.discardPile.childElementCount;i++){
                        var card=ui.discardPile.childNodes[i];
                        if(get.tag(card,'fireDamage')) list.push(card);
                    }
                    if(list.length==0) return false;
                    var num=player.maxHp-player.hp;
                    if(num<1) num=1;
                    return player.storage.d2_minghuo<num;
                },
                init:function (player){
                    player.storage.d2_minghuo=0;
                },
                content:function (){
                    var list=[];
                    for(var i=0;i<ui.discardPile.childElementCount;i++){
                        var card=ui.discardPile.childNodes[i];
                        if(get.tag(card,'fireDamage')) list.push(card);
                    }
                    var card=list.randomGet();
                    if(card) player.gain(card,'gain2','log');
                    player.storage.d2_minghuo++;
                },
                ai:{
                    order:9,
                    result:{
                        player:1,
                    },
                },
                group:"d2_minghuo2",
            },
            "d2_minghuo2":{
                trigger:{
                    player:"phaseBefore",
                },
                forced:true,
                popup:false,
                content:function (){
                    player.storage.d2_minghuo=0;
                },
            },
            "d2_chongsheng":{
                audio:"ext:Dota2:2",
                unique:true,
                trigger:{
                    player:"dieBefore",
                },
                round:5,
                forced:true,
                priority:15,
                content:function (){
                    trigger.cancel();
                    if (player.maxHp<=0) player.maxHp=1;
                    player.hp=player.maxHp;
                    player.discard(player.getCards('j'));
                    var num=player.getCards('h').length;
                    switch(num){
                        case 0: player.draw(2);break;
                        case 1: player.draw();break;
                        default:
                    }
                    player.update();
                    'step 1'
                    player.link(false);
                    'step 2'
                    player.turnOver(false);
                },
                ai:{
                    threaten:function (player,target){
                        if(5-(game.roundNumber-target.storage.d2_chongsheng_roundcount)>0) return 0.5;
                        return 1.5;
                    },
                },
                group:["d2_chongsheng_roundcount"],
            },
            "d2_xuming":{
                audio:"ext:Dota2:2",
                trigger:{
                    global:"dieBefore",
                },
                filter:function (event,player){
                    return player.getEquip('d2_aghanims')&&!event.player.hasSkill('d2_xuming4');
                },
                check:function (event,player){
                    return get.attitude(player,event.player)>0;
                },
                unique:true,
                content:function (){
                    player.line(trigger.target,'green');
                    trigger.cancel();
                    trigger.player.hp=1;
                    trigger.player.update();
                    trigger.player.addSkill('d2_xuming2');
                },
            },
            "d2_xuming2":{
                trigger:{
                    player:["damageBegin","loseHpBegin","recoverBegin"],
                },
                forced:true,
                priority:-55,
                mark:true,
                filter:function (event,player){
                    return true;
                },
                content:function (){
                    trigger.num=player.hp-1;
                },
                intro:{
                    content:"体力值不会变化，回合结束时立即死亡",
                },
                ai:{
                    effect:{
                        target:function (card,player,target){
                            if(get.tag(card,'damage')||get.tag(card,'loseHp')||get.tag(card,'recover')){
                                return 0;
                            }
                        },
                    },
                },
                group:"d2_xuming3",
            },
            "d2_xuming3":{
                trigger:{
                    player:"phaseAfter",
                },
                forced:true,
                mark:true,
                filter:function (event,player){
                    return true;
                },
                content:function (){
                    player.removeSkill('d2_xuming2');
                    player.addSkill('d2_xuming4');
                    player.die();
                },
            },
            "d2_xuming4":{
                mark:true,
                locked:true,
                intro:{
                    content:"不能被续命",
                },
            },
            "d2_bingjian":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"shaBegin",
                },
                priority:10,
                logTarget:"target",
                filter:function (event,player){
                    return event.target.countCards('he')>0;
                },
                content:function (){
                    trigger.target.randomDiscard();
                    // player.discardPlayerCard(trigger.target,get.prompt('d2_bingjian',trigger.target));
                },
                ai:{
                    threaten:1.2,
                    expose:0.2,
                    result:{
                        target:-1,
                    },
                },
            },
            "d2_kuangfeng":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                position:"he",
                filter:function (event,player){
                    return player.countCards('he')>0;
                },
                filterCard:true,
                check:function (card){
                    return 6-get.value(card);
                },
                content:function (){
                    player.addTempSkill('d2_kuangfeng2',{player:'phaseBegin'});
                },
                ai:{
                    order:1,
                    result:{
                        player:1,
                    },
                },
            },
            "d2_kuangfeng2":{
                popup:false,
                mark:true,
                marktext:"风",
                intro:{
                    content:"防御距离+1",
                },
                mod:{
                    globalTo:function (from,to,distance){
                        return distance+1;
                    },
                },
            },
            "d2_zhuoyue":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseUseBegin",
                },
                forced:true,
                mark:true,
                intro:{
                    content:"卓越生效",
                },
                init:function (player){
                    player.storage.d2_zhuoyue=true;
                },
                filter:function (event,player){
                    return player.storage.d2_zhuoyue;
                },
                content:function (){
                    if(player.storage.d2_zhuoyue) {
                        player.addTempSkill('d2_zhuoyue2');
                    }
                },
                ai:{
                    threaten:1.3,
                    effect:{
                        target:function (card,player,target){
                            if (target.storage.d2_zhuoyue&&get.distance(player,target)<=1&&target!=player) return [1,-1.5];
                        },
                    },
                },
                group:["d2_zhuoyue3","d2_zhuoyue4"],
            },
            "d2_zhuoyue2":{
                popup:false,
                mod:{
                    cardUsable:function (card,player,num){
                        if(card.name=='sha') return num+1;
                    },
                    maxHandcard:function (player,num){
                        return num+1;
                    },
                    selectTarget:function (card,player,range){
                        if(player.getEquip('d2_aghanims')&&card.name=='sha'&&range[1]!=-1) range[1]++;
                    },
                },
            },
            "d2_zhuoyue3":{
                trigger:{
                    target:"useCardToBefore",
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                    return player.storage.d2_zhuoyue&&event.player!=player&&get.distance(event.player,player)<=1&&event.targets.length==1;
                },
                content:function (){
                    game.playAudio("../extension/Dota2","d2_zhuoyue4"+[1,2].randomGet());
                    player.storage.d2_zhuoyue=false;
                    player.unmarkSkill('d2_zhuoyue');
                },
            },
            "d2_zhuoyue4":{
                trigger:{
                    player:"phaseAfter",
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                    return !player.storage.d2_zhuoyue;
                },
                content:function (){
                    player.storage.d2_zhuoyue=true;
                    player.markSkill('d2_zhuoyue');
                },
            },
            "d2_diyan":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                filter:function (event,player){
                    return player.countCards('h')>1;
                },
                filterTarget:true,
                selectCard:2,
                filterCard:true,
                check:function (card){
                    var player=_status.event.player;
                    var check1=game.hasPlayer(function(current){
                        return current.hp<=1&&get.attitude(player.current)>0&&get.recoverEffect(current,player,current);
                    });
                    var check2=game.hasPlayer(function(current){
                        return current.hp<=1&&get.attitude(player.current)<0&&get.damageEffect(current,player,current);
                    });
                    var check3=game.hasPlayer(function(current){
                        return current.isDamaged()&&get.attitude(player.current)>0;
                    });
                    if(ui.selected.cards.length){
                        var selectedCard=ui.selected.cards[0];
                        if (player.getEquip('d2_aghanims')) {
                            if (get.color(selectedCard)==get.color(card)) return 10;
                            return 5-get.value(card);
                        } else {
                            if (get.suit(selectedCard)==get.suit(card)) return 10;
                            return 5-get.value(card);
                        }
                    } else {
                        if (check1&&get.color(card)=='red') return 10;
                        if ((check2||check3)&&get.color(card)=='black') return 10;
                        return 10-get.value(card);
                    }
                },
                content:function (){
                    var num=3;
                    var cards=event.cards;
                    var suit1=get.suit(cards[0]);
                    var suit2=get.suit(cards[1]);
                    var color1=get.color(cards[0]);
                    var color2=get.color(cards[1]);
                    if(player.getEquip('d2_aghanims')){
                        if(color1==color2){
                            if(color1=='black') {
                                num&=1;
                            }else{
                                num&=2;
                            }
                        }
                    }else{
                        if(suit1==suit2){
                            if(suit1=='spade'||suit1=='club') {
                                num&=1;
                            }else{
                                num&=2;
                            }
                        }
                    }
                    if((num&1)==1) target.damage('fire',player);
                    if((num&2)==2) {
                        if(target.hasSkill('d2_diyan2')){
                            target.storage.d2_diyan2+=2;
                            target.updateMarks();
                        } else {
                            target.addSkill('d2_diyan2');
                        }
                    }
                },
                ai:{
                    order:8,
                    expose:0.1,
                    result:{
                        target:function (player,target){
                            var cards=ui.selected.cards;
                            var suit1=get.suit(cards[0]);
                            var suit2=get.suit(cards[1]);
                            var color1=get.color(cards[0]);
                            var color2=get.color(cards[1]);
                            if(player.getEquip('d2_aghanims')){
                                if(color1==color2){
                                    if(color1=='black') {
                                        return get.damageEffect(target,player,target,'fire');
                                    }else{
                                        return get.recoverEffect(target,player,target);
                                    }
                                }
                            } else {
                                if(suit1==suit2){
                                    if(suit1=='spade'||suit1=='club') {
                                        return get.damageEffect(target,player,target,'fire');
                                    }else{
                                        return get.recoverEffect(target,player,target);
                                    }
                                }
                            }
                            if(target.hp<=1) return get.damageEffect(target,player,target,'fire');
                            if(target.hasSkillTag('maixie_hp')) return 3;
                            return 2;
                        },
                    },
                },
            },
            "d2_diyan2":{
                trigger:{
                    global:"phaseEnd",
                },
                forced:true,
                popup:false,
                mark:true,
                intro:{
                    content:"一名角色的回合结束阶段回复一点体力，剩余#回合",
                },
                init:function (player){
                    player.storage.d2_diyan2=2;
                },
                content:function (){
                    player.recover();
                    player.storage.d2_diyan2--;
                    if(player.storage.d2_diyan2<=0) player.removeSkill('d2_diyan2');
                    player.updateMarks();
                },
            },
            "d2_xunuo":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                round:3,
                selectTarget:1,
                filterTarget:function (card,player,target){
                    return !target.hasSkill('d2_xunuo2');
                },
                content:function (){
                    target.storage.d2_xunuo2=player;
                    target.addSkill(['d2_xunuo2','d2_xunuo3']);
                },
                ai:{
                    order:10,
                    threaten:1.5,
                    expose:0.5,
                    result:{
                        target:function (player,target){
                            if(!target.isDamaged()) return 0;
                            if(target.hp==1) return 1;
                            return 0;
                        },
                    },
                },
                group:["d2_xunuo_roundcount"],
            },
            "d2_xunuo2":{
                trigger:{
                    player:["damageBefore","recoverBefore","loseHpBefore"],
                },
                forced:true,
                mark:true,
                intro:{
                    markcount:function (storage,player){
                        var damage=player.storage.d2_xunuo2_damage;
                        var recover=player.storage.d2_xunuo2_recover;
                        return recover*2-damage;
                    },
                    content:function (storage,player){
                        var damage=player.storage.d2_xunuo2_damage;
                        var recover=player.storage.d2_xunuo2_recover;
                        return '在'+get.translation(storage)+'的准备阶段时受到'+player.storage.d2_xunuo2_damage+'点伤害，回复'+player.storage.d2_xunuo2_recover+'*2点体力，总和：'+(recover*2-damage);
                    },
                },
                init:function (player){
                    player.storage.d2_xunuo2_damage=0;
                    player.storage.d2_xunuo2_recover=0;
                },
                onremove:function (player){
                    delete player.storage.d2_xunuo2;
                    delete player.storage.d2_xunuo2_damage;
                    delete player.storage.d2_xunuo2_recover;
                },
                content:function (){
                    trigger.cancel();
                    if(trigger.name=='damage'||trigger.name=='loseHp') player.storage.d2_xunuo2_damage+=trigger.num;
                    if(trigger.name=='recover') player.storage.d2_xunuo2_recover+=trigger.num;
                    player.markSkill('d2_xunuo2');
                },
            },
            "d2_xunuo3":{
                trigger:{
                    global:["phaseBegin","dieBegin"],
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                    return event.player==player.storage.d2_xunuo2;
                },
                content:function (){
                    var num=player.storage.d2_xunuo2_recover*2-player.storage.d2_xunuo2_damage;
                    if(num>=0) {
                        player.recover(num);
                        game.playAudio("../extension/Dota2","d2_xunuo31");
                    }
                    if(num<0) {
                        player.damage(-num,player.storage.d2_xunuo2);
                        game.playAudio("../extension/Dota2","d2_xunuo32");
                    }
                    player.removeSkill(['d2_xunuo2','d2_xunuo3']);
                },
            },
            "d2_juji":{
                audio:"ext:Dota2:2",
                trigger:{
                    source:"damageEnd",
                },
                filter:function (event,player){
                    var check=Math.floor(Math.random()*5);
                    return check<2&&event.card&&event.card.name=='sha'&&event.player.isAlive()&&event.player.countCards('he');
                },
                forced:true,
                content:function (){
                    player.line(trigger.player,'thunder');
                    trigger.player.randomDiscard();
                },
                mod:{
                    globalTo:function (from,to,distance){
                        return distance+1;
                    },
                    attackFrom:function (from,to,distance){
                        return distance-2;
                    },
                },
                ai:{
                    threaten:1.6,
                },
            },
            "d2_xiandan":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                complexCard:true,
                multitarget:true,
                multiline:true,
                discard:false,
                prepare:"throw",
                selectTarget:function (){
                    return [1,ui.selected.cards.length];
                },
                filter:function (event,player){
                    return player.countCards('h','sha')&&player.countCards('he')>1&&lib.filter.filterCard({name:'sha'},player)&&game.hasPlayer(function(current){
                        return player.canUse('sha',current);
                    });
                },
                filterTarget:function (card,player,target){
                    return lib.filter.filterTarget({name:'sha'},player,target);
                },
                selectCard:[2,Infinity],
                filterCard:function (card){
                    if (ui.selected.cards.length) return true;
                    return card.name=='sha';
                },
                position:"he",
                check:function (card){
                    var player=_status.event.player;
                    if(ui.selected.cards.length>=player.getEnemies().length) return 0;
                    if(player.countCards('h')<4) return 5-get.value(card);
                    return 6-get.value(card);
                },
                content:function (){
                    targets.sort(lib.sort.seat);
                    player.useCard({name:'sha'},cards,targets,'d2_xiandan').animate=false;
                },
                ai:{
                    order:function (){
                        return get.order({name:'sha'})+0.1;
                    },
                    result:{
                        target:function (player,target){
                            return get.effect(target,{name:'sha'},player,target);
                        },
                    },
                },
                group:"d2_xiandan2",
            },
            "d2_xiandan2":{
                trigger:{
                    player:"shaBegin",
                },
                filter:function (event){
                    return event.skill=='d2_xiandan';
                },
                forced:true,
                popup:false,
                content:function (){
                    "step 0"
                    event.num=trigger.cards.length-1;
                    "step 1"
                    if (event.num) {
                        var next=trigger.target.chooseToRespond({name:'shan'},'请打出一张闪响应霰弹');
                        next.autochoose=lib.filter.autoRespondShan;
                        next.ai=function(card){
                            if(trigger.target.countCards('h','shan')>event.num){
                                return get.unuseful2(card);
                            }
                            return -1;
                        };
                        if(event.num>1) next.set('prompt2','共需额外打出'+event.num+'张闪');
                    } else {
                        event.finish();
                    }
                    'step 2'
                    if(result.bool){
                        event.num--;
                        event.goto(1);
                    }
                    else{
                        trigger.untrigger();
                        trigger.directHit=true;
                    }
                },
                ai:{
                    threaten:1.3,
                },
            },
            "d2_ansha":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                intro:{
                    content:"characters",
                },
                init:function (player){
                    player.storage.d2_ansha=[];
                    player.storage.d2_ansha_object=[];
                    player.storage.d2_ansha_damage=true;
                },
                filter:function (event,player){
                    return player.countCards('h',{type:'trick'})||player.countCards('h',{type:'delay'});
                },
                selectCard:1,
                filterCard:function (card){
                    return get.type(card)=='trick'||get.type(card)=='delay';
                },
                selectTarget:function (){
                    var player=_status.event.player;
                    if (player.getEquip('d2_aghanims')) return [1,3];
                    return 1;
                },
                filterTarget:function (card,player,target){
                    return target!=player&&!player.storage.d2_ansha.contains(target.name);
                },
                check:function (card){
                    return 7-get.value(card);
                },
                contentBefore:function (){
                    player.storage.d2_ansha_damage=player.getEquip('d2_aghanims')?false:true;
                },
                content:function (){
                    player.storage.d2_ansha.push(target.name);
                    player.storage.d2_ansha_object.push(target);
                    player.markSkill('d2_ansha');
                },
                ai:{
                    order:1,
                    expose:0.2,
                    threaten:1.6,
                    result:{
                        player:1,
                        target:function (player,target){
                            if(target.hp<=1) return -3;
                            return -2;
                        },
                    },
                },
                group:["d2_ansha2","d2_ansha2_remove"],
            },
            "d2_ansha2":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseBegin",
                },
                forced:true,
                filter:function (event,player){
                    return player.storage.d2_ansha_object.length>0;
                },
                content:function (){
                    var list=player.storage.d2_ansha_object;
                    for (var i = 0; i < list.length; i++) {
                        player.line(list[i]);
                        if(player.storage.d2_ansha_damage) {
                            list[i].damage(player);
                        }else{
                            player.useCard({name:'sha'},list[i],false);
                        }
                    }
                    player.storage.d2_ansha_object=[];
                    player.storage.d2_ansha=[];
                    player.unmarkSkill('d2_ansha');
                },
                subSkill:{
                    remove:{
                        trigger:{
                            global:"dieAfter",
                        },
                        forced:true,
                        popup:false,
                        filter:function (event,player){
                            return player.storage.d2_ansha_object.contains(event.player);
                        },
                        content:function (){
                            player.storage.d2_ansha_object.remove(trigger.player);
                            player.storage.d2_ansha.remove(trigger.player.name);
                            if (player.storage.d2_ansha.length) {
                                player.updateMarks();
                            } else {
                                player.unmarkSkill('d2_ansha');
                            }
                        },
                        sub:true,
                    },
                },
            },
            "d2_leiji":{
                enable:"phaseUse",
                usable:1,
                position:"he",
                filter:function (event,player){
                    return !player.hasSkill('d2_leiji2')&&player.countCards('he');
                },
                filterCard:true,
                filterTarget:function (card,player,target){
                    return player!=target;
                },
                check:function (card){
                    return 6-get.value(card);
                },
                content:function (){
                    'step 0'
                    target.removeSkill('qianxing');
                    target.showHandcards();
                    game.delay();
                    player.judge(function(card){
                        if(get.color(card)==get.color(event.cards[0])) return 1;
                        return -1;
                    });
                    "step 1"
                    if(result.bool){
                        game.playAudio("../extension/Dota2","d2_leiji2"+[1,2].randomGet());
                        target.damage('thunder');
                    } else {
                        game.playAudio("../extension/Dota2","d2_leiji"+[1,2].randomGet());
                        player.gain(result.card);
                        player.$gain2(result.card);
                    }
                },
                ai:{
                    threaten:1.2,
                    order:10,
                    result:{
                        target:function (player,target){
                            var eff=get.damageEffect(target,player,player,'thunder');
                            if(eff<=0) return eff;
                            if(target.hasSkill('d2_leiyun2')) return eff+2;
                            if(target.hp<=1) return eff+1;
                            if(target.hp<=2||target.hasSkill('qianxing')) return eff+1.5;
                            return eff;
                        },
                    },
                },
            },
            "d2_leiji2":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                filter:function (event,player){
                    return game.hasPlayer(function(current){
                        return lib.skill.d2_leiji2.filterTarget(null,player,current);
                    });
                },
                filterTarget:function (card,player,target){
                    return player!=target&&!target.hasSkill('d2_leiji3');
                },
                content:function (){
                    'step 0'
                    target.removeSkill('qianxing');
                    target.showHandcards();
                    game.delay();
                    target.damage('thunder');
                    target.addTempSkill('d2_leiji3');
                },
                ai:{
                    order:10,
                    result:{
                        target:-1,
                    },
                },
            },
            "d2_leiji3":{
            },
            "d2_jingdian":{
                trigger:{
                    source:"damageAfter",
                },
                forced:true,
                filter:function (event,player){
                    return event.nature=='thunder';
                },
                content:function (){
                    'step 0'
                    if(trigger.player.countCards('he')){
                        player.chooseControl('摸牌','弃牌').set('prompt','摸一张牌，或弃置对方一张牌').set('ai',function(){
                            if(trigger.player.countCards('he')) return '弃牌';
                            return '摸牌';
                        });
                    } else {
                        player.draw();
                        event.finish();
                    }
                    'step 1'
                    if (result.control=='弃牌') {
                        player.discardPlayerCard(trigger.player,true);
                    } else {
                        player.draw();
                    }
                },
                ai:{
                    threaten:1.2,
                },
            },
            "d2_leishen":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseUseBegin",
                },
                skillAnimation:"epic",
                animationStr:"雷神之怒",
                animationColor:"thunder",
                mark:true,
                unique:true,
                intro:{
                    content:"limited",
                },
                init:function (player){
                    player.storage.d2_leishen=false;
                },
                filter:function (event,player){
                    return !player.storage.d2_leishen&&player.hasSkill('d2_leiji');
                },
                check:function (event,player){
                    return game.hasPlayer(function(current){
                        return get.attitude(player,current)<0&&current.hp<=1;
                    });
                },
                content:function (){
                    player.addTempSkill('d2_leiji2');
                    player.awakenSkill('d2_leishen');
                    player.storage.d2_leishen=true;
                },
            },
            "d2_leiyun":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                unique:true,
                filter:function (event,player){
                    return player.getEquip('d2_aghanims')&&game.hasPlayer(function(current){
                        return lib.skill.d2_leiji2.filterTarget(null,player,current);
                    });
                },
                filterTarget:function (card,player,target){
                    return player!=target&&!target.hasSkill('d2_leiyun2');
                },
                content:function (){
                    target.storage.d2_leiyun2=player;
                    target.addSkill('d2_leiyun2');
                },
                ai:{
                    order:11,
                    result:{
                        target:function (player,target){
                            if(target.hp<=1) return -3;
                            if(target.hp<=2) return -2;
                            return -1;
                        },
                    },
                },
            },
            "d2_leiyun2":{
                trigger:{
                    player:"damageBegin",
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                    return event.nature=='thunder';
                },
                mark:true,
                marktext:'云',
                intro:{
                    content:"下一次受到的雷属性伤害+1",
                },
                content:function (){
                    trigger.num++;
                    var zeus=player.storage.d2_leiyun2;
                    zeus.logSkill('d2_leiyun2',player);
                    zeus.line(player,'thunder');
                    player.popup('d2_leiyun2');
                    player.removeSkill('d2_leiyun2');
                },
            },
            "d2_yingbi":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                position:"he",
                filter:function (event,player){
                    return player.countCards('he',{type:'equip'});
                },
                filterCard:function (card){
                    return get.type(card)=='equip';
                },
                filterTarget:function (card,player,target){
                    return player.canUse('sha',target,false);
                },
                check:function (card){
                    return 6-get.value(card);
                },
                content:function (){
                    'step 0'
                    player.useCard({name:'sha'},target,false);
                    'step 1'
                    if (result.bool) {
                        if(target.countCards('he')) player.discardPlayerCard(target,true);
                    } else {
                        player.draw();
                    }
                },
                ai:{
                    order:function (){
                        return get.order({name:'sha'})+0.1;
                    },
                    result:{
                        target:function (player,target){
                            return get.effect(target,{name:'sha'},player,target);
                        },
                    },
                },
            },
            "d2_mohu":{
                audio:"ext:Dota2:2",
                trigger:{
                    target:"shaBegin",
                },
                priority:9,
                forced:true,
                filter:function (event,player){
                    var check=Math.floor(Math.random()*100);
                    if (get.distance(event.player,player)<=1) return check<35;
                    return check<50;
                },
                content:function (){
                    trigger.cancel();
                },
                ai:{
                    effect:{
                        target:function (card,player,target){
                            if (card.name=='sha') return [1,-0.5];
                        },
                    },
                },
            },
            "d2_jietuo":{
                audio:"ext:Dota2:2",
                trigger:{
                    source:"damageBegin",
                },
                forced:true,
                filter:function (event,player){
                    var check=Math.floor(Math.random()*100);
                    player.storage.d2_jietuo_die=false;
                    if (player.getEquip('d2_aghanims')&&check<1) {
                        player.storage.d2_jietuo_die=true;
                    }
                    return event.card&&event.card.name=='sha'&&check<15;
                },
                content:function (){
                    if (player.storage.d2_jietuo_die) {
                        trigger.player.die();
                    } else {
                        trigger.num+=2;
                    }
                },
            },
            "d2_yanling":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                usable:1,
                filter:function (event,player){
                    return game.hasPlayer(function(current){
                        return lib.skill.d2_yanling.filterTarget(null,player,current);
                    });
                },
                selectTarget:[1,4],
                filterTarget:function (card,player,target){
                    return player!=target&&!target.hasSkill('d2_yanling2');
                },
                contentBefore:function (){
                    player.loseHp();
                    var num=targets.length;
                    if(num<3) player.draw(3-num);
                },
                content:function (){
                    target.addTempSkill('d2_yanling2',{player:'phaseUseEnd'});
                },
                ai:{
                    order:1,
                    expose:0.2,
                    result:{
                        target:function (player,target){
                            if(player.hp<=1) return 0;
                            return -1;
                        },
                    },
                },
            },
            "d2_yanling2":{
                mark:true,
                intro:{
                    content:"出牌阶段出杀次数-1",
                },
                locked:true,
                mod:{
                    cardUsable:function (card,player,num){
                        if(card.name=='sha') return num-1;
                    },
                },
            },
            "d2_zhikao":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                usable:1,
                selectTarget:[1,2],
                targetprompt:["伤害","回复"],
                multitarget:true,
                multiline:true,
                filterTarget:function (card,player,target){
                    if(ui.selected.targets.length==1&&!target.isDamaged()) return false;
                    return player!=target;
                },
                contentBefore:function (){
                    player.loseHp();
                },
                content:function (){
                    targets[0].damage('fire');
                    if(targets[1]) targets[1].recover();
                },
                ai:{
                    order:2,
                    expose:0.2,
                    result:{
                        player:function (player){
                            var check=game.hasPlayer(function(current){
                                return player!=current&&get.attitude(player,current)>0&&get.recoverEffect(current,player,current);
                            });
                            if(player.hp>1&&check) return 1;
                            return 0;
                        },
                        target:function (player,target){
                            if(ui.selected.targets.length==0) return get.damageEffect(target,player,player,'fire');
                            return get.recoverEffect(target,player,target);
                        },
                    },
                },
            },
            "d2_xinxing":{
                audio:"ext:Dota2:true",
                unique:true,
                enable:"phaseUse",
                round:3,
                content:function (){
                    'step 0'
                    player.reinit('d2_phoenix','d2_supernova');
                    player.hp=player.maxHp;
                    player.update();
                    player.unmarkSkill('d2_xinxing_roundcount');
                    if(player.getEquip('d2_aghanims')){
                        player.chooseTarget('选择一名其他角色与你共眠凤凰蛋',function(card,player,target){
                            return player!=target;
                        }).ai=function(target){
                            var num=get.attitude(player,target);
                            if(num>0) return Math.max(0,3-target.hp)+num;
                            return 0;
                        }
                    } else {
                        event.finish();
                    }
                    'step 1'
                    if (result.bool&&result.targets) {
                        var target=result.targets[0];
                        player.line(target,'green');
                        target.storage.d2_niepan3=player;
                        target.addSkill('d2_niepan3');
                        player.storage.d2_niepan2=target;
                        player.addSkill('d2_niepan2');
                    }
                },
                contentAfter:function (){
                    var evt=_status.event.getParent('phaseUse');
                    if(evt&&evt.name=='phaseUse'){
                        evt.skipped=true;
                    }
                },
                ai:{
                    order:1,
                    threaten:function (player,target){
                        if(4-(game.roundNumber-target.storage.d2_xinxing_roundcount)>0) return 0.5;
                        return 1.5;
                    },
                    result:{
                        player:function (player){
                            if(player.hp==1) return 1;
                            return 0;
                        },
                    },
                },
                group:["d2_xinxing_roundcount"],
            },
            "d2_hengxing":{
                unique:true,
                group:["d2_hengxing_skip","d2_hengxing_damage"],
                forced:true,
                locked:true,
                subSkill:{
                    skip:{
                        trigger:{
                            player:"phaseUseBefore",
                        },
                        forced:true,
                        popup:false,
                        content:function (){
                            trigger.cancel();
                            player.popup('恒星');
                        },
                        sub:true,
                    },
                    damage:{
                        trigger:{
                            player:"damageBefore",
                        },
                        forced:true,
                        popup:false,
                        filter:function (event,player){
                            if(event.card) return event.card.name!='sha';
                            return true;
                        },
                        content:function (){
                            trigger.cancel();
                            player.popup('恒星');
                        },
                        ai:{
                            effect:{
                                target:function (card,player,target){
                                    if(get.tag(card,'damage')&&card.name!='sha') return 0;
                                },
                            },
                        },
                        sub:true,
                    },
                },
                ai:{
                    threaten:2,
                },
            },
            "d2_niepan":{
                trigger:{
                    global:"phaseBegin",
                },
                direct:true,
                locked:true,
                unique:true,
                init:function (player){
                    player.storage.d2_niepan=[];
                },
                intro:{
                    content:"cards",
                },
                filter:function (event,player){
                    return event.player.countCards('he');
                },
                content:function (){
                    'step 0'
                    var phoenix=player;
                    var player=trigger.player;
                    player.chooseCard('将一张牌置于'+get.translation(phoenix)+'的武将牌上','he').set('ai',function(card){
                        if(get.attitude(player,phoenix)>0) return 8-get.value(card);
                        return 0;
                    });
                    'step 1'
                    if(result.bool&&result.cards&&result.cards.length){
                        trigger.player.$give(result.cards,player);
                        player.storage.d2_niepan=player.storage.d2_niepan.concat(result.cards);
                        trigger.player.lose(result.cards,ui.special);
                        player.markSkill('d2_niepan');
                    }
                    'step 2'
                    if(player.storage.d2_niepan.length>=4) {
                        game.playAudio("../extension/Dota2","d2_niepan");
                        for (var i = 0; i < game.players.length; i++) {
                            if(game.players[i].hasSkill('d2_niepan3')){
                                var target=game.players[i];
                                target.hp=target.maxHp;
                                target.update();
                                target.removeSkill('d2_niepan3');
                                delete target.storage.d2_niepan3;
                            }
                        }
                        player.reinit('d2_supernova','d2_phoenix');
                        player.storage.d2_xinxing_roundcount=game.roundNumber;
                        player.markSkill('d2_xinxing_roundcount');
                        player.hp=player.maxHp;
                        player.update();
                        game.delay();
                        player.$throw(player.storage.d2_niepan,1000);
                        for(var i=0;i<player.storage.d2_niepan.length;i++){
                            ui.discardPile.appendChild(player.storage.d2_niepan[i]);
                        }
                        game.log(player,'弃置了',player.storage.d2_niepan);
                        delete player.storage.d2_niepan;
                        delete player.storage.d2_niepan2;
                        delete player.storage.d2_hengxing;
                        player.removeSkill(['d2_hengxing','d2_niepan','d2_niepan2']);
                    }
                },
            },
            "d2_niepan2":{
                trigger:{
                    global:"dieAfter",
                },
                forced:true,
                filter:function (event,player){
                    return event.player==player.storage.d2_niepan2;
                },
                mark:"character",
                intro:{
                    content:"与$同生死，共存亡。",
                },
                onremove:true,
                content:function (){
                    player.die();
                },
            },
            "d2_niepan3":{
                mod:{
                    cardEnabled:function (){
                        return false;
                    },
                    cardSavable:function (){
                        return false;
                    },
                    targetEnabled:function (){
                        return false;
                    },
                },
                init:function (player){
                    player.classList.add('transparent');
                },
                onremove:function (player){
                    player.classList.remove('transparent');
                },
                intro:{
                    content:"在凤凰蛋之中，不计入距离的计算且不能使用牌且不是牌的合法目标",
                },
                group:"undist",
                trigger:{
                    player:"dieAfter",
                },
                forced:true,
                popup:false,
                mark:"character",
                content:function (){
                    player.removeSkill('d2_niepan3');
                },
            },
            "d2_bangji":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseBegin",
                },
                unique:true,
                forceunique:true,
                forced:true,
                filter:function (event,player){
                    for(var i=0;i<ui.discardPile.childElementCount;i++){
                        if(ui.discardPile.childNodes[i].name=='d2_monkeyKingBar') return true;
                    }
                    return game.hasPlayer(function(current){
                        return current!=player&&current.getEquip('d2_monkeyKingBar');
                    });
                },
                content:function (){
                    var card;
                    for(var i=0;i<ui.discardPile.childElementCount;i++){
                        if(ui.discardPile.childNodes[i].name=='d2_monkeyKingBar'){
                            card=ui.discardPile.childNodes[i];
                        }
                    }
                    if(card){
                        player.gain(card,'gain2');
                    }
                    else{
                        var target=game.findPlayer(function(current){
                            return current!=player&&current.getEquip('d2_monkeyKingBar');
                        });
                        if(target){
                            var card=target.getEquip('d2_monkeyKingBar');
                            player.gain(card,target);
                            target.$give(card,player);
                            player.line(target,'green');
                        }
                    }
                },
                global:"d2_bangji_ai",
            },
            "d2_bangji_ai":{
                ai:{
                    effect:{
                        player:function (card,player){
                            if(player.hasSkill('d2_monkeyKingBar')) return;
                            if(card.name=='d2_monkeyKingBar'&&game.hasPlayer(function(current){
                                return current.hasSkill('d2_monkeyKingBar')&&get.attitude(player,current)<=0;
                            })){
                                return [0,0,0,0];
                            }
                        },
                    },
                },
            },
            "d2_huanbian":{
                group:["d2_huanbian_sha","d2_huanbian_shan","d2_huanbian_wuxie"],
                subSkill:{
                    sha:{
                        audio:"ext:Dota2:true",
                        enable:"chooseToRespond",
                        filterCard:{
                            type:"basic",
                        },
                        viewAs:{
                            name:"sha",
                        },
                        prompt:"将一张基本牌当杀打出",
                        check:function (){return 1},
                        viewAsFilter:function (player){
                            if(!player.countCards('h',{type:'basic'})) return false;
                        },
                        ai:{
                            respondSha:true,
                            skillTagFilter:function (player){
                                if(!player.countCards('h',{type:'basic'})) return false;
                            },
                            effect:{
                                target:function (card,player,target,current){
                                    if(get.tag(card,'respondSha')&&current<0) return 0.6
                                },
                            },
                            order:4,
                            basic:{
                                useful:[5,1],
                                value:[5,1],
                            },
                            result:{
                                target:function (player,target){
                            if(player.hasSkill('jiu')&&!target.getEquip('baiyin')){
                                if(get.attitude(player,target)>0){
                                    return -6;
                                }
                                else{
                                    return -3;
                                }
                            }
                            return -1.5;
                        },
                            },
                            tag:{
                                respond:1,
                                respondShan:1,
                                damage:function (card){
                                    if(card.nature=='poison') return;
                                    return 1;
                                },
                                natureDamage:function (card){
                                    if(card.nature) return 1;
                                },
                                fireDamage:function (card,nature){
                                    if(card.nature=='fire') return 1;
                                },
                                thunderDamage:function (card,nature){
                                    if(card.nature=='thunder') return 1;
                                },
                                poisonDamage:function (card,nature){
                                    if(card.nature=='poison') return 1;
                                },
                            },
                        },
                        sub:true,
                    },
                    shan:{
                        audio:"ext:Dota2:true",
                        enable:"chooseToRespond",
                        filterCard:{
                            type:"basic",
                        },
                        viewAs:{
                            name:"shan",
                        },
                        prompt:"将一张基本牌当闪打出",
                        check:function (){return 1},
                        viewAsFilter:function (player){
                            if(!player.countCards('h',{type:'basic'})) return false;
                        },
                        ai:{
                            respondShan:true,
                            skillTagFilter:function (player){
                                if(!player.countCards('h',{type:'basic'})) return false;
                            },
                            effect:{
                                target:function (card,player,target,current){
                                    if(get.tag(card,'respondShan')&&current<0) return 0.6
                                },
                            },
                            order:4,
                            basic:{
                                useful:[7,2],
                                value:[7,2],
                            },
                        },
                        sub:true,
                    },
                    wuxie:{
                        audio:"ext:Dota2:true",
                        enable:"chooseToUse",
                        filterCard:function (card){
                            return get.type(card)=='trick'||get.type(card)=='delay';
                        },
                        viewAsFilter:function (player){
                            return player.countCards('h',{type:'trick'})>0||player.countCards('h',{type:'delay'})>0;
                        },
                        viewAs:{
                            name:"wuxie",
                        },
                        prompt:"将一张锦囊牌当无懈可击使用",
                        check:function (card){return 8-get.value(card)},
                        sub:true,
                        ai:{
                            basic:{
                                useful:[6,4],
                                value:[6,4],
                            },
                            result:{
                                player:1,
                            },
                            expose:0.2,
                        },
                    },
                },
            },
            "d2_houwang":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseEnd",
                },
                frequent:true,
                filter:function (event,player){
                    return !player.countCards('h',{name:'d2_houzihousun'});
                },
                content:function (){
                    player.gain(game.createCard('d2_houzihousun'),'gain2');
                },
                group:"d2_houwang2",
            },
            "d2_houwang2":{
                audio:"ext:Dota2:1",
                trigger:{
                    player:"phaseBegin",
                },
                frequent:true,
                filter:function (event,player){
                    return player.getEquip('d2_aghanims');
                },
                content:function (){
                    player.gain(game.createCard('d2_houzihousun'),'gain2');
                },
            },
            "d2_qianggong":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                position:"he",
                filter:function (event,player){
                    return player.countCards('he',{type:'basic'})<player.countCards('he');
                },
                selectCard:[1,3],
                filterCard:function (card){
                    return get.type(card)!='basic';
                },
                filterTarget:true,
                check:function (card){
                    return 5-get.value(card);
                },
                content:function (){
                    var sha=[];
                    for (var i = 0; i < cards.length; i++) {
                        sha.push(game.createCard('sha'));
                    }
                    if(sha.length>0) target.gain(sha,'gain2');
                },
                ai:{
                    order:function (){
                        return get.order({name:'juedou'})+0.1;
                    },
                    result:{
                        target:function (player,target){
                            var num=0;
                            num+=Math.max(0,3-target.countCards('h'));
                            if(target.hasSkill('d2_juedou')&&target.countCards('h',{name:'sha'})<3) num+=2;
                            return num;
                        },
                    },
                },
            },
            "d2_juedou":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                viewAs:{
                    name:"juedou",
                },
                viewAsFilter:function (player){
                    return player.countCards('h',{name:'sha'})>0;
                },
                filter:function (event,player){
                    return player.countCards('h',{name:'sha'})>0;
                },
                filterCard:{
                    name:"sha",
                },
                onuse:function (result,player){
                    if (player.getEquip('d2_aghanims')) player.addTempSkill('d2_juedou2','phaseUseEnd');
                },
                ai:{
                    order:function (){
                        return get.order({name:'juedou'});
                    },
                    expose:0.2,
                    result:{
                        player:function (player,target){
                            if(target.countCards('h')==0||player.getEquip('d2_aghanims')) return 1;
                            var num=player.countCards('h',{name:'sha'});
                            return num-1;
                        },
                        target:function (player,target){
                            return get.effect(target,{name:'juedou'},player,target);
                        },
                    },
                    basic:{
                        order:5,
                        useful:1,
                        value:4.5,
                    },
                    tag:{
                        respond:2,
                        respondSha:2,
                        damage:1,
                    },
                },
            },
            "d2_juedou2":{
                inherit:"wushuang",
                trigger:{
                    source:"damageEnd",
                    player:"damageEnd",
                },
                forced:true,
                popup:false,
                content:function (){
                    player.removeSkill('d2_juedou2');
                },
                locked:true,
                group:["wushuang1","wushuang2"],
            },
            "d2_yongqi":{
                audio:"ext:Dota2:2",
                trigger:{
                    source:"damageEnd",
                },
                mark:true,
                intro:{
                    content:function (storage){
                        var list=['你成为【杀】的目标时有65％几率视为对对方使用一张【杀】，该【杀】命中你回复1点体力','你每使用一张【杀】摸一张牌','你的【杀】伤害+1'];
                        var str='';
                        var list2=[];
                        if(storage>=2) list2.push(list[0]);
                        if(storage>=4) list2.push(list[1]);
                        if(storage>=7) list2.push(list[2]);
                        if (list2.length>0) {
                            for (var i = 0; i < list2.length; i++) {
                                str+=list2[i]+(i==list2.length-1?'。':'；');
                            }
                        } else {
                            str='无效果'
                        }
                        return str;
                    },
                },
                init:function (player){
                    player.storage.d2_yongqi=0;
                },
                forced:true,
                locked:true,
                filter:function (event,player){
                    return event.card&&event.card.name=='juedou';
                },
                content:function (){
                    player.storage.d2_yongqi++;
                    player.syncStorage('d2_yongqi');
                },
                ai:{
                    effect:{
                        player:function (card,player,target){
                            if(card.name=='juedou') return [1,1];
                        },
                    },
                },
                group:["d2_yongqi2","d2_yongqi3","d2_yongqi4"],
            },
            "d2_yongqi2":{
                trigger:{
                    target:"shaBegin",
                },
                forced:true,
                filter:function (event,player){
                    var check=Math.floor(Math.random()*100);
                    return player.storage.d2_yongqi>=2&&check<65;
                },
                content:function (){
                    player.useCard({name:'sha'},trigger.player,'d2_yongqi2');
                },
                ai:{
                    effect:{
                        target:function (card,player,target,current){
                            if(target.storage.d2_yongqi<2) return [1,0];
                            if(card.name=='sha'&&get.attitude(player,target)<0) {
                                if(player.countCards({name:'shan'})>0) return [1,0.5];
                                return [1,1];
                            }
                        },
                    },
                },
                group:"d2_yongqi2_recover",
                subSkill:{
                    recover:{
                        trigger:{
                            player:"shaHit",
                        },
                        forced:true,
                        popup:false,
                        filter:function (event,player){
                            return event.parent.skill=='d2_yongqi2';
                        },
                        content:function (){
                            player.recover();
                        },
                        sub:true,
                    },
                },
            },
            "d2_yongqi3":{
                trigger:{
                    player:"shaBefore",
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                    return player.storage.d2_yongqi>=4;
                },
                content:function (){
                    player.draw();
                },
                ai:{
                    player:function (card,player,target){
                        if(card.name=='sha') return [1,1];
                    },
                },
            },
            "d2_yongqi4":{
                trigger:{
                    source:"damageBegin",
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                    return player.storage.d2_yongqi>=7&&event.card&&event.card.name=='sha';
                },
                content:function (){
                    trigger.num++;
                },
                ai:{
                    player:function (card,player,target){
                        if(card.name=='sha') return [1,1];
                    },
                },
            },
            "d2_rougou":{
                enable:"phaseUse",
                usable:2,
                position:"he",
                filter:function (event,player){
                    if(player.getStat('skill').d2_rougou&&!player.getEquip('d2_aghanims')) return false;
                    return player.countCards('he');
                },
                filterCard:true,
                filterTarget:function (player,target){
                    return player!=target;
                },
                content:function (){
                    var list=[1,2];
                    if (target.countCards('h')==0||target.countCards('h',{suit:get.suit(cards[0])})) {
                        player.popup('洗具');
                        target.storage.d2_rougou2=player;
                        target.addTempSkill('d2_rougou2');
                        target.damage();
                        game.playAudio("../extension/Dota2","d2_rougou"+list.randomGet());
                    } else {
                        game.playAudio("../extension/Dota2","d2_rougou_miss"+list.randomGet());
                        player.popup('杯具');
                    }
                },
                ai:{
                    order:10,
                    result:{
                        target:function (player,target){
                            if (target.countCards('h')==0) return -2;
                            return -1;
                        },
                    },
                },
            },
            "d2_rougou2":{
                mark:"character",
                intro:{
                    content:"被$钩中",
                },
                onremove:true,
                mod:{
                    globalTo:function (from,to){
                        if(from==to.storage.d2_rougou2) return -Infinity;
                    },
                },
            },
            "d2_xiuqu":{
                audio:"ext:Dota2:2",
                trigger:{
                    source:"damageAfter",
                },
                forced:true,
                filter:function (event,player){
                    return get.distance(player,event.player)<=1;
                },
                init:function (player){
                    player.storage.d2_xiuqu=0;
                },
                onremove:function (player){
                    player.loseMaxHp(Math.floor(player.storage.d2_xiuqu/3));
                    player.update();
                    delete player.storage.d2_xiuqu;
                },
                marktext:"肉",
                intro:{
                    content:function (storage,player){
                        return '共有'+storage+'枚肉标记，提供'+Math.floor(storage/3)+'点体力上限'
                    },
                },
                content:function (){
                    player.storage.d2_xiuqu++;
                    player.markSkill('d2_xiuqu');
                    if (player.storage.d2_xiuqu%3==0) {
                        player.gainMaxHp();
                        player.update();
                    }
                },
                group:"d2_xiuqu2",
            },
            "d2_xiuqu2":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseEnd",
                },
                forced:true,
                filter:function (event,player){
                    return player.maxHp-player.hp<player.hp;
                },
                filterTarget:function (player,target){
                    return get.distance(player,target)<=1;
                },
                content:function (){
                    'step 0'
                    player.loseHp();
                    if (game.hasPlayer(function(current){
                        return get.distance(player,current)<=1&&player!=current;
                    })) {
                        player.chooseTarget('朽躯：对一名其他角色造成伤害',function(card,player,target){
                            return get.distance(player,target)<=1&&player!=target;
                        }).ai=function(target){
                            return get.damageEffect(target,player,player);
                        };
                    }
                    'step 1'
                    if (result.bool&&result.targets) {
                        result.targets[0].damage();
                    }
                },
            },
            "d2_zhijie":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                animationStr:"肢解",
                skillAnimation:"legend",
                mark:true,
                unique:true,
                intro:{
                    content:"limited",
                },
                init:function (player){
                    player.storage.d2_zhijie=false;
                },
                filter:function (event,player){
                    return !player.storage.d2_zhijie&&player.isDamaged();
                },
                filterTarget:function (card,player,target){
                    return player!=target;
                },
                content:function (){
                    player.storage.d2_zhijie=true;
                    player.awakenSkill('d2_zhijie');
                    var num=player.maxHp-player.hp;
                    if(num<=0) {event.finish();return;}
                    if(num-target.countCards('he')>=0) {
                        target.discard(target.getCards('he'));
                        target.damage();
                        player.recover();
                    } else {
                        target.chooseToDiscard('肢解弃牌','he',num,true);
                    }
                },
                ai:{
                    order:12,
                    result:{
                        target:function (player,target){
                            var num=player.maxHp-player.hp-target.countCards('he');
                            if(get.damageEffect(target,player,player)&&num>0) return -1;
                            return 0;
                        },
                    },
                },
            },
            "d2_aofa":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                position:"h",
                selectCard:1,
                filterCard:true,
                filter:function (event,player){
                    return player.num('h');
                },
                check:function (card){
                    return 8-get.value(card);
                },
                filterTarget:function (card,player,target){
                    return player!=target;
                },
                content:function (){
                    'step 0'
                    var list=[];
                    for(var i=0;i<lib.inpile.length;i++){
                        if(player.canUse(lib.inpile[i],target)){
                            var card=game.createCard(lib.inpile[i]);
                            if(get.type(card)=='trick'&&get.tag(card,'damage')){
                                list.push(lib.inpile[i]);
                            }
                        }
                    }
                    event.list=list.randomGets(3);
                    'step 1'
                    var list=event.list;
                    for (var i = 0; i < list.length; i++) {
                        list[i] = ['锦囊','',list[i]];
                    }
                    player.chooseButton(['奥法',[list,'vcard'],true]).set('ai',function(button){
                        return Math.random();
                    });
                    'step 2'
                    if (result.bool) {
                        var card=result.links[0][2];
                        player.useCard({name:card},target);
                        if(player.getEquip('d2_aghanims')&&player.hasSkill('d2_shengyao')){
                            var enemies=player.getEnemies();
                            enemies.remove(target);
                            if(enemies.length) {
                                player.useCard({name:card},enemies.randomGet());
                            }
                        }
                    }
                },
                ai:{
                    order:2,
                    expose:0.2,
                    threaten:1.3,
                    result:{
                        target:function (player,target){
                            if(target.hasSkill('d2_miyin3')) return -3;
                            return -2;
                        },
                    },
                },
            },
            "d2_miyin":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                position:"h",
                selectCard:1,
                filter:function (event,player){
                    return player.countCards('h',{type:['trick','delay']})>0;
                },
                filterCard:function (card){
                    return get.type(card,'trick')=='trick';
                },
                check:function (card){
                    return 8-get.value(card);
                },
                filterTarget:function (card,player,target){
                    return player!=target;
                },
                content:function (){
                    target.addSkill('d2_miyin3');
                    if(player.getEquip('d2_aghanims')&&player.hasSkill('d2_shengyao')){
                        var enemies=player.getEnemies();
                        enemies.remove(target);
                        if(enemies.length) {
                            var target2=enemies.randomGet();
                            player.line(target2);
                            target2.addSkill('d2_miyin3');
                        }
                    }
                },
                ai:{
                    order:10,
                    expose:0.2,
                    threaten:1.3,
                    result:{
                        target:-2,
                    },
                },
                group:"d2_miyin2",
            },
            "d2_miyin2":{
                trigger:{
                    player:["phaseBefore","dieBefore"],
                },
                forced:true,
                popup:false,
                content:function (){
                    var players=game.filterPlayer(function(current){
                        return current.hasSkill('d2_miyin3');
                    });
                    for(var i=0;i<players.length;i++){
                        players[i].removeSkill('d2_miyin3');
                    }
                },
            },
            "d2_miyin3":{
                trigger:{
                    target:"useCardToBefore",
                    player:"useCard",
                },
                forced:true,
                mark:true,
                init:function (player){
                    player.storage.d2_miyin3=true;
                },
                onremove:true,
                marktext:"印",
                intro:{
                    content:function (storage,player){
                        // if(player.storage.d2_miyin3){
                        //     return "不能使用锦囊牌且下次成为锦囊牌的目标时弃两张牌";
                        // } else {
                        //     return "不能使用锦囊牌";
                        // }    
                        return '成为锦囊牌的目标或使用锦囊牌时弃置一张牌';
                    },
                },
                filter:function (event,player){
                    return player.storage.d2_miyin3&&event.card&&(get.type(event.card)=='trick'||get.type(event.card)=='delay');
                },
                content:function (){
                    // player.chooseToDiscard('上古封印','he',2,true);
                    // player.storage.d2_miyin3=false;
                    // player.markSkill('d2_miyin3');
                    player.chooseToDiscard('上古封印','he',1,true);
                },
            },
            "d2_shengyao":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                round:3,
                filter:function (event,player){
                    return player.countCards('h');
                },
                check:function (event,player){
                    if(player.countCards('h')<3||player.countCards('h')>5) return false;
                    var enemies=player.getEnemies();
                    for(var i=0;i<enemies.length;i++){
                        if(enemies[i].hp<3) return true;
                    }
                    return false;
                },
                filterTarget:function (card,player,target){
                    return player!=target;
                },
                init:function (player){
                    player.storage.d2_shengyao=[];
                },
                intro:{
                    content:"players",
                },
                content:function (){
                    'step 0'
                    if(player.getEquip('d2_aghanims')){
                        var enemies=player.getEnemies();
                        enemies.remove(target);
                        if(enemies.length) {
                            var target2=enemies.randomGet();
                            player.line(target2);
                            player.storage.d2_shengyao.add(target2);
                        }
                    }
                    'step 1'
                    player.storage.d2_shengyao.add(target);
                    event.num=player.countCards('h');
                    player.discard(player.getCards('h'));
                    player.addTempSkill('d2_shengyao3');
                    'step 2'
                    var list=[],list2=[];
                    for(var i=0;i<lib.inpile.length;i++){
                        var card=game.createCard(lib.inpile[i]);
                        if(get.type(card)=='trick'&&get.tag(card,'damage')){
                            list.push(lib.inpile[i]);
                        }
                    }
                    for(var i=0;i<event.num;i++){
                        list2.add(game.createCard(list.randomGet()));
                    }
                    player.gain(list2,'gain2');
                },
                mod:{
                    targetInRange:function (card,player,target){
                        if(get.type(card,'trick')=='trick'&&player.storage.d2_shengyao&&player.storage.d2_shengyao.contains(target)){
                            return true;
                        }
                    },
                    selectTarget:function (card,player,range){
                        if(get.type(card,'trick')=='trick'&&player.storage.d2_shengyao&&player.storage.d2_shengyao.length){
                            range[1]=-1;
                            range[0]=-1;
                        }
                    },
                    playerEnabled:function (card,player,target){
                        if(get.type(card,'trick')=='trick'&&player.storage.d2_shengyao&&player.storage.d2_shengyao.length&&!player.storage.d2_shengyao.contains(target)){
                            return false;
                        }
                    },
                },
                ai:{
                    order:9,
                    expose:0.5,
                    threaten:1.4,
                    result:{
                        target:-3,
                    },
                },
                group:["d2_shengyao2","d2_shengyao3","d2_shengyao_roundcount"],
            },
            "d2_shengyao2":{
                trigger:{
                    player:"phaseUseEnd",
                },
                forced:true,
                popup:false,
                content:function (){
                    player.storage.d2_shengyao.length=0;
                }, 
            },
            "d2_shengyao3":{
                trigger:{
                    source:"damageAfter",
                },
                forced:true,
                popup:false,
                init:function (player){
                    player.storage.d2_shengyao3=0;
                },
                onremove:true,
                filter:function (event,player){
                    player.storage.d2_shengyao3+=event.num;
                    return player.storage.d2_shengyao&&player.storage.d2_shengyao.length&&player.storage.d2_shengyao3>2;
                },
                content:function (){
                    player.addTempSkill('d2_miyin3',{player:'phaseBegin'});
                    player.markSkill('d2_miyin3');  
                },
            },
            "d2_aihen_ai":{
                audio:"ext:Dota2:2",
                unique:true,
                link:true,
                linkCharacters:["d2_skywrathMage","d2_vengefulSpirit"],
                skillAnimation:true,
                animationStr:"爱恨情仇",
                trigger:{
                    player:"dieBegin",
                },
                forced:true,
                init:function (player){
                    player.storage.d2_aihen_ai=false;
                },
                filter:function (event,player){
                    return !player.storage.d2_aihen_ai&&game.linkFilter(player,'d2_aihen_ai');
                },
                content:function (){
                    player.storage.d2_aihen_ai=true;
                    var vs=game.filterPlayer(function(current){
                        return current.name=='d2_vengefulSpirit';
                    });
                    player.line(vs);
                    for (var i = 0; i < vs.length; i++) {
                        vs[i].gain(player.getCards('he'),player);
                        vs[i].recover;
                    }
                    player.awakenSkill('d2_aihen_ai');
                },
            },
            "d2_zheyu":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"loseEnd",
                },
                direct:true,
                filter:function (event,player){
                    if(game.hasPlayer(function(current){
                        return current!=player&&current.countCards('e');
                    })){
                        for(var i=0;i<event.cards.length;i++){
                            if(event.cards[i].original=='e') return true;
                        }
                    }
                    return false;
                },
                content:function (){
                    'step 0'
                    player.chooseTarget(get.prompt('d2_zheyu'),function(card,player,target){
                        return player!=target&&target.countCards('e');
                    }).ai=function(target){
                        return -get.attitude(player,target);
                    };
                    "step 1"
                    if(result.bool){
                        player.logSkill('d2_zheyu',result.targets);
                        player.discardPlayerCard(result.targets[0],'e',true);
                    }
                },
                ai:{
                    result:{
                        effect:{
                            target:function (card,player,target,current){
                                if(get.type(card)=='equip') return [1,2];
                            },
                        },
                    },
                },
            },
            "d2_fuchou":{
                trigger:{
                    global:"damageEnd",
                },
                filter:function (event,player){
                    return (event.source!=undefined&&event.player.isAlive());
                },
                check:function (event,player){
                    return get.attitude(player,event.player)>=0&&get.attitude(player,event.source)<0;
                },
                content:function (){
                    player.line(trigger.player);
                    trigger.player.chooseToUse({name:'sha'},trigger.source,'复仇：你可以对'+get.translation(trigger.source)+'使用一张杀');
                },
            },
            "d2_daozhi":{
                audio:"ext:Dota2:true",
                enable:"phaseUse",
                round:2,
                filterTarget:function (card,player,target){
                    return target!=player;
                },
                content:function (){
                    player.storage.d2_daozhi2=target;
                    player.addSkill('d2_daozhi2');
                    target.storage.d2_daozhi2=player;
                    target.addSkill('d2_daozhi2');
                },
                ai:{
                    order:6.5,
                    result:{
                        target:function (player,target){
                            return -_status.event.getRand();
                        },
                    },
                },
                group:["d2_daozhi3","d2_daozhi4","d2_daozhi_roundcount"],
            },
            "d2_daozhi2":{
                mark:"character",
                intro:{
                    content:"其他角色到该角色的距离基数与$交换",
                },
                onremove:true,
                mod:{
                    globalTo:function (from,to,distance){
                        if(to.storage.d2_daozhi2){
                            var dist1=get.distance(from,to,'pure');
                            var dist2=get.distance(from,to.storage.d2_daozhi2,'pure');
                            return distance-dist1+dist2;
                        }
                    },
                },
            },
            "d2_daozhi3":{
                trigger:{
                    player:"phaseBegin",
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                    return player.hasSkill('d2_daozhi2');
                },
                content:function (){
                    var target=player.storage.d2_daozhi2;
                    player.removeSkill('d2_daozhi2');
                    target.removeSkill('d2_daozhi2');
                },
            },
            "d2_daozhi4":{
                trigger:{
                    global:"dieAfter",
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                    return player.hasSkill('d2_daozhi2');
                },
                content:function (){
                    var target=player.storage.d2_daozhi2;
                    target.removeSkill('d2_daozhi2');
                    player.removeSkill('d2_daozhi2');
                },
            },
            "d2_yuannu":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseUseBegin",
                },
                forced:true,
                content:function (){
                    'step 0'
                    var list=['lijian','mingce','mizhao'];
                    event.skillai=function(){
                        return list.randomGet();
                    };
                    if((event.isMine()||player.isUnderControl())&&player.getEquip('d2_aghanims')){
                        var dialog=ui.create.dialog('forcebutton');
                        dialog.add('选择获得一项技能');
                        var clickItem=function(){
                            _status.event._result=this.link;
                            dialog.close();
                            game.resume();
                        };
                        for(var i=0;i<list.length;i++){
                            if(lib.translate[list[i]+'_info']){
                                var translation=get.translation(list[i]);
                                if(translation[0]=='新'&&translation.length==3){
                                    translation=translation.slice(1,3);
                                }
                                else{
                                    translation=translation.slice(0,2);
                                }
                                var item=dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【'+
                                translation+'】</div><div>'+lib.translate[list[i]+'_info']+'</div></div>');
                                item.firstChild.addEventListener('click',clickItem);
                                item.firstChild.link=list[i];
                            }
                        }
                        dialog.add(ui.create.div('.placeholder'));
                        event.switchToAuto=function(){
                            event._result=event.skillai();
                            dialog.close();
                            game.resume();
                        };
                        _status.imchoosing=true;
                        game.pause();
                    }
                    else{
                        event._result=event.skillai();
                    }
                    'step 1'
                    _status.imchoosing=false;
                    var link=result;
                    player.addTempSkill(link);
                    player.popup(link);
                    player.flashAvatar('d2_yuannu',link);
                    game.log(player,'获得了技能','【'+get.translation(link)+'】');
                    game.delay();
                },
            },
            "d2_aihen_hen":{
                audio:"ext:Dota2:2",
                unique:true,
                link:true,
                linkCharacters:["d2_vengefulSpirit","d2_skywrathMage"],
                skillAnimation:true,
                animationStr:"爱恨情仇",
                trigger:{
                    player:"dying",
                },
                forced:true,
                init:function (player){
                    player.storage.d2_aihen_hen=false;
                },
                filter:function (event,player){
                    return !player.storage.d2_aihen_hen&&game.linkFilter(player,'d2_aihen_hen');
                },
                content:function (){
                    'step 0'
                    player.storage.d2_aihen_hen=true;
                    var sm=game.filterPlayer(function(current){
                        return current.name=='d2_skywrathMage';
                    });
                    player.line(sm);
                    for (var i = 0; i < sm.length; i++) {
                        var num=sm[i].hp-player.hp;
                        player.changeHp(num);
                        sm[i].changeHp(-num);
                    }
                    player.awakenSkill('d2_aihen_hen');
                    'step 1'
                    player.recover();
                    game.delay(2.5);
                    var sm=game.filterPlayer(function(current){
                        return current.name=='d2_skywrathMage';
                    });
                    for (var i = 0; i < sm.length; i++) {
                        if(sm[i].hp<=0){
                            sm[i].dying({source:sm[i]});
                        }
                    }
                },
            },
            "d2_canying":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                position:"he",
                filterCard:true,
                discard:false,
                prepare:"give",
                filter:function (event,player){
                    return player.countCards('he')&&game.hasPlayer(function(current){
                        return current!=player&&get.distance(player,current)<=1&&!current.hasSkill('d2_canying2');
                    });
                },
                filterTarget:function (card,player,target){
                    return player!=target&&get.distance(player,target)<=1&&!target.hasSkill('d2_canying2');
                },
                check:function (card){
                    return 6-get.value(card);
                },
                content:function (){
                    target.addSkill('d2_canying2');
                    target.storage.d2_canying=player;
                    target.storage.d2_canying2=cards;
                },
                ai:{
                    order:2,
                    expose:0.2,
                    result:{
                        target:-2,
                    },
                    threaten:1.2,
                },
            },
            "d2_canying2":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"useCardAfter",
                },
                forced:true,
                popup:false,
                mark:"card",
                intro:{
                    mark:function (dialog,content,player){
                        var ss=player.storage.d2_canying;
                        if(ss.isUnderControl(true)){
                            dialog.add(player.storage.d2_canying2);
                        }
                        else{
                            return '已成为【残影】目标';
                        }
                    },
                    content:function (content,player){
                        var ss=player.storage.d2_canying;
                        if(ss.isUnderControl(true)){
                            return get.translation(player.storage.d2_canying2);
                        }
                        return '已成为【残影】目标';
                    },
                    markcount:function (storage,player){
                        return 0;
                    },
                },
                onremove:function (player){
                    delete player.storage.d2_canying;
                    delete player.storage.d2_canying2;
                },
                filter:function (event,player){
                    return get.suit(player.storage.d2_canying2)==get.suit(event.cards[0]);
                },
                content:function (){
                    var ss=player.storage.d2_canying;
                    ss.logSkill('d2_canying2',player);
                    if(player.countCards('he')<2) {
                        player.damage(ss,'thunder');
                    } else {
                        player.randomDiscard(2);
                    }
                    player.removeSkill('d2_canying2');
                },
            },
            "d2_woliu":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                selectTarget:function (){
                    var player=_status.event.player;
                    if (player.getEquip('d2_aghanims')) return [1,3];
                    return 1;
                },
                filterTarget:function (card,player,target){
                    return player!=target&&get.distance(player,target)<=1&&target.countCards('h');
                },
                filter:function (event,player){
                    return player.countCards('h')>0&&game.hasPlayer(function(current){
                        return current!=player&&get.distance(player,current)<=1&&current.countCards('h');
                    });
                },
                multitarget:true,
                multiline:true,
                content:function (){
                    player.chooseToCompare(targets).callback=lib.skill.d2_woliu.callback;
                },
                callback:function (){
                    if(event.num1>event.num2){
                        target.addSkill('d2_woliu2');
                        if(target.hasSkill('d2_canying2')) {
                            var ss=target.storage.d2_canying;
                            ss.logSkill('d2_canying2',target);
                            if(target.countCards('he')<2) {
                                target.damage(ss,'thunder');
                            } else {
                                target.randomDiscard(2);
                            }
                            target.removeSkill('d2_canying2');
                        }
                    }
                },
            },
            "d2_woliu2":{
                trigger:{
                    player:"phaseEnd",
                },
                forced:true,
                popup:false,
                content:function (){
                    player.removeSkill('d2_woliu2');
                },
                mod:{
                    globalFrom:function (from,to,distance){
                        return distance+2;
                    },
                },
                mark:true,
                intro:{
                    content:"进攻距离-2",
                },
            },
            "d2_leiling":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                position:"he",
                filterCard:true,
                filter:function (event,player){
                    return player.countCards('he');
                },
                check:function (card){
                    var player=_status.currentPhase;
                    if(game.hasPlayer(function(current){
                        return player!=current&&player.getEnemies().contains(current)&&get.distance(current,player)<=1;
                    })) return 4-get.value(card);
                    if(game.hasPlayer(function(current){
                        return player!=current&&player.getEnemies().contains(current)&&get.distance(player,current)>1;
                    })) return 5-get.value(card);
                    return 0;
                },
                init:function (player){
                    player.storage.d2_leiling4=0;
                },
                content:function (){
                    player.storage.d2_leiling4++;
                    if(player.hasSkill('d2_leiling4')) {
                        player.updateMarks();
                    } else {
                        player.addSkill('d2_leiling4');
                    }
                },
                ai:{
                    order:function (){
                        var player=_status.currentPhase;
                        if(game.hasPlayer(function(current){
                            return player!=current&&player.getEnemies().contains(current)&&get.distance(player,current)>1;
                        })) return 8;
                        return 1;
                    },
                    result:{
                        player:function (player,target){
                            if(game.hasPlayer(function(current){
                                return player!=current&&player.getEnemies().contains(current)&&get.distance(current,player)<=1;
                            })) return 1;
                            if(game.hasPlayer(function(current){
                                return player!=current&&player.getEnemies().contains(current)&&get.distance(player,current)>1;
                            })) return 1;
                            return 0;
                        },
                    },
                },
                group:["d2_leiling2","d2_leiling3"],
            },
            "d2_leiling2":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"loseEnd",
                },
                frequent:true,
                filter:function (event,player){
                    if(_status.currentPhase==player){
                        player.storage.d2_leiling_lose++;
                        var count=player.storage.d2_leiling_count;
                        if(player.storage.d2_leiling_lose>=count) {
                            player.storage.d2_leiling_lose-=count;
                            return true;
                        }
                    }
                    return false;
                },
                content:function (){
                    player.draw();
                    player.storage.d2_leiling_count++;
                },
            },
            "d2_leiling3":{
                trigger:{
                    player:"phaseUseBegin",
                },
                forced:true,
                popup:false,
                content:function (){
                    player.storage.d2_leiling_lose=0;
                    player.storage.d2_leiling_count=2;
                },
            },
            "d2_leiling4":{
                trigger:{
                    player:"phaseBegin",
                },
                forced:true,
                popup:false,
                mark:true,
                intro:{
                    content:"进攻和防御距离+#",
                },
                content:function (){
                    player.storage.d2_leiling4=0;
                    player.removeSkill('d2_leiling4');
                },
                mod:{
                    globalFrom:function (from,to,distance){
                        return distance-from.storage.d2_leiling4;
                    },
                    globalTo:function (from,to,distance){
                        return distance+to.storage.d2_leiling4;
                    },
                },
            },
            "d2_huoquan":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"shaAfter",
                },
                direct:true,
                usable:1,
                filter:function (event,player){
                    return _status.currentPhase==player&&game.hasPlayer(function(current){
                        return current!=player&&current!=event.target&&get.distance(player,current,'attack')<=1;
                    })&&event.card&&event.card.name=='sha'&&event.card.nature=='fire';
                },
                content:function (){
                    'step 0'
                    player.chooseTarget(get.prompt('d2_huoquan'),function(card,player,target){
                        return target!=player&&target!=trigger.target&&get.distance(player,target,'attack')<=1;
                    }).ai=function(target){
                        return get.effect(target,{name:'sha',nature:'fire'},player,player);
                    };
                    'step 1'
                    if(result.bool){
                        player.logSkill('d2_huoquan',result.targets);
                        player.useCard({name:'sha'},result.targets);
                    }
                },
            },
            "d2_huodun":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                filterCard:function (card){
                    return card.name=='sha'&&card.nature=='fire';
                },
                filter:function (event,player){
                    return player.countCards('h',{name:'sha',nature:'fire'});
                },
                check:function (card){
                    return 7-get.value(card);
                },
                content:function (){
                    'step 0'
                    player.storage.d2_huodun2=3;
                    player.addTempSkill('d2_huodun2',{player:'phaseBegin'});
                    if (player.getEquip('d2_aghanims')) {
                        player.chooseTarget('令一名其他角色获得烈火罩',function(card,player,target){
                            return target!=player;
                        }).ai=function(target){
                            return get.attitude(player,target);
                        };
                    } else {
                        event.finish();
                    }
                    'step 1'
                    if(result.bool){
                        var target=result.targets[0];
                        player.line(target,'fire');
                        target.storage.d2_huodun2=3;
                        target.addTempSkill('d2_huodun2',{player:'phaseBegin'});
                    }
                },
                ai:{
                    order:function (){
                        var player=_status.currentPhase;
                        var order=get.order({name:'sha'});
                        if (player.hp<3) return order+1;
                        return order-1;
                    },
                    result:{
                        player:1,
                    },
                },
            },
            "d2_huodun2":{
                trigger:{
                    player:"damageBegin",
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                   return get.type(event.card,'trick')=='trick';
                },
                init:function (player){
                    player.storage.d2_huodun2=3;
                },
                mark:true,
                marktext:"盾",
                intro:{
                    content:"烈火罩还可以抵消#点锦囊伤害",
                },
                content:function (){
                    trigger.num--;
                    player.storage.d2_huodun2--;
                    if(player.storage.d2_huodun2==0) player.removeSkill('d2_huodun2');
                },
            },
            "d2_huoling":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:3,
                filterCard:true,
                discard:false,
                prepare:function (cards,player){
                    player.$give(cards.length,player,false);
                },
                filter:function (event,player){
                    return player.storage.d2_huoling.length<3&&player.countCards('h');
                },
                check:function (card){
                    return 8-get.value(card);
                },
                init:function (player){
                    player.storage.d2_huoling=[];
                },
                intro:{
                    content:"card",
                },
                content:function (){
                    player.storage.d2_huoling=player.storage.d2_huoling.concat(event.cards);
                    player.markSkill('d2_huoling');
                },
                ai:{
                    order:function (){
                        return get.order({name:'sha'})-2;
                    },
                    result:{
                        player:2,
                    },
                },
                group:"d2_huoling2",
            },
            "d2_huoling2":{
                audio:"ext:Dota2:2",
                trigger:{
                    target:"useCardToBefore",
                },
                usable:1,
                filter:function (event,player){
                    return player.storage.d2_huoling.length&&event.player!=player;
                },
                check:function (event,player){
                    return event.card&&get.effect(player,event.card,event.player,player)<0;
                },
                content:function (){
                    player.storage.d2_huoling.splice(0,1);
                    if(player.storage.d2_huoling.length==0) player.unmarkSkill('d2_huoling');
                    trigger.cancel();
                    player.gain(game.createCard({name:'sha',suit:'heart',nature:'fire'}),'gain2','log');
                },
            },
            "d2_jushi":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:1,
                selectTarget:2,
                filterTarget:function (card,player,target){
                    if(target.storage.d2_tuling_mark<1) return false;
                    if(ui.selected.targets.length==0) return true;
                    return ui.selected.targets[0].storage.d2_tuling_mark!=target.storage.d2_tuling_mark;
                },
                filter:function(event,player){
                    var list=game.filterPlayer(function(current){
                        return current.storage.d2_tuling_mark;
                    });
                    if(list.length<2) return false;
                    var max=0,min=100;
                    for(var i=0;i<list.length;i++){
                        var num=list[i].storage.d2_tuling_mark;
                        if(max<num) max=num;
                        if(min>num) min=num;
                    }
                    return min!=max;
                },
                multitarget:true,
                targetprompt:["获得装备",""],
                content:function (){
                    "step 0"
                    var tmp=targets[0].storage.d2_tuling_mark;
                    event.num=Math.abs(targets[1].storage.d2_tuling_mark-tmp);
                    targets[0].storage.d2_tuling_mark=targets[1].storage.d2_tuling_mark;
                    targets[1].storage.d2_tuling_mark=tmp;
                    targets[0].updateMarks();
                    targets[1].updateMarks();
                    if(player.getEquip('d2_aghanims')) {
                        event.both=true;
                    } else {
                        var list=['进攻','防御'];
                        var name=get.translation(targets[0].name);
                        player.chooseControl(list).set('prompt','进攻：令'+name+'随机装备一件武器<br>防御：令'+name+'随机装备一件防具').set('ai',function(){
                            if(targets[0].getEquip(2)) return list[0];
                            if(targets[0].getEquip(1)) return list[1];
                            return list.randomGet();
                        });
                    }
                    'step 1'
                    if (result.control=='进攻'||event.both) {
                        var card=get.cardPile(function(card){
                            return get.type(card)=='equip'&&get.subtype(card)=='equip1';
                        });
                        targets[0].equip(card,true).set('delay',true);
                    }
                    if(result.control=='防御'||event.both) {
                        var card=get.cardPile(function(card){
                            return get.type(card)=='equip'&&get.subtype(card)=='equip2';
                        });
                        targets[0].equip(card,true).set('delay',true);
                    }
                },
                ai:{
                    order:6,
                    result:{
                        target:function (player,target){
                            if(ui.selected.targets.length==0) return 1;
                            return get.attitude(player,target);
                        }
                    },
                },
            },
            "d2_cihua":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                round:3,
                content:function (){
                    var players=game.filterPlayer(function(current){
                        return current.storage.d2_tuling_mark>0;
                    });
                    player.addTempSkill('d2_cihua2',{player:'phaseBegin'});
                },
                ai:{
                    order:7,
                    result:{
                        player:function (player,target){
                            var players=game.filterPlayer(function(current){
                                return current.storage.d2_tuling_mark;
                            });
                            if (players.length>=Math.min(4,game.players.length/2)) return 1;
                            return 0;
                        },
                    },
                },
                group:["d2_cihua_roundcount"],
            },
            "d2_cihua2":{
                audio:"ext:Dota2:2",
                trigger:{
                    global:"damageAfter",
                },
                usable:2,
                forced:true,
                mark:true,
                intro:{
                    content:"拥有残岩的角色造成伤害后你摸一张牌",
                },
                filter:function (event,player){
                    return event.source&&event.source.storage.d2_tuling_mark;
                },
                content:function (){
                    player.line(trigger.source);
                    player.draw();
                },
            },
            "d2_tuling":{
                audio:"ext:Dota2:2",
                enable:"phaseUse",
                usable:2,
                global:"d2_tuling_mark",
                selectTarget:2,
                multitarget:true,
                targetprompt:["失去","获得"],
                filterTarget:function (card,player,target){
                    if (ui.selected.targets.length==0) return target.storage.d2_tuling_mark;
                    return true;
                },
                init:function (player){
                    var players=game.players;
                    for(var i=0;i<players.length;i++){
                        players[i].storage.d2_tuling_mark=0;
                    }
                    var num=0;
                    for(var i=0;i<players.length;i++){
                        num+=players[i].storage.d2_tuling_mark;
                    }
                    player.storage.d2_tuling_mark+=Math.max(0,6-num);
                    player.markSkill('d2_tuling_mark');
                },
                content:function (){
                    'step 0'
                    targets[0].storage.d2_tuling_mark--;
                    targets[1].storage.d2_tuling_mark++;
                    targets[1].markSkill('d2_tuling_mark');
                    if(targets[0].storage.d2_tuling_mark<1) targets[0].unmarkSkill('d2_tuling_mark');
                    else targets[0].markSkill('d2_tuling_mark');
                    var name1=get.translation(targets[0]);
                    var name2=get.translation(targets[1]);
                    var list=['摸牌','弃牌'];
                    player.chooseControl(list).set('prompt','令'+name1+'摸一张牌，或弃置'+name2+'区域内的一张牌').set('ai',function(){
                        var att1=get.attitude(player,targets[0]);
                        var att2=get.attitude(player,targets[1]);
                        if (att2>0&&targets[1].countCards('j')) return list[1];
                        if (att2<0&&countCards('he')<1) return list[1];
                        if (att1>0) return list[0];
                        return list[1];
                    });
                    'step 1'
                    if (result.control=='摸牌') {
                        targets[0].draw();
                    } else {
                        player.discardPlayerCard(targets[1],'hej',true);
                    }
                },
                subSkill:{
                    mark:{
                        onremove:true,
                        intro:{
                            content:"共有#个残岩",
                        },
                        sub:true,
                    },
                },
                ai:{
                    order:8,
                    result:{
                        target:function (player,target){
                            var length=ui.selected.targets.length;
                            var enemies=player.getEnemies();
                            var num=0;
                            for(var i=0;i<enemies.length;i++){
                                if(enemies[i].storage.d2_tuling_mark) {
                                    num++;
                                }
                            }
                            if(length==0||(length==1&&target.countCards('j'))||num>1) return 1;
                            if(length==1&&target.countCards('he')<1) return 0.1;
                            return -1;
                        },
                    },
                },
                group:"d2_tuling2",
            },
            "d2_tuling2":{
                trigger:{
                    player:"phaseBegin",
                },
                frequent:true,
                filter:function(event,player){
                    var num=0;
                    for(var i=0;i<game.players.length;i++){
                        num+=game.players[i].storage.d2_tuling_mark;
                    }
                    event.num=num;
                    return num<6;
                },
                content:function (){
                    var list=[1,2];
                    game.playAudio("../extension/Dota2","d2_tuling2"+list.randomGet());
                    var num=0;
                    for(var i=0;i<game.players.length;i++){
                        num+=game.players[i].storage.d2_tuling_mark;
                    }
                    player.storage.d2_tuling_mark+=6-num;
                    player.markSkill('d2_tuling_mark');
                },
            },
            "d2_shuangren":{
                audio:"ext:Dota2:2",
                enable:['chooseToUse','chooseToRespond'],
                viewAs:{name:'sha'},
                viewAsFilter:function(player){
                    return player.hp>1||player.countCards('he')>1;
                },
                precontent:function(){
                    if(player.hp>1) player.loseHp();
                    else player.chooseToDiscard('双刃弃牌',2,'he',true);
                    player.draw();
                },
                filterCard:function(){return false},
                selectCard:-1,
                prompt:'失去一点体力并摸一张牌，视为使用或打出一张【杀】',
                ai:{
                    order:function(){
                        return 2.9;
                    },
                    skillTagFilter:function(player,tag,arg){
                        if(arg!='use') return false;
                    },
                    respondSha:true,
                },
            },
            "d2_fanji":{
                trigger:{
                    target:'shaAfter'
                },
                direct:true,
                filter:function(event,player){
                    return event.player!=player;
                },
                content:function(){
                    'step 0'
                    player.chooseToUse({name:'sha'},trigger.player,'反击：对'+get.translation(trigger.player)+'使用一张【杀】');
                    'step 1'
                    if(result.bool) game.playAudio("../extension/Dota2","d2_fanji"+[1,2].randomGet());
                },
                ai:{
                    threaten:function(player,target){
                        if(target.hp==1) return 1.2;
                        if(target.hp==2) return 0.5;
                    },
                    result:{
                        target:-1.5,
                    },
                },
            },
            "d2_benta":{
                audio:"ext:Dota2:2",
                enable:'phaseUse',
                round:3,
                selectTarget:[1,3],
                filterTarget:true,
                multiline:true,
                content:function(){
                    'step 0'
                    var list=[];
                    for(var i=0;i<lib.inpile.length;i++){
                        if(lib.card[lib.inpile[i]].subtype=='equip1'){
                            list.push(lib.inpile[i]);
                        }
                    }
                    if(!list.length){
                        event.finish();
                        return;
                    }
                    event.card=game.createCard(list.randomGet());
                    target.$draw(event.card);
                    game.delay();
                    'step 1'
                    target.equip(event.card);
                    target.draw();
                    'step 2'
                    if(player.getEquip('d2_aghanims')) target.changeHujia();
                },
                ai:{
                    order:8,
                    result:{
                        target:function(player,target){
                            if(target.getEquip(1)) return 1;
                            return 2;
                        },
                    }
                },
            },
            "d2_huangwu":{
                trigger:{
                    source:"damageBegin",
                },
                check:function (event, player) {
                    return get.attitude(player,event.player)<=0;
                },
                filter:function (event, player) {
                    return event.card&&event.card.name=='sha'&&event.parent.name!='_lianhuan'&&event.parent.name!='_lianhuan2';
                },
                content:function () {
                    "step 0"
                    player.judge(function (card) {
                        if (get.suit(card)=='club') return 1;
                        if (get.suit(card)=='spade') return 2;
                        return -1;
                    })
                    "step 1"
                    if(result.judge<1) return ;
                    game.playAudio("../extension/Dota2","d2_huangwu"+[1,2].randomGet());
                    if (result.judge==2) {
                        trigger.num++;
                    }
                    if (result.judge==1) {
                        var target=trigger.player;
                        if(target.countCards('he')) player.discardPlayerCard(target,true);
                    }
                },
            },
            "d2_zheshe":{
                trigger:{
                    player:"damageBegin",
                },
                forced:true,
                filter:function (event,player) {
                    if (event.num<1) return false;
                    return true;
                },
                priority:-10,
                content:function () {
                    "step 0"
                    player.judge(function (card) {
                        if (get.suit(card)=='club') return 1;
                        if (get.suit(card)=='spade') return 2;
                        return -1;
                    })
                    "step 1"
                    if(result.judge<1) return;
                    game.playAudio("../extension/Dota2","d2_zheshe"+[1,2].randomGet());
                    if (result.judge==1||trigger.source==undefined) {
                        result.control='免疫';
                        event.goto(2);
                    }
                    if (result.judge==2) {
                        var list=['免疫','反弹'];
                        player.chooseControl(list).set('prompt','折射：防止伤害，或将防止伤害并令伤害来源受到伤害').set('ai',function(){
                            if(get.attitude(player,trigger.source)>0) return '免疫';
                            return '反弹';
                        });
                    }
                    'step 2'
                    if (result.control=='免疫') {
                        if(player.getEquip('d2_aghanims')) {
                            trigger.num=0;
                            trigger.cancel();
                        }
                        else {
                            trigger.num--;
                            if(trigger.num<1) trigger.cancel();
                        }
                    }
                    if (result.control=='反弹') {
                        if(player.getEquip('d2_aghanims')) {
                            trigger.source.damage(player,trigger.nature,trigger.num);
                            trigger.num=0;
                            trigger.cancel();
                        } else {
                            trigger.source.damage(player,trigger.nature);
                            trigger.num--;
                            if(trigger.num<1) trigger.cancel();
                        }
                    }
                },
                ai:{
                    threaten:0.4
                },
            },
            "d2_yanshu":{
                enable:"phaseUse",
                position:"he",
                usable:1,
                filter:function(event,player){
                    return player.countCards('he')>1;
                },
                selectCard:2,
                filterCard:true,
                filterTarget:function (player,target){
                    return player!=target;
                },
                check:function (card){
                    return 5-get.value(card);
                },
                content:function (){
                    'step 0'
                    player.judge(function(card){
                        event.num=0;
                        if(get.color(card)=='red') {
                            event.num|=1;
                        }
                        if(get.number(card)%2==0) {
                            event.num|=2;
                        }
                        if(event.num==0) return -1;
                        return 1;
                    });
                    'step 1'
                    if(result.bool){
                        game.playAudio("../extension/Dota2","d2_yanshu1"+[1,2].randomGet());
                        if ((event.num&1)==1) {
                            player.line(target,'fire')
                            target.damage('fire');
                        }
                        if ((event.num&2)==2) {
                            player.gain(get.cardPile(function(card){
                                return get.type(card)=='trick'&&!get.tag(card,'multitarget');
                            }),'gain2');
                        }
                    } else {
                        game.playAudio("../extension/Dota2","d2_yanshu2"+[1,2].randomGet());
                    }
                },
                ai:{
                    order:5,
                    threaten:1.3,
                    result:{
                        target:-2,
                    }
                },
            },
            "d2_jingtong":{
                trigger:{
                    player:"useCardAfter",
                },
                forced:true,
                popup:false,
                filter:function (event,player){
                    return event.parent.name!='d2_jingtong'&&event.targets&&event.targets.length==1&&event.card&&!get.tag(event.card,'multitarget')&&get.type(event.card)=='trick';
                },
                content:function (){
                    var card=game.createCard(trigger.card.name,trigger.card.suit,trigger.card.number,trigger.card.nature);
                    var target=(trigger._targets||trigger.targets).slice(0);
                    var list=['2x!','3x!!','4x!!!'];
                    var i=0,j=0;
                    var num=player.getEquip('d2_aghanims')?60:50;
                    var check=Math.floor(Math.random()*100)<num?true:false;
                    while(check&&i<3){
                        if(check&&player.canUse({name:card.name},target[0])&&target[0].isAlive()) {
                            j++;
                            player.useCard(card,target); 
                            player.popup(list[i]);
                        }
                        check=Math.floor(Math.random()*2);
                        i++;
                    }
                    game.playAudio("../extension/Dota2","d2_jingtong"+j);
                },
            },
            "d2_tianqiu":{
                trigger:{
                    source:'damageBegin'
                },
                filter:function (event,player) {
                    return event.card&&event.card.name=='sha'&&event.parent.name!='_lianhuan'&&event.parent.name!='_lianhuan2';
                },
                forced:true,
                init:function(player){
                    player.storage.d2_tianqiu=0;
                },
                intro:{
                    content:'【天球】【蚀智】计算你的手牌时+#'
                },
                content:function(){
                    'step 0'
                    var num1=player.countCards('h')+player.storage.d2_tianqiu;
                    var num2=trigger.player.countCards('h');
                    var num=2;
                    if(player.getEquip('d2_aghanims')) num=1;
                    if(num1>num2&&player.countCards('he')>=num) {
                        event.damage=true;
                        player.chooseToDiscard(num,'奥术天球：弃'+num+'张牌并令此【杀】伤害+1','he').set('ai',function(card){
                            if(get.attitude(player,trigger.player)>0) return 0;
                            return 7-get.value(card);
                        });
                    }
                    'step 1'
                    if(result.bool){
                        game.playAudio("../extension/Dota2","d2_tianqiu1"+[1,2].randomGet());
                        trigger.num++;
                        player.storage.d2_tianqiu=0;
                        player.unmarkSkill('d2_tianqiu');
                        player.storage.d2_shizhi_damage=true;
                    } else {
                        if(player.getEquip('d2_aghanims')&&trigger.player.countCards('he')) player.gainPlayerCard('奥术天球：获得'+get.translation(trigger.player)+'一张手牌',trigger.player,'h',true);
                        else player.draw();
                        player.storage.d2_tianqiu++;
                        player.markSkill('d2_tianqiu');
                        game.playAudio("../extension/Dota2","d2_tianqiu2"+[1,2].randomGet());
                    }
                },
            },
            "d2_jingqi":{
                trigger:{
                    player:'phaseBegin'
                },
                direct:true,
                locked:true,
                content:function(){
                    'step 0'
                    player.chooseTarget([1,2],'精气光环：令至多2名其他角色获得【精气】效果',function(card,player,target){
                        return target!=player&&!target.hasSkill('d2_jingqi2');
                    }).ai=function(target){
                        return get.attitude(player,target);
                    };
                    'step 1'
                    if(result.bool){
                        var targets=result.targets;
                        player.line(targets);
                        for(var i=0;i<targets.length;i++){
                            targets[i].addTempSkill('d2_jingqi2',{player:'phaseEnd'});
                            targets[i].markSkill('d2_jingqi2');
                        }
                    }
                },
                mod:{
                    maxHandcard:function (player,num){
                        return num+1;
                    },
                },
                group:'d2_jingqi2',
            },
            "d2_jingqi2":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:'useCardAfter'
                },
                forced:true,
                filter:function(event,player){
                    return Math.floor(Math.random()*5)<2;
                },
                intro:{
                    content:'获得【精气】效果'
                },
                content:function(){
                    player.draw();
                },
            },
            "d2_shizhi":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:"phaseBegin",
                },
                forced:true,
                unique:true,
                mark:true,
                init:function (player){
                    player.storage.d2_shizhi=false;
                    player.storage.d2_shizhi_damage=false;
                },
                intro:{
                    content:function(storage,player) {
                        var num=player.countCards('h')+player.storage.d2_tianqiu;
                        var d=player.storage.d2_shizhi_damage?'已':'未';
                        var str='手牌数+天球标记数：'+num+'；'+d+'发动过【天球】伤害+1效果';
                        return str;
                    },
                },
                filter:function (event,player){
                    if(!player.storage.d2_tianqiu) player.storage.d2_tianqiu=0;
                    var num=player.countCards('h')+player.storage.d2_tianqiu;
                    var check=game.hasPlayer(function(current){
                        return current!=player&&num>current.countCards('h');
                    });

                    return !player.storage.d2_shizhi&&player.storage.d2_shizhi_damage;
                },
                skillAnimation:true,
                animationStr:"神智之蚀",
                animationColor:"thunder",
                content:function (){
                    player.addSkill('d2_shizhi2');
                    delete player.storage.d2_shizhi_damage;
                    player.storage.d2_shizhi=true;
                    player.awakenSkill('d2_shizhi');
                },
            },
            "d2_shizhi2":{
                trigger:{player:'phaseBegin'},
                forced:true,
                popup:false,
                mark:true,
                marktext:'智',
                intro:{
                    content:'锁定技，①准备阶段你获得一枚天球标记；②你使用【杀】指定目标后，若对方的手牌比你多，你弃置其一张牌，否则摸一张牌。'
                },
                content:function(){
                    player.storage.d2_tianqiu++;
                    player.markSkill('d2_tianqiu');
                },
                group:'d2_shizhi3'
            },
            "d2_shizhi3":{
                trigger:{player:'shaBegin'},
                forced:true,
                popup:false,
                content:function(){
                    var num1=player.countCards('h');
                    var num2=trigger.player.countCards('h');
                    if(num1<num2) {
                        trigger.player.randomDiscard();
                    } else {
                        player.draw();
                    }
                }
            },
            "d2_mowang":{
                trigger:{
                    player:'shaBegin',
                },
                forced:true,
                filter:function(event,player){
                    return event.player;
                },
                content:function(){
                    var target=trigger.target;
                    if(target.storage.d2_mowang_ying>0) {
                        target.storage.d2_mowang_ying--;
                        if(target.storage.d2_mowang_ying<1) target.unmarkSkill('d2_mowang_ying');
                        target.updateMarks();
                        game.playAudio("../extension/Dota2","d2_mowang"+[1,2].randomGet());
                    } else {
                        player.draw();
                    }
                },
                subSkill:{
                    "ying":{
                        mark:true,
                        intro:{
                            content:'共有#枚“影”标记'
                        },
                        sub:true,
                    },
                },
                group:['d2_mowang2','d2_mowang3'],
            },
            "d2_mowang2":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:'phaseUseBegin'
                },
                forced:true,
                filter:function(event,player){
                    return game.hasPlayer(function(current){
                        return current!=player&&current.hujia>0;
                    });
                },
                content:function(){
                    var players=game.filterPlayer(function(current){
                        return current!=player&&current.hujia>0;
                    });
                    player.line(players);
                    for(var i=0;i<players.length;i++){
                        var num=players[i].hujia;
                        players[i].changeHujia(-num);
                        players[i].addSkill('d2_mowang_ying');
                        players[i].storage.d2_mowang_ying=num;
                    }
                },
            },
            "d2_mowang3":{
                trigger:{
                    player:'phaseUseEnd'
                },
                forced:true,
                content:function(){
                    var players=game.filterPlayer(function(current){
                        return current!=player&&current.storage.d2_mowang_ying>0;
                    });
                    player.line(players);
                    for(var i=0;i<players.length;i++){
                        var num=players[i].storage.d2_mowang_ying;
                        players[i].changeHujia(num);
                        delete players[i].storage.d2_mowang_ying;
                        players[i].removeSkill('d2_mowang_ying');
                    }
                },
            },
            "d2_wange":{
                audio:"ext:Dota2:2",
                enable:'phaseUse',
                forced:true,
                unique:true,
                mark:true,
                init:function (player){
                    player.storage.d2_wange=false;
                    player.storage.d2_wange_souls=0;
                },
                intro:{
                    content:function(storage,player) {
                        var num=Math.min(8,player.storage.d2_wange_souls);
                        return '尚未发动，发动时展示的牌数：'+num;
                    },
                },
                filter:function (event,player){
                    return !player.storage.d2_wange&&player.storage.d2_wange_souls;
                },
                skillAnimation:true,
                animationStr:"魂之挽歌",
                animationColor:"thunder",
                content:function (){
                    'step 0'
                    var num=Math.min(8,player.storage.d2_wange_souls);
                    var cards=get.cards(num);
                    var list=[0,0,0,0];
                    for(var i=0;i<cards.length;i++){
                        switch(get.suit(cards[i])) {
                            case 'spade':list[0]++;break;
                            case 'club':list[1]++;break;
                            case 'heart':list[2]++;break;
                            case 'diamond':list[3]++;break;
                            default:
                        }
                        cards[i].discard();
                    }
                    if(player.getEnemies.length<list[0]) {
                        list[1]+=list[0]-player.getEnemies.length;
                        list[0]=player.getEnemies.length;
                    }
                    if(player.maxHp-player.hp<list[2]) {
                        list[3]+=list[2]-player.maxHp+player.hp;
                        list[2]=player.maxHp-player.hp;
                    }
                    event.list=list;
                    var str='展示了牌堆顶的'+num+'张牌';
                    event.dialog=ui.create.dialog(player,str,cards);
                    event.videoId=lib.status.videoId++;
                    game.broadcast('createDialog',event.videoId,str,cards);
                    game.addVideo('cardDialog',null,[player,str,get.cardsInfo(cards),event.videoId]);
                    game.delay(2);
                    'step 1'
                    event.dialog.close();
                    game.addVideo('cardDialog',null,event.videoId);
                    game.broadcast('closeDialog',event.videoId);
                    'step 2'
                    var list=event.list;
                    if(list[0]) {
                        var enemies=player.getEnemies().randomGets(list[0]);
                        player.line(enemies);
                        for(var i=0;i<enemies.length;i++) enemies[i].damage(player);
                    }
                    if(list[1]) {
                        var enemies=game.filterPlayer(function(current){
                            return player.getEnemies().contains(current)&&current.countCards('he');
                        });
                        for(var i=0;i<list[1];i++) {
                            var enemy=enemies.randomGet();
                            enemy.randomDiscard();
                            player.line(enemy);
                            if(enemy.countCards('he')<1) enemies.remove(enemy);
                        }
                    }
                    if(list[2]) {
                        player.recover(list[2]);
                    }
                    if(list[3]) {
                        player.draw(list[3]);
                    }
                    delete player.storage.d2_wange_souls;
                    player.storage.d2_wange=true;
                    player.awakenSkill('d2_wange');
                },
                ai:{
                    result:{
                        player:function(player,target){
                            var num=player.storage.d2_wange_souls;
                            if(num>=8) return 1;
                            if(player.hp<2&&num>=4) return 1;
                            return 0;
                        }
                    },
                },
            },
            "d2_jiban":{
                trigger:{
                    player:'phaseBegin',
                },
                direct:true,
                content:function(){
                    'step 0'
                    player.chooseTarget(get.prompt('d2_jiban'),function(card,player,target){
                        return player!=target&&player.storage.d2_jiban_link!=target;
                    }).set('ai',function(target){
                        return get.attitude(_status.event.player,target);
                    });
                    'step 1' 
                    if (result.bool) {
                        var target;
                        if(event.onlytarget){
                            target=event.onlytarget;
                        }
                        else if(result.targets&&result.targets.length){
                            target=result.targets[0];
                        }
                        player.line(target,'green');
                        player.storage.d2_jiban_link=target;
                        player.removeSkill('d2_jiban_link');
                        player.addSkill('d2_jiban_link');
                    }
                },
                subSkill:{
                    link:{
                        trigger:{global:'dieBefore'},
                        mark:'character',
                        intro:{
                            content:'与$连接'
                        },
                        forced:true,
                        popup:false,
                        filter:function(event,player){
                            return event.player==player.storage.d2_jiban_link;
                        },
                        content:function(){
                            delete player.storage.d2_jiban_link;
                            player.removeSkill('d2_jiban_link');
                        },
                        sub:true,
                    },
                },
                ai:{
                    threaten:1.1,
                    expose:0.6
                },
                group:'d2_jiban2',

            },
            "d2_jiban2":{
                trigger:{
                    player:['drawEnd','recoverEnd'],
                },
                forced:true,
                filter:function(event,player){
                    return player.storage.d2_jiban_link;
                },
                content:function(){
                    var target=player.storage.d2_jiban_link;
                    player.line(target);
                    var num=player.getEquip('d2_aghanims')?trigger.num:1;
                    if(trigger.name=='draw') target.draw(num);
                    if(trigger.name=='recover') target.recover(num);
                },
            },
            "d2_guozai":{
                enable:'phaseUse',
                usable:1,
                position:'he',
                selectCard:[0,1],
                filterCard:function(card){
                    return get.type(card)=='equip';
                },
                check:function(card){
                    return 20-get.value(card);
                },
                content:function(){
                    'step 0'
                    if(cards.length==0) player.loseHp();
                    'step 1'
                    player.addSkill('d2_guozai2');
                    var target=player.storage.d2_jiban_link;
                    if(target) {
                        player.line(target);
                        target.addSkill('d2_guozai2');
                    }
                },
                ai:{
                    order:function (){
                        return get.order({name:'sha'})+0.1;
                    },
                    result:{
                        player:function(player,target){
                            if(player.countCards('he',{type:'equip'})) return 2;
                            if(player.hp>1) return 1;
                            return 0;
                        }
                    },
                },
                subSkill:{
                    'lose':{
                        trigger:{player:'phaseBegin'},
                        forced:true,
                        popup:false,
                        content:function(){
                            player.removeSkill('d2_guozai2');
                            if(player.storage.d2_jiban_link) player.storage.d2_jiban_link.removeSkill('d2_guozai2');
                        },
                        sub:true,
                    }
                },
                group:'d2_guozai_lose'
            },
            "d2_guozai2":{
                mark:true,
                intro:{
                    content:function(storage,player){
                        var str='';
                        if(player.hasSkill('d2_guozai2_damage')) str='下一次受到的伤害-1；';
                        return str+'出牌阶段出【杀】次数+1';
                    }
                },
                init:function(player){
                    player.addSkill('d2_guozai2_damage');
                },
                mod:{
                    cardUsable:function (card,player,num){
                        if(card.name=='sha') return num+1;
                    },
                },
                subSkill:{
                    damage:{
                        trigger:{player:'damageBegin'},
                        forced:true,
                        filter:function(event,player){
                            return event.num>0;
                        },
                        content:function(){
                            trigger.num--;
                            player.removeSkill('d2_guozai2_damage');
                        },
                        sub:true,
                    },
                },
            },
            "d2_jianglin":{
                trigger:{
                    global:'damageBefore'
                },
                round:2,
                filter:function(event,player){
                    return (event.player==player&&event.num>=player.hp)||(event.player==player.storage.d2_jiban_link&&event.num>=player.storage.d2_jiban_link.hp);
                },
                content:function(){
                    player.storage.d2_jianglin2={
                        num:trigger.num,
                        nature:trigger.nature,
                        source:trigger.source,
                    },
                    player.line(trigger.player);
                    player.addSkill('d2_jianglin2');
                    trigger.cancel();
                },
            },
            "d2_jianglin2":{
                trigger:{
                    player:'phaseEnd'
                },
                forced:true,
                mark:true,
                intro:{
                    content:function(storage,player){
                        var nature=player.storage.d2_jianglin2.nature?get.translation(player.storage.d2_jianglin2.nature):'无';
                        var source=player.storage.d2_jianglin2.source?get.translation(player.storage.d2_jianglin2.source.name)+'造成':'无来源';
                        return '回合结束时受到'+source+'的'+player.storage.d2_jianglin2.num+'点'+nature+'属性伤害';
                    }
                },
                content:function(){
                    var damage=player.storage.d2_jianglin2;
                    player.damage(damage.num,damage.nature,damage.source);
                    player.removeSkill('d2_jianglin2');
                },
            },
            "d2_suodi":{
                audio:"ext:Dota2:2",
                trigger:{
                    global:'phaseBegin',
                },
                round:1,
                filter:function(event,player){
                    if(event.player==player.storage.d2_suodi_target) {
                        delete player.storage.d2_suodi_target;
                        player.removeSkill('d2_suodi_target');
                        return false;
                    }
                    return event.player!=player;
                },
                check:function(event,player){
                    if(player.hasSkill('qianxing')) return false;
                    if(!player.getEnemies().contains(event.player)) return false;
                    if(player.hp>2) return false;
                    if(event.player.getCards('h')>3) return true;
                    if(player.hp<2) return true;
                },
                content:function(){
                    var target=_status.currentPhase;
                    player.addTempSkill('qianxing');
                    player.storage.d2_suodi_target=target;
                    player.line(target);
                    player.removeSkill('d2_suodi_target');
                    player.addSkill('d2_suodi_target');
                },
                subSkill:{
                    target:{
                        mark:'character',
                        intro:{
                            content:'不能对$发动【缩地】'
                        },
                        sub:true,
                    },
                },
            },
            "d2_lianji":{
                audio:"ext:Dota2:2",
                trigger:{
                    player:'shaAfter'
                },
                usable:1,
                forced:true,
                filter:function(event,player){
                    return event.target.isAlive();
                },
                content:function(){
                    player.useCard(trigger.card,trigger.target);
                },
            },
            "d2_huisu":{
                audio:"ext:Dota2:2",
                trigger:{
                    global:'phaseBegin',
                },
                round:2,
                check:function(event,player){
                    var num1=player.hp+player.maxHp+player.getCards('he')-2*player.getCards('j');
                    var mark=player.storage.d2_huisu;
                    var num2=mark.hp+mark.maxHp+mark.hand.length+mark.equip.length-2*mark.judge.length;
                    return num2>num1;
                },
                intro:{
                    content:function(storage,player){
                        var str='';
                        str+='体力：'+player.storage.d2_huisu.hp+'、体力上限：'+player.storage.d2_huisu.maxHp;
                        if(player.storage.d2_huisu.hand.length){
                            if(player.isUnderControl(true)){
                                str+='手牌区：'+get.translation(player.storage.d2_huisu.hand);
                            }
                            else{
                                str+='手牌区：'+(player.storage.d2_huisu.hand.length)+'张牌';
                            }
                        }
                        if(player.storage.d2_huisu.equip.length){
                            if(str.length) str+='、';
                            if(player.isUnderControl(true)){
                                str+='装备区：'+get.translation(player.storage.d2_huisu.equip);
                            }
                            else{
                                str+='装备区：'+(player.storage.d2_huisu.equip.length)+'张牌';
                            }
                        }
                        if(player.storage.d2_huisu.judge.length){
                            if(str.length) str+='、';
                            if(player.isUnderControl(true)){
                                str+='判定区：'+get.translation(player.storage.d2_huisu.judge);
                            }
                            else{
                                str+='判定区：'+(player.storage.d2_huisu.judge.length)+'张牌';
                            }
                        }
                        return str;
                    },
                    mark:function(dialog,content,player){
                        dialog.addText('体力：'+player.storage.d2_huisu.hp+'、体力上限：'+player.storage.d2_huisu.maxHp);
                        if(player.storage.d2_huisu.hand.length){
                            if(player.isUnderControl(true)){
                                dialog.add('<div class="text center">手牌区</div>');
                                dialog.addSmall(player.storage.d2_huisu.hand);
                            }
                            else{
                                dialog.add('<div class="text center">手牌区：'+player.storage.d2_huisu.hand.length+'张牌</div>');
                            }
                        }
                        if(player.storage.d2_huisu.equip.length){
                            if(player.isUnderControl(true)){
                                dialog.add('<div class="text center">装备区</div>');
                                dialog.addSmall(player.storage.d2_huisu.equip);
                            }
                            else{
                                dialog.add('<div class="text center">装备区：'+player.storage.d2_huisu.equip.length+'张牌</div>');
                            }
                        }
                        if(player.storage.d2_huisu.judge.length){
                            if(player.isUnderControl(true)){
                                dialog.add('<div class="text center">判定区</div>');
                                dialog.addSmall(player.storage.d2_huisu.judge);
                            }
                            else{
                                dialog.add('<div class="text center">判定区：'+player.storage.d2_huisu.judge.length+'张牌</div>');
                            }
                        }
                    },
                },
                content:function(){
                    game.addVideo('skill',player,'d2_huisu');
                    player.hp=player.storage.d2_huisu.hp;
                    player.maxHp=player.storage.d2_huisu.maxHp;
                    player.update();
                    for(var i=0;i<player.storage.d2_huisu.hand.length;i++){
                        player.storage.d2_huisu.hand[i]=game.createCard(player.storage.d2_huisu.hand[i]);
                    }
                    for(var i=0;i<player.storage.d2_huisu.equip.length;i++){
                        player.storage.d2_huisu.equip[i]=game.createCard(player.storage.d2_huisu.equip[i]);
                    }
                    for(var i=0;i<player.storage.d2_huisu.judge.length;i++){
                        player.storage.d2_huisu.judge[i]=game.createCard(player.storage.d2_huisu.judge[i]);
                    }
                    player.removeEquipTrigger();
                    var cards=player.getCards('hej');
                    for(var i=0;i<cards.length;i++){
                        cards[i].discard();
                    }
                    player.directgain(player.storage.d2_huisu.hand);
                    for(var i=0;i<player.storage.d2_huisu.equip.length;i++){
                        player.$equip(player.storage.d2_huisu.equip[i]);
                    }
                    for(var i=0;i<player.storage.d2_huisu.judge.length;i++){
                        player.addJudge(player.storage.d2_huisu.judge[i]);
                    }
                },
                group:'d2_huisu2'
            },
            "d2_huisu2":{
                trigger:{
                    global:'roundStart'
                },
                forced:true,
                popup:false,
                content:function(){
                    player.storage.d2_huisu={
                        hp:player.hp,
                        maxHp:player.maxHp,
                        hand:player.getCards('h'),
                        equip:player.getCards('e'),
                        judge:player.getCards('j')
                    };
                    player.markSkill('d2_huisu');
                },
            },
            "d2_chaofeng":{
                global:"d2_chaofeng_disable",
                unique:true,
                nopop:true,
                gainnable:true,
                mark:true,
                intro:{
                    content:"锁定技，其他角色若能对你使用【杀】或【决斗】，则只能对你使用之。",
                },
                subSkill:{
                    disable:{
                        mod:{
                            targetEnabled:function (card,player,target){
                                // if(player.hasSkill('d2_chaofeng')) return;
                                if(card.name=='sha'||card.name=='juedou'){
                                    if(target.hasSkill('d2_chaofeng')) return;
                                    if(game.hasPlayer(function(current){
                                        return current.hasSkill('d2_chaofeng')&&player.canUse(card,current);
                                        return player.canUse(card,current)&&current.hasSkill('d2_chaofeng');
                                    })){
                                        return false;
                                    }
                                }
                            },
                        },
                        sub:true,
                    },
                },
            },
            "d2_gongsheng":{
                trigger:{
                    global:"phaseBefore",
                },
                unique:true,
                locked:true,
                onremove:function (player){
                    player.$throw(player.storage.d2_gongsheng_cards,1000);
                    for(var i=0;i<player.storage.d2_gongsheng_cards.length;i++){
                        ui.discardPile.appendChild(player.storage.d2_gongsheng_cards[i]);
                    }
                    game.log(player,'弃置了',player.storage.d2_gongsheng_cards);
                    delete player.storage.d2_gongsheng_cards;
                    delete player.storage.d2_gongsheng_hp;
                    delete player.storage.d2_gongsheng_maxHp;
                },
                check:function (event,player){
                    var num1=0;
                    var num2=0;
                    var hp=player.storage.d2_gongsheng_hp;
                    var cards1=player.storage.d2_gongsheng_cards;
                    var cards2=player.getCards('h');
                    var check=_status.event.player==player;
                    for (var i = 0; i < cards1.length; i++) {
                        num1+=check?get.value(cards1[i]):get.useful(cards1[i]);
                    }
                    for (var i = 0; i < cards2.length; i++) {
                        num2+=check?get.value(cards2[i]):get.useful(cards2[i]);
                    }
                    num1+=2*hp;
                    num2+=2*player.hp;
                    if (num1-num2>0) return true;
                    return false;
                },
                content:function (){
                    var hp=player.storage.d2_gongsheng_hp;
                    var maxHp=player.storage.d2_gongsheng_maxHp;
                    var cards=player.storage.d2_gongsheng_cards;

                    player.storage.d2_gongsheng_hp=player.hp;
                    player.storage.d2_gongsheng_maxHp=player.maxHp;
                    player.storage.d2_gongsheng_cards=player.getCards('h');
                    game.addVideo('storage',player,['cards',get.cardsInfo( player.storage.d2_gongsheng_cards),'cards']);
                    player.lose(player.getCards('h'),ui.special);

                    player.hp=hp;
                    player.maxHp=maxHp;
                    player.gain(cards);
                    player.update();

                    game.broadcastAll(function(player){
                        if(!player._d2_gongsheng_mark) return;
                        if(player._d2_gongsheng_mark.name=='正'){
                            player._d2_gongsheng_mark.name='反';
                            player._d2_gongsheng_mark.firstChild.innerHTML='反';
                            player._d2_gongsheng_mark.info.mark=function(dialog,content,player){
                                if(player==game.me||player.isUnderControl()){
                                    dialog.addText('当前为反面，正面体力：'+player.storage.d2_gongsheng_hp+'，体力上限：'+player.storage.d2_gongsheng_maxHp+'，手牌：');
                                    if(player.storage.d2_gongsheng_cards.length) {
                                        dialog.addSmall(player.storage.d2_gongsheng_cards);
                                    } else {
                                        dialog.addText('无')
                                    }
                                }
                                else{
                                    return '当前为反面，正面体力：'+player.storage.d2_gongsheng_hp+'，体力上限：'+player.storage.d2_gongsheng_maxHp+'，手牌：'+player.storage.d2_gongsheng_cards.length;
                                }
                            };
                        } else {
                            player._d2_gongsheng_mark.name='正';
                            player._d2_gongsheng_mark.firstChild.innerHTML='正';
                            player._d2_gongsheng_mark.info.mark=function(dialog,content,player){
                                if(player==game.me||player.isUnderControl()){
                                    dialog.addText('当前为正面，反面体力：'+player.storage.d2_gongsheng_hp+'，体力上限：'+player.storage.d2_gongsheng_maxHp+'，手牌：');
                                    if(player.storage.d2_gongsheng_cards.length) {
                                        dialog.addSmall(player.storage.d2_gongsheng_cards);
                                    } else {
                                        dialog.addText('无')
                                    }
                                }
                                else{
                                    return '当前为正面，反面体力：'+player.storage.d2_gongsheng_hp+'，体力上限：'+player.storage.d2_gongsheng_maxHp+'，手牌：'+player.storage.d2_gongsheng_cards.length;
                                }
                            };
                        }
                    },player);
                },
                group:["d2_gongsheng2","d2_gongsheng_init"],
            },
            "d2_gongsheng2":{
                trigger:{
                    player:"damageEnd",
                },
                forced:true,
                content:function (){
                    var cards=get.cards(2*trigger.num);
                    player.storage.d2_gongsheng_cards=player.storage.d2_gongsheng_cards.concat(cards);
                    player.$gain2(cards);
                    player.updateMarks();
                    game.delay();
                },
            },
            "d2_gongsheng_init":{
                trigger:{
                    global:"gameStart",
                },
                forced:true,
                popup:false,
                content:function (){
                    player.storage.d2_gongsheng_hp=player.hp;
                    player.storage.d2_gongsheng_maxHp=player.maxHp;
                    var cards=get.cards(4);
                    player.storage.d2_gongsheng_cards=cards;
                    player.$gain2(cards);
                    game.broadcastAll(function(player){
                        player._d2_gongsheng_mark=player.mark('正',{
                            mark:function(dialog,content,player){
                                if(player==game.me||player.isUnderControl()){
                                    dialog.addText('当前为正面，反面体力：'+player.storage.d2_gongsheng_hp+'，体力上限：'+player.storage.d2_gongsheng_maxHp+'，手牌：');
                                    dialog.addSmall(player.storage.d2_gongsheng_cards);
                                }
                                else{
                                    return '当前为正面，反面体力：'+player.storage.d2_gongsheng_hp+'，体力上限：'+player.storage.d2_gongsheng_maxHp+'，手牌：'+player.storage.d2_gongsheng_cards.length;
                                }
                            },
                        });
                    },player);
                    player._d2_gongsheng_mark.skill='共生';
                },
            },
            "d2_aomi":{
                trigger:{
                    player:"phaseBefore",
                },
                unique:true,
                forced:true,
                content:function (){
                    'step 0'
                    var list=get.gainableSkills();
                    var list1=[],list2=[];
                    if(typeof(list)!='object') {
                        game.log('skill list error');
                        event.finish();
                        return;
                    }
                    list.remove(player.getSkills());
                    for (var i = 0; i < list.length; i++) {
                        if(player.storage[list[i]]!=undefined) continue; 
                        if (list[i].indexOf('d2_')>=0) {
                            list1.push(list[i]);
                        } else {
                            list2.push(list[i]);
                        }
                    }
                    list=[];
                    var num=list1.length>1?2:3;
                    if(!player.hasSkill('d2_chongsheng')) list1.push('d2_chongsheng');
                    if(!player.hasSkill('d2_fanzhao')) list1.push('d2_fanzhao');
                    if(list1.length>0) list=list.concat(list1.randomGets(2));
                    if(list2.length>0) list=list.concat(list2.randomGets(num));
                    event.skillai=function(){
                        return get.max(list,get.skillRank,'item');
                    };
                    if(event.isMine()||player.isUnderControl()){
                        var dialog=ui.create.dialog('forcebutton');
                        dialog.add('选择获得一项技能');
                        var clickItem=function(){
                            _status.event._result=this.link;
                            dialog.close();
                            game.resume();
                        };
                        for(var i=0;i<list.length;i++){
                            if(lib.translate[list[i]+'_info']){
                                var translation=get.translation(list[i]);
                                if(translation[0]=='新'&&translation.length==3){
                                    translation=translation.slice(1,3);
                                }
                                else{
                                    translation=translation.slice(0,2);
                                }
                                var item=dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【'+
                                translation+'】</div><div>'+lib.translate[list[i]+'_info']+'</div></div>');
                                item.firstChild.addEventListener('click',clickItem);
                                item.firstChild.link=list[i];
                            }
                        }
                        dialog.add(ui.create.div('.placeholder'));
                        event.switchToAuto=function(){
                            event._result=event.skillai();
                            dialog.close();
                            game.resume();
                        };
                        _status.imchoosing=true;
                        game.pause();
                    }
                    else{
                        event._result=event.skillai();
                    }
                    'step 1'
                    _status.imchoosing=false;
                    var link=result;
                    player.addSkill(link,true);
                    player.popup(link);
                    game.log(player,'获得了技能','【'+get.translation(link)+'】');
                    game.delay();
                },
                ai:{
                    threaten:1.5,
                },
                group:"d2_aomi2",
            },
            "d2_aomi2":{
                trigger:{
                    global:"gameStart",
                },
                forced:true,
                filter:function (event,player){
                    return player.name=='d2_mage';
                },
                content:function (){
                    'step 0'
                    var list=['wei','shu','wu','qun'];
                    player.chooseControl(list).set('prompt','奥秘：选择一个势力').set('ai',function(){
                        var mode=get.mode();
                        var player=_status.event.player;
                        switch(mode){
                            case 'identity':
                                if (player.identity=='zhu'||player.identity=='fan') {
                                    return list.randomGet();
                                }
                                return game.zhu.group;
                            case 'versus':
                            default:return list.randomGet();
                        }
                    });
                    'step 1'
                    if (result.control) {
                        var group=result.control
                        player.group=group;
                        player.popup(group)
                        game.log(get.translation(player)+'的势力为'+get.translation(group));
                    }
                },
            },
            "d2_yongheng":{
                enable:"phaseUse",
                usable:1,
                unique:true,
                filter:function (event,player){
                    return player.hp<player.maxHp;
                },
                content:function (){
                    'step 0'
                    var list=player.getSkills();
                    var skills=[];
                    for(var i=0;i<list.length;i++){
                        if(get.gainableSkills().contains(list[i])||player.getStockSkills().contains(list[i])) {
                            skills.push(list[i]);
                        }
                    }
                    //var skills=player.getStockSkills();
                    skills.remove('d2_yongheng');
                    skills.remove('d2_aomi');
                    if(skills.length==0) skills=player.hasSkill('d2_aomi')?['d2_aomi']:['d2_yongheng'];
                    event.skillai=function(){
                        return get.min(skills,get.skillRank,'item');
                    };
                    if(event.isMine()){
                        var dialog=ui.create.dialog('forcebutton');
                        dialog.add('选择失去一项技能');
                        var clickItem=function(){
                            _status.event._result=this.link;
                            dialog.close();
                            game.resume();
                        };
                        for(var i=0;i<skills.length;i++){
                            if(lib.translate[skills[i]+'_info']){
                                var translation=get.translation(skills[i]);
                                if(translation[0]=='新'&&translation.length==3){
                                    translation=translation.slice(1,3);
                                }
                                else{
                                    translation=translation.slice(0,2);
                                }
                                var item=dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【'+
                                translation+'】</div><div>'+lib.translate[skills[i]+'_info']+'</div></div>');
                                item.firstChild.addEventListener('click',clickItem);
                                item.firstChild.link=skills[i];
                            }
                        }
                        var item=dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【取消】</div><div>不失去技能</div></div>');
                        item.firstChild.addEventListener('click',clickItem);
                        item.firstChild.link='cancel';
                        dialog.add(ui.create.div('.placeholder'));
                        event.switchToAuto=function(){
                            event._result=event.skillai();
                            dialog.close();
                            game.resume();
                        };
                        _status.imchoosing=true;
                        game.pause();
                    }
                    else{
                        event._result=event.skillai();
                    }
                    'step 1'
                    _status.imchoosing=false;
                    var link=result;
                    if(get.translation(link)=='取消') {
                        player.getStat('skill').d2_yongheng=0;
                        event.finish();
                        return;
                    }
                    player.removeSkill(link,true);
                    player.popup(link);
                    game.log(player,'失去了技能','【',link,'】');
                    player.recover();
                    game.delay();
                },
                ai:{
                    order:1,
                    result:{
                        player:function (player,target){
                            var list=player.getSkills();
                            var skills=[];
                            for(var i=0;i<list.length;i++){
                                if(get.gainableSkills().contains(list[i])||player.getStockSkills().contains(list[i])) {
                                    skills.push(list[i]);
                                }
                            }
                            skills.remove('d2_yongheng');
                            skills.remove('d2_aomi');
                            if(player.hp==1) return 1;
                            if(player.hp==2&&skills.length>3) return 1;
                            return 0;
                        },
                    },
                },
            },
            "d2_boss_aomi":{
                trigger:{
                    player:"phaseBefore",
                },
                unique:true,
                forced:true,
                content:function (){
                    'step 0'
                    var list=get.gainableSkills();
                    var list1=[],list2=[];
                    if(typeof(list)!='object') {
                        game.log('skill list error');
                        event.finish();
                        return;
                    }
                    list.remove(player.getSkills());
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].indexOf('d2_')>=0) {
                            list1.push(list[i]);
                        } else {
                            list2.push(list[i]);
                        }
                    }
                    list=[];
                    var num=list1.length>1?2:3;
                    if(!player.hasSkill('d2_chongsheng')) list1.push('d2_chongsheng');
                    if(!player.hasSkill('d2_fanzhao')) list1.push('d2_fanzhao');
                    if(list1.length>0) list=list.concat(list1.randomGets(2));
                    if(list2.length>0) list=list.concat(list2.randomGets(num));
                    event.skillai=function(){
                        return get.max(list,get.skillRank,'item');
                    };
                    if(event.isMine()){
                        var dialog=ui.create.dialog('forcebutton');
                        dialog.add('选择获得一项技能');
                        var clickItem=function(){
                            _status.event._result=this.link;
                            dialog.close();
                            game.resume();
                        };
                        for(var i=0;i<list.length;i++){
                            if(lib.translate[list[i]+'_info']){
                                var translation=get.translation(list[i]);
                                if(translation[0]=='新'&&translation.length==3){
                                    translation=translation.slice(1,3);
                                }
                                else{
                                    translation=translation.slice(0,2);
                                }
                                var item=dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【'+
                                translation+'】</div><div>'+lib.translate[list[i]+'_info']+'</div></div>');
                                item.firstChild.addEventListener('click',clickItem);
                                item.firstChild.link=list[i];
                            }
                        }
                        dialog.add(ui.create.div('.placeholder'));
                        event.switchToAuto=function(){
                            event._result=event.skillai();
                            dialog.close();
                            game.resume();
                        };
                        _status.imchoosing=true;
                        game.pause();
                    }
                    else{
                        event._result=event.skillai();
                    }
                    'step 1'
                    _status.imchoosing=false;
                    var link=result;
                    player.addSkill(link,true);
                    player.popup(link);
                    game.log(player,'获得了技能','【',link,'】');
                    game.delay();
                },
                ai:{
                    threaten:1.5,
                },
                group:["d2_boss_aomi2","d2_boss_aomi3"],
            },
            "d2_boss_aomi2":{
                trigger:{
                    player:"changeHp",
                },
                forced:true,
                filter:function (event,player){
                    var list=player.getSkills();
                    var skills=[];
                    for(var i=0;i<list.length;i++){
                        if(get.gainableSkills().contains(list[i])||player.getStockSkills().contains(list[i])) {
                            skills.push(list[i]);
                        }
                    }
                    return skills.length<=4;
                },
                content:function (){
                    player.addTempSkill('d2_boss_aomi4');
                },
            },
            "d2_boss_aomi3":{
                trigger:{
                    player:"drawBegin",
                },
                forced:true,
                filter:function (event,player){
                    var list=player.getSkills();
                    var skills=[];
                    for(var i=0;i<list.length;i++){
                        if(get.gainableSkills().contains(list[i])||player.getStockSkills().contains(list[i])) {
                            skills.push(list[i]);
                        }
                    }
                    return skills.length<=5;
                },
                content:function (){
                    trigger.num++;
                },
            },
            "d2_boss_aomi4":{
                trigger:{
                    player:"damageBefore",
                },
                mark:true,
                marktext:"秘",
                forced:true,
                content:function (){
                    trigger.cancel();
                },
                ai:{
                    nofire:true,
                    nothunder:true,
                    nodamage:true,
                    effect:{
                        target:function (card,player,target,current){
                            if(get.tag(card,'damage')) return 0;
                        },
                    },
                },
                intro:{
                    content:"防止一切伤害",
                },
            },
            "d2_boss_yongheng":{
                trigger:{
                    player:"dieBefore",
                },
                unique:true,
                forced:true,
                alter:true,
                priority:1,
                content:function (){
                    'step 0'
                    trigger.cancel();
                    player.hp=1;
                    if(player.maxHp<1) player.maxHp=1;
                    player.update();
                    'step 1'
                    var list=player.getSkills();
                    var skills=[];
                    for(var i=0;i<list.length;i++){
                        if(get.gainableSkills().contains(list[i])||player.getStockSkills().contains(list[i])) {
                            skills.push(list[i]);
                        }
                    }
                    skills.remove('d2_boss_yongheng');
                    skills.remove('d2_boss_aomi');
                    if(skills.length==0) skills=player.hasSkill('d2_boss_aomi')?['d2_boss_aomi']:['d2_boss_yongheng'];
                    event.skillai=function(){
                        return get.min(skills,get.skillRank,'item');
                    };
                    if(event.isMine()){
                        var dialog=ui.create.dialog('forcebutton');
                        dialog.add('选择失去一项技能');
                        var clickItem=function(){
                            _status.event._result=this.link;
                            dialog.close();
                            game.resume();
                        };
                        for(var i=0;i<skills.length;i++){
                            if(lib.translate[skills[i]+'_info']){
                                var translation=get.translation(skills[i]);
                                if(translation[0]=='新'&&translation.length==3){
                                    translation=translation.slice(1,3);
                                }
                                else{
                                    translation=translation.slice(0,2);
                                }
                                var item=dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【'+
                                translation+'】</div><div>'+lib.translate[skills[i]+'_info']+'</div></div>');
                                item.firstChild.addEventListener('click',clickItem);
                                item.firstChild.link=skills[i];
                            }
                        }
                        dialog.add(ui.create.div('.placeholder'));
                        event.switchToAuto=function(){
                            event._result=event.skillai();
                            dialog.close();
                            game.resume();
                        };
                        _status.imchoosing=true;
                        game.pause();
                    }
                    else{
                        event._result=event.skillai();
                    }
                    'step 2'
                    _status.imchoosing=false;
                    var link=result;
                    player.removeSkill(link,true);
                    player.popup(link);
                    game.log(player,'失去了技能','【',link,'】');
                    game.delay();
                },
                ai:{
                    threaten:1.5,
                },
                group:"d2_boss_yongheng2",
            },
            "d2_boss_yongheng2":{
                enable:"phaseUse",
                usable:1,
                filter:function (event,player){
                    return player.hp<player.maxHp;
                },
                content:function (){
                    'step 0'
                    var list=player.getSkills();
                    var skills=[];
                    for(var i=0;i<list.length;i++){
                        if(get.gainableSkills().contains(list[i])||player.getStockSkills().contains(list[i])) {
                            skills.push(list[i]);
                        }
                    }
                    skills.remove('d2_boss_yongheng');
                    skills.remove('d2_boss_aomi');
                    if(skills.length==0) skills=player.hasSkill('d2_boss_aomi')?['d2_boss_aomi']:['d2_boss_yongheng'];
                    event.skillai=function(){
                        return get.min(skills,get.skillRank,'item');
                    };
                    if(event.isMine()){
                        var dialog=ui.create.dialog('forcebutton');
                        dialog.add('选择失去一项技能');
                        var clickItem=function(){
                            _status.event._result=this.link;
                            dialog.close();
                            game.resume();
                        };
                        for(var i=0;i<skills.length;i++){
                            if(lib.translate[skills[i]+'_info']){
                                var translation=get.translation(skills[i]);
                                if(translation[0]=='新'&&translation.length==3){
                                    translation=translation.slice(1,3);
                                }
                                else{
                                    translation=translation.slice(0,2);
                                }
                                var item=dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【'+
                                translation+'】</div><div>'+lib.translate[skills[i]+'_info']+'</div></div>');
                                item.firstChild.addEventListener('click',clickItem);
                                item.firstChild.link=skills[i];
                            }
                        }
                        var item=dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【取消】</div><div>不失去技能</div></div>');
                        item.firstChild.addEventListener('click',clickItem);
                        item.firstChild.link='cancel';
                        dialog.add(ui.create.div('.placeholder'));
                        event.switchToAuto=function(){
                            event._result=event.skillai();
                            dialog.close();
                            game.resume();
                        };
                        _status.imchoosing=true;
                        game.pause();
                    }
                    else{
                        event._result=event.skillai();
                    }
                    'step 1'
                    _status.imchoosing=false;
                    var link=result;
                    if(get.translation(link)=='取消') {
                        player.getStat('skill').d2_boss_yongheng2=undefined;
                        event.finish();
                        return;
                    }
                    player.removeSkill(link,true);
                    player.popup(link);
                    game.log(player,'失去了技能','【',link,'】');
                    player.recover();
                    game.delay();
                },
                ai:{
                    result:{
                        player:function (player,target){
                        var list=player.getSkills();
                        var skills=[];
                        for(var i=0;i<list.length;i++){
                            if(get.gainableSkills().contains(list[i])||player.getStockSkills().contains(list[i])) {
                                skills.push(list[i]);
                            }
                        }
                        skills.remove('d2_boss_yongheng');
                        skills.remove('d2_boss_aomi');
                            if(player.hp==1&&skills.length>4) return 1;
                            return 0;
                        },
                    },
                },
            },
            "d2_baiban":{
                gainnable:false,
                trigger:{
                    global:'useCardToBefore',
                },
                // usable:1,
                forced:true,
                filter:function(event,player){
                    return event.card&&(get.type(event.card)=='trick'||get.type(event.card)=='delay');
                },
                content:function(){
                    game.log(player);
                },
                group:'d2_baiban_t',
                subSkill:{
                    t:{
                        mark:true,
                        intro:{
                            content:'123'
                        },
                        init:function(player){
                            player.markSkill('d2_baiban_t')
                        },
                        sub:true,
                    }
                },
            },
        },
        translate:{
            "_d2_firstBlood":"第一滴血",
            "_d2_doubleKill":"双杀",
            "_d2_tripleKill":"三杀",
            "_d2_ultraKill":"疯狂杀戮",
            "_d2_rampage":"暴走",
            "_d2_rune":"神符",
            "d2_rune_damage":"伤害神符",
            "d2_rune_damage_info":"锁定技，你使用【杀】造成的伤害+1。",
            "d2_rune_illusion":"幻象神符",
            "d2_rune_illusion_info":"锁定技，每回合限一次，每当你成为其他角色的牌的目标时取消之并摸一张牌。",
            "d2_rune_arcane":"奥术神符",
            "d2_rune_arcane_info":"锁定技，摸牌阶段摸牌数+2，手牌上限+2。",
            "d2_rune_haste":"极速神符",
            "d2_rune_haste_info":"锁定技，你获得此技能时用随机装备填满你的装备区，失去此技能时你失去以此法获得的牌（均不触发技能）。",
            "d2_rune_regeneration":"回复神符",
            "d2_rune_regeneration_info":"锁定技，准备阶段及结束阶段，你回复一点体力。",
            "d2_rune_invisibility":"隐身神符",
            "d2_rune_invisibility_info":"锁定技，你获得【潜行】。",
            "d2_rune_bounty":"赏金神符",
            "d2_rune_bounty_info":"锁定技，准备阶段，你令任意名角色摸一张牌。",
            "d2_junheng":"均衡",
            "d2_junheng_info":"锁定技，准备阶段，你选择一名角色，若该角色体力值比手牌少，则回复体力直至与手牌相等；若该角色手牌比体力值少，则摸牌直至与体力值相等。",
            "d2_shengdi":"圣地",
            "d2_shengdi2":"圣地",
            "d2_shengdi_info":"出牌阶段限一次，你可以弃置一张锦囊牌并弃置至多3名角色判定区内的牌，这些角色于其下个准备阶段弃置其判定区内的牌。",
            "d2_biyou":"庇佑",
            "d2_biyou_info":"当一名角色进入濒死状态时，你可以失去1点体力上限，令其体力回复至1（奥义：该角色将手牌补至体力上限，最多为5）。",
            "d2_souhun":"搜魂",
            "d2_souhun2":"搜魂",
            "d2_souhun_info":"你每次造成伤害后获得一枚“魂”标记。当你即将造成伤害时，你可以弃置3（奥义：改为2）枚“魂”标记令该伤害+1。",
            "d2_qianren":"千刃",
            "d2_qianren_info":"出牌阶段限一次，你可以展示手牌并弃置其中所有【杀】（至少1张），视为你使用一张【万箭齐发】。",
            "d2_aoshu":"奥术",
            "d2_aoshu2":"奥术",
            "d2_aoshu_info":"你可以跳过你的摸牌阶段。若如此做，回合结束时你摸2张牌然后令至多2名其他角色各摸一张牌。",
            "d2_bingfeng":"冰封",
            "d2_bingfeng2":"冰封禁制",
            "d2_bingfeng_info":"每当一名其他角色对你造成伤害后你可以令其不能打出基本牌直到其下个回合开始。",
            "d2_hanyu":"寒域",
            "d2_hanyu2":"极寒领域",
            "d2_hanyu3":"极寒领域",
            "d2_hanyu_info":"限定技，出牌阶段，你可以弃置至多3名角色一张牌并获得3枚“域”标记（奥义：这些角色不能使用或打出基本牌直到其下个回合结束），且你无法使用手牌直到你失去所有“域”标记。回合结束阶段，若你有“域”标记，则弃置1枚“域”标记并对至多2名角色造成一点伤害。你受到伤害后弃置所有“域”标记。",
            "d2_binghuo_bing":"冰火",
            "d2_binghuo_bing_info":"联动技，觉醒技，准备阶段，你令莉娜随机弃置两张牌。",
            "d2_chuancheng":"传承",
            "d2_chuancheng2":"传承",
            "d2_chuancheng_info":"锁定技，准备阶段，若牌堆或弃牌堆中有【阿哈利姆神杖】，你装备之；当其他角色装备阿哈利姆神杖时你摸一张牌。",
            "d2_ruohua":"弱化",
            "d2_ruohua1":"弱化·1",
            "d2_ruohua2":"弱化·2",
            "d2_ruohua3":"弱化·3",
            "d2_ruohua_info":"出牌阶段限一次，你可以弃置X张手牌，并指定X名其他角色，这些角色随机获得以下效果之一：1.下个回合手牌上限-1；2.下个摸牌阶段少摸一张牌；3.下一次造成的伤害-1。（X至多为3）",
            "d2_tayin":"拓印",
            "d2_tayin2":"拓印",
            "d2_tayin3":"拓印",
            "d2_tayin_info":"出牌阶段限一次（奥义：改为限两次，替换前一次获得的技能），你可以获得一名其他角色的一项技能直到回合结束。",
            "d2_andun":"黯盾",
            "d2_andun2":"无光之盾",
            "d2_andun3":"无光之盾",
            "d2_andun_info":"出牌阶段限一次，你可以弃置一张黑色手牌令一名角色获得可以抵挡1点伤害的无光之盾（若已经有无光之盾，则重新获得），无光之盾消失时该角色可以令你对其距离1以内的一名除该角色外的角色造成1点伤害。",
            "d2_fanzhao":"返照",
            "d2_fanzhao2":"回光返照",
            "d2_fanzhao3":"返照",
            "d2_fanzhao_info":"每五轮限一次，出牌阶段或当你体力值为0时，你可以进入回光返照状态直到你的下个回合结束；在该状态下，你将要减少的体力改为回复等量体力（奥义：回光返照期间你获得【嘲讽】）。",
            "d2_hunduan":"魂断",
            "d2_hunduan_info":"每两轮限一次，出牌阶段，你可以弃置X张手牌与一名其他角色交换体力值（奥义：若该角色体力因此减少其弃置X张牌，否则摸X张牌），X为你与该角色体力值之差。",
            "d2_daoying":"倒影",
            "d2_daoying2":"倒影",
            "d2_daoying_info":"出牌阶段限一次，你可以指定一名装备区内有武器的的其他角色，你获得该武器的效果（若你已装备武器，攻击范围叠加）。",
            "d2_mohua":"魔化",
            "d2_mohua2":"魔化",
            "d2_mohua3":"魔化",
            "d2_mohua4":"魔化",
            "d2_mohua4_sha":"魔杀",
            "d2_mohua4_jiu":"魔酒",
            "d2_mohua_info":"觉醒技，准备阶段，若你使用【杀】造成了4次或更多伤害，你减少一点体力上限并获得以下效果：①出牌阶段出杀次数+1；②你可以将一张基本牌当【酒】或【杀】使用或打出。",
            "d2_qihuan":"祈唤",
            "d2_qihuan_info":"出牌阶段，你可以获得1个元素（冰、雷、火中的一个，不能多于三个）。你每有一个：冰，防御距离+1；雷：手牌上限+1；火，进攻距离+1。出牌阶段限一次，根据元素的不同组合，你可以祈唤出不同的技能。（奥义：祈唤技能时，每有一个：冰，弃置一名角色的一张牌；雷：摸两张牌并弃置两张牌；火，摸一张牌）",
            "d2_qihuan_quas":"<font color='#4169E1'>冰</font>",
            "d2_qihuan_wex":"<font color='#BF3EFF'>雷</font>",
            "d2_qihuan_exort":"<font color='#FFD700'>火</font>",
            "d2_jisulengque":"急速冷却",
            "d2_jisulengque2":"急速冷却",
            "d2_jisulengque3":"急速冷却",
            "d2_jisulengque_info":"每三轮限一次，出牌阶段，将一名角色的手牌置于其武将牌上直到其受到伤害。",
            "d2_youlingmanbu":"幽灵漫步",
            "d2_youlingmanbu2":"幽灵漫步",
            "d2_youlingmanbu_info":"每两轮限一次，出牌阶段，获得潜行直到你的下个回合。",
            "d2_qiangxijufeng":"强袭飓风",
            "d2_qiangxijufeng_info":"每三轮限一次,出牌阶段，令一名角色弃置装备区内所有牌；每以此法弃置两张牌你摸一张牌",
            "d2_diancimaichong":"电磁脉冲",
            "d2_diancimaichong_info":"每三轮限一次,出牌阶段，令一名有手牌的其他角色选择一项：①弃1张牌，然后你摸2张牌；②弃3张牌。",
            "d2_lingdongxunjie":"灵动迅捷",
            "d2_lingdongxunjie2":"灵动迅捷",
            "d2_lingdongxunjie_info":"每三轮限一次,出牌阶段，令一名角色选择随机装备一把武器并摸一张牌，该角色使用的下一张【杀】额外结算一次。",
            "d2_hundunyunshi":"混沌陨石",
            "d2_hundunyunshi2":"混沌陨石",
            "d2_hundunyunshi_info":"每三轮限一次,出牌阶段，令一名角色下一次即将受到伤害时，横置该角色（已横置则弃一张牌）且该伤害变为火属性（已为火属性则伤害+1）。",
            "d2_yangyanchongji":"阳炎冲击",
            "d2_yangyanchongji_info":"每四轮限一次,出牌阶段，将两点火属性伤害随机分配给1~2名敌方角色，若只分配给了1名角色，你流失1点体力。",
            "d2_ronglujingling":"熔炉精灵",
            "d2_ronglujingling_info":"每三轮限一次,出牌阶段，获得两张小火人。需要1冰2火。",
            "d2_hanbingzhiqiang":"寒冰之墙",
            "d2_hanbingzhiqiang2":"寒冰之墙",
            "d2_hanbingzhiqiang_info":"每三轮限一次,出牌阶段，弃置一名角色的一张牌，直到该角色的回合结束，其进攻距离-2且摸牌阶段少摸一张牌。",
            "d2_chaozhenshengbo":"超震声波",
            "d2_chaozhenshengbo2":"超震声波",
            "d2_chaozhenshengbo_info":"每四轮限一次,出牌阶段，令所有敌方角色不能使用【杀】直到其回合结束，然后将3种随机负面效果随机施加给敌方角色。",
            "d2_polong":"破龙",
            "d2_polong_info":"出牌阶段限一次，你可以将一张红色手牌当作【炽羽袭】使用。",
            "d2_chihun":"炽魂",
            "d2_chihun2":"炽魂",
            "d2_chihun_info":"每回合限一次，当你使用一张锦囊牌后，可以视为对一名其他角色使用一张火【杀】。",
            "d2_mieshen":"灭神",
            "d2_mieshen_info":"限定技，出牌阶段，你可以弃置两张红色手牌对一名角色造成2点火属性伤害（奥义：目标失去所有护甲且伤害变为3）。",
            "d2_binghuo_huo":"冰火",
            "d2_binghuo_huo_info":"联动技，觉醒技，准备阶段，你对水晶室女造成1点火属性伤害。",
            "d2_minghuo":"冥火",
            "d2_minghuo2":"冥火",
            "d2_minghuo_info":"出牌阶段限X次，你可以从弃牌堆中随机获得一张能造成火属性伤害的牌。X为你损失的体力值且1≤X≤3。",
            "d2_chongsheng":"重生",
            "d2_chongsheng_info":"每五轮限一次，锁定技，当你即将死亡时防止死亡，将体力回复至最大值，弃置判定区内的牌并将手牌摸至2。",
            "d2_xuming":"续命",
            "d2_xuming2":"续命",
            "d2_xuming3":"续命",
            "d2_xuming4":"续命",
            "d2_xuming_info":"（奥义：当一名角色即将死亡时你可以防止其死亡并将体力回复至1，其体力值不会变化且在回合结束时立即死亡。）",
            "d2_bingjian":"冰箭",
            "d2_bingjian_info":"你的【杀】指定目标后可以令对方随机弃置一张牌。",
            "d2_kuangfeng":"狂风",
            "d2_kuangfeng2":"狂风",
            "d2_kuangfeng_info":"出牌阶段限一次，你可以弃置一张牌令你的防御距离+1。",
            "d2_zhuoyue":"卓越",
            "d2_zhuoyue2":"卓越",
            "d2_zhuoyue3":"卓越",
            "d2_zhuoyue4":"卓越",
            "d2_zhuoyue5":"卓越",
            "d2_zhuoyue_info":"出牌阶段开始时，若从你上个回合结束到现在没有与你距离为1以内的其他角色使用牌指定过你为唯一目标，你获得以下效果：出杀次数+1，手牌上限+1（奥义：【杀】可以额外指定一名目标）。",
            "d2_diyan":"涤焰",
            "d2_diyan2":"涤焰",
            "d2_diyan_info":"出牌阶段限一次，你可以弃置两张牌令一名角色①受到你的一点火属性伤害，②该角色在一名角色的回合结束阶段回复一点体力，持续2回合。若两张牌均为♠或♣（奥义：改为均为黑色）只有①生效，若两张牌均为♥或♦（奥义：改为均为红色）只有②生效。",
            "d2_xunuo":"虚诺",
            "d2_xunuo2":"虚诺",
            "d2_xunuo3":"虚诺",
            "d2_xunuo_info":"每三轮限一次，出牌阶段，你可以令一名角色受到的伤害和回复均延迟至你的下个准备阶段结算，其中回复量翻倍。",
            "d2_juji":"狙击",
            "d2_juji_info":"锁定技，你的攻击范围+2，防御距离+1；你使用杀造成伤害后对方有40％的几率随机弃一张牌。",
            "d2_xiandan":"霰弹",
            "d2_xiandan2":"霰弹",
            "d2_xiandan_info":"出牌阶段限一次，你可以将一张杀及其他X张牌当【杀】使用，该【杀】可以额外指定X个目标且需额外打出X张【闪】才能闪避。",
            "d2_ansha":"暗杀",
            "d2_ansha2":"暗杀",
            "d2_ansha_info":"出牌阶段限一次，你可以弃置一张锦囊牌指定一名其他角色，你于你的下个回合开始阶段对其造成一点伤害。（奥义：改为指定至多3名其他角色，在下个回合视为对这些角色使用一张【杀】）",
            "d2_leiji":"雷击",
            "d2_leiji2":"雷击",
            "d2_leiji_info":"出牌阶段限一次，你可以弃置一张牌令一名其他角色失去技能【潜行】并展示手牌，然后你进行一次判定，若颜色与所弃置的牌相同，你对其造成1点雷属性伤害，否则你摸一张牌。",
            "d2_jingdian":"静电",
            "d2_jingdian_info":"锁定技，你造成一次雷属性伤害后弃置对方一张牌或摸一张牌。",
            "d2_leishen":"雷神",
            "d2_leishen_info":"限定技，出牌阶段开始时，你可以于本回合内将【雷击】的描述改为“出牌阶段每名其他角色限一次，你对该角色造成1点雷属性伤害。”",
            "d2_leiyun":"雷云",
            "d2_leiyun2":"雷云",
            "d2_leiyun_info":"（奥义：出牌阶段限一次，你可以令一名没有雷云标记的其他角色获得一枚雷云标记。拥有雷云标记的角色受到雷属性伤害时伤害+1并失去雷云标记。）",
            "d2_yingbi":"影匕",
            "d2_yingbi_info":"出牌阶段限一次，你可以将一张装备牌当【杀】使用或打出；若该【杀】命中，你摸一张牌，否则弃置对方一张牌。",
            "d2_mohu":"模糊",
            "d2_mohu_info":"锁定技，当你成为【杀】的目标时你有35%（若对方与你的距离大于1则为50%）的几率取消之。",
            "d2_jietuo":"解脱",
            "d2_jietuo_info":"锁定技，当你的【杀】即将造成伤害时有15%（奥义：1%的几率对方立即死亡）的几率伤害+2。",
            "d2_yanling":"焰灵",
            "d2_yanling2":"焰灵",
            "d2_yanling_info":"出牌阶段限一次，你可以失去一点体力令至多四名角色下个出牌阶段出杀次数-1。若你只选择了1/2名角色，则摸2/1张牌。",
            "d2_zhikao":"炙烤",
            "d2_zhikao_info":"出牌阶段限一次，你可以失去一点体力选择两名其他角色，你对前者造成一点火属性伤害，然后令后者回复1点体力。",
            "d2_xinxing":"新星",
            "d2_xinxing_info":"每三轮限一次，你可以变身为凤凰蛋（奥义：你可以选择一名角色，该角色获得技能【恒星】，且在你触发【涅槃】时将体力调整至最大值。若你在凤凰蛋期间死亡，其与你一同死亡。）。在该状态下你的体力上限为2且拥有技能【恒星】【涅槃】。",
            "d2_hengxing":"恒星",
            "d2_hengxing_info":"锁定技，你跳过出牌阶段，且防止你受到非【杀】造成的伤害。",
            "d2_niepan":"涅槃",
            "d2_niepan2":"同生共死",
            "d2_niepan_info":"一名角色的准备阶段，其可以将一张牌置于你的武将牌上称为“行星”，此时若你拥有4个或更多“行星”，你变身为凤凰。",
            "d2_bangji":"棒击",
            "d2_bangji2":"棒击",
            "d2_bangji_info":"锁定技，准备阶段，你可以从场上或弃牌堆中获得【金箍棒】；你使用金箍棒时触发概率为100%。",
            "d2_huanbian":"幻变",
            "d2_huanbian_info":"你可以将基本牌当【杀】或【闪】打出，锦囊牌当【无懈可击】使用。",
            "d2_houwang":"猴王",
            "d2_houwang2":"猴王·A杖",
            "d2_houwang_info":"结束阶段，若你的手牌中没有【猴子猴孙】，你可以获得一张【猴子猴孙】（奥义：准备阶段，你可以获得一张【猴子猴孙】）。",
            "d2_qianggong":"强攻",
            "d2_qianggong_info":"出牌阶段限一次，你可以弃置X张非基本牌，令一名角色从牌堆获得X张【杀】。X至多为3。",
            "d2_juedou":"决斗",
            "d2_juedou_info":"出牌阶段限一次，你可以将一张杀视为【决斗】使用（奥义：本阶段内你获得技能【无双】直到你造成或受到伤害）。",
            "d2_juedou2":"无双",
            "d2_juedou2_info":"本阶段内拥有【无双】直到造成或受到伤害。",
            "d2_yongqi":"勇气",
            "d2_yongqi_2":"勇气",
            "d2_yongqi_3":"勇气",
            "d2_yongqi_4":"勇气",
            "d2_yongqi_info":"锁定技，每当你使用【决斗】造成伤害后获得1枚“勇”标记。若你的“勇”至少为：2，你成为【杀】的目标时有65％几率视为对对方使用一张【杀】，该【杀】命中你回复1点体力；4，你每使用一张【杀】摸一张牌；7，你的【杀】伤害+1。",
            "d2_rougou":"肉钩",
            "d2_rougou2":"肉钩",
            "d2_rougou_info":"出牌阶段限一次（奥义：改为两次），你可以弃置一张牌并选择一名其他角色，若该角色没有手牌或手牌中有与你弃置的牌花色相同的牌，则你与该角色距离为1并选择一项并对其造成1点伤害。",
            "d2_xiuqu":"朽躯",
            "d2_xiuqu2":"朽躯",
            "d2_xiuqu_info":"锁定技，你对距离1以内的角色造成伤害后获得1枚“肉”标记，每3枚“肉”标记为你提供1点体力上限。结束阶段，若你的体力大于已损失体力值，你流失一点体力，然后你可以对距离为1以内的一名其他角色造成1点伤害。",
            "d2_zhijie":"肢解",
            "d2_zhijie_info":"限定技，出牌阶段，你可以令一名角色弃置X张牌，若该角色因此弃置了所有牌，你对其造成一点伤害并回复一点体力。X为你已损失体力值。",
            "d2_aofa":"奥法",
            "d2_aofa_info":"出牌阶段限一次，你可以弃置一张手牌指定一名其他角色，视为你对其使用一张锦囊牌（从3张随机伤害性锦囊中选择）。",
            "d2_miyin":"秘印",
            "d2_miyin2":"秘印",
            "d2_miyin3":"上古封印",
            "d2_miyin_info":"出牌阶段限一次，你可以弃置一张锦囊牌为一名其他角色施加上古封印（成为锦囊牌的目标或使用锦囊牌时弃置一张牌）。你的回合开始时，消除所有上古封印。",
            "d2_shengyao":"圣耀",
            "d2_shengyao_info":"每三轮限一次，出牌阶段，你可以指定一名其他角色，弃置你的手牌并随机获得等量伤害性锦囊牌。直到回合结束，你的锦囊牌只能以该角色为目标，当你造成3点或更多伤害后，为你自己施加上古封印。（奥义：你的【奥法】【秘印】【圣耀】会额外随机选择一名敌方角色）",
            "d2_aihen_ai":"爱恨",
            "d2_aihen_ai_info":"联动技，觉醒技，你死亡时，你将所有牌交给复仇之魂并令其回复1点体力。",
            "d2_zheyu":"折羽",
            "d2_zheyu_info":"每当你失去装备区内的牌后，你可以弃置一名其他角色的装备牌。",
            "d2_yuannu":"怨怒",
            "d2_yuannu_info":"锁定技，出牌阶段开始时，你随机获得【离间】【明策】【密诏】中的一个技能直到此阶段结束（奥义：改为选择获得一个）。",
            "d2_daozhi":"倒置",
            "d2_daozhi2":"倒置",
            "d2_daozhi3":"移形换位",
            "d2_daozhi_info":"每两轮限一次，出牌阶段你可以指定一名角色，你与该角色到其他角色的距离基数互换直到你的下个回合开始。",
            "d2_aihen_hen":"爱恨",
            "d2_aihen_hen_info":"联动技，觉醒技，当你进入濒死状态时，你与天怒法师交换体力值。",
            "d2_canying":"残影",
            "d2_canying2":"残影",
            "d2_canying_info":"出牌阶段，你可以将一张牌置于一名其他角色的武将牌上称为残影。当一名角色使用与其残影牌的花色相同的牌时，弃置该残影牌，该角色随机弃置两张牌或受到你造成的一点雷属性伤害。",
            "d2_woliu":"涡流",
            "d2_woliu2":"涡流",
            "d2_woliu_info":"出牌阶段限一次，你可以与一名距离1以内的角色拼点（奥义：改为与至多三名距离1以内的角色同时拼点），若你赢，对方进攻距离-2直到其回合结束且若对方有残影牌，则触发残影效果。",
            "d2_leiling":"雷灵",
            "d2_leiling2":"雷灵·摸牌",
            "d2_leiling3":"雷灵",
            "d2_leiling4":"雷灵",
            "d2_leiling_info":"①出牌阶段，你可以弃置一张牌令你的进攻和防御距离+1直到下个回合。②你每于回合内失去了X张牌，你可以摸一张牌（X为你该回合内以此法摸牌次数+2）。",
            "d2_huoquan":"火拳",
            "d2_huoquan_info":"出牌阶段限一次，你使用一张【火杀】后，可以视为对攻击范围内另一名其他角色使用一张【火杀】。",
            "d2_huodun":"火盾",
            "d2_huodun2":"火盾",
            "d2_huodun_info":"出牌阶段限一次，你可以弃置一张【火杀】获得烈火罩（当你将受到锦囊牌造成的伤害时，若你有烈火罩，该伤害-1）直到你的下个回合或以此法抵消了2次伤害（奥义：你可以令一名其他角色也获得烈火罩）。",
            "d2_huoling":"火灵",
            "d2_huoling2":"火灵",
            "d2_huoling_info":"出牌阶段，你可以将一张牌置于你的武将牌上称为残焰。当一名其他角色使用牌指定你为目标时，你可以弃置一张残焰牌取消之，并获得一张【火杀】。",
            "d2_jushi":"巨石",
            "d2_jushi_info":"出牌阶段限一次，你可以令两名有残岩且残岩数量不同的角色交换残岩，然后令其中一名角色随机装备一件武器或防具（奥义：改为随机装备一件武器和防具）。",
            "d2_cihua":"磁化",
            "d2_cihua2":"磁化",
            "d2_cihua_info":"每三轮限一次，直到你的下个回合，每当拥有残岩的角色造成伤害后，你摸一张牌（每回合限两次）。",
            "d2_tuling":"土灵",
            "d2_tuling2":"土灵·残岩",
            "d2_tuling_info":"①回合开始阶段，你可以获得若干枚残岩标记，直到场上残岩总数不小于6。②出牌阶段限两次，你可以令一名角色将一个残岩交给另一名角色，并选择1项：失去残岩者摸一张牌，或弃置获得残岩者区域内的一张牌。",
            "d2_shuangren":"双刃",
            "d2_shuangren_info":"你可以流失一点体力（若你的体力值为1，改为弃置两张牌）并摸一张牌，视为使用一张【杀】。",
            "d2_fanji":"反击",
            "d2_fanji_info":"每当一名其他角色对你使用【杀】后，你可以对其使用一张【杀】。",
            "d2_benta":"奔踏",
            "d2_benta_info":"每三轮限一次，你可以选择至多3名角色，这些角色随机装备一件武器并摸一张牌（奥义：这些角色获得一点护甲）。",
            "d2_huangwu":"荒芜",
            "d2_huangwu_info":"当你的【杀】即将造成伤害时，你可以进行一次判定，若结果为♠该伤害+1，若结果为♣你弃置对方一张牌。",
            "d2_zheshe":"折射",
            "d2_zheshe_info":"锁定技，你即将受到伤害时进行一次判定，若结果为♠你防止其中一点伤害，然后你可以对伤害来源造成以此法所防止的伤害，若结果为♣你防止其中一点伤害（奥义：“其中一点”改为“全部”）。",
            "d2_yanshu":"炎术",
            "d2_yanshu_info":"出牌阶段限一次，你可以弃置两张牌令一名其他角色进行一次判定，若结果为红色，你对其造成1点火属性伤害；若结果为偶数，你获得一张随机单体锦囊牌。",
            "d2_jingtong":"精通",
            "d2_jingtong_info":"锁定技，你使用的单体锦囊牌有50%/25%/12.5%的概率额外结算1/2/3次（奥义：概率改为60%/30%/15%）。",
            "d2_tianqiu":"天球",
            "d2_tianqiu_info":"当你的【杀】即将造成伤害时，若对方的手牌数小于X，你可以弃置2（奥义：1）张牌令该【杀】伤害+1；若没有发动伤害+1效果，你摸一张牌（奥义：改为你获得该角色一张手牌）并获得一枚“天球”标记（X为你的手牌数+天球标记）。",
            "d2_jingqi":"精气",
            "d2_jingqi2":"精气",
            "d2_jingqi_info":"锁定技，①你使用一张牌后有40%的概率摸一张牌；②你的手牌上限+1。准备阶段，你可以令至多2名其他角色获得①的效果。",
            "d2_jingqi2_info":"锁定技，你使用一张牌后有40%的概率摸一张牌。",
            "d2_shizhi":"蚀智",
            "d2_shizhi2":"神智之蚀",
            "d2_shizhi_info":"觉醒技，准备阶段，若你的手牌数（加上天球标记）为全场最多且已使用过【天球】的伤害+1效果，你获得以下效果：①准备阶段你获得一枚天球标记；②你使用【杀】指定目标后，若对方的手牌比你多，你弃置其一张牌，否则摸一张牌。",
            "d2_mowang":"魔王",
            "d2_mowang_info":"锁定技，①出牌阶段开始时，其他角色失去所有护甲并获得等量“影”标记；出牌阶段结束时，其他角色失去所有“影”标记并获得等量护甲；②你使用【杀】指定目标时，若对方有“影”标记则失去一枚“影”标记，否则你摸一张牌。",
            "d2_wange":"挽歌",
            "d2_wange_info":"限定技，出牌阶段，你可以展示牌堆顶的X张牌并将它们置于弃牌堆，其中每有一张：♠随机对一名不同的敌方角色造成一点伤害；♣随机弃置一名敌方角色的一张牌；♥回复一点体力；♦摸一张牌（X为你使用【搜魂】获得过的“魂”标记，多余的♠/♥视为♣/♦）。",
            "d2_jiban":"羁绊",
            "d2_jiban2":"羁绊",
            "d2_jiban_info":"准备阶段，你可以连接一名其他角色直到其死亡或更换连接目标。你摸牌/回复体力时连接目标摸一张牌/回复一点体力（奥义：改为摸等量牌/回复等量体力）。",
            "d2_guozai":"过载",
            "d2_guozai2":"过载",
            "d2_guozai_info":"出牌阶段限一次，你可以失去一点体力或弃置一张装备牌，使你下一次受到的伤害-1且出牌阶段出【杀】次数+1直到你的下个准备阶段。若你有连接目标，该角色也获得这些效果。",
            "d2_jianglin":"降临",
            "d2_jianglin2":"降临",
            "d2_jianglin_info":"每两轮限一次，当你或连接目标将受到大于体力值的伤害时，你可以防止之；若如此做，你于下个结束阶段受到该伤害。",
            "d2_suodi":"缩地",
            "d2_suodi_info":"每轮限一次，一名其他角色的回合开始时，你可以获得【潜行】直到该回合结束。你不能连续在同一角色的回合发动此技能。",
            "d2_lianji":'连击',
            "d2_lianji_info":"锁定技，每回合限一次，你的【杀】额外结算一次。",
            "d2_huisu":"回溯",
            "d2_huisu2":"回溯",
            "d2_huisu_info":"每两轮限一次，一名角色的回合开始时，你可以回到上一轮开始时的状态。",
            "d2_chaofeng":"嘲讽",
            "d2_chaofeng_info":"锁定技，其他角色若能对你使用【杀】或【决斗】，则只能对你使用之。",
            "d2_gongsheng":"共生",
            "d2_gongsheng2":"共生",
            "d2_gongsheng_info":"游戏开始时你处于正状态，一名角色的回合开始前，你可以转换到正或反状态。这两种状态拥有独立的体力、体力上限和手牌。在你受到伤害后，你展示牌堆顶的两张牌并加入另一状态的手牌。",
            "d2_aomi":"奥秘",
            "d2_aomi_info":"锁定技，回合开始时你从三个随机亮出的技能中选一个获得之。游戏开始时，你选择一个势力。",
            "d2_yongheng":"永恒",
            "d2_yongheng_info":"出牌阶段限一次，你可以失去一个技能回复一点体力。",
            "d2_boss_aomi":"奥秘",
            "d2_boss_aomi2":"奥秘",
            "d2_boss_aomi3":"奥秘",
            "d2_boss_aomi4":"奥秘",
            "d2_boss_aomi_info":"①锁定技，回合开始时你从三个随机亮出的技能中选一个获得之。②若你的技能数为4或更少，你的体力值发生变化后该回合内你防止一切伤害。③若你的技能数为5或更少，你的摸牌数+1。",
            "d2_boss_yongheng":"永恒",
            "d2_boss_yongheng2":"永恒",
            "d2_boss_yongheng_info":"①锁定技，在你即将死亡时防止死亡，并将其体力回复至1，然后选择一个技能失去之（【永恒】只能在最后失去，【奥秘】次之）。②出牌阶段出牌阶段限一次，你可以失去一个技能回复一点体力。",
            "d2_baiban":"白板",
            "d2_baiban_info":"你是一个超级兵。",
            "d2_summonedUnit":"召唤生物",
        },
    },
    intro:"Dota2的英雄们因为一次意外，打破了次元壁穿越到了三国杀的世界中~",
    author:"Lucilor",
    diskURL:"https://pan.baidu.com/s/1C6kuKNGnYuVOfmvtu19zIw",
    forumURL:"",
    version:"",
},files:{"character":[],"card":[],"skill":[]}}})