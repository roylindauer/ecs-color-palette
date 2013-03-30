function Color(){ 

	this.color = {};
	this.quantized = {};
	
	this.getColor = function(data){
		this.color.rgb 			= this.getRGB(data);
		this.color.hex 			= this.rgbToHex(this.color.rgb.r, this.color.rgb.g, this.color.rgb.b);
		this.color.hsl 			= this.rgbToHsl(this.color.rgb.r, this.color.rgb.g, this.color.rgb.b);
		this.color.hue 			= this.getHue(this.color.hsl[0]);
		this.color.saturation 	= this.getSaturation(this.color.hsl[1]);
		this.color.luminosity 	= this.getLuminosity(this.color.hsl[2]);
		this.color.aco 			= this.hexToACO(this.color.hex);
		
		return this.color;
	};
	
	this.rgbToHex = function(r, g, b) {
		return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	};

	this.rgbToHsl = function(r, g, b){
	    r /= 255, g /= 255, b /= 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;

	    if(max == min){
	        h = s = 0; // achromatic
	    }else{
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }

		return [h, s, l];
	};
	
	/**
	 * Convert a single color into ACO format to use to generate a color palette for Adobe Photoshop
	 */
	this.hexToACO = function(hex){
		var sep = '0000';
		var totalColors = hex.length/6;
		var n = sprintf('%04x', totalColors);
		var string = '0001'+n;
		for (var i=0; i<totalColors; i++){
			string += sep;
			string += hex.substr(i*6,2).toString() + hex.substr(i*6,2).toString();
			string += hex.substr(i*6+2,2).toString() + hex.substr(i*6+2,2).toString();
			string += hex.substr(i*6+4,2).toString() + hex.substr(i*6+4,2).toString();
			string += sep;
		}
		string += "0002"+n;
		for (var i=0; i<totalColors; i++){
			string += sep;
			string += hex.substr(i*6,2).toString() + hex.substr(i*6,2).toString();
			string += hex.substr(i*6+2,2).toString() + hex.substr(i*6+2,2).toString();
			string += hex.substr(i*6+4,2).toString() + hex.substr(i*6+4,2).toString();
			string += sep;
			string += sep;
			var color_name = hex+' '+i;
			string += sprintf('%04x', color_name.length+1);
			for (var x=0; x<color_name.length; x++){
				string += sprintf('%04x', color_name.charCodeAt(x));
			}
			string += sep;
		}
		return string;
	}
	
	/**
	 * Quantize a set of colors
	 * @param array data
	 */
	this.quantize = function(data){
		var r = g = b = 0;
	
		for (var x=0; x<data.length; x++){
			r += data[x].color.rgb.r;
			g += data[x].color.rgb.g;
			b += data[x].color.rgb.b;
		}
	
		r = ~~(r/c.length);
		g = ~~(g/c.length);
		b = ~~(b/c.length);
	
		return [r, g, b];
	};
	
	// Return an object of RGB values
	this.getRGB = function(data){
		return {'r':parseInt(data[0]), 'g':parseInt(data[1]), 'b':parseInt(data[2])};
	};
	
	// Return hue value
	this.getHue = function(h){
		return h*360;
	};
	
	this.getSaturation = function(s){
		return s*100;
	};
	
	this.getLuminosity = function(l){
		return l*100;
	};

};