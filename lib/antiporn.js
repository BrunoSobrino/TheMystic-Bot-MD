/*import * as tf from '@tensorflow/tfjs'
import * as nsfwjs from 'nsfwjs'
import { getVideoDurationInSeconds } from 'get-video-duration'
import extractFrames from 'ffmpeg-extract-frames'
import * as fs from 'fs'
import * as tf from '@tensorflow/tfjs-node'
tf.enableProdMode()
const nsfwm = await nsfwjs.load()


var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

var token = function() {
    return rand() + rand(); // to make it longer
};

function toArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

export function isPorn(mediac) {
    return new Promise(async (resolve, reject) => {
        try {
            const model = nsfwm
            //let nsim = toArrayBuffer(mediac)
            //console.png(mediac);
            const image = await tf.node.decodeImage(mediac,3)
            const predictions = await model.classify(image)
            image.dispose()
            if (predictions[0].className == 'Hentai' && predictions[0].probability > 0.40) {
                resolve({
                    status: true,
                    message: 'Hentai'
                })    
            } else
            if (predictions[0].className == 'Porn' && predictions[0].probability > 0.40) {
                resolve({
                    status: true,
                    message: "Porn"
                })

            } else resolve({
                status: false,
                message: "Safe"
            })


            
        } catch (e) {
            reject(e)
        }
    })
}

export function isPornVid(video) {
    return new Promise(async (resolve, reject) => {
        getVideoDurationInSeconds(video).then(async (duration) => {

            let randomp = token(5)
            let forch = []
            
            if (duration >= 15) {
                await extractFrames({
                    input: video,
                    output: './' + randomp + '-%i.jpg',
                    offsets: [
                      1000,
                      2000,
                      5000,
                      1000,
                      1500,
                    ]
                  })
                  forch.push('./' + randomp + '-1.jpg')
                    forch.push('./' + randomp + '-2.jpg')
                    forch.push('./' + randomp + '-3.jpg')
                    forch.push('./' + randomp + '-4.jpg')
                    forch.push('./' + randomp + '-5.jpg')


            } else {
                await extractFrames({
                    input: video,
                    output: './' + randomp + '-%i.jpg',
                    offsets: [
                        1000,
                        2000,
                        3000,
                    ]})
                    forch.push('./' + randomp + '-1.jpg')
                    forch.push('./' + randomp + '-2.jpg')
                    forch.push('./' + randomp + '-3.jpg')
            } 
            await extractFrames({
                input: rsd,
                output: './screenshot-%i.jpg',
                offsets: [
                  1000,
                  2000,
                  3500
                ]
              })
                .then(function (frameData) {
                    
                })
            let nsfw = [{nsfwframes : [], sfwframes : []}]
            for (let i = 0; i < forch.length; i++) {
                let mediac = await fs.readFileSync(forch[i])
                let nsim = toArrayBuffer(mediac)
                //console.png(mediac);
                const image = await tf.node.decodeImage(mediac,3)
                const predictions = await nsfwm.classify(image)
                image.dispose() // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
                console.log(predictions)
                nsfw.push(predictions)
                if (predictions[0].className == "Neutral" || predictions[0].className == "Drawing" || predictions[0].className == "Sexy") {
                    nsfw[0].sfwframes.push(predictions[0].className)
                } else {
                    nsfw[0].nsfwframes.push(predictions[0].className)
                }
                if (i == forch.length - 1) {
                    if (nsfw[0].nsfwframes.length >= 2 && forch.length == 3) {
                        resolve({
                            status: true,
                            message: 'NSFW'
                        })
                    } else if (nsfw[0].nsfwframes.length >= 3 && forch.length == 5) {
                        resolve({
                            status: true,
                            message: 'NSFW'
                        })
                    } 
                    
                    //await reply(JSON.stringify(nsfw, null, 2))
            }
            }
        })
    })
}*/

