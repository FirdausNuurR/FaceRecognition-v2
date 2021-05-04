const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  document.body.append('Models Loaded')
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
  console.log('Jalan ga ya?')
  faceRecognize()
  
}

async function faceRecognize() {
  // const container = document.createElement('div')
  // container.style.position = 'relative'
  // document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  console.log(labeledFaceDescriptors)
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    video.addEventListener('play', () => {
      const canvas = faceapi.createCanvasFromMedia(video)
      document.body.append(canvas)
      const displaySize = { width: video.width, height: video.height }
      faceapi.matchDimensions(canvas, displaySize)
      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()

        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

        const results = resizedDetections.map((d) => {
            return faceMatcher.findBestMatch(d.descriptor)
        })
        results.forEach( (result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvas)
        })
    }, 100)
    })
}


function loadLabeledImages() {
  const labels = ['Ahmad','Alam', 'Alex', 'Alfa', 'Alifia', 'Anisa', 'Anisya', 'April', 'Bagas', 'Black Widow', 'Captain America', 
                  'Captain Marvel', 'Clarisa', 'Daus', 'Deva', 'Dinul', 'Elza', 'Fania', 'Haifha', 'Hawkeye', 'Hilal', 'Ira', 'Iron Man',
                  'Jim Rhodes', 'Kiki', 'Kymam', 'Nadine', 'Natasya', 'Nazhifa', 'Nisa', 'Nita', 'Putri', 'Rini', 'Riyanti', 'Seiril',
                  'Sepia', 'Shafira', 'Thor', 'Tony Stark', 'Wiman', 'Zulfikar']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}