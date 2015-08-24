pc.script.attribute("speed", "number", 2);
pc.script.attribute("turnSpeed", "number", 90);

// Enemy Unit
// The default enemy movement
// This enemy will move back and forth along the platform it is created on, turning at each end.
// Contact with this enemy will kill the player.


pc.script.create('enemy', function (context) {
    var RAYCAST_RAY = new pc.Vec3(0, -0.6, 0);
    
    var STATE_IDLE = 0;
    var STATE_MOVE = 1;
    var STATE_TURN = 2;
    
    var Enemy = function (entity) {
        this.entity = entity;
                
        this.speed = 5;
        this._speed = null; // backup speed when paused
        
        this.direction = 1;
        this.movementState = STATE_MOVE;
        this.turningAngle = 0;
        
        // The platform this tank belongs on
        this.platform = null;
        this.minX = 0;
        this.maxX = 0;
        this.halfWidth = 0.5;
    };

    Enemy.prototype = {
        initialize: function () {
            // set up the collision event which will detect collision with the player
            this.entity.collision.on('collisionstart', this.onTrigger, this);
            
            
            setTimeout(function () { // Hack: delay the raycast til after initialization to ensure physics world is complete (this is a bug)
                // set the platform this tank belongs to.
                this.setupPlatform();    
            }.bind(this), 0);
            
            
            // Store the size of the tank to prevent it overlapping when it gets to the edges
            this.halfWidth = this.entity.collision.radius;
            this.turningAngle = this.entity.getEulerAngles().y;
        },
        
        setupPlatform: function () {
            // Create a start and end point for a ray
            var raycastStart = this.entity.getPosition();
            var raycastEnd = new pc.Vec3();
            raycastEnd.add2(raycastStart, RAYCAST_RAY);
            
            // Fire the ray downwards just below the bottom of the tank.
            // If it hits a platform then store that platform.
            context.systems.rigidbody.raycastFirst(raycastStart, raycastEnd, function (result) {
                if (result.entity && pc.string.startsWith(result.entity.getName(), "Platform")) {
                    this.setPlatform(result.entity);
                } else {
                    logERROR("Enemy found non-platform with raycast");
                }
            }.bind(this));
        },
        
        // set the platform that the enemy is based on.
        setPlatform: function (entity) {
            this.platform = entity;
            
            // Calculate the min and max X positions that the tank can move, taking into account the platform size and the tank size    
            var x = this.platform.getPosition().x;
            var platformHalfWidth = this.platform.collision.halfExtents.x;
            this.minX = x - platformHalfWidth + this.halfWidth;
            this.maxX = x + platformHalfWidth - this.halfWidth;
        },
        
        update: function (dt) {
            if (!this.platform) {
                return;
            }

            if (this.movementState === STATE_IDLE) {
                
            } else if (this.movementState === STATE_MOVE) {
                this.entity.translate(this.direction * this.speed * dt, 0, 0);
                var pos = this.entity.getPosition();
                if (pos.x > this.maxX && this.direction > 0) {
                    this.direction *= -1;
                    this.setState(STATE_TURN);
                } else if (pos.x < this.minX && this.direction < 0) {
                    this.direction *= -1;
                    this.setState(STATE_TURN);
                }
            } else if (this.movementState === STATE_TURN) {
                if (this.direction > 0) {
                    this.turningAngle -= this.turnSpeed*dt;
                    if (this.turningAngle < -90) {
                        this.turningAngle = -90;
                        this.setState(STATE_MOVE);
                    }
                } else if (this.direction < 0) {
                    this.turningAngle += this.turnSpeed*dt;
                    if (this.turningAngle > 90) {
                        this.turningAngle = 90;
                        this.setState(STATE_MOVE);
                    }
                }
                this.entity.setEulerAngles(0, this.turningAngle, 0);
            }
        },
        
        setState: function (state) {
            this.movementState = state;
        },
        
        pause: function () {
            this._speed = this.speed;
            this.speed = 0;
        },
        
        unpause: function () {
            if (this._speed) {
                this.speed = this._speed;
                this._speed = null;
            }
        },
        
        onTrigger: function (result) {
            // onContact receives _all_ collision events, so we need to filter to only ones that involve us.
            if (result.other.script && result.other.script.damagable) {
                result.other.script.damagable.doDamage(10, this.entity);
            }
        }
    };
    
    
   return Enemy;
});