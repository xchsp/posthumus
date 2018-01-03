import Entity from '../entity'

export default class Spikes extends Entity {
    constructor (obj, game) {
        super(obj, game)
        this.damage = 1000
        this.canAnimate = true
        this.shineDelay = 2000
        this.shineTimeout = null
        this.shineX = 0
        this.animation = {x: 0, y: 0, w: 8, h: 8, frames: 5, fps: 30, loop: false}
    }

    draw (ctx) {
        const { assets, camera } = this._game
        ctx.drawImage(assets.shine,
            this.animation.x + this.animFrame * this.animation.w, this.animation.y,
            this.animation.w, this.animation.h,
            this.x + this.shineX + camera.x, this.y + camera.y - 2,
            this.animation.w, this.animation.h
        )
    }

    update () {
        if (this.onScreen()) {
            if (this.canAnimate && this.animFrame >= 4) {
                this.canAnimate = false
                this.shineTimeout = setTimeout(() => {
                    this.canAnimate = true
                    this.animFrame = 0
                    this.shineX = 8 * Math.round(Math.random() * (this.width / 8))
                }, this.shineDelay)
            }
            this.animate()
        }
    }
}