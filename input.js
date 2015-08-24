pc.script.create("input_handler", function(app) {

   var InputHandler = function (entity) {
      this.entity = entity;
   };

   InputHandler.prototype = {
      initialize: function() {
         app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
         app.keyboard.on(pc.EVENT_KEYUP, this.onKeyUp, this);
      },

      update: function(dt) {
         var x = 0;
         var y = 0;
         var z = 0;

         if (app.keyboard.isPressed(pc.KEY_W)) {
            x += 5;
         } else if (app.keyboard.isPressed(pc.KEY_S)) {
            x -= 5;
         } else if (app.keyboard.isPressed(pc.KEY_A)) {
            z += 5;
         } else if (app.keyboard.isPressed(pc.KEY_D)) {
            z -= 5;
         }

         this.entity.setLocalPosition(x, y, z);
      },

      onKeyDown: function (event) } {

      },

      onKeyUp: function(event) {

      },
   };

   return InputHandler;
});