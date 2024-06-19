const context = new (window.AudioContext || window.webkitAudioContext)();
let loops = {};
let isPlaying = false;
let meterInterval;

document.querySelector('#play').addEventListener('click', () => {
    if (!isPlaying) {
        Object.values(loops).forEach(loop => loop.start(0, context.currentTime % loop.buffer.duration));
        isPlaying = true;
        toggleControls();
        showMeter();
    }
});

document.querySelector('#stop').addEventListener('click', () => {
    if (isPlaying) {
        Object.values(loops).forEach(loop => loop.stop(0));
        isPlaying = false;
        toggleControls();
        hideMeter();
    }
});

document.querySelectorAll('.instrument').forEach(inst => {
    inst.addEventListener('click', () => {
        const choices = inst.querySelector('.choices');
        choices.style.display = choices.style.display === 'block' ? 'none' : 'block';
    });
});

document.querySelectorAll('.choices button').forEach(button => {
    button.addEventListener('click', async () => {
        const instrument = button.closest('.instrument').dataset.instrument;
        const soundUrl = button.dataset.sound;
        
        if (loops[instrument]) {
            loops[instrument].stop();
            delete loops[instrument];
        }

        const buffer = await fetchSound(soundUrl);
        loops[instrument] = context.createBufferSource();
        loops[instrument].buffer = buffer;
        loops[instrument].loop = true;
        loops[instrument].connect(context.destination);

        if (isPlaying) {
            loops[instrument].start(0, context.currentTime % buffer.duration);
        }
    });
});

async function fetchSound(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await context.decodeAudioData(arrayBuffer);
}

function toggleControls() {
    document.querySelector('#play').disabled = isPlaying;
    document.querySelector('#stop').disabled = !isPlaying;
}

function showMeter() {
    const meter = document.getElementById('meter');
    meter.style.visibility = 'visible';
    meterInterval = setInterval(() => {
        meter.innerHTML = Array(5).fill('🔊').map(() => (Math.random() > 0.5 ? '🔊' : '🔈')).join('');
    }, 200);
}

function hideMeter() {
    const meter = document.getElementById('meter');
    meter.style.visibility = 'hidden';
    clearInterval(meterInterval);
}

document.getElementById('creation-date').innerText = new Date().toLocaleString();
