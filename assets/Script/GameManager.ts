// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
import { BLOCK_SIZE } from './PlayerController';
import PlayerController from './PlayerController';

const { Prefab, instantiate, Label, Vec3, Node } = cc;
const {ccclass, property} = cc._decorator;
enum BlockType{
    BT_NONE,
    BT_STONE,
};
enum GameState{
    GS_INIT,
    GS_PLAYING,
    GS_END,
};
@ccclass
export default class NewClass extends cc.Component {

    @property({type: Prefab})
    boxPrefab: Prefab|null = null;

    @property
    roadLength: number = 50;
    @property
    road: BlockType[] = [];

    @property({ type: Node })
    startMenu: Node | null = null;
    @property({ type: PlayerController })
    playerCtrl: PlayerController | null = null;
    @property({ type: Label })
    stepsLabel: Label | null = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    init() {
        if (this.startMenu) {
            this.startMenu.active = true;
        }
  
        this.generateRoad();
  
        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            // this.playerCtrl.node.setPosition(0,0,0);
            this.playerCtrl.reset();
        }
    }

    start () {
        this.setCurState(GameState.GS_INIT);
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    generateRoad() {

        this.node.removeAllChildren();
  
        this.road = [];
        // startPos
        this.road.push(BlockType.BT_STONE);
  
        for (let i = 1; i < this.roadLength; i++) {
            if (this.road[i - 1] === BlockType.BT_NONE) {
                this.road.push(BlockType.BT_STONE);
            } else {
                this.road.push(Math.floor(Math.random() * 2));
            }
        }
  
        for (let j = 0; j < this.road.length; j++) {
            let block: Node | null = this.spawnBlockByType(this.road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j * BLOCK_SIZE, 0, 0);
            }
        }
    }

    spawnBlockByType(type: BlockType) {
        if (!this.boxPrefab) {
            return null;
        }
  
        let block: Node|null = null;
        switch(type) {
            case BlockType.BT_STONE:
                block = instantiate(this.boxPrefab);
                break;
        }
  
        return block;
    }

    setCurState (value: GameState) {
        switch(value) {
            case GameState.GS_INIT:   
                this.init();         
                break;
            case GameState.GS_PLAYING:   
            console.log(this.startMenu)
                if (this.startMenu) {
                    this.startMenu.active = false;
                }
            
                if (this.stepsLabel) {
                    this.stepsLabel.string = '0';   // 将步数重置为0
                }
            
                setTimeout(() => {      //直接设置active会直接开始监听鼠标事件，做了一下延迟处理
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);        
                break;
            case GameState.GS_END:
                break;
        }
    }

    onStartButtonClicked() {   
        console.log('start') 
        this.setCurState(GameState.GS_PLAYING);
    }
    
    onPlayerJumpEnd(moveIndex: number) {
        console.log('end2');
        
        if (this.stepsLabel) {
            this.stepsLabel.string = '' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
        }
        this.checkResult(moveIndex);
    }

    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength) {
            if (this.road[moveIndex] == BlockType.BT_NONE) {   //跳到了空方块上
                console.log('end3')
                this.setCurState(GameState.GS_INIT)
            }
        } else {    // 跳过了最大长度            
            this.setCurState(GameState.GS_INIT);
        }
    }
    // update (dt) {}
}
