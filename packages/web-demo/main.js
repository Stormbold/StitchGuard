import pixelmatch from 'pixelmatch';

let targetBuffer = null;
let actualBuffer = null;
let lastPrompt = '';
let lastReport = '';
let isSampleMode = false;

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

function buildFindings(score) {
  const findings = [];
  if (score < 0.95) {
    findings.push('Visible pixel differences detected between target and actual.');
  }
  if (score < 0.92) {
    findings.push('Upper-content region may differ — check hero spacing, card padding, or header alignment.');
  }
  if (score < 0.85) {
    findings.push('Layout or color drift likely needs a conservative repair pass.');
  }
  if (score < 0.7) {
    findings.push('Major layout mismatch — review structure before fine-tuning styles.');
  }
  if (findings.length === 0) {
    findings.push('Screenshots are very close — minor or no differences detected.');
  }
  return findings;
}

function buildReportMd(score, findings) {
  const pct = (score * 100).toFixed(1);
  return `# StitchGuard Report

Visual Match: ${pct}%
Status: ${score >= 0.85 ? 'Acceptable' : 'Needs work'}

## Main Findings

${findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## Next step

Copy \`codex-fix-prompt.md\` into your coding agent for a conservative visual fix.
`;
}

function buildPrompt(score, findings) {
  const pct = (score * 100).toFixed(1);
  return `# Codex Visual Repair Task

You are working on an existing frontend implementation.

Your task is to make the current UI match the target screenshot more closely.

## Important Rules

- Do not rewrite the whole app.
- Do not change copy/text content unless explicitly needed.
- Do not add new features or change routing.
- Focus only on visual fidelity — spacing, colors, radius, typography, safe-area.
- Prefer small, targeted changes.

## StitchGuard Findings

Visual Match: ${pct}%

Main differences:
${findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## Suggested Fix Direction

- Check hero/header spacing first.
- Compare card padding and border radius.
- Align primary color tokens with the target.
- Review bottom safe-area and navigation padding.
- Re-run StitchGuard after changes.

## Expected Result

The implementation should visually match the target screenshot more closely without introducing unrelated changes.
`;
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
  for (const text of findings) {
    const li = document.createElement('li');
    li.textContent = text;
    findingsList.appendChild(li);
  }

  promptPreview.textContent = prompt;
  resultsSection.classList.remove('hidden');
}

async function loadSample() {
  const base = import.meta.env.BASE_URL;
  isSampleMode = true;
  const [targetRes, actualRes, promptRes] = await Promise.all([
    fetch(`${base}samples/target.png`),
    fetch(`${base}samples/actual.png`),
    fetch(`${base}samples/codex-fix-prompt.md`),
  ]);
  targetBuffer = new Uint8Array(await targetRes.arrayBuffer());
  actualBuffer = new Uint8Array(await actualRes.arrayBuffer());
  const samplePrompt = await promptRes.text();
  updateCompareButton();
  await runCompare(samplePrompt);
}

async function runCompare(samplePromptOverride) {
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

  const findings = buildFindings(score);
  const report = buildReportMd(score, findings);
  const prompt =
    isSampleMode && samplePromptOverride ? samplePromptOverride : buildPrompt(score, findings);

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
    isSampleMode = false;
    targetBuffer = new Uint8Array(await file.arrayBuffer());
    updateCompareButton();
  }
});

actualInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (file) {
    isSampleMode = false;
    actualBuffer = new Uint8Array(await file.arrayBuffer());
    updateCompareButton();
  }
});

compareBtn.addEventListener('click', () => runCompare());
trySampleBtn.addEventListener('click', () => loadSample());
