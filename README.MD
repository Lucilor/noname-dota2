# Dota2无名杀拓展

## 拓展介绍

Dota2的英雄们因为一次意外，打破了次元壁穿越到了三国杀的世界中~  
**阿哈利姆神杖**：拥有神杖的英雄将领悟技能的奥义，技能描述中（奥义：...）的字段仅在装备神杖时生效。  
**联动技**：某些角色之间的联动，只有联动角色在场上且都是主武将时才会生效。  
**占卜**：一名角色拥有占卜+X时，该角色在其准备阶段和结束阶段观看牌堆顶的X张牌且可以用手牌替换这些牌（没有手牌则改为摸一张牌）。  
**速度**：速度初始值为1，上下限分别为5和0。改变速度有两种方式：①增减（如速度+1）：在原速度的基础上增加或减少（不能超过上下限），多个同类效果同时生效。②设定（如速度变为-1）：将速度设定为某个值（可以超过上下限），此时所有增减运算均不生效，多个同类效果只有数值最小的生效。  
**速度效果（X=当前速度-速度上限）**：≤-1 不能使用或打出基本牌  
									≤0 进攻和防御距离-1  
                          			≥2 手牌上限+1  
                          			≥3 占卜+2  
                          			≥4 使用牌无距离限制  
                          			≥5 准备阶段，若你的判定区内有牌，随机弃置其中一张，否则摸一张牌  
                          			≥6 使用一张牌后有X\*20%的概率摸一张牌（每回合限3次）  
                          			≥7 回合结束时有X\*15%的概率进行一个额外的回合（不重复触发）  
**神符**：新的一轮开始时，神符将随机（速度越大，概率越大）刷新在一名角色（A）身上，其他角色可依次与A拼点（拼点牌无需弃置），其中点数最大者获得神符。神符将在新的一轮开始时消失。发生以下情况时A直接获得神符：①A没有手牌；②没有角色与A拼点；③拼点点数最大者不止一名角色。

## 使用方法

在游戏中导入*Dota2.zip*，并在游戏中更新。   
若你采用自动手动下载的方式，将*素材.zip*解压到扩展目录。  

## 其他

欢迎提供技能创意，帮助我早日实现Dota2中的所有英雄及物品！

## 特别鸣谢

感谢以下小伙伴提供的帮助：  
[@v505985755](http://tieba.baidu.com/home/main?un=v505985755&ie=utf-8&fr=pb&red_tag=i1380362953) [dota杀拓展](https://tieba.baidu.com/p/5438971304)的作者  
[@荒w城余笙](http://tieba.baidu.com/home/main?un=%E8%8D%92w%E5%9F%8E%E4%BD%99%E7%AC%99&ie=utf-8&fr=pb&red_tag=m1741443292) 测试君  
[@小月纸](http://tieba.baidu.com/home/main?un=%E8%A5%BF%E8%BE%9E%E9%9B%A8%E5%AE%89&ie=utf-8&fr=pb&red_tag=s1116808254) 首席设计师