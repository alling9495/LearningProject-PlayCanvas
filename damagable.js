pc.script.attribute("health", "number", 5);

// Damagable script
// Add this script to an entity to give it a health value and a doDamage() function

pc.script.create('damagable', function (context) {
    var Damagable = function (entity) {
        this.entity = entity;
        
        this.health = 5;
        
        pc.events.attach(this);
    };

    Damagable.prototype = {
        /*
        * @name doDamage
        * @description reduce the health by amount, if the health goes below zero, then fire the 'killed' event
        * @param {Number} amount The amount of damage to deal
        * @param {pc.fw.Entity} dealer The entity that dealt the damage.
        */
        doDamage: function (amount, dealer) {
            this.health -= amount;
            if (this.health < 0) {
                this.fire("killed", dealer);
            }
        },
        
        /*
        * @name kill
        * @description Kill the entity
        * @param {pc.fw.Entity} killer The entity that killed this entity
        */
        kill: function (killer) {
            this.health = 0;
            this.fire("killed", killer)
        }
    };

   return Damagable;
});