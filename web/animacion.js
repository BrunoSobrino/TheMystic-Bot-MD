// Crear canvas y agregarlo al documento
const canvas = document.createElement('canvas');
const bgAnimation = document.getElementById('background-animation');
bgAnimation.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Ajustar el tamaño del canvas según la ventana
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Crear un array de estrellas
const stars = [];
for (let i = 0; i < 50; i++) {
    stars.push(createStar());
}

// Función para generar una estrella
function createStar() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,  // Velocidad en X
        vy: (Math.random() - 0.5) * 4,  // Velocidad en Y
        radius: Math.random() * 5 + 5,  // Tamaño inicial
        originalRadius: Math.random() * 5 + 5,  // Tamaño original para el efecto de achicarse
        color: getRandomColor(),  // Color aleatorio
        shrinking: true,  // Indicador de si la estrella está achicándose
        sparkle: Math.random() * 100  // Brillo inicial
    };
}

// Función para obtener un color aleatorio brillante
function getRandomColor() {
    const colors = [
        'rgba(255, 255, 255, 1)',   // Blanco
        'rgba(173, 216, 230, 1)',   // Azul claro
        'rgba(255, 255, 224, 1)',   // Amarillo claro
        'rgba(255, 182, 193, 1)'    // Rosado claro
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Función para dibujar y animar
function animate() {
    // Fondo negro
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar las estrellas
    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];

        // Aumentar el brillo
        star.sparkle += (Math.random() - 0.5) * 0.2; // Variar el brillo
        star.sparkle = Math.max(0, Math.min(100, star.sparkle)); // Limitar el brillo
        const alpha = star.sparkle / 100; // Normalizar el brillo para el color

        // Dibujar la estrella
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${255}, ${255}, ${255}, ${alpha})`; // Brillo dinámico
        ctx.fill();

        // Achicar la estrella
        if (star.shrinking) {
            star.radius -= 0.1;  // Velocidad a la que se achican las estrellas

            // Explosión si el radio es muy pequeño
            if (star.radius <= 1) {
                explodeStar(star.x, star.y);  // Llamar a la explosión
                stars[i] = createStar();  // Regenerar la estrella
            }
        }

        // Movimiento
        star.x += star.vx;
        star.y += star.vy;

        // Rebote en los bordes
        if (star.x + star.radius > canvas.width || star.x - star.radius < 0) {
            star.vx *= -1;
        }
        if (star.y + star.radius > canvas.height || star.y - star.radius < 0) {
            star.vy *= -1;
        }
    }

    // Continuar la animación
    requestAnimationFrame(animate);
}

// Función para crear la explosión de una estrella
function explodeStar(x, y) {
    const explosionParticles = 20; // Número de partículas en la explosión
    for (let i = 0; i < explosionParticles; i++) {
        const particleX = x + (Math.random() * 40 - 20);
        const particleY = y + (Math.random() * 40 - 20);
        const particleRadius = Math.random() * 2 + 1;

        // Color de las partículas
        const color = getRandomColor();
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }
}

// Iniciar la animación
animate();
