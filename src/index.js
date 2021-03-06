import './styles.css'
import { VideoSystem, setClasses } from './video-system'
import * as _ from 'lodash'

import { init } from 'echarts'
let videoSystem = new VideoSystem('#app video')

let chartElement = document.getElementById('echart')
let chart = init(chartElement)
console.log('chart', chart)
let options = {
  animation: false,
  xAxis: {},
  yAxis: {},
  series: []
}
window.chart = chart
chart.setOption(options)
videoSystem.on('timeupdate', event => {
  setClasses(videoSystem)
  let series = event.detail.drifts.map((drift, i) => {
    let data = _.get(options.series, [i, 'data'], [])
    data.push([data.length, drift])
    return {
      type: 'line',
      data: data
    }
  })
  options.series = series

  chart.setOption({ series: series })
  // Store measurment info.
})

let sliderSpeed = document.getElementById('speed-slider')
let valueSpeed = document.getElementById('speed-value')
sliderSpeed.addEventListener('input', e => {
  valueSpeed.innerText = parseFloat(e.target.value).toFixed(1) + 'x'
  videoSystem.setSpeed(e.target.value)
})

let sliderMaxDrift = document.getElementById('max-drift-slider')
let valueMaxDrift = document.getElementById('max-drift-value')
sliderMaxDrift.addEventListener('input', e => {
  videoSystem.maxDrift = e.target.value
  valueMaxDrift.innerText = e.target.value + ' sec'
})

let sliderFrame = document.getElementById('frame-slider')
let valueFrame = document.getElementById('frame-value')
videoSystem.onTimeChange(t => {
  let frame = Math.floor(t * videoSystem.fps + 1)
  valueFrame.innerText = frame
  sliderFrame.value = frame
})

let onCurrentFrameSlide = _.throttle(function(e) {
  videoSystem.setFrame(e.target.value)
  valueFrame.innerText = e.target.value
}, 150)

sliderFrame.addEventListener('input', e => onCurrentFrameSlide(e))

let app = document.getElementById('app')
let debugCheckbox = document.getElementById('debug-checkbox')
debugCheckbox.addEventListener('change', evt => {
  if (evt.target.checked) {
    app.classList.add('debug')
  } else {
    app.classList.remove('debug')
  }
})

let playCheckbox = document.getElementById('play-checkbox')
playCheckbox.addEventListener('change', evt => {
  if (evt.target.checked) {
    videoSystem.play()
  } else {
    videoSystem.pause()
  }
})

videoSystem.setSpeed(sliderSpeed.value)

videoSystem.play()
// videoSystem.syncLoop()
setTimeout(() => videoSystem.sync(), 500)
// setTimeout(() => videoSystem.sync(), 1000)
// setTimeout(() => videoSystem.sync(), 2000)
// setTimeout(() => videoSystem.sync(), 3000)

videoSystem.syncLoop()
app.classList.remove('debug')

// setTimeout(() => console.log(videoSystem.drifts), 3000)
// setTimeout(() => console.log(videoSystem.drifts), 8000)

document.body.onkeyup = function(e) {
  if (e.keyCode === 32) {
    if (playCheckbox.checked) {
      playCheckbox.checked = false
      videoSystem.pause()
    } else {
      playCheckbox.checked = true
      videoSystem.play()
    }
  }
}
