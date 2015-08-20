pc.script.create('kill_trigger', function (context) {
    // Creates a new KillTrigger instance
    var KillTrigger = function (entity) {
        this.entity = entity;
    };

    KillTrigger.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.entity.collision.on("triggerenter", this.onTriggerEnter, this);
        },
        
        onTriggerEnter: function (other) {
            if (other.script && other.script.damagable) {
                other.script.damagable.kill(this.entity);
            }
        }
    };

    return KillTrigger;
});