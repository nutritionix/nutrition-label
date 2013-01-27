/******************************************
 * PLUGIN-WEBSITE.com
 *
 * PLUGIN DESCRIPTION GOES HERE
 *
 * @author			Majin22
 * @copyright		Copyright (c) 2012 Majin22.
 * @license			This Majin22 jQuery PLUGIN-NAME is dual licensed under the MIT and GPL licenses.
 * @link				http://www.waitingshed.com
 * @github			http://github.com/majin22/PLUGIN-REPO
 * @version			1.0.0
 *
 ******************************************/

;(function($){
	$.fn.mNutritionLabel = function(option, settings){
		if (typeof option === 'object'){
			settings = option;
			init( settings, $(this) );
		}else if (typeof option === 'string' && option != ''){
			if (option == 'destroy')
				new NutritionLabel().destroy( $(this) );
			else if (option == 'hide')
				new NutritionLabel().hide( $(this) );
			else if (option == 'show')
				new NutritionLabel().show( $(this) );
			else{
				var values = [];

				var elements = this.each(function(){
					var data = $(this).data('_mNutritionLabel');
					if (data){
						if ($.fn.mNutritionLabel.defaultSettings[option] !== undefined){
							if (settings !== undefined){
								data.settings[option] = settings;
								init( data.settings, $(this) );
							}else
								values.push(data.settings[option]);
						}
					}else if ($.fn.mNutritionLabel.defaultSettings[option] !== undefined)
						if (settings !== undefined){
							$.fn.mNutritionLabel.defaultSettings[option] = settings;
							init( null, $(this) );
						}
				});

				if (values.length === 1)
					return values[0];

				return values.length > 0 ? values : elements;
			}
		}else if (typeof option === 'undefined' || option == '')
			init( settings, $(this) );
	}


	// provide default settings, keeping it one spot like this makes it much
	// easier for developers to understand how your plugin works. It also makes
	// it simpler for developers to modify the defaults like so:
	$.fn.mNutritionLabel.defaultSettings = {
		logo : '../images/h3.png',
		naImage : '../images/tiny-logo.png',
		width : 250,

		lowerNutritionSideBySide : true,

		itemName : '',
		showIngredients : true,
		scrollLongIngredients : false,
		ingredientLabel : 'INGREDIENTS:',
		ingredientList : 'None',
		disclaimer : 'Please note that these nutrition values are estimated based on our standard serving portions.  As food servings may have a slight variance each time you visit, please expect these values to be with in 10% +/- of your actual meal.  If you have any questions about our nutrition calculator, please contact Nutritionix.',

		textPercentDailyPart1 : 'Percent Daily Values are based on a',
		textPercentDailyPart2 : 'calorie diet',

		showHomePrintLink : false,
		urlHomePrintLink : 'http://www.nutritionix.com',
		nameHomePrintLink : 'Nutritionix',

		calorieIntake : 2000,
		dailyValueTotalFat : 65,
		dailyValueSatFat : 20,
		dailyValueCholesterol : 300,
		dailyValueSodium : 2400,
		dailyValueCarb : 300,
		dailyValueFiber : 25,


		showServingSize : true,
		showCalories : true,
		showFatCalories : true,
		showTotalFat : true,
		showSatFat : true,
		showTransFat : true,
		showPolyFat : true,
		showMonoFat : true,
		showCholesterol : true,
		showSodium : true,
		showTotalCarb : true,
		showFibers : true,
		showSugars : true,
		showProteins : true,
		showVitaminA : true,
		showVitaminC : true,
		showCalcium : true,
		showIron : true,

		naServingSize : false,
		naCalories : false,
		naFatCalories : false,
		naTotalFat : false,
		naSatFat : false,
		naTransFat : false,
		naPolyFat : false,
		naMonoFat : false,
		naCholesterol : false,
		naSodium : false,
		naTotalCarb : false,
		naFibers : false,
		naSugars : false,
		naProteins : false,
		naVitaminA : false,
		naVitaminC : false,
		naCalcium : false,
		naIron : false,

		valueServingSize : 0,
		valueServingSizeUnit : '',
		valueCalories : 0,
		valueFatCalories : 0,
		valueTotalFat : 0,
		valueSatFat : 0,
		valueTransFat : 0,
		valuePolyFat : 0,
		valueMonoFat : 0,
		valueCholesterol : 0,
		valueSodium : 0,
		valueTotalCarb : 0,
		valueFibers : 0,
		valueSugars : 0,
		valueProteins : 0,
		valueVitaminA : 0,
		valueVitaminC : 0,
		valueCalcium : 0,
		valueIron : 0,

		textNutritionFacts : 'Nutrition Facts',
		textDailyValues : 'Daily Value',
		textServingSize : 'Serving Size',
		textAmountPerServing : 'Amount Per Serving',
		textCalories : 'Calories',
		textFatCalories : 'Calories from Fat',
		textTotalFat : 'Total Fat',
		textSatFat : 'Saturated Fat',
		textTransFat : 'Trans Fat',
		textPolyFat : 'Polyunsaturated Fat',
		textMonoFat : 'Monounsaturated Fat',
		textCholesterol : 'Cholesterol',
		textSodium : 'Sodium',
		textTotalCarb : 'Total Carbohydrates',
		textFibers : 'Dietary Fiber',
		textSugars : 'Sugars',
		textProteins : 'Protein',
		textVitaminA : 'Vitamin A',
		textVitaminC : 'Vitamin C',
		textCalcium : 'Calcium',
		textIron : 'Iron'
	};


	// create our plugin "class"
	// this will store the unique individual properties for each instance of the plugin
	function NutritionLabel(settings, $elem){
		this.nutritionLabel = null;
		this.settings = settings;
		this.$elem = $elem;

		return this;
	}


	function init(settings, $elem){
		// iterate through all elements and return them to maintain jQuery method chaining.
		//return this.each(function(){
			//var $elem = $(this);
			var $settings = $.extend( {}, $.fn.mNutritionLabel.defaultSettings, settings || {} );

			var nutritionLabel = new NutritionLabel($settings, $elem);
			$elem.html( nutritionLabel.generate() );

			if ($settings.scrollLongIngredients){
				$ingredientListParent = $('#ingredientList').parent();
				if ($ingredientListParent.innerHeight() > 100)
					$ingredientListParent.css({
						'height' : '95px',
						'width' : '100%',
						'overflow-y' : 'scroll'
					});
			}

			// store the object for later reference
			$elem.data('_mNutritionLabel', nutritionLabel);
		//});
	}


	// prototype the plugin class
	// this will contain methods shared amongst all plugin instances
	// DO NOT keep any unique plugin properties here
	NutritionLabel.prototype = {
		generate: function(){
			// set local reference of this
			// this will be important when using in other closures like event closures
			var $this = this;

			// return the plugin incase it has already been created
			if ($this.nutritionLabel)
				return $this.nutritionLabel;

			//initializing the tab variables
			//tab variables are used to make the printing of the html code readable - for debugging and editing purposes
			for (x = 1; x < 9; x++){
				var tab = '';
				for (y = 1; y <= x; y++)
					tab += '\t';
				eval('var tab' + x + ' = "' + tab + '";');
			}

			var localLogo = '';
			if ($this.settings.logo != '')
				localLogo = '<img src="'+ $this.settings.logo +'" alt="" /> ';

			naValue = tab6 + '<img src="'+ $this.settings.naImage +'" alt="" class="nix-tiny-logo" />\n';

			var nutritionLabel = '<div id="nutritionfacts" style="width: '+ $this.settings.width +'px;">\n';
				nutritionLabel += tab1 + '<table cellspacing="0" cellpadding="0" class="w100p">\n';
					nutritionLabel += tab2 + '<tr><td class="head alignC">'+ localLogo + $this.settings.textNutritionFacts + '</td></tr>\n';
					nutritionLabel += tab2 + '<tr>\n';
						nutritionLabel += tab3 + '<td class="alignL">\n';

						if ($this.settings.showServingSize){
							//hideServings is a special variable on the save meal pages
							nutritionLabel += tab4 + '<div id="div-measurement" class="serving">\n';
								nutritionLabel += tab5 + '' + $this.settings.textServingSize + '\n';
								nutritionLabel += tab5 + '<div class="weight measurement_na" id="totalServing">\n';
									nutritionLabel += tab6 + '' + ($this.settings.naServingSize ? naValue : $this.settings.valueServingSize.toFixed(1) ) + '\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						}

							nutritionLabel += tab4 + '<div id="calContent" class="alignL">' + $this.settings.itemName + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
					nutritionLabel += tab2 + '<tr class="h7">\n';
						nutritionLabel += tab3 + '<td class="bar"></td>\n';
					nutritionLabel += tab2 + '</tr>\n';

				if ($this.settings.showServingSize){
					nutritionLabel += tab2 + '<tr id="div-measurement-2">\n';
						nutritionLabel += tab3 + '<td class="alignL">\n';
							nutritionLabel += tab4 + '<div class="label fs7pt">' + $this.settings.textAmountPerServing + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

					nutritionLabel += tab2 + '<tr>\n';
						nutritionLabel += tab3 + '<td>\n';
							nutritionLabel += tab4 + '<div class="line">\n';

							if ($this.settings.showCalories){
								nutritionLabel += tab5 + '<div class="label" id="div-calories">\n';
									nutritionLabel += tab6 + '' + $this.settings.textCalories + '\n';
									nutritionLabel += tab6 + '<div class="weight calories_na" id="totalCal">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naCalories ? naValue : $this.settings.valueCalories.toFixed(1) ) + '\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
							}

							if ($this.settings.showFatCalories){
								nutritionLabel += tab5 + '<div class="labellight" id="div-fat_calories">\n';
									nutritionLabel += tab6 + '' + $this.settings.textFatCalories + '\n';
									nutritionLabel += tab6 + '<div class="weight fat_calories_na" id="calFromFat">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naFatCalories ? naValue : $this.settings.valueFatCalories.toFixed(1) ) + '\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
							}

							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';

					nutritionLabel += tab2 + '<tr>\n';
						nutritionLabel += tab3 + '<td>\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="dvlabel">\n';
									nutritionLabel += tab6 + '% ' + $this.settings.textDailyValues + '<sup>*</sup>\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';

				if ($this.settings.showTotalFat){
					nutritionLabel += tab2 + '<tr id="div-total_fat">\n';
						nutritionLabel += tab3 + '<td>\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="label">\n';
									nutritionLabel += tab6 + '' + $this.settings.textTotalFat + '\n';
									nutritionLabel += tab6 + '<div class="weight total_fat_na" id="totalFat">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naTotalFat ? naValue : $this.settings.valueTotalFat.toFixed(1) ) + 'g\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
								nutritionLabel += tab5 + '<div class="dv total_fat_na_p" id="totalFatP">\n';
									nutritionLabel += $this.settings.naTotalFat ?
										naValue :
										tab6 + parseFloat( ($this.settings.valueTotalFat / ($this.settings.dailyValueTotalFat * $this.settings.calorieIntake) ) * 100 ).toFixed(0) + '%\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

				if ($this.settings.showSatFat){
					nutritionLabel += tab2 + '<tr id="div-saturated_fat">\n';
						nutritionLabel += tab3 + '<td class="indent">\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="labellight">\n';
									nutritionLabel += tab6 + '' + $this.settings.textSatFat + '\n';
									nutritionLabel += tab6 + '<div class="weight saturated_fat_na" id="totalSatFat">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naSatFat ? naValue : $this.settings.valueSatFat.toFixed(1) ) + 'g\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
								nutritionLabel += tab5 + '<div class="dv saturated_fat_na_p" id="totalSatFatP">\n';
									nutritionLabel += $this.settings.naSatFat ?
										naValue :
										tab6 + parseFloat( ($this.settings.valueSatFat / ($this.settings.dailyValueSatFat * $this.settings.calorieIntake) ) * 100 ).toFixed(0) + '%\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

				if ($this.settings.showTransFat){
					nutritionLabel += tab2 + '<tr id="div-trans_fat">\n';
						nutritionLabel += tab3 + '<td class="indent">\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="labellight">\n';
									nutritionLabel += tab6 + '' + $this.settings.textTransFat + '\n';
									nutritionLabel += tab6 + '<div class="weight trans_fat_na" id="totalTransFat">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naTransFat ? naValue : $this.settings.valueTransFat.toFixed(1) ) + 'g\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

				if ($this.settings.showPolyFat){
					nutritionLabel += tab2 + '<tr id="div-polyunsaturated_fat">\n';
						nutritionLabel += tab3 + '<td class="indent">\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="labellight">\n';
									nutritionLabel += tab6 + '' + $this.settings.textPolyFat + '\n';
									nutritionLabel += tab6 + '<div class="weight polyunsaturated_fat_na" id="totalPolyFat">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naPolyFat ? naValue : $this.settings.valuePolyFat.toFixed(1) ) + 'g\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

				if ($this.settings.showMonoFat){
					nutritionLabel += tab2 + '<tr id="div-monounsaturated_fat">\n';
						nutritionLabel += tab3 + '<td class="indent">\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="labellight">\n';
									nutritionLabel += tab6 + '' + $this.settings.textMonoFat + '\n';
									nutritionLabel += tab6 + '<div class="weight monounsaturated_fat_na" id="totalMonoFat">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naMonoFat ? naValue : $this.settings.valueMonoFat.toFixed(1) ) + 'g\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

				if ($this.settings.showCholesterol){
					nutritionLabel += tab2 + '<tr id="div-cholesterol">\n';
						nutritionLabel += tab3 + '<td>\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="label">\n';
									nutritionLabel += tab6 + '' + $this.settings.textCholesterol + '\n';
									nutritionLabel += tab6 + '<div class="weight cholesterol_na" id="totalChol">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naCholesterol ? naValue : $this.settings.valueCholesterol.toFixed(1) ) + 'mg\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
								nutritionLabel += tab5 + '<div class="dv cholesterol_na_p" id="totalCholP">\n';
									nutritionLabel += $this.settings.naCholesterol ?
										naValue :
										tab6 + parseFloat( ($this.settings.valueCholesterol / ($this.settings.dailyValueCholesterol * $this.settings.calorieIntake) ) * 100 ).toFixed(0) + '%\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

				if ($this.settings.showSodium){
					nutritionLabel += tab2 + '<tr id="div-sodium">\n';
						nutritionLabel += tab3 + '<td>\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="label">\n';
									nutritionLabel += tab6 + '' + $this.settings.textSodium + '\n';
									nutritionLabel += tab6 + '<div class="weight sodium_na" id="totalSod">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naSodium ? naValue : $this.settings.valueSodium.toFixed(1) ) + 'mg\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
								nutritionLabel += tab5 + '<div class="dv sodium_na_p" id="totalSodP">\n';
									nutritionLabel += $this.settings.naSodium ?
										naValue :
										tab6 + parseFloat( ($this.settings.valueSodium / ($this.settings.dailyValueSodium * $this.settings.calorieIntake) ) * 100 ).toFixed(0) + '%\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

				if ($this.settings.showTotalCarb){
					nutritionLabel += tab2 + '<tr id="div-total_carb">\n';
						nutritionLabel += tab3 + '<td>\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="label">\n';
									nutritionLabel += tab6 + '' + $this.settings.textTotalCarb + '\n';
									nutritionLabel += tab6 + '<div class="weight total_carb_na" id="totalCarb">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naTotalCarb ? naValue : $this.settings.valueTotalCarb.toFixed(1) ) + 'g\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
								nutritionLabel += tab5 + '<div class="dv total_carb_na_p" id="totalCarbP">\n';
									nutritionLabel += $this.settings.naTotalCarb ?
										naValue :
										tab6 + parseFloat( ($this.settings.valueTotalCarb / ($this.settings.dailyValueCarb * $this.settings.calorieIntake) ) * 100 ).toFixed(0) + '%\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

				if ($this.settings.showFibers){
					nutritionLabel += tab2 + '<tr id="div-fibers">\n';
						nutritionLabel += tab3 + '<td class="indent">\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="labellight">\n';
									nutritionLabel += tab6 + '' + $this.settings.textFibers + '\n';
									nutritionLabel += tab6 + '<div class="weight fibers_na" id="totalFiber">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naFibers ? naValue : $this.settings.valueFibers.toFixed(1) ) + 'g\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
								nutritionLabel += tab5 + '<div class="dv fibers_na_p" id="totalFiberP">\n';
									nutritionLabel += $this.settings.naFibers ?
										naValue :
										tab6 + parseFloat( ($this.settings.valueFibers / ($this.settings.dailyValueFiber * $this.settings.calorieIntake) ) * 100 ).toFixed(0) + '%\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

				if ($this.settings.showSugars){
					nutritionLabel += tab2 + '<tr id="div-sugars">\n';
						nutritionLabel += tab3 + '<td class="indent">\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="labellight">\n';
									nutritionLabel += tab6 + '' + $this.settings.textSugars + '\n';
									nutritionLabel += tab6 + '<div class="weight sugars_na" id="totalSugar">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naSugars ? naValue : $this.settings.valueSugars.toFixed(1) ) + 'g\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

				if ($this.settings.showProteins){
					nutritionLabel += tab2 + '<tr id="div-protein">\n';
						nutritionLabel += tab3 + '<td>\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="label">\n';
									nutritionLabel += tab6 + '' + $this.settings.textProteins + '\n';
									nutritionLabel += tab6 + '<div class="weight protein_na" id="totalProt">\n';
										nutritionLabel += tab7 + '' + ( $this.settings.naProteins ? naValue : $this.settings.valueProteins.toFixed(1) ) + 'g\n';
									nutritionLabel += tab6 + '</div>\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

					nutritionLabel += tab2 + '<tr class="h7">\n';
						nutritionLabel += tab3 + '<td class="bar"></td>\n';
					nutritionLabel += tab2 + '</tr>\n';
					nutritionLabel += tab2 + '<tr>\n';
						nutritionLabel += tab3 + '<td>\n';
							nutritionLabel += tab4 + '<table border="0" cellspacing="0" cellpadding="0" class="vitamins">\n';
								nutritionLabel += tab5 + '<tr>\n';

								if ($this.settings.showVitaminA){
									nutritionLabel += tab6 + '<td id="div-vitamin_a">\n';
										nutritionLabel += tab7 + '' + $this.settings.textVitaminA + '\n';
										nutritionLabel += tab7 + '<span id="totalVitA" class="vitamin_a_na">\n';
											nutritionLabel += tab8 + ($this.settings.naVitaminA ? naValue : $this.settings.valueVitaminA) + '%\n';
										nutritionLabel += tab7 + '</span>\n';
									nutritionLabel += tab6 + '</td>\n';
									nutritionLabel += tab6 + '<td id="div-vitamin_a-2" class="alignC">&#149;</td>\n';
								}

								if ($this.settings.showVitaminC){
									nutritionLabel += tab6 + '<td id="div-vitamin_c" class="alignR">\n';
										nutritionLabel += tab7 + '' + $this.settings.textVitaminC + '\n';
										nutritionLabel += tab7 + '<span id="totalVitC" class="vitamin_c_na">\n';
											nutritionLabel += tab8 + ($this.settings.naVitaminC ? naValue : $this.settings.valueVitaminC) + '%\n';
										nutritionLabel += tab7 + '</span>\n';
									nutritionLabel += tab6 + '</td>\n';
								}

								nutritionLabel += tab5 + '</tr>\n';
								nutritionLabel += tab5 + '<tr>\n';

								if ($this.settings.showCalcium){
									nutritionLabel += tab6 + '<td id="div-calcium">\n';
										nutritionLabel += tab7 + '' + $this.settings.textCalcium + '\n';
										nutritionLabel += tab7 + '<span id="totalCalc" class="calcium_na">\n';
											nutritionLabel += tab8 + ($this.settings.naCalcium ? naValue : $this.settings.valueCalcium) + '%\n';
										nutritionLabel += tab7 + '</span>\n';
									nutritionLabel += tab6 + '</td>\n';
									nutritionLabel += tab6 + '<td id="div-calcium-2" class="alignC">&#149;</td>\n';
								}

								if ($this.settings.showIron){
									nutritionLabel += tab6 + '<td id="div-iron" class="alignR">\n';
										nutritionLabel += tab7 + '' + $this.settings.textIron + '\n';
										nutritionLabel += tab7 + '<span id="totalIron" class="iron_na">\n';
											nutritionLabel += tab8 + ($this.settings.naIron ? naValue : $this.settings.valueIron) + '%\n';
										nutritionLabel += tab7 + '</span>\n';
									nutritionLabel += tab6 + '</td>\n';
								}

								nutritionLabel += tab5 + '</tr>\n';
							nutritionLabel += tab4 + '</table>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
					nutritionLabel += tab2 + '<tr>\n';
						nutritionLabel += tab3 + '<td class="alignL">\n';
							nutritionLabel += tab4 + '<div class="line">\n';
								nutritionLabel += tab5 + '<div class="labellight dvlabel2">\n';
									nutritionLabel += tab6 + '*' + $this.settings.textPercentDailyPart1 + ' <span id="calorieDiet">' + $this.settings.calorieIntake + '</span> ' + $this.settings.textPercentDailyPart2 + '.\n';
								nutritionLabel += tab5 + '</div>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
					nutritionLabel += tab2 + '<tr><td class="bgBlack"></td></tr>\n';
					nutritionLabel += tab2 + '<tr>\n';
						nutritionLabel += tab3 + '<td class="alignL">\n';

							nutritionLabel += tab4 + '<div class="label">\n';
							if ($this.settings.showIngredients){
								nutritionLabel += tab5 + '' + $this.settings.ingredientLabel + '\n';
								nutritionLabel += tab5 + '<div class="weight" id="ingredientList" style="font-weight: normal;">' + $this.settings.ingredientList + '</div>\n';
							}
							nutritionLabel += tab4 + '</div><br/>\n';

							nutritionLabel += tab4 + '<div class="labellight dvlabel2 alignC" id="calcDisclaimer">\n';
								nutritionLabel += tab5 + '<span id="calcDisclaimerText">' + $this.settings.disclaimer + '</span>\n';
							nutritionLabel += tab4 + '</div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';

				if ($this.settings.showHomePrintLink){
					nutritionLabel += tab2 + '<tr>\n';
						nutritionLabel += tab3 + '<td colspan="2" class="linkTD">\n';
							nutritionLabel += tab4 + '<div class="spaceAbove"></div>\n';
							nutritionLabel += tab4 + '<a href="' + $this.settings.urlHomePrintLink + '" target="_newSite" class="homeLinkPrint">' + $this.settings.nameHomePrintLink + '</a>\n';
							nutritionLabel += tab4 + '<div class="spaceBelow"></div>\n';
						nutritionLabel += tab3 + '</td>\n';
					nutritionLabel += tab2 + '</tr>\n';
				}

				nutritionLabel += tab1 + '</table>\n';
			nutritionLabel += '</div>\n';

			// return the plugin object (sometimes this might be the elment itself)
			return nutritionLabel;
		},


		destroy: function($this){
			$this.html('');
		},
		hide: function($this){
			$this.hide();
		},
		show: function($this){
			$this.show();
		}

	}
})(jQuery);