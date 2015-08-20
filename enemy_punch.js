// Enemy - Punch
// Punch is the nastier version of Spike
// Punch uses the base enemy code to move back and forth on a platform. But also does a line of sight check to see if the player is in range.
// If the player is close he fires a bullet.
// Requires:
//  - A child entity called Turret which has the gun turret model
//  - A child entity called BulletOrigin which is the point where the bullet starts
//  - The pc.tween.js library

pc.script.attribute("bulletSpeed", "number", 3, {displayName: "Bullet Speed"}); // speed of the bullet
pc.script.attribute("losRange", "number", 4, {displayName: "Line of Sight Range"}); // distance tank can see player
pc.script.attribute("losCheckInterval", "number", 0.2, {displayName: "Line of Sight Interval"}); // time between los checks
pc.script.attribute("firingInterval", "number", 2, {displayName: "Firing Interval"}); // time between bullets
pc.script.attribute("turretAnimationDuration", "number", 2, {displayName: "Turret Anim Duration"}); // time that firing animation plays
pc.script.attribute("turretAnimationSize", "number", 0.4, {displayName: "Turret Anim Size"}); // time that firing animation plays

pc.script.create('enemy_punch', function (context) {
    var ray = new pc.Vec3(); // temp vector for raycasting
    var rayEnd = new pc.Vec3();
    var impulse = new pc.Vec3(); // temp vector for bullet impulse
    
    var STATE_READY = 0;
    var STATE_FIRING = 1;
    
    // Creates a new EnemyPunch instance
    var EnemyPunch = function (entity) {
        this.entity = entity;
        
        this.script = null;
        this.bullet = null;
        this.bulletOrigin = null;
        
        this.losTimer = 0;
        this.firingTimer = 0;
        this.turretAnimationTimer = 0;
        
        this.previousSpeed = 0;
        
        this.state = STATE_READY;
    };

    EnemyPunch.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            // store main enemy script, this script controls basic movement
            this.script = this.entity.script.enemy;
            
            this.turret = this.entity.findByName("Turret");
            
            this.bullet = this.createBullet();
            this.bullet.enabled = false;
            this.bulletOrigin = this.entity.findByName("BulletOrigin");
        },
    
        // Clone the BulletTemplate entity
        createBullet: function () {
            var bullet = context.root.findByName("BulletTemplate");
            var b = bullet.clone();
            context.root.addChild(b);
            return b;
        },
        
        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (this.state === STATE_READY) {
                // In the ready state we check for Line of Sight on the player
                this.losTimer -= dt;
                if (this.losTimer < 0) {
                    this.losTimer = this.losCheckInterval;
                    this.checkPlayer();
                }
            } else if (this.state === STATE_FIRING) {
                this.firingTimer -= dt;
                if (this.firingTimer < 0) {
                    this.state = STATE_READY;
                    this.entity.script.enemy.unpause();
                }
                
                // In the firing state we update the turret animation
                if (this.turretAnimationTimer > 0) {
                    var p = this.turret.getLocalPosition();
                    p.z = this.turretAnimationSize * -this.entity.script.enemy.direction * (1 - pc.tween.elasticOut(this.turretAnimationDuration - this.turretAnimationTimer, 1, 0.3));
                    this.turret.setLocalPosition(p);
                    this.turretAnimationTimer -= dt;
                }
            }
        },
        
        checkPlayer: function () {
            // Fire a ray forwards to see if it hits the player, if it does call shoot()
            var start = this.turret.getPosition();
            ray.copy(this.entity.forward).scale(this.losRange);
            rayEnd.add2(start, ray);

            context.systems.rigidbody.raycastFirst(start, rayEnd, function (result) {
                if (result.entity && result.entity.script && result.entity.script.platform_character_controller) {
                    // hit the player
                    this.shoot();
                }
            }.bind(this));
        },
        
        shoot: function () {
            if (this.state === STATE_READY) {
                // Change state to firing, and pause the movement
                this.state = STATE_FIRING;
                this.entity.script.enemy.pause();
    
                // Initialize the bullet
                this.bullet.enabled = true;
                this.bullet.setPosition(this.bulletOrigin.getPosition());
                this.bullet.script.bullet.shoot(this.entity.forward.x * this.bulletSpeed);
                
                this.firingTimer = this.firingInterval;
                this.turretAnimationTimer = this.turretAnimationDuration;
            }
        },
        
        // Reset timers and state
        reset: function () {
            this.losTimer = 0;
            this.state = STATE_READY;
            this.bullet.enabled = false;
        }
    };

    return EnemyPunch;
});