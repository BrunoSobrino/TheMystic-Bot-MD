// Animación simple de luces borrosas rebotando
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const lights = [];
for (let i = 0; i < 20; i++) {
    lights.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 50 + 30,
        color: `rgba(255, 255, 255, ${Math.random()})`
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let light of lights) {
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
        ctx.fillStyle = light.color;
        ctx.fill();

        light.x += light.vx;
        light.y += light.vy;

        if (light.x + light.radius > canvas.width || light.x - light.radius < 0) {
            light.vx *= -1;
        }
        if (light.y + light.radius > canvas.height || light.y - light.radius < 0) {
            light.vy *= -1;
        }
    }
    requestAnimationFrame(animate);
}

animate();
