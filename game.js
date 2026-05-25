    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    canvas.width = 960;
    canvas.height = 540;

    // =========================
    // SOUNDS
    // =========================
    const shootSound = new Audio("assets/shoot.wav");
    const hitSound = new Audio("assets/hit.wav");

    // =========================
    // PLAYER
    // =========================
    const player = {
        x: 450,
        y: 250,
        size: 32,
        speed: 5,
        health: 100,
        maxHealth: 100
    };

    // =========================
    // ARRAYS
    // =========================
    const bullets = [];
    const enemies = [];
    const particles = [];
    const damageTexts = [];
    const drops = [];
    const explosions = [];
    const shockwaves = [];
    const enemyBullets = [];

    // =========================
    // GAME STATE
    // =========================
    let score = 0;
    let frameCount = 0;
    let screenShake = 0;
    let freezeFrames = 0;
    let dashCooldown = 0;
    let dashTimer = 0;
    let reloading = false;
    let reloadInterval = null;
    let bossActive = false;
    let lastShotTime = 0;
    let coins = 0;
    let notification = "";
    let notificationTimer = 0;

    let gameMode = "normal";

let difficultySettings = {
    easy: {
        enemyCap: 10,
        spawnRate: 0.010,
        enemyHealthMultiplier: 0.8,
        coinMultiplier: 1.3
    },

    normal: {
        enemyCap: 12,
        spawnRate: 0.012,
        enemyHealthMultiplier: 1,
        coinMultiplier: 1
    },

    hard: {
        enemyCap: 16,
        spawnRate: 0.018,
        enemyHealthMultiplier: 1.5,
        coinMultiplier: 0.8
    }
};

    // =========================
    // WAVE SYSTEM
    // =========================
    let wave = 1;
    let enemiesToSpawn = 5;
    let enemiesSpawned = 0;
    let waveRest = true;
    let restTimer = 5;
    let pendingBossWave = false;

    const spawnWarnings = [];

    // =========================
    // PERKS
    // =========================
    let choosingPerk = false;
    const perkChoices = [
        "More Health",
        "Faster Reload",
        "Speed Up",
        "More Damage"
    ];
    let damageMultiplier = 1;
    let reloadMultiplier = 1;
    // =========================
    // SHOP ITEMS
    // =========================
    const shopItems = {

        shotgun: 200,
        smg: 350,
        sniper: 500,
        rocket: 900,

        heal: 100,
        ammo: 80
    };
    // =========================
    // WEAPONS
    // =========================

    const unlockedWeapons = {
        pistol: true,
        shotgun: false,
        smg: false,
        sniper: false,
        rocket: false
    };
    const weapons = {
        pistol: {
            name: "Pistol",
            damage: 1,
            fireRate: 300,
            bulletSpeed: 18,
            bulletCount: 1,
            bulletSize: 6,
            spread: 0.05,
            maxAmmo: 12,
            ammo: 12,
            reserveAmmo: 60,
            maxReserveAmmo: 120,
            reloadTime: 1000,
            color: "yellow"
        },

        shotgun: {
            name: "Shotgun",
            damage: 1.5,
            fireRate: 700,
            bulletSpeed: 16,
            bulletCount: 6,
            bulletSize: 4,
            spread: 0.35,
            maxAmmo: 5,
            ammo: 5,
            reserveAmmo: 30,
            maxReserveAmmo: 60,
            reloadTime: 400,
            color: "orange"
        },

        smg: {
            name: "SMG",
            damage: 0.5,
            fireRate: 100,
            bulletSpeed: 20,
            bulletCount: 1,
            bulletSize: 7,
            spread: 0.12,
            maxAmmo: 30,
            ammo: 30,
            reserveAmmo: 120,
            maxReserveAmmo: 240,
            reloadTime: 1400,
            color: "cyan"
        },
        sniper: {
            name: "Sniper",
            damage: 8,
            fireRate: 1200,
            bulletSpeed: 30,
            bulletCount: 1,
            bulletSize: 5,
            spread: 0,
            maxAmmo: 3,
            ammo: 3,
            reserveAmmo: 15,
            maxReserveAmmo: 30,
            reloadTime: 1800,
            color: "white"
        },
        rocket: {
        name: "Rocket Launcher",
            damage: 6,
            fireRate: 900,
            bulletSpeed: 10,
            bulletCount: 1,
            bulletSize: 10,
            spread: 0,
            maxAmmo: 1,
            ammo: 1,
            reserveAmmo: 5,
            maxReserveAmmo: 10,
            reloadTime: 1600,
            color: "red",

        explosive: true,
        explosionRadius: 120
        }
    };

    let currentWeapon = weapons.pistol;

    // =========================
    // MENUS
    // =========================
    let gameStarted = false;
    let paused = false;
    let showControls = false;

    // =========================
    // INPUT
    // =========================
    const mouse = {
        x: 0,
        y: 0
    };
    const keys = {};
    let mouseDown = false;

    // =========================
    // KEYDOWN EVENT
    // =========================
    document.addEventListener("keydown", e => {
        // ==========================
        // HOME SCREEN
        // ==========================
        if (!gameStarted) {
            if (e.key === "1") {
                gameMode = "easy";
            }
            else if (e.key === "2") {
                gameMode = "normal";
            }
            else if (e.key === "3") {
                gameMode = "hard";
            }
            else {
                return;
            }

            gameStarted = true;
            waveRest = true;
            restTimer = 5;
            return;
        }

        // =========================
        // PAUSE MENU
        // =========================
        if (e.key === "Escape") {
            // OPEN CONTROLS -> BACK TO PAUSE
            if (showControls) {
                showControls = false;
                return;
            }
            // TOGGLE PAUSE
            if (gameStarted) {
                paused = !paused;
            }
            return;
        }

        // =========================
        // PERK CHOICE
        // =========================
        if (choosingPerk) {
            if (e.key === "1") applyPerk(perkChoices[0]);
            if (e.key === "2") applyPerk(perkChoices[1]);
            if (e.key === "3") applyPerk(perkChoices[2]);
            if (e.key === "4") applyPerk(perkChoices[3]);
            return;
        }
        
        if (waveRest && gameStarted) {

    // BUY SHOTGUN
    if (e.key === "2") {

        if (!unlockedWeapons.shotgun &&
            coins >= shopItems.shotgun) {

            coins -= shopItems.shotgun;

            unlockedWeapons.shotgun = true;

            showNotification("SHOTGUN BOUGHT");
        }
    }

    // BUY SMG
    if (e.key === "3") {

        if (!unlockedWeapons.smg &&
            coins >= shopItems.smg) {

            coins -= shopItems.smg;

            unlockedWeapons.smg = true;

            showNotification("SMG BOUGHT");
        }
    }

    // HEAL
    if (e.key === "h") {

        if (coins >= shopItems.heal) {

            coins -= shopItems.heal;

            player.health =
                Math.min(
                    player.health + 40,
                    player.maxHealth
                );

            showNotification("HEALED");
        }
    }

    // AMMO
    if (e.key === "b") {

        if (coins >= shopItems.ammo) {

            coins -= shopItems.ammo;

            currentWeapon.reserveAmmo =
                currentWeapon.maxReserveAmmo;

            showNotification("AMMO REFILLED");
        }
    }
}
        // =========================
        // PAUSE MENU INPUTS
        // =========================
        if (paused) {
            // RESUME
            if (e.key === "1") {
                paused = false;
            }
            // CONTROLS
            if (e.key === "2") {
                showControls = true;
            }
            // HOME SCREEN RESET
            if (e.key === "3") {
                paused = false;
                gameStarted = false;
                showControls = false;

                enemies.length = 0;
                bullets.length = 0;
                particles.length = 0;
                drops.length = 0;

                score = 0;
                wave = 1;
                enemiesToSpawn = 5;
                enemiesSpawned = 0;

                player.health = 100;
                player.maxHealth = 100;
                player.speed = 5;

                damageMultiplier = 1;
                reloadMultiplier = 1;

                currentWeapon.ammo = currentWeapon.maxAmmo;
                currentWeapon.reserveAmmo = currentWeapon.maxReserveAmmo;
                choosingPerk = false;
            }
            return;
        }

        // DASH
        if (e.key.toLowerCase() === "q") {

            if (dashCooldown > 0) {

                showNotification("DASH COOLDOWN");

                return;
            }

            dashTimer = 10;
            dashCooldown = 60;
            screenShake = 15;
        }

        // =========================
        // WEAPON SWITCHING
        // =========================
        if (e.key === "1")
            currentWeapon = weapons.pistol;

        if (e.key === "2") {

            if (!unlockedWeapons.shotgun) {

                showNotification("SHOTGUN LOCKED");
                return;
            }

            currentWeapon = weapons.shotgun;
        }

        if (e.key === "3") {

            if (!unlockedWeapons.smg) {

                showNotification("SMG LOCKED");
                return;
            }

            currentWeapon = weapons.smg;
        }

        if (e.key === "4") {
            if (!unlockedWeapons.sniper) {
                showNotification("SNIPER LOCKED");
                return;
            }
            currentWeapon = weapons.sniper;
        }

        if (e.key === "5") {
            if (!unlockedWeapons.rocket) {
                showNotification("ROCKET LAUNCHER LOCKED");
                return;
            }
            currentWeapon = weapons.rocket;
        }

        // =========================
        // RELOAD
        // =========================
        if (e.key.toLowerCase() === "r" && !reloading && currentWeapon.ammo < currentWeapon.maxAmmo) {
            // SHOTGUN RELOAD (Incremental)
            if (currentWeapon === weapons.shotgun) {
                reloading = true;
                reloadInterval = setInterval(() => {
                    if (currentWeapon.reserveAmmo > 0) {
                        currentWeapon.ammo++;
                        currentWeapon.reserveAmmo--;
                    }
                    if (currentWeapon.ammo >= currentWeapon.maxAmmo || currentWeapon.reserveAmmo <= 0) {
                        currentWeapon.ammo = currentWeapon.maxAmmo;
                        clearInterval(reloadInterval);
                        reloading = false;
                    }
                }, 400 * reloadMultiplier);
            } 
            // MAGAZINE RELOAD (All at once)
            else {

                reloading = true;

                const reloadWeapon = currentWeapon;

                setTimeout(() => {

                    if (currentWeapon !== reloadWeapon) return;

                    // how many bullets needed
                    const neededAmmo =
                        currentWeapon.maxAmmo -
                        currentWeapon.ammo;

                    // only take what's available
                    const ammoToLoad =
                        Math.min(
                            neededAmmo,
                            currentWeapon.reserveAmmo
                        );

                    // add ammo
                    currentWeapon.ammo += ammoToLoad;

                    // remove reserve ammo
                    currentWeapon.reserveAmmo -= ammoToLoad;

                    reloading = false;

                }, currentWeapon.reloadTime * reloadMultiplier);
            }
        }

        keys[e.key.toLowerCase()] = true;
    });

    // =========================
    // KEYUP EVENT
    // =========================
    document.addEventListener("keyup", e => {
        keys[e.key.toLowerCase()] = false;
    });

    // =========================
    // MOUSE EVENT
    // =========================
    canvas.addEventListener("mousemove", e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    // =========================
    // SHOOTING
    // =========================

    canvas.addEventListener("mousedown", () => {

        mouseDown = true;
    });

    canvas.addEventListener("mouseup", () => {

        mouseDown = false;
    });

    function shoot() {

        if (paused || choosingPerk) return;

        if (
            reloading &&
            currentWeapon !== weapons.shotgun
        ) return;

        if (currentWeapon.ammo <= 0) {
            showNotification("OUT OF AMMO");
            return;
        }

        // SHOTGUN INTERRUPT RELOAD
        if (
            currentWeapon === weapons.shotgun &&
            reloading
        ) {

            clearInterval(reloadInterval);

            reloading = false;
        }

        currentWeapon.ammo--;

        const centerX =
            player.x + player.size / 2;

        const centerY =
            player.y + player.size / 2;

        const baseAngle =
            Math.atan2(
                mouse.y - centerY,
                mouse.x - centerX
            );

        // SOUND
        const s = shootSound.cloneNode();

        s.volume = 0.3;

        s.play();

        // BULLETS
        for (
            let b = 0;
            b < currentWeapon.bulletCount;
            b++
        ) {

            const angle =
                baseAngle +
                (Math.random() - 0.5) *
                currentWeapon.spread;

            bullets.push({

                x: centerX,
                y: centerY,

                dx:
                    Math.cos(angle) *
                    currentWeapon.bulletSpeed,

                dy:
                    Math.sin(angle) *
                    currentWeapon.bulletSpeed,

                size: currentWeapon.bulletSize,

                damage: currentWeapon.damage,

                explosive:
                    currentWeapon.explosive || false,

                explosionRadius:
                    currentWeapon.explosionRadius || 0,

                trail: []
            });
        }

        // RECOIL
        player.x -= Math.cos(baseAngle) * 12;
        player.y -= Math.sin(baseAngle) * 12;

        // ROCKET EFFECT
        if (currentWeapon === weapons.rocket) {

            screenShake = 60;

            for (let i = 0; i < 40; i++) {

                particles.push({

                    x: centerX,
                    y: centerY,

                    dx:
                        (Math.random() - 0.5) * 15,

                    dy:
                        (Math.random() - 0.5) * 15,

                    life: 40,

                    size:
                        Math.random() * 10 + 4,

                    color: "red"
                });
            }
        }

        // SHAKE
        screenShake = 20;

        // MUZZLE FLASH
        for (let i = 0; i < 20; i++) {

            particles.push({

                x:
                    centerX +
                    Math.cos(baseAngle) * 20,

                y:
                    centerY +
                    Math.sin(baseAngle) * 20,

                dx:
                    Math.cos(baseAngle) *
                    (Math.random() * 6) +

                    (Math.random() - 0.5) * 8,

                dy:
                    Math.sin(baseAngle) *
                    (Math.random() * 6) +

                    (Math.random() - 0.5) * 8,

                life: 15,

                size:
                    Math.random() * 6 + 2,

                color: "orange"
            });
        }
    }

    // =========================
    // SHOW NOTIFICATION
    // =========================
    function showNotification(text) {

        notification = text;

        notificationTimer = 90;
    }

    // =========================
    // ENEMY SPAWNING
    // =========================
    function spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;

        if (side === 0) { x = Math.random() * canvas.width; y = -40; }
        if (side === 1) { x = canvas.width + 40; y = Math.random() * canvas.height; }
        if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 40; }
        if (side === 3) { x = -40; y = Math.random() * canvas.height; }

        // WARNING MARK POSITIONING
        let warnX = x;
        let warnY = y;

        if (y < 0) warnY = 40;
        if (y > canvas.height) warnY = canvas.height - 40;
        if (x < 0) warnX = 40;
        if (x > canvas.width) warnX = canvas.width - 40;

        spawnWarnings.push({
            x: warnX,
            y: warnY,
            timer: 60
        });

        // ACTUAL SPAWN TIMEOUT
        setTimeout(() => {
            const roll = Math.random();
            let enemy;

            // NORMAL ENEMY
            if (roll < 0.45) {
                enemy = {
                    x, y,
                    type: "normal",
                    size: 32,
                    speed: 2,
                    health: 2,
                    color: "red"
                };
            }
            // FAST ENEMY
            else if (roll < 0.70) {
                enemy = {
                    x, y,
                    type: "fast",
                    size: 20,
                    speed: 4,
                    health: 1,
                    color: "orange"
                };
            }
            // RANGED ENEMY
            else if (roll < 0.88) {
                enemy = {
                    x, y,
                    type: "ranged",
                    size: 28,
                    speed: 1.5,
                    health: 2,
                    color: "cyan",
                    shootCooldown: 0
                };
            }
            // TANK ENEMY
            else if (roll < 0.97) {
                enemy = {
                    x, y,
                    type: "tank",
                    size: 50,
                    speed: 1,
                    health: 5,
                    color: "purple"
                };
            }
            // BOMBER ENEMY
            else {
                enemy = {
                    x, y,
                    type: "bomber",
                    size: 26,
                    speed: 5,
                    health: 1,
                    color: "yellow",
                    explodeRadius: 120
                };
            }
            
            enemy.health *= difficultySettings[gameMode].enemyHealthMultiplier;
            enemies.push(enemy);
        }, 1000);
    }

    function spawnBoss() {

        bossActive = true;

        enemies.push({
            x: canvas.width / 2,
            y: -120,

            type: "boss",

            size: 120,
            speed: 1.5,

            health: 200,
            maxHealth: 200,

            color: "darkred",

            shootCooldown: 0,

            phase: 1,
            spiralAngle: 0,

            dashTimer: 0,
            dashCooldown: 240,
            dashDX: 0,
            dashDY: 0,
            warning: false
        });
    }

    // =========================
    // APPLY PERK
    // =========================
    function applyPerk(perk) {
        if (perk === "More Health") {
            player.maxHealth += 20;
            player.health = Math.min(player.health + 20, player.maxHealth);
        }
        if (perk === "Faster Reload") {
            reloadMultiplier *= 0.5;
        }
        if (perk === "Speed Up") {
            player.speed += 1;
        }
        if (perk === "More Damage") {
            damageMultiplier += 1;
        }
        choosingPerk = false;
    }

    // =========================
    // GAME LOGIC UPDATE
    // =========================
    function update() {
        if (!gameStarted || paused || choosingPerk) return;

        // =========================
        // REST TIMER
        // =========================
        if (waveRest) {

    if (frameCount % 60 === 0) {

        restTimer--;

        if (restTimer <= 0) {

            waveRest = false;

            // BOSS WAVE
            if (pendingBossWave) {

                spawnBoss();

                pendingBossWave = false;
            }
        }
    }
}

        // =========================
        // WAVE SPAWNING
        // =========================
        if (!waveRest) {
            if (enemiesSpawned < enemiesToSpawn && enemies.length < difficultySettings[gameMode].enemyCap) {
                if (Math.random() < difficultySettings[gameMode].spawnRate) {
                    spawnEnemy();
                    enemiesSpawned++;
                }
            }
        }

        // shoot on mouse hold
        if (
            mouseDown &&
            Date.now() - lastShotTime >
            currentWeapon.fireRate
        ) {

            shoot();

            lastShotTime = Date.now();
        }

        // DASH PARTICLES
        if (dashTimer > 0) {
            particles.push({
                x: player.x + player.size / 2,
                y: player.y + player.size / 2,
                dx: (Math.random() - 0.5) * 4,
                dy: (Math.random() - 0.5) * 4,
                life: 15,
                size: 6,
                color: "cyan"
            });
        }

        // HIT FREEZE FRAMES
        if (freezeFrames > 0) {
            freezeFrames--;
            return;
        }

        // =========================
        // MOVEMENT
        // =========================
        let moveX = 0;
        let moveY = 0;

        if (keys["w"]) moveY -= 1;
        if (keys["s"]) moveY += 1;
        if (keys["a"]) moveX -= 1;
        if (keys["d"]) moveX += 1;

        const length = Math.hypot(moveX, moveY);
        if (length > 0) {
            moveX /= length;
            moveY /= length;
        }

        let currentSpeed = player.speed;

        // APPLY DASH SPEED
        if (dashTimer > 0) {
            currentSpeed = 14;
            dashTimer--;
            screenShake = 8;
        }

        player.x += moveX * currentSpeed;
        player.y += moveY * currentSpeed;

        // MAP BOUNDS COLLISION
        player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
        player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

        if (dashCooldown > 0) dashCooldown--;

        // =========================
        // UPDATE BULLETS
        // =========================
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];

            bullet.trail.push({ x: bullet.x, y: bullet.y });
            if (bullet.trail.length > 5) bullet.trail.shift();

            bullet.x += bullet.dx;
            bullet.y += bullet.dy;

            // Clean up offscreen bullets
            if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
                bullets.splice(i, 1);
            }
        }

        // =========================
        // UPDATE ENEMY BULLETS
        // =========================
        for (let i = enemyBullets.length - 1; i >= 0; i--) {

            const bullet = enemyBullets[i];

            bullet.x += bullet.dx;
            bullet.y += bullet.dy;

            const dx = bullet.x - player.x;
            const dy = bullet.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 20) {

                player.health -= 10;

                screenShake = 25;

                enemyBullets.splice(i, 1);

                if (player.health <= 0) {
                    alert("Game Over!");
                    location.reload();
                }
            }

            if (
                bullet.x < 0 ||
                bullet.x > canvas.width ||
                bullet.y < 0 ||
                bullet.y > canvas.height
            ) {
                enemyBullets.splice(i, 1);
            }
        }
        // =========================
        // UPDATE ENEMIES
        // =========================
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);

            if (
                enemy.type !== "boss" ||
                enemy.dashTimer <= 0
            ) {
                enemy.x += Math.cos(angle) * enemy.speed;
                enemy.y += Math.sin(angle) * enemy.speed;
            }

            if (enemy.type === "ranged") {

                enemy.shootCooldown--;

                if (enemy.shootCooldown <= 0) {

                    const angle = Math.atan2(
                        player.y - enemy.y,
                        player.x - enemy.x
                    );

                    enemyBullets.push({
                        x: enemy.x,
                        y: enemy.y,
                        dx: Math.cos(angle) * 6,
                        dy: Math.sin(angle) * 6,
                        size: 10
                });

                    enemy.shootCooldown = 90;
                }
            }

            if (enemy.type === "boss") {

                if (
                    enemy.phase === 1 &&
                    enemy.health <= enemy.maxHealth / 2
                ) {

                    enemy.phase = 2;

                    screenShake = 50;

                    for (let p = 0; p < 80; p++) {
                        particles.push({
                            x: enemy.x + enemy.size / 2,
                            y: enemy.y + enemy.size / 2,

                            dx: (Math.random() - 0.5) * 15,
                            dy: (Math.random() - 0.5) * 15,

                            life: 50,
                            size: Math.random() * 10 + 4,

                            color: "orange"
                        });
                    }
                    spawnEnemy();
                }

                if (
                    enemy.phase >= 2 &&
                    Math.random() < 0.003
                ) {
                    shockwaves.push({

                        x: enemy.x + enemy.size / 2,
                        y: enemy.y + enemy.size / 2,

                        radius: 20,
                        maxRadius: 400,

                        speed: 8,

                        life: 120
                    });

                    screenShake = 30;
                }

                enemy.dashCooldown--;

                if (
                    enemy.phase >= 2 &&
                    enemy.dashCooldown <= 0 &&
                    enemy.dashTimer <= 0
                ) {

                    enemy.warning = true;

                    const angle = Math.atan2(
                        player.y - enemy.y,
                        player.x - enemy.x
                    );

                    enemy.dashDX = Math.cos(angle) * 18;
                    enemy.dashDY = Math.sin(angle) * 18;

                    enemy.dashTimer = 40;
                    enemy.dashCooldown = 240;
                }

                if (enemy.dashTimer > 0) {

                    enemy.dashTimer--;

                    // WARNING PHASE
                    if (enemy.dashTimer > 20) {

                        screenShake = 5;

                        for (let i = 0; i < 3; i++) {
                            particles.push({
                                x: enemy.x + enemy.size / 2,
                                y: enemy.y + enemy.size / 2,

                                dx: (Math.random() - 0.5) * 8,
                                dy: (Math.random() - 0.5) * 8,

                                size: 8,
                                life: 20,

                                color: "red"
                            });
                        }
                    }

                    // DASH PHASE
                    else {

                        enemy.warning = false;

                        enemy.x += enemy.dashDX;
                        enemy.y += enemy.dashDY;

                        screenShake = 12;
                    }
                }

                enemy.shootCooldown--;

                if (enemy.shootCooldown <= 0) {
                    
                    //arc attack pattern
                    for (let a = -2; a < 2; a++) {

                        for (let a = -2; a <= 2; a++) {

                            const angle =
                                Math.atan2(
                                    player.y - enemy.y,
                                    player.x - enemy.x
                                ) + a * 0.25;

                            enemyBullets.push({
                                x: enemy.x + enemy.size / 2,
                                y: enemy.y + enemy.size / 2,

                                dx: Math.cos(angle) * 5,
                                dy: Math.sin(angle) * 5,

                                size: 14
                            });
                        }
                    }

                    //spiral attack pattern
                    if (enemy.phase === 2) {

                        enemy.spiralAngle += 0.15;

                        enemyBullets.push({
                            x: enemy.x + enemy.size / 2,
                            y: enemy.y + enemy.size / 2,

                            dx: Math.cos(enemy.spiralAngle) * 7,
                            dy: Math.sin(enemy.spiralAngle) * 7,

                            size: 10
                        });
                    }

                    enemy.shootCooldown = 90;

                    screenShake = 20;
                }
            }

            // PLAYER DAMAGE HITBOX
            const pdx = player.x - enemy.x;
            const pdy = player.y - enemy.y;
            const playerDistance = Math.sqrt(pdx * pdx + pdy * pdy);

            if (playerDistance < 30 && dashTimer <= 0) {
                player.health -= 1;
                screenShake = 15;

                if (enemy.type === "bomber") {

                    explosions.push({
                        x: enemy.x,
                        y: enemy.y,

                        radius: enemy.explodeRadius,

                        damage: 6,

                        life: 20
                    });
                    enemies.splice(i, 1);
                    screenShake = 50;
                    continue;
                }

                if (player.health <= 0) {
                    alert("Game Over! Score: " + score);
                    location.reload();
                }
            }

            // BULLET IMPACT DETECTION
            for (let j = bullets.length - 1; j >= 0; j--) {
                const bullet = bullets[j];
                const dx = bullet.x - enemy.x;
                const dy = bullet.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < enemy.size / 2 + bullet.size / 2) {
                    const h = hitSound.cloneNode();
                    h.volume = 0.4;
                    h.play();

                    freezeFrames = 4;
                    enemy.health -= bullet.damage * damageMultiplier;
                    damageTexts.push({

                        x: enemy.x,
                        y: enemy.y,

                        text: Math.floor(
                            bullet.damage * damageMultiplier
                        ),

                        life: 40
                    });
                    bullets.splice(j, 1);
                    if (bullet.explosive) {
                        explosions.push({
                            x: bullet.x,
                            y: bullet.y,
                            radius: bullet.explosionRadius,
                            damage: bullet.damage,
                            life: 20
                        });

                        screenShake = 50;
                    }
                    screenShake = 30;

                    // ENEMY DIE LOGIC
                    if (enemy.health <= 0) {
                        if (enemy.type === "boss") {
                            bossActive = false;

                            for (let p = 0; p < 150; p++) {
                                particles.push({
                                    x: enemy.x + enemy.size / 2,
                                    y: enemy.y + enemy.size / 2,

                                    dx: (Math.random() - 0.5) * 20,
                                    dy: (Math.random() - 0.5) * 20,

                                    life: 60,
                                    size: Math.random() * 12 + 4,

                                    color: "red"
                                });
                            }

                            screenShake = 80;
                        }
                        enemies.splice(i, 1);
                        score++;

                        // Item Spawn Drop
                        if (Math.random() < 0.25) {
                            drops.push({
                                x: enemy.x,
                                y: enemy.y,
                                type: Math.random() < 0.4 ? "health" : "ammo"
                            });
                        }

                        // On-death explosion particles
                        const particleCount = enemy.type === "tank" ? 50 : 25;
                        for (let p = 0; p < particleCount; p++) {
                            particles.push({
                                x: enemy.x,
                                y: enemy.y,
                                dx: (Math.random() - 0.5) * 12,
                                dy: (Math.random() - 0.5) * 12,
                                life: 30,
                                size: Math.random() * 8 + 2,
                                color: enemy.color
                            });
                        }
                        if (enemy.type === "normal") coins += Math.floor(10 * difficultySettings[gameMode].coinMultiplier);
                        if (enemy.type === "fast") coins += Math.floor(15 * difficultySettings[gameMode].coinMultiplier);
                        if (enemy.type === "ranged") coins += Math.floor(20 * difficultySettings[gameMode].coinMultiplier);
                        if (enemy.type === "tank") coins += Math.floor(35 * difficultySettings[gameMode].coinMultiplier);
                        if (enemy.type === "bomber") coins += Math.floor(25 * difficultySettings[gameMode].coinMultiplier);
                        if (enemy.type === "boss") coins += Math.floor(250 * difficultySettings[gameMode].coinMultiplier);
                    }
                    break;
                }
            }
        }

        // =========================
        // UPDATE EXPLOSIONS
        // =========================
        for (let e = explosions.length - 1; e >= 0; e--) {
            const explosion = explosions[e];

            if (!explosion.hit) {

                for (let i = enemies.length - 1; i >= 0; i--) {
                    const enemy = enemies[i];

                    const dx = enemy.x - explosion.x;
                    const dy = enemy.y - explosion.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < explosion.radius) {

                        enemy.health -= explosion.damage;

                        if (enemy.health <= 0) {

                            // BOMBER CHAIN EXPLOSION
                            if (enemy.type === "bomber") {

                                explosions.push({
                                    x: enemy.x,
                                    y: enemy.y,

                                    radius: enemy.explodeRadius,

                                    damage: 6,

                                    life: 20
                                });

                                screenShake = 40;
                            }

                            enemies.splice(i, 1);

                            score++;
                        }
                    }
                }

                explosion.hit = true;
                // DAMAGE PLAYER
const pdx = player.x - explosion.x;
const pdy = player.y - explosion.y;

const playerDistance =
    Math.sqrt(pdx * pdx + pdy * pdy);

if (playerDistance < explosion.radius) {

    player.health -= explosion.damage;

    screenShake = 40;

    if (player.health <= 0) {
        alert("Game Over! Score: " + score);
        location.reload();
    }
}
            }

            explosion.life--;

            if (explosion.life <= 0) {
                explosions.splice(e, 1);
            }
        }

        // =========================
        // UPDATE SHOCKWAVES
        // =========================
        for (let i = shockwaves.length - 1; i >= 0; i--) {

            const wave = shockwaves[i];

            wave.radius += wave.speed;
            wave.life--;

            // PLAYER DISTANCE
            const dx = player.x + player.size / 2 - wave.x;
            const dy = player.y + player.size / 2 - wave.y;

            const distance = Math.sqrt(dx * dx + dy * dy);

            // HIT WINDOW
            if (
                distance > wave.radius - 20 &&
                distance < wave.radius + 20
            ) {

                // DASH IMMUNITY
                if (dashTimer <= 0) {

                    player.health -= 1;

                    screenShake = 20;
                }
            }

            if (
                wave.radius >= wave.maxRadius ||
                wave.life <= 0
            ) {
                shockwaves.splice(i, 1);
            }
        }

        // =========================
        // UPDATE PICKUPS (DROPS)
        // =========================
        for (let i = drops.length - 1; i >= 0; i--) {
            const drop = drops[i];
            const dx = player.x - drop.x;
            const dy = player.y - drop.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 40) {
                if (drop.type === "health") {
                    player.health = Math.min(player.health + 25, player.maxHealth);
                }
                if (drop.type === "ammo") {
                    currentWeapon.reserveAmmo = Math.min(currentWeapon.reserveAmmo + 24, currentWeapon.maxReserveAmmo);
                }
                drops.splice(i, 1);
            }
        }

        // =========================
        // UPDATE PARTICLES
        // =========================
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.life--;
            particle.dx *= 0.98;
            particle.dy *= 0.98;

            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }

        // =========================
        // UPDATE DAMAGE TEXTS
        // =========================
        for (let i = damageTexts.length - 1; i >= 0; i--) {

            const d = damageTexts[i];

            d.y -= 1;
            d.life--;

            if (d.life <= 0) {
                damageTexts.splice(i, 1);
            }
        }

        // =========================
        // WAVE COMPLETE CHECK
        // =========================
        if (
            enemies.length === 0 &&
            enemiesSpawned >= enemiesToSpawn &&
            !waveRest &&
            (!bossActive || waveRest)
        ) {
            waveRest = true;
            choosingPerk = true;
            restTimer = 5;
            wave++;
            coins += wave * 20;
            if (wave % 5 === 0) {
                pendingBossWave = true;
            }
            enemiesSpawned = 0;
            enemiesToSpawn += 2;
            player.health = Math.min(player.health + 20, player.maxHealth);
        }

        screenShake *= 0.9;
    }

    // =========================
    // DRAW PLAYER
    // =========================
    function drawPlayer() {
        const centerX = player.x + player.size / 2;
        const centerY = player.y + player.size / 2;
        const angle = Math.atan2(mouse.y - centerY, mouse.x - centerX);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        // Body Shape
        ctx.fillStyle = "lime";
        ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);

        // Gun Line
        ctx.fillStyle = "white";
        ctx.fillRect(0, -4, 20, 8);
        ctx.restore();
    }

    // =========================
    // CORE RENDER (DRAW)
    // =========================
    function draw() {
        // =========================
        // HOME SCREEN
        // =========================
        if (!gameStarted) {
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            
            ctx.font = "64px Arial";
            ctx.fillText("2D SHOOTER", canvas.width / 2, 160);

            ctx.font = "32px Arial";
            ctx.fillText("Select Difficulty To Start", canvas.width / 2, 280);

            ctx.font = "24px Arial";
            ctx.fillText("Keyboard to control | Mouse to aim and shoot", canvas.width / 2, 360);

            ctx.font = "28px Arial";

            ctx.font = "28px Arial";

            ctx.fillText("1 = Easy", canvas.width / 2, 420);
            ctx.fillText("2 = Normal", canvas.width / 2, 470);
            ctx.fillText("3 = Hard", canvas.width / 2, 520);
            
            ctx.textAlign = "left";
            return;
        }

        // SCREEN SHAKE CALCULATIONS
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;

        ctx.save();
        ctx.translate(shakeX, shakeY);

        // BACKGROUND
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // LAYER 1: ENTITIES
        drawPlayer();

        // DRAW BULLETS & TRAILS
        for (const bullet of bullets) {
            for (let i = 0; i < bullet.trail.length; i++) {
                const t = bullet.trail[i];
                ctx.globalAlpha = i / bullet.trail.length;
                ctx.fillStyle = "orange";
                ctx.fillRect(t.x, t.y, bullet.size, bullet.size);
            }
            ctx.globalAlpha = 1;
            ctx.fillStyle = "yellow";
            ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
        }
        for (const bullet of enemyBullets) {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // DRAW ENEMIES
        for (const enemy of enemies) {
            if (enemy.type === "bomber") {
                ctx.fillStyle =
                    Math.floor(frameCount / 6) % 2
                    ? "red"
                    : "yellow";
            }
            if (enemy.type === "boss" && enemy.phase === 2) {
                ctx.fillStyle = "orange";
            }
            else {
                ctx.fillStyle = enemy.color;
            }
            if (enemy.warning) {

            ctx.fillStyle =
                Math.floor(frameCount / 5) % 2
                ? "white"
                : "red";
        }
            ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        }

        // DRAW DROPS
        for (const drop of drops) {
            ctx.fillStyle = drop.type === "health" ? "lime" : "cyan";
            ctx.fillRect(drop.x, drop.y, 20, 20);
        }

        // DRAW EXPLOSIONS
        for (const explosion of explosions) {
            ctx.globalAlpha = explosion.life / 20;

            ctx.beginPath();
            ctx.arc(
                explosion.x,
                explosion.y,
                explosion.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = "orange";
            ctx.fill();

            ctx.globalAlpha = 1;
        }

        // DRAW SHOCKWAVES
        for (const wave of shockwaves) {

            ctx.beginPath();

            ctx.arc(
                wave.x,
                wave.y,
                wave.radius,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle = "cyan";
            ctx.lineWidth = 8;

            ctx.globalAlpha = wave.life / 120;

            ctx.stroke();

            ctx.globalAlpha = 1;
        }

        // DRAW PARTICLES
        for (const particle of particles) {
            ctx.globalAlpha = particle.life / 30;
            ctx.fillStyle = particle.color || "orange";
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        }
        ctx.globalAlpha = 1;

        // DRAW DAMAGE TEXTS
        for (const d of damageTexts) {

            ctx.globalAlpha = d.life / 40;

            ctx.fillStyle = "white";

            ctx.font = "24px Arial";

            ctx.fillText(
                d.text,
                d.x,
                d.y
            );

            ctx.globalAlpha = 1;
        }

        // DRAW SPAWN WARNING SYSTEM
        for (let i = spawnWarnings.length - 1; i >= 0; i--) {
            const w = spawnWarnings[i];
            ctx.fillStyle = "red";
            ctx.font = "48px Arial";
            ctx.textAlign = "center";
            ctx.fillText("!", w.x, w.y);

            w.timer--;
            if (w.timer <= 0) {
                spawnWarnings.splice(i, 1);
            }
        }
        ctx.textAlign = "left";
        ctx.restore();

        // =========================
        // LAYER 2: HEADS UP DISPLAY (UI)
        // =========================
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("Score: " + score, 20, 40);
        ctx.fillText("Health: " + player.health + " / " + player.maxHealth, 20, 70);
        ctx.fillText("Weapon: " + currentWeapon.name, 20, 100);
        ctx.fillText("Ammo: " + currentWeapon.ammo + " / " + currentWeapon.maxAmmo + " | Reserve: " + currentWeapon.reserveAmmo, 20, 130);

        ctx.textAlign = "center";
        ctx.fillText("Wave: " + wave, canvas.width / 2, 40);
        ctx.textAlign = "left";

        ctx.fillText("Coins: " + coins, 20, 180);

        // DISPLAY WAVE BREAK TIMERS
        if (waveRest) {
            ctx.fillStyle = "yellow";
            ctx.font = "32px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Next Wave In: " + restTimer, canvas.width / 2, 80);
            ctx.textAlign = "left";
            ctx.fillStyle = "white";

ctx.font = "24px Arial";

ctx.fillText(
    "SHOP",
    canvas.width / 2 - 40,
    140
);

ctx.fillText(
    "2 - Shotgun ($200)",
    canvas.width / 2 - 120,
    190
);

ctx.fillText(
    "3 - SMG ($350)",
    canvas.width / 2 - 120,
    230
);
ctx.fillText(
    "4 - Sniper ($500)",
    canvas.width / 2 - 120,
    270
);
ctx.fillText(
    "5 - Rocket Launcher ($800)",
    canvas.width / 2 - 120,
    310
);
ctx.fillText(
    "H - Heal ($100)",
    canvas.width / 2 - 120,
    350
);

ctx.fillText(
    "B - Ammo ($80)",
    canvas.width / 2 - 120,
    390
);
        }

        // STATUS MESSAGES
        if (reloading) {
            ctx.fillStyle = "yellow";
            ctx.fillText("RELOADING...", 20, 160);
        }

        // DASH BAR COOLDOWN GRAPHIC
        ctx.fillStyle = "gray";
        ctx.fillRect(20, 190, 200, 20);
        ctx.fillStyle = "cyan";
        ctx.fillRect(20, 190, 200 * (1 - dashCooldown / 60), 20);

        // BOSS HEALTH BAR
        const boss = enemies.find(e => e.type === "boss");

        if (boss) {

            ctx.fillStyle = "black";
            ctx.fillRect(180, 20, 600, 30);

            ctx.fillStyle = "red";
            ctx.fillRect(
                180,
                20,
                600 * (boss.health / boss.maxHealth),
                30
            );

            ctx.strokeStyle = "white";
            ctx.strokeRect(180, 20, 600, 30);

            ctx.fillStyle = "white";
            ctx.font = "22px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                "BOSS",
                canvas.width / 2,
                42
            );

            ctx.textAlign = "left";
        }

        // =========================
        // PERK CHOICE MENU MODAL
        // =========================
        if (choosingPerk) {
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "white";
            ctx.font = "40px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Choose A Perk", canvas.width / 2, 120);

            ctx.font = "28px Arial";
            for (let i = 0; i < perkChoices.length; i++) {
                ctx.fillText((i + 1) + ". " + perkChoices[i], canvas.width / 2, 220 + i * 70);
            }
            ctx.textAlign = "left";
        }

        // =========================
        // NOTIFICATION TEXT
        // =========================
        if (notificationTimer > 0) {

            ctx.fillStyle = "red";

            ctx.font = "32px Arial";

            ctx.textAlign = "center";

            ctx.fillText(
                notification,
                canvas.width / 2,
                canvas.height - 40
            );

            ctx.textAlign = "left";

            notificationTimer--;
        }

        // =========================
        // PAUSE OVERLAY MODAL
        // =========================
        if (paused) {
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            
            ctx.font = "52px Arial";
            ctx.fillText("PAUSED", canvas.width / 2, 140);

            ctx.font = "30px Arial";
            ctx.fillText("1 - Resume", canvas.width / 2, 240);
            ctx.fillText("2 - Controls", canvas.width / 2, 300);
            ctx.fillText("3 - Home Screen", canvas.width / 2, 360);
            ctx.textAlign = "left";
        }

        // =========================
        // CONTROLS LIST DIALOGUE
        // =========================
        if (showControls) {
            ctx.fillStyle = "rgba(0,0,0,0.9)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            
            ctx.font = "52px Arial";
            ctx.fillText("CONTROLS", canvas.width / 2, 100);

            ctx.font = "28px Arial";
            const controls = [
                "WASD - Move",
                "Mouse Click - Shoot",
                "Q - Dash",
                "R - Reload",
                "1 - Pistol",
                "2 - Shotgun",
                "3 - SMG",
                "4 - Sniper",
                "5 - Rocket Launcher",
                "H - Heal (Shop)",
                "B - Ammo (Shop)",
                "ESC - Pause"
            ];

            for (let i = 0; i < controls.length; i++) {
                ctx.fillText(controls[i], canvas.width / 2, 200 + i * 50);
            }

            ctx.font = "22px Arial";
            ctx.fillText("Press ESC to return", canvas.width / 2, 500);
            ctx.textAlign = "left";
        }
    }

    // =========================
    // MAIN ENGINE LOOP
    // =========================
    function gameLoop() {
        frameCount++;
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Initialization kick-off
    gameLoop();
