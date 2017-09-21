/*
 ***************************************************************************************************************************************************+
 * NUTRITIONIX.com                                                                                                                                  |
 *                                                                                                                                                  |
 * This plugin allows you to create a fully customizable nutrition label                                                                            |
 *                                                                                                                                                  |
 * @authors             Leo Joseph Gajitos <leejay22@gmail.com>, Rommel Malang <genesis23rd@gmail.com> and Yurko Fedoriv <yurko.fedoriv@gmail.com>  |
 * @copyright           Copyright (c) 2017 Nutritionix.                                                                                             |
 * @license             This Nutritionix jQuery Nutrition Label is dual licensed under the MIT and GPL licenses.                                    |
 * @link                http://www.nutritionix.com                                                                                                  |
 * @github              http://github.com/nutritionix/nutrition-label                                                                               |
 * @current version     7.0.14                                                                                                                      |
 * @stable version      7.0.5                                                                                                                       |
 * @supported browser   Firefox, Chrome, IE8+                                                                                                       |
 * @description         To be able to create a FDA-style nutrition label with any nutrition data source                                             |
 *                                                                                                                                                  |
 ***************************************************************************************************************************************************+
*/
;(function($){
	$.fn.nutritionLabel = function(option, settings){
		if (typeof option === 'object'){
			settings = option;
			init( settings, $(this) );
		}else if (typeof option === 'string' && option !== ''){
			//destroy the nutrition label's html code
			if (option === 'destroy'){
				new NutritionLabel().destroy( $(this) );
			//allows the user to hide the nutrition value
			}else if (option === 'hide'){
				new NutritionLabel().hide( $(this) );
			//allows the user to show the nutrition value
			}else if (option === 'show'){
				new NutritionLabel().show( $(this) );
			}else{
				var values = [];

				var elements = this.each(function(){
					var data = $(this).data('_nutritionLabel');
					if (data){
						if ($.fn.nutritionLabel.defaultSettings[option] !== undefined){
							if (settings !== undefined){
								//set the option and create the nutrition label
								data.settings[option] = settings;
								init( data.settings, $(this) );
							}else{
								//return the value of a setting - can only be used after the label is created / initiated
								values.push(data.settings[option]);
							}
						}
					}else if ($.fn.nutritionLabel.defaultSettings[option] !== undefined){
						//set the option and create the nutrition label
						//this is a special case so the single value setting will still work even if the label hasn't been initiated yet
						if (settings !== undefined){
							$.fn.nutritionLabel.defaultSettings[option] = settings;
							init( null, $(this) );
						}
					}
				});

				//return the value of a setting
				if (values.length === 1){
					return values[0];
				}

				//return the setting values or the elements
				return values.length > 0 ? values : elements;
			}
		//end of => else if (typeof option === 'string' && option !== '')
		}else if (typeof option === 'undefined' || option === ''){
			//if no value / option is supplied, simply create the label using the default values
			init( settings, $(this) );
		}
	};//end of => $.fn.nutritionLabel = function(option, settings)


	$.fn.nutritionLabel.defaultSettings = {
		//default fixedWidth of the nutrition label
		width : 280,

		//to allow custom width - usually needed for mobile sites
		allowCustomWidth : false,
		widthCustom : 'auto',

		//to allow the label to have no border
		allowNoBorder : false,

		//to enable rounding of the nutritional values based on the FDA rounding rules http://goo.gl/RMD2O
		allowFDARounding : false,

		//to enabled the google analytics event logging
		allowGoogleAnalyticsEventLog : false,
		gooleAnalyticsFunctionName : 'ga',

    //enable triggering of user function on quantity change: global function name
		userFunctionNameOnQuantityChange: null,
    //enable triggering of user function on quantity change: handler instance
    userFunctionOnQuantityChange:     null,

		//when set to true, this will hide the values if they are not applicable
		hideNotApplicableValues : false,

		//the brand name of the item for this label (eg. just salad)
		brandName : 'Brand where this item belongs to',
		//to scroll the ingredients if the innerheight is > scrollHeightComparison
		scrollLongIngredients : false,
		scrollHeightComparison : 100,
		//the height in px of the ingredients div
		scrollHeightPixel : 95,
		//this is to set how many decimal places will be shown on the nutrition values (calories, fat, protein, vitamin a, iron, etc)
		decimalPlacesForNutrition : 1,
		//this is to set how many decimal places will be shown for the "% daily values*"
		decimalPlacesForDailyValues : 0,
		//this is to set how many decimal places will be shown for the serving unit quantity textbox
		decimalPlacesForQuantityTextbox : 1,

		//to scroll the item name if the jQuery.height() is > scrollLongItemNamePixel
		scrollLongItemName : true,
		scrollLongItemNamePixel : 36,
		scrollLongItemNamePixel2018Override : 32, //this is needed to fix some issues on the 2018 label as the layout of the label is very different than the legacy one

		//show the customizable link at the bottom
		showBottomLink : false,
		//url for the customizable link at the bottom
		urlBottomLink : 'http://www.nutritionix.com',
		//link name for the customizable link at the bottom
		nameBottomLink : 'Nutritionix',

		//this value can be changed and the value of the nutritions will be affected directly
		//the computation is "current nutrition value" * "serving unit quantity value" = "final nutrition value"
		//this can't be less than zero, all values less than zero is converted to zero
		//the textbox to change this value is visible / enabled by default
		//if the initial value of the serving size unit quantity is less than or equal to zero, it is converted to 1.0
		//when enabled, user can change this value by clicking the arrow or changing the value on the textbox and pressing enter. the value on the label will be updated automatically
		//different scenarios and the result if this feature is enabled
			//NOTE 1: [ ] => means a textbox will be shown
			//NOTE 2: on all cases below showServingUnitQuantityTextbox == true AND showServingUnitQuantity == true
					//if showServingUnitQuantity == false, the values that should be on the 'serving size div' are empty or null
			//CASE 1a: valueServingSizeUnit != '' (AND NOT null) && valueServingUnitQuantity >= 0
				//RESULT: textServingSize [valueServingUnitQuantity] valueServingSizeUnit

			//NOTE 3: on all cases below showServingUnitQuantityTextbox == true AND showItemName == true
					//if showItemName == false, the values that should be on the 'item name div' are empty or null
			//CASE 1b: valueServingSizeUnit != '' (AND NOT null) && valueServingUnitQuantity <= 0
				//RESULT: [valueServingUnitQuantity default to 1.0] itemName
			//CASE 3a: valueServingSizeUnit == '' (OR null) && valueServingUnitQuantity > 0
				//RESULT: [valueServingUnitQuantity] itemName
			//CASE 3b: valueServingSizeUnit == '' (OR null) && valueServingUnitQuantity <= 0
				//RESULT: [valueServingUnitQuantity default to 1.0] itemName

			//NOTE 4: to see the different resulting labels, check the html/demo-texbox-case*.html files
		valueServingUnitQuantity : 1.0,
		valueServingSizeUnit : '',
		showServingUnitQuantityTextbox : true,
		//the name of the item for this label (eg. cheese burger or mayonnaise)
		itemName : 'Item / Ingredient Name',
		showServingUnitQuantity : true,
		//allow hiding of the textbox arrows
		hideTextboxArrows : false,

		//these 2 settings are used internally.
		//this is just added here instead of a global variable to prevent a bug when there are multiple instances of the plugin like on the demo pages
		originalServingUnitQuantity : 0,
		//this is used to fix the computation issue on the textbox
		nutritionValueMultiplier : 1,
		//this is used for the computation of the servings per container
		totalContainerQuantity : 1,

		//default calorie intake
		calorieIntake : 2000,

		//these are the recommended daily intake values
		dailyValueTotalFat : 65,
		dailyValueSatFat : 20,
		dailyValueCholesterol : 300,
		dailyValueSodium : 2400,
		dailyValuePotassium : 3500,
		dailyValuePotassium_2018 : 4700,
		dailyValueCarb : 300,
		dailyValueFiber : 25,
		dailyValueCalcium : 1300,
		dailyValueIron : 18,
		dailyValueVitaminD : 20,
		dailyValueAddedSugar : 50,

		//these values can be change to hide some nutrition values
		showCalories : true,
		showFatCalories : true,
		showTotalFat : true,
		showSatFat : true,
		showTransFat : true,
		showPolyFat : false,
		showMonoFat : false,
		showCholesterol : true,
		showSodium : true,
		showPotassium: false, //this is for the legacy version, this is the only value that is default to be hidden
		showPotassium_2018: true, //this is for the 2018 version
		showTotalCarb : true,
		showFibers : true,
		showSugars : true,
		showAddedSugars : true,
		showProteins : true,
		showVitaminA : true,
		showVitaminC : true,
		showVitaminD : true,
		showCalcium : true,
		showIron : true,

		//to show the 'amount per serving' text
		showAmountPerServing : true,
		//to show the 'servings per container' data and replace the default 'Serving Size' value (without unit and servings per container text and value)
		showServingsPerContainer : false,
		//to show the item name. there are special cases where the item name is replaced with 'servings per container' value
		showItemName : true,
		//show the brand where this item belongs to
		showBrandName : false,
		//to show the ingredients value or not
		showIngredients : true,
		//to show the calorie diet info at the bottom of the label
		showCalorieDiet : false,
		//to show the customizable footer which can contain html and js codes
		showCustomFooter : false,

		//to show the disclaimer text or not
		showDisclaimer : false,
		//the height in px of the disclaimer div
		scrollDisclaimerHeightComparison : 100,
		scrollDisclaimer : 95,
		valueDisclaimer : 'Please note that these nutrition values are estimated based on our standard serving portions. ' +
			'As food servings may have a slight variance each time you visit, please expect these values to be with in 10% +/- of your actual meal. ' +
			'If you have any questions about our nutrition calculator, please contact Nutritionix.',
		ingredientLabel : 'INGREDIENTS:',
		valueCustomFooter : '',

		//the are to set some values as 'not applicable'. this means that the nutrition label will appear but the value will be a 'gray dash'
		naCalories : false,
		naFatCalories : false,
		naTotalFat : false,
		naSatFat : false,
		naTransFat : false,
		naPolyFat : false,
		naMonoFat : false,
		naCholesterol : false,
		naSodium : false,
		naPotassium : false, //this is for the legacy version
		naPotassium_2018 : false, //this is for the 2018 version
		naTotalCarb : false,
		naFibers : false,
		naSugars : false,
		naAddedSugars : false,
		naProteins : false,
		naVitaminA : false,
		naVitaminC : false,
		naVitaminD : false,
		naCalcium : false,
		naIron : false,

		//these are the default values for the nutrition info
		valueServingWeightGrams : 0,
		valueServingPerContainer : 1,
		valueCalories : 0,
		valueFatCalories : 0,
		valueTotalFat : 0,
		valueSatFat : 0,
		valueTransFat : 0,
		valuePolyFat : 0,
		valueMonoFat : 0,
		valueCholesterol : 0,
		valueSodium : 0,
		valuePotassium : 0, //this is for the legacy version
		valuePotassium_2018 : 0, //this is for the 2018 version
		valueTotalCarb : 0,
		valueFibers : 0,
		valueSugars : 0,
		valueAddedSugars : 0,
		valueProteins : 0,
		valueVitaminA : 0,
		valueVitaminC : 0,
		valueVitaminD : 0,
		valueCalcium : 0,
		valueIron : 0,

		//customizable units for the values
		unitCalories : '',
		unitFatCalories : '',
		unitTotalFat : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitSatFat : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitTransFat : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitPolyFat : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitMonoFat : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitCholesterol : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>',
		unitSodium : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>',
		unitPotassium : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>', //this is for the legacy version
		unitPotassium_base : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>', //this is for the 2018 version
		unitPotassium_percent : '%', //this is for the 2018 version
		unitTotalCarb : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitFibers : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitSugars : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitAddedSugars : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitProteins : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitVitaminA : '%',
		unitVitaminC : '%',
		unitVitaminD_base : '<span aria-hidden="true">mcg</span><span class="sr-only"> micrograms</span>', //this is for the 2018 version
		unitVitaminD_percent : '%', //this is for the 2018 version
		unitCalcium : '%',
		unitCalcium_base : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>', //this is for the 2018 version
		unitCalcium_percent : '%', //this is for the 2018 version
		unitIron : '%',
		unitIron_base : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>', //this is for the 2018 version
		unitIron_percent : '%', //this is for the 2018 version

		//these are the values for the optional calorie diet
		valueCol1CalorieDiet : 2000,
		valueCol2CalorieDiet : 2500,
		valueCol1DietaryTotalFat : 0,
		valueCol2DietaryTotalFat : 0,
		valueCol1DietarySatFat : 0,
		valueCol2DietarySatFat : 0,
		valueCol1DietaryCholesterol : 0,
		valueCol2DietaryCholesterol : 0,
		valueCol1DietarySodium : 0,
		valueCol2DietarySodium : 0,
		valueCol1DietaryPotassium : 0,
		valueCol2DietaryPotassium : 0,
		valueCol1DietaryTotalCarb : 0,
		valueCol2DietaryTotalCarb : 0,
		valueCol1Dietary : 0,
		valueCol2Dietary : 0,

		//these text settings is so you can create nutrition labels in different languages or to simply change them to your need
		textNutritionFacts : 'Nutrition Facts',
		textDailyValues : 'Daily Value',
		textServingSize : 'Serving Size:',
		textServingsPerContainer : 'Servings Per Container',
		textAmountPerServing : 'Amount Per Serving',
		textCalories : 'Calories',
		textFatCalories : 'Calories from Fat',
		textTotalFat : 'Total Fat',
		textSatFat : 'Saturated Fat',
		textTransFat : '<em>Trans</em> Fat',
		textPolyFat : 'Polyunsaturated Fat',
		textMonoFat : 'Monounsaturated Fat',
		textCholesterol : 'Cholesterol',
		textSodium : 'Sodium',
		textPotassium : 'Potassium',
		textTotalCarb : 'Total Carbohydrates',
		textFibers : 'Dietary Fiber',
		textSugars : 'Sugars',
		textAddedSugars1 : 'Includes ',
		textAddedSugars2 : ' Added Sugars',
		textProteins : 'Protein',
		textVitaminA : 'Vitamin A',
		textVitaminC : 'Vitamin C',
		textVitaminD : 'Vitamin D',
		textCalcium : 'Calcium',
		textIron : 'Iron',
		ingredientList : 'None',
		textPercentDailyPart1 : 'Percent Daily Values are based on a',
		textPercentDailyPart2 : 'calorie diet',
		textPercentDaily2018VersionPart1 : 'The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. ',
		textPercentDaily2018VersionPart2 : ' calories a day is used for general nutrition advice.',
		textGoogleAnalyticsEventCategory : 'Nutrition Label',
		textGoogleAnalyticsEventActionUpArrow : 'Quantity Up Arrow Clicked',
		textGoogleAnalyticsEventActionDownArrow : 'Quantity Down Arrow Clicked',
		textGoogleAnalyticsEventActionTextbox : 'Quantity Textbox Changed',

		showLegacyVersion : true,

		//more details here https://github.com/nutritionix/nutrition-label/issues/77#issuecomment-323510972
		legacyVersion: 1
	};//end of => $.fn.nutritionLabel.defaultSettings


	//this will store the unique individual properties for each instance of the plugin
	function NutritionLabel(settings, $elem){
		this.nutritionLabel = null;
		this.settings = settings;
		this.$elem = $elem;
		return this;
	}


	function cleanSettings(settings){
		var numericIndex = [
			'width', 'scrollHeightComparison', 'scrollHeightPixel', 'decimalPlacesForNutrition', 'decimalPlacesForDailyValues', 'calorieIntake', 'dailyValueTotalFat', 'dailyValueSatFat',
			'dailyValueCholesterol', 'dailyValueSodium', 'dailyValuePotassium', 'dailyValueCarb', 'dailyValueFiber','valueServingSize', 'valueServingWeightGrams', 'valueServingPerContainer',
			'valueCalories', 'valueFatCalories', 'valueTotalFat', 'valueSatFat', 'valueTransFat', 'valuePolyFat', 'valueMonoFat', 'valueCholesterol', 'valueSodium', 'valuePotassium', 'valueTotalCarb',
			'valueFibers', 'valueSugars', 'valueProteins', 'valueVitaminA', 'valueVitaminC', 'valueCalcium', 'valueIron', 'valueCol1CalorieDiet', 'valueCol2CalorieDiet', 'valueCol1DietaryTotalFat',
			'valueCol2DietaryTotalFat', 'valueCol1DietarySatFat', 'valueCol2DietarySatFat', 'valueCol1DietaryCholesterol', 'valueCol2DietaryCholesterol', 'valueCol1DietarySodium',
			'valueCol2DietarySodium', 'valueCol1DietaryPotassium', 'valueCol2DietaryPotassium', 'valueCol1DietaryTotalCarb', 'valueCol2DietaryTotalCarb', 'valueCol1Dietary', 'valueCol2Dietary',
			'valueServingUnitQuantity', 'scrollLongItemNamePixel', 'scrollLongItemNamePixel2018Override', 'decimalPlacesForQuantityTextbox', 'valueAddedSugars', 'dailyValueVitaminD',
			'dailyValueCalcium', 'dailyValueIron', 'valueVitaminD'
		];

		$.each(settings, function(index, value){
			if (jQuery.inArray(index, numericIndex) !== -1){
				settings[index] = parseFloat(settings[index]);

				if (isNaN(settings[index]) || settings[index] === undefined){
					settings[index] = 0;
				}
			}
		});

		if (settings['valueServingUnitQuantity'] < 0){
			settings['valueServingUnitQuantity'] = 0;
		}

		return settings;
	}


	function updateNutritionValueWithMultiplier(settings){
		var nutritionIndex = [
			'valueCalories', 'valueFatCalories', 'valueTotalFat', 'valueSatFat', 'valueTransFat', 'valuePolyFat', 'valueMonoFat', 'valueCholesterol', 'valueSodium', 'valuePotassium', 'valueTotalCarb',
			'valueFibers','valueSugars','valueProteins', 'valueVitaminA', 'valueVitaminC', 'valueCalcium', 'valueIron', 'valueServingWeightGrams', 'valueAddedSugars', 'valueVitaminD', 'valuePotassium_2018'
		];

		$.each(settings, function(index, value){
			if (jQuery.inArray(index, nutritionIndex) !== -1){
				settings[index] = parseFloat(settings[index]);
				if (isNaN(settings[index]) || settings[index] === undefined){
					settings[index] = 0;
				}

				settings[index] =
					parseFloat(settings[index]) *
					parseFloat(settings['valueServingUnitQuantity']) *
					parseFloat(settings['nutritionValueMultiplier']);
			}
		});

		if (parseFloat(settings['valueServingUnitQuantity']) == 0){
			settings['valueServingPerContainer'] = 0;
		}else if (!isNaN(settings['valueServingPerContainer']) && settings['valueServingPerContainer'] != undefined){
			settings['valueServingPerContainer'] = parseFloat(settings.totalContainerQuantity) / parseFloat(settings['valueServingUnitQuantity']);
		}

		return settings;
	}


	function init(settings, $elem){
		//merge the default settins with the user supplied settings
		var $settings = $.extend( {}, $.fn.nutritionLabel.defaultSettings, settings || {} );
		$settings.totalContainerQuantity = parseFloat($settings.valueServingPerContainer) * parseFloat($settings['valueServingUnitQuantity']);

		var $originalCleanSettings = cleanSettings( $.extend( {}, $.fn.nutritionLabel.defaultSettings, settings || {} ) );
		$originalCleanSettings.totalContainerQuantity = parseFloat($originalCleanSettings.valueServingPerContainer) * parseFloat($originalCleanSettings['valueServingUnitQuantity']);

		//clean the settings and make sure that all numeric settings are really numeric, if not, force them to be
		$settings = cleanSettings($settings);
		$originalCleanSettings = cleanSettings($originalCleanSettings);

		$settings.nutritionValueMultiplier = $settings.valueServingUnitQuantity <= 0 ? 1 : 1 / $settings.valueServingUnitQuantity;

		//update the nutrition values with the multiplier
		var $updatedsettings = updateNutritionValueWithMultiplier($settings);
		$settings.originalServingUnitQuantity = $updatedsettings.valueServingUnitQuantity;

		//if the original value is <= 0, set it to 1.0
		if ($updatedsettings.valueServingUnitQuantity <= 0){
			$originalCleanSettings.valueServingUnitQuantity = 1;
			$updatedsettings = updateNutritionValueWithMultiplier($originalCleanSettings);
			$updatedsettings.valueServingUnitQuantity = 1;
		}

		//initalize the nutrition label and create / recreate it
		var nutritionLabel = new NutritionLabel($updatedsettings, $elem);

		if ($updatedsettings.showLegacyVersion){
			//updateValuesAfterAQuantityChanged($localSettings, nutritionLabel, $elem, forLegacyLabel, forInitialization)
			updateValuesAfterAQuantityChanged($settings, nutritionLabel, $elem, true, true);

			//if the text box for the unit quantity is shown
			if ($settings.showServingUnitQuantityTextbox){
				//increase the unit quantity by clicking the up arrow
				$('#' + $elem.attr('id') ).delegate('.unitQuantityUp', 'click', function(e){
					e.preventDefault();
					changeQuantityByArrow($(this), 1, updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, true);
				});

				//decrease the unit quantity by clicking the down arrow
				$('#' + $elem.attr('id') ).delegate('.unitQuantityDown', 'click', function(e){
					e.preventDefault();
					changeQuantityByArrow($(this), -1, updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, true);
				});

				//the textbox unit quantity value is changed
				$('#' + $elem.attr('id') ).delegate('.unitQuantityBox', 'change', function(e){
					e.preventDefault();
					changeQuantityTextbox($(this), updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, true);
				});

				//the textbox unit quantity value is changed
				$('#' + $elem.attr('id') ).delegate('.unitQuantityBox', 'keydown', function(e){
					if (e.keyCode == 13){
						e.preventDefault();
						changeQuantityTextbox($(this), updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, true);
					}
				});
			}//end of => if ($settings.showServingUnitQuantityTextbox)
		//end of => if ($updatedsettings.showLegacyVersion)
		}else{
			//this part is for the 2018 version
			//updateValuesAfterAQuantityChanged($localSettings, nutritionLabel, $elem, forLegacyLabel, forInitialization)
			updateValuesAfterAQuantityChanged($settings, nutritionLabel, $elem, false, true);

			//if the text box for the unit quantity is shown
			if ($settings.showServingUnitQuantityTextbox){
				//increase the unit quantity by clicking the up arrow
				$('#' + $elem.attr('id') ).delegate('div.nf-unitQuantityUp', 'click', function(e){
					e.preventDefault();
					changeQuantityByArrow($(this), 1, updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false);
				});

				//decrease the unit quantity by clicking the down arrow
				$('#' + $elem.attr('id') ).delegate('div.nf-unitQuantityDown', 'click', function(e){
					e.preventDefault();
					changeQuantityByArrow($(this), -1, updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false);
				});

				//the textbox unit quantity value is changed
				$('#' + $elem.attr('id') ).delegate('.nf-unitQuantityBox', 'change', function(e){
					e.preventDefault();
					changeQuantityTextbox($(this), updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false);
				});

				//the textbox unit quantity value is changed
				$('#' + $elem.attr('id') ).delegate('.nf-unitQuantityBox', 'keydown', function(e){
					if (e.keyCode == 13){
						e.preventDefault();
						changeQuantityTextbox($(this), updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false);
					}
				});
			}//end of => if ($settings.showServingUnitQuantityTextbox)
		}//end of else => => if ($updatedsettings.showLegacyVersion)

		//store the object for later reference
		$elem.data('_nutritionLabel', nutritionLabel);
	}//end of => function init(settings, $elem)


	function updateTheSettingsAfterAnEvent($localSettings, localSettings){
		var $localSettingsHolder = cleanSettings( $.extend( {}, $.fn.nutritionLabel.defaultSettings, localSettings || {} ) );
		$localSettingsHolder.originalServingUnitQuantity = $localSettings.originalServingUnitQuantity;
		$localSettingsHolder.totalContainerQuantity = $localSettings.totalContainerQuantity;
		$localSettingsHolder.nutritionValueMultiplier = $localSettingsHolder.valueServingUnitQuantity <= 0 ? 1 : 1 / $localSettingsHolder.valueServingUnitQuantity;
		return $localSettingsHolder;
	}


	function addScrollToItemDiv($elem, $settings, localNameClass, forLegacyLabel){
		var local_scrollLongItemNamePixel = parseInt($settings.scrollLongItemNamePixel);
		if (!forLegacyLabel){
			local_scrollLongItemNamePixel = parseInt($settings.scrollLongItemNamePixel2018Override);
		}

		//as of 05142017 inline class only appears on the legacy version
		if ( $('#' + $elem.attr('id') + ' .' + localNameClass + '.inline').val() != undefined ){
			if ($('#' + $elem.attr('id') + ' .' + localNameClass + '.inline').height() > local_scrollLongItemNamePixel + 1){
				$('#' +$elem.attr('id') + ' .' + localNameClass + '.inline').css({
					'margin-left' : '3.90em',
					'height' : local_scrollLongItemNamePixel + 'px',
					'overflow-y' : 'auto'
				});
			}
		}else{
			if (forLegacyLabel){
				if ($('#' + $elem.attr('id') + ' .' + localNameClass).height() > local_scrollLongItemNamePixel + 1){
					$('#' + $elem.attr('id') + ' .' + localNameClass).css({
						'height' : local_scrollLongItemNamePixel + 'px',
						'overflow-y' : 'auto'
					});
				}
			}else{
				if ($('#' + $elem.attr('id') + ' .' + localNameClass + ' div').height() >= local_scrollLongItemNamePixel + 1){
					$('#' + $elem.attr('id') + ' .' + localNameClass + ' div').css({
						'height' : local_scrollLongItemNamePixel + 'px',
						'overflow-y' : 'auto'
					});
				}
			}
		}
	}


	function notApplicableHover($elem){
		//this code is for pages with multiple nutrition labels generated by the plugin like the demo page
		if ($elem.attr('id') !== undefined && $elem.attr('id') !== ''){
			$('#' + $elem.attr('id') + ' .notApplicable').hover(
				function(){
					$('#' + $elem.attr('id') + ' .naTooltip').css({
						'top' : $(this).position().top + 'px',
						'left' : $(this).position().left+ 10 + 'px'
					}).show();
				},
				function(){
					$('#' + $elem.attr('id') + ' .naTooltip').hide();
				}
			);
		}else{
			$('#' + $elem.attr('id') + ' .notApplicable').hover(
				function(){
					$('.naTooltip').css({
						'top' : $(this).position().top + 'px',
						'left' : $(this).position().left+ 10 + 'px'
					}).show();
				},
				function(){
					$('.naTooltip').hide();
				}
			);
		}
	}


	function updateScrollingFeature($localElem, $localSettings, localIDToScroll, localScrollHeightComparison, localScrollHeight){
		if ($localElem.attr('id') !== undefined && $localElem.attr('id') !== ''){
			//this code is for pages with multiple nutrition labels generated by the plugin like the demo page
			$parentElement = $('#' + $localElem.attr('id') + ' #' + localIDToScroll).parent();
		}else{
			$parentElement = $('#' + localIDToScroll).parent();
		}

		if ($parentElement.innerHeight() > localScrollHeightComparison){
			$parentElement.addClass('scroll').css({
				'height' : localScrollHeight + 'px'
			});
		}
	}


	function updateValuesAfterAQuantityChanged($localSettings, nutritionLabel, $elem, forLegacyLabel, forInitialization){
		var ingredientListID = 'ingredientList';
		var calcDisclaimerTextID = 'calcDisclaimerText';
		var nameElementClass = 'name';

		if (!forLegacyLabel){
			ingredientListID = 'nf-ingredientList';
			calcDisclaimerTextID = 'nf-calcDisclaimerText';
			nameElementClass = 'nf-item-name';
		}

		if (!forInitialization){
			$localSettings = updateNutritionValueWithMultiplier($localSettings);
			nutritionLabel = new NutritionLabel($localSettings, $elem);
		}

		if (forLegacyLabel){
			$elem.html( nutritionLabel.generateLegacy() );
		}else{
			$elem.html( nutritionLabel.generate2018() );
		}

		//scroll the ingredients of the innerheight is > $localSettings.scrollHeightComparison and the settings showIngredients and scrollLongIngredients are true
		if ($localSettings.showIngredients && $localSettings.scrollLongIngredients){
			//updateScrollingFeature($localElem, $localSettings, localIDToScroll, localScrollHeightComparison, localScrollHeight)
			updateScrollingFeature($elem, $localSettings, ingredientListID, $localSettings.scrollHeightComparison, $localSettings.scrollHeightPixel);
		}

		//scroll the disclaimer if the height of the disclaimer div is greater than scrollDisclaimerHeightComparison
		if ($localSettings.showDisclaimer){
			//updateScrollingFeature($localElem, $localSettings, localIDToScroll, localScrollHeightComparison, localScrollHeight)
			updateScrollingFeature($elem, $localSettings, calcDisclaimerTextID, $localSettings.scrollDisclaimerHeightComparison, $localSettings.scrollDisclaimer);
		}

		//this code is for pages with multiple nutrition labels generated by the plugin like the demo page
		notApplicableHover($elem);

		//add a scroll on long item names
		if ($localSettings.scrollLongItemName){
			addScrollToItemDiv($elem, $localSettings, nameElementClass, forLegacyLabel);
		}

		if (!forInitialization){
			return $localSettings;
		}
	}//end of => updateValuesAfterAQuantityChanged($localSettings, $elem, ingredientListID, calcDisclaimerTextID, forLegacyLabel, forInitialization)


  function handleQuantityChange($localSettings, source, previousValue, newValue) {
    var handler;

    if ($localSettings.userFunctionOnQuantityChange) {
      handler = $localSettings.userFunctionOnQuantityChange;
    } else if ($localSettings.userFunctionNameOnQuantityChange) {
      handler = window[$localSettings.userFunctionNameOnQuantityChange];
    }

    if (typeof handler === 'function') {
      handler(source, previousValue, newValue);
    }
  }


	function changeQuantityTextbox($thisTextbox, $localSettings, nutritionLabel, $elem, forLegacyLabel){
		var nixLabelBeforeQuantityID = 'nixLabelBeforeQuantity';
		if (!forLegacyLabel){
			nixLabelBeforeQuantityID = 'nf-nixLabelBeforeQuantity';
		}

		var previousValue = parseFloat( $('#' +$elem.attr('id') + ' #' + nixLabelBeforeQuantityID).val() );

		textBoxValue = !regIsPosNumber( $thisTextbox.val() ) ? previousValue : parseFloat( $thisTextbox.val() );
		$thisTextbox.val( textBoxValue.toFixed($localSettings.decimalPlacesForQuantityTextbox) );

		$localSettings.valueServingUnitQuantity = textBoxValue;
		$localSettings = updateValuesAfterAQuantityChanged($localSettings, nutritionLabel, $elem, forLegacyLabel, false);

		if ($localSettings.allowGoogleAnalyticsEventLog){
			window[$localSettings.gooleAnalyticsFunctionName](
				'send',
				'event',
				$localSettings.textGoogleAnalyticsEventCategory,
				$localSettings.textGoogleAnalyticsEventActionTextbox
			);
		}

    handleQuantityChange(
      $localSettings,
      'textbox',
      previousValue.toFixed($localSettings.decimalPlacesForQuantityTextbox),
      textBoxValue.toFixed($localSettings.decimalPlacesForQuantityTextbox)
    );
	}//end of => function changeQuantityTextbox($thisTextbox, $localSettings, nutritionLabel, $elem, forLegacyLabel)


	function changeQuantityByArrow($thisQuantity, changeValueBy, $localSettings, nutritionLabel, $elem, forLegacyLabel){
		var unitQuantityBoxClass = 'unitQuantityBox';
		if (!forLegacyLabel){
			unitQuantityBoxClass = 'nf-unitQuantityBox';
		}

		//get the current user quantity of the item
		var currentQuantity = parseFloat( $thisQuantity.parent().parent().find('input.' + unitQuantityBoxClass).val() );
		if ( isNaN(currentQuantity) ){
			currentQuantity = 1.0;
		}
		var beforeCurrentQuantityWasChanged = currentQuantity;

		//see https://github.com/nutritionix/nutrition-label/issues/14 for an explanation on this part
		if (currentQuantity <= 1 && changeValueBy == -1){
			changeValueBy = -0.5;
			currentQuantity += changeValueBy;
		}else if (currentQuantity < 1 && changeValueBy == 1){
			changeValueBy = 0.5;
			currentQuantity += changeValueBy;
		}else if (currentQuantity <= 2 && currentQuantity > 1 && changeValueBy == -1){
			currentQuantity = 1;
		}else{
			currentQuantity += changeValueBy;
		}

		if (currentQuantity < 0){
			currentQuantity = 0;
		}

		$thisQuantity.parent().parent().find('input.' + unitQuantityBoxClass).val(
			currentQuantity.toFixed($localSettings.decimalPlacesForQuantityTextbox)
		);

		$localSettings.valueServingUnitQuantity = currentQuantity;
		$localSettings = updateValuesAfterAQuantityChanged($localSettings, nutritionLabel, $elem, forLegacyLabel, false);

		if ($localSettings.allowGoogleAnalyticsEventLog){
			if (changeValueBy > 0){
				window[$localSettings.gooleAnalyticsFunctionName](
					'send',
					'event',
					$localSettings.textGoogleAnalyticsEventCategory,
					$localSettings.textGoogleAnalyticsEventActionUpArrow
				);
			}else{
				window[$localSettings.gooleAnalyticsFunctionName](
					'send',
					'event',
					$localSettings.textGoogleAnalyticsEventCategory,
					$localSettings.textGoogleAnalyticsEventActionDownArrow
				);
			}
		}

    handleQuantityChange(
      $localSettings,
      changeValueBy > 0 ? 'up arrow' : 'down arrow',
      beforeCurrentQuantityWasChanged,
      currentQuantity
    );
	}//end of => function changeQuantityByArrow($thisQuantity, changeValueBy, $localSettings, nutritionLabel, $elem, forLegacyLabel)


	//round the value to the nearest number
	function roundToNearestNum(input, nearest){
		if (nearest < 0){
			return Math.round(input * nearest) / nearest;
		}else{
			return Math.round(input / nearest) * nearest;
		}
	}


	function roundCalories(toRound, decimalPlace){
		toRound = roundCaloriesRule(toRound);
		if (toRound > 0){
			toRound = parseFloat( toRound.toFixed(decimalPlace) );
		}
		return toRound;
	}


	function roundFat(toRound, decimalPlace){
		toRound = roundFatRule(toRound);
		if (toRound > 0){
			toRound = parseFloat( toRound.toFixed(decimalPlace) );
		}
		return toRound;
	}


	function roundSodium(toRound, decimalPlace){
		toRound = roundSodiumRule(toRound);
		if (toRound > 0){
			toRound = parseFloat( toRound.toFixed(decimalPlace) );
		}
		return toRound;
	}


	function roundPotassium(toRound, decimalPlace){
		toRound = roundPotassiumRule(toRound);
		if (toRound > 0){
			toRound = parseFloat( toRound.toFixed(decimalPlace) );
		}
		return toRound;
	}


	function roundCholesterol(toRound, decimalPlace){
		var normalVersion = true;
		var roundResult = roundCholesterolRule(toRound);
		if (roundResult === false){
			normalVersion = false;
		}else{
			toRound = roundResult;
		}

		if (normalVersion){
			if (toRound > 0){
				toRound = parseFloat( toRound.toFixed(decimalPlace) );
			}
		}else{
			toRound = '< 5';
		}
		return toRound;
	}


	function roundCarbFiberSugarProtein(toRound, decimalPlace){
		var normalVersion = true;
		var roundResult = roundCarbFiberSugarProteinRule(toRound);
		if (roundResult === false){
			normalVersion = false;
		}else{
			toRound = roundResult;
		}

		if (normalVersion){
			if (toRound > 0){
				toRound = parseFloat( toRound.toFixed(decimalPlace) );
			}
		}else{
			toRound = '< 1';
		}
		return toRound;
	}


	//Calories and Calories from Fat rounding rule
	function roundCaloriesRule(toRound){
		if (toRound < 5){
			return 0;
		}else if (toRound <= 50){
			//50 cal - express to nearest 5 cal increment
			return roundToNearestNum(toRound, 5);
		}else{
			//> 50 cal - express to nearest 10 cal increment
			return roundToNearestNum(toRound, 10);
		}
	}


	//Total Fat, Saturated Fat, Polyunsaturated Fat and Monounsaturated Fat rounding rule
	function roundFatRule(toRound){
		if (toRound < .5){
			return 0;
		}else if (toRound < 5){
			//< 5 g - express to nearest .5g increment
			return roundToNearestNum(toRound, .5);
		}else{
			//>= 5 g - express to nearest 1 g increment
			return roundToNearestNum(toRound, 1);
		}
	}


	//Sodium rounding rule
	function roundSodiumRule(toRound){
		if (toRound < 5){
			return 0;
		}else if (toRound <= 140){
			//5 - 140 mg - express to nearest 5 mg increment
			return roundToNearestNum(toRound, 5);
		}else{
			//>= 5 g - express to nearest 10 g increment
			return roundToNearestNum(toRound, 10);
		}
	}


	//Potassium rounding rule
	function roundPotassiumRule(toRound){
		if (toRound < 5){
			return 0;
		}else if (toRound <= 140){
			//5 - 140 mg - express to nearest 5 mg increment
			return roundToNearestNum(toRound, 5);
		}else{
			//>= 5 g - express to nearest 10 g increment
			return roundToNearestNum(toRound, 10);
		}
	}


	//Cholesterol rounding rule
	function roundCholesterolRule(toRound){
		if (toRound < 2){
			return 0;
		}else if (toRound <= 5){
			return false;
		}else{
			//> 5 mg - express to nearest 5 mg increment
			return roundToNearestNum(toRound, 5);
		}
	}


	//Total Carbohydrate, Dietary Fiber, Sugar and Protein rounding rule
	function roundCarbFiberSugarProteinRule(toRound){
		if (toRound < .5){
			return 0;
		}else if (toRound < 1){
			//< 1 g - express as "Contains less than 1g" or "less than 1g"
			return false;
		}else{
			//> 1 mg - express to nearest 1 g increment
			return roundToNearestNum(toRound, 1);
		}
	}


	//Total Carbohydrate, Dietary Fiber, Sugar and Protein rounding rule
	function roundVitaminsCalciumIron(toRound){
		if (toRound > 0){
			if (toRound < 10){
				//< 10 - round to nearest even number
				return roundToNearestNum(toRound, 2);
			}else if (toRound < 50){
				//between 10 and 50, round to the nearest 5 increment
				return roundToNearestNum(toRound, 5);
			}else{
				//else, round to the nearest 10 increment
				return roundToNearestNum(toRound, 10);
			}
		}else{
			return 0;
		}
	}


	//check if the value is a positive number
	function regIsPosNumber(fData){
		return new RegExp('(^[0-9]+[\.]?[0-9]+$)|(^[0-9]+$)').test(fData);
	}


	//generate and return the html code for the item area
	function itemNameHtmlLegacy($localSettings){
		//initializing the tab variables (for debugging and editing purposes)
		//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
		for (x = 1; x < 5; x++){
			var tab = '';
			for (y = 1; y <= x; y++){
				tab += '\t';
			}
			eval('var localTab' + x + ' = "' + tab + '";');
		}

		var tabTemp = localTab1;
		var localNutritionLabel = itemNameClass = '';
		if ($localSettings.showServingUnitQuantityTextbox){
			if (
					($localSettings.valueServingSizeUnit == null || $localSettings.valueServingSizeUnit == '') ||
					(
						$localSettings.valueServingSizeUnit !== '' &&
						$localSettings.valueServingSizeUnit !== null &&
						$localSettings.originalServingUnitQuantity <= 0
					)
			){
			localNutritionLabel += localTab1 + '<div class="cf">\n';
				localNutritionLabel += localTab2 + '<div class="rel servingSizeField">\n';

				var textboxClass = 'unitQuantityBox';
				if (!$localSettings.hideTextboxArrows){
					localNutritionLabel += localTab3 + '<div class="setter">\n';
						localNutritionLabel += localTab4 + '<a href="Increase the quantity" class="unitQuantityUp" aria-label="increase the Quantity Arrow" rel="nofollow" tabindex="0"></a>\n';
						localNutritionLabel += localTab4 + '<a href="Decrease the quantity" class="unitQuantityDown" aria-label="Decrease the Quantity Arrow" rel="nofollow" tabindex="0"></a>\n';
					localNutritionLabel += localTab3 + '</div><!-- closing class="setter" -->\n\n';
				}else{
					textboxClass = 'unitQuantityBox arrowsAreHidden';
				}

					localNutritionLabel += localTab3 + '<input type="text" value="' + parseFloat(
						$localSettings.valueServingUnitQuantity.toFixed($localSettings.decimalPlacesForQuantityTextbox)
					) + '" class="' + textboxClass + '" aria-label="Change the Quantity Textbox">\n';

					localNutritionLabel += localTab3 + '<input type="hidden" value="' + parseFloat(
						$localSettings.valueServingUnitQuantity.toFixed($localSettings.decimalPlacesForQuantityTextbox)
					) + '" id="nixLabelBeforeQuantity">\n';

				localNutritionLabel += localTab2 + '</div><!-- closing class="servingSizeField" -->\n\n';
				tabTemp = localTab2;
				var itemNameClass = 'inline';
			}
		}//end of => if ($localSettings.showServingUnitQuantityTextbox){

			localNutritionLabel += tabTemp + '<div class="name ' + itemNameClass + '" tabindex="0">';
				localNutritionLabel += $localSettings.itemName;
			if ($localSettings.showBrandName && $localSettings.brandName != null && $localSettings.brandName != ''){
				localNutritionLabel += ' - ' + $localSettings.brandName;
			}
			localNutritionLabel += '</div>\n';

		if ($localSettings.showServingUnitQuantityTextbox){
			if (
					($localSettings.valueServingSizeUnit == null || $localSettings.valueServingSizeUnit == '') ||
					(
						$localSettings.valueServingSizeUnit !== '' &&
						$localSettings.valueServingSizeUnit !== null &&
						$localSettings.originalServingUnitQuantity <= 0
					)
			){
				localNutritionLabel += localTab1 + '</div><!-- closing class="cf" -->\n\n';
			}
		}

		return localNutritionLabel;
	}//end of => function itemNameHtmlLegacy($localSettings)


	//generate and return the html code for the serving unit quantity area
	function sevingUnitQuantityHtmlLegacy($localSettings){
		//initializing the tab variables (for debugging and editing purposes)
		//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
		for (x = 1; x < 6; x++){
			var tab = '';
			for (y = 1; y <= x; y++){
				tab += '\t';
			}
			eval('var localTab' + x + ' = "' + tab + '";');
		}

		var localServingSizeIsHidden = localServingContainerIsHidden = false;
		var localNutritionLabel = '';
		if ($localSettings.showServingUnitQuantity){
			localNutritionLabel += localTab1 + '<div class="serving" tabIndex="0">\n';

			if ($localSettings.originalServingUnitQuantity > 0){
				localNutritionLabel += localTab2 + '<div class="cf">\n';
					localNutritionLabel += localTab3 + '<div class="servingSizeText fl">' + $localSettings.textServingSize + '</div>\n';
						localNutritionLabel += $localSettings.showServingUnitQuantityTextbox ?
							'' :
							localTab3 + '<div class="servingUnitQuantity fl" itemprop="servingSize">' +
								parseFloat( $localSettings.originalServingUnitQuantity.toFixed($localSettings.decimalPlacesForNutrition) ) +
							'</div>\n';

				var unitAddedClass = '';
				var gramsAddedClass = '';
				if ($localSettings.valueServingSizeUnit !== '' && $localSettings.valueServingSizeUnit !== null){
					if (
							$localSettings.showServingUnitQuantityTextbox &&
							$localSettings.valueServingSizeUnit != null &&
							$localSettings.valueServingSizeUnit != ''
					){
						unitAddedClass = 'unitHasTextbox';
						gramsAddedClass = 'gramsHasTextbox';
						localNutritionLabel += localTab3 + '<div class="rel servingSizeField fl">\n';

						var textboxClass = 'unitQuantityBox';
						if (!$localSettings.hideTextboxArrows){
							localNutritionLabel += localTab4 + '<div class="setter">\n';
								localNutritionLabel += localTab5 + '<a href="Increase the quantity" class="unitQuantityUp" aria-label="increase the Quantity Arrow" rel="nofollow" tabindex="0"></a>\n';
								localNutritionLabel += localTab5 + '<a href="Decrease the quantity" class="unitQuantityDown" aria-label="Decrease the Quantity Arrow" rel="nofollow" tabindex="0"></a>\n';
							localNutritionLabel += localTab4 + '</div><!-- closing class="setter" -->\n\n';
						}else{
							textboxClass = 'unitQuantityBox arrowsAreHidden';
						}

							localNutritionLabel += localTab4 + '<input type="text" value="' + parseFloat(
								$localSettings.valueServingUnitQuantity.toFixed($localSettings.decimalPlacesForQuantityTextbox)
							) + '" class="' + textboxClass + '" aria-label="Change the Quantity Textbox">\n';

							localNutritionLabel += localTab4 + '<input type="hidden" value="' + parseFloat(
								$localSettings.valueServingUnitQuantity.toFixed($localSettings.decimalPlacesForQuantityTextbox)
							) + '" id="nixLabelBeforeQuantity">\n';

						localNutritionLabel += localTab3 + '</div><!-- closing class="servingSizeField" -->\n\n';
					}else if ($localSettings.originalServingUnitQuantity > 0 && $localSettings.showServingUnitQuantityTextbox){
						localNutritionLabel += localTab3 + '<div class="servingUnitQuantity" itemprop="servingSize">' +
							parseFloat( $localSettings.originalServingUnitQuantity.toFixed($localSettings.decimalPlacesForNutrition) ) +
						'</div>\n';
					}

						localNutritionLabel += localTab3 + '<div class="servingUnit fl ' + unitAddedClass + '">' +
							$localSettings.valueServingSizeUnit +
						($localSettings.legacyVersion == 1 ? '</div>\n' : '');

				//end of => if ($localSettings.valueServingSizeUnit !== '' && $localSettings.valueServingSizeUnit !== null)
				}else if ($localSettings.originalServingUnitQuantity > 0 && $localSettings.showServingUnitQuantityTextbox){
						localNutritionLabel += localTab3 + '<div class="servingUnitQuantity fl" itemprop="servingSize">' +
							parseFloat( $localSettings.originalServingUnitQuantity.toFixed($localSettings.decimalPlacesForNutrition) ) +
						'</div>\n';
				}

				if ($localSettings.valueServingWeightGrams > 0){
						localNutritionLabel += localTab3 + '<' + ($localSettings.legacyVersion == 1 ? 'div' : 'span') + ' class="servingWeightGrams ' +
							($localSettings.legacyVersion == 1 ? 'fl' : '') + ' ' + gramsAddedClass + '">' +
							'(<span itemprop="servingSize">' +
									parseFloat( $localSettings.valueServingWeightGrams.toFixed($localSettings.decimalPlacesForNutrition) ) +
									'<span aria-hidden="true">g</span><span class="sr-only"> grams</span>' +
								'</span>)\n</' +
						($localSettings.legacyVersion == 1 ? 'div' : 'span') + '>\n';
				}

					localNutritionLabel += localTab3 + ($localSettings.legacyVersion == 1 ? '' : '</div>\n');

				localNutritionLabel += localTab2 + '</div><!-- closing class="cf" -->\n\n';
			}else{
				localServingSizeIsHidden = true;
			}//end of => else => if ($localSettings.originalServingUnitQuantity > 0){

			if ($localSettings.showServingsPerContainer){
				//Serving per container
				if ($localSettings.valueServingPerContainer > 0){
					localNutritionLabel += localTab2 + '<div tabindex="0">' + $localSettings.textServingsPerContainer + ' ' + parseFloat(
						$localSettings.valueServingPerContainer.toFixed($localSettings.decimalPlacesForNutrition)
					) + '</div>\n';
				}else{
					localServingContainerIsHidden = true;
				}
			}else{
				localServingContainerIsHidden = true;
			}

			localNutritionLabel += localTab1 + '</div><!-- closing class="serving" -->\n\n';
		}//end of => if ($localSettings.showServingUnitQuantity)

		return {
			'servingSizeIsHidden' : localServingSizeIsHidden,
			'servingContainerIsHidden' : localServingContainerIsHidden,
			'nutritionLabel' : localNutritionLabel
		};
	}//end of => function sevingUnitQuantityHtmlLegacy($localSettings)


	//generate and return the html code for the calorie diets area
	function calorieDietHtmlLegacy($localSettings){
		//initializing the tab variables (for debugging and editing purposes)
		//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
		for (x = 2; x < 6; x++){
			var tab = '';
			for (y = 1; y <= x; y++){
				tab += '\t';
			}
			eval('var localTab' + x + ' = "' + tab + '";');
		}

		var localNutritionLabel = localTab2 + '<table class="tblCalorieDiet" aria-hidden="true">\n';
			localNutritionLabel += localTab3 + '<thead>\n';
				localNutritionLabel += localTab4 + '<tr>\n';
					localNutritionLabel += localTab5 + '<th>&nbsp;</th>\n';
					localNutritionLabel += localTab5 + '<th>Calories</th>\n';
					localNutritionLabel += localTab5 + '<th>' + $localSettings.valueCol1CalorieDiet + '</th>\n';
					localNutritionLabel += localTab5 + '<th>' + $localSettings.valueCol2CalorieDiet + '</th>\n';
				localNutritionLabel += localTab4 + '</tr>\n';
			localNutritionLabel += localTab3 + '</thead>\n';
			localNutritionLabel += localTab3 + '<tbody>\n';
				localNutritionLabel += localTab4 + '<tr>\n';
					localNutritionLabel += localTab5 + '<td>Total Fat</td>\n';
					localNutritionLabel += localTab5 + '<td>Less than</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol1DietaryTotalFat + 'g</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol2DietaryTotalFat + 'g</td>\n';
				localNutritionLabel += localTab4 + '</tr>\n';
				localNutritionLabel += localTab4 + '<tr>\n';
					localNutritionLabel += localTab5 + '<td>&nbsp;&nbsp; Saturated Fat</td>\n';
					localNutritionLabel += localTab5 + '<td>Less than</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol1DietarySatFat + 'g</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol2DietarySatFat + 'g</td>\n';
				localNutritionLabel += localTab4 + '</tr>\n';
				localNutritionLabel += localTab4 + '<tr>\n';
					localNutritionLabel += localTab5 + '<td>Cholesterol</td>\n';
					localNutritionLabel += localTab5 + '<td>Less than</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol1DietaryCholesterol + 'mg</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol2DietaryCholesterol + 'mg</td>\n';
				localNutritionLabel += localTab4 + '</tr>\n';
				localNutritionLabel += localTab4 + '<tr>\n';
					localNutritionLabel += localTab5 + '<td>Sodium</td>\n';
					localNutritionLabel += localTab5 + '<td>Less than</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol1DietarySodium + 'mg</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol2DietarySodium + 'mg</td>\n';
				localNutritionLabel += localTab4 + '</tr>\n';
				localNutritionLabel += localTab4 + '<tr>\n';
					localNutritionLabel += localTab5 + '<td>Potassium</td>\n';
					localNutritionLabel += localTab5 + '<td>Less than</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol1DietaryPotassium + 'mg</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol2DietaryPotassium + 'mg</td>\n';
				localNutritionLabel += localTab4 + '</tr>\n';
				localNutritionLabel += localTab4 + '<tr>\n';
					localNutritionLabel += localTab5 + '<td>Total Carbohydrate</td>\n';
					localNutritionLabel += localTab5 + '<td>&nbsp;</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol1DietaryTotalCarb + 'g</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol2DietaryTotalCarb + 'g</td>\n';
				localNutritionLabel += localTab4 + '</tr>\n';
				localNutritionLabel += localTab4 + '<tr>\n';
					localNutritionLabel += localTab5 + '<td>&nbsp;&nbsp; Dietary</td>\n';
					localNutritionLabel += localTab5 + '<td>&nbsp;</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol1Dietary + 'g</td>\n';
					localNutritionLabel += localTab5 + '<td>' + $localSettings.valueCol2Dietary + 'g</td>\n';
				localNutritionLabel += localTab4 + '</tr>\n';
			localNutritionLabel += localTab3 + '</tbody>\n';
		return localNutritionLabel += localTab2 + '</table>\n';
	}//end of => calorieDietHtmlLegacy($localSettings)


	//generate and return the html code for the ingredients area
	function ingredientsHtmlLegacy($localSettings){
		//initializing the tab variables (for debugging and editing purposes)
		//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
		for (x = 3; x < 5; x++){
			var tab = '';
			for (y = 1; y <= x; y++){
				tab += '\t';
			}
			eval('var localTab' + x + ' = "' + tab + '";');
		}

		var localNutritionLabel = localTab3 + '<br/>\n';
		localNutritionLabel += localTab3 + '<div class="ingredientListDiv" tabindex="0">\n';
			localNutritionLabel += localTab4 + '<strong class="active" id="ingredientList">' + $localSettings.ingredientLabel + '</strong>\n';
			localNutritionLabel += localTab4 + $localSettings.ingredientList + '\n';
		return localNutritionLabel += localTab3 + '</div><!-- closing class="ingredientListDiv" -->\n\n';
	}


	//generate and return the html code for the disclaimer area
	function disclaimerHtmlLegacy($localSettings){
		//initializing the tab variables (for debugging and editing purposes)
		//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
		for (x = 3; x < 5; x++){
			var tab = '';
			for (y = 1; y <= x; y++){
				tab += '\t';
			}
			eval('var localTab' + x + ' = "' + tab + '";');
		}

		var localNutritionLabel = localTab3 + '<br/>\n\n';
		localNutritionLabel += localTab3 + '<div id="calcDisclaimer">\n';
			localNutritionLabel += localTab4 + '<span id="calcDisclaimerText" tabindex="0">' + $localSettings.valueDisclaimer + '</span>\n';
		localNutritionLabel += localTab3 + '</div>\n';
		return localNutritionLabel += localTab3 + '<br/>\n\n';
	}


	//generate and return the html code for the bottom link area
	function bottomLinkHtmlLegacy($localSettings, localTab1){
		var localNutritionLabel = localTab1 + '<div class="spaceAbove"></div>\n';
		localNutritionLabel += localTab1 + '<a href="' + $localSettings.urlBottomLink + '" target="_newSite" class="homeLinkPrint">' + $localSettings.nameBottomLink + '</a>\n';
		return localNutritionLabel += localTab1 + '<div class="spaceBelow"></div>\n';
	}


	/*
	 * generate and return the html code for these areas that share similar html format for the legacy version of the label:
	 *    fat calories, calories, trans fat, poly fat, mono fat, sugars, proteins, vitamin a, vitamin c, calcium and iron
	 * attributeDisplayType
	 *    1 => <strong> + $localSettings[attributeText] + </strong> <span itemprop=" + itemPropValue + ">
	 *    2 => $localSettings[attributeText] + ' '
	 *    3 => localExtraTab + $localSettings[attributeText] +  <span itemprop="transFatContent">;
	 *    4 => localTab1 + <div class="line indent">;
	 *    5 => a bit special format for vitamin a, vitamin c, calcium and iron
	 */
	function generateAttributeWithoutPercentageHtmlLegacy(
			$localSettings, valueIndex, unitIndex, naIndex, attributeText, localTabValue, lineClass, attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName
	){
		//initialize the not applicable image icon in case we need to use it
		//attributeDisplayType == 5 => for vitamin a, vitamin c, calcium and iron
		var localNaValue = '<font class="notApplicable" aria-hidden="true">-&nbsp;</font><font class="sr-only">Data not available' + (attributeDisplayType == 5 ? ' for ' : '') + '</font>';
		var localNutritionLabel = localTabValue + '<div class="' + lineClass + '" tabindex="0">';

		if (attributeDisplayType == 1){
			localNutritionLabel += '<strong>' + $localSettings[attributeText] + '</strong> <span itemprop="' + itemPropValue + '">';
		}else if (attributeDisplayType == 2){
			localNutritionLabel += $localSettings[attributeText] + ' ';
		}else if (attributeDisplayType == 3){
			localNutritionLabel += localExtraTab + $localSettings[attributeText] + ' <span itemprop="' + itemPropValue + '">';
		}else if (attributeDisplayType == 4){
			localNutritionLabel += $localSettings[attributeText] + ' <span itemprop="' + itemPropValue + '">';
		}else if (attributeDisplayType == 5){
			localNutritionLabel += localExtraTab + '<div class="dv">\n';
		}

		localNutritionLabel += $localSettings[naIndex] ?
			localNaValue :
			(
				$localSettings.allowFDARounding ?
					eval(roundFunctionName)($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition) :
					parseFloat( $localSettings[valueIndex].toFixed($localSettings.decimalPlacesForNutrition) )
			) + $localSettings[unitIndex];

		if (attributeDisplayType == 1 || attributeDisplayType == 4){
			localNutritionLabel += '</span></div>\n';
		}else if (attributeDisplayType == 2){
			localNutritionLabel += '</div>\n';
		}else if (attributeDisplayType == 3){
			localNutritionLabel += '\n' + localTabValue + '</span></div>\n';
		}else if (attributeDisplayType == 5){
				localNutritionLabel += '</div>\n';
				localNutritionLabel += localExtraTab + $localSettings[attributeText] + '\n';
			localNutritionLabel += localTabValue + '</div>\n';
		}

		return localNutritionLabel;
	}//end of => function generateAttributeWithoutPercentageHtmlLegacy
									//($localSettings, valueIndex, unitIndex, naIndex, attributeText, localTabValue, lineClass, attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName)


	/*
	 * generate and return the html code for these areas that share similar html format: total fat, sat fat, cholesterol, sodium, total carb, fiber and potassium
	 */
	function generateAttributeWithPercentageHtmlLegacy(
			$localSettings, valueIndex, dailyValueIndex, unitIndex, naIndex, attributeTexts, lineClass, itemPropValue, roundFunctionName, roundFunctionRuleName, boldName
	){
		//initializing the tab variables (for debugging and editing purposes)
		//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
		for (x = 1; x < 3; x++){
			var tab = '';
			for (y = 1; y <= x; y++){
				tab += '\t';
			}
			eval('var localTab' + x + ' = "' + tab + '";');
		}

		//initialize the not applicable image icon in case we need to use it
		var localNaValue = '<font class="notApplicable" aria-hidden="true">-&nbsp;</font><font class="sr-only">Data not available</font>';

		//https://github.com/nutritionix/nutrition-label/wiki/How-the-Percent-Daily-Value-is-Computed
		var localNutritionLabel = localTab1 + '<div class="' + lineClass + '" tabindex="0">\n';
			localNutritionLabel += localTab2 + '<div class="dv" aria-hidden="true">';
				localNutritionLabel += $localSettings[naIndex] ?
					localNaValue :
					'<strong>' +
					parseFloat(
						parseFloat(
							(
								(
									$localSettings.allowFDARounding ? eval(roundFunctionRuleName)($localSettings[valueIndex]) : $localSettings[valueIndex]
								) / (
									$localSettings[dailyValueIndex] == 0 ? 1 : $localSettings[dailyValueIndex] * (parseFloat($localSettings.calorieIntake) / 2000).toFixed(2) //the 2nd part is the calorie intake
								)
							) * 100
						).toFixed($localSettings.decimalPlacesForDailyValues)
					) + '</strong>%';
			localNutritionLabel += '</div>\n';

		if (boldName){
			localNutritionLabel += localTab2 + '<strong>' + $localSettings[attributeTexts] + '</strong> <span itemprop="' + itemPropValue + '">';
		}else{
			localNutritionLabel += localTab2 + $localSettings[attributeTexts] + ' <span itemprop="' + itemPropValue + '">';
		}

		localNutritionLabel += (
			$localSettings[naIndex] ?
				localNaValue :
				(
					$localSettings.allowFDARounding ?
						eval(roundFunctionName)($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition) :
						parseFloat( $localSettings[valueIndex].toFixed($localSettings.decimalPlacesForNutrition) )
				) + $localSettings[unitIndex]
		) + '\n';
		return localNutritionLabel += localTab1 + '</span></div>\n';
	}//end of => function generateAttributeWithPercentageHtmlLegacy($localSettings, valueIndex, dailyValueIndex, unitIndex, naIndex, attributeTexts, localNaValue,
																																//lineClass, itemPropValue, roundFunctionName, roundFunctionRuleName, boldName)


	/*
	 * generate and return the html code for these areas that share similar html format for the 2018 version of the label:
	 *    calories, total fat, saturated fat, trans fat, poly fat, mono fat, cholesterol, sodium, total carb, fibers, sugars, added sugar, proteins
	 */
	function generateAttributeHtml2018Version(
			$localSettings, valueIndex, unitIndex, naIndex, attributeText, itemPropValue, topDivClass, showPercentageCode, roundFunctionName, roundFunctionRuleName, labelClass, valueClass, dailyValueIndex
	){
		//initializing the tab variables (for debugging and editing purposes)
		//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
		for (x = 1; x < 4; x++){
			var tab = '';
			for (y = 1; y <= x; y++){
				tab += '\t';
			}
			eval('var localTab' + x + ' = "' + tab + '";');
		}

		//initialize the not applicable image icon in case we need to use it
		var localNaValue = '<font class="notApplicable" aria-hidden="true">-&nbsp;</font><font class="sr-only">Data not available</font>';
		var localNutritionLabel = localTab1 + '<div class="' + topDivClass +'" tabindex="0">\n';

		if (showPercentageCode){
			localNutritionLabel += localTab2 + '<span class="nf-highlight nf-pr" aria-hidden="true">';
				//https://github.com/nutritionix/nutrition-label/wiki/How-the-Percent-Daily-Value-is-Computed
				localNutritionLabel += $localSettings[naIndex] ?
					localNaValue :
					parseFloat(
						parseFloat(
							(
								(
									$localSettings.allowFDARounding ? eval(roundFunctionRuleName)($localSettings[valueIndex]) : $localSettings[valueIndex]
								) / (
									$localSettings[dailyValueIndex] == 0 ? 1 : $localSettings[dailyValueIndex] * (parseFloat($localSettings.calorieIntake) / 2000).toFixed(2)
								)
							) * 100
						).toFixed($localSettings.decimalPlacesForDailyValues)
					) + '%';
			localNutritionLabel += '</span>\n';
		}

		//this is for everything else
		if (valueIndex != 'valueAddedSugars'){
			localNutritionLabel += localTab2 + '<span class="' + labelClass + '">';
				localNutritionLabel += $localSettings[attributeText];
			localNutritionLabel += '</span>\n';

			localNutritionLabel += localTab2 + '<span class="' + valueClass + '" itemprop="' + itemPropValue + '">';
				localNutritionLabel += $localSettings[naIndex] ?
					localNaValue :
					(
						$localSettings.allowFDARounding ?
							eval(roundFunctionName)($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition) :
							parseFloat( $localSettings[valueIndex].toFixed($localSettings.decimalPlacesForNutrition) )
					) + $localSettings[unitIndex];
			localNutritionLabel += '</span>\n';
		//special case for added sugars
		}else{
			localNutritionLabel += localTab2 + '<span class="' + labelClass + '">\n';
				localNutritionLabel += $localSettings['textAddedSugars1'] + '\n';
				localNutritionLabel += localTab3 + '<span class="' + valueClass + '" itemprop="' + itemPropValue + '">';
					localNutritionLabel += $localSettings[naIndex] ?
						localNaValue :
						(
							$localSettings.allowFDARounding ?
								eval(roundFunctionName)($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition) :
								parseFloat( $localSettings[valueIndex].toFixed($localSettings.decimalPlacesForNutrition) )
						) + $localSettings[unitIndex];
				localNutritionLabel += '</span>\n';
				localNutritionLabel += $localSettings['textAddedSugars2'];
			localNutritionLabel += '</span>\n';
		}

		return localNutritionLabel += localTab1 + '</div>\n';
	}//end of =. function generateAttributeHtml2018Version($localSettings, valueIndex, unitIndex, naIndex, attributeText, itemPropValue, topDivClass, showPercentageCode,


	//generate and return the html code for the ingredients area
	function ingredientsHtml2018Version($localSettings){
		//initializing the tab variables (for debugging and editing purposes)
		//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
		for (x = 3; x < 5; x++){
			var tab = '';
			for (y = 1; y <= x; y++){
				tab += '\t';
			}
			eval('var localTab' + x + ' = "' + tab + '";');
		}

		var localNutritionLabel = localTab3 + '<br/>\n\n';
		localNutritionLabel += localTab3 + '<div class="nf-ingredientListDiv" tabindex="0">\n';
			localNutritionLabel += localTab4 + '<strong class="active" id="nf-ingredientList">' + $localSettings.ingredientLabel + '</strong>\n';
			localNutritionLabel += localTab4 + $localSettings.ingredientList + '\n';
		return localNutritionLabel += localTab3 + '</div><!-- closing class="nf-ingredientListDiv" -->\n\n';
	}


	//generate and return the html code for the disclaimer area
	function disclaimerHtml2018Version($localSettings){
		//initializing the tab variables (for debugging and editing purposes)
		//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
		for (x = 3; x < 5; x++){
			var tab = '';
			for (y = 1; y <= x; y++){
				tab += '\t';
			}
			eval('var localTab' + x + ' = "' + tab + '";');
		}

		var localNutritionLabel = localTab3 + '<br/>\n\n';
		localNutritionLabel += localTab3 + '<div id="nf-calcDisclaimer">\n';
			localNutritionLabel += localTab4 + '<span id="nf-calcDisclaimerText" tabindex="0">' + $localSettings.valueDisclaimer + '</span>\n';
		localNutritionLabel += localTab3 + '</div>\n';
		return localNutritionLabel += localTab3 + '<br/>\n\n';
	}


	//generate and return the html code for the bottom link area
	function bottomLinkHtml2018Version($localSettings, localTab1){
		var localNutritionLabel = localTab1 + '<div class="nf-spaceAbove"></div>\n';
		localNutritionLabel += localTab1 + '<a href="' + $localSettings.urlBottomLink + '" target="_newSite" class="nf-homeLinkPrint">' + $localSettings.nameBottomLink + '</a>\n';
		return localNutritionLabel += localTab1 + '<div class="nf-spaceBelow"></div>\n';
	}


	/*
	 * generate and return the html code for these areas that share similar html format: vitamin d, calcium, iron and potassium
	 */
	function generateHtmlAndComputeValueGivenThePercentage($localSettings, valueIndex, dailyValueIndex, unitIndex_base, unitIndex_percent, naIndex, attributeTexts){
		//initialize the not applicable image icon in case we need to use it
		var localNaValue = '<font class="notApplicable" aria-hidden="true">-&nbsp;</font><font class="sr-only">Data not available</font>';
		var localNutritionLabel = '<div class="nf-vitamin-column" tabindex="0">\n';
			localNutritionLabel += $localSettings[attributeTexts] + ' ';
			localNutritionLabel += (
				$localSettings[naIndex] ?
					localNaValue : (
						parseFloat(
							//percentage / 100 * daily value
							($localSettings[valueIndex] / 100) * $localSettings[dailyValueIndex]
						).toFixed($localSettings.decimalPlacesForDailyValues) +
						$localSettings[unitIndex_base] +
						' <span class="nf-pr" aria-hidden="true">' +
							$localSettings[valueIndex].toFixed($localSettings.decimalPlacesForDailyValues) + $localSettings[unitIndex_percent] +
						'</span>'
					)
			) + '\n';
		return localNutritionLabel += '</div>\n';
	}


	//generate and return the html code for the item area
	function itemNameHtml2018($localSettings){
		//initializing the tab variables (for debugging and editing purposes)
		//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
		for (x = 3; x < 6; x++){
			var tab = '';
			for (y = 1; y <= x; y++){
				tab += '\t';
			}
			eval('var localTab' + x + ' = "' + tab + '";');
		}

		var itemNameClass = '';
		localNutritionLabel = '';

		if ($localSettings.showServingUnitQuantityTextbox){
			if (
					($localSettings.valueServingSizeUnit == null || $localSettings.valueServingSizeUnit == '') ||
					(
						$localSettings.valueServingSizeUnit !== '' &&
						$localSettings.valueServingSizeUnit !== null &&
						$localSettings.originalServingUnitQuantity <= 0
					)
			){
				var hideArrowsClass = '';
				var textboxClass = 'nf-unitQuantityBox nf-modifier-field';
				if (!$localSettings.hideTextboxArrows){
					localNutritionLabel += localTab3 + '<div class="nf-arrows">\n';
						localNutritionLabel += localTab4 + '<div class="nf-unitQuantityUp nf-arrow-up" aria-label="Increase the Quantity Arrow" rel="nofollow" tabindex="0"></div>\n';
						localNutritionLabel += localTab4 + '<div class="nf-unitQuantityDown nf-arrow-down" aria-label="Decrease the Quantity Arrow" rel="nofollow" tabindex="0"></div>\n';
					localNutritionLabel += localTab3 + '</div><!-- closing class="nf-arrows v1" -->\n\n';
				}else{
					textboxClass = 'nf-unitQuantityBox nf-modifier-field nf-arrowsAreHidden';
					hideArrowsClass = 'nf-fixed-serving ';
				}

					localNutritionLabel += localTab3 + '<input type="text" value="' + parseFloat(
						$localSettings.valueServingUnitQuantity.toFixed($localSettings.decimalPlacesForQuantityTextbox)
					) + '" class="' + textboxClass + '" data-role="none" aria-label="Change the Quantity Textbox">\n';

					localNutritionLabel += localTab3 + '<input type="hidden" value="' + parseFloat(
						$localSettings.valueServingUnitQuantity.toFixed($localSettings.decimalPlacesForQuantityTextbox)
					) + '" id="nf-nixLabelBeforeQuantity">\n\n';

				var itemNameClass = hideArrowsClass;
			}else if (!$localSettings.showServingUnitQuantity){
				itemNameClass += 'no-indent';
			}
		//end of => if ($localSettings.showServingUnitQuantityTextbox)
		}else{
			itemNameClass += 'no-indent';
		}

		localNutritionLabel += localTab3 + '<div class="nf-item-name ' + itemNameClass + '" tabindex="0">' + '\n';

			if (
					$localSettings.showServingUnitQuantity &&
					$localSettings.originalServingUnitQuantity > 0 &&
					$localSettings.valueServingSizeUnit !== '' &&
					$localSettings.valueServingSizeUnit !== null
			){
				localNutritionLabel += localTab4 + $localSettings.valueServingSizeUnit + '\n';

				if ($localSettings.valueServingWeightGrams > 0){
					localNutritionLabel += localTab4 + '(<span itemprop="servingSize">' +
						parseFloat( $localSettings.valueServingWeightGrams.toFixed($localSettings.decimalPlacesForNutrition) ) +
						'<span aria-hidden="true">g</span><span class="sr-only"> grams</span>' +
					'</span>)\n';
				}
			}

			localNutritionLabel += localTab4 + '<div>\n';
				localNutritionLabel += localTab5 + $localSettings.itemName + '\n';
				if ($localSettings.showBrandName && $localSettings.brandName != null && $localSettings.brandName != ''){
					localNutritionLabel += ' - ' + $localSettings.brandName;
				}
			localNutritionLabel += '\n' + localTab4 + '</div>\n';

		localNutritionLabel += localTab3 + '</div>\n';

		return localNutritionLabel;
	}//end of => function itemNameHtml2018($localSettings)


	//generate and return the html code for the serving unit quantity area
	function sevingUnitQuantityHtml2018($localSettings){
		//initializing the tab variables (for debugging and editing purposes)
		//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
		for (x = 3; x < 7; x++){
			var tab = '';
			for (y = 1; y <= x; y++){
				tab += '\t';
			}
			eval('var localTab' + x + ' = "' + tab + '";');
		}

		var localServingSizeIsHidden = localServingContainerIsHidden = false;
		var localNutritionLabel = '';

		if ($localSettings.showServingUnitQuantity){
			if ($localSettings.originalServingUnitQuantity > 0){
				localNutritionLabel += localTab3 + '<div tabIndex="0"><!-- opening for serving size div -->\n';
					localNutritionLabel += localTab4 + $localSettings.textServingSize;

					localNutritionLabel += $localSettings.showServingUnitQuantityTextbox ?
						'' :
						' <span itemprop="servingSize">' +
							parseFloat( $localSettings.originalServingUnitQuantity.toFixed($localSettings.decimalPlacesForNutrition) ) +
						'</span>\n';

				var servingSizeDivAlreadyClosed = false;

				var unitAddedClass = '';
				var gramsAddedClass = '';
				if ($localSettings.valueServingSizeUnit !== '' && $localSettings.valueServingSizeUnit !== null){
					if (
							$localSettings.showServingUnitQuantityTextbox &&
							$localSettings.valueServingSizeUnit != null &&
							$localSettings.valueServingSizeUnit != ''
					){
						unitAddedClass = 'nf-unitHasTextbox';
						gramsAddedClass = 'nf-gramsHasTextbox';

						//close the serving size div
						//this is needed so cases like this will be shown properly
						servingSizeDivAlreadyClosed = true;
						localNutritionLabel += '\n' + localTab3 + '</div><!-- closing for serving size div -->\n\n';

						var textboxClass = 'nf-unitQuantityBox nf-modifier-field';
						if (!$localSettings.hideTextboxArrows){
							localNutritionLabel += localTab5 + '<div class="nf-arrows"><!-- opening class="nf-arrows" -->\n';
								localNutritionLabel += localTab6 + '<div class="nf-unitQuantityUp nf-arrow-up" aria-label="Increase the Quantity Arrow" rel="nofollow" tabindex="0"></div>\n';
								localNutritionLabel += localTab6 + '<div class="nf-unitQuantityDown nf-arrow-down" aria-label="DePcrease the Quantity Arrow" rel="nofollow" tabindex="0"></div>\n';
							localNutritionLabel += localTab5 + '</div><!-- closing class="nf-arrows v2" -->\n\n';
						}else{
							textboxClass = 'nf-unitQuantityBox nf-modifier-field nf-arrowsAreHidden';
						}

							localNutritionLabel += localTab5 + '<input type="text" data-role="none" value="' + parseFloat(
								$localSettings.valueServingUnitQuantity.toFixed($localSettings.decimalPlacesForQuantityTextbox)
							) + '" class="' + textboxClass + '" aria-label="Change the Quantity Textbox">\n';

							localNutritionLabel += localTab5 + '<input type="hidden" value="' + parseFloat(
								$localSettings.valueServingUnitQuantity.toFixed($localSettings.decimalPlacesForQuantityTextbox)
							) + '" id="nf-nixLabelBeforeQuantity">\n\n';
					}else if ($localSettings.originalServingUnitQuantity > 0 && $localSettings.showServingUnitQuantityTextbox){
							localNutritionLabel += ' <span itemprop="servingSize">' +
								parseFloat( $localSettings.originalServingUnitQuantity.toFixed($localSettings.decimalPlacesForNutrition) ) +
							'</span>\n';
					}

					if (!$localSettings.showItemName){
						localNutritionLabel += localTab5 + '<div class="nf-item-name" tabindex="0">\n';
							localNutritionLabel += localTab6 + $localSettings.valueServingSizeUnit + '\n';

						if ($localSettings.valueServingWeightGrams > 0){
							localNutritionLabel += localTab6 + '(' +
								$localSettings.valueServingWeightGrams.toFixed($localSettings.decimalPlacesForQuantityTextbox) +
							'<span aria-hidden="true">g</span><span class="sr-only"> grams</span>)\n';
						}

						localNutritionLabel += localTab5 + '</div>\n';
					}

				}else if ($localSettings.originalServingUnitQuantity > 0 && $localSettings.showServingUnitQuantityTextbox){
						localNutritionLabel += ' <span itemprop="servingSize">' +
							parseFloat( $localSettings.originalServingUnitQuantity.toFixed($localSettings.decimalPlacesForNutrition) ) +
						'</span>\n';

					if ( ($localSettings.valueServingSizeUnit == '' || $localSettings.valueServingSizeUnit == null) && $localSettings.valueServingWeightGrams > 0 ){
						localNutritionLabel += localTab4 + '(' +
							$localSettings.valueServingWeightGrams.toFixed($localSettings.decimalPlacesForQuantityTextbox) +
						'<span aria-hidden="true">g</span><span class="sr-only"> grams</span>)\n';
					}
				}//end of => if ($localSettings.valueServingSizeUnit !== '' && $localSettings.valueServingSizeUnit !== null)

				if (!servingSizeDivAlreadyClosed){
					localNutritionLabel += localTab3 + '</div><!-- closing for serving size div -->\n\n';
				}

			//end of => if ($localSettings.originalServingUnitQuantity > 0)
			}else{
				localServingSizeIsHidden = true;
			}
		}//end of => if ($localSettings.showServingUnitQuantity)

		return {
			'servingSizeIsHidden' : localServingSizeIsHidden,
			'servingContainerIsHidden' : localServingContainerIsHidden,
			'nutritionLabel' : localNutritionLabel
		};
	}//end of => function sevingUnitQuantityHtml2018($localSettings)


	NutritionLabel.prototype = {
		generateLegacy: function(){
			//this is the function that returns the html code for the nutrition label based on the settings that is supplied by the user
			var $this = this;

			//return the plugin incase it has already been created
			if ($this.nutritionLabel){
				return $this.nutritionLabel;
			}

			if ($this.settings.hideNotApplicableValues){
				$this.settings.showCalories = $this.settings.naCalories ? false : $this.settings.showCalories;
				$this.settings.showFatCalories = $this.settings.naFatCalories ? false : $this.settings.showFatCalories;
				$this.settings.showTotalFat = $this.settings.naTotalFat ? false : $this.settings.showTotalFat;
				$this.settings.showSatFat = $this.settings.naSatFat ? false : $this.settings.showSatFat;
				$this.settings.showTransFat = $this.settings.naTransFat ? false : $this.settings.showTransFat;
				$this.settings.showPolyFat = $this.settings.naPolyFat ? false : $this.settings.showPolyFat;
				$this.settings.showMonoFat = $this.settings.naMonoFat ? false : $this.settings.showMonoFat;
				$this.settings.showCholesterol = $this.settings.naCholesterol ? false : $this.settings.showCholesterol;
				$this.settings.showSodium = $this.settings.naSodium ? false : $this.settings.showSodium;
				$this.settings.showPotassium = $this.settings.naPotassium ? false : $this.settings.showPotassium;
				$this.settings.showTotalCarb = $this.settings.naTotalCarb ? false : $this.settings.showTotalCarb;
				$this.settings.showFibers = $this.settings.naFibers ? false : $this.settings.showFibers;
				$this.settings.showSugars = $this.settings.naSugars ? false : $this.settings.showSugars;
				$this.settings.showProteins = $this.settings.naProteins ? false : $this.settings.showProteins;
				$this.settings.showVitaminA = $this.settings.naVitaminA ? false : $this.settings.showVitaminA;
				$this.settings.showVitaminC = $this.settings.naVitaminC ? false : $this.settings.showVitaminC;
				$this.settings.showCalcium = $this.settings.naCalcium ? false : $this.settings.showCalcium;
				$this.settings.showIron = $this.settings.naIron ? false : $this.settings.showIron;
			}

			//initializing the tab variables (for debugging and editing purposes)
			//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
			for (x = 1; x < 9; x++){
				var tab = '';
				for (y = 1; y <= x; y++){
					tab += '\t';
				}
				eval('var tab' + x + ' = "' + tab + '";');
			}

			var borderCSS = '';
			if ($this.settings.allowNoBorder){
				borderCSS = 'border: 0;';
			}

			//creates the html code for the label based on the settings
			var nutritionLabel = '<div itemscope itemtype="http://schema.org/NutritionInformation" class="nutritionLabel" style="' + borderCSS;
			if (!$this.settings.allowCustomWidth){
				nutritionLabel += ' width: ' + $this.settings.width + 'px;">\n';
			}else{
				nutritionLabel += ' width: ' + $this.settings.widthCustom + ';">\n';
			}

			nutritionLabel += tab1 + '<div class="title" tabindex="0">' + $this.settings.textNutritionFacts + '</div>\n';

			if ($this.settings.showItemName){
				nutritionLabel += itemNameHtmlLegacy($this.settings);
			}

			var sevingUnitQuantityHtmlLegacyResult = sevingUnitQuantityHtmlLegacy($this.settings);
			var servingSizeIsHidden = sevingUnitQuantityHtmlLegacyResult.servingSizeIsHidden;
			var servingContainerIsHidden = sevingUnitQuantityHtmlLegacyResult.servingContainerIsHidden;
			nutritionLabel += sevingUnitQuantityHtmlLegacyResult.nutritionLabel;

			if (
					(!$this.settings.showItemName && !$this.settings.showServingUnitQuantity) ||
					(!$this.settings.showItemName && servingSizeIsHidden && servingContainerIsHidden)
			){
				nutritionLabel += tab1 + '<div class="headerSpacer"></div>\n';
			}

				nutritionLabel += tab1 + '<div class="bar1"></div>\n';

			if ($this.settings.showAmountPerServing){
				nutritionLabel += tab1 + '<div class="line m" tabindex="0">';
					nutritionLabel += '<strong>' + $this.settings.textAmountPerServing + '</strong>';
				nutritionLabel += '</div>\n';
			}

				nutritionLabel += tab1 + '<div class="line">\n';

				if ($this.settings.showFatCalories){
					nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
						//$localSettings, valueIndex,         unitIndex,         naIndex,         attributeText,    localTabValue, lineClass, attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName
						$this.settings,  'valueFatCalories', 'unitFatCalories', 'naFatCalories', 'textFatCalories', tab2,         'fr',       2,                    '',            '',           'roundCalories'
					);
				}

				if ($this.settings.showCalories){
					nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
						//$localSettings, valueIndex,      unitIndex,      naIndex,      attributeText, localTabValue, lineClass, attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName
						$this.settings,  'valueCalories', 'unitCalories', 'naCalories', 'textCalories', tab2,          '',        1,                   'calories',     '',           'roundCalories'
					);
				}else if ($this.settings.showFatCalories){
					nutritionLabel += tab2 + '<div>&nbsp;</div>\n';
				}

				nutritionLabel += tab1 + '</div>\n';
				nutritionLabel += tab1 + '<div class="bar2"></div>\n';

				nutritionLabel += tab1 + '<div class="line ar">';
					nutritionLabel += '<strong>% ' + $this.settings.textDailyValues + '<sup>*</sup></strong>';
				nutritionLabel += '</div>\n';

			if ($this.settings.showTotalFat){
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting, valueIndex,      dailyValueIndex,      unitIndex,      naIndex,      attributeTexts, lineClass, itemPropValue, roundFunctionName, roundFunctionRuleName, boldName
					$this.settings, 'valueTotalFat', 'dailyValueTotalFat', 'unitTotalFat', 'naTotalFat', 'textTotalFat', 'line',    'fatContent',  'roundFat',        'roundFatRule',         true
				);
			}

			if ($this.settings.showSatFat){
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting, valueIndex,    dailyValueIndex,    unitIndex,    naIndex,    attributeTexts, lineClass,     itemPropValue,         roundFunctionName, roundFunctionRuleName, boldName
					$this.settings, 'valueSatFat', 'dailyValueSatFat', 'unitSatFat', 'naSatFat', 'textSatFat',   'line indent', 'saturatedFatContent', 'roundFat',        'roundFatRule',         false
				);
			}

			if ($this.settings.showTransFat){
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings, valueIndex,      unitIndex,      naIndex,      attributeText, localTabValue, lineClass,    attributeDisplayType, itemPropValue,    localExtraTab, roundFunctionName
					$this.settings,  'valueTransFat', 'unitTransFat', 'naTransFat', 'textTransFat', tab1,         'line indent', 3,                   'transFatContent', tab2,         'roundFat'
				);
			}

			if ($this.settings.showPolyFat){
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings, valueIndex,     unitIndex,     naIndex,     attributeText, localTabValue, lineClass,    attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName
					$this.settings,  'valuePolyFat', 'unitPolyFat', 'naPolyFat', 'textPolyFat',  tab1,         'line indent', 2,                    '',            '',           'roundFat'
				);
			}

			if ($this.settings.showMonoFat){
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings, valueIndex,     unitIndex,     naIndex,     attributeText, localTabValue, lineClass,    attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName
					$this.settings,  'valueMonoFat', 'unitMonoFat', 'naMonoFat', 'textMonoFat',  tab1,         'line indent', 2,                    '',            '',           'roundFat'
				);
			}

			if ($this.settings.showCholesterol){
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting, valueIndex,         dailyValueIndex,         unitIndex,         naIndex,         attributeTexts,    lineClass, itemPropValue,        roundFunctionName,  roundFunctionRuleName, boldName
					$this.settings, 'valueCholesterol', 'dailyValueCholesterol', 'unitCholesterol', 'naCholesterol', 'textCholesterol', 'line',    'cholesterolContent', 'roundCholesterol', 'roundCholesterolRule', true
				);
			}

			if ($this.settings.showSodium){
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting, valueIndex,    dailyValueIndex,    unitIndex,    naIndex,    attributeTexts, lineClass, itemPropValue,   roundFunctionName, roundFunctionRuleName, boldName
					$this.settings, 'valueSodium', 'dailyValueSodium', 'unitSodium', 'naSodium', 'textSodium',   'line',    'sodiumContent', 'roundSodium',     'roundSodiumRule',      true

				);
			}

			if ($this.settings.showPotassium){
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting, valueIndex,       dailyValueIndex,       unitIndex,       naIndex,       attributeTexts,  lineClass, itemPropValue,      roundFunctionName, roundFunctionRuleName, boldName
					$this.settings, 'valuePotassium', 'dailyValuePotassium', 'unitPotassium', 'naPotassium', 'textPotassium', 'line',    'potassiumContent', 'roundPotassium',  'roundPotassiumRule',   true
				);
			}

			if ($this.settings.showTotalCarb){
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting, valueIndex,       dailyValueIndex,  unitIndex,       naIndex,       attributeTexts,  lineClass, itemPropValue,         roundFunctionName,            roundFunctionRuleName,           boldName
					$this.settings, 'valueTotalCarb', 'dailyValueCarb', 'unitTotalCarb', 'naTotalCarb', 'textTotalCarb', 'line',    'carbohydrateContent', 'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', true
				);
			}

			if ($this.settings.showFibers){
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting, valueIndex,    dailyValueIndex,   unitIndex,    naIndex,    attributeTexts, lineClass,     itemPropValue,  roundFunctionName,            roundFunctionRuleName,           boldName
					$this.settings, 'valueFibers', 'dailyValueFiber', 'unitFibers', 'naFibers', 'textFibers',   'line indent', 'fiberContent', 'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', false
				);
			}

			if ($this.settings.showSugars){
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings, valueIndex,    unitIndex,    naIndex,    attributeText, localTabValue, lineClass,    attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName
					$this.settings,  'valueSugars', 'unitSugars', 'naSugars', 'textSugars',   tab1,         'line indent', 4,                   'sugarContent', '',           'roundCarbFiberSugarProtein'
				);
			}

			if ($this.settings.showProteins){
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings, valueIndex,      unitIndex,      naIndex,      attributeText, localTabValue, lineClass, attributeDisplayType, itemPropValue,   localExtraTab, roundFunctionName
					$this.settings,  'valueProteins', 'unitProteins', 'naProteins', 'textProteins', tab1,         'line',     1,                   'proteinContent', '',           'roundCarbFiberSugarProtein'
				);
			}

			nutritionLabel += tab1 + '<div class="bar1"></div>\n';

			if ($this.settings.showVitaminA){
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings, valueIndex,      unitIndex,      naIndex,      attributeText, localTabValue, lineClass,      attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName
					$this.settings,  'valueVitaminA', 'unitVitaminA', 'naVitaminA', 'textVitaminA', tab1,         'line vitaminA', 5,                    '',            tab2,         'roundVitaminsCalciumIron'
				);
			}

			if ($this.settings.showVitaminC){
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings, valueIndex,      unitIndex,      naIndex,      attributeText, localTabValue, lineClass,      attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName
					$this.settings,  'valueVitaminC', 'unitVitaminC', 'naVitaminC', 'textVitaminC', tab1,         'line vitaminC', 5,                    '',            tab2,         'roundVitaminsCalciumIron'
				);
			}

			if ($this.settings.showCalcium){
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings, valueIndex,     unitIndex,     naIndex,     attributeText, localTabValue, lineClass,     attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName
					$this.settings,  'valueCalcium', 'unitCalcium', 'naCalcium', 'textCalcium',  tab1,         'line calcium', 5,                    '',            tab2,         'roundVitaminsCalciumIron'
				);
			}

			if ($this.settings.showIron){
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings, valueIndex,  unitIndex,  naIndex,  attributeText, localTabValue, lineClass,  attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName
					$this.settings,  'valueIron', 'unitIron', 'naIron', 'textIron',     tab1,         'line iron', 5,                    '',            tab2,         'roundVitaminsCalciumIron'
				);
			}

				nutritionLabel += tab1 + '<div class="dvCalorieDiet line">\n';
					nutritionLabel += tab2 + '<div class="calorieNote">\n';
						nutritionLabel += tab3 + '<span tabindex="0"><span class="star" aria-hidden="true">*</span> ' +
							$this.settings.textPercentDailyPart1 + ' ' +
							$this.settings.calorieIntake + ' ' +
							$this.settings.textPercentDailyPart2 + '.</span>\n';

					if ($this.settings.showIngredients){
						nutritionLabel += ingredientsHtmlLegacy($this.settings);
					}

					if ($this.settings.showDisclaimer){
						nutritionLabel += disclaimerHtmlLegacy($this.settings);
					}

					nutritionLabel += tab2 + '</div><!-- closing class="calorieNote" -->\n\n';

				if ($this.settings.showCalorieDiet){
					nutritionLabel += calorieDietHtmlLegacy($this.settings);
				}

				nutritionLabel += tab1 + '</div><!-- closing class="dvCalorieDiet line" -->\n\n';

			if ($this.settings.showBottomLink){
				nutritionLabel += bottomLinkHtmlLegacy($this.settings, tab1);
			}

			if ($this.settings.showCustomFooter){
				nutritionLabel += tab1 + '<div class="customFooter" tabindex="0">' + $this.settings.valueCustomFooter + '</div>\n';
			}

			nutritionLabel += '</div><!-- closing class="nutritionLabel" -->\n\n';
			//returns the html for the nutrition label
			return nutritionLabel += '<div class="naTooltip">Data not available</div>\n';
		},//end of => generateLegacy: function()


		generate2018: function(){
			//this is the function that returns the html code for the nutrition label based on the settings that is supplied by the user
			var $this = this;

			//return the plugin incase it has already been created
			if ($this.nutritionLabel){
				return $this.nutritionLabel;
			}

			if ($this.settings.hideNotApplicableValues){
				$this.settings.showCalories = $this.settings.naCalories ? false : $this.settings.showCalories;
				$this.settings.showFatCalories = $this.settings.naFatCalories ? false : $this.settings.showFatCalories;
				$this.settings.showTotalFat = $this.settings.naTotalFat ? false : $this.settings.showTotalFat;
				$this.settings.showSatFat = $this.settings.naSatFat ? false : $this.settings.showSatFat;
				$this.settings.showTransFat = $this.settings.naTransFat ? false : $this.settings.showTransFat;
				$this.settings.showPolyFat = $this.settings.naPolyFat ? false : $this.settings.showPolyFat;
				$this.settings.showMonoFat = $this.settings.naMonoFat ? false : $this.settings.showMonoFat;
				$this.settings.showCholesterol = $this.settings.naCholesterol ? false : $this.settings.showCholesterol;
				$this.settings.showSodium = $this.settings.naSodium ? false : $this.settings.showSodium;
				$this.settings.showPotassium_2018 = $this.settings.naPotassium_2018 ? false : $this.settings.showPotassium_2018;
				$this.settings.showTotalCarb = $this.settings.naTotalCarb ? false : $this.settings.showTotalCarb;
				$this.settings.showFibers = $this.settings.naFibers ? false : $this.settings.showFibers;
				$this.settings.showSugars = $this.settings.naSugars ? false : $this.settings.showSugars;
				$this.settings.showAddedSugars = $this.settings.naAddedSugars ? false : $this.settings.showAddedSugars;
				$this.settings.showProteins = $this.settings.naProteins ? false : $this.settings.showProteins;
				$this.settings.showVitaminD = $this.settings.naVitaminD ? false : $this.settings.showVitaminD;
				$this.settings.showCalcium = $this.settings.naCalcium ? false : $this.settings.showCalcium;
				$this.settings.showIron = $this.settings.naIron ? false : $this.settings.showIron;
			}

			//initializing the tab variables (for debugging and editing purposes)
			//tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
			for (x = 1; x < 9; x++){
				var tab = '';
				for (y = 1; y <= x; y++){
					tab += '\t';
				}
				eval('var tab' + x + ' = "' + tab + '";');
			}

			var borderCSS = '';
			if ($this.settings.allowNoBorder){
				borderCSS = 'border: 0;';
			}

			//creates the html code for the label based on the settings
			var nutritionLabel = '<div itemscope itemtype="http://schema.org/NutritionInformation" class="nf" style="' + borderCSS;
				if (!$this.settings.allowCustomWidth){
					nutritionLabel += ' width: ' + $this.settings.width + 'px;">\n';
				}else{
					nutritionLabel += ' width: ' + $this.settings.widthCustom + ';">\n';
				}

				nutritionLabel += tab1 + '<div class="nf-title" tabindex="0">' + $this.settings.textNutritionFacts + '</div>\n';

			var sevingUnitQuantityHtml2018Result = sevingUnitQuantityHtml2018($this.settings);
			var servingSizeIsHidden = sevingUnitQuantityHtml2018Result.servingSizeIsHidden;
			var servingContainerIsHidden = sevingUnitQuantityHtml2018Result.servingContainerIsHidden;

			var showLineDiv =
				$this.settings.showItemName ||
				(
					!$this.settings.showItemName &&
					servingSizeIsHidden &&
					servingContainerIsHidden
				) ||
				(
					!$this.settings.showItemName &&
					$this.settings.originalServingUnitQuantity > 0 &&
					$this.settings.valueServingWeightGrams > 0
				) ||
				(
					$this.settings.showServingUnitQuantity &&
					$this.settings.originalServingUnitQuantity > 0 &&
					$this.settings.showServingsPerContainer &&
					$this.settings.valueServingPerContainer > 0
				);

			if (showLineDiv){
				nutritionLabel += tab1 + '<div class="nf-line">\n';
			}

			if ($this.settings.showServingUnitQuantity && $this.settings.originalServingUnitQuantity > 0 && $this.settings.showServingsPerContainer && $this.settings.valueServingPerContainer > 0){
				nutritionLabel += tab2 + '<div class="nf-per-container" tabindex="0">\n';
					nutritionLabel += tab3 + parseFloat(
						$this.settings.valueServingPerContainer.toFixed($this.settings.decimalPlacesForNutrition)
					);
					nutritionLabel += ' ' + $this.settings.textServingsPerContainer + '\n';
				nutritionLabel += tab2 + '</div>\n\n';
			}

				nutritionLabel += tab2 + '<div class="nf-serving">\n';

					nutritionLabel += sevingUnitQuantityHtml2018Result.nutritionLabel;

					if ($this.settings.showItemName){
						nutritionLabel += itemNameHtml2018($this.settings);
					}

				nutritionLabel += tab2 + '</div><!-- end of class="nf-serving" -->\n\n';

			if (showLineDiv){
				nutritionLabel += tab1 + '</div><!-- end of class="nf-line" -->\n\n';
			}

				nutritionLabel += tab1 + '<div class="nf-bar2"></div>\n';
				nutritionLabel += tab1 + '<div class="nf-amount-per-serving" tabindex="0">Amount per serving</div>\n';

				if ($this.settings.showCalories){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,      unitIndex,      naIndex,      attributeText,  itemPropValue, topDivClass,  showPercentageCode, roundFunctionName, roundFunctionRuleName, labelClass,  valueClass, dailyValueIndex
						$this.settings,  'valueCalories', 'unitCalories', 'naCalories', 'textCalories', 'calories',    'nf-calories', false,             'roundCalories',    '',                    '',         'nf-pr',     ''
					);
				}

				nutritionLabel += tab1 + '<div class="nf-bar1"></div>\n';
				nutritionLabel += tab1 + '<div class="nf-line nf-text-right">\n';
					nutritionLabel += tab2 + '<span class="nf-highlight nf-percent-dv">% Daily Value*</span>\n';
				nutritionLabel += tab1 + '</div>\n';

				if ($this.settings.showTotalFat){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,      unitIndex,      naIndex,      attributeText,  itemPropValue, topDivClass, showPercentageCode, roundFunctionName, roundFunctionRuleName, labelClass,    valueClass, dailyValueIndex
						$this.settings,  'valueTotalFat', 'unitTotalFat', 'naTotalFat', 'textTotalFat', 'fatContent',  'nf-line',    true,              'roundFat',        'roundFatRule',        'nf-highlight', '',        'dailyValueTotalFat'

					);
				}

				if ($this.settings.showSatFat){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,    unitIndex,    naIndex,    attributeText, itemPropValue,         topDivClass,        showPercentageCode, roundFunctionName, roundFunctionRuleName, labelClass, valueClass, dailyValueIndex
						$this.settings,  'valueSatFat', 'unitSatFat', 'naSatFat', 'textSatFat',  'saturatedFatContent', 'nf-line nf-indent', true,              'roundFat',        'roundFatRule',         '',         '',        'dailyValueSatFat'
					);
				}

				if ($this.settings.showTransFat){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,      unitIndex,      naIndex,      attributeText,  itemPropValue,     topDivClass,        showPercentageCode, roundFunctionName, roundFunctionRuleName, labelClass, valueClass, dailyValueIndex
						$this.settings,  'valueTransFat', 'unitTransFat', 'naTransFat', 'textTransFat', 'transFatContent', 'nf-line nf-indent', false,             'roundFat',         '',                     '',         '',        ''
					);
				}

				if ($this.settings.showPolyFat){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,     unitIndex,     naIndex,     attributeText, itemPropValue, topDivClass,        showPercentageCode, roundFunctionName, roundFunctionRuleName, labelClass, valueClass, dailyValueIndex
						$this.settings,  'valuePolyFat', 'unitPolyFat', 'naPolyFat', 'textPolyFat',  '',           'nf-line nf-indent', false,             'roundFat',         '',                    '',         '',         ''
					);
				}

				if ($this.settings.showMonoFat){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,     unitIndex,     naIndex,     attributeText, itemPropValue, topDivClass,        showPercentageCode, roundFunctionName, roundFunctionRuleName, labelClass, valueClass, dailyValueIndex
						$this.settings,  'valueMonoFat', 'unitMonoFat', 'naMonoFat', 'textMonoFat',  '',           'nf-line nf-indent', false,             'roundFat',         '',                    '',         '',         ''
					);
				}

				if ($this.settings.showCholesterol){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,         unitIndex,         naIndex,         attributeText,     itemPropValue,        topDivClass, showPercentageCode, roundFunctionName,  roundFunctionRuleName,  labelClass,    valueClass, dailyValueIndex
						$this.settings,  'valueCholesterol', 'unitCholesterol', 'naCholesterol', 'textCholesterol', 'cholesterolContent', 'nf-line',    true,              'roundCholesterol', 'roundCholesterolRule', 'nf-highlight', '',        'dailyValueCholesterol'
					);
				}

				if ($this.settings.showSodium){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,    unitIndex,    naIndex,    attributeText, itemPropValue,        topDivClass, showPercentageCode, roundFunctionName, roundFunctionRuleName, labelClass,    valueClass, dailyValueIndex
						$this.settings,  'valueSodium', 'unitSodium', 'naSodium', 'textSodium',  'cholesterolContent', 'nf-line',    true,              'roundSodium',     'roundSodiumRule',     'nf-highlight', '',        'dailyValueSodium'
					);
				}

				if ($this.settings.showTotalCarb){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,       unitIndex,       naIndex,       attributeText,   itemPropValue,         topDivClass, showPercentageCode, roundFunctionName,            roundFunctionRuleName,            labelClass,    valueClass, dailyValueIndex
						$this.settings,  'valueTotalCarb', 'unitTotalCarb', 'naTotalCarb', 'textTotalCarb', 'carbohydrateContent', 'nf-line',    true,              'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', 'nf-highlight', '',        'dailyValueCarb'
					);
				}

				if ($this.settings.showFibers){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,    unitIndex,    naIndex,    attributeText, itemPropValue,  topDivClass,        showPercentageCode, roundFunctionName,            roundFunctionRuleName,           labelClass, valueClass, dailyValueIndex
						$this.settings,  'valueFibers', 'unitFibers', 'naFibers', 'textFibers',  'fiberContent', 'nf-line nf-indent', true,              'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', '',         '',        'dailyValueFiber'
					);
				}

				if ($this.settings.showSugars){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,    unitIndex,    naIndex,    attributeText, itemPropValue,  topDivClass,        showPercentageCode, roundFunctionName,           roundFunctionRuleName, labelClass, valueClass, dailyValueIndex
						$this.settings,  'valueSugars', 'unitSugars', 'naSugars', 'textSugars',  'sugarContent', 'nf-line nf-indent', false,             'roundCarbFiberSugarProtein', '',                    '',         '',         ''
					);
				}

				if ($this.settings.showAddedSugars){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,         unitIndex,         naIndex,         attributeText,     itemPropValue, topDivClass,         showPercentageCode, roundFunctionName,            roundFunctionRuleName,           labelClass, valueClass, dailyValueIndex
						$this.settings,  'valueAddedSugars', 'unitAddedSugars', 'naAddedSugars', 'textAddedSugars1', '',           'nf-line nf-indent2', true,              'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', '',         '',        'dailyValueAddedSugar'
					);
				}

				if ($this.settings.showProteins){
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings, valueIndex,      unitIndex,      naIndex,      attributeText,  itemPropValue,    topDivClass, showPercentageCode, roundFunctionName,           roundFunctionRuleName, labelClass,    valueClass, dailyValueIndex
						$this.settings,  'valueProteins', 'unitProteins', 'naProteins', 'textProteins', 'proteinContent', 'nf-line',    false,             'roundCarbFiberSugarProtein', '',                   'nf-highlight', '',         ''
					);
				}

			if ($this.settings.showVitaminD || $this.settings.showCalcium || $this.settings.showIron || $this.settings.showPotassium_2018){
				nutritionLabel += tab1 + '<div class="nf-bar2"></div>\n';
				nutritionLabel += tab1 + '<div class="nf-vitamins">\n';
			}

				if ($this.settings.showVitaminD || $this.settings.showCalcium || $this.settings.showIron || $this.settings.showPotassium_2018){
					nutritionLabel += tab2 + '<div class="nf-vitamins">\n';

					if ($this.settings.showVitaminD){
						nutritionLabel += tab3 + generateHtmlAndComputeValueGivenThePercentage(
							//$localSettings, valueIndex,      dailyValueIndex,      unitIndex_base,      unitIndex_percent,      naIndex,      attributeTexts
							$this.settings,  'valueVitaminD', 'dailyValueVitaminD', 'unitVitaminD_base', 'unitVitaminD_percent', 'naVitaminD', 'textVitaminD'
						);
					}

					if ($this.settings.showCalcium){
						nutritionLabel += tab3 + generateHtmlAndComputeValueGivenThePercentage(
							//$localSettings, valueIndex,     dailyValueIndex,     unitIndex_base,     unitIndex_percent,     naIndex,     attributeTexts
							$this.settings,  'valueCalcium', 'dailyValueCalcium', 'unitCalcium_base', 'unitCalcium_percent', 'naCalcium', 'textCalcium'
						);
					}

					if ($this.settings.showIron){
						nutritionLabel += tab3 + generateHtmlAndComputeValueGivenThePercentage(
							//$localSettings, valueIndex,   dailyValueIndex, unitIndex_base,  unitIndex_percent,  naIndex,  attributeTexts
							$this.settings,  'valueIron', 'dailyValueIron', 'unitIron_base', 'unitIron_percent', 'naIron', 'textIron'
						);
					}

					if ($this.settings.showPotassium_2018){
						nutritionLabel += tab3 + generateHtmlAndComputeValueGivenThePercentage(
							//$localSettings, valueIndex,            dailyValueIndex,       unitIndex_base,       unitIndex_percent,       naIndex,            attributeTexts
							$this.settings,  'valuePotassium_2018', 'dailyValuePotassium_2018', 'unitPotassium_base', 'unitPotassium_percent', 'naPotassium_2018', 'textPotassium'
						);
					}

					nutritionLabel += tab2 + '</div>\n';
				}

			if ($this.settings.showVitaminD || $this.settings.showCalcium || $this.settings.showIron || $this.settings.showPotassium_2018){
				nutritionLabel += tab1 + '</div>\n';
			}

				nutritionLabel += tab1 + '<div class="nf-bar1"></div>\n';

				nutritionLabel += tab1 + '<div class="nf-footnote">\n';
					nutritionLabel += tab2 + '<span tabIndex="0">' + $this.settings.textPercentDaily2018VersionPart1;
					nutritionLabel += $this.settings.calorieIntake;
					nutritionLabel += $this.settings.textPercentDaily2018VersionPart2 + '</span>\n';

					if ($this.settings.showIngredients){
						nutritionLabel += ingredientsHtml2018Version($this.settings);
					}

					if ($this.settings.showDisclaimer){
						nutritionLabel += disclaimerHtml2018Version($this.settings);
					}

				nutritionLabel += tab1 + '</div>\n';

				if ($this.settings.showBottomLink){
					nutritionLabel += bottomLinkHtml2018Version($this.settings, tab1);
				}

				if ($this.settings.showCustomFooter){
					nutritionLabel += tab1 + '<div class="nf-customFooter" tabindex="0">' + $this.settings.valueCustomFooter + '</div>\n';
				}

			nutritionLabel += '</div><!-- closing class="nutritionLabel" -->\n\n';
			//returns the html for the nutrition label
			return nutritionLabel += '<div class="naTooltip">Data not available</div>\n';
		}//end of => generate2018
	};//end of => NutritionLabel.prototype

})(jQuery);