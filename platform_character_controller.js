pc.script.attribute("moveImpulse", "number", 0.5, {displayName: "Move Impulse"}); // Horizontal impulse to apply when the left or right key is down.
pc.script.attribute("jumpImpulse", "number", 15, {displayName: "Jump Impulse"}); // Vertical impulse to apply when the jump key is pressed.
pc.script.attribute("minRunSpeed", "number", 1, {displayName: "Min Run Speed"}); // Minimum speed at which the run animation will play.
pc.script.attribute("jumpGraceTime", "number", 0.1, {displayName: "Jump Grace Time"}); // Extra time allowed to jump after falling off a platform.

// Platform Character Controller
// This is the main player controler script
// It handles moving the player, playing animations, death and resetting
// Requires: 
//  - A child entity called "Model" which has the model component and animation component. Animations as defined in the ANIMATIONS list.
//  - player_input.js script should also be attached
//  - damagable.js script should also be attached


pc.script.create('platform_character_controller', function (context) {    
    var CHECK_GROUND_RAY = new pc.Vec3(0, -0.7, 0);

    // Names of animation assets mapped to simple names like "idle"
    var ANIMATIONS = {
        "idle": "Playbot_idle",
        "run": "Playbot_run",
        "jump": "Playbot_jump",
        "die": "Playbot_die"
    };
    
    // Animation states
    var STATE_IDLE = 0;
    var STATE_RUNNING = 1;
    var STATE_JUMPING = 2;
    
    // Temp vector used to fire raycast
    var raycastEnd = new pc.Vec3();
    
    var PlatformCharacterController = function (entity) {
        this.entity = entity;
        
        this.onGround = false;
        this.groundEntity = null;
        
        this.jumpTimer = 0;
        this.fallTimer = 0;
        
        this.model = null;
        
        this.origin = null;
        
        this.dead = false;
        
        this.animationState = STATE_IDLE;
    };

    PlatformCharacterController.prototype = {
        initialize: function () {
            // store the original position for reseting
            this.origin = new pc.Vec3().copy(this.entity.getPosition());
            
            // Get the child entity that has the model and animation component
            this.model = this.entity.findByName("Model");
            
            // Attach an event to the damagable script to detect when the player is killed
            this.entity.script.damagable.on("killed", this.onKilled, this);
            
            // Uncomment this line to display collision volumes
            // context.systems.collision.setDebugRender(true);
        },
        
        update: function (dt) {
            // Don't update movement while dead
            if (this.dead) {
                return;
            }
    
            // Decrement timers
            this.jumpTimer -= dt;
            this.fallTimer -= dt;
    
            // Check to see if player is on the ground
            this.checkOnGround();
    
            var vel = this.entity.rigidbody.linearVelocity;
            var speed = vel.length();
            
            // Apply drag if in motion
            if (Math.abs(vel.x) > 0) {
                vel.x = vel.x * 0.9;                
                this.entity.rigidbody.linearVelocity = vel;
            }
            
            // Update the animation            
            this.updateAnimation(vel, dt);
        },
        
        updateAnimation: function(vel, dt) {
            var speed = Math.sqrt(vel.x*vel.x + vel.z*vel.z)
            if (this.animationState === STATE_IDLE) {
                if (speed > this.minRunSpeed) {
                    // start running
                    this.run();
                }
            } else if (this.animationState === STATE_RUNNING) {
                if (speed < this.minRunSpeed) {
                    // stop running
                    this.idle();
                }
            }
        },
        
        // Function called by player_input to move the player
        moveLeft: function () {
            if (!this.dead) {
                this.entity.rigidbody.applyImpulse(-this.moveImpulse, 0, 0);
                this.model.setEulerAngles(0, -90, 0);
            }
        },
        
        // Function called by player_input to move the player
        moveRight: function () {
            if (!this.dead) {
                this.entity.rigidbody.applyImpulse(this.moveImpulse, 0, 0);
                this.model.setEulerAngles(0, 90, 0);
            }
        },
        
        // Function called by player_input to jump the player
        jump: function () {
            if (!this.dead && this.jumpTimer < 0) {
                if (this.onGround || this.fallTimer > 0) {
                    this.entity.rigidbody.applyImpulse(0, this.jumpImpulse, 0);
                    
                    // Start the jump animation
                    this.model.animation.play(ANIMATIONS.jump, 0.1);
                    this.model.animation.speed = 1;
                    this.model.animation.loop = false;
                    
                    this.animationState = STATE_JUMPING;
                    this.jumpTimer = 0.1;
                }
            }
        },

        // Switch to run animation state and start the run animation
        run: function () {
            this.model.animation.play(ANIMATIONS.run, 0.1);
            this.model.animation.speed = 1;
            this.model.animation.loop = true;
            this.animationState = STATE_RUNNING;
        },
        
        // Switch to idle animation state and start the idle animation
        idle: function () {
            this.model.animation.play(ANIMATIONS.idle, 0.1);
            this.model.animation.loop = true;
            this.model.animation.speed = 1;
            this.animationState = STATE_IDLE;
        },
        
        // Switch to idle animation state and start the idle animation
        land: function () {
            this.model.animation.play(ANIMATIONS.idle, 0.1);
            this.model.animation.loop = true;
            this.model.animation.speed = 1;
            this.animationState = STATE_IDLE;
        },

        checkOnGround: function () {
            // Immediately after jumping we don't check for ground
            if (this.jumpTimer > 0) {
                return;
            }

            var raycastStart = this.entity.getPosition();
            raycastEnd.add2(raycastStart, CHECK_GROUND_RAY);
            
            var wasOnGround = this.onGround;
            this.onGround = false;
            this.groundEntity = null;
            
            // fire ray down and see if it hits another entity
            context.systems.rigidbody.raycastFirst(raycastStart, raycastEnd, function (result) {
                if (result.entity) {
                    this.onGround = true;
                    this.groundEntity = result.entity;
                    if (this.animationState === STATE_JUMPING) {
                        this.land();
                    }
                    if (wasOnGround) {
                        this.fallTimer = this.jumpGraceTime;
                    }
                }
            }.bind(this));
        },
        
        getGround: function () {
            return this.groundEntity;    
        },
        
        // Called by damagable script when this entity is killed
        onKilled: function (killer) {
            if (!this.dead) {
                this.model.animation.play(ANIMATIONS.die, 0.1);
                this.model.animation.speed = 1.5;
                this.model.animation.loop = false;
                this.dead = true;
                var v = this.entity.rigidbody.linearVelocity;
                v.x = 0;
                this.entity.rigidbody.linearVelocity = v;
                
                // stop body sliding
                this.entity.rigidbody.friction = 1;
                
                setTimeout(function () {
                    this.reset(this.origin);
                }.bind(this), 2000);
            }
        },
        
        // Reset the player back to a new position
        reset: function (origin) {
            this.entity.setPosition(origin);
            this.entity.rigidbody.syncEntityToBody();
            this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
            this.entity.rigidbody.friction = 0;
            this.dead = false;
            this.idle();
        }
    };
    
    
    return PlatformCharacterController;
});