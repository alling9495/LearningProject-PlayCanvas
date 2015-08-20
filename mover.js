// Mover
// A moving platform
// This platform moves between a start and end point in a direction specified by the axis.
// Requires:
//   - Two child entities called "Start" and "End" which define the positions (only in one axis) of where to move the platform between

pc.script.attribute("speed", "number", 1);
pc.script.attribute("axis", "string", "x");

pc.script.create('mover', function (context) {
    // temp vector to use for maths. This prevents allocating new vectors at runtime
    var temp = new pc.Vec3();
    
    // Creates a new mover instance
    var Mover = function (entity) {
        this.entity = entity;
            
        this.speed = 1;
        
        // start and end entities
        this.start = null;
        this.end = null;
        
        // If forwards is true move from start to end, else move from end to start.
        this.forwards = true;
    };

    Mover.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            // Get the start and end Entites
            this.start = this.entity.findByName("Start");
            this.end = this.entity.findByName("End");

            // Save the original start position of the platform, for working out relative start/end points and for resetting 
            this.origin = new pc.Vec3().copy(this.entity.getPosition());
            
            // Initialize the velocity to forward speed on the defined axis
            var v = this.entity.rigidbody.linearVelocity;
            v[this.axis] = this.speed;
            this.entity.rigidbody.linearVelocity = v;
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            var pos = this.entity.getPosition();
            var localPos = this.entity.getLocalPosition();
            var start = this.start.getLocalPosition();
            var end = this.end.getLocalPosition();
            var v;
            
            // Check to see if platform has moved passed the end position, if so, reverse it's velocity
            if (this.forwards && pos[this.axis] > temp.copy(end).add(this.origin)[this.axis]) {
                this.forwards = false;
                v = this.entity.rigidbody.linearVelocity;
                v[this.axis] = -this.speed;
                this.entity.rigidbody.linearVelocity = v;
            }
    
            // Check to see if platform has moved passed the start position, if so, reverse it's velocity
            if (!this.forwards && pos[this.axis] < temp.copy(start).add(this.origin)[this.axis]) {
                this.forwards = true;
                v = this.entity.rigidbody.linearVelocity;
                v[this.axis] = this.speed;
                this.entity.rigidbody.linearVelocity = v;
            }
        },
    
        // reset back to original status     
        reset: function () {
            this.entity.setPosition(this.origin);
            this.entity.rigidbody.syncEntityToBody();
   
            var v = this.entity.rigidbody.linearVelocity;
            v[this.axis] = this.speed;
            this.entity.rigidbody.linearVelocity = v;

            this.forwards = true;
        }
    };

    return Mover;
});