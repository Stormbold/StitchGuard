import pixelmatch from 'pixelmatch';
import { analyzeComparison, buildReportMd, buildCodexPrompt } from './prompt-engine.js';

let targetBuffer = null;
let actualBuffer = null;
let lastPrompt = '';
let lastReport = '';

const targetInput = document.getElementById('target-file');
const actualInput = document.getElementById('actual-file');
const compareBtn = document.getElementById('compare-btn');
const trySampleBtn = document.getElementById('try-sample');
const resultsSection = document.getElementById('results');
const scoreValue = document.getElementById('score-value');
const scoreBadge = document.getElementById('score-badge');
const findingsList = document.getElementById('findings-list');
const targetCanvas = document.getElementById('target-canvas');
const actualCanvas = document.getElementById('actual-canvas');
const diffCanvas = document.getElementById('diff-canvas');
const promptPreview = document.getElementById('prompt-preview');
const copyPromptBtn = document.getElementById('copy-prompt-btn');
const downloadPromptBtn = document.getElementById('download-prompt-btn');
const downloadReportBtn = document.getElementById('download-report-btn');
const downloadDiffBtn = document.getElementById('download-diff-btn');

function updateCompareButton() {
  compareBtn.disabled = !(targetBuffer && actualBuffer);
}

function scoreBadgeLabel(score) {
  if (score >= 0.9) return { text: 'Very close', className: 'good' };
  if (score >= 0.85) return { text: 'Minor fixes', className: 'good' };
  if (score >= 0.7) return { text: 'Needs work', className: 'warn' };
  return { text: 'Major mismatch', className: 'bad' };
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

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function renderResults(score, findings, prompt, report) {
  lastPrompt = prompt;
  lastReport = report;

  scoreValue.textContent = `${(score * 100).toFixed(1)}%`;
  const badge = scoreBadgeLabel(score);
  scoreBadge.textContent = badge.text;
  scoreBadge.className = `score-badge ${badge.className}`;

  findingsList.innerHTML = '';
  for (const finding of findings) {
    const li = document.createElement('li');
    li.textContent = finding.message;
    findingsList.appendChild(li);
  }

  promptPreview.textContent = prompt;
  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadSample() {
  const base = import.meta.env.BASE_URL;
  const [targetRes, actualRes] = await Promise.all([
    fetch(`${base}samples/target.png`),
    fetch(`${base}samples/actual.png`),
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

  const { findings, directions } = analyzeComparison({
    target,
    actual,
    diffData,
    width,
    height,
    score,
  });

  const report = buildReportMd(score, findings);
  const prompt = buildCodexPrompt(score, findings, directions);

  renderResults(score, findings, prompt, report);
}

copyPromptBtn.addEventListener('click', async () => {
  if (!lastPrompt) return;
  await navigator.clipboard.writeText(lastPrompt);
  copyPromptBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyPromptBtn.textContent = 'Copy codex-fix-prompt.md';
  }, 1500);
});

downloadPromptBtn.addEventListener('click', () => {
  if (!lastPrompt) return;
  downloadBlob('codex-fix-prompt.md', new Blob([lastPrompt], { type: 'text/markdown' }));
});

downloadReportBtn.addEventListener('click', () => {
  if (!lastReport) return;
  downloadBlob('report.md', new Blob([lastReport], { type: 'text/markdown' }));
});

downloadDiffBtn.addEventListener('click', () => {
  diffCanvas.toBlob((blob) => {
    if (blob) downloadBlob('diff.png', blob);
  }, 'image/png');
});

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
