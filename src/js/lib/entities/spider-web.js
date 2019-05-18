import ActiveElement from '../models/active-element'
import { ENTITIES_TYPE } from '../constants'

export default class SpiderWeb extends ActiveElement {
    constructor (obj, game) {
        super(obj, game)
        this.width = 32
        this.height = 48
    }

    collide (element) {
        const { player, startTimeout } = this.game
        if (element.type === ENTITIES_TYPE.PLAYER) {
            if (!this.activated) {
                this.activated = true
                player.freeze(2000)
                startTimeout(`spider-web-${this.id}-active`, 2000, () => {
                    this.kill()
                })
            }
            this.x = player.x
            this.y = player.y
        }
    }
}
