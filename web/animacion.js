const canvas = document.createElement('canvas');
const bgAnimation = document.getElementById('background-animation');
bgAnimation.appendChild(canvas);
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const lights = [];
for (let i = 0; i < 25; i++) {
    lights.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 50 + 20,
        color: getRandomColor(),
        growing: true
    });
}

function getRandomColor() {
    return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let light of lights) {
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
        ctx.fillStyle = light.color;
        ctx.fill();

        // Movimiento
        light.x += light.vx;
        light.y += light.vy;

        // Cambio de tamaño
        if (light.growing) {
            light.radius += 0.5;
            if (light.radius > 80) light.growing = false;
        } else {
            light.radius -= 0.5;
            if (light.radius < 20) light.growing = true;
        }

        // Rebote en los bordes
        if (light.x + light.radius > canvas.width || light.x - light.radius < 0) {
            light.vx *= -1;
            light.color = getRandomColor(); // Cambiar color al rebotar
        }
        if (light.y + light.radius > canvas.height || light.y - light.radius < 0) {
            light.vy *= -1;
            light.color = getRandomColor(); // Cambiar color al rebotar
        }
    }
    requestAnimationFrame(animate);
}

animate();
