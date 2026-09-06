// Main JavaScript for the website
// Helper function to escape HTML (prevents XSS attacks)
// ============ EMAILJS INITIALIZATION ============
// Put this at line 1 or line 2 of your main.js
// This MUST run before any other content loads



// ============ APPLY SAVED THEME ON PAGE LOAD ============


// ============ BLOCKING THEME LOAD - RUNS IMMEDIATELY ============
(async function() {
    try {
        console.log('🔴 BLOCKING THEME LOAD - STARTING');
        
        const response = await fetch('https://pwpepihnluwclxdrimmi.supabase.co/rest/v1/site_settings?select=theme_data&id=eq.1', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cGVwaWhubHV3Y2x4ZHJpbW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTU0NDQsImV4cCI6MjA5Mjk5MTQ0NH0.fiCKvzURAQVJC9Kn-fFV1NN59W4QfVoQsk84Q-vixhg'
            }
        });
        const data = await response.json();
        const themeData = data[0]?.theme_data;
        
        console.log('🔴 Theme from DB:', themeData?.name);
        
        if (themeData && themeData.colors && themeData.type !== 'default') {
            const colors = themeData.colors;
            
            // Apply CSS variables
            document.documentElement.style.setProperty('--theme-primary', colors.primary);
            document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
            document.documentElement.style.setProperty('--theme-accent', colors.accent);
            document.documentElement.style.setProperty('--theme-background', colors.background);
            
            // DIRECTLY CHANGE ELEMENTS (CRITICAL!)
            document.body.style.backgroundColor = colors.background;
            
            // Navbar
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.style.background = `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`;
            }
            
            // Buttons
            document.querySelectorAll('.btn-primary, .btn-join, .support-btn, .btn-support').forEach(btn => {
                if (!btn.closest('.hero')) {
                    btn.style.backgroundColor = colors.primary;
                    btn.style.borderColor = colors.primary;
                }
            });
            
            // Section backgrounds
            document.querySelectorAll('section, .about, .directions, .news, .events, .branches, .team, .contact, .moments-section, .awards-section').forEach(section => {
                section.style.backgroundColor = colors.background;
            });
            
            // Store in localStorage
            localStorage.setItem('main_page_theme', JSON.stringify(themeData));
            
            console.log('✅ Theme applied before page render:', themeData.name);
        } else {
            console.log('🔴 No theme in DB, using default');
        }
    } catch(e) {
        console.error('Theme preload error:', e);
    }
})();
// ============ END BLOCKING THEME LOAD ============
// Helper function to check if color is dark
function isColorDark(color) {
    if (!color || color === 'transparent') return false;
    
    let r, g, b;
    
    // Handle hex colors
    if (color.startsWith('#')) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
    } 
    // Handle rgb/rgba colors
    else if (color.startsWith('rgb')) {
        const matches = color.match(/\d+/g);
        if (matches) {
            r = parseInt(matches[0]);
            g = parseInt(matches[1]);
            b = parseInt(matches[2]);
        } else {
            return false;
        }
    }
    else {
        return false;
    }
    
    // Calculate perceived brightness (YIQ formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return true if dark (brightness less than 128)
    return brightness < 128;
}
// Apply theme from Supabase (shared across ALL visitors)
async function applySavedThemeToMainPage() {
    console.log('🔍 Fetching active theme from Supabase...');
    
    try {
        // Get active theme from Supabase (public access)
        const themeData = await getActiveTheme();
        
        if (!themeData || themeData.type === 'default') {
            console.log('No active theme found, using default');
            return;
        }
        
        console.log('🎨 Applying shared theme to main page:', themeData.name);
        
        if (themeData.colors) {
            // Apply colors to CSS variables
            document.documentElement.style.setProperty('--theme-primary', themeData.colors.primary);
            document.documentElement.style.setProperty('--theme-secondary', themeData.colors.secondary);
            document.documentElement.style.setProperty('--theme-accent', themeData.colors.accent);
            document.documentElement.style.setProperty('--theme-background', themeData.colors.background);
            
            // Change body background
            document.body.style.backgroundColor = themeData.colors.background;
            
            // Change all section backgrounds
            const sections = document.querySelectorAll('section, .about, .directions, .news, .events, .branches, .team, .contact, .moments-section, .awards-section');
            sections.forEach(section => {
                section.style.backgroundColor = themeData.colors.background;
            });
            
            // ========== ADD TEXT COLOR UPDATES ==========
            // Update all section titles (H2, H3, etc.)
            document.querySelectorAll('.section-title, .section-header h2, .section-header-center h2, .leaders-container h3, .leader-main-info h3, .branch-leaders-section h3').forEach(el => {
                el.style.color = themeData.colors.primary;
            });
            
            // Update section subtitles and tags
            document.querySelectorAll('.section-subtitle, .section-tag, .leader-main-title, .leader-position, .leader-branch').forEach(el => {
                el.style.color = themeData.colors.secondary;
            });
            
            // Update leader card text
            document.querySelectorAll('.leader-main-quote p, .leader-card .leader-info h4, .leader-card .leader-position, .leader-card .leader-branch').forEach(el => {
                el.style.color = themeData.colors.secondary;
            });
            
            // Update branch card text
            document.querySelectorAll('.branch-card h3, .branch-card p').forEach(el => {
                if (el.tagName === 'H3') {
                    el.style.color = themeData.colors.primary;
                } else {
                    el.style.color = themeData.colors.secondary;
                }
            });
            
            // ========== HANDLE DARK THEMES ==========
            // Check if background is dark
            const isDark = isColorDark(themeData.colors.background);
            
            if (isDark) {
                // Make cards semi-transparent for dark themes
                document.querySelectorAll('.leader-card-main, .leader-card, .branch-card, .event-card, .news-card, .award-card, .moment-card').forEach(card => {
                    card.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    card.style.backdropFilter = 'blur(8px)';
                    card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                });
                
                // Make text white on dark backgrounds for better readability
                document.querySelectorAll('.section-title, .section-header h2, .leaders-container h3, .leader-main-info h3').forEach(el => {
                    el.style.color = '#FFFFFF';
                });
                
                document.querySelectorAll('.section-subtitle, .section-tag').forEach(el => {
                    el.style.color = '#CCCCCC';
                });
            } else {
                // Reset card styles for light themes
                document.querySelectorAll('.leader-card-main, .leader-card, .branch-card, .event-card, .news-card, .award-card, .moment-card').forEach(card => {
                    card.style.backgroundColor = '';
                    card.style.backdropFilter = '';
                    card.style.border = '';
                });
            }
            
            // Apply navbar gradient
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.style.background = `linear-gradient(135deg, ${themeData.colors.secondary}, ${themeData.colors.primary})`;
            }
            
            // Apply buttons
            document.querySelectorAll('.btn-primary, .btn-join, .support-btn, .btn-support').forEach(btn => {
                if (!btn.closest('.hero') && !btn.closest('.footer')) {
                    btn.style.backgroundColor = themeData.colors.primary;
                    btn.style.borderColor = themeData.colors.primary;
                }
            });
            
            // Keep footer dark
            const footer = document.querySelector('.footer');
            if (footer) {
                footer.style.backgroundColor = '#1a1a2e';
            }
        }
        
        // After applying colors, ALSO trigger animation
        if (themeData.animation) {
            let animationType = themeData.animation;
            
            if (themeData.festivalId) {
                switch(themeData.festivalId) {
                    case 'halloween': animationType = 'pumpkins'; break;
                    case 'knowledge_day': animationType = 'books'; break;
                    case 'environment_day': animationType = 'greenleaves'; break;
                    case 'may_day': animationType = 'mayday'; break;
                    case 'griffin_day': animationType = 'griffin'; break;
                    default: animationType = themeData.animation;
                }
            }

            
            
            // Wait a tiny bit for DOM to be ready, then play animation
            setTimeout(() => {
                applySimpleAnimation(animationType);
            }, 100);
        }
        
    } catch (e) {
        console.error('Error applying theme:', e);
    }
}


// Apply animations from theme
function applyThemeAnimations(layers, intensity) {
    // Remove existing animations
    const existingAnim = document.getElementById('main-page-animations');
    if (existingAnim) existingAnim.remove();
    
    const container = document.createElement('div');
    container.id = 'main-page-animations';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
    `;
    document.body.appendChild(container);
    
    const count = intensity === 'high' ? 80 : intensity === 'low' ? 30 : 50;
    
    // Background layer animations
    if (layers.background) {
        switch(layers.background) {
            case 'snow':
                createSnowAnimation(container, count);
                break;
            case 'petals':
                createPetalsAnimation(container, count);
                break;
            case 'leaves':
                createLeavesAnimation(container, count);
                break;
            case 'fireworks':
                createFireworksAnimation(container);
                break;
            case 'sunrays':
                createSunraysAnimation(container);
                break;
            case 'goldDust':
                createGoldDustAnimation(container, count);
                break;
        }
    }
    
    // Mid layer animations (moving elements)
    if (layers.mid) {
        switch(layers.mid) {
            case 'aurora':
                createAuroraEffect(container);
                break;
            case 'birds':
                createBirdsAnimation(container);
                break;
            case 'butterflies':
                createButterfliesAnimation(container);
                break;
            case 'runningReindeer':
                createReindeerAnimation(container);
                break;
            case 'sailingShip':
                createShipAnimation(container);
                break;
            case 'griffinFly':
    createGriffinFlyRightToLeft(container);
    break;
            case 'bats':
                createBatsAnimation(container);
                break;
            case 'balloons':
                createBalloonsAnimation(container);
                break;
            case 'stars':
                createStarsAnimation(container);
                break;
        }
    }
    
    // Remove animations after 15 seconds to save performance
    setTimeout(() => {
        if (container.parentNode) {
            container.style.opacity = '0';
            setTimeout(() => container.remove(), 1000);
        }
    }, 15000);
}

// Simple animation fallback
function applySimpleAnimation(animationType) {
    const container = document.createElement('div');
    container.id = 'main-page-animations';
    container.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; overflow: hidden;`;
    document.body.appendChild(container);
    
    const count = 50;
    
    switch(animationType) {
        case 'snow':
        case 'aurora':
            createSnowAnimation(container, count);
            break;
        case 'petals':
            createPetalsAnimation(container, count);
            break;
        case 'leaves':
            createLeavesAnimation(container, count);
            break;
        case 'fireworks':
        case 'confetti':
            createFireworksAnimation(container);
            break;
        case 'griffin':
            createGriffinFlyRightToLeft(container);
            break;
        // ========== ADD THESE NEW CASES ==========
        case 'pumpkins':
            createHalloweenPumpkins(container, count);
            break;
        case 'books':
            createKnowledgeBooks(container, count);
            break;
        case 'greenleaves':
            createEnvironmentLeaves(container, count);
            break;
        case 'mayday':
            createMayDaySymbols(container, count);
            break;
        default:
            createSnowAnimation(container, count);
    }
    
    setTimeout(() => {
        if (container.parentNode) container.remove();
    }, 15000);
}

// Animation creator functions
function createSnowAnimation(container, count) {
    for (let i = 0; i < count; i++) {
        const snow = document.createElement('div');
        snow.innerHTML = Math.random() > 0.5 ? '❄️' : '❅';
        snow.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: -30px;
            font-size: ${12 + Math.random() * 18}px;
            opacity: ${0.5 + Math.random() * 0.5};
            animation: snowFall ${3 + Math.random() * 4}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(snow);
    }
}

function createPetalsAnimation(container, count) {
    const petals = ['🌸', '🌼', '🌻', '🌺'];
    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        petal.innerHTML = petals[Math.floor(Math.random() * petals.length)];
        petal.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: -30px;
            font-size: ${16 + Math.random() * 14}px;
            animation: petalFall ${5 + Math.random() * 4}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(petal);
    }
}

function createLeavesAnimation(container, count) {
    const leaves = ['🍂', '🍁', '🍃'];
    for (let i = 0; i < count; i++) {
        const leaf = document.createElement('div');
        leaf.innerHTML = leaves[Math.floor(Math.random() * leaves.length)];
        leaf.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: -30px;
            font-size: ${18 + Math.random() * 15}px;
            animation: leafFall ${4 + Math.random() * 5}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(leaf);
    }
}

function createFireworksAnimation(container) {
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.innerHTML = '🎆';
            firework.style.cssText = `
                position: absolute;
                left: ${15 + Math.random() * 70}%;
                top: ${20 + Math.random() * 40}%;
                font-size: ${30 + Math.random() * 40}px;
                animation: explode 0.5s ease-out forwards;
                opacity: 0;
            `;
            container.appendChild(firework);
            setTimeout(() => firework.remove(), 500);
        }, i * 350);
    }
}

function createSunraysAnimation(container) {
    for (let i = 0; i < 12; i++) {
        const ray = document.createElement('div');
        ray.style.cssText = `
            position: absolute;
            top: ${Math.random() * 100}%;
            left: -100px;
            width: 200px;
            height: 4px;
            background: linear-gradient(90deg, transparent, #FFD700, transparent);
            animation: rayMove ${4 + Math.random() * 3}s linear infinite;
            animation-delay: ${Math.random() * 4}s;
            transform: rotate(${Math.random() * 60 - 30}deg);
        `;
        container.appendChild(ray);
    }
}

function createGoldDustAnimation(container, count) {
    for (let i = 0; i < count; i++) {
        const dust = document.createElement('div');
        dust.innerHTML = '✨';
        dust.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            font-size: ${12 + Math.random() * 15}px;
            animation: floatGold ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
            opacity: ${0.6 + Math.random() * 0.4};
        `;
        container.appendChild(dust);
    }
}

function createAuroraEffect(container) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9998; opacity: 0.4;`;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    let time = 0;
    function draw() {
        if (!canvas.parentNode) return;
        ctx.clearRect(0, 0, width, height);
        
        const gradient = ctx.createLinearGradient(0, 0, width, height * 0.5);
        gradient.addColorStop(0, `rgba(0, 180, 216, ${0.2 + Math.sin(time) * 0.1})`);
        gradient.addColorStop(0.5, `rgba(114, 46, 209, ${0.15 + Math.cos(time * 0.7) * 0.1})`);
        gradient.addColorStop(1, `rgba(0, 255, 127, ${0.1 + Math.sin(time * 0.5) * 0.05})`);
        
        ctx.fillStyle = gradient;
        for (let i = 0; i < 15; i++) {
            const y = Math.sin(time + i * 0.5) * 40 + height * 0.3;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.quadraticCurveTo(width / 2, y + Math.sin(time * 2 + i) * 25, width, y + Math.cos(time + i) * 35);
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.fill();
        }
        time += 0.02;
        requestAnimationFrame(draw);
    }
    draw();
}

function createBirdsAnimation(container) {
    for (let i = 0; i < 6; i++) {
        const bird = document.createElement('div');
        bird.innerHTML = '🐦';
        bird.style.cssText = `
            position: absolute;
            left: ${-80 - i * 40}px;
            top: ${80 + Math.random() * 150}px;
            font-size: 22px;
            animation: flyBird ${10 + Math.random() * 6}s linear infinite;
            animation-delay: ${Math.random() * 8}s;
        `;
        container.appendChild(bird);
    }
}

function createButterfliesAnimation(container) {
    for (let i = 0; i < 8; i++) {
        const butterfly = document.createElement('div');
        butterfly.innerHTML = '🦋';
        butterfly.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            bottom: ${Math.random() * 100}%;
            font-size: 20px;
            animation: floatButterfly ${8 + Math.random() * 5}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(butterfly);
    }
}


function createReindeerAnimation(container) {
    const reindeer = document.createElement('div');
    reindeer.innerHTML = '🦌';
    reindeer.style.cssText = `
        position: absolute;
        bottom: 60px;
        left: -100px;
        font-size: 45px;
        animation: runReindeer 6s linear infinite;
    `;
    container.appendChild(reindeer);
}

function createShipAnimation(container) {
    const ship = document.createElement('div');
    ship.innerHTML = '⛵';
    ship.style.cssText = `
        position: absolute;
        bottom: 40px;
        left: -120px;
        font-size: 50px;
        animation: sailShip 8s linear infinite;
    `;
    container.appendChild(ship);
}

function createBatsAnimation(container) {
    for (let i = 0; i < 10; i++) {
        const bat = document.createElement('div');
        bat.innerHTML = '🦇';
        bat.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 70}%;
            font-size: 20px;
            animation: batFly ${6 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(bat);
    }
}

function createBalloonsAnimation(container) {
    for (let i = 0; i < 15; i++) {
        const balloon = document.createElement('div');
        balloon.innerHTML = '🎈';
        balloon.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            bottom: -50px;
            font-size: 25px;
            animation: floatUp ${8 + Math.random() * 5}s linear infinite;
            animation-delay: ${Math.random() * 8}s;
        `;
        container.appendChild(balloon);
    }
}

function createStarsAnimation(container) {
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.innerHTML = '⭐';
        star.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            font-size: ${8 + Math.random() * 12}px;
            animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
            animation-delay: ${Math.random() * 3}s;
            opacity: ${0.3 + Math.random() * 0.5};
        `;
        container.appendChild(star);
    }
}



// Add CSS keyframes if not exists
if (!document.getElementById('theme-animation-keyframes')) {
    const keyframes = document.createElement('style');
    keyframes.id = 'theme-animation-keyframes';
    keyframes.textContent = `
        @keyframes snowFall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes leafFall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(180deg); opacity: 0; }
        }
        @keyframes petalFall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(90deg); opacity: 0; }
        }
        @keyframes explode {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
        }
        @keyframes rayMove {
            0% { transform: translateX(-100%) rotate(0deg); opacity: 0; }
            50% { opacity: 0.6; }
            100% { transform: translateX(200%) rotate(30deg); opacity: 0; }
        }
        @keyframes floatGold {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
        }
        @keyframes flyBird {
            0% { left: -80px; transform: translateY(0); }
            50% { transform: translateY(-15px); }
            100% { left: calc(100% + 80px); transform: translateY(0); }
        }
        @keyframes flyButterfly {
            0% { left: -50px; }
            100% { left: calc(100% + 50px); }
        }
        @keyframes griffinFly {
            0% { left: -100px; transform: scale(1); }
            50% { left: 45%; transform: scale(1.2); filter: drop-shadow(0 0 25px gold); }
            100% { left: calc(100% + 100px); transform: scale(1); }
        }
        @keyframes runReindeer {
            0% { left: -100px; transform: scaleX(1); }
            49% { transform: scaleX(1); }
            50% { left: calc(100% + 100px); transform: scaleX(-1); }
            100% { left: -100px; transform: scaleX(1); }
        }
        @keyframes sailShip {
            0% { left: -120px; }
            100% { left: calc(100% + 120px); }
        }
        @keyframes batFly {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(20px) translateY(-15px); }
            100% { transform: translateX(0) translateY(0); }
        }
        @keyframes floatUp {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-100vh); opacity: 0; }
        }
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeTrail {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.3); }
        }
        @keyframes floatButterfly {
            0% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(15px) translateY(-10px); }
            75% { transform: translateX(-10px) translateY(5px); }
            100% { transform: translateX(0) translateY(0); }
        }
    `;
    document.head.appendChild(keyframes);
}




if (typeof emailjs !== 'undefined') {
    emailjs.init('Q0PDtzoS4rqXI8AI5');
    console.log('✅ EmailJS initialized in main.js');
}


function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// Handle hero video background - UPDATED
function initHeroVideo() {
    const video = document.getElementById('heroVideo');
    if (video) {
        // If no source is set, try to play anyway
        if (!video.src || video.src === '') {
            console.log('No video source set yet');
            return;
        }
        video.play().catch(function(error) {
            console.log('Video autoplay failed:', error);
            const heroBg = document.querySelector('.hero-video-bg');
            if (heroBg) {
                heroBg.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e)';
            }
        });
    }
}


// Single DOMContentLoaded - REPLACE ALL THREE WITH THIS
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize hero video
    await loadHeroVideo();  // ← ADD THIS
    initHeroVideo();
    
    // Initialize all components
    initMobileMenu();
    initSupportCounter();
    initSupportButtons();
    
    // Load data from Supabase (async)
    await loadNews();
    await loadEvents(); 
    await loadBranches();
    await loadAwards();
    await loadMoments();
    
    // Rest of initializations
    initContactForm();
    initScrollReveal();
    loadTeam();
    initImageArrays();
    
    // Join Modal Buttons
    const joinBtn = document.getElementById('joinBtn');
    const heroJoinBtn = document.getElementById('heroJoinBtn');
    const modalClose = document.querySelector('.join-modal-close');
    
    if (joinBtn) {
        joinBtn.addEventListener('click', openJoinModal);
    }
    if (heroJoinBtn) {
        heroJoinBtn.addEventListener('click', openJoinModal);
    }
    if (modalClose) {
        modalClose.addEventListener('click', closeJoinModal);
    }
    
    // Video modal close
    const closeVideoBtn = document.querySelector('.close-video-modal');
    if (closeVideoBtn) {
        closeVideoBtn.onclick = () => {
            document.getElementById('videoPlayerModal').style.display = 'none';
            document.getElementById('videoPlayerContainer').innerHTML = '';
        };
    }
    
    window.onclick = (e) => {
        const modal = document.getElementById('videoPlayerModal');
        if (e.target === modal) {
            modal.style.display = 'none';
            document.getElementById('videoPlayerContainer').innerHTML = '';
        }
        
        const joinModal = document.getElementById('joinModal');
        if (e.target === joinModal) {
            closeJoinModal();
        }
    };
});

// Mobile Menu
function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileBtn) {
        mobileBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            if (navMenu.classList.contains('active')) {
                navMenu.style.display = 'flex';
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '80px';
                navMenu.style.left = '0';
                navMenu.style.width = '100%';
                navMenu.style.background = 'white';
                navMenu.style.padding = '20px';
                navMenu.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            } else {
                navMenu.style.display = '';
            }
        });
    }
}







// Load ONLY News and Announcements - FIXED ARROWS
async function loadNews() {
    const container = document.getElementById('newsGrid');
    if (!container) return;
    
    const allItems = await getNews();
    const newsItems = allItems.filter(item => 
        item.category === 'news' || item.category === 'announcement'
    );
    
    if (newsItems.length === 0) {
        container.innerHTML = '<div style="text-align:center; width:100%; padding:40px;">Нет новостей</div>';
        return;
    }
    
    const sectionId = 'newsScrollContainer';
    
    container.innerHTML = `
        <div class="horizontal-scroll-section">
            <div class="scroll-wrapper-container">
                <button class="scroll-arrow-fixed" onclick="scrollHorizontal('${sectionId}', 'left')" id="${sectionId}-left">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <div class="horizontal-scroll-container" id="${sectionId}">
                    <div class="horizontal-scroll-wrapper">
                        ${newsItems.map((item, index) => {
                            let allImages = [];
                            if (item.image) allImages.push(item.image);
                            if (item.multiple_images && item.multiple_images.length > 0) {
                                allImages = [...allImages, ...item.multiple_images];
                            }
                            
                            const hasImages = allImages.length > 0;
                            const uniqueId = `news-carousel-${item.id}-${index}`;
                            const fullDescription = item.description || '';
                            const shortDescription = fullDescription.length > 120 ? fullDescription.substring(0, 120) + '...' : fullDescription;
                            const hasArticleLink = item.link && item.link.trim() !== '';
                            const hasVideoLink = item.video && item.video.trim() !== '';
                            
                            return `
                                <div class="news-scroll-card horizontal-scroll-card">
                                    <div class="news-image-container">
                                        <div class="news-image-carousel" id="${uniqueId}">
                                            ${hasImages ? allImages.map((img, imgIndex) => `
                                                <div class="carousel-slide ${imgIndex === 0 ? 'active' : ''}" data-index="${imgIndex}">
                                                    <img src="${img}" alt="News image ${imgIndex + 1}" onclick="openImageModal('${img}')">
                                                </div>
                                            `).join('') : `
                                                <div class="carousel-slide active">
                                                    <i class="fas fa-hands-helping"></i>
                                                </div>
                                            `}
                                        </div>
                                        
                                        ${hasImages && allImages.length > 1 ? `
                                            <button class="carousel-prev" onclick="event.stopPropagation(); changeSlide('${uniqueId}', -1)">❮</button>
                                            <button class="carousel-next" onclick="event.stopPropagation(); changeSlide('${uniqueId}', 1)">❯</button>
                                            <div class="carousel-dots">
                                                ${allImages.map((_, dotIndex) => `
                                                    <span class="dot ${dotIndex === 0 ? 'active' : ''}" onclick="event.stopPropagation(); goToSlide('${uniqueId}', ${dotIndex})"></span>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                    
                                    <div class="news-content">
                                        <div class="news-date">${item.date}</div>
                                        <h3 class="news-title">${escapeHtml(item.title)}</h3>
                                        <p class="news-excerpt">${escapeHtml(shortDescription)}</p>
                                        
                                        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                                            ${hasArticleLink ? `
                                                <a href="${item.link}" target="_blank" class="read-article-btn" style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; background: var(--primary); color: white; border-radius: 20px; text-decoration: none; font-size: 12px;">
                                                    <i class="fas fa-external-link-alt"></i> Читать статью
                                                </a>
                                            ` : ''}
                                            
                                            ${hasVideoLink ? `
                                                <a href="${item.video}" target="_blank" class="btn-video" style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; background: #FF0000; color: white; border-radius: 20px; text-decoration: none; font-size: 12px;">
                                                    <i class="fab fa-youtube"></i> Смотреть видео
                                                </a>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <button class="scroll-arrow-fixed" onclick="scrollHorizontal('${sectionId}', 'right')" id="${sectionId}-right">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    // Initialize scroll monitoring
    const scrollContainer = document.getElementById(sectionId);
    if (scrollContainer) {
        setTimeout(() => updateArrowVisibility(sectionId), 100);
        scrollContainer.addEventListener('scroll', () => updateArrowVisibility(sectionId));
        window.addEventListener('resize', () => updateArrowVisibility(sectionId));
    }
}



// Infinite loop scrolling - when near end, jump to start
function setupInfiniteNewsScroll() {
    const container = document.getElementById('newsScrollContainer');
    if (!container) return;
    
    let scrollTimeout;
    container.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const maxScroll = container.scrollWidth - container.clientWidth;
            const currentScroll = container.scrollLeft;
            
            // If near the end (within 100px), jump to start
            if (currentScroll >= maxScroll - 100) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            }
            // If at the very beginning and scrolling left, jump to end
            else if (currentScroll <= 100 && currentScroll > 0) {
                // Optional: jump to end for continuous loop
            }
        }, 150);
    });
}
// Load ONLY Events - WITH SIDE ARROWS
async function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    const allItems = await getNews();
    const events = allItems.filter(item => item.category === 'event');
    
    if (events.length === 0) {
        eventsGrid.innerHTML = `<div style="text-align:center; padding:40px; background:white; border-radius:20px;">
            <i class="fas fa-calendar-alt" style="font-size:48px; color:var(--primary); margin-bottom:15px;"></i>
            <p style="color:var(--gray);">Нет предстоящих событий. Добавьте событие в админ панели!</p>
        </div>`;
        return;
    }
    
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sectionId = 'eventsScrollContainer';
    
    eventsGrid.innerHTML = `
        <div class="horizontal-scroll-section">
            <div class="scroll-wrapper-container">
                <button class="scroll-arrow-fixed" onclick="scrollHorizontal('${sectionId}', 'left')" id="${sectionId}-left">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <div class="horizontal-scroll-container" id="${sectionId}">
                    <div class="horizontal-scroll-wrapper">
                        ${events.map(event => {
                            const eventDate = new Date(event.date);
                            const day = eventDate.getDate();
                            const month = eventDate.toLocaleDateString('ru-RU', { month: 'short' });
                            
                            let status = 'upcoming';
                            let statusText = 'Предстоит';
                            
                            if (eventDate.getTime() === today.getTime()) {
                                status = 'today';
                                statusText = 'Сегодня!';
                            } else if (eventDate < today) {
                                status = 'past';
                                statusText = 'Прошло';
                            }
                            
                            return `
                                <div class="event-card horizontal-scroll-card">
                                    <div class="event-image-container">
                                        ${event.image ? 
                                            `<img src="${event.image}" class="event-image" alt="${event.title}">` : 
                                            `<div class="event-image-placeholder"><i class="fas fa-calendar-alt"></i></div>`
                                        }
                                        <div class="event-date-badge">
                                            <span class="day">${day}</span>
                                            <span class="month">${month}</span>
                                        </div>
                                    </div>
                                    <div class="event-content">
                                        <h3>${escapeHtml(event.title)}</h3>
                                        <div class="event-location">
                                            <i class="fas fa-map-marker-alt"></i>
                                            <span>${escapeHtml(event.location || 'Место уточняется')}</span>
                                        </div>
                                        <p class="event-description">${escapeHtml(event.description.substring(0, 120))}${event.description.length > 120 ? '...' : ''}</p>
                                        
                                        ${event.video ? `
                                            <div class="event-video-link">
                                                <a href="${event.video}" target="_blank" class="btn-video">
                                                    <i class="fab fa-youtube"></i> Смотреть видео
                                                </a>
                                            </div>
                                        ` : ''}
                                        
                                        <div class="event-footer">
                                            <span class="event-status ${status}">${statusText}</span>
                                            ${event.register_link ? `<a href="${event.register_link}" target="_blank" class="btn-register">📝 Зарегистрироваться →</a>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <button class="scroll-arrow-fixed" onclick="scrollHorizontal('${sectionId}', 'right')" id="${sectionId}-right">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    const scrollContainer = document.getElementById(sectionId);
    if (scrollContainer) {
        setTimeout(() => updateArrowVisibility(sectionId), 100);
        scrollContainer.addEventListener('scroll', () => updateArrowVisibility(sectionId));
        window.addEventListener('resize', () => updateArrowVisibility(sectionId));
    }
}

// Add these functions after loadNews (globally)

// Change slide function
window.changeSlide = function(carouselId, direction) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = carousel.closest('.news-image-container')?.querySelector('.carousel-dots');
    
    let currentIndex = -1;
    slides.forEach((slide, idx) => {
        if (slide.classList.contains('active')) {
            currentIndex = idx;
            slide.classList.remove('active');
        }
    });
    
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;
    
    slides[newIndex].classList.add('active');
    
    // Update dots
    if (dotsContainer) {
        const dotElements = dotsContainer.querySelectorAll('.dot');
        dotElements.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === newIndex);
        });
    }
};

// Go to specific slide
window.goToSlide = function(carouselId, slideIndex) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = carousel.closest('.news-image-container')?.querySelector('.carousel-dots');
    
    slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === slideIndex);
    });
    
    if (dotsContainer) {
        const dotElements = dotsContainer.querySelectorAll('.dot');
        dotElements.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === slideIndex);
        });
    }
};

// Add this function after loadNews (for full-size image viewing)
window.openImageModal = function(imageSrc) {
    let modal = document.getElementById('imageViewerModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageViewerModal';
        modal.className = 'image-viewer-modal';
        modal.innerHTML = `
            <div class="image-viewer-content">
                <span class="close-viewer">&times;</span>
                <img id="fullSizeImage" src="">
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.className === 'close-viewer') {
                modal.style.display = 'none';
            }
        });
    }
    
    const fullImg = document.getElementById('fullSizeImage');
    fullImg.src = imageSrc;
    modal.style.display = 'flex';
}
// Load Branches from SUPABASE
async function loadBranches() {
    const branchesGrid = document.getElementById('branchesGrid');
    if (!branchesGrid) return;
    
    // Get branches from Supabase
    let branches = await getBranches();
    
    if (!branches || branches.length === 0) {
        branches = [
            { id: 1, title: 'Московская область', city: 'Москва', vk_link: 'https://vk.com/zolotiegrifony', description: 'Центральный офис организации' }
        ];
    }
    
    branchesGrid.innerHTML = branches.map(branch => `
        <div class="branch-card">
            <div class="branch-badge">
                <i class="fas fa-map-marker-alt"></i>
                <span>${branch.id === 1 ? 'Головной офис' : 'Филиал'}</span>
            </div>
            ${branch.image ? `<img src="${branch.image}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin:0 auto 15px; display:block;">` : `<div class="direction-icon" style="margin:0 auto 15px;"><i class="fas fa-building"></i></div>`}
            <h3>${escapeHtml(branch.title)}</h3>
            <p>${escapeHtml(branch.description || branch.city || '')}</p>
            ${branch.date ? `<p class="branch-date" style="font-size: 12px; color: var(--gray); margin-top: 5px;"><i class="fas fa-calendar-alt"></i> Основан: ${branch.date}</p>` : ''}
            ${branch.vk_link ? `<a href="${branch.vk_link}" target="_blank" class="branch-link"><i class="fab fa-vk"></i> ВКонтакте</a>` : '<span class="branch-link" style="opacity:0.5;"><i class="fab fa-vk"></i> VK скоро</span>'}
        </div>
    `).join('');
}

// ============ WEBSITE ENGAGEMENT COUNTER (LIKE BUTTON) ============

// ============ SUPPORT BUTTON (LIKE) ============

// Initialize support counter
function initSupportCounter() {
    let supportCount = localStorage.getItem('website_support_count');
    
    if (supportCount === null) {
        supportCount = 1247; // Default value 1.2K
        localStorage.setItem('website_support_count', supportCount);
    } else {
        supportCount = parseInt(supportCount);
    }
    
    updateSupportCountDisplays(supportCount);
    
    // Check if user has already liked
    const hasLiked = sessionStorage.getItem('user_has_liked');
    if (hasLiked) {
        disableSupportButtons();
    }
}

// Update displays
function updateSupportCountDisplays(count) {
    const heroCount = document.getElementById('heroSupportCount');
    const footerCount = document.getElementById('footerSupportCount');
    
    if (heroCount) heroCount.textContent = formatNumber(count);
    if (footerCount) footerCount.textContent = formatNumber(count);
}

// Format number
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Handle click
function handleSupportClick(event) {
    const button = event.currentTarget;
    const icon = button.querySelector('i');
    
    const hasLiked = sessionStorage.getItem('user_has_liked');
    if (hasLiked) {
        showToastMessage('❤️ Спасибо! Вы уже поддержали нас ранее!', 'info');
        triggerHeartAnimation(icon);
        return;
    }
    
    let currentCount = parseInt(localStorage.getItem('website_support_count')) || 1247;
    let newCount = currentCount + 1;
    localStorage.setItem('website_support_count', newCount);
    
    sessionStorage.setItem('user_has_liked', 'true');
    updateSupportCountDisplays(newCount);
    
    triggerHeartAnimation(icon);
    showToastMessage('❤️ Спасибо за поддержку! Вы сделали наш день ярче!', 'success');
    disableSupportButtons();
}

// Heart animation
function triggerHeartAnimation(icon) {
    if (!icon) return;
    icon.classList.add('animate');
    setTimeout(() => {
        icon.classList.remove('animate');
    }, 300);
}

// Disable buttons
function disableSupportButtons() {
    const buttons = document.querySelectorAll('#supportBtn, #footerSupportBtn');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.style.cursor = 'default';
    });
}

// Toast notification
function showToastMessage(message, type = 'success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${type === 'success' ? '❤️' : '💚'}</span>
            <span class="toast-text">${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Attach buttons
function initSupportButtons() {
    const heroBtn = document.getElementById('supportBtn');
    const footerBtn = document.getElementById('footerSupportBtn');
    
    if (heroBtn) heroBtn.addEventListener('click', handleSupportClick);
    if (footerBtn) footerBtn.addEventListener('click', handleSupportClick);
}




// Contact Form - Save queries to Supabase
// Contact Form - Save queries to Supabase
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) {
        console.log('Contact form not found');
        return;
    }
    
    // Remove ALL existing event listeners by cloning
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Add a SINGLE event listener
    newForm.addEventListener('submit', handleContactSubmit);
}

// Separate function for handling submission
async function handleContactSubmit(e) {
    e.preventDefault();
    
    console.log('Form submitted - processing...');
    
    // Get form elements
    const form = e.target;
    const nameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const messageInput = form.querySelector('textarea');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Get values
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';
    
    console.log('Values:', { name, email, message });
    
    // Validate
    if (!name || !email || !message) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Пожалуйста, введите корректный email адрес');
        return;
    }
    
    // Disable button
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
    }
    
    try {
        // Save to Supabase
        const { data, error } = await supabasePublic.from('queries').insert([{
            name: name,
            email: email,
            message: message,
            status: 'pending'
        }]);
        
        if (error) {
            console.error('Error saving query:', error);
            alert('Извините, произошла ошибка. Пожалуйста, попробуйте позже.');
            return;
        }
        
        console.log('✅ Query saved to Supabase');
        
        // Send auto-reply (try, but don't block on failure)
        try {
            await sendAutoReply(name, email, message);
        } catch (replyError) {
            console.warn('Auto-reply failed:', replyError);
            // Don't show error to user - just log it
        }
        
        alert('✅ Спасибо за ваше сообщение! Мы ответим вам в ближайшее время.');
        form.reset();
        
    } catch (err) {
        console.error('Error:', err);
        alert('Произошла ошибка. Попробуйте еще раз.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
        }
    }
}

// ============ SEND AUTO-REPLY TO USER (INSTANT) ============
async function sendAutoReply(name, email, message) {
    console.log('📧 Sending auto-reply to:', email);
    
    try {
        // Check if EmailJS is loaded
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS not loaded! Auto-reply skipped.');
            return;
        }
        
        // Send auto-reply using template_zqcay1a
        const result = await emailjs.send(
            'Maria@2009',                    // Your service ID
            'template_zqcay1a',              // Auto-reply template ID
            {
                to_name: name,               // User's name
                email: email,             // User's email address
                user_query: message,         // Their original message
                from_email: 'zolotiegrifony@mail.ru',
                reply_date: new Date().toLocaleString('ru-RU'),
                from_email: 'zolotiegrifony@mail.ru'
            },
            'Q0PDtzoS4rqXI8AI5'              // Your public key
        );
        
        console.log('✅ Auto-reply sent successfully!', result);
        
    } catch (error) {
        console.error('❌ Auto-reply failed:', error);
        // Don't show error to user - just log it
    }
}

// Join Button - Open Modal
const joinBtn = document.getElementById('joinBtn');
const heroJoinBtn = document.getElementById('heroJoinBtn');

function openJoinModal() {
    const modal = document.getElementById('joinModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeJoinModal() {
    const modal = document.getElementById('joinModal');
    const video = document.getElementById('tutorialVideo');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (video) {
            video.pause();
        }
    }
}

if (joinBtn) {
    joinBtn.addEventListener('click', openJoinModal);
}

if (heroJoinBtn) {
    heroJoinBtn.addEventListener('click', openJoinModal);
}

// Close modal when clicking X button
const modalClose = document.querySelector('.join-modal-close');
if (modalClose) {
    modalClose.addEventListener('click', closeJoinModal);
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('joinModal');
    if (e.target === modal) {
        closeJoinModal();
    }
});

// Scroll Reveal Animation
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.direction-card, .news-card, .branch-card, .value-item');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
// ============ ADD THESE FUNCTIONS AT THE BOTTOM OF main.js ============

// Toggle gallery visibility
function toggleDirectionGallery(button) {
    const wrapper = button.nextElementSibling;
    if (wrapper.style.display === 'none') {
        wrapper.style.display = 'block';
        button.innerHTML = 'Скрыть ←';
    } else {
        wrapper.style.display = 'none';
        button.innerHTML = 'Узнать больше →';
    }
}

// Scroll gallery left/right
function scrollGallery(arrow, direction) {
    const gallery = arrow.parentElement.querySelector('.gallery-scroll');
    const scrollAmount = 200;
    if (direction === -1) {
        gallery.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}
// Current index for each card (1-6)
let currentIndices = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0};

// Array of image sources for each card (will be updated from gallery)
let directionImageArrays = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: []
};

// Initialize image arrays from gallery
function initImageArrays() {
    for (let i = 1; i <= 6; i++) {
        const gallery = document.getElementById(`gallery-${i}`);
        if (gallery) {
            const images = gallery.querySelectorAll('img');
            directionImageArrays[i] = Array.from(images).map(img => {
                // Get the main image URL (convert small to large)
                let src = img.src;
                src = src.replace('/100/70', '/400/200').replace('/120/90', '/400/200');
                return src;
            });
        }
    }
}

// Change main image
function changeMainImage(direction, cardId) {
    let newIndex = currentIndices[cardId] + direction;
    if (newIndex < 0) newIndex = 4;
    if (newIndex > 4) newIndex = 0;
    
    const imageSrc = directionImageArrays[cardId][newIndex];
    if (imageSrc) {
        setMainImage(newIndex, cardId, imageSrc);
    }
}

// Set main image
function setMainImage(index, cardId, imageSrc) {
    currentIndices[cardId] = index;
    
    const mainImg = document.getElementById(`mainImage-${cardId}`);
    if (mainImg) mainImg.src = imageSrc;
    
    const indicator = document.getElementById(`indicator-${cardId}`);
    if (indicator) indicator.textContent = `${index + 1}/5`;
    
    // Update active state in gallery
    const gallery = document.getElementById(`gallery-${cardId}`);
    if (gallery) {
        const images = gallery.querySelectorAll('img');
        images.forEach((img, i) => {
            if (i === index) {
                img.classList.add('active');
            } else {
                img.classList.remove('active');
            }
        });
    }
}

// Scroll gallery horizontally
function scrollGalleryHorizontal(arrow, direction) {
    const container = arrow.parentElement;
    const gallery = container.querySelector('.gallery-scroll');
    if (gallery) {
        const scrollAmount = 150;
        gallery.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
}


function loadTeam() {
    const teamGrid = document.getElementById('teamGrid');
    if (!teamGrid) return;
    
    const teamMembers = [
        { name: "Анастасия Жупина", position: "Директор филиала", branch: "Тюмень", image: "images/team/tyumen-leader.jpg" },
        { name: "Дилара Юлдашева", position: "Директор филиала", branch: "Ноябрьск", image: "images/team/noyabrsk-leader.jpg" },
        { name: "Маргарита Сэротетто", position: "Директор филиала", branch: "Тазовский, ЯНАО", image: "images/team/tazovsky-leader.jpg" },
        { name: "Анна Кукушкина", position: "Директор филиала", branch: "Надым", image: "images/team/nadym-leader.jpg" },
        { name: "Елена Борн", position: "Директор филиала", branch: "Салехард", image: "images/team/salekhard-leader.jpg" },
        { name: "Наталья Панькив", position: "Директор филиала", branch: "Златоустовка, ДНР", image: "images/team/zlatoustovka-leader.jpg" },
        { name: "Татьяна Гурская", position: "Директор филиала", branch: "Ровнополь, ДНР", image: "images/team/rivne-leader.jpg" },
        { name: "Ирина Гусейнова", position: "Директор филиала", branch: "Донецк, ДНР", image: "images/team/donetsk-leader.jpg" },
        { name: "Марина Горина", position: "Директор филиала", branch: "Тарко-Сале", image: "images/team/tarkosale-leader.jpg" },
        { name: "Раджшекхар Бал", position: "Директор филиала", branch: "Кольката, Индия", image: "images/team/kolkata-leader.jpg" }
    ];
    
    teamGrid.innerHTML = teamMembers.map(member => `
        <div class="leader-card">
            <div class="leader-image">
                <img src="${member.image}" alt="${member.name}" style="width:100%; height:100%; object-fit:cover; object-position: center 30%;" onerror="this.src='https://via.placeholder.com/300x300?text=Leader'">
            </div>
            <div class="leader-info">
                <h4>${escapeHtml(member.name)}</h4>
                <span class="leader-position">${escapeHtml(member.position)}</span>
                <span class="leader-branch"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(member.branch)}</span>
            </div>
        </div>
    `).join('');
}
// Load Awards - WITH SIDE ARROWS
async function loadAwards() {
    const container = document.getElementById('awardsList');
    if (!container) return;
    
    let awards = await getAwards();
    
    if (awards.length === 0) {
        container.innerHTML = '<div style="text-align:center; width:100%;">Нет добавленных наград</div>';
        return;
    }
    
    const sectionId = 'awardsScrollContainer';
    
    container.innerHTML = `
        <div class="horizontal-scroll-section">
            <div class="scroll-wrapper-container">
                <button class="scroll-arrow-fixed" onclick="scrollHorizontal('${sectionId}', 'left')" id="${sectionId}-left">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <div class="horizontal-scroll-container" id="${sectionId}">
                    <div class="horizontal-scroll-wrapper">
                        ${awards.map(award => `
                            <div class="award-card horizontal-scroll-card">
                                <div class="award-image">
                                    <img src="${award.image || 'https://via.placeholder.com/320x200?text=Награда'}" alt="${award.title}">
                                </div>
                                <div class="award-content">
                                    <div class="award-title">${escapeHtml(award.title)}</div>
                                    <div><span class="award-org">${escapeHtml(award.organization)}</span><span class="award-year">${award.year}</span></div>
                                    <p class="award-description">${escapeHtml(award.description || '')}</p>
                                    ${award.link ? `<a href="${award.link}" target="_blank" class="award-link">Подробнее →</a>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <button class="scroll-arrow-fixed" onclick="scrollHorizontal('${sectionId}', 'right')" id="${sectionId}-right">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    const scrollContainer = document.getElementById(sectionId);
    if (scrollContainer) {
        setTimeout(() => updateArrowVisibility(sectionId), 100);
        scrollContainer.addEventListener('scroll', () => updateArrowVisibility(sectionId));
        window.addEventListener('resize', () => updateArrowVisibility(sectionId));
    }
}
// Load Moments - WITH SIDE ARROWS
async function loadMoments() {
    const container = document.getElementById('momentsList');
    if (!container) return;
    
    let moments = await getMoments();
    
    if (moments.length === 0) {
        container.innerHTML = '<div style="text-align:center; width:100%; padding:40px;">Нет добавленных видео</div>';
        return;
    }
    
    const sectionId = 'momentsScrollContainer';
    
    container.innerHTML = `
        <div class="horizontal-scroll-section">
            <div class="scroll-wrapper-container">
                <button class="scroll-arrow-fixed" onclick="scrollHorizontal('${sectionId}', 'left')" id="${sectionId}-left">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <div class="horizontal-scroll-container" id="${sectionId}">
                    <div class="horizontal-scroll-wrapper">
                        ${moments.map((moment, index) => {
                            let thumbnailUrl = null;
                            if (moment.thumbnail) {
                                thumbnailUrl = moment.thumbnail;
                            }
                            else if (moment.video_url && (moment.video_url.includes('youtube.com') || moment.video_url.includes('youtu.be'))) {
                                const videoId = getYouTubeId(moment.video_url);
                                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                            }
                            
                            const fullDescription = moment.description || '';
                            const shortDescription = fullDescription.length > 100 ? fullDescription.substring(0, 100) + '...' : fullDescription;
                            const needsReadMore = fullDescription.length > 100;
                            const momentId = `moment-${moment.id}-${index}`;
                            
                            return `
                                <div class="moment-card horizontal-scroll-card" id="${momentId}">
                                    <div class="moment-thumbnail" onclick="playVideo('${escapeHtml(moment.video_url)}', '${escapeHtml(moment.title)}')">
                                        ${thumbnailUrl ? 
                                            `<img src="${thumbnailUrl}" alt="${moment.title}">` : 
                                            `<div style="width:100%; height:100%; background: linear-gradient(135deg, var(--primary), var(--primary-light)); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                                <i class="fab fa-vk" style="font-size:40px; color:white;"></i>
                                                <span style="color:white; font-size:12px; margin-top:8px;">VK Video</span>
                                             </div>`
                                        }
                                        <div class="play-icon"><i class="fas fa-play"></i></div>
                                    </div>
                                    <div class="moment-content">
                                        <h4 class="moment-title">${escapeHtml(moment.title)}</h4>
                                        <div class="moment-description-wrapper" onclick="event.stopPropagation()">
                                            <p class="moment-description-short" id="${momentId}-short">${escapeHtml(shortDescription)}</p>
                                            <div class="moment-description-full" id="${momentId}-full" style="display: none;">${escapeHtml(fullDescription)}</div>
                                            ${needsReadMore ? `<button class="moment-read-more-btn" onclick="event.stopPropagation(); toggleMomentText('${momentId}')">Читать далее →</button>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <button class="scroll-arrow-fixed" onclick="scrollHorizontal('${sectionId}', 'right')" id="${sectionId}-right">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    const scrollContainer = document.getElementById(sectionId);
    if (scrollContainer) {
        setTimeout(() => updateArrowVisibility(sectionId), 100);
        scrollContainer.addEventListener('scroll', () => updateArrowVisibility(sectionId));
        window.addEventListener('resize', () => updateArrowVisibility(sectionId));
    }
}

// Toggle read more/less for moments (add this function AFTER loadMoments)
window.toggleMomentText = function(momentId) {
    const shortText = document.getElementById(`${momentId}-short`);
    const fullText = document.getElementById(`${momentId}-full`);
    const button = document.querySelector(`#${momentId} .moment-read-more-btn`);
    
    if (!shortText || !fullText || !button) return;
    
    if (fullText.style.display === 'none' || fullText.style.display === '') {
        fullText.style.display = 'block';
        shortText.style.display = 'none';
        button.textContent = 'Скрыть ←';
    } else {
        fullText.style.display = 'none';
        shortText.style.display = 'block';
        button.textContent = 'Читать далее →';
    }
};

// Play video in modal - VK videos open in new tab
function playVideo(url, title) {
    // If it's a VK video, open in new tab (most reliable)
    if (url.includes('vk.com')) {
        window.open(url, '_blank');
        return;
    }
    
    // For YouTube and other videos, use modal
    const modal = document.getElementById('videoPlayerModal');
    const container = document.getElementById('videoPlayerContainer');
    
    if (!modal || !container) return;
    
    let embedHtml = '';
    
    // Handle YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = getYouTubeId(url);
        if (videoId) {
            embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width:100%; height:500px; border-radius:12px;"></iframe>`;
        } else {
            embedHtml = `<p>Ошибка: не удалось определить ID видео</p>`;
        }
    } 
    // Handle direct video file
    else if (url.match(/\.(mp4|webm|ogg)$/i)) {
        embedHtml = `<video controls autoplay style="width:100%; height:500px; border-radius:12px;">
                        <source src="${url}" type="video/mp4">
                        Ваш браузер не поддерживает видео
                     </video>`;
    }
    // Handle other URLs
    else {
        embedHtml = `<div style="text-align:center; padding:40px;">
                        <p>Видео не может быть загружено на сайт.</p>
                        <a href="${url}" target="_blank" style="display:inline-block; margin-top:10px; padding:10px 20px; background:#F5A623; color:white; text-decoration:none; border-radius:8px;">Открыть видео</a>
                     </div>`;
    }
    
    container.innerHTML = embedHtml;
    modal.style.display = 'flex';
}

// Helper to extract YouTube ID - SINGLE VERSION
function getYouTubeId(url) {
    if (!url) return '';
    
    // Handle youtu.be format
    if (url.includes('youtu.be')) {
        const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : '';
    }
    
    // Handle youtube.com format
    const regExp = /[?&]v=([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : '';
}
// ============ NEW THEME ANIMATIONS ============

// 1. HALLOWEEN - Falling Pumpkins
function createHalloweenPumpkins(container, count) {
    const items = ['🎃', '👻', '🦇', '💀', '🕷️', '🧙‍♀️'];
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.innerHTML = items[Math.floor(Math.random() * items.length)];
        item.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: -50px;
            font-size: ${25 + Math.random() * 35}px;
            animation: pumpkinFall ${3 + Math.random() * 4}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            transform: rotate(${Math.random() * 360}deg);
            filter: drop-shadow(0 5px 10px rgba(0,0,0,0.3));
        `;
        container.appendChild(item);
    }
}

// 2. KNOWLEDGE DAY - Falling Books
function createKnowledgeBooks(container, count) {
    const items = ['📚', '📖', '📘', '📕', '📗', '✏️', '📓', '🎓'];
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.innerHTML = items[Math.floor(Math.random() * items.length)];
        item.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: -40px;
            font-size: ${20 + Math.random() * 30}px;
            animation: bookFall ${4 + Math.random() * 5}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            transform: rotate(${Math.random() * 360}deg);
        `;
        container.appendChild(item);
    }
}

// 3. ENVIRONMENT DAY - Falling Green Leaves
function createEnvironmentLeaves(container, count) {
    const leaves = ['🍃', '🌿', '🌱', '🍂', '🌳', '💚'];
    for (let i = 0; i < count; i++) {
        const leaf = document.createElement('div');
        leaf.innerHTML = leaves[Math.floor(Math.random() * leaves.length)];
        leaf.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: -30px;
            font-size: ${22 + Math.random() * 25}px;
            animation: greenLeafFall ${4 + Math.random() * 4}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            filter: drop-shadow(0 0 5px #4CAF50);
        `;
        container.appendChild(leaf);
    }
}

// 4. MAY DAY - Falling Labor Symbols
function createMayDaySymbols(container, count) {
    const symbols = ['🌷', '🕊️', '🌸', '🌹', '🌺', '✨', '⭐', '🏵️', '🌻'];
    for (let i = 0; i < count; i++) {
        const symbol = document.createElement('div');
        symbol.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
        symbol.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: -40px;
            font-size: ${20 + Math.random() * 28}px;
            animation: mayDayFall ${3 + Math.random() * 4}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(symbol);
    }
}

function createGriffinFlyRightToLeft(container) {
    const griffin = document.createElement('div');
    griffin.innerHTML = '🦅';
    griffin.style.cssText = `
        position: absolute;
        top: 100px;
        right: -100px;
        font-size: 60px;
        animation: griffinFlyRightToLeft 2.5s ease-in-out forwards;
        filter: drop-shadow(0 0 15px gold);
    `;
    container.appendChild(griffin);
    
    // Add trail behind
    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            const trail = document.createElement('div');
            trail.innerHTML = '✨';
            trail.style.cssText = `
                position: absolute;
                top: ${100 + Math.random() * 20}px;
                right: ${-100 + i * 15}px;
                font-size: ${12 + Math.random() * 15}px;
                opacity: ${1 - i / 25};
                animation: fadeTrail 0.4s ease-out forwards;
                pointer-events: none;
            `;
            container.appendChild(trail);
            setTimeout(() => trail.remove(), 400);
        }, i * 40);
    }
}

// 6. FESTIVAL GREETING TEXT (Fade In/Out)
function showFestivalGreeting(festivalName, customGreeting = null) {
    // Remove existing greeting
    const existingGreeting = document.getElementById('festival-greeting');
    if (existingGreeting) existingGreeting.remove();
    
    const greetings = {
        new_year: '🎄 С НОВЫМ ГОДОМ! 🎄',
        orthodox_christmas: '✝️ С РОЖДЕСТВОМ! ✝️',
        victory_day: '🎖️ С ДНЁМ ПОБЕДЫ! 🎖️',
        russia_day: '🇷🇺 С ДНЁМ РОССИИ! 🇷🇺',
        may_day: '🌷 С ПЕРВОМАЕМ! 🌷',
        environment_day: '🌍 ВСЕМИРНЫЙ ДЕНЬ ОКРУЖАЮЩЕЙ СРЕДЫ! 🌍',
        maslenitsa: '🥞 С МАСЛЕНИЦЕЙ! 🥞',
        griffin_day: '🦅 С ДНЁМ ЗОЛОТОГО ГРИФОНА! 🦅',
        halloween: '🎃 С ХЭЛЛОУИНОМ! 🎃',
        knowledge_day: '📚 С ДНЁМ ЗНАНИЙ! 📚'
    };
    
    const greetingText = customGreeting || greetings[festivalName] || `🎉 ${festivalName.toUpperCase()}! 🎉`;
    
    const greeting = document.createElement('div');
    greeting.id = 'festival-greeting';
    greeting.innerHTML = `
        <div class="greeting-content">
            <span class="greeting-icon">✨</span>
            <span class="greeting-text">${greetingText}</span>
            <span class="greeting-icon">✨</span>
        </div>
    `;
    greeting.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.7));
        backdrop-filter: blur(15px);
        color: #FFD700;
        padding: 20px 40px;
        border-radius: 60px;
        z-index: 10001;
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        white-space: nowrap;
        animation: greetingFade 4s ease-in-out forwards;
        border: 2px solid rgba(255, 215, 0, 0.5);
        box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
        font-family: 'Inter', sans-serif;
        pointer-events: none;
    `;
    
    document.body.appendChild(greeting);
    
    setTimeout(() => {
        if (greeting.parentNode) greeting.remove();
    }, 4000);
}


// Add missing keyframes for new animations
function addNewAnimationKeyframes() {
    if (document.getElementById('new-animation-keyframes')) return;
    
    const keyframes = document.createElement('style');
    keyframes.id = 'new-animation-keyframes';
    keyframes.textContent = `
        @keyframes pumpkinFall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes bookFall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
        
        @keyframes greenLeafFall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(180deg);
                opacity: 0;
            }
        }
        
        @keyframes mayDayFall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
       @keyframes griffinFlyRightToLeft {
    0% {
        right: -100px;
        transform: scale(1);
    }
    50% {
        right: 50%;
        transform: scale(1.2);
        filter: drop-shadow(0 0 30px gold);
    }
    100% {
        right: calc(100% + 100px);
        transform: scale(1);
    }
}
        
        @keyframes greetingFade {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            15% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            85% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(1.2);
                visibility: hidden;
            }
        }
    `;
    document.head.appendChild(keyframes);
}

// Call this to add keyframes
addNewAnimationKeyframes();

// Export for use
window.createHalloweenPumpkins = createHalloweenPumpkins;
window.createKnowledgeBooks = createKnowledgeBooks;
window.createEnvironmentLeaves = createEnvironmentLeaves;
window.createMayDaySymbols = createMayDaySymbols;
window.createGriffinFlyRightToLeft = createGriffinFlyRightToLeft;
window.showFestivalGreeting = showFestivalGreeting;

// Trigger animations after page fully loads
window.addEventListener('load', async function() {
    const themeData = await getActiveTheme();
    if (themeData && themeData.animation && themeData.type !== 'default') {
        let animationType = themeData.animation;
        if (themeData.festivalId) {
            switch(themeData.festivalId) {
                case 'halloween': animationType = 'pumpkins'; break;
                case 'knowledge_day': animationType = 'books'; break;
                case 'environment_day': animationType = 'greenleaves'; break;
                case 'may_day': animationType = 'mayday'; break;
                case 'griffin_day': animationType = 'griffin'; break;
            }
        }
        console.log('🎬 Playing animation:', animationType);
        applySimpleAnimation(animationType);
    }
});

// Universal horizontal scroll function
window.scrollHorizontal = function(containerId, direction) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const cardWidth = 345; // card width (320) + gap (25)
    const scrollAmount = cardWidth * 2;
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    let newScroll;
    if (direction === 'left') {
        newScroll = Math.max(0, currentScroll - scrollAmount);
    } else {
        newScroll = Math.min(maxScroll, currentScroll + scrollAmount);
    }
    
    container.scrollTo({ left: newScroll, behavior: 'smooth' });
};

// Update arrow visibility (disable at edges)
function updateArrowVisibility(containerId) {
    const container = document.getElementById(containerId);
    const leftArrow = document.getElementById(`${containerId}-left`);
    const rightArrow = document.getElementById(`${containerId}-right`);
    
    if (!container || !leftArrow || !rightArrow) return;
    
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    leftArrow.disabled = scrollLeft <= 5;
    rightArrow.disabled = scrollLeft >= maxScroll - 5;
}

// Load hero video from Supabase
async function loadHeroVideo() {
    try {
        // Fetch active hero video from Supabase
        const { data, error } = await supabasePublic
            .from('hero_videos')
            .select('video_url')
            .eq('is_active', true)
            .order('uploaded_at', { ascending: false })
            .limit(1);
        
        let videoUrl = 'videos/hero-bg.mp4'; // Default fallback
        
        if (!error && data && data.length > 0 && data[0].video_url) {
            videoUrl = data[0].video_url;
            console.log('✅ Loading hero video from database:', videoUrl);
        } else {
            console.log('📹 Using default hero video');
        }
        
        // Update the hero video source
        const heroVideo = document.getElementById('heroVideo');
        if (heroVideo) {
            heroVideo.src = videoUrl;
            heroVideo.load();
            
            // Attempt to play (may be blocked by browser)
            heroVideo.play().catch(e => {
                console.log('Video autoplay prevented:', e);
            });
        }
    } catch (err) {
        console.error('Error loading hero video:', err);
    }
}

// Load dynamic stats on home page
async function loadHomeStats() {
    try {
        const stats = await getStats(); // This uses the public API
        console.log("Home Stats Loaded:", stats);

        const volEl = document.getElementById('activeVolunteers');
        const projEl = document.getElementById('completedProjects');
        const helpEl = document.getElementById('helpProvided');

        // Use Math.abs() to handle negative data safely
        const volunteers = Math.abs(stats.active_volunteers) || 150;
        const projects = Math.abs(stats.completed_projects) || 50;
        const help = Math.abs(stats.help_provided) || 5000;

        // Animate UP to the exact backend values
        animateNumberUp(volEl, volunteers, 1500);
        animateNumberUp(projEl, projects, 1200);
        animateNumberUp(helpEl, help, 1800);

    } catch (error) {
        console.error('Failed to load stats:', error);
        
        // Fallback to defaults with animation
        animateNumberUp(document.getElementById('activeVolunteers'), 150, 1500);
        animateNumberUp(document.getElementById('completedProjects'), 50, 1200);
        animateNumberUp(document.getElementById('helpProvided'), 5000, 1800);
    }
}

// Call this on page load
document.addEventListener('DOMContentLoaded', loadHomeStats);

// Animate number counting up
function animateNumberUp(element, target, duration = 1500) {
    if (!element) return;
    
    // Ensure target is a positive integer
    const finalValue = Math.abs(parseInt(target)) || 0;
    let current = 0;
    const increment = finalValue / (duration / 16); // ~60 FPS
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
            element.textContent = finalValue.toLocaleString('ru-RU');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString('ru-RU');
        }
    }, 16);
}