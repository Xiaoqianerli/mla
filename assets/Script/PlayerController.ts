// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
const { Animation } = cc;
const {ccclass, property } = cc._decorator;
export const BLOCK_SIZE = 40;

@ccclass
export default class PlayerController extends cc.Component {
    @property(Animation)
    BodyAnim:Animation = null;
    @property
    startJump: boolean = false; //是否开始跳
    @property
    jumpStep: number = 0; //跳跃步骤
    @property
    curJumpTime: number = 0; //开始跳跃时间
    @property
    jumpTime: number = 0.1; //用于记录整个跳跃的时长
    @property
    curJumpSpeed: number = 0; //跳跃速度
    @property
    curPos: Vec3 = new cc.Vec3();//记录和计算角色的当前位置
    @property
    deltaPos: Vec3 = new cc.Vec3(0,0,0); //位移
    @property
    targetPos: Vec3 = new cc.Vec3(); //目标位置，最终的落点
    @property
    curMoveIndex: number = 0;
    // onLoad () {}

    start () {
        // console.log(this.node)
        // this.node.parent.on('mouseup', this.onMouseUp, this);
    }

    update (deltaTime) {
        if (this.startJump) {
            this.curJumpTime += deltaTime; // 累计总的跳跃时间
            if (this.curJumpTime > this.jumpTime) { // 当跳跃时间是否结束
                // end 
                this.node.setPosition(this.targetPos); // 强制位置到终点
                this.startJump = false;               // 清理跳跃标记
                this.onOnceJumpEnd();  
                console.log('end')
            } else {
                console.log('hhh')
                // tween
                this.node.getPosition(this.curPos); 
                this.deltaPos.x = this.curJumpSpeed * deltaTime; //每一帧根据速度和时间计算位移
                cc.Vec3.add(this.curPos, this.curPos, this.deltaPos); // 应用这个位移
                this.node.setPosition(this.curPos); // 将位移设置给角色
            }
        }
    }

    jumpByStep(step) {
        if (this.startJump) {
            return;
        }
        this.startJump = true;  // 标记开始跳跃
        this.jumpStep = step; // 跳跃的步数 1 或者 2
        this.curJumpTime = 0; // 重置开始跳跃的时间

        const clipName = step == 1 ? 'oneStep' : 'twoStep';
        const state = this.BodyAnim.getAnimationState(clipName);
        this.jumpTime = state.duration;

        this.curJumpSpeed = this.jumpStep * BLOCK_SIZE/ this.jumpTime; // 根据时间计算出速度
        this.node.getPosition(this.curPos); // 获取角色当前的位置
        cc.Vec3.add(this.targetPos, this.curPos, new cc.Vec3(this.jumpStep * BLOCK_SIZE, 0, 0));    // 计算出目标位置

        if (this.BodyAnim) {
            if (step === 1) {
                this.BodyAnim.play('oneStep');
            } else if (step === 2) {
                this.BodyAnim.play('twoStep');
            }
        }

        this.curMoveIndex += step;
    }

    onMouseUp(event) {
        console.log(event)
        if (event.getButton() === 0) {
            this.jumpByStep(1);
        } else if (event.getButton() === 2) {
            this.jumpByStep(2);
        }
    }
    setInputActive(active: boolean) {
        if (active) {
            this.node.parent.on('mouseup', this.onMouseUp, this);
        } else {
            this.node.parent.off('mouseup', this.onMouseUp, this);
        }
    }
   
    reset() {
        this.curMoveIndex = 0;
    }

    onOnceJumpEnd() {
        this.node.emit('JumpEnd', this.curMoveIndex);
    }
}
