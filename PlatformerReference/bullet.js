// Bullet
// The bullet is a trigger volume which moves with a given speed
// When it hits another damagable entity it does 10 damage

pc.script.create('bullet', function (context) {
    var d = new pc.Vec3();
    
    // Creates a new Bullet instance
    var Bullet = function (entity) {
        this.entity = entity;
        this.velocity = new pc.Vec3();
    };

    Bullet.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.entity.collision.on("triggerenter", this.onTriggerEnter, this);
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            // Update this position according to the velocity
            d.copy(this.velocity).scale(dt);
            this.entity.translateLocal(d);
            
            // Check for some limits and disable if it gets passed it's limit
            var pos = this.entity.getLocalPosition();
            if (pos.x > 1000) {
                this.entity.enabled = false;
            } else if (pos.x < -1000) {
                this.entity.enabled = false;
            }
        },
        
        // Enable the entity and set it's velocity
        shoot: function (speed) {
            this.entity.enabled = true;
            this.velocity.set(speed, 0, 0);
        },
        
        // Fired when the trigger volume hits another entity
        onTriggerEnter: function (other) {
            // If the entity has the damagable script then do some damage and disable the bullet.
            if (other && other.script && other.script.damagable) {
                other.script.damagable.doDamage(10, this.entity);
                this.entity.enabled = false;
            }
        }
    };

    return Bullet;
});