pc.script.attribute("playerEntityName", "string", "", {displayName: "Player Entity Name"});
pc.script.attribute("height", "number", 3.5, {displayName: "Height"});
pc.script.attribute("lead", "number", 3.5, {displayName: "Lead"});
pc.script.attribute("transferSpeed", "number", 2.5, {displayName: "Transfer Speed"});
pc.script.attribute("lowerLimit", "number", -5, {displayName: "Camera Lower Limit"});

// Platformer Camera
// Script to control the camera and keep a good view on the player
// This script has two modes:
// Bottom Locked: The camera follows the X coord of the player but is fixed to the bottom of the screen.
// Platform Locked: The camera follows the X coord of the player but is fixed to the height of their current platform
// Requires:
//  - Define Player Entity Name to set which entity to follow
//  - The player must have the platform_character_controller script with the getGround() method implemented

pc.script.create('PlatformerCamera', function (context) {
    var STATE_LOCKED_BOTTOM = 1;
    var STATE_LOCKED_PLATFORM = 0;
    var STATE_TRANSFER = 2;
    
    var temp = new pc.Vec3();
    
    // Creates a new PlatformerCamera instance
    var PlatformerCamera = function (entity) {
        this.entity = entity;
        
        this.state = STATE_LOCKED_PLATFORM;
        this.player = null;
        
        this.targetPosition = new pc.Vec3();
        
        this.transferStart = new pc.Vec3();
        this.transferEnd = new pc.Vec3();
        this.transferProgress = 1.01;

        this.lastGroundEntity = null;
    };

    PlatformerCamera.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.player = context.root.findByName(this.playerEntityName)
            if (!this.player) {
                logERROR("PlatformerCamera can't find player entity: " + this.playerEntityName);
            }
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (!this.player) {
                return;
            }
            
            if (this.state === STATE_LOCKED_BOTTOM) {
                this.updateLockedBottom(dt);
            } else if (this.state === STATE_LOCKED_PLATFORM) {
                this.updateLockedPlatform(dt);
            }
            
            this.updateCameraPosition(dt);
            
        },
        
        updateLockedBottom: function (dt) {
            var pp = this.player.getPosition();
            
            var pos = this.entity.getPosition();
            pos.x = pp.x;

            // this.entity.setPosition(pos);
            this.targetPosition.copy(pos);
        },
        
        updateLockedPlatform: function (dt) {
            var ground = this.player.script.platform_character_controller.getGround();
            var pp = this.player.getPosition();
            var pos = temp.copy(this.entity.getPosition());
            
            pos.x = pp.x;
            
            if (ground || this.lastGroundEntity) {
                if (ground && ground !== this.lastGroundEntity) {
                    // New ground
                    this.transfer(pos);
                    this.lastGroundEntity = ground;
                }
                var gp = this.lastGroundEntity.getPosition();
                var platformHalfHeight = this.lastGroundEntity.collision.halfExtents.y;
                pos.y = gp.y + platformHalfHeight + this.height;
                
                if (pp.y < gp.y) {
                    pos.y = pp.y;
                    this.transfer(pos);
                }
            }
            
            if (pos.y < this.lowerLimit) {
                pos.y = this.lowerLimit;
            }
            this.targetPosition.copy(pos);
        },
            
        transfer: function (target) {
            this.transferStart.copy(this.entity.getPosition());
            this.transferEnd.copy(target);
            this.transferProgress = 0;
        },
        
        updateCameraPosition: function (dt) {
            if (this.transferProgress < 1) {
                // smoothly move from one target to another
                this.transferProgress += this.transferSpeed * dt;
                if (this.transferProgress > 1) {
                    this.transferProgress = 1.01;
                }
                // temp.lerp(this.transferStart, this.targetPosition, this.transferProgress);
                var progress = pc.tween.easeOutCubic(this.transferProgress);
                temp.sub2(this.targetPosition, this.transferStart).scale(progress).add(this.transferStart);
                
            } else {
                temp.copy(this.targetPosition);
            }
            
            this.entity.setPosition(temp);
        }
    };

    return PlatformerCamera;
});