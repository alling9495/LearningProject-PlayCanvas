// Player Input
// Handle input from a keyboard
// Requires:
//  - The entity must also have the platform_character_controller script attached

pc.script.create('player_input', function (context) {
    var PlayerInput = function (entity) {
        this.entity = entity;
    };
    
    PlayerInput.LEFT = "left";
    PlayerInput.RIGHT = "right";
    PlayerInput.JUMP = "jump";
    
    PlayerInput.prototype = {
        initialize: function () {
            // Create a pc.input.Controller instance to handle input
            context.controller = new pc.input.Controller(document);
                    
            // Register all keyboard input
            context.controller.registerKeys(PlayerInput.LEFT, [pc.input.KEY_A, pc.input.KEY_Q, pc.input.KEY_LEFT])
            context.controller.registerKeys(PlayerInput.RIGHT, [pc.input.KEY_D, pc.input.KEY_RIGHT])
            context.controller.registerKeys(PlayerInput.JUMP, [pc.input.KEY_W, pc.input.KEY_SPACE, pc.input.KEY_UP])
    
            // Retrieve and store the script instance for the character controller
            this.playerScript = this.entity.script.platform_character_controller;
        },
        
        // Check for left, right or jump and send move commands to the controller script 
        update: function (dt) {
            if ( context.controller.isPressed(PlayerInput.LEFT) ) {
                this.playerScript.moveLeft();
            } else if ( context.controller.isPressed(PlayerInput.RIGHT) ) {
                this.playerScript.moveRight();
            }
            
            if (context.controller.wasPressed(PlayerInput.JUMP)) {
                this.playerScript.jump();
            }
        }
    };

   return PlayerInput;
});