// Wait for DOM to load completely
document.addEventListener('DOMContentLoaded', () => {
    initParticleCanvas();
    init3DTilt();
});

/**
 * 1. CONST CONSTELLATION PARTICLE SYSTEM (Canvas Background)
 * Renders interactive node particles that connect to nearby neighbors.
 */
function initParticleCanvas() {
    const canvas = document.getElementById('canvas-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    // Configuration
    const config = {
        particleCount: 60,
        maxDistance: 120,
        colorParticle: 'rgba(99, 102, 241, 0.4)', // indigo tint
        colorLine: 'rgba(6, 182, 212, 0.1)',     // cyan tint
        speed: 0.4
    };

    // Set canvas dimensions
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        
        // Adjust particle count depending on screen width
        if (window.innerWidth < 768) {
            config.particleCount = 30;
            config.maxDistance = 80;
        } else {
            config.particleCount = 60;
            config.maxDistance = 120;
        }
        createParticles();
    }

    // Particle Object
    class Particle {
        constructor() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            this.vx = (Math.random() - 0.5) * config.speed;
            this.vy = (Math.random() - 0.5) * config.speed;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundaries
            if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
            if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = config.colorParticle;
            ctx.fill();
        }
    }

    // Create particle array
    function createParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Connect particles with lines if they are close
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < config.maxDistance) {
                    // Line opacity based on distance
                    const alpha = (1 - dist / config.maxDistance) * 0.18;
                    ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
                    ctx.lineWidth = 0.75;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Main animation loop
    function animate() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connectParticles();
        animationFrameId = requestAnimationFrame(animate);
    }

    // Event Listeners
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize
    resizeCanvas();
    animate();
}

/**
 * 2. 3D TILT EFFECT & RADIAL GLOW FOR CARDS
 * Tracks cursor position relative to cards and adds smooth rotation & hover glow movement.
 */
function init3DTilt() {
    const cards = document.querySelectorAll('.subdomain-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Calculate absolute cursor position inside card
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Update CSS custom properties for radial gradients in CSS
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
            
            // 3D rotation calculation
            const cardWidth = rect.width;
            const cardHeight = rect.height;
            const centerX = cardWidth / 2;
            const centerY = cardHeight / 2;
            
            // Rotation range between -10deg and +10deg
            const rotateX = ((centerY - y) / centerY) * 10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            // Apply transformation style
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset styles smoothly on exit
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.setProperty('--x', '50%');
            card.style.setProperty('--y', '50%');
        });
    });
}
