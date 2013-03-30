	
	var myImage = {}; // this stores everything
	var mySelectedColors = []; // store selected colors
	var mySelectedHex = [];
	var quantize = true;
	var reduceTo = 128;

	/**
	 *
	 */
	function doDragStart(event) { 
		air.trace("doDragStart");
	    event.dataTransfer.effectAllowed = "all"; 
	} 

	/**
	 *
	 */
	function doDragOver(event){
		event.preventDefault();
	}

	/**
	 *
	 */
	function onDrop(event){
		air.trace("onDrop");
		reset();

		if (!event.dataTransfer.getData("image/x-vnd.adobe.air.bitmap")){
			alert('Could not read image data');
			return;
		}
	
	    image = event.dataTransfer.getData("image/x-vnd.adobe.air.bitmap"); 

		// get raw color data
	    var data = processCanvas(image);
	
		// get processed color data
		processColors(data);
	
		// sort by hue
		sortColors();
	
		// reduce color palette
		if (quantize && reduceTo){
			quantizeColors(reduceTo);
		}
	
		doDisplay();
	}

	/**
	 * 
	 * @return image data from canvas
	 */
	function processCanvas(image){

		// Grab canvas object that is created during the drop operation 
		// and append it to our file-data container. Give the canvas an id
		// so we can reference it later
		$('#file-data').html(image);
		$('#file-data canvas').attr('id', 'my-canvas');
	
		myImage.canvas = document.getElementById('my-canvas');
		myImage.ctx = myImage.canvas.getContext("2d");
	
		// calculate new width and height of image
		myImage.height = image.height;
		myImage.width = image.width;
		myImage.ratio = myImage.height / myImage.width;
	
		myImage.new_width = 150;
		myImage.new_height = 150*myImage.ratio;

		// Get pixel data from canvas and return
		return myImage.ctx.getImageData(0, 0, myImage.width, myImage.height).data;
	}

	/**
	 *
	 */
	function processColors(data){
		var raw_colors = new Array();
		var colors = new Array();
	
		for (var i=0; i<data.length; i+=4){
			if (data[i] == undefined || data[i+1] == undefined || data[i+2] == undefined){
				continue;
			}
			var index = data[i] + data[i+1] + data[i+2];
			if ($.inArray(index, raw_colors) == -1){
				raw_colors.push(index);
			
				var _d = [data[i], data[i+1], data[i+2]];
				var cp = new Color();
				cp.getColor(_d);
			
				colors.push(cp);
			}
		}
	
		myImage.original_colors = colors;
		myImage.display_colors = colors;
	}

	/**
	 *
	 */
	function quantizeColors(reduce){
		var quantized_colors = new Array();
	
		if (myImage.display_colors.length > reduce){
			var factor = Math.ceil(myImage.display_colors.length / reduce);
			var sets = [];
			for (var i=0; i<reduce; i++){
			
				c = myImage.display_colors.slice((i*factor), (i*factor)+factor);
			
				var cp = new Color();
			
				var quantized = cp.quantize(c);
				cp.getColor(quantized);
				quantized_colors.push(cp);
			}
			myImage.quantized_colors = quantized_colors;
			myImage.original_colors = myImage.display_colors;
			myImage.display_colors = myImage.quantized_colors;
		}
	}

	/**
	 *
	 */
	function doDisplay(){
		air.trace('display');
	
		$('#my-canvas').width(myImage.new_width);
		$('#my-canvas').height(myImage.new_height);
	
		$('#upload').addClass('loaded');
	
		var totalColors = myImage.display_colors.length;
	
		// display color slices
		$('#color-data').show();
		var sliceWidth = 100 / totalColors;
		for (var i=0; i<totalColors; i++){
			$('<div data-index="'+i+'" data-color="'+myImage.display_colors[i].color.hex+'" class="color_slice" style="width: '+(sliceWidth+.2)+'%; position: absolute; left: '+sliceWidth*i+'%;background-color:'+myImage.display_colors[i].color.hex+';"></div>').appendTo($('#color-data'));
		}
	
		$('#content').show();
		$('#footer').show();
	}

	/**
	 * Add color to selected colors and output color to content
	 * Only the hex value is actually stored in selected colors at the moment.
	 */
	function addSwatch(i){
		var color = myImage.display_colors[i].color.hex;
		if ($.inArray(color, mySelectedHex) == -1){
			mySelectedHex.push(color);
			mySelectedColors.push(i);
			doSwatchOutput(color, i);
			doColorOutput();
		}
	}

	/**
	 *
	 */
	function removeSwatch(obj){
		air.trace('Remove Swatch');
		var i = obj.data('id');
		var color = myImage.display_colors[i].color.hex;
		
		var toRemove = $.inArray(color, mySelectedHex);
		if (toRemove != -1){
			mySelectedHex.splice(toRemove, 1);
		}
		
		var toRemove = $.inArray(i, mySelectedColors);
		if (toRemove != -1){
			mySelectedColors.splice(toRemove, 1);
		}
		
		$('.color_slice[data-color="'+color+'"]').removeClass('selected');
		
		obj.remove();

		colorOutput();
	}

	/**
	 * Render color swatch
	 */
	function doSwatchOutput(color, i){
		$('#swatches').append('<a href="#" data-id="'+i+'" class="color_swatch" style="background-color:#'+color+';"></a>');
	}

	/**
	 * Output text color data
	 */
	function doColorOutput(){
		_renderJson();
		_renderRGB();
	}

	/**
	 * Output JSON of selected colors
	 * Outputs hex values
	 */
	function _renderJson(){
		$('#output #json').html(JSON.stringify(mySelectedHex));
	}

	/**
	 * Render RGB sets of selected colors
	 */
	function _renderRGB(){
		var string = '';
		for (var i=0; i<mySelectedColors.length; i++){
			var c = myImage.display_colors[ mySelectedColors[i] ];
			string += '('+c.color.rgb.r + ',' + c.color.rgb.g + ',' + c.color.rgb.b+') ';
		}
		$('#output #rgb').html(string);
	}

	/**
	 *
	 */
	function sortColors(){
		var sortby = 'hue';
		if (sortby == 'hue'){
			myImage.display_colors.sort(function(a,b){return a.color.hue - b.color.hue;});
		}else if (sortby == 'saturation'){
			myImage.display_colors.sort(function(a,b){return a.color.saturation - b.color.saturation;});
		}else if (sortby == 'luminosity'){
			myImage.display_colors.sort(function(a,b){return a.color.luminosity - b.color.luminosity;});
		}
	}

	/**
	 *
	 */
	function reset(){
		$('#content').hide(); // hide content layer
		$('#color-data').html('').hide(); // clear out color slices and hide container
		$('#footer').hide(); // hide footer
		$('#file-data').html(''); // clear out canvas
		$('#swatches').empty(); // remove selected swatches
		$('#output .color_string_output').empty();
		$('#upload').removeClass('loaded'); // reset classes

		mySelectedHex = []; // empty selected hex array
		mySelectedColors = []; // empty seleced color array
	}

	// Menu Behaviors
	$('#reset').click(function(e){
		e.preventDefault();
		reset();
	});
	
	// Color swatch behavior
	$('body').on('click', '.color_swatch', function(event){
		event.preventDefault();
		removeSwatch($(this));
	});

	// Color slice behavior
	$('body').on('click', '.color_slice', function(e){
		e.preventDefault;
		air.trace($(this).data('color'));
		$(this).addClass('selected');
		addSwatch($(this).data('index'));
	});
	