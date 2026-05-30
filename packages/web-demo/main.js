import pixelmatch from 'pixelmatch';

let targetBuffer = null;
let actualBuffer = null;

const targetInput = document.getElementById('target-file');
const actualInput = document.getElementById('actual-file');
const compareBtn = document.getElementById('compare-btn');
const trySampleBtn = document.getElementById('try-sample');
const resultsSection = document.getElementById('results');
const scoreValue = document.getElementById('score-value');
const findingsList = document.getElementById('findings-list');
const targetCanvas = document.getElementById('target-canvas');
const actualCanvas = document.getElementById('actual-canvas');
const diffCanvas = document.getElementById('diff-canvas');

function updateCompareButton() {
  compareBtn.disabled = !(targetBuffer && actualBuffer);
}

async function loadImageData(buffer) {
  const blob = new Blob([buffer], { type: 'image/png' });
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { data: imageData.data, width: canvas.width, height: canvas.height };
}

function drawBufferToCanvas(canvas, buffer) {
  const blob = new Blob([buffer], { type: 'image/png' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

async function loadSample() {
  const [targetRes, actualRes] = await Promise.all([
    fetch('/samples/target.png'),
    fetch('/samples/actual.png'),
  ]);
  targetBuffer = new Uint8Array(await targetRes.arrayBuffer());
  actualBuffer = new Uint8Array(await actualRes.arrayBuffer());
  updateCompareButton();
  await runCompare();
}

async function runCompare() {
  if (!targetBuffer || !actualBuffer) return;

  const target = await loadImageData(targetBuffer);
  const actual = await loadImageData(actualBuffer);

  const width = Math.min(target.width, actual.width);
  const height = Math.min(target.height, actual.height);

  const diffData = new Uint8ClampedArray(width * height * 4);
  const changed = pixelmatch(target.data, actual.data, diffData, width, height, {
    threshold: 0.1,
  });

  const total = width * height;
  const score = 1 - changed / total;

  drawBufferToCanvas(targetCanvas, targetBuffer);
  drawBufferToCanvas(actualCanvas, actualBuffer);

  diffCanvas.width = width;
  diffCanvas.height = height;
  diffCanvas.getContext('2d').putImageData(new ImageData(diffData, width, height), 0, 0);

  scoreValue.textContent = `${(score * 100).toFixed(1)}%`;
  findingsList.innerHTML = '';

  const findings = [];
  if (score < 0.95) {
    findings.push('Visible pixel differences detected between target and actual.');
  }
  if (score < 0.85) {
    findings.push('Layout or color drift may need a repair pass.');
  }
  if (findings.length === 0) {
    findings.push('Screenshots are very close — minor or no differences.');
  }

  for (const text of findings) {
    const li = document.createElement('li');
    li.textContent = text;
    findingsList.appendChild(li);
  }

  resultsSection.classList.remove('hidden');
}

targetInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (file) {
    targetBuffer = new Uint8Array(await file.arrayBuffer());
    updateCompareButton();
  }
});

actualInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (file) {
    actualBuffer = new Uint8Array(await file.arrayBuffer());
    updateCompareButton();
  }
});

compareBtn.addEventListener('click', () => runCompare());
trySampleBtn.addEventListener('click', () => loadSample());
