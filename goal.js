pc.script.attribute("nextLevelEntityName", "string", "Level One", {displayName: "Next Level Entity Name"})

// Goal Script
// Add this script to create a goal which moves the player to the next level
// Requires:
//   - A child Entity called "Trigger", which is a collision trigger, when the player enters this trigger the goal is reached
//   - Another Entity in the Pack called "Levels" which contains roots of all the other levels. The currently active level is disabled and the next level is enabled

pc.script.create('goal', function (context) {
    var Goal = function (entity) {
        this.entity = entity;
        
        this.levels = null;
        this.trigger = null;
    };

    Goal.prototype = {
        initialize: function () {
            
            this.trigger = this.entity.findByName("Trigger");
            if (this.trigger && this.trigger.collision) {
                this.trigger.collision.on("triggerenter", this.onTrigger, this);    
            }
            
            this.levels = context.root.findByName("Levels");
        },
        
        getCurrentLevel: function () {
            if (this.levels) {
                var i;
                var children = this.levels.getChildren()
                for(i = 0; i < children.length;i ++) {
                    if (children[i].enabled) {
                        return children[i];
                    }
                }
            }
            
            return null;
        },
        
        // Fired when an entity enters the attached Trigger volume.
        onTrigger: function (other) {
            // Test if the entity has the "platform_character_controller" script (which means it's the player)
            if (other.script && other.script.platform_character_controller) {
                
                // disable the current level
                var currentLevel = this.getCurrentLevel();
                if (currentLevel) {
                    currentLevel.enabled = false;    
                } else {
                    console.error("Goal can't find current level")
                }
                
                
                // enable the new level
                var nextLevel = context.root.findByName(this.nextLevelEntityName);
                if (nextLevel) {
                    nextLevel.enabled = true;

                    // Get the start position from the new level and reset the player
                    var playerStart = nextLevel.findByName("PlayerStart");
                    if (playerStart) {
                        other.script.platform_character_controller.reset(playerStart.getPosition());    
                    } else {
                        console.error("Goal can't find PlayerStart entity in " + this.nextLevelEntityName);
                    }
                } else {
                    console.error("Goals can't find next level")
                }
            }
        }
    };

   return Goal;
});