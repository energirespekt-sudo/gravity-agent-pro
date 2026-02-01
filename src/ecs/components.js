export class PositionComponent {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
}

export class VelocityComponent {
    constructor(vx, vy) {
        this.vx = vx || 0;
        this.vy = vy || 0;
    }
}

export class WordComponent {
    constructor(word) {
        this.word = word;
        this.originalWord = word;
    }
}

export class RenderComponent {
    constructor(type, chibiFile) {
        this.type = type; // 'normal', 'boss', 'story'
        this.chibiFile = chibiFile;
        this.el = null; // DOM element reference
        this.lane = 0;
    }
}

export class LaneComponent {
    constructor(lane) {
        this.lane = lane;
    }
}
