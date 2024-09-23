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

const balls = [];
for (let i = 0; i < 30; i++) {
    balls.push(createBall());
}

function createBall() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 10 + 10,
        maxRadius: Math.random() * 30 + 40, // Tamaño máximo antes de explotar
        color: getRandomColor()
    };
}

function getRandomColor() {
    return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();

        // Crecer gradualmente
        ball.radius += 0.3;

        // Si alcanza su tamaño máximo, explota y se reinicia
        if (ball.radius > ball.maxRadius) {
            // Dibujar explosión
            for (let j = 0; j < 5; j++) {
                ctx.beginPath();
                ctx.arc(ball.x + Math.random() * 50 - 25, ball.y + Math.random() * 50 - 25, Math.random() * 15, 0, Math.PI * 2);
                ctx.fillStyle = getRandomColor();
                ctx.fill();
            }
            // Regenerar la bola
            balls[i] = createBall();
        }

        // Movimiento
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Rebote en los bordes
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
            ball.vx *= -1;
        }
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.vy *= -1;
        }
    }
    requestAnimationFrame(animate);
}

animate();
