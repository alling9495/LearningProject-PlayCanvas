// Portal Field
// Update the animation on the portal

pc.script.attribute("playerEntityName", "string", "", {displayName: "Player Entity Name"})
pc.script.attribute("duration", "number", 1);

pc.script.create('portal_field', function (context) {
    var temp = new pc.Vec3();
    
    // Creates a new PortalField instance
    var PortalField = function (entity) {
        this.entity = entity;
        
        this.duration = 1;
        this.timer = -1;
        
        this.field = null;
        this.player = null;
    };

    PortalField.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.field = this.entity.findByName("Portal");  
            this.player = context.root.findByName(this.playerEntityName);
        },
    
        reset: function () {
            this.timer = -1;
            if(this.field) {
                this.field.setLocalScale(0.01, 0.01, 0.01);
            }
        },
        
        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (this.timer >= 0) {
                this.timer -= dt;
                if (this.timer < 0) {
                    this.timer = 0;
                }
                
                // Use an elastic tween to bounce the field out
                var progress = pc.tween.elasticOut((this.duration - this.timer)/this.duration, 1, 0.3);
                
                if (this.field) {
                    // Update the scale from the tween. Limit the z scale so it doesn't stick out through the platforms.
                    this.field.setLocalScale(progress, progress, progress > 1 ? 1 : progress);    
                }
            } else {
                // Check to see if the player is close, when they are activate the portal
                if (this.player) {
                    var distance = temp.copy(this.player.getPosition()).sub(this.entity.getPosition()).length();
                    if (distance < 3) {
                        this.activate();
                    }
                }
            }
        },
        
        onAttributeChanged: function () {
            this.activate();
        },
        
        activate: function () {
            this.timer = this.duration;
        }
    };

    return PortalField;
});