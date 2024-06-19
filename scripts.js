document.addEventListener('DOMContentLoaded', function() {
    const clearButton = document.querySelector('.clear');
    const scoreElementParent = document.querySelector('.result .score:first-child');
    const scoreElementChild = document.querySelector('.result .score:last-child');
    const multiplierElement = document.querySelector('.multiplier');
    const pointsElement = document.querySelector('.points');
    const tabs = document.querySelectorAll('.tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    const fireworksContainer = document.createElement('div');
    fireworksContainer.id = 'fireworksContainer';
    fireworksContainer.className = 'fireworks-container';
    document.body.appendChild(fireworksContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'fireworksCanvas';
    canvas.className = 'fireworks-canvas';
    fireworksContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fireworks = [];

    const scoreTable = {
        'parent': {
            20: [0, 0, 2000, 3900, 7700],
            25: [0, 0, 2400, 4800, 9600],
            30: [0, 1500, 2900, 5800, 11600],
            40: [0, 2000, 3900, 7700, 12000],
            50: [0, 2400, 4800, 9600, 12000],
            60: [0, 2900, 5800, 11600, 12000],
            70: [0, 3400, 6800, 12000, 12000]
        },
        'child': {
            20: [0, 0, 1300, 2600, 5200],
            25: [0, 0, 1600, 3200, 6400],
            30: [0, 1000, 2000, 3900, 7700],
            40: [0, 1300, 2600, 5200, 8000],
            50: [0, 1600, 3200, 6400, 8000],
            60: [0, 2000, 3900, 7700, 8000],
            70: [0, 2300, 4500, 12000, 8000]
        }
    };

    class Firework {
        constructor(x, y, colors) {
            this.x = x;
            this.y = y;
            this.colors = colors;
            this.particles = this.createParticles();
        }

        createParticles() {
            const particles = [];
            for (let i = 0; i < 100; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const speed = Math.random() * 3 + 2;
                particles.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    color: this.colors[Math.floor(Math.random() * this.colors.length)]
                });
            }
            return particles;
        }

        update() {
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.02;
            });
            this.particles = this.particles.filter(p => p.alpha > 0);
        }

        draw(ctx) {
            this.particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 10, p.y - p.vy * 10);
                ctx.stroke();
                ctx.restore();
            });
        }
    }

    const showFireworks = () => {
        const colors = ['#FF0000', '#FF4500', '#FFD700'];
        fireworks.push(new Firework(Math.random() * canvas.width, Math.random() * canvas.height, colors));
        fireworks.push(new Firework(Math.random() * canvas.width, Math.random() * canvas.height, colors));
        fireworks.push(new Firework(Math.random() * canvas.width, Math.random() * canvas.height, colors));
        animateFireworks();
    };

    const animateFireworks = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fireworks.forEach(firework => {
            firework.update();
            firework.draw(ctx);
        });
        if (fireworks.some(fw => fw.particles.length > 0)) {
            requestAnimationFrame(animateFireworks);
        } else {
            fireworksContainer.style.display = 'none';
        }
    };

    const calculateScore = () => {
        const han = parseInt(multiplierElement.textContent); // 翻数を取得
        let fu = parseInt(pointsElement.textContent); // 符数を取得
        fu = roundUpFu(fu); // 符数を切り上げ

        let scoreParent = 0;
        let scoreChild = 0;

        if (han >= 5) {
            if (han === 5) {
                scoreParent = 12000;
                scoreChild = 8000;
            } else if (han <= 7) {
                scoreParent = 18000;
                scoreChild = 12000;
            } else if (han <= 10) {
                scoreParent = 24000;
                scoreChild = 16000;
            } else if (han <= 12) {
                scoreParent = 36000;
                scoreChild = 24000;
            } else {
                scoreParent = 48000;
                scoreChild = 32000;
            }
        } else if (han >= 1 && han <= 4) {
            const fuCategoryParent = scoreTable['parent'][fu];
            const fuCategoryChild = scoreTable['child'][fu];
            if (fuCategoryParent && han < fuCategoryParent.length) {
                scoreParent = fuCategoryParent[han];
            } else {
                scoreParent = 0;
            }
            if (fuCategoryChild && han < fuCategoryChild.length) {
                scoreChild = fuCategoryChild[han];
            } else {
                scoreChild = 0;
            }
        }

        scoreElementParent.textContent = `親: ${scoreParent} 点`;
        scoreElementChild.textContent = `子: ${scoreChild} 点`;

        if (scoreParent >= 12000 || scoreChild >= 8000) {
            fireworksContainer.style.display = 'block';
            showFireworks();
        }
    };

    const roundUpFu = (fu) => {
        return Math.ceil(fu / 10) * 10;
    };

    const toggleHan = (button, han) => {
        let currentMultiplier = parseInt(multiplierElement.textContent);
        if (button.classList.contains('active')) {
            currentMultiplier -= han;
            button.classList.remove('active');
        } else {
            currentMultiplier += han;
            button.classList.add('active');
        }
        multiplierElement.textContent = `${currentMultiplier} 翻`;
        calculateScore();
    };

    const toggleFu = (button, fu) => {
        let currentPoints = parseInt(pointsElement.textContent);
        if (button.classList.contains('active')) {
            currentPoints -= fu;
            button.classList.remove('active');
        } else {
            currentPoints += fu;
            button.classList.add('active');
        }
        pointsElement.textContent = `${currentPoints} 符`;
        calculateScore();
    };

    clearButton.addEventListener('click', function() {
        scoreElementParent.textContent = '親: 0 点';
        scoreElementChild.textContent = '子: 0 点';
        multiplierElement.textContent = '0 翻';
        pointsElement.textContent = '20 符';
        document.querySelectorAll('button').forEach(button => {
            button.classList.remove('active');
        });
    });

    const oneHanButtons = document.querySelectorAll('.one-han');
    oneHanButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleHan(button, parseInt(button.dataset.han));
        });
    });

    const twoHanButtons = document.querySelectorAll('.two-han');
    twoHanButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleHan(button, parseInt(button.dataset.han));
        });
    });

    const threeHanButtons = document.querySelectorAll('.three-han');
    threeHanButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleHan(button, parseInt(button.dataset.han));
        });
    });

    const fourHanButtons = document.querySelectorAll('.four-han');
    fourHanButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleHan(button, parseInt(button.dataset.han));
        });
    });

    const sixHanButtons = document.querySelectorAll('.six-han');
    sixHanButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleHan(button, parseInt(button.dataset.han));
        });
    });

    const yakumanButtons = document.querySelectorAll('.yakuman');
    yakumanButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleHan(button, parseInt(button.dataset.han));
        });
    });

    const doubleYakumanButtons = document.querySelectorAll('.double-yakuman');
    doubleYakumanButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleHan(button, parseInt(button.dataset.han));
        });
    });

    const agariButtons = document.querySelectorAll('.agari');
    agariButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleFu(button, parseInt(button.dataset.fu));
        });
    });

    const mentsuButtons = document.querySelectorAll('.mentsu');
    mentsuButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleFu(button, parseInt(button.dataset.fu));
        });
    });

    const jantoButtons = document.querySelectorAll('.janto');
    jantoButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleFu(button, parseInt(button.dataset.fu));
        });
    });

    const machigataButtons = document.querySelectorAll('.machigata');
    machigataButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleFu(button, parseInt(button.dataset.fu));
        });
    });

    // タブの切り替え処理
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
});
