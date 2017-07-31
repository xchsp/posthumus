import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Canvas from './canvas'
import levelData from '../../assets/levels/map.json'
import { select as d3Select, mouse as d3Mouse, touches as d3Touches, event as d3Event } from 'd3'
import { requireAll } from '../lib/utils'
import { updateMousePos, updateKeyPressed } from '../actions'
import { Camera, Player, Elements, World, Renderer } from '../models'

const allImages = require.context('../../assets/images', true, /.*\.png/)
const images = requireAll(allImages).reduce(
    (state, image) => ({
        ...state, [image.split('/')[2].split('-')[0]]: image
    }), {}
)

const propTypes = {
    startTicker: PropTypes.func.isRequired,
    ticker: PropTypes.object.isRequired,
    input: PropTypes.object.isRequired,
    viewport: PropTypes.object,
    dispatch: PropTypes.func
}

export default class Game extends Component {
    constructor (props) {
        super(props)
        this.camera = null
        this.elements = null
        this.renderer = null
        this.player = null
        this.world = null
        this.assets = {}
        this.wrapper = null
        this.then = performance.now()
        this.viewport = props.viewport
        this.ticker = props.ticker
        this.particlesExplosion = this.particlesExplosion.bind(this)
        this.playSound = this.playSound.bind(this)
    }

    componentDidMount () {
        const dom = d3Select(document)
        const svg = d3Select(this.wrapper)
        /* todo: images preloader */
        Object.keys(images).map((key) => {
            this.assets[key] = new Image()
            this.assets[key].src = images[key]
        })

        this.world = new World(levelData)
        this.camera = new Camera(this)
        this.renderer = new Renderer(this)
        this.player = new Player(this.world.getPlayer(), this)
        this.elements = new Elements(this.world.getObjects(), this)
        this.camera.center()

        svg.on('mousedown', () => this.updateMousePos())
        svg.on('touchstart', () => this.updateTouchPos())
        dom.on('keydown', () => this.onKey(d3Event.key, true))
        dom.on('keyup', () => this.onKey(d3Event.key, false))

        this.ctx = this.canvas.context
        this.props.startTicker()
    }

    componentWillReceiveProps (nextProps) {
        this.ticker = nextProps.ticker
        this.input = nextProps.input.keyPressed
        this.viewport = nextProps.viewport

        const { interval } = this.ticker
        const now = performance.now()
        const delta = now - this.then

        // obey 60 fps limit
        if (delta > interval) {
            this.elements.update()
            this.camera.update()
            this.player.update()
            this.then = now - (delta % interval)
        }
    }

    componentDidUpdate () {
        if (this.ctx) {
            this.renderer.draw()
        }
    }

    render () {
        const { width, height } = this.props.viewport

        return (
            <div ref={(ref) => { this.wrapper = ref }}>
                <Canvas ref={(ref) => { this.canvas = ref }} {...{width, height}} />
            </div>
        )
    }

    onKey (key, pressed) {
        const { dispatch } = this.props
        switch (key) {
        case 'ArrowLeft':
            dispatch(updateKeyPressed('left', pressed))
            break
        case 'ArrowRight':
            dispatch(updateKeyPressed('right', pressed))
            break
        case 'ArrowDown':
            dispatch(updateKeyPressed('down', pressed))
            break
        case 'ArrowUp':
            dispatch(updateKeyPressed('up', pressed))
            break
        }
    }

    particlesExplosion (x, y) {
        const particle_count = 10 + parseInt(Math.random() * 5)
        this.camera.shake()
        for (let i = 0; i < particle_count; i++) {
            const r = (1 + Math.random())
            this.elements.add({
                x: x,
                y: y,
                width: r,
                height: r,
                type: 'particle',
                properties: {color: `rgb(${parseInt(128 + ((Math.random() * 32) * 4))}, 0, 0)`}
            })
        }
    }

    getRelativePointerPosition (pos) {
        const [x, y] = pos
        const { scale } = this.props.viewport
        return [
            (x / scale) - this.camera.x,
            (y / scale) - this.camera.y
        ]
    }

    updateMousePos () {
        const { dispatch } = this.props
        const [x, y] = this.getRelativePointerPosition(d3Mouse(this.wrapper))
        this.particlesExplosion(x, y)
        dispatch(updateMousePos(x, y))
    }

    updateTouchPos () {
        const { dispatch } = this.props
        const [x, y] = this.getRelativePointerPosition(d3Touches(this.wrapper)[0])
        dispatch(updateMousePos(x, y))
    }

    playSound (sound) {
        const { dispatch } = this.props
        dispatch(sound())
    }
}

Game.propTypes = propTypes
