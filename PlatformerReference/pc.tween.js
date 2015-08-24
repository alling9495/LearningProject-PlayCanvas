// Basic tween functions
pc.tween = {
    /**
     * @name pc.tween.easeOutQuad
     * @description Quadratic ease out function
     * @param {Number} t The current time 
     */
    easeOutQuad: function (t) {
		return 1 - ((1 - t) * (1 - t));
    },
    
    /**
     * @name pc.tween.easeInOutQuad
     * @description Quadratic ease in and out function
     * @param {Number} t The current time 
     */
    easeInOutQuad: function (t) {
        if ( (t*=2) < 1) {
            return 0.5 * t * t;
        } else {
            return 1 - 0.5 * ((2 - t) * (2 - t));
        }
    },

    /**
     * @name pc.tween.easeOutCubic
     * @description Cubic ease out function
     * @param {Number} t The current time 
     */
    easeOutCubic: function (t) {
        return --t * t * t + 1;
    },
        
    /**
     * @name pc.tween.elasticOut
     * @description Ease out with elastic-style snap back to final position
     * @param {Number} t The current time
     * @param {Number} amplitude The size of the elastic effect
     * @param {Number} period The period of the oscillation
     */
    elasticOut: function (t, amplitude, period) {
		if (t === 0 || t === 1) {
		    return t;
		}
		
		var s = period / (Math.PI*2) * Math.asin(1 / amplitude);
		return (amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * (Math.PI*2) / period) + 1);
    }
}