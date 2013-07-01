/*
 * jQuery Giant Select
 * Autocomplete data selector that work well for big json data
 * Tested with 9000 row data. Alternative chosen :D 
 * 
 * Author: Eko M. I. ekoisa@gmail.com -- http://www.enotes.web.id/jquery-giant-select
 */
jQuery.giantselect = function(input, options) {
	var gsme = this;
	gsme.curdt = {};
	if(options == 'destroy'){
		destroyElem(input.id);
		return;
	}
	if(options == 'repopulate'){
		if(options.data != null){
			generateList(options.data, '');
		}
		return;
	}
	var ob_input = jQuery(input).attr("autocomplete", "off");
	ob_input.css('display', 'none');
	var inClass = ob_input.attr('class');

	var selbox = document.createElement("div");
	selbox.id=input.id.replace('.', '')+"_giasel";
	selbox.className="giasel_selbox "+inClass;
	if(inClass != undefined && inClass.length > 0 && options.width != undefined && options.width > 0){
		selbox.style.width=options.width+'px';
	}
	var ob1 = document.createElement("div");
	ob1.className="giasel_seltitle";
	ob1.innerHTML=options.startText;
	var ob2 = document.createElement("div");
	ob2.className="giasel_selchoose";
	ob2.innerHTML="&nabla;";
	jQuery(selbox).append(ob1);
	jQuery(selbox).append(ob2);
	
	var results = document.createElement("div");
	results.id=input.id.replace('.', '')+"_giaselresult";
	results.className="giasel_result";
	

	var obfilter = document.createElement("input");
	obfilter.type="text";
	obfilter.style.width="95%";
	jQuery(results).append(obfilter);
	var ob_results = jQuery(results);
	ob_results.hide().addClass(options.resultsClass).css("position", "absolute");

	var htmlli = generateObjLi(options.data);
	jQuery(results).append(htmlli);
	
	jQuery(selbox).append(results);
	ob_input.after(selbox);
	ob_results.css('display', 'none');

	// flush data
	function flushData(){
		gsme.curdt = {};
		gsme.curdt.delay = null;
		gsme.curdt.delayFocus = null;
		gsme.curdt.inputFocus = 0;
		gsme.curdt.liTriggered = 0;
	};
	flushData();
	setTimeout(function(){
		
		ob_results.css('width', (parseInt(jQuery(selbox).css('width'), 10)-2)+'px');
		
		jQuery('body').bind('giasel:updated',function(event,obj){
			getDataTitle();
		});
		
		ob_results.find('li').each(function(){
			jQuery(this).bind('mousedown',function(e){
				e.preventDefault();
				setValue(jQuery(this));
			});
		});
		
		jQuery(selbox).bind('mouseup', function(){
			var curob = jQuery(this).children('.giasel_result');
			if (gsme.curdt.inputFocus == 1 || gsme.curdt.liTriggered == 1 || curob.css('display') == 'block') {
				gsme.curdt.liTriggered = 0;
				return;
			}
			gsme.curdt.delayFocus = setTimeout(function(){
				showResults(curob);
				ob_results.children('input').trigger('focus');
				if(options.data != null){
					generateList(options.data, '');
				}
			}, options.delayObject+200);
			
		});
		ob_results.children('input').bind('focus', function(){
			clearTimeout(gsme.curdt.delayFocus);
			gsme.curdt.inputFocus = 1;
		});
		
		jQuery(selbox).bind('focusout', function(){
			var curob = jQuery(this).children('.giasel_result');
			setTimeout(function(){
				showResults(curob, true);
			}, options.delayObject-50);
		});
		ob_results.children('input').bind('blur', function(){
			gsme.curdt.inputFocus = 0;
		});
		
		ob_results.children('input').bind('keyup',function(){
			if(options.data != null){
				generateList(options.data, jQuery(this).val());
			}
		});
		

	}, options.delayObject);
	
	function destroyElem(obin){
		jQuery('#'+obin+'_giasel').remove();
		jQuery('#'+obin+'_giaselresult').remove();
		jQuery('#'+obin).attr("autocomplete", "on").css('display', 'block');
	};
	
	function validate(tx, title){
		var txar = tx.split(/ \s*/);
		var result = true;
		for(v=0; v < txar.length; v++){
			if(title.indexOf(txar[v]) == -1){
				result = false;
				break;
			}
		}
		return result;
	};
	
	function getDataTitle(){
		var dtLength = options.data.length;
		var glh= options.startText;
		if(dtLength > 0){
			var ob_inputVal = ob_input.val(jQuery(this).attr('ref'));
			for(k=0; k < dtLength; k++){
				var dtRow = options.data[k];
				var dtRowSm = dtRow.title.toLowerCase();
				if(ob_inputVal == dtRow.value){
					glh = dtRow.title;
					break;
				}
			}
		}
		ob_results.siblings('.giasel_seltitle').html(glh);
	};
	
	function generateObjLi(curdt){
			var glh = '<ul>'; var counterItemRow = 0;
			glh += '<li ref="">'+ options.startText + '</li>';
			var dtLength = curdt.length;
			if(dtLength > 0){
				var maxItemRow = options.maxResultsToShow;
				if(options.maxResultsToShow > dtLength){
					maxItemRow = dtLength;
				}
				for(k=0; k < dtLength; k++){
					var dtRow = curdt[k];
					var dtRowSm = dtRow.title.toLowerCase();
					if(counterItemRow < maxItemRow){
						glh += '<li ref="'+dtRow.value+'">'+ dtRow.title + '</li>';
						counterItemRow++;
					}
				}
			}else{
				glh += '<li ref="">'+ options.noResultText + '</li>';
			}
			glh += '</ul>';
			return glh;
	};

	function generateList(curdt, tx){
		clearTimeout(gsme.curdt.delay);
		gsme.curdt.delay = setTimeout(function(){
			var counterItemRow = 0;
			tx = tx.toLowerCase();
			var dtLength = curdt.length;
			if(dtLength > 0){
				var maxItemRow = options.maxResultsToShow;
				if(options.maxResultsToShow > dtLength){
					maxItemRow = dtLength;
				}
				for(k=0; k < dtLength; k++){
					var dtRow = curdt[k];
					var dtRowSm = dtRow.title.toLowerCase();
					var stsvalid = validate(tx, dtRowSm);
					if(stsvalid == true && counterItemRow < maxItemRow){
						var curRow = ob_results.find('li').eq(counterItemRow+1);
						curRow.attr('ref', dtRow.value);
						curRow.html(dtRow.title);
						curRow.css('display', 'block');
						counterItemRow++;
					}
				}
				if(counterItemRow < maxItemRow){
					for(ki=counterItemRow; ki < maxItemRow; ki++){
						var curRow = ob_results.find('li').eq(ki+1);
						curRow.css('display', 'none');
					}
				}
			}
		}, options.delay+220);
	};
	
	function setValue(curob){
		gsme.curdt.liTriggered = 1;
		ob_input.val(curob.attr('ref'));
		curob.parents('.giasel_selbox').children('.giasel_seltitle').html(curob.html());
		showResults(curob.parents('.giasel_result'), true);
		if(options.afterChanged != null && options.afterChanged != undefined){
			options.afterChanged();
		}
	}
	function showResults(obthis, tohide){
		var curob = obthis;
		if((curob.css('display') == 'none' && tohide == undefined) || tohide == undefined){
			curob.css({'height':'0px', 'display':'block'});
			curob.animate({'height':options.height+'px'});
		}else if(curob.css('display') != 'none'){
			gsme.curdt.liTriggered = 0;
			curob.animate({'height':'0px'}, {complete: function() {
					curob.css('display', 'none');
					curob.children('input').val('');
				}
			});
		}
	};
	
};

jQuery.fn.giantselect = function(options, data) {
	if(options != undefined && (options == 'destroy')){
		//this.each(function() {
			var input = this.get(0);
			new jQuery.giantselect(input, options);
			return this;
		//});
	}
	
	if(options != undefined && options == 'repopulate'){
		options = options || {};
		options.data = ((typeof data == "object") || (typeof data == "array")) ? data : null;
		//this.each(function() {
			var input = this.get(0);
			new jQuery.giantselect(input, options);
			return this;
		//});
	}
	
	options = options || {};
	options.data = ((typeof data == "object") || (typeof data == "array")) ? data : null;

	options.startText = options.startText || "Choose data ...";
	options.noResultText = options.noResultText || "No data";
	options.lineSeparator = options.lineSeparator || "\n";
	options.cellSeparator = options.cellSeparator || "|";
	options.minChars = options.minChars || 0;
	options.delay = options.delay || 500;
	options.delayObject = 100;
	options.extraParams = options.extraParams || {};
	options.maxResultsToShow = options.maxResultsToShow || 15;
	options.width = parseInt(options.width, 10) || 0;
	options.height = parseInt(options.height, 10) || 250;
	options.afterChanged = options.afterChanged || null;

	//this.each(function() {
		var input = this.get(0);
		new jQuery.giantselect(input, options);
	//});
	return this;
};
