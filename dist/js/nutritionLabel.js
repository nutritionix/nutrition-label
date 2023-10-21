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
 * @current version     11.0.13                                                                                                                     |
 * @stable version      11.0.4                                                                                                                      |
 * @supported browser   Firefox, Chrome, IE8+                                                                                                       |
 * @description         To be able to create a FDA-style nutrition label with any nutrition data source                                             |
 *                                                                                                                                                  |
 ***************************************************************************************************************************************************+
*/


//these variables are declared using eval
/*global globalTab1, globalTab2, globalTab3, globalTab4, globalTab5, globalTab6, globalTab7 */


;(function($) { // eslint-disable-line no-extra-semi
	//initializing the global tab variables (for debugging and editing purposes)
	//global tab variables are used to make the printing of the html code readable when you copy the code using firebug => inspect => copy innerhtml
	for (let x = 1; x < 8; x++) {
		let tab = '';
		for (let y = 1; y <= x; y++) {
			tab += '\t';
		}
		eval('var globalTab' + x + ' = "' + tab + '";');
	}


	$.fn.nutritionLabel = function(option, settings) {
		if (typeof option === 'object') {
			settings = option;
			init(settings, $(this));
		} else if (typeof option === 'string' && option !== '') {
			//destroy the nutrition label's html code
			if (option === 'destroy') {
				new NutritionLabel().destroy($(this));
			//allows the user to hide the nutrition value
			} else if (option === 'hide') {
				new NutritionLabel().hide($(this));
			//allows the user to show the nutrition value
			} else if (option === 'show') {
				new NutritionLabel().show($(this));
			} else {
				let values = [];

				let elements = this.each(function() {
					let data = $(this).data('_nutritionLabel');
					if (data) {
						if ($.fn.nutritionLabel.defaultSettings[option] !== undefined) {
							if (settings !== undefined) {
								//set the option and create the nutrition label
								data.settings[option] = settings;
								init(data.settings, $(this));
							} else {
								//return the value of a setting - can only be used after the label is created / initiated
								values.push(data.settings[option]);
							}
						}
					} else if ($.fn.nutritionLabel.defaultSettings[option] !== undefined) {
						//set the option and create the nutrition label
						//this is a special case so the single value setting will still work even if the label hasn't been initiated yet
						if (settings !== undefined) {
							$.fn.nutritionLabel.defaultSettings[option] = settings;
							init(null, $(this));
						}
					}
				});

				//return the value of a setting
				if (values.length === 1) {
					return values[0];
				}

				//return the setting values or the elements
				return values.length > 0 ? values : elements;
			}
		//end of => else if (typeof option === 'string' && option !== '')
		} else if (typeof option === 'undefined' || option === '') {
			//if no value / option is supplied, simply create the label using the default values
			init(settings, $(this));
		}
	};//end of => $.fn.nutritionLabel = function(option, settings)


	$.fn.nutritionLabel.defaultSettings = {
		//default fixedWidth of the nutrition label
		width: 280,

		//to allow custom width - usually needed for mobile sites
		allowCustomWidth: false,
		widthCustom: 'auto',

		//to allow the label to have no border
		allowNoBorder: false,

		//to enable rounding of the nutritional values based on the FDA rounding rules http://goo.gl/RMD2O
		allowFDARounding: false,

		//to enabled the google analytics event logging
		allowGoogleAnalyticsEventLog: false,
		gooleAnalyticsFunctionName: 'ga',

		//enable triggering of user function on quantity change: global function name
		userFunctionNameOnQuantityChange: null,
		//enable triggering of user function on quantity change: handler instance
		userFunctionOnQuantityChange: null,

		//when set to true, this will hide the values if they are not applicable
		hideNotApplicableValues: false,

		//when set to true, this will hide all the percent daily values
		hidePercentDailyValues: false,

		//the brand name of the item for this label (eg. just salad)
		brandName: 'Brand where this item belongs to',
		//to scroll the ingredients if the innerheight is > scrollHeightComparison
		scrollLongIngredients: false,
		scrollHeightComparison: 100,
		//the height in px of the ingredients div
		scrollHeightPixel: 95,
		//this is to set how many decimal places will be shown on the nutrition values (calories, fat, protein, vitamin a, iron, etc)
		decimalPlacesForNutrition: 1,
		//this is to set how many decimal places will be shown for the "% daily values*"
		decimalPlacesForDailyValues: 0,
		//this is to set how many decimal places will be shown for the serving unit quantity textbox
		decimalPlacesForQuantityTextbox: 1,

		//to scroll the item name if the jQuery.height() is > scrollLongItemNamePixel
		scrollLongItemName: true,
		scrollLongItemNamePixel: 36,
		//this is needed to fix some issues on the 2018 label as the layout of the label is very different than the legacy one
		scrollLongItemNamePixel2018Override: 34,

		//this will only affect Vitamin D (valueVitaminD), Calcium (valueCalcium), Iron (valueIron) and Potassium (valuePotassium_2018).
			//this will tell the system to process these values as base values and not % Daily Values (default)
		useBaseValueFor2018LabelAndNotDVPercentage: false, //this is for the 2018 version

		//show the customizable link at the bottom
		showBottomLink: false,
		//url for the customizable link at the bottom
		urlBottomLink: 'http://www.nutritionix.com',
		//link name for the customizable link at the bottom
		nameBottomLink: 'Nutritionix',

		//this value can be changed and the value of the nutritions will be affected directly
		//the computation is "current nutrition value" * "serving unit quantity value" = "final nutrition value"
		//this can't be less than zero, all values less than zero is converted to zero
		//the textbox to change this value is visible / enabled by default
		//if the initial value of the serving size unit quantity is less than or equal to zero, it is converted to 1.0
		//when enabled, user can change this value by clicking the arrow or changing the value on the textbox and pressing enter.
			//the value on the label will be updated automatically
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
		valueServingUnitQuantity: 1.0,
		valueServingSizeUnit: '',
		showServingUnitQuantityTextbox: true,
		//the name of the item for this label (eg. cheese burger or mayonnaise)
		itemName: 'Item / Ingredient Name',
		showServingUnitQuantity: true,
		//allow hiding of the textbox arrows
		hideTextboxArrows: false,
		//this is for the 2018 version and will only work when showServingUnitQuantity is false. see https://github.com/nutritionix/nutrition-label/issues/123
		showOnlyTheTextServingSize: false,

		//these 2 settings are used internally.
		//this is just added here instead of a global variable to prevent a bug when there are multiple instances of the plugin like on the demo pages
		originalServingUnitQuantity: 0,
		//this is used to fix the computation issue on the textbox
		nutritionValueMultiplier: 1,
		//this is used for the computation of the servings per container
		totalContainerQuantity: 1,

		//default calorie intake
		calorieIntake: 2000,

		//these are the recommended daily intake values
		dailyValueTotalFat: 65, //this should be 70 for the uk version and 78 for the 2018 version
		dailyValueSatFat: 20,
		dailyValueCholesterol: 300,
		dailyValueSodium: 2400, //this should be 2300 for the uk version
		dailyValuePotassium: 3500,
		dailyValuePotassium_2018: 4700, //this is for the 2018 version
		dailyValueCarb: 300, //this should be 260 for the uk version and 275 for the 2018 version
		dailyValueFiber: 25, //this should be 28 for the 2018 version
		dailyValueCalcium: 1300, //this is for the 2018 version
		dailyValueIron: 18,
		dailyValueVitaminD: 20,
		dailyValueAddedSugar: 50,
		dailyValueSugar: 100, //this should be 90 for the uk version
		dailyValueEnergyKcal: 2000, //this is for the uk version
		dailyValueProtein: 50, //this is for the uk version
		dailyValueSalt: 6, //this is for the uk version

		//these values can be change to hide some nutrition values
		showCalories: true,
		showFatCalories: true,
		showTotalFat: true,
		showSatFat: true,
		showTransFat: true,
		showPolyFat: false,
		showMonoFat: false,
		showCholesterol: true,
		showSodium: true,
		showPotassium: false, //this is for the legacy version
		showPotassium_2018: true, //this is for the 2018 version
		showTotalCarb: true,
		showFibers: true,
		showSugars: true,
		showAddedSugars: true,
		showSugarAlcohol: false, //this is for the 2018 version
		showProteins: true,
		showVitaminA: true,
		showVitaminC: true,
		showVitaminD: true, //this is for the 2018 version
		showCalcium: true, //this is for the 2018 version
		showIron: true,
		showCaffeine: true, //this is for the 2018 version
		showServingWeightGrams: true,

		//these values can be change to hide some nutrition daily values
			//take note that the setting 'hidePercentDailyValues' override these values
		showDailyTotalFat: true,
		showDailySatFat: true,
		showDailyCholesterol: true,
		showDailySodium: true,
		showDailyPotassium: true, //this is for the legacy version
		showDailyPotassium_2018: true, //this is for the 2018 version
		showDailyTotalCarb: true,
		showDailyFibers: true,
		showDailySugars: false,
		showDailyAddedSugars: true, //this is for the 2018 version
		showDailyVitaminD: true, //this is for the 2018 version
		showDailyCalcium: true, //this is for the 2018 version
		showDailyIron: true,
		showDailyProtein: true, //this is for the uk version
		showDailyEnergy: true, //this is for the uk version

		//to show the 'amount per serving' text
		showAmountPerServing: true,
		//to show the 'servings per container' data and replace the default 'Serving Size' value (without unit and servings per container text and value)
		showServingsPerContainer: false,
		//to show the item name. there are special cases where the item name is replaced with 'servings per container' value
		showItemName: true,
		//to show the item name for the UK version. the main difference with the previous setting is this feature is set to false by default. the UK version will ignore the showItemName setting
		showItemNameForUK: false,
		//show the brand where this item belongs to
		showBrandName: false,
		//to show the ingredients value or not
		showIngredients: true,
		//to show the calorie diet info at the bottom of the label
		showCalorieDiet: false,
		//to show the customizable footer which can contain html and js codes
		showCustomFooter: false,
		//see https://github.com/nutritionix/nutrition-label/issues/93 and then https://github.com/nutritionix/nutrition-label/issues/104
		indentSugarAndRemoveBoldStyleFor2018Label: true,
		boldCaffeine: true, //this is for the 2018 version

		//to show the disclaimer text or not
		showDisclaimer: false,
		//the height in px of the disclaimer div
		scrollDisclaimerHeightComparison: 100,
		scrollDisclaimer: 95,
		valueDisclaimer: 'Please note that these nutrition values are estimated based on our standard serving portions. ' +
			'As food servings may have a slight variance each time you visit, please expect these values to be with in 10% +/- of your actual meal. ' +
			'If you have any questions about our nutrition calculator, please contact Nutritionix.',
		ingredientLabel: 'INGREDIENTS:',
		valueCustomFooter: '',

		//the are to set some values as 'not applicable'. this means that the nutrition label will appear but the value will be a 'gray dash'
		naCalories: false,
		naFatCalories: false,
		naTotalFat: false,
		naSatFat: false,
		naTransFat: false,
		naPolyFat: false,
		naMonoFat: false,
		naCholesterol: false,
		naSodium: false,
		naPotassium: false, //this is for the legacy version
		naPotassium_2018: false, //this is for the 2018 version
		naTotalCarb: false,
		naFibers: false,
		naSugars: false,
		naAddedSugars: false, //this is for the 2018 version
		naSugarAlcohol: false,
		naProteins: false,
		naVitaminA: false,
		naVitaminC: false,
		naVitaminD: false, //this is for the 2018 version
		naCalcium: false, //this is for the 2018 version
		naIron: false,
		naCaffeine: false, //this is for the 2018 version

		//these are the default values for the nutrition info
		valueServingWeightGrams: 0,
		valueServingPerContainer: 1,
		valueCalories: 0,
		valueFatCalories: 0,
		valueTotalFat: 0,
		valueSatFat: 0,
		valueTransFat: 0,
		valuePolyFat: 0,
		valueMonoFat: 0,
		valueCholesterol: 0,
		valueSodium: 0,
		valuePotassium: 0, //this is for the legacy version
		valuePotassium_2018: 0, //this is for the 2018 version
		valueTotalCarb: 0,
		valueFibers: 0,
		valueSugars: 0,
		valueAddedSugars: 0, //this is for the 2018 version
		valueSugarAlcohol: 0,
		valueProteins: 0,
		valueVitaminA: 0,
		valueVitaminC: 0,
		valueVitaminD: 0, //this is for the 2018 version
		valueCalcium: 0, //this is for the 2018 version
		valueIron: 0,
		valueCaffeine: 0, //this is for the 2018 version

		//customizable units for the values
		unitCalories: '',
		unitFatCalories: '',
		unitTotalFat: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitSatFat: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitTransFat: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitPolyFat: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitMonoFat: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitCholesterol: '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>',
		unitSodium: '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>',
		unitPotassium: '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>', //this is for the legacy version
		unitPotassium_base: '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>', //this is for the 2018 version
		unitPotassium_percent: '%', //this is for the 2018 version
		unitTotalCarb: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitFibers: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitSugars: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitAddedSugars: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>', //this is for the 2018 version
		unitSugarAlcohol: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitProteins: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>',
		unitVitaminA: '%',
		unitVitaminC: '%',
		unitVitaminD_base: '<span aria-hidden="true">mcg</span><span class="sr-only"> micrograms</span>', //this is for the 2018 version
		unitVitaminD_percent: '%', //this is for the 2018 version
		unitCalcium: '%', //this is for the 2018 version
		unitCalcium_base: '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>', //this is for the 2018 version
		unitCalcium_percent: '%', //this is for the 2018 version
		unitIron: '%',
		unitIron_base: '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>', //this is for the 2018 version
		unitIron_percent: '%', //this is for the 2018 version
		unitServingWeight: '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>', //this is for the 2018 version
		unitEnergy_kj: 'kj', //this is for the uk version
		unitEnergy_kcal: 'kcal', //this is for the uk version
		unitSalt: 'g', //this is for the uk version
		unitGramOrMlForThePer100Part: 'g', //this is for the uk version
		unitCaffeine: 'mg', //this is for the 2018 version

		//these are the values for the optional calorie diet
		valueCol1CalorieDiet: 2000,
		valueCol2CalorieDiet: 2500,
		valueCol1DietaryTotalFat: 0,
		valueCol2DietaryTotalFat: 0,
		valueCol1DietarySatFat: 0,
		valueCol2DietarySatFat: 0,
		valueCol1DietaryCholesterol: 0,
		valueCol2DietaryCholesterol: 0,
		valueCol1DietarySodium: 0,
		valueCol2DietarySodium: 0,
		valueCol1DietaryPotassium: 0,
		valueCol2DietaryPotassium: 0,
		valueCol1DietaryTotalCarb: 0,
		valueCol2DietaryTotalCarb: 0,
		valueCol1Dietary: 0,
		valueCol2Dietary: 0,

		//these text settings is so you can create nutrition labels in different languages or to simply change them to your need
		textNutritionFacts: 'Nutrition Facts',
		textDailyValues: 'Daily Value',
		textServingSize: 'Serving Size:',
		textServingsPerContainer: 'Servings Per Container',
		textAmountPerServing: 'Amount Per Serving',
		textCalories: 'Calories',
		textFatCalories: 'Calories from Fat',
		textTotalFat: 'Total Fat',
		textSatFat: 'Saturated Fat',
		textTransFat: '<em>Trans</em> Fat',
		textPolyFat: 'Polyunsaturated Fat',
		textMonoFat: 'Monounsaturated Fat',
		textCholesterol: 'Cholesterol',
		textSodium: 'Sodium',
		textPotassium: 'Potassium',
		textTotalCarb: 'Total Carbohydrates',
		textFibers: 'Dietary Fiber',
		textSugars: 'Sugars',
		textAddedSugars1: 'Includes ',
		textAddedSugars2: ' Added Sugars', //this is for the 2018 version
		textSugarAlcohol: 'Sugar Alcohol',
		textProteins: 'Protein',
		textVitaminA: 'Vitamin A',
		textVitaminC: 'Vitamin C',
		textVitaminD: 'Vitamin D', //this is for the 2018 version
		textCalcium: 'Calcium', //this is for the 2018 version
		textIron: 'Iron',
		textNotApplicable: '-',
		ingredientList: 'None',
		textPercentDailyPart1: 'Percent Daily Values are based on a',
		textPercentDailyPart2: 'calorie diet',
		textPercentDaily2018VersionPart1: 'The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. ',
		textPercentDaily2018VersionPart2: ' calories a day is used for general nutrition advice.',
		textGoogleAnalyticsEventCategory: 'Nutrition Label',
		textGoogleAnalyticsEventActionUpArrow: 'Quantity Up Arrow Clicked',
		textGoogleAnalyticsEventActionDownArrow: 'Quantity Down Arrow Clicked',
		textGoogleAnalyticsEventActionTextbox: 'Quantity Textbox Changed',
		textUKTypicalValues: 'Typical Values', //this is for the uk version
		textUKReferenceIntake: 'Reference intake of an average adult', //this is for the uk version
		textUKPer100: 'Per', //this is for the uk version
		textUKDefaultServingNameIfEmpty: 'Serving', //this is for the uk version
		textDataNotAvailable: 'Data not available',
		textAriaLabelIncreaseQuantityArrow: 'Increase the Quantity Arrow',
		textAriaLabelDecreaseQuantityArrow: 'Decrease the Quantity Arrow',
		textAriaLabelChangeQuantityTextbox: 'Change the Quantity Textbox',
		textCalorieDietHtmlLegacyLessThan: 'Less than',
		textCalorieDietHtmlLegacyDietary: 'Dietary',
		textCaffeine: 'Caffeine', //this is for the 2018 version

		//if the showLegacyVersion is true, the system will show the legacy version
		//if both the showLegacyVersion and showUKVersion are false, the system will show the 2018 version
		//if both the showLegacyVersion is false and showUKVersion is true, the system will show the uk version
		showLegacyVersion: true,
		showUKVersion: false,

		//for the uk label, If the serving name is empty, have it default to "Serving"
		convertEmptyServingNametoServingForUKLabel: true,

		//more details here https://github.com/nutritionix/nutrition-label/issues/77#issuecomment-323510972
		legacyVersion: 1
	};//end of => $.fn.nutritionLabel.defaultSettings


	//this will store the unique individual properties for each instance of the plugin
	function NutritionLabel(settings, $elem) {
		this.nutritionLabel = null;
		this.settings = settings;
		this.$elem = $elem;
		return this;
	}


	function cleanSettings(settings) {
		let numericIndex = [
			'calorieIntake',
			'dailyValueCalcium',
			'dailyValueCarb',
			'dailyValueCholesterol',
			'dailyValueEnergyKcal',
			'dailyValueFiber',
			'dailyValueIron',
			'dailyValuePotassium',
			'dailyValueProtein',
			'dailyValueSalt',
			'dailyValueSatFat',
			'dailyValueSodium',
			'dailyValueSugar',
			'dailyValueTotalFat',
			'dailyValueVitaminD',
			'decimalPlacesForDailyValues',
			'decimalPlacesForNutrition',
			'decimalPlacesForQuantityTextbox',
			'scrollHeightComparison',
			'scrollHeightPixel',
			'scrollLongItemNamePixel',
			'scrollLongItemNamePixel2018Override',
			'valueAddedSugars',
			'valueCaffeine',
			'valueCalcium',
			'valueCalories',
			'valueCholesterol',
			'valueCol1CalorieDiet',
			'valueCol1Dietary',
			'valueCol1DietaryCholesterol',
			'valueCol1DietaryPotassium',
			'valueCol1DietarySatFat',
			'valueCol1DietarySodium',
			'valueCol1DietaryTotalCarb',
			'valueCol1DietaryTotalFat',
			'valueCol2CalorieDiet',
			'valueCol2Dietary',
			'valueCol2DietaryCholesterol',
			'valueCol2DietaryPotassium',
			'valueCol2DietarySatFat',
			'valueCol2DietarySodium',
			'valueCol2DietaryTotalCarb',
			'valueCol2DietaryTotalFat',
			'valueFatCalories',
			'valueFibers',
			'valueIron',
			'valueMonoFat',
			'valuePolyFat',
			'valuePotassium',
			'valueProteins',
			'valueSatFat',
			'valueServingPerContainer',
			'valueServingSize',
			'valueServingUnitQuantity',
			'valueServingWeightGrams',
			'valueSodium',
			'valueSugarAlcohol',
			'valueSugars',
			'valueTotalCarb',
			'valueTotalFat',
			'valueTransFat',
			'valueVitaminA',
			'valueVitaminC',
			'valueVitaminD',
			'width'
		];

		$.each(settings, function(index, value) {
			if (jQuery.inArray(index, numericIndex) !== -1) {
				settings[index] = parseFloat(settings[index]);

				if (isNaN(settings[index]) || settings[index] === undefined) {
					settings[index] = 0;
				}
			}
		});

		if (settings['valueServingUnitQuantity'] < 0) {
			settings['valueServingUnitQuantity'] = 0;
		}

		return settings;
	}//end of => function cleanSettings(settings)


	function updateNutritionValueWithMultiplier(settings) {
		let nutritionIndex = [
			'valueAddedSugars',
			'valueCaffeine',
			'valueCalcium',
			'valueCalories',
			'valueCholesterol',
			'valueFatCalories',
			'valueFibers',
			'valueIron',
			'valueMonoFat',
			'valuePolyFat',
			'valuePotassium',
			'valuePotassium_2018',
			'valueProteins',
			'valueSatFat',
			'valueServingWeightGrams',
			'valueSodium',
			'valueSugarAlcohol',
			'valueSugars',
			'valueTotalCarb',
			'valueTotalFat',
			'valueTransFat',
			'valueVitaminA',
			'valueVitaminC',
			'valueVitaminD'
		];

		$.each(settings, function(index, value) {
			if (jQuery.inArray(index, nutritionIndex) !== -1) {
				settings[index] = parseFloat(settings[index]);
				if (isNaN(settings[index]) || settings[index] === undefined) {
					settings[index] = 0;
				}

				settings[index] =
					parseFloat(settings[index]) *
					parseFloat(settings['valueServingUnitQuantity']) *
					parseFloat(settings['nutritionValueMultiplier']);
			}
		});

		if (parseFloat(settings['valueServingUnitQuantity']) == 0) {
			settings['valueServingPerContainer'] = 0;
		} else if (!isNaN(settings['valueServingPerContainer']) && settings['valueServingPerContainer'] != undefined) {
			settings['valueServingPerContainer'] = parseFloat(settings.totalContainerQuantity) / parseFloat(settings['valueServingUnitQuantity']);
		}

		return settings;
	}//end of => function updateNutritionValueWithMultiplier(settings)


	function init(settings, $elem) {
		//merge the default settins with the user supplied settings
		let $settings = $.extend({}, $.fn.nutritionLabel.defaultSettings, settings || {});
		let $originalCleanSettings = cleanSettings($.extend({}, $.fn.nutritionLabel.defaultSettings, settings || {}));

		$settings.totalContainerQuantity = parseFloat($settings.valueServingPerContainer) * parseFloat($settings['valueServingUnitQuantity']);
		$originalCleanSettings.totalContainerQuantity = parseFloat($originalCleanSettings.valueServingPerContainer) * parseFloat($originalCleanSettings['valueServingUnitQuantity']);

		//clean the settings and make sure that all numeric settings are really numeric, if not, force them to be
		$settings = cleanSettings($settings);
		$originalCleanSettings = cleanSettings($originalCleanSettings);

		$settings.nutritionValueMultiplier = $settings.valueServingUnitQuantity <= 0 ? 1 : 1 / $settings.valueServingUnitQuantity;

		//update the nutrition values with the multiplier
		let $updatedsettings = updateNutritionValueWithMultiplier($settings);
		$settings.originalServingUnitQuantity = $updatedsettings.valueServingUnitQuantity;

		//if the original value is <= 0, set it to 1.0
		if ($updatedsettings.valueServingUnitQuantity <= 0) {
			$originalCleanSettings.valueServingUnitQuantity = 1;
			$updatedsettings = updateNutritionValueWithMultiplier($originalCleanSettings);
			$updatedsettings.valueServingUnitQuantity = 1;
		}

		//initalize the nutrition label and create / recreate it
		var nutritionLabel = new NutritionLabel($updatedsettings, $elem);

		if ($updatedsettings.showLegacyVersion) {
			                               //($localSettings nutritionLabel  $elem  forLegacyLabel forInitialization forUKLabel)
			updateValuesAfterAQuantityChanged($settings,     nutritionLabel, $elem, true,          true,             false);

			//if the text box for the unit quantity is shown
			if ($settings.showServingUnitQuantityTextbox) {
				//if the arrows are not hidden
				if (!$settings.hideTextboxArrows) {
					//increase the unit quantity by clicking the up arrow
					$('#' + $elem.attr('id')).on('click', '.unitQuantityUp', function(e) {
						e.preventDefault();
						                   //($thisQuantity changeValueBy $localSettings                                      nutritionLabel  $elem  forLegacyLabel forUKLabel)
						changeQuantityByArrow($(this),      1,            updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, true,          false);
					});

					//decrease the unit quantity by clicking the down arrow
					$('#' + $elem.attr('id')).on('click', '.unitQuantityDown', function(e) {
						e.preventDefault();
						                   //($thisQuantity changeValueBy $localSettings                                      nutritionLabel  $elem  forLegacyLabel forUKLabel)
						changeQuantityByArrow($(this),      -1,           updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, true,          false);
					});
				}

				//the textbox unit quantity value is changed
				$('#' + $elem.attr('id')).on('change', '.unitQuantityBox', function(e) {
					e.preventDefault();
					                    //($thisTextbox $localSettings                                     nutritionLabel  $elem  forLegacyLabel forUKLabel)
					changeQuantityTextbox($(this),     updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, true,          false);
				});

				//the textbox unit quantity value is changed
				$('#' + $elem.attr('id')).on('keydown', '.unitQuantityBox', function(e) {
					if (e.keyCode == 13) {
						e.preventDefault();
						                   //($thisTextbox $localSettings,                                     nutritionLabel  $elem  forLegacyLabel forUKLabel)
						changeQuantityTextbox($(this),     updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, true,          false);
					}
				});
			}
		//end of => if ($updatedsettings.showLegacyVersion)
		} else if ($updatedsettings.showUKVersion) {
			//this part is for the uk version
			                               //($localSettings nutritionLabel  $elem  forLegacyLabel forInitialization forUKLabel)
			updateValuesAfterAQuantityChanged($settings,     nutritionLabel, $elem, false,         true,             true);

			//if the text box for the unit quantity is shown
			if ($settings.showServingUnitQuantityTextbox) {
				//if the arrows are not hidden
				if (!$settings.hideTextboxArrows) {
					//increase the unit quantity by clicking the up arrow
					$('#' + $elem.attr('id')).on('click', '.uk_nf-unitQuantityUp', function(e) {
						e.preventDefault();
						                   //($thisQuantity changeValueBy $localSettings                                      nutritionLabel  $elem  forLegacyLabel forUKLabel)
						changeQuantityByArrow($(this),      1,            updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false,         true);
					});

					//decrease the unit quantity by clicking the down arrow
					$('#' + $elem.attr('id')).on('click', '.uk_nf-unitQuantityDown', function(e) {
						e.preventDefault();
						                   //($thisQuantity changeValueBy $localSettings                                      nutritionLabel  $elem  forLegacyLabel forUKLabel)
						changeQuantityByArrow($(this),      -1,           updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false,         true);
					});
				}

				//the textbox unit quantity value is changed
				$('#' + $elem.attr('id')).on('change', '.uk_nf-unitQuantityBox', function(e) {
					e.preventDefault();
					                   //($thisTextbox $localSettings                                      nutritionLabel  $elem  forLegacyLabel forUKLabel)
					changeQuantityTextbox($(this),     updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false,         true);
				});

				//the textbox unit quantity value is changed
				$('#' + $elem.attr('id')).on('keydown', '.uk_nf-unitQuantityBox', function(e) {
					if (e.keyCode == 13) {
						e.preventDefault();
						                   //($thisTextbox $localSettings                                      nutritionLabel  $elem  forLegacyLabel forUKLabel)
						changeQuantityTextbox($(this),     updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false,         true);
					}
				});
			}
		//end of => else if ($updatedsettings.showUKVersion)
		} else {
			//this part is for the 2018 version
			                               //($localSettings nutritionLabel  $elem  forLegacyLabel forInitialization forUKLabel)
			updateValuesAfterAQuantityChanged($settings,     nutritionLabel, $elem, false,         true,             false);

			//if the text box for the unit quantity is shown
			if ($settings.showServingUnitQuantityTextbox) {
				//if the arrows are not hidden
				if (!$settings.hideTextboxArrows) {
					//increase the unit quantity by clicking the up arrow
					$('#' + $elem.attr('id')).on('click', 'div.nf-unitQuantityUp', function(e) {
						e.preventDefault();
						                   //($thisQuantity changeValueBy $localSettings                                      nutritionLabel  $elem  forLegacyLabel forUKLabel)
						changeQuantityByArrow($(this),      1,            updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false,         false);
					});

					//decrease the unit quantity by clicking the down arrow
					$('#' + $elem.attr('id')).on('click', 'div.nf-unitQuantityDown', function(e) {
						e.preventDefault();
						                   //($thisQuantity changeValueBy $localSettings                                      nutritionLabel  $elem  forLegacyLabel forUKLabel)
						changeQuantityByArrow($(this),      -1,           updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false,         false);
					});
				}

				//the textbox unit quantity value is changed
				$('#' + $elem.attr('id')).on('change', '.nf-unitQuantityBox', function(e) {
					e.preventDefault();
					                   //($thisTextbox $localSettings                                      nutritionLabel  $elem  forLegacyLabel forUKLabel)
					changeQuantityTextbox($(this),     updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false,         false);
				});

				//the textbox unit quantity value is changed
				$('#' + $elem.attr('id')).on('keydown', '.nf-unitQuantityBox', function(e) {
					if (e.keyCode == 13) {
						e.preventDefault();
						                   //($thisTextbox $localSettings                                      nutritionLabel  $elem  forLegacyLabel forUKLabel)
						changeQuantityTextbox($(this),     updateTheSettingsAfterAnEvent($settings, settings), nutritionLabel, $elem, false,         false);
					}
				});
			}
		}//end of => else => if ($updatedsettings.showLegacyVersion) => else if ($updatedsettings.showUKVersion)

		//store the object for later reference
		$elem.data('_nutritionLabel', nutritionLabel);
	}//end of => function init(settings, $elem)


	function updateTheSettingsAfterAnEvent($localSettings, localSettings) {
		let $localSettingsHolder = cleanSettings($.extend({}, $.fn.nutritionLabel.defaultSettings, localSettings || {}));
		$localSettingsHolder.originalServingUnitQuantity = $localSettings.originalServingUnitQuantity;
		$localSettingsHolder.totalContainerQuantity = $localSettings.totalContainerQuantity;
		$localSettingsHolder.nutritionValueMultiplier = $localSettingsHolder.valueServingUnitQuantity <= 0 ? 1 : 1 / $localSettingsHolder.valueServingUnitQuantity;
		return $localSettingsHolder;
	}


	function addScrollToItemDiv($localElem, $localSettings, localNameClass, forLegacyLabel) {
		let local_scrollLongItemNamePixel = parseInt($localSettings.scrollLongItemNamePixel);
		if (!forLegacyLabel) {
			local_scrollLongItemNamePixel = parseInt($localSettings.scrollLongItemNamePixel2018Override);
		}

		//as of 05/14/2017 inline class only appears on the legacy version
		if ($('#' + $localElem.attr('id') + ' .' + localNameClass + '.inline').val() != undefined) {
			if ($('#' + $localElem.attr('id') + ' .' + localNameClass + '.inline').height() > local_scrollLongItemNamePixel + 1) {
				$('#' + $localElem.attr('id') + ' .' + localNameClass + '.inline').css({
					'margin-left': '3.90em',
					'height': local_scrollLongItemNamePixel + 'px',
					'overflow-y': 'auto'
				});
			}
		} else {
			if (forLegacyLabel) {
				if ($('#' + $localElem.attr('id') + ' .' + localNameClass).height() > local_scrollLongItemNamePixel + 1) {
					$('#' + $localElem.attr('id') + ' .' + localNameClass).css({
						'height': local_scrollLongItemNamePixel + 'px',
						'overflow-y': 'auto'
					});
				}
			} else {
				if ($('#' + $localElem.attr('id') + ' .' + localNameClass + ' div').height() >= local_scrollLongItemNamePixel + 1) {
					$('#' + $localElem.attr('id') + ' .' + localNameClass + ' div').css({
						'height': local_scrollLongItemNamePixel + 'px',
						'overflow-y': 'auto'
					});
				}
			}
		}
	}


	function notApplicableHover($localElem) {
		//this code is for pages with multiple nutrition labels generated by the plugin like the demo page
		if ($localElem.attr('id') !== undefined && $localElem.attr('id') !== '') {
			$('#' + $localElem.attr('id') + ' .notApplicable').on('mouseenter', function() {
				$('#' + $localElem.attr('id') + ' .naTooltip').css({
					top: $(this).position().top + 'px',
					left: $(this).position().left + 10 + 'px'
				}).show();
			});

			$('#' + $localElem.attr('id') + ' .notApplicable').on('mouseleave', function() {
				$('#' + $localElem.attr('id') + ' .naTooltip').hide();
			});
		} else {
			$('#' + $localElem.attr('id') + ' .notApplicable').on('mouseenter', function() {
				$('.naTooltip').css({
					top: $(this).position().top + 'px',
					left: $(this).position().left + 10 + 'px'
				}).show();
			});

			$('#' + $localElem.attr('id') + ' .notApplicable').on('mouseleave', function() {
				$('.naTooltip').hide();
			});
		}
	}


	function updateScrollingFeature($localElem, $localSettings, localIDToScroll, localScrollHeightComparison, localScrollHeight) {
		let $parentElement;
		if ($localElem.attr('id') !== undefined && $localElem.attr('id') !== '') {
			//this code is for pages with multiple nutrition labels generated by the plugin like the demo page
			$parentElement = $('#' + $localElem.attr('id') + ' #' + localIDToScroll).parent();
		} else {
			$parentElement = $('#' + localIDToScroll).parent();
		}

		if ($parentElement.innerHeight() > localScrollHeightComparison) {
			$parentElement.addClass('scroll').css({
				height: localScrollHeight + 'px'
			});
		}
	}


	function updateValuesAfterAQuantityChanged($localSettings, nutritionLabel, $elem, forLegacyLabel, forInitialization, forUKLabel) {
		let ingredientListID = 'ingredientList';
		let calcDisclaimerTextID = 'calcDisclaimerText';
		let nameElementClass = 'name';

		if (!forLegacyLabel && !forUKLabel) {
			//for the 2018 label
			ingredientListID = 'nf-ingredientList';
			calcDisclaimerTextID = 'nf-calcDisclaimerText';

			nameElementClass = 'nf-item-name block';
		} else if (!forLegacyLabel && forUKLabel) {
			//for the uk label
			ingredientListID = 'uk_nf-ingredient-statement';
			calcDisclaimerTextID = 'uk_nf-disclaimer';
		}

		if (!forInitialization) {
			$localSettings = updateNutritionValueWithMultiplier($localSettings);
			nutritionLabel = new NutritionLabel($localSettings, $elem);
		}

		//if the showLegacyVersion is true, the system will show the legacy version
		//if both the showLegacyVersion and showUKVersion are false, the system will show the 2018 version
		//if both the showLegacyVersion is false and showUKVersion is true, the system will show the uk version
		if (forLegacyLabel) {
			$elem.html(nutritionLabel.generateLegacy());
		} else if (forUKLabel) {
			$elem.html(nutritionLabel.generateUK());
		} else {
			$elem.html(nutritionLabel.generate2018());
		}

		//scroll the ingredients of the innerheight is > $localSettings.scrollHeightComparison and the settings showIngredients and scrollLongIngredients are true
		if ($localSettings.showIngredients && $localSettings.scrollLongIngredients) {
			                    //($localElem $localSettings  localIDToScroll   localScrollHeightComparison            localScrollHeight)
			updateScrollingFeature($elem,     $localSettings, ingredientListID, $localSettings.scrollHeightComparison, $localSettings.scrollHeightPixel);
		}

		//scroll the disclaimer if the height of the disclaimer div is greater than scrollDisclaimerHeightComparison
		if ($localSettings.showDisclaimer) {
			                    //($localElem $localSettings  localIDToScroll       localScrollHeightComparison                      localScrollHeight)
			updateScrollingFeature($elem,     $localSettings, calcDisclaimerTextID, $localSettings.scrollDisclaimerHeightComparison, $localSettings.scrollDisclaimer);
		}

		//this code is for pages with multiple nutrition labels generated by the plugin like the demo page
		notApplicableHover($elem);

		//for the legacy and 2018 label
		if (!forUKLabel) {
			//add a scroll on long item names
			if ($localSettings.scrollLongItemName) {
				addScrollToItemDiv($elem, $localSettings, nameElementClass, forLegacyLabel);
			}
		}

		if (!forInitialization) {
			return $localSettings;
		}
	}//end of => function updateValuesAfterAQuantityChanged($localSettings, $elem, ingredientListID, calcDisclaimerTextID, forLegacyLabel, forInitialization, forUKLabel)


	function handleQuantityChange($localSettings, source, previousValue, newValue) {
		let handler;
		if ($localSettings.userFunctionOnQuantityChange) {
			handler = $localSettings.userFunctionOnQuantityChange;
		} else if ($localSettings.userFunctionNameOnQuantityChange) {
			handler = window[$localSettings.userFunctionNameOnQuantityChange];
		}

		if (typeof handler === 'function') {
			handler(source, previousValue, newValue);
		}
	}


	function changeQuantityTextbox($thisTextbox, $localSettings, nutritionLabel, $elem, forLegacyLabel, forUKLabel) {
		let nixLabelBeforeQuantityID = 'nixLabelBeforeQuantity';
		let previousValue;
		let textBoxValue;

		if (!forLegacyLabel & !forUKLabel) {
			nixLabelBeforeQuantityID = 'nf-nixLabelBeforeQuantity';
		} else if (!forLegacyLabel & forUKLabel) {
			nixLabelBeforeQuantityID = 'uk_nf-nixLabelBeforeQuantity';
		}

		previousValue = parseFloat($('#' + $elem.attr('id') + ' #' + nixLabelBeforeQuantityID).val());

		textBoxValue = !regIsPosNumber($thisTextbox.val()) ? previousValue : parseFloat($thisTextbox.val());
		$thisTextbox.val( roundLoDash(textBoxValue, $localSettings.decimalPlacesForQuantityTextbox) );

		$localSettings.valueServingUnitQuantity = textBoxValue;
		                                                //($localSettings  nutritionLabel  $elem  forLegacyLabel  forInitialization forUKLabel)
		$localSettings = updateValuesAfterAQuantityChanged($localSettings, nutritionLabel, $elem, forLegacyLabel, false,            forUKLabel);

		if ($localSettings.allowGoogleAnalyticsEventLog) {
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
			roundLoDash(previousValue, $localSettings.decimalPlacesForQuantityTextbox),
			roundLoDash(textBoxValue, $localSettings.decimalPlacesForQuantityTextbox)
		);
	}//end of => function changeQuantityTextbox($thisTextbox, $localSettings, nutritionLabel, $elem, forLegacyLabel, forUKLabel)


	function changeQuantityByArrow($thisQuantity, changeValueBy, $localSettings, nutritionLabel, $elem, forLegacyLabel, forUKLabel) {
		let unitQuantityBoxClass = 'unitQuantityBox';
		if (!forLegacyLabel & !forUKLabel) {
			unitQuantityBoxClass = 'nf-unitQuantityBox';
		} else if (!forLegacyLabel & forUKLabel) {
			unitQuantityBoxClass = 'uk_nf-unitQuantityBox';
		}

		let currentQuantity = parseFloat($thisQuantity.parent().parent().find('input.' + unitQuantityBoxClass).val());
		if (isNaN(currentQuantity)) {
			currentQuantity = 1.0;
		}
		let beforeCurrentQuantityWasChanged = currentQuantity;

		//see https://github.com/nutritionix/nutrition-label/issues/14 for an explanation on this part
		if (currentQuantity <= 1 && changeValueBy == -1) {
			changeValueBy = -0.5;
			currentQuantity += changeValueBy;
		} else if (currentQuantity < 1 && changeValueBy == 1) {
			changeValueBy = 0.5;
			currentQuantity += changeValueBy;
		} else if (currentQuantity <= 2 && currentQuantity > 1 && changeValueBy == -1) {
			currentQuantity = 1;
		} else {
			currentQuantity += changeValueBy;
		}

		if (currentQuantity < 0) {
			currentQuantity = 0;
		}

		$thisQuantity.parent().parent().find('input.' + unitQuantityBoxClass).val(
			roundLoDash(currentQuantity, $localSettings.decimalPlacesForQuantityTextbox)
		);

		$localSettings.valueServingUnitQuantity = currentQuantity;
		                                                //($localSettings  nutritionLabel  $elem  forLegacyLabel  forInitialization forUKLabel)
		$localSettings = updateValuesAfterAQuantityChanged($localSettings, nutritionLabel, $elem, forLegacyLabel, false,            forUKLabel);

		if ($localSettings.allowGoogleAnalyticsEventLog) {
			if (changeValueBy > 0) {
				window[$localSettings.gooleAnalyticsFunctionName](
					'send',
					'event',
					$localSettings.textGoogleAnalyticsEventCategory,
					$localSettings.textGoogleAnalyticsEventActionUpArrow
				);
			} else {
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
	}//end of => function changeQuantityByArrow($thisQuantity, changeValueBy, $localSettings, nutritionLabel, $elem, forLegacyLabel, forUKLabel)


	//round the value to the nearest number
	function roundToNearestNum(input, nearest) {
		return nearest < 0 ?
			Math.round(input * nearest) / nearest :
			Math.round(input / nearest) * nearest;
	}


	function roundCalories(toRound, decimalPlace) {
		toRound = roundCaloriesRule(toRound);
		if (toRound > 0) {
			toRound = roundLoDash(toRound, decimalPlace);
		}
		return toRound;
	}


	function roundFat(toRound, decimalPlace) {
		toRound = roundFatRule(toRound);
		if (toRound > 0) {
			toRound = roundLoDash(toRound, decimalPlace);
		}
		return toRound;
	}


	function roundSodium(toRound, decimalPlace) {
		toRound = roundSodiumRule(toRound);
		if (toRound > 0) {
			toRound = roundLoDash(toRound, decimalPlace);
		}
		return toRound;
	}


	function roundPotassium(toRound, decimalPlace) {
		toRound = roundPotassiumRule(toRound);
		if (toRound > 0) {
			toRound = roundLoDash(toRound, decimalPlace);
		}
		return toRound;
	}


	function roundCholesterol(toRound, decimalPlace) {
		let normalVersion = true;
		let roundResult = roundCholesterolRule(toRound);
		if (roundResult === false) {
			normalVersion = false;
		} else {
			toRound = roundResult;
		}

		if (normalVersion) {
			if (toRound > 0) {
				toRound = roundLoDash(toRound, decimalPlace);
			}
		} else {
			toRound = '< 5';
		}
		return toRound;
	}


	function roundCarbFiberSugarProtein(toRound, decimalPlace) {
		let normalVersion = true;
		let roundResult = roundCarbFiberSugarProteinRule(toRound);
		if (roundResult === false) {
			normalVersion = false;
		} else {
			toRound = roundResult;
		}

		if (normalVersion) {
			if (toRound > 0) {
				toRound = roundLoDash(toRound, decimalPlace);
			}
		} else {
			toRound = '< 1';
		}
		return toRound;
	}


	function roundCaffeine(toRound, decimalPlace) {
		toRound = roundToNearestNum(toRound, 1);
		if (toRound > 0) {
			toRound = roundLoDash(toRound, decimalPlace);
		}

		return toRound;
	}


	//Calories and Calories from Fat rounding rule
	function roundCaloriesRule(toRound) {
		if (toRound < 5) {
			return 0;
		} else if (toRound <= 50) {
			//50 cal - express to nearest 5 cal increment
			return roundToNearestNum(toRound, 5);
		}

		//> 50 cal - express to nearest 10 cal increment
		return roundToNearestNum(toRound, 10);
	}


	//Total Fat, Saturated Fat, Polyunsaturated Fat and Monounsaturated Fat rounding rule
	function roundFatRule(toRound) {
		if (toRound < 0.5) {
			return 0;
		} else if (toRound < 5) {
			//< 5 g - express to nearest .5g increment
			return roundToNearestNum(toRound, 0.5);
		}

		//>= 5 g - express to nearest 1 g increment
		return roundToNearestNum(toRound, 1);
	}


	//Sodium rounding rule
	function roundSodiumRule(toRound) {
		if (toRound < 5) {
			return 0;
		} else if (toRound <= 140) {
			//5 - 140 mg - express to nearest 5 mg increment
			return roundToNearestNum(toRound, 5);
		}

		//>= 5 g - express to nearest 10 g increment
		return roundToNearestNum(toRound, 10);
	}


	//Potassium rounding rule
	function roundPotassiumRule(toRound) {
		if (toRound < 5) {
			return 0;
		} else if (toRound <= 140) {
			//5 - 140 mg - express to nearest 5 mg increment
			return roundToNearestNum(toRound, 5);
		}

		//>= 5 g - express to nearest 10 g increment
		return roundToNearestNum(toRound, 10);
	}


	//Cholesterol rounding rule
	function roundCholesterolRule(toRound) {
		if (toRound < 2) {
			return 0;
		} else if (toRound <= 5) {
			return false;
		}

		//> 5 mg - express to nearest 5 mg increment
		return roundToNearestNum(toRound, 5);
	}


	//Total Carbohydrate, Dietary Fiber, Sugar and Protein rounding rule
	function roundCarbFiberSugarProteinRule(toRound) {
		if (toRound < 0.5) {
			return 0;
		} else if (toRound < 1) {
			//< 1 g - express as "Contains less than 1g" or "less than 1g"
			return false;
		}

		//> 1 mg - express to nearest 1 g increment
		return roundToNearestNum(toRound, 1);
	}


	//Total Carbohydrate, Dietary Fiber, Sugar and Protein rounding rule
	function roundVitaminsCalciumIron(toRound) {
		if (toRound > 0) {
			if (toRound < 1) {
				//< 1 express as 0
				return 0;
			} else if (toRound <= 2) {
				//1% to 2% express as 2%
				return 2;
			} else if (toRound < 10) {
				//< 10 - round to nearest even number
				return roundToNearestNum(toRound, 2);
			} else if (toRound < 50) {
				//between 10 and 50, round to the nearest 5 increment
				return roundToNearestNum(toRound, 5);
			}

			//else, round to the nearest 10 increment
			return roundToNearestNum(toRound, 10);
		}

		return 0;
	}


	function roundForUKLabelTotalFatCarbsSugarFiberProtein(toRound) {
		let normalVersion = true;
		let roundResult = roundForUKLabelTotalFatCarbsSugarFiberProteinRule(toRound);
		if (roundResult === false) {
			normalVersion = false;
		} else {
			toRound = roundResult;
		}

		if (normalVersion && toRound == 0) {
			toRound = '< 0.5';
		}
		return toRound;
	}


	function roundForUKLabelTotalFatCarbsSugarFiberProteinRule(toRound) {
		if (toRound <= 0.5) {
			return 0;
		} else if (toRound < 10) {
			//< 10 > 0.5 - express to nearest 0.1 increment
			return roundLoDash(roundToNearestNum(toRound, 0.1), 1);
		}

		//> 10 express to nearest 1 increment
		return roundLoDash( roundToNearestNum(toRound, 1) );
	}


	function roundForUKLabelSatFat(toRound) {
		let normalVersion = true;
		let roundResult = roundForUKLabelSatFatRule(toRound);
		if (roundResult === false) {
			normalVersion = false;
		} else {
			toRound = roundResult;
		}

		if (normalVersion && toRound == 0) {
			toRound = '< 0.1';
		}
		return toRound;
	}


	function roundForUKLabelSatFatRule(toRound) {
		if (toRound <= 0.1) {
			return 0;
		} else if (toRound < 10) {
			//< 10 > 0.5 - express to nearest 0.1 increment
			return roundLoDash(roundToNearestNum(toRound, 0.1), 1);
		}

		//> 10 express to nearest 1 increment
		return roundLoDash( roundToNearestNum(toRound, 1) );
	}


	function roundForUKLabelSalt(toRound) {
		let normalVersion = true;
		let roundResult = roundForUKLabelSaltRule(toRound);

		if (roundResult === false) {
			normalVersion = false;
		} else {
			toRound = roundResult;
		}

		if (normalVersion && toRound == 0) {
			toRound = '< 0.01';
		}
		return toRound;
	}


	function roundForUKLabelSaltRule(toRound) {
		if (toRound <= 0.0125) {
			return 0;
		} else if (toRound < 1) {
			//< 10 > 0.5 - express to nearest 0.1 increment
			return roundLoDash(roundToNearestNum(toRound, 0.01), 2);
		}

		//> 1 express to nearest 0.1 increment
		return roundLoDash(roundToNearestNum(toRound, 0.1), 1);
	}


	function roundFor2018LabelVitaminDIron(toRound) {
		toRound = roundFor2018LabelVitaminDIronRule(toRound);
		if (toRound > 0) {
			return roundLoDash(toRound, 1);
		}

		return 0;
	}


	function roundFor2018LabelVitaminDIronRule(toRound) {
		//round to the nearest 0.1 increment
		return roundToNearestNum(toRound, 0.1);
	}


	function roundFor2018LabelCalciumPotassium(toRound) {
		toRound = roundFor2018LabelCalciumPotassiumRule(toRound);
		if (toRound > 0) {
			return toRound;
		}

		return 0;
	}


	function roundFor2018LabelCalciumPotassiumRule(toRound) {
		//round to the nearest 10 increment
		return roundToNearestNum(toRound, 10);
	}


	//check if the value is a positive number
	function regIsPosNumber(fData) {
		/* eslint-disable no-useless-escape */
		return new RegExp('(^[0-9]+[\.]?[0-9]+$)|(^[0-9]+$)').test(fData);
		/* eslint-enable no-useless-escape */
	}


	//generate and return the html code for the item area
	function itemNameHtmlLegacy($localSettings) {
		let tabTemp = globalTab1;
		let localNutritionLabel = '';
		let itemNameClass = '';
		if ($localSettings.showServingUnitQuantityTextbox) {
			if (
					($localSettings.valueServingSizeUnit === null || $localSettings.valueServingSizeUnit == '') ||
					(
						$localSettings.valueServingSizeUnit !== '' &&
						$localSettings.valueServingSizeUnit !== null &&
						$localSettings.originalServingUnitQuantity <= 0
					)
			) {
				let textboxClass = 'unitQuantityBox';

				localNutritionLabel += globalTab1 + '<div class="cf">\n';
					localNutritionLabel += globalTab2 + '<div class="rel servingSizeField">\n';

					if (!$localSettings.hideTextboxArrows) {
						localNutritionLabel += globalTab3 + '<div class="setter">\n';
							localNutritionLabel += globalTab4 + '<a href="' + $localSettings.textAriaLabelIncreaseQuantityArrow + '" class="unitQuantityUp" ';
								localNutritionLabel += 'aria-label="' + $localSettings.textAriaLabelIncreaseQuantityArrow + '" rel="nofollow" tabindex="0"></a>\n';
							localNutritionLabel += globalTab4 + '<a href="' + $localSettings.textAriaLabelDecreaseQuantityArrow + '" class="unitQuantityDown" ';
								localNutritionLabel += 'aria-label="' + $localSettings.textAriaLabelDecreaseQuantityArrow + '" rel="nofollow" tabindex="0"></a>\n';
						localNutritionLabel += globalTab3 + '</div><!-- closing class="setter" -->\n\n';
					} else {
						textboxClass = 'unitQuantityBox arrowsAreHidden';
					}

						localNutritionLabel += globalTab3 + '<input type="text" data-role="none" value="' +
							roundLoDash($localSettings.valueServingUnitQuantity, $localSettings.decimalPlacesForQuantityTextbox) +
							'" class="' + textboxClass + '" aria-label="' + $localSettings.textAriaLabelChangeQuantityTextbox + '">\n';

						localNutritionLabel += globalTab3 + '<input type="hidden" value="' +
							roundLoDash($localSettings.valueServingUnitQuantity, $localSettings.decimalPlacesForQuantityTextbox) +
							'" id="nixLabelBeforeQuantity">\n';

					localNutritionLabel += globalTab2 + '</div><!-- closing class="servingSizeField" -->\n\n';
				tabTemp = globalTab2;
				itemNameClass = 'inline';
			}
		}//end of => if ($localSettings.showServingUnitQuantityTextbox) {

			localNutritionLabel += tabTemp + '<div class="name ' + itemNameClass + '" tabindex="0">';
				localNutritionLabel += $localSettings.itemName;
			if ($localSettings.showBrandName && $localSettings.brandName !== null && $localSettings.brandName != '') {
				localNutritionLabel += ' - ' + $localSettings.brandName;
			}
			localNutritionLabel += '</div>\n';

		if ($localSettings.showServingUnitQuantityTextbox) {
			if (
					($localSettings.valueServingSizeUnit === null || $localSettings.valueServingSizeUnit == '') ||
					(
						$localSettings.valueServingSizeUnit !== '' &&
						$localSettings.valueServingSizeUnit !== null &&
						$localSettings.originalServingUnitQuantity <= 0
					)
			) {
				/* eslint-disable no-useless-escape */
				localNutritionLabel += globalTab1 + '</div><!-- closing class="cf" -->\n\n';
				/* eslint-enable no-useless-escape */
			}
		}

		return localNutritionLabel;
	}//end of => function itemNameHtmlLegacy($localSettings)


	//generate and return the html code for the serving unit quantity area
	function sevingUnitQuantityHtmlLegacy($localSettings) {
		let localServingSizeIsHidden = false;
		let localServingContainerIsHidden = false;
		let localNutritionLabel = '';
		if ($localSettings.showServingUnitQuantity) {
			localNutritionLabel += globalTab1 + '<div class="serving" tabIndex="0">\n';

			if ($localSettings.originalServingUnitQuantity > 0) {
				let unitAddedClass = '';
				let gramsAddedClass = '';

				localNutritionLabel += globalTab2 + '<div class="cf">\n';
					localNutritionLabel += globalTab3 + '<div class="servingSizeText fl">' + $localSettings.textServingSize + '</div>\n';
						localNutritionLabel += $localSettings.showServingUnitQuantityTextbox ?
							'' :
							globalTab3 + '<div class="servingUnitQuantity fl" itemprop="servingSize">' +
								roundLoDash($localSettings.originalServingUnitQuantity, $localSettings.decimalPlacesForNutrition) +
							'</div>\n';

				if ($localSettings.valueServingSizeUnit !== '' && $localSettings.valueServingSizeUnit !== null) {
					if (
							$localSettings.showServingUnitQuantityTextbox &&
							$localSettings.valueServingSizeUnit !== null &&
							$localSettings.valueServingSizeUnit != ''
					) {
						let textboxClass = 'unitQuantityBox';

						unitAddedClass = 'unitHasTextbox';
						gramsAddedClass = 'gramsHasTextbox';
						localNutritionLabel += globalTab3 + '<div class="rel servingSizeField fl">\n';

						if (!$localSettings.hideTextboxArrows) {
							localNutritionLabel += globalTab4 + '<div class="setter">\n';
								localNutritionLabel += globalTab5 + '<a href="' + $localSettings.textAriaLabelIncreaseQuantityArrow + '" class="unitQuantityUp" ';
									localNutritionLabel += 'aria-label="' + $localSettings.textAriaLabelIncreaseQuantityArrow + '" rel="nofollow" tabindex="0"></a>\n';
								localNutritionLabel += globalTab5 + '<a href="' + $localSettings.textAriaLabelDecreaseQuantityArrow + '" class="unitQuantityDown" ';
									localNutritionLabel += 'aria-label="' + $localSettings.textAriaLabelDecreaseQuantityArrow + '" rel="nofollow" tabindex="0"></a>\n';
							localNutritionLabel += globalTab4 + '</div><!-- closing class="setter" -->\n\n';
						} else {
							textboxClass = 'unitQuantityBox arrowsAreHidden';
						}

							localNutritionLabel += globalTab4 + '<input type="text" value="' +
								roundLoDash($localSettings.valueServingUnitQuantity, $localSettings.decimalPlacesForQuantityTextbox) +
								'" class="' + textboxClass + '" aria-label="' + $localSettings.textAriaLabelChangeQuantityTextbox + '">\n';

							localNutritionLabel += globalTab4 + '<input type="hidden" value="' +
								roundLoDash($localSettings.valueServingUnitQuantity, $localSettings.decimalPlacesForQuantityTextbox) +
								'" id="nixLabelBeforeQuantity">\n';

						localNutritionLabel += globalTab3 + '</div><!-- closing class="servingSizeField" -->\n\n';
					} else if ($localSettings.originalServingUnitQuantity > 0 && $localSettings.showServingUnitQuantityTextbox) {
						localNutritionLabel += globalTab3 + '<div class="servingUnitQuantity" itemprop="servingSize">' +
							roundLoDash($localSettings.originalServingUnitQuantity, $localSettings.decimalPlacesForNutrition) +
						'</div>\n';
					}

						localNutritionLabel += globalTab3 + '<div class="servingUnit fl ' + unitAddedClass + '" tabindex="0">' +
							$localSettings.valueServingSizeUnit +
						($localSettings.legacyVersion == 1 ? '</div>\n' : '');

				//end of => if ($localSettings.valueServingSizeUnit !== '' && $localSettings.valueServingSizeUnit !== null)
				} else if ($localSettings.originalServingUnitQuantity > 0 && $localSettings.showServingUnitQuantityTextbox) {
						localNutritionLabel += globalTab3 + '<div class="servingUnitQuantity fl" itemprop="servingSize">' +
							roundLoDash($localSettings.originalServingUnitQuantity, $localSettings.decimalPlacesForNutrition) +
						'</div>\n';
				}

				if ($localSettings.showServingWeightGrams && $localSettings.valueServingWeightGrams > 0) {
						localNutritionLabel += globalTab3 + '<' + ($localSettings.legacyVersion == 1 ? 'div' : 'span') + ' class="servingWeightGrams ' +
							($localSettings.legacyVersion == 1 ? 'fl' : '') + ' ' + gramsAddedClass + '">' +
							'(<span itemprop="servingSize">' +
									roundLoDash($localSettings.valueServingWeightGrams, $localSettings.decimalPlacesForNutrition) +
									$localSettings.unitServingWeight +
								'</span>)\n</' +
						($localSettings.legacyVersion == 1 ? 'div' : 'span') + '>\n';
				}

					localNutritionLabel += globalTab3 + ($localSettings.legacyVersion == 1 ? '' : '</div>\n');

				localNutritionLabel += globalTab2 + '</div><!-- closing class="cf" -->\n\n';
			//end of => if ($localSettings.originalServingUnitQuantity > 0) {
			} else {
				localServingSizeIsHidden = true;
			}

			if ($localSettings.showServingsPerContainer) {
				//Serving per container
				if ($localSettings.valueServingPerContainer > 0) {
					localNutritionLabel += globalTab2 + '<div tabindex="0">' + $localSettings.textServingsPerContainer + ' ' +
						roundLoDash($localSettings.valueServingPerContainer, $localSettings.decimalPlacesForNutrition) +
					'</div>\n';
				} else {
					localServingContainerIsHidden = true;
				}
			} else {
				localServingContainerIsHidden = true;
			}

			localNutritionLabel += globalTab1 + '</div><!-- closing class="serving" -->\n\n';
		}//end of => if ($localSettings.showServingUnitQuantity)

		return {
			servingSizeIsHidden: localServingSizeIsHidden,
			servingContainerIsHidden: localServingContainerIsHidden,
			nutritionLabel: localNutritionLabel
		};
	}//end of => function sevingUnitQuantityHtmlLegacy($localSettings)


	//generate and return the html code for the calorie diets area
	function calorieDietHtmlLegacy($localSettings) {
		let localNutritionLabel = globalTab2 + '<table class="tblCalorieDiet" aria-hidden="true">\n';
			localNutritionLabel += globalTab3 + '<thead>\n';
				localNutritionLabel += globalTab4 + '<tr>\n';
					localNutritionLabel += globalTab5 + '<th>&nbsp;</th>\n';
					localNutritionLabel += globalTab5 + '<th>' + $localSettings.textCalories + '</th>\n';
					localNutritionLabel += globalTab5 + '<th>' + $localSettings.valueCol1CalorieDiet + '</th>\n';
					localNutritionLabel += globalTab5 + '<th>' + $localSettings.valueCol2CalorieDiet + '</th>\n';
				localNutritionLabel += globalTab4 + '</tr>\n';
			localNutritionLabel += globalTab3 + '</thead>\n';
			localNutritionLabel += globalTab3 + '<tbody>\n';
				localNutritionLabel += globalTab4 + '<tr>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.textTotalFat + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.textCalorieDietHtmlLegacyLessThan + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol1DietaryTotalFat + 'g</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol2DietaryTotalFat + 'g</td>\n';
				localNutritionLabel += globalTab4 + '</tr>\n';
				localNutritionLabel += globalTab4 + '<tr>\n';
					localNutritionLabel += globalTab5 + '<td>&nbsp;&nbsp; ' + $localSettings.textSatFat + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.textCalorieDietHtmlLegacyLessThan + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol1DietarySatFat + 'g</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol2DietarySatFat + 'g</td>\n';
				localNutritionLabel += globalTab4 + '</tr>\n';
				localNutritionLabel += globalTab4 + '<tr>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.textCholesterol + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.textCalorieDietHtmlLegacyLessThan + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol1DietaryCholesterol + 'mg</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol2DietaryCholesterol + 'mg</td>\n';
				localNutritionLabel += globalTab4 + '</tr>\n';
				localNutritionLabel += globalTab4 + '<tr>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.textSodium + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.textCalorieDietHtmlLegacyLessThan + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol1DietarySodium + 'mg</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol2DietarySodium + 'mg</td>\n';
				localNutritionLabel += globalTab4 + '</tr>\n';
				localNutritionLabel += globalTab4 + '<tr>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.textPotassium + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.textCalorieDietHtmlLegacyLessThan + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol1DietaryPotassium + 'mg</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol2DietaryPotassium + 'mg</td>\n';
				localNutritionLabel += globalTab4 + '</tr>\n';
				localNutritionLabel += globalTab4 + '<tr>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.textTotalCarb + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>&nbsp;</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol1DietaryTotalCarb + 'g</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol2DietaryTotalCarb + 'g</td>\n';
				localNutritionLabel += globalTab4 + '</tr>\n';
				localNutritionLabel += globalTab4 + '<tr>\n';
					localNutritionLabel += globalTab5 + '<td>&nbsp;&nbsp; ' + $localSettings.textCalorieDietHtmlLegacyDietary + '</td>\n';
					localNutritionLabel += globalTab5 + '<td>&nbsp;</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol1Dietary + 'g</td>\n';
					localNutritionLabel += globalTab5 + '<td>' + $localSettings.valueCol2Dietary + 'g</td>\n';
				localNutritionLabel += globalTab4 + '</tr>\n';
			localNutritionLabel += globalTab3 + '</tbody>\n';
		return localNutritionLabel += globalTab2 + '</table>\n';
	}//end of => function calorieDietHtmlLegacy($localSettings)


	//generate and return the html code for the ingredients area
	function ingredientsHtmlLegacy($localSettings) {
		let localNutritionLabel = '';
		if (!$localSettings.hidePercentDailyValues) {
			localNutritionLabel += globalTab3 + '<br/>\n';
		}

		localNutritionLabel += globalTab3 + '<div class="' + ($localSettings.hidePercentDailyValues ? 'ingredientListDivHiddenDailyValues' : 'ingredientListDiv') + '" tabindex="0">\n';
			localNutritionLabel += globalTab4 + '<strong class="active" id="ingredientList">' + $localSettings.ingredientLabel + '</strong>\n';
			localNutritionLabel += globalTab4 + $localSettings.ingredientList + '\n';
		return localNutritionLabel += globalTab3 + '</div><!-- closing class="ingredientListDiv" -->\n\n';
	}


	//generate and return the html code for the disclaimer area
	function disclaimerHtmlLegacy($localSettings) {
		let localNutritionLabel = globalTab3 + '<br/>\n\n';
		localNutritionLabel += globalTab3 + '<div id="calcDisclaimer">\n';
			localNutritionLabel += globalTab4 + '<span id="calcDisclaimerText" tabindex="0">' + $localSettings.valueDisclaimer + '</span>\n';
		localNutritionLabel += globalTab3 + '</div><!-- closing class="calcDisclaimer" -->\n\n';
		return localNutritionLabel += globalTab3 + '<br/>\n\n';
	}


	//generate and return the html code for the bottom link area
	function bottomLinkHtmlLegacy($localSettings) {
		let localNutritionLabel = globalTab1 + '<div class="spaceAbove"></div>\n';
		localNutritionLabel += globalTab1 + '<a href="' + $localSettings.urlBottomLink + '" target="_newSite" class="homeLinkPrint">' + $localSettings.nameBottomLink + '</a>\n';
		return localNutritionLabel += globalTab1 + '<div class="spaceBelow"></div>\n';
	}


	/*
	 * generate and return the html code for these areas that share similar html format for the legacy version of the label:
	 *    fat calories, calories, trans fat, poly fat, mono fat, sugars, sugar alcohol, proteins, vitamin a, vitamin c, calcium and iron
	 * attributeDisplayType
	 *    1 => <strong> + $localSettings[attributeText] + </strong> <span itemprop=" + itemPropValue + ">
	 *    2 => $localSettings[attributeText] + ' '
	 *    3 => localExtraTab + $localSettings[attributeText] + <span itemprop="transFatContent">;
	 *    4 => globalTab1 + <div class="line indent">;
	 *    5 => a bit special format for vitamin a, vitamin c, calcium and iron
	 */
	function generateAttributeWithoutPercentageHtmlLegacy(
			$localSettings, valueIndex, unitIndex, naIndex, attributeText, localTabValue, lineClass, attributeDisplayType, itemPropValue, localExtraTab, roundFunctionName
	) {
		//initialize the not applicable image icon in case we need to use it
		//attributeDisplayType == 5 => for vitamin a, vitamin c, calcium and iron
		let localNaValue = '<font class="notApplicable" aria-hidden="true">' + $localSettings.textNotApplicable + '&nbsp;</font><font class="sr-only">' +
			$localSettings.textDataNotAvailable + '</font>\n';
		let localNutritionLabel = localTabValue + '<div class="' + lineClass + '" tabindex="0">';

		if (attributeDisplayType == 1) {
			localNutritionLabel += '<strong>' + $localSettings[attributeText] + '</strong> <span itemprop="' + itemPropValue + '">';
		} else if (attributeDisplayType == 2) {
			localNutritionLabel += $localSettings[attributeText] + ' ';
		} else if (attributeDisplayType == 3) {
			localNutritionLabel += localExtraTab + $localSettings[attributeText] + ' <span itemprop="' + itemPropValue + '">';
		} else if (attributeDisplayType == 4) {
			localNutritionLabel += $localSettings[attributeText] + ' <span itemprop="' + itemPropValue + '">';
		} else if (attributeDisplayType == 5) {
			localNutritionLabel += localExtraTab + '<div class="dv">';
		}

		localNutritionLabel += $localSettings[naIndex] ?
			localNaValue :
			(
				$localSettings.allowFDARounding ?
					eval(roundFunctionName)($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition) :
					roundLoDash($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition)
			) + $localSettings[unitIndex];

		if (attributeDisplayType == 1 || attributeDisplayType == 4) {
			localNutritionLabel += '</span></div>\n';
		} else if (attributeDisplayType == 2) {
			localNutritionLabel += '</div>\n';
		} else if (attributeDisplayType == 3) {
			localNutritionLabel += '\n' + localTabValue + '</span></div>\n';
		} else if (attributeDisplayType == 5) {
				localNutritionLabel += '</div>\n';
				localNutritionLabel += localExtraTab + $localSettings[attributeText] + '\n';
			localNutritionLabel += localTabValue + '</div>\n';
		}

		return localNutritionLabel;
	}//end of => function generateAttributeWithoutPercentageHtmlLegacy(**too many parameters**)


	/*
	 * generate and return the html code for these areas that share similar html format: total fat, sat fat, cholesterol, sodium, total carb, fiber and potassium
	 */
	function generateAttributeWithPercentageHtmlLegacy(
			$localSettings, valueIndex, dailyValueIndex, unitIndex, naIndex, attributeTexts, lineClass, itemPropValue, roundFunctionName, roundFunctionRuleName, boldName, showPercentageCode
	) {
		//initialize the not applicable image icon in case we need to use it
		let localNaValue = '<font class="notApplicable" aria-hidden="true">' + $localSettings.textNotApplicable + '&nbsp;</font><font class="sr-only">' +
			$localSettings.textDataNotAvailable + '</font>\n';

		//https://github.com/nutritionix/nutrition-label/wiki/How-the-Percent-Daily-Value-is-Computed
		let localNutritionLabel = globalTab1 + '<div class="' + lineClass + '" tabindex="0">\n';

		if (boldName) {
			localNutritionLabel += globalTab2 + '<strong>' + $localSettings[attributeTexts] + '</strong> <span itemprop="' + itemPropValue + '">';
		} else {
			localNutritionLabel += globalTab2 + $localSettings[attributeTexts] + ' <span itemprop="' + itemPropValue + '">';
		}

		localNutritionLabel += (
			$localSettings[naIndex] ?
				localNaValue :
				(
					$localSettings.allowFDARounding ?
						eval(roundFunctionName)($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition) :
						roundLoDash($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition)
				) + $localSettings[unitIndex]
		) + '\n';

		if (!$localSettings['hidePercentDailyValues'] && showPercentageCode) {
			localNutritionLabel += globalTab2 + '<div class="dv">';
				localNutritionLabel += $localSettings[naIndex] ?
					localNaValue :
					'<strong>' +
						roundLoDash(
							(
								(
									$localSettings.allowFDARounding ? eval(roundFunctionRuleName)($localSettings[valueIndex]) : $localSettings[valueIndex]
								) / (
									$localSettings[dailyValueIndex] == 0 ? 1 : $localSettings[dailyValueIndex] * roundLoDash(parseFloat($localSettings.calorieIntake) / 2000, 2) //the 2nd part is the calorie intake
								)
							) * 100,
							$localSettings.decimalPlacesForDailyValues
						) +
					'</strong>% <span class="sr-only">' + $localSettings.textDailyValues + '</span>';
			localNutritionLabel += '</div>\n';
		}

		return localNutritionLabel += globalTab1 + '</span></div>\n';
	}//end of => function generateAttributeWithPercentageHtmlLegacy(**too many parameters**)


	/*
	 * generate and return the html code for these areas that share similar html format for the 2018 version of the label:
	 *    calories, total fat, saturated fat, trans fat, poly fat, mono fat, cholesterol, sodium, total carb, fibers, sugars, added sugar, sugar alcohol, proteins
	 */
	function generateAttributeHtml2018Version(
			$localSettings, valueIndex, unitIndex, naIndex, attributeText, itemPropValue, topDivClass, showPercentageCode, roundFunctionName, roundFunctionRuleName, labelClass, valueClass, dailyValueIndex
	) {
		//initialize the not applicable image icon in case we need to use it
		let localNaValue = '<font class="notApplicable" aria-hidden="true">' + $localSettings.textNotApplicable + '&nbsp;</font><font class="sr-only">' +
			$localSettings.textDataNotAvailable + '</font>\n';
		let localNutritionLabel = globalTab1 + '<div class="' + topDivClass + '" tabindex="0">\n';

		//this is for everything else
		if (valueIndex != 'valueAddedSugars') {
			localNutritionLabel += globalTab2 + '<span class="' + labelClass + '">';
				localNutritionLabel += $localSettings[attributeText];
			localNutritionLabel += '</span>\n';

			localNutritionLabel += globalTab2 + '<span class="' + valueClass + '" itemprop="' + itemPropValue + '">';
				localNutritionLabel += $localSettings[naIndex] ?
					localNaValue :
					(
						$localSettings.allowFDARounding ?
							eval(roundFunctionName)($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition) :
							roundLoDash($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition)
					) + $localSettings[unitIndex];
			localNutritionLabel += '</span>\n';
		//special case for added sugars
		} else {
			localNutritionLabel += globalTab2 + '<span class="' + labelClass + '">\n';
				localNutritionLabel += $localSettings['textAddedSugars1'] + '\n';
				localNutritionLabel += globalTab3 + '<span class="' + valueClass + '" itemprop="' + itemPropValue + '">';
					localNutritionLabel += $localSettings[naIndex] ?
						localNaValue :
						(
							$localSettings.allowFDARounding ?
								eval(roundFunctionName)($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition) :
								roundLoDash($localSettings[valueIndex], $localSettings.decimalPlacesForNutrition)
						) + $localSettings[unitIndex];
				localNutritionLabel += '</span>\n';
				localNutritionLabel += $localSettings['textAddedSugars2'];
			localNutritionLabel += '</span>\n';
		}

		if (showPercentageCode && !$localSettings['hidePercentDailyValues']) {
				localNutritionLabel += globalTab2 + '<span class="nf-highlight nf-pr">';

				if ( $.inArray(unitIndex, ["unitVitaminD_base", "unitCalcium_base", "unitIron_base", "unitPotassium_base"]) !== -1) {
					//for the vitamins and minerals for 2018 value when the base value is given and the %DV is computed
					let dvDivisor = $localSettings[dailyValueIndex] == 0 ? 1 : $localSettings[dailyValueIndex] * roundLoDash(parseFloat($localSettings.calorieIntake) / 2000, 2);
					let computedPercentDVValue = ( ($localSettings.allowFDARounding ? eval(roundFunctionRuleName)($localSettings[valueIndex]) : $localSettings[valueIndex]) / dvDivisor ) * 100;

					localNutritionLabel += $localSettings[naIndex] ?
						localNaValue :
						!$localSettings.allowFDARounding ?
							roundLoDash(computedPercentDVValue, $localSettings.decimalPlacesForDailyValues) :
							roundVitaminsCalciumIron( ($localSettings[valueIndex] / dvDivisor) * 100 );
				} else {
					//https://github.com/nutritionix/nutrition-label/wiki/How-the-Percent-Daily-Value-is-Computed
					localNutritionLabel += $localSettings[naIndex] ?
						localNaValue :
						roundLoDash(
							(
								(
									$localSettings.allowFDARounding ? eval(roundFunctionRuleName)($localSettings[valueIndex]) : $localSettings[valueIndex]
								) / (
									$localSettings[dailyValueIndex] == 0 ? 1 : $localSettings[dailyValueIndex] * roundLoDash(parseFloat($localSettings.calorieIntake) / 2000, 2)
								)
							) * 100,
							$localSettings.decimalPlacesForDailyValues
						);
				}

					localNutritionLabel += '% <span class="sr-only">' + $localSettings.textDailyValues + '</span>'
				localNutritionLabel += '</span>\n';
		}

		return localNutritionLabel += globalTab1 + '</div>\n';
	}//end of => function generateAttributeHtml2018Version(**too many parameters**)


	//generate and return the html code for the ingredients area
	function ingredientsHtml2018Version($localSettings) {
		let localNutritionLabel = '';
		if (!$localSettings.hidePercentDailyValues) {
			localNutritionLabel += globalTab3 + '<br/>\n\n';
		}

		localNutritionLabel += globalTab3 + '<div class="' + ($localSettings.hidePercentDailyValues ? 'nf-ingredientListDivHiddenDailyValues' : 'nf-ingredientListDiv') + '" tabindex="0">\n';
			localNutritionLabel += globalTab4 + '<strong class="active" id="nf-ingredientList">' + $localSettings.ingredientLabel + '</strong>\n';
			localNutritionLabel += globalTab4 + $localSettings.ingredientList + '\n';
		return localNutritionLabel += globalTab3 + '</div><!-- closing class="nf-ingredientListDiv" -->\n\n';
	}


	//generate and return the html code for the disclaimer area
	function disclaimerHtml2018Version($localSettings) {
		let localNutritionLabel = globalTab3 + '<br/>\n\n';
		localNutritionLabel += globalTab3 + '<div id="nf-calcDisclaimer">\n';
			localNutritionLabel += globalTab4 + '<span id="nf-calcDisclaimerText" tabindex="0">' + $localSettings.valueDisclaimer + '</span>\n';
		localNutritionLabel += globalTab3 + '</div><!-- closing class="nf-calcDisclaimer" -->\n\n';
		return localNutritionLabel += globalTab3 + '<br/>\n\n';
	}


	//generate and return the html code for the bottom link area
	function bottomLinkHtml2018Version($localSettings) {
		let localNutritionLabel = globalTab1 + '<div class="nf-spaceAbove"></div>\n';
		localNutritionLabel += globalTab1 + '<a href="' + $localSettings.urlBottomLink + '" target="_newSite" class="nf-homeLinkPrint">' + $localSettings.nameBottomLink + '</a>\n';
		return localNutritionLabel += globalTab1 + '<div class="nf-spaceBelow"></div>\n';
	}


	/*
	 * generate and return the html code for these areas that share similar html format: vitamin d, calcium, iron and potassium
	 */
	function generate2018HtmlAndComputeValueGivenThePercentage(
			$localSettings, valueIndex, dailyValueIndex, unitIndex_base, unitIndex_percent, naIndex, attributeTexts, showPercentageCode, lastRow
	) {
		//initialize the not applicable image icon in case we need to use it
		let localNaValue = '<font class="notApplicable" aria-hidden="true">' + $localSettings.textNotApplicable + '&nbsp;</font><font class="sr-only">' +
			$localSettings.textDataNotAvailable + '</font>\n';
		let localNutritionLabel = '<div class="nf-vitamin-column' + (lastRow ? ' nf-vitamin-column-last' : '') + '" tabindex="0">\n';
			localNutritionLabel += $localSettings[attributeTexts] + ' ';
			localNutritionLabel += (
				$localSettings[naIndex] ?
					localNaValue :
					(
						roundLoDash(
							//percentage / 100 * daily value
							($localSettings[valueIndex] / 100) * $localSettings[dailyValueIndex],
							$localSettings.decimalPlacesForDailyValues
						) +
						$localSettings[unitIndex_base] +
						(
							showPercentageCode ?
								' <span class="nf-pr">' +
									roundLoDash($localSettings[valueIndex], $localSettings.decimalPlacesForDailyValues) + $localSettings[unitIndex_percent] +
								'</span>' :
								''
						)
					)
			) + '\n';
		return localNutritionLabel += '</div>\n';
	}


	//generate and return the html code for the item area
	function itemNameHtml2018($localSettings) {
		let itemNameClass = '';
		let localNutritionLabel = '';

		if ($localSettings.showServingUnitQuantityTextbox) {
			if (
					($localSettings.valueServingSizeUnit === null || $localSettings.valueServingSizeUnit == '') ||
					(
						$localSettings.valueServingSizeUnit !== '' &&
						$localSettings.valueServingSizeUnit !== null &&
						$localSettings.originalServingUnitQuantity <= 0
					)
			) {
				let hideArrowsClass = '';
				let textboxClass = 'nf-unitQuantityBox nf-modifier-field';
				if (!$localSettings.hideTextboxArrows) {
					localNutritionLabel += globalTab3 + '<div class="nf-arrows">\n';
						localNutritionLabel += globalTab4 + '<div class="nf-unitQuantityUp nf-arrow-up" aria-label="' + $localSettings.textAriaLabelIncreaseQuantityArrow + '" ';
							localNutritionLabel += 'rel="nofollow" tabindex="0"></div>\n';
						localNutritionLabel += globalTab4 + '<div class="nf-unitQuantityDown nf-arrow-down" aria-label="' + $localSettings.textAriaLabelDecreaseQuantityArrow + '" ';
							localNutritionLabel += 'rel="nofollow" tabindex="0"></div>\n';
					localNutritionLabel += globalTab3 + '</div><!-- closing class="nf-arrows v1" -->\n\n';
				} else {
					textboxClass = 'nf-unitQuantityBox nf-modifier-field nf-arrowsAreHidden';
					hideArrowsClass = 'nf-fixed-serving ';
				}

					localNutritionLabel += globalTab3 + '<input type="text" value="' +
						roundLoDash($localSettings.valueServingUnitQuantity, $localSettings.decimalPlacesForQuantityTextbox) +
						'" class="' + textboxClass + '" data-role="none" aria-label="' + $localSettings.textAriaLabelChangeQuantityTextbox + '">\n';

					localNutritionLabel += globalTab3 + '<input type="hidden" value="' +
						roundLoDash($localSettings.valueServingUnitQuantity, $localSettings.decimalPlacesForQuantityTextbox) +
						'" id="nf-nixLabelBeforeQuantity">\n\n';

				itemNameClass = hideArrowsClass;
			} else if (!$localSettings.showServingUnitQuantity) {
				itemNameClass += 'no-indent';
			}
		//end of => if ($localSettings.showServingUnitQuantityTextbox)
		} else {
			itemNameClass += 'no-indent';
		}

		localNutritionLabel += globalTab3 + '<div class="nf-serving-unit-name ' + itemNameClass + '" tabindex="0">\n';

			if (
					$localSettings.showServingUnitQuantity &&
					$localSettings.originalServingUnitQuantity > 0 &&
					$localSettings.valueServingSizeUnit !== '' &&
					$localSettings.valueServingSizeUnit !== null
			) {
				localNutritionLabel += globalTab4 + $localSettings.valueServingSizeUnit + '\n';

				if ($localSettings.showServingWeightGrams && $localSettings.valueServingWeightGrams > 0) {
					localNutritionLabel += globalTab4 + '(<span itemprop="servingSize">' +
						roundLoDash($localSettings.valueServingWeightGrams, $localSettings.decimalPlacesForNutrition) +
						$localSettings.unitServingWeight +
					'</span>)\n';
				}
			}

			localNutritionLabel += globalTab4 + '<div class="nf-item-name block">\n';
				localNutritionLabel += globalTab5 + $localSettings.itemName + '\n';
				if ($localSettings.showBrandName && $localSettings.brandName !== null && $localSettings.brandName != '') {
					localNutritionLabel += ' - ' + $localSettings.brandName;
				}
			localNutritionLabel += '\n' + globalTab4 + '</div>\n';
		return localNutritionLabel += globalTab3 + '</div>\n';
	}//end of => function itemNameHtml2018($localSettings)


	//generate and return the html code for the serving unit quantity area
	function sevingUnitQuantityHtml2018($localSettings) {
		let localServingSizeIsHidden = false;
		let localServingContainerIsHidden = false;
		let localNutritionLabel = '';

		if ($localSettings.showServingUnitQuantity) {
			if ($localSettings.originalServingUnitQuantity > 0) {
				let servingSizeDivAlreadyClosed = false;

				localNutritionLabel += globalTab3 + '<div tabIndex="0"><!-- opening for serving size div -->\n';
					localNutritionLabel += globalTab4 + $localSettings.textServingSize;

				localNutritionLabel += $localSettings.showServingUnitQuantityTextbox ?
						'' :
						' <span itemprop="servingSize">' +
							roundLoDash($localSettings.originalServingUnitQuantity, $localSettings.decimalPlacesForNutrition) +
						' </span>\n';

				if ($localSettings.valueServingSizeUnit !== '' && $localSettings.valueServingSizeUnit !== null) {
					if (
							$localSettings.showServingUnitQuantityTextbox &&
							$localSettings.valueServingSizeUnit !== null &&
							$localSettings.valueServingSizeUnit != ''
					) {
						let textboxClass = 'nf-unitQuantityBox nf-modifier-field';

						//close the serving size div
						//this is needed so cases like this will be shown properly
						servingSizeDivAlreadyClosed = true;
						localNutritionLabel += '\n' + globalTab3 + '</div><!-- closing for serving size div -->\n\n';

						if (!$localSettings.hideTextboxArrows) {
							localNutritionLabel += globalTab5 + '<div class="nf-arrows"><!-- opening class="nf-arrows" -->\n';
								localNutritionLabel += globalTab6 + '<div class="nf-unitQuantityUp nf-arrow-up" aria-label="' + $localSettings.textAriaLabelIncreaseQuantityArrow + '" ';
									localNutritionLabel += 'rel="nofollow" tabindex="0"></div>\n';
								localNutritionLabel += globalTab6 + '<div class="nf-unitQuantityDown nf-arrow-down" aria-label="' + $localSettings.textAriaLabelDecreaseQuantityArrow + '" ';
									localNutritionLabel += 'rel="nofollow" tabindex="0"></div>\n';
							localNutritionLabel += globalTab5 + '</div><!-- closing class="nf-arrows v2" -->\n\n';
						} else {
							textboxClass = 'nf-unitQuantityBox nf-modifier-field nf-arrowsAreHidden';
						}

							localNutritionLabel += globalTab5 + '<input type="text" data-role="none" value="' +
								roundLoDash($localSettings.valueServingUnitQuantity, $localSettings.decimalPlacesForQuantityTextbox) +
								'" class="' + textboxClass + '" aria-label="' + $localSettings.textAriaLabelChangeQuantityTextbox + '">\n';

							localNutritionLabel += globalTab5 + '<input type="hidden" value="' +
								roundLoDash($localSettings.valueServingUnitQuantity, $localSettings.decimalPlacesForQuantityTextbox) +
								'" id="nf-nixLabelBeforeQuantity">\n\n';
					} else if ($localSettings.originalServingUnitQuantity > 0 && $localSettings.showServingUnitQuantityTextbox) {
							localNutritionLabel += ' <span itemprop="servingSize">' +
								roundLoDash($localSettings.originalServingUnitQuantity, $localSettings.decimalPlacesForNutrition) +
							'</span>\n';
					}

					if (!$localSettings.showItemName) {
						localNutritionLabel += globalTab5 + '<div class="nf-serving-unit-name" tabindex="0">\n';
							localNutritionLabel += globalTab6 + $localSettings.valueServingSizeUnit + '\n';

						if ($localSettings.showServingWeightGrams && $localSettings.valueServingWeightGrams > 0) {
							localNutritionLabel += globalTab6 + '(' +
								roundLoDash($localSettings.valueServingWeightGrams, $localSettings.decimalPlacesForNutrition) +
								$localSettings.unitServingWeight +
							')\n';
						}

						localNutritionLabel += globalTab5 + '</div>\n';
					}
				//end of => if ($localSettings.valueServingSizeUnit !== '' && $localSettings.valueServingSizeUnit !== null)
				} else if ($localSettings.originalServingUnitQuantity > 0 && $localSettings.showServingUnitQuantityTextbox) {
						localNutritionLabel += ' <span itemprop="servingSize">' +
							roundLoDash($localSettings.originalServingUnitQuantity, $localSettings.decimalPlacesForNutrition) +
						'</span>\n';

					if (($localSettings.valueServingSizeUnit == '' || $localSettings.valueServingSizeUnit === null) && $localSettings.showServingWeightGrams && $localSettings.valueServingWeightGrams > 0) {
						localNutritionLabel += globalTab4 + '(' +
							roundLoDash($localSettings.valueServingWeightGrams, $localSettings.decimalPlacesForNutrition) +
							$localSettings.unitServingWeight +
						')\n';
					}
				}

				if (!servingSizeDivAlreadyClosed) {
					localNutritionLabel += globalTab3 + '</div><!-- closing for serving size div -->\n\n';
				}
			//end of => if ($localSettings.originalServingUnitQuantity > 0)
			} else {
				localServingSizeIsHidden = true;
			}
		//end of => if ($localSettings.showServingUnitQuantity)
		} else if (!$localSettings.showServingUnitQuantity && $localSettings.showOnlyTheTextServingSize) {
				localNutritionLabel += globalTab3 + '<div tabIndex="0" class="nf-line">\n';
					localNutritionLabel += globalTab4 + $localSettings.textServingSize;
				localNutritionLabel += globalTab3 + '</div>\n\n';
		}

		return {
			servingSizeIsHidden: localServingSizeIsHidden,
			servingContainerIsHidden: localServingContainerIsHidden,
			nutritionLabel: localNutritionLabel
		};
	}//end of => function sevingUnitQuantityHtml2018($localSettings)


	/*
	 * generate and return the html code for these areas that share similar html format: total fat, sat fat, cholesterol, sodium, total carb, fiber and potassium
	 */
	function generateAttributeForUK(
			$localSettings, valueIndex, dailyValueIndex, unitIndex, naIndex, attributeTexts, itemPropValue, roundFunctionName, roundFunctionRuleName, showPercentageCode, indentedName
	) {
		//initialize the not applicable image icon in case we need to use it
		let localNaValue = '<font class="notApplicable" aria-hidden="true">' + $localSettings.textNotApplicable + '&nbsp;</font><font class="sr-only">' +
			$localSettings.textDataNotAvailable + '</font>\n';
		let localNutritionLabel = globalTab2 + '<tr tabindex="0">\n';
		let nameClass = '';
		let nutritionValueLocal = $localSettings[valueIndex];

			if (indentedName) {
				nameClass = 'uk_nf-indent';
			}

			//value on the name column
			localNutritionLabel += globalTab3 + '<td class="' + nameClass + '">';
			if (String(attributeTexts) != '') {
				localNutritionLabel += $localSettings[attributeTexts];
			}
			localNutritionLabel += '</td>\n';


			if (valueIndex == 'valueCalories' && unitIndex == 'unitEnergy_kj') {
				nutritionValueLocal *= 4.184;
			} else if (valueIndex == 'valueSodium') {
				nutritionValueLocal *= 0.0025;
			}

			//value on the second column (per 100 gram column)
			localNutritionLabel += globalTab3 + '<td>';
			localNutritionLabel += (
				$localSettings[naIndex] ?
					localNaValue :
					(
						$localSettings.allowFDARounding ?
							(
								valueIndex == 'valueCalories' ?
									eval(roundFunctionName)(nutritionValueLocal / $localSettings.valueServingWeightGrams * 100, 1) :
									eval(roundFunctionName)(nutritionValueLocal / $localSettings.valueServingWeightGrams * 100)
							) :
							roundLoDash((nutritionValueLocal / $localSettings.valueServingWeightGrams * 100), $localSettings.decimalPlacesForNutrition)
					) + $localSettings[unitIndex]
			);
			localNutritionLabel += '</td>\n';

			//value on the third column (actual value of the nutrition)
			localNutritionLabel += globalTab3 + '<td itemprop="' + itemPropValue + '">';
			localNutritionLabel += (
				$localSettings[naIndex] ?
					localNaValue :
					(
						$localSettings.allowFDARounding ?
							(
								valueIndex == 'valueCalories' ?
									eval(roundFunctionName)(nutritionValueLocal, 1) :
									eval(roundFunctionName)(nutritionValueLocal)
							) :
							roundLoDash(nutritionValueLocal, $localSettings.decimalPlacesForNutrition)
					) + $localSettings[unitIndex]
			);
			localNutritionLabel += '</td>\n';

			//value on the percentage column (4th)
			localNutritionLabel += globalTab3 + '<td aria-hidden="true">';

			if (!$localSettings['hidePercentDailyValues'] && showPercentageCode) {
				//https://github.com/nutritionix/nutrition-label/wiki/How-the-Percent-Daily-Value-is-Computed
				localNutritionLabel += $localSettings[naIndex] ?
					localNaValue :
					roundLoDash(
						(
							(
								$localSettings.allowFDARounding ?
									(
										valueIndex == 'valueCalories' ?
											eval(roundFunctionRuleName)(nutritionValueLocal, 1) :
											eval(roundFunctionRuleName)(nutritionValueLocal)
									) :
									nutritionValueLocal
							) / (
								$localSettings[dailyValueIndex] == 0 ?
									1 :
									$localSettings[dailyValueIndex] * roundLoDash( (parseFloat($localSettings.calorieIntake) / 2000), 2 ) //the 2nd part is the calorie intake
							)
						) * 100,
						$localSettings.decimalPlacesForDailyValues
					) + '%';
			}

		return localNutritionLabel + '</td>\n' + globalTab2 + '</tr>\n';
	}//end of => function generateAttributeForUK(**too many parameters**)


	//generate and return the html code for the reference intake area
	function referenceIntakeHtmlUKVersion($localSettings) {
		let localNutritionLabel = globalTab6 + '<div class="referenceIntake" tabindex="0">\n';
			localNutritionLabel += globalTab7 + '* ' + $localSettings.textUKReferenceIntake + ' ';
			//the kj value on the reference intake is rounded to the nearest hundred
			localNutritionLabel += '(' + roundToNearestNum($localSettings.calorieIntake * 4.184, 100) + $localSettings.unitEnergy_kj;
				localNutritionLabel += '/' + $localSettings.calorieIntake + $localSettings.unitEnergy_kcal + ')\n';
		return localNutritionLabel += globalTab6 + '</div>\n<div class="uk_nf-spaceBelow"></div>\n';
	}


	//generate and return the html code for the ingredients area
	function ingredientsHtmlUKVersion($localSettings) {
		let localNutritionLabel = globalTab6 + '<div class="uk_nf-ingredientListDiv" tabindex="0">\n';
			localNutritionLabel += globalTab7 + '<strong class="active" id="uk_nf-ingredient-statement">' + $localSettings.ingredientLabel + '</strong> ' + $localSettings.ingredientList + '\n';
		return localNutritionLabel += globalTab6 + '</div><br/><!-- closing class="uk_nf-ingredientListDiv" -->\n\n';
	}


	//generate and return the html code for the disclaimer area
	function disclaimerHtmlUKVersion($localSettings) {
		let localNutritionLabel = globalTab6 + '<div id="uk_nf-calcDisclaimer">\n';
			localNutritionLabel += globalTab7 + '<span id="uk_nf-disclaimer" tabindex="0">' + $localSettings.valueDisclaimer + '</span>\n';
		return localNutritionLabel += globalTab6 + '</div><br/><!-- closing id="uk_nf-calcDisclaimer" -->\n\n';
	}


	//generate and return the html code for the bottom link area
	function bottomLinkHtmlUKVersion($localSettings) {
		let localNutritionLabel = globalTab6 + '<div class="uk_nf-spaceAbove"></div>\n';
		localNutritionLabel += globalTab6 + '<a href="' + $localSettings.urlBottomLink + '" target="_newSite" class="uk_nf-homeLinkPrint">' + $localSettings.nameBottomLink + '</a>\n';
		return localNutritionLabel += globalTab6 + '<div class="uk_nf-spaceBelow"></div>\n';
	}


	//based on https://github.com/lodash/lodash/blob/master/.internal/createRound.js
	/**
	 * Creates a function like `round`.
	 *
	 * @private
	 * @param {string} methodName The name of the `Math` method to use when rounding.
	 * @returns {Function} Returns the new round function.
	 */
	function createRound(methodName) {
		const func = Math[methodName];
		return (number, precision) => {
			precision = precision === null ? 0 : ( precision >= 0 ? Math.min(precision, 292) : Math.max(precision, -292) );
			if (precision) {
				// Shift with exponential notation to avoid floating-point issues.
				// See [MDN](https://mdn.io/round#Examples) for more details.
				let pair = `${number}e`.split('e');
				const value = func(`${pair[0]}e${+pair[1] + precision}`);

				pair = `${value}e`.split('e');
				return +`${pair[0]}e${+pair[1] - precision}`;
			}

			return func(number);
		}
	}


	//based on https://github.com/lodash/lodash/blob/master/round.js
	/**
	 * Computes `number` rounded to `precision`.
	 *
	 * @since 3.10.0
	 * @category Math
	 * @param {number} number The number to round.
	 * @param {number} [precision=0] The precision to round to.
	 * @returns {number} Returns the rounded number.
	 * @example
	 *
	 * round(4.006)
	 * // => 4
	 *
	 * round(4.006, 2)
	 * // => 4.01
	 *
	 * round(4060, -2)
	 * // => 4100
	 */
	const roundLoDash = createRound('round');


	NutritionLabel.prototype = {
		generateLegacy: function() {
			//this is the function that returns the html code for the nutrition label based on the settings that is supplied by the user
			let $this = this;
			let borderCSS = '';
			let nutritionLabel = '';
			let sevingUnitQuantityHtmlLegacyResult = sevingUnitQuantityHtmlLegacy($this.settings);
			let servingSizeIsHidden = sevingUnitQuantityHtmlLegacyResult.servingSizeIsHidden;
			let servingContainerIsHidden = sevingUnitQuantityHtmlLegacyResult.servingContainerIsHidden;
			let useLine = 'addedPadding';
			let useLineAgain = 'addedPadding';

			//return the plugin incase it has already been created
			if ($this.nutritionLabel) {
				return $this.nutritionLabel;
			}

			if ($this.settings.hideNotApplicableValues) {
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
				$this.settings.showSugarAlcohol = $this.settings.naSugarAlcohol ? false : $this.settings.showSugarAlcohol;
				$this.settings.showProteins = $this.settings.naProteins ? false : $this.settings.showProteins;
				$this.settings.showVitaminA = $this.settings.naVitaminA ? false : $this.settings.showVitaminA;
				$this.settings.showVitaminC = $this.settings.naVitaminC ? false : $this.settings.showVitaminC;
				$this.settings.showCalcium = $this.settings.naCalcium ? false : $this.settings.showCalcium;
				$this.settings.showIron = $this.settings.naIron ? false : $this.settings.showIron;
			}

			if ($this.settings.hidePercentDailyValues) {
				$this.settings.showVitaminA = false;
				$this.settings.showVitaminC = false;
				$this.settings.showCalcium = false;
				$this.settings.showIron = false;
			}

			if ($this.settings.allowNoBorder) {
				borderCSS = 'border: 0;';
			}

			//creates the html code for the label based on the settings
			nutritionLabel = '<div itemscope itemtype="http://schema.org/NutritionInformation" class="nutritionLabel" role="region" aria-label="nutrition label" style="' + borderCSS;
			if (!$this.settings.allowCustomWidth) {
				nutritionLabel += ' width: ' + $this.settings.width + 'px;">\n';
			} else {
				nutritionLabel += ' width: ' + $this.settings.widthCustom + ';">\n';
			}

			nutritionLabel += globalTab1 + '<div class="title" tabindex="0">' + $this.settings.textNutritionFacts + '</div>\n';

			if ($this.settings.showItemName) {
				nutritionLabel += itemNameHtmlLegacy($this.settings);
			}

			nutritionLabel += sevingUnitQuantityHtmlLegacyResult.nutritionLabel;

			if (
					(!$this.settings.showItemName && !$this.settings.showServingUnitQuantity) ||
					(!$this.settings.showItemName && servingSizeIsHidden && servingContainerIsHidden)
			) {
				nutritionLabel += globalTab1 + '<div class="headerSpacer"></div>\n';
			}

				nutritionLabel += globalTab1 + '<div class="bar1"></div>\n';

			if ($this.settings.showAmountPerServing) {
				nutritionLabel += globalTab1 + '<div class="addedPadding m" tabindex="0">';
					nutritionLabel += '<strong>' + $this.settings.textAmountPerServing + '</strong>';
				nutritionLabel += '</div>\n';
			}

				nutritionLabel += globalTab1 + '<div class="' + ($this.settings.showAmountPerServing ? 'line' : 'addedPadding') + ' cf">\n';

				if ($this.settings.showCalories) {
					nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
						//$localSettings valueIndex       unitIndex       naIndex       attributeText  localTabValue lineClass attributeDisplayType itemPropValue localExtraTab roundFunctionName
						$this.settings, 'valueCalories', 'unitCalories', 'naCalories', 'textCalories', globalTab2,   'fl',       1,                  'calories',    '',          'roundCalories'
					);
				} else if ($this.settings.showFatCalories) {
					nutritionLabel += globalTab2 + '<div>&nbsp;</div>\n';
				}

				if ($this.settings.showFatCalories) {
					nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
						//$localSettings valueIndex          unitIndex          naIndex          attributeText     localTabValue lineClass attributeDisplayType itemPropValue localExtraTab roundFunctionName
						$this.settings, 'valueFatCalories', 'unitFatCalories', 'naFatCalories', 'textFatCalories', globalTab2,  'ar',      2,                   '',           '',          'roundCalories'
					);
				}

				nutritionLabel += globalTab1 + '</div>\n';
				nutritionLabel += globalTab1 + '<div class="bar2"></div>\n';

			if (!$this.settings.hidePercentDailyValues) {
				useLine = 'line';
				nutritionLabel += globalTab1 + '<div class="addedPadding ar">';
					nutritionLabel += '<strong>% ' + $this.settings.textDailyValues + '<sup>*</sup></strong>';
				nutritionLabel += '</div>\n';
			}

			if ($this.settings.showTotalFat) {
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting  valueIndex       dailyValueIndex       unitIndex       naIndex       attributeTexts  lineClass itemPropValue roundFunctionName roundFunctionRuleName boldName showPercentageCode
					$this.settings, 'valueTotalFat', 'dailyValueTotalFat', 'unitTotalFat', 'naTotalFat', 'textTotalFat',  useLine, 'fatContent', 'roundFat',       'roundFatRule',        true,    $this.settings.showDailyTotalFat
				);
				useLine = 'line';
			}

			if ($this.settings.showSatFat) {
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting  valueIndex     dailyValueIndex     unitIndex     naIndex     attributeTexts lineClass             itemPropValue          roundFunctionName roundFunctionRuleName boldName showPercentageCode
					$this.settings, 'valueSatFat', 'dailyValueSatFat', 'unitSatFat', 'naSatFat', 'textSatFat',   useLine + ' indent', 'saturatedFatContent', 'roundFat',       'roundFatRule',        false,   $this.settings.showDailySatFat
				);
				useLine = 'line';
			}

			if ($this.settings.showTransFat) {
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings valueIndex       unitIndex       naIndex       attributeText  localTabValue lineClass            attributeDisplayType itemPropValue     localExtraTab roundFunctionName
					$this.settings, 'valueTransFat', 'unitTransFat', 'naTransFat', 'textTransFat', globalTab1,   useLine + ' indent', 3,                  'transFatContent', globalTab2,  'roundFat'
				);
				useLine = 'line';
			}

			if ($this.settings.showPolyFat) {
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings valueIndex      unitIndex      naIndex      attributeText localTabValue lineClass            attributeDisplayType itemPropValue localExtraTab roundFunctionName
					$this.settings, 'valuePolyFat', 'unitPolyFat', 'naPolyFat', 'textPolyFat', globalTab1,   useLine + ' indent', 2,                   '',           '',          'roundFat'
				);
				useLine = 'line';
			}

			if ($this.settings.showMonoFat) {
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings valueIndex      unitIndex      naIndex      attributeText localTabValue lineClass            attributeDisplayType itemPropValue localExtraTab roundFunctionName
					$this.settings, 'valueMonoFat', 'unitMonoFat', 'naMonoFat', 'textMonoFat', globalTab1,   useLine + ' indent', 2,                   '',           '',          'roundFat'
				);
				useLine = 'line';
			}

			if ($this.settings.showCholesterol) {
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting  valueIndex          dailyValueIndex          unitIndex          naIndex          attributeTexts    lineClass itemPropValue         roundFunctionName   roundFunctionRuleName  boldName showPercentageCode
					$this.settings, 'valueCholesterol', 'dailyValueCholesterol', 'unitCholesterol', 'naCholesterol', 'textCholesterol', useLine, 'cholesterolContent', 'roundCholesterol', 'roundCholesterolRule', true,    $this.settings.showDailyCholesterol
				);
				useLine = 'line';
			}

			if ($this.settings.showSodium) {
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting  valueIndex     dailyValueIndex     unitIndex     naIndex     attributeTexts lineClass itemPropValue    roundFunctionName roundFunctionRuleName boldName showPercentageCode
					$this.settings, 'valueSodium', 'dailyValueSodium', 'unitSodium', 'naSodium', 'textSodium',   useLine, 'sodiumContent', 'roundSodium',    'roundSodiumRule',     true,    $this.settings.showDailySodium
				);
				useLine = 'line';
			}

			if ($this.settings.showPotassium) {
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting  valueIndex        dailyValueIndex        unitIndex        naIndex        attributeTexts  lineClass itemPropValue       roundFunctionName roundFunctionRuleName boldName showPercentageCode
					$this.settings, 'valuePotassium', 'dailyValuePotassium', 'unitPotassium', 'naPotassium', 'textPotassium', useLine, 'potassiumContent', 'roundPotassium', 'roundPotassiumRule',  true,    $this.settings.showDailyPotassium
				);
				useLine = 'line';
			}

			if ($this.settings.showTotalCarb) {
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting  valueIndex        dailyValueIndex   unitIndex        naIndex        attributeTexts  lineClass itemPropValue          roundFunctionName             roundFunctionRuleName            boldName showPercentageCode
					$this.settings, 'valueTotalCarb', 'dailyValueCarb', 'unitTotalCarb', 'naTotalCarb', 'textTotalCarb', useLine, 'carbohydrateContent', 'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', true,    $this.settings.showDailyTotalCarb
				);
				useLine = 'line';
			}

			if ($this.settings.showFibers) {
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting  valueIndex     dailyValueIndex    unitIndex     naIndex     attributeTexts lineClass             itemPropValue   roundFunctionName             roundFunctionRuleName            boldName showPercentageCode
					$this.settings, 'valueFibers', 'dailyValueFiber', 'unitFibers', 'naFibers', 'textFibers',   useLine + ' indent', 'fiberContent', 'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', false,   $this.settings.showDailyFibers
				);
				useLine = 'line';
			}

			if ($this.settings.showSugars) {
				nutritionLabel += generateAttributeWithPercentageHtmlLegacy(
					//$localSetting  valueIndex     dailyValueIndex    unitIndex     naIndex     attributeTexts lineClass             itemPropValue   roundFunctionName             roundFunctionRuleName            boldName showPercentageCode
					$this.settings, 'valueSugars', 'dailyValueSugar', 'unitSugars', 'naSugars', 'textSugars',   useLine + ' indent', 'sugarContent', 'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', false,   $this.settings.showDailySugars
				);
				useLine = 'line';
			}

			if ($this.settings.showSugarAlcohol) {
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings valueIndex           unitIndex           naIndex           attributeText      localTabValue lineClass            attributeDisplayType itemPropValue localExtraTab roundFunctionName
					$this.settings, 'valueSugarAlcohol', 'unitSugarAlcohol', 'naSugarAlcohol', 'textSugarAlcohol', globalTab1,   useLine + ' indent', 4,                   '',            '',          'roundCarbFiberSugarProtein'
				);
				useLine = 'line';
			}

			if ($this.settings.showProteins) {
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings valueIndex       unitIndex       naIndex       attributeText  localTabValue lineClass attributeDisplayType itemPropValue    localExtraTab roundFunctionName
					$this.settings, 'valueProteins', 'unitProteins', 'naProteins', 'textProteins', globalTab1,   useLine,  1,                  'proteinContent', '',          'roundCarbFiberSugarProtein'
				);
				useLine = 'line'; //in case we need to add more attributes below this in future updates
			}

			nutritionLabel += globalTab1 + '<div class="bar1"></div>\n';

			if ($this.settings.showVitaminA) {
				//in case we need to add more attributes above this in future updates
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings valueIndex       unitIndex       naIndex       attributeText  localTabValue lineClass                   attributeDisplayType itemPropValue localExtraTab roundFunctionName
					$this.settings, 'valueVitaminA', 'unitVitaminA', 'naVitaminA', 'textVitaminA', globalTab1,   useLineAgain + ' vitaminA', 5,                   '',           globalTab2,  'roundVitaminsCalciumIron'
				);
				useLineAgain = 'line';
			}

			if ($this.settings.showVitaminC) {
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings valueIndex       unitIndex       naIndex       attributeText  localTabValue lineClass                   attributeDisplayType itemPropValue localExtraTab roundFunctionName
					$this.settings, 'valueVitaminC', 'unitVitaminC', 'naVitaminC', 'textVitaminC', globalTab1,   useLineAgain + ' vitaminC', 5,                   '',           globalTab2,  'roundVitaminsCalciumIron'
				);
				useLineAgain = 'line';
			}

			if ($this.settings.showCalcium) {
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings valueIndex      unitIndex      naIndex      attributeText localTabValue lineClass                  attributeDisplayType itemPropValue localExtraTab roundFunctionName
					$this.settings, 'valueCalcium', 'unitCalcium', 'naCalcium', 'textCalcium', globalTab1,   useLineAgain + ' calcium', 5,                   '',           globalTab2,  'roundVitaminsCalciumIron'
				);
				useLineAgain = 'line';
			}

			if ($this.settings.showIron) {
				nutritionLabel += generateAttributeWithoutPercentageHtmlLegacy(
					//$localSettings valueIndex   unitIndex   naIndex   attributeText localTabValue lineClass               attributeDisplayType itemPropValue localExtraTab roundFunctionName
					$this.settings, 'valueIron', 'unitIron', 'naIron', 'textIron',    globalTab1,   useLineAgain + ' iron', 5,                   '',           globalTab2,  'roundVitaminsCalciumIron'
				);
				useLineAgain = 'line'; //in case we need to add more attributes below this in future updates
			}

				nutritionLabel += globalTab1 + '<div class="dvCalorieDiet ' + useLineAgain + '">\n';
					nutritionLabel += globalTab2 + '<div class="calorieNote">\n';

					if (!$this.settings.hidePercentDailyValues) {
						nutritionLabel += globalTab3 + '<span tabindex="0"><span class="star" aria-hidden="true">*</span> ' +
							$this.settings.textPercentDailyPart1 + ' ' +
							$this.settings.calorieIntake + ' ' +
							$this.settings.textPercentDailyPart2 + '.</span>\n';
					}

					if ($this.settings.showIngredients) {
						nutritionLabel += ingredientsHtmlLegacy($this.settings);
					}

					if ($this.settings.showDisclaimer) {
						nutritionLabel += disclaimerHtmlLegacy($this.settings);
					}

					nutritionLabel += globalTab2 + '</div><!-- closing class="calorieNote" -->\n\n';

				if ($this.settings.showCalorieDiet) {
					nutritionLabel += calorieDietHtmlLegacy($this.settings);
				}

				nutritionLabel += globalTab1 + '</div><!-- closing class="dvCalorieDiet line" -->\n\n';

			if ($this.settings.showBottomLink) {
				nutritionLabel += bottomLinkHtmlLegacy($this.settings);
			}

			if ($this.settings.showCustomFooter) {
				nutritionLabel += globalTab1 + '<div class="customFooter" tabindex="0">' + $this.settings.valueCustomFooter + '</div>\n';
			}

			//returns the html for the nutrition label
			return nutritionLabel += '<div class="naTooltip">' + $this.settings.textDataNotAvailable + '</div>\n</div><!-- closing class="nutritionLabel" -->\n';
		}, //end of => generateLegacy: function()


		generate2018: function() {
			//this is the function that returns the html code for the nutrition label based on the settings that is supplied by the user
			let $this = this;
			let borderCSS = '';
			let nutritionLabel = '';
			let showLineDiv;

			let sevingUnitQuantityHtml2018Result = sevingUnitQuantityHtml2018($this.settings);
			let servingSizeIsHidden = sevingUnitQuantityHtml2018Result.servingSizeIsHidden;
			let servingContainerIsHidden = sevingUnitQuantityHtml2018Result.servingContainerIsHidden;

			//return the plugin incase it has already been created
			if ($this.nutritionLabel) {
				return $this.nutritionLabel;
			}

			if ($this.settings.hideNotApplicableValues) {
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
				$this.settings.showSugarAlcohol = $this.settings.naSugarAlcohol ? false : $this.settings.showSugarAlcohol;
				$this.settings.showProteins = $this.settings.naProteins ? false : $this.settings.showProteins;
				$this.settings.showVitaminD = $this.settings.naVitaminD ? false : $this.settings.showVitaminD;
				$this.settings.showCalcium = $this.settings.naCalcium ? false : $this.settings.showCalcium;
				$this.settings.showIron = $this.settings.naIron ? false : $this.settings.showIron;
				$this.settings.showCaffeine = $this.settings.naCaffeine ? false : $this.settings.showCaffeine;
			}

			if ($this.settings.hidePercentDailyValues) {
				$this.settings.showDailyVitaminD = false;
				$this.settings.showDailyCalcium = false;
				$this.settings.showDailyIron = false;
				$this.settings.showDailyPotassium_2018 = false;
			}

			if ($this.settings.allowNoBorder) {
				borderCSS = 'border: 0;';
			}

			//creates the html code for the label based on the settings
			nutritionLabel = '<div itemscope itemtype="http://schema.org/NutritionInformation" class="nf" role="region" aria-label="nutrition label" style="' + borderCSS;
				if (!$this.settings.allowCustomWidth) {
					nutritionLabel += ' width: ' + $this.settings.width + 'px;">\n';
				} else {
					nutritionLabel += ' width: ' + $this.settings.widthCustom + ';">\n';
				}

				nutritionLabel += globalTab1 + '<div class="nf-title" tabindex="0">' + $this.settings.textNutritionFacts + '</div>\n';

			showLineDiv =
				$this.settings.showItemName ||
				(
					!$this.settings.showItemName &&
					servingSizeIsHidden &&
					servingContainerIsHidden
				) ||
				(
					!$this.settings.showItemName &&
					$this.settings.originalServingUnitQuantity > 0 &&
					$this.settings.showServingWeightGrams &&
					$this.settings.valueServingWeightGrams > 0
				) ||
				(
					$this.settings.showServingUnitQuantity &&
					$this.settings.originalServingUnitQuantity > 0 &&
					$this.settings.showServingsPerContainer &&
					$this.settings.valueServingPerContainer > 0
				);

			if (
					$this.settings.showServingUnitQuantity &&
					$this.settings.originalServingUnitQuantity > 0 &&
					$this.settings.showServingsPerContainer &&
					$this.settings.valueServingPerContainer > 0
			) {
				nutritionLabel += globalTab2 + '<div class="nf-per-container" tabindex="0">\n';
					nutritionLabel += globalTab3 + roundLoDash($this.settings.valueServingPerContainer, $this.settings.decimalPlacesForNutrition);
					nutritionLabel += ' ' + $this.settings.textServingsPerContainer + '\n';
				nutritionLabel += globalTab2 + '</div>\n\n';
			}

			if (showLineDiv) {
				nutritionLabel += globalTab1 + '<div class="nf-line">\n';
			}

				nutritionLabel += globalTab2 + '<div class="nf-serving">\n';
				nutritionLabel += sevingUnitQuantityHtml2018Result.nutritionLabel;

					if ($this.settings.showItemName) {
						nutritionLabel += itemNameHtml2018($this.settings);
					}

				nutritionLabel += globalTab2 + '</div><!-- end of class="nf-serving" -->\n\n';

			if (showLineDiv) {
				nutritionLabel += globalTab1 + '</div><!-- end of class="nf-line" -->\n\n';
			}

				nutritionLabel += globalTab1 + '<div class="nf-bar2"></div>\n';
				nutritionLabel += globalTab1 + '<div class="nf-amount-per-serving" tabindex="0">' + $this.settings.textAmountPerServing + '</div>\n';

				if ($this.settings.showCalories) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex       unitIndex       naIndex       attributeText   itemPropValue topDivClass   showPercentageCode roundFunctionName roundFunctionRuleName labelClass valueClass dailyValueIndex
						$this.settings, 'valueCalories', 'unitCalories', 'naCalories', 'textCalories', 'calories',   'nf-calories', false,            'roundCalories',   '',                   '',       'nf-pr',    ''
					);
				}

				nutritionLabel += globalTab1 + '<div class="nf-bar1"></div>\n';

			if (!$this.settings.hidePercentDailyValues) {
				nutritionLabel += globalTab1 + '<div class="nf-line nf-text-right">\n';
					nutritionLabel += globalTab2 + '<span class="nf-highlight nf-percent-dv">% ' + $this.settings.textDailyValues + '*</span>\n';
				nutritionLabel += globalTab1 + '</div>\n';
			}

				if ($this.settings.showTotalFat) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex       unitIndex       naIndex       attributeText   itemPropValue topDivClass showPercentageCode                 roundFunctionName roundFunctionRuleName labelClass     valueClass dailyValueIndex
						$this.settings, 'valueTotalFat', 'unitTotalFat', 'naTotalFat', 'textTotalFat', 'fatContent', 'nf-line',   $this.settings.showDailyTotalFat, 'roundFat',       'roundFatRule',       'nf-highlight', '',       'dailyValueTotalFat'
					);
				}

				if ($this.settings.showSatFat) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex     unitIndex     naIndex     attributeText itemPropValue          topDivClass         showPercentageCode               roundFunctionName roundFunctionRuleName labelClass valueClass dailyValueIndex
						$this.settings, 'valueSatFat', 'unitSatFat', 'naSatFat', 'textSatFat', 'saturatedFatContent', 'nf-line nf-indent', $this.settings.showDailySatFat, 'roundFat',       'roundFatRule',        '',        '',       'dailyValueSatFat'
					);
				}

				if ($this.settings.showTransFat) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex       unitIndex       naIndex       attributeText   itemPropValue      topDivClass         showPercentageCode roundFunctionName roundFunctionRuleName labelClass valueClass dailyValueIndex
						$this.settings, 'valueTransFat', 'unitTransFat', 'naTransFat', 'textTransFat', 'transFatContent', 'nf-line nf-indent', false,            'roundFat',        '',                   '',        '',        ''
					);
				}

				if ($this.settings.showPolyFat) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex      unitIndex      naIndex      attributeText itemPropValue topDivClass         showPercentageCode roundFunctionName roundFunctionRuleName labelClass valueClass dailyValueIndex
						$this.settings, 'valuePolyFat', 'unitPolyFat', 'naPolyFat', 'textPolyFat', '',          'nf-line nf-indent', false,            'roundFat',        '',                   '',        '',        ''
					);
				}

				if ($this.settings.showMonoFat) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex      unitIndex      naIndex      attributeText itemPropValue topDivClass         showPercentageCode roundFunctionName roundFunctionRuleName labelClass valueClass dailyValueIndex
						$this.settings, 'valueMonoFat', 'unitMonoFat', 'naMonoFat', 'textMonoFat', '',          'nf-line nf-indent', false,            'roundFat',        '',                   '',        '',        ''
					);
				}

				if ($this.settings.showCholesterol) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex          unitIndex          naIndex          attributeText      itemPropValue         topDivClass showPercentageCode                    roundFunctionName   roundFunctionRuleName   labelClass     valueClass dailyValueIndex
						$this.settings, 'valueCholesterol', 'unitCholesterol', 'naCholesterol', 'textCholesterol', 'cholesterolContent', 'nf-line',   $this.settings.showDailyCholesterol, 'roundCholesterol', 'roundCholesterolRule', 'nf-highlight', '',       'dailyValueCholesterol'
					);
				}

				if ($this.settings.showSodium) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex     unitIndex     naIndex     attributeText itemPropValue    topDivClass showPercentageCode               roundFunctionName roundFunctionRuleName labelClass     valueClass dailyValueIndex
						$this.settings, 'valueSodium', 'unitSodium', 'naSodium', 'textSodium', 'sodiumContent', 'nf-line',   $this.settings.showDailySodium, 'roundSodium',    'roundSodiumRule',    'nf-highlight', '',       'dailyValueSodium'
					);
				}

				if ($this.settings.showTotalCarb) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex        unitIndex        naIndex        attributeText    itemPropValue          topDivClass showPercentageCode                  roundFunctionName             roundFunctionRuleName            labelClass      valueClass dailyValueIndex
						$this.settings, 'valueTotalCarb', 'unitTotalCarb', 'naTotalCarb', 'textTotalCarb', 'carbohydrateContent', 'nf-line',   $this.settings.showDailyTotalCarb, 'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', 'nf-highlight', '',       'dailyValueCarb'
					);
				}

				if ($this.settings.showFibers) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex     unitIndex     naIndex     attributeText itemPropValue   topDivClass         showPercentageCode               roundFunctionName             roundFunctionRuleName            labelClass valueClass dailyValueIndex
						$this.settings, 'valueFibers', 'unitFibers', 'naFibers', 'textFibers', 'fiberContent', 'nf-line nf-indent', $this.settings.showDailyFibers, 'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', '',        '',       'dailyValueFiber'
					);
				}

				if ($this.settings.showSugars) {
					if (!$this.settings.indentSugarAndRemoveBoldStyleFor2018Label) {
						nutritionLabel += generateAttributeHtml2018Version(
							//$localSettings valueIndex     unitIndex     naIndex     attributeText itemPropValue   topDivClass showPercentageCode              roundFunctionName             roundFunctionRuleName             labelClass     valueClass dailyValueIndex
							$this.settings, 'valueSugars', 'unitSugars', 'naSugars', 'textSugars', 'sugarContent', 'nf-line',   $this.settings.showDailySugars, 'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', 'nf-highlight', '',       'dailyValueSugar'
						);
					} else {
						nutritionLabel += generateAttributeHtml2018Version(
							//$localSettings valueIndex     unitIndex     naIndex     attributeText itemPropValue   topDivClass         showPercentageCode              roundFunctionName             roundFunctionRuleName            labelClass valueClass dailyValueIndex
							$this.settings, 'valueSugars', 'unitSugars', 'naSugars', 'textSugars', 'sugarContent', 'nf-line nf-indent', $this.settings.showDailySugars, 'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', '',        '',       'dailyValueSugar'
						);
					}
				}

				if ($this.settings.showAddedSugars) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex          unitIndex          naIndex          attributeText      itemPropValue topDivClass          showPercentageCode                    roundFunctionName             roundFunctionRuleName            labelClass valueClass dailyValueIndex
						$this.settings, 'valueAddedSugars', 'unitAddedSugars', 'naAddedSugars', 'textAddedSugars1', '',          'nf-line nf-indent2', $this.settings.showDailyAddedSugars, 'roundCarbFiberSugarProtein', 'roundCarbFiberSugarProteinRule', '',        '',       'dailyValueAddedSugar'
					);
				}

				if ($this.settings.showSugarAlcohol) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex           unitIndex           naIndex           attributeText       itemPropValue topDivClass         showPercentageCode roundFunctionName            roundFunctionRuleName labelClass valueClass dailyValueIndex
						$this.settings, 'valueSugarAlcohol', 'unitSugarAlcohol', 'naSugarAlcohol', 'textSugarAlcohol', '',           'nf-line nf-indent', false,            'roundCarbFiberSugarProtein', '',                   '',        '',        ''
					);
				}

				if ($this.settings.showProteins) {
					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex       unitIndex       naIndex       attributeText   itemPropValue     topDivClass showPercentageCode roundFunctionName            roundFunctionRuleName labelClass     valueClass dailyValueIndex
						$this.settings, 'valueProteins', 'unitProteins', 'naProteins', 'textProteins', 'proteinContent', 'nf-line',   false,            'roundCarbFiberSugarProtein', '',                  'nf-highlight', '',        ''
					);
				}

			if ($this.settings.showVitaminD || $this.settings.showCalcium || $this.settings.showIron || $this.settings.showPotassium_2018) {
				let lastRowNutrition = 'valueVitaminD';
				let firstRowNutrition = 'valuePotassium_2018';

				nutritionLabel += globalTab1 + '<div class="nf-bar2"></div>\n';
				nutritionLabel += globalTab1 + '<div class="nf-vitamins">\n';
					nutritionLabel += globalTab2 + '<div class="nf-vitamins">\n';

					//check which one is the last row
					if (!$this.settings.useBaseValueFor2018LabelAndNotDVPercentage) {
						if ($this.settings.showPotassium_2018) {
							lastRowNutrition = 'valuePotassium_2018';
						} else {
							if ($this.settings.showIron) {
								lastRowNutrition = 'valueIron';
							} else if ($this.settings.showCalcium) {
								lastRowNutrition = 'valueCalcium';
							}
						}
					}

					//check which one is the first row
					if ($this.settings.useBaseValueFor2018LabelAndNotDVPercentage) {
						if ($this.settings.showVitaminD) {
							firstRowNutrition = 'valueVitaminD';
						} else {
							if ($this.settings.showCalcium) {
								firstRowNutrition = 'valueCalcium';
							} else if ($this.settings.showIron) {
								firstRowNutrition = 'valueIron';
							}
						}
					}

					if ($this.settings.showVitaminD && !$this.settings.useBaseValueFor2018LabelAndNotDVPercentage) {
						nutritionLabel += globalTab3 + generate2018HtmlAndComputeValueGivenThePercentage(
							//$localSettings valueIndex       dailyValueIndex       unitIndex_base       unitIndex_percent       naIndex       attributeTexts showPercentageCode                lastRow
							$this.settings, 'valueVitaminD', 'dailyValueVitaminD', 'unitVitaminD_base', 'unitVitaminD_percent', 'naVitaminD', 'textVitaminD', $this.settings.showDailyVitaminD, lastRowNutrition == 'valueVitaminD'
						);
					} else if ($this.settings.showVitaminD && $this.settings.useBaseValueFor2018LabelAndNotDVPercentage) {
						nutritionLabel += generateAttributeHtml2018Version(
							//$localSettings valueIndex       unitIndex            naIndex       attributeText   itemPropValue     topDivClass                                            showPercentageCode                 roundFunctionName                roundFunctionRuleName               labelClass valueClass dailyValueIndex
							$this.settings, 'valueVitaminD', 'unitVitaminD_base', 'naVitaminD', 'textVitaminD', 'vitaminDContent', firstRowNutrition == 'valueVitaminD' ? '' : 'nf-line', $this.settings.showDailyVitaminD, 'roundFor2018LabelVitaminDIron', 'roundFor2018LabelVitaminDIronRule', '',        '',       'dailyValueVitaminD'
						);
					}

					if ($this.settings.showCalcium && !$this.settings.useBaseValueFor2018LabelAndNotDVPercentage) {
						nutritionLabel += globalTab3 + generate2018HtmlAndComputeValueGivenThePercentage(
							//$localSettings valueIndex      dailyValueIndex      unitIndex_base      unitIndex_percent      naIndex      attributeTexts showPercentageCode               lastRow
							$this.settings, 'valueCalcium', 'dailyValueCalcium', 'unitCalcium_base', 'unitCalcium_percent', 'naCalcium', 'textCalcium',  $this.settings.showDailyCalcium, lastRowNutrition == 'valueCalcium'
						);
					} else if ($this.settings.showCalcium && $this.settings.useBaseValueFor2018LabelAndNotDVPercentage) {
						nutritionLabel += generateAttributeHtml2018Version(
							//$localSettings valueIndex      unitIndex            naIndex     attributeText  itemPropValue    topDivClass                                           showPercentageCode                roundFunctionName                    roundFunctionRuleName                   labelClass valueClass dailyValueIndex
							$this.settings, 'valueCalcium', 'unitCalcium_base', 'naCalcium', 'textCalcium', 'calciumContent', firstRowNutrition == 'valueCalcium' ? '' : 'nf-line', $this.settings.showDailyCalcium, 'roundFor2018LabelCalciumPotassium', 'roundFor2018LabelCalciumPotassiumRule', '',        '',       'dailyValueCalcium'
						);
					}

					if ($this.settings.showIron && !$this.settings.useBaseValueFor2018LabelAndNotDVPercentage) {
						nutritionLabel += globalTab3 + generate2018HtmlAndComputeValueGivenThePercentage(
							//$localSettings valueIndex    dailyValueIndex  unitIndex_base   unitIndex_percent   naIndex   attributeTexts showPercentageCode            lastRow
							$this.settings, 'valueIron', 'dailyValueIron', 'unitIron_base', 'unitIron_percent', 'naIron', 'textIron',     $this.settings.showDailyIron, lastRowNutrition == 'valueIron'
						);
					} else if ($this.settings.showIron && $this.settings.useBaseValueFor2018LabelAndNotDVPercentage) {
						nutritionLabel += generateAttributeHtml2018Version(
							//$localSettings valueIndex   unitIndex        naIndex   attributeText itemPropValue topDivClass                                          showPercentageCode             roundFunctionName                roundFunctionRuleName               labelClass valueClass dailyValueIndex
							$this.settings, 'valueIron', 'unitIron_base', 'naIron', 'textIron',   'ironContent', firstRowNutrition == 'valueIron' ? '' : 'nf-line',   $this.settings.showDailyIron, 'roundFor2018LabelVitaminDIron', 'roundFor2018LabelVitaminDIronRule', '',        '',       'dailyValueIron'
						);
					}

					if ($this.settings.showPotassium_2018 && !$this.settings.useBaseValueFor2018LabelAndNotDVPercentage) {
						nutritionLabel += globalTab3 + generate2018HtmlAndComputeValueGivenThePercentage(
							//$localSettings valueIndex             dailyValueIndex             unitIndex_base        unitIndex_percent        naIndex             attributeTexts  showPercentageCode                      lastRow
							$this.settings, 'valuePotassium_2018', 'dailyValuePotassium_2018', 'unitPotassium_base', 'unitPotassium_percent', 'naPotassium_2018', 'textPotassium', $this.settings.showDailyPotassium_2018, lastRowNutrition == 'valuePotassium_2018'
						);
					} else if ($this.settings.showPotassium_2018 && $this.settings.useBaseValueFor2018LabelAndNotDVPercentage) {
						nutritionLabel += generateAttributeHtml2018Version(
							//$localSettings valueIndex             unitIndex             naIndex             attributeText    itemPropValue      topDivClass                                                  showPercentageCode                       roundFunctionName                    roundFunctionRuleName                   labelClass valueClass dailyValueIndex
							$this.settings, 'valuePotassium_2018', 'unitPotassium_base', 'naPotassium_2018', 'textPotassium', 'potassiumContent', firstRowNutrition == 'valuePotassium_2018' ? '' : 'nf-line', $this.settings.showDailyPotassium_2018, 'roundFor2018LabelCalciumPotassium', 'roundFor2018LabelCalciumPotassiumRule', '',        '',       'dailyValuePotassium_2018'
						);
					}

					nutritionLabel += globalTab2 + '</div>\n';

				nutritionLabel += globalTab1 + '</div>\n';
			}//end of => if ($this.settings.showVitaminD || $this.settings.showCalcium || $this.settings.showIron || $this.settings.showPotassium_2018)

				nutritionLabel += globalTab1 + '<div class="nf-bar2"></div>\n';

				if ($this.settings.showCaffeine) {
					let labelClassCaffeine = 'nf-highlight';
					if (!$this.settings.boldCaffeine) {
						labelClassCaffeine = '';
					}

					nutritionLabel += generateAttributeHtml2018Version(
						//$localSettings valueIndex       unitIndex       naIndex       attributeText   itemPropValue     topDivClass showPercentageCode roundFunctionName roundFunctionRuleName labelClass          valueClass dailyValueIndex
						$this.settings, 'valueCaffeine', 'unitCaffeine', 'naCaffeine', 'textCaffeine', 'caffeineContent', '',         false,            'roundCaffeine',   '',                   labelClassCaffeine, '',        ''
					);

					nutritionLabel += globalTab1 + '<div class="nf-bar1"></div>\n';
					nutritionLabel += globalTab1 + '<div class="nf-vitamins">\n';
				}

				nutritionLabel += globalTab1 + '<div class="' + ($this.settings.hidePercentDailyValues ? 'nf-footnoteHiddenDailyValues' : 'nf-footnote') + '">\n';
					if (!$this.settings.hidePercentDailyValues) {
						nutritionLabel += globalTab2 + '<span tabIndex="0">' + $this.settings.textPercentDaily2018VersionPart1;
						nutritionLabel += $this.settings.calorieIntake;
						nutritionLabel += $this.settings.textPercentDaily2018VersionPart2 + '</span>\n';
					}

					if ($this.settings.showIngredients) {
						nutritionLabel += ingredientsHtml2018Version($this.settings);
					}

					if ($this.settings.showDisclaimer) {
						nutritionLabel += disclaimerHtml2018Version($this.settings);
					}

				nutritionLabel += globalTab1 + '</div>\n';

				if ($this.settings.showBottomLink) {
					nutritionLabel += bottomLinkHtml2018Version($this.settings);
				}

				if ($this.settings.showCustomFooter) {
					nutritionLabel += globalTab1 + '<div class="nf-customFooter" tabindex="0">' + $this.settings.valueCustomFooter + '</div>\n';
				}

			//returns the html for the nutrition label
			return nutritionLabel += '<div class="naTooltip">' + $this.settings.textDataNotAvailable + '</div>\n</div><!-- closing class="nf" -->\n';
		}, //end of => generate2018: function()


		generateUK: function() {
			//this is the function that returns the html code for the nutrition label based on the settings that is supplied by the user
			let $this = this;
			let borderCSS = '';
			let nutritionLabel = '';

			//return the plugin incase it has already been created
			if ($this.nutritionLabel) {
				return $this.nutritionLabel;
			}

			if ($this.settings.hideNotApplicableValues) {
				$this.settings.showCalories = $this.settings.naCalories ? false : $this.settings.showCalories;
				$this.settings.showTotalFat = $this.settings.naTotalFat ? false : $this.settings.showTotalFat;
				$this.settings.showSatFat = $this.settings.naSatFat ? false : $this.settings.showSatFat;
				$this.settings.showTotalCarb = $this.settings.naTotalCarb ? false : $this.settings.showTotalCarb;
				$this.settings.showSugars = $this.settings.naSugars ? false : $this.settings.showSugars;
				$this.settings.showFibers = $this.settings.naFibers ? false : $this.settings.showFibers;
				$this.settings.showProteins = $this.settings.naProteins ? false : $this.settings.showProteins;
				$this.settings.showSodium = $this.settings.naSodium ? false : $this.settings.showSodium;
			}

			//the uk label requires a non zero serving weight value for the computations to work properly
				//so i am setting the values to be "not applicable" if the serving weight value is not valid
			if ($this.settings.valueServingWeightGrams <= 0) {
				$this.settings.naCalories = true;
				$this.settings.naTotalFat = true;
				$this.settings.naSatFat = true;
				$this.settings.naTotalCarb = true;
				$this.settings.naSugars = true;
				$this.settings.naFibers = true;
				$this.settings.naProteins = true;
				$this.settings.naSodium = true;
			}

			if ($this.settings.allowNoBorder) {
				borderCSS = 'border: 0;';
			}

			//creates the html code for the label based on the settings
			nutritionLabel = '<div itemscope itemtype="http://schema.org/NutritionInformation" role="region" aria-label="nutrition label" class="uk_nf uk" style="' + borderCSS;
			if (!$this.settings.allowCustomWidth) {
				nutritionLabel += ' width: ' + $this.settings.width + 'px;">\n';
			} else {
				nutritionLabel += ' width: ' + $this.settings.widthCustom + ';">\n';
			}

			nutritionLabel += globalTab1 + '<div class="uk_nf-title" tabindex="0">' + $this.settings.textNutritionFacts + '</div>\n';

			if ($this.settings.showItemNameForUK) {
				nutritionLabel += globalTab1 + '<div class="uk_nf-item-name" tabindex="0">' + $this.settings.itemName + '</div>\n';
			}

			//for the uk label, If the serving name is empty, have it default to "Serving" ($this.settings.textUKDefaultServingNameIfEmpty)
			if ($this.settings.convertEmptyServingNametoServingForUKLabel && String($this.settings.valueServingSizeUnit) === '') {
				$this.settings.valueServingSizeUnit = $this.settings.textUKDefaultServingNameIfEmpty;
			}

			nutritionLabel += globalTab1 + '<table>\n';
				nutritionLabel += globalTab2 + '<thead>\n';
					nutritionLabel += globalTab3 + '<tr>\n';
						nutritionLabel += globalTab4 + '<th>' + $this.settings.textUKTypicalValues + '</th>\n';
						nutritionLabel += globalTab4 + '<th>' + $this.settings.textUKPer100 + ' 100' + $this.settings.unitGramOrMlForThePer100Part + '</th>\n';

						nutritionLabel += globalTab4 + '<th>';

					if ($this.settings.showServingUnitQuantityTextbox) {
						if (!$this.settings.hideTextboxArrows) {
							nutritionLabel += globalTab5 + '<div class="setter">\n';
								nutritionLabel += globalTab6 + '<a href="' + $this.settings.textAriaLabelIncreaseQuantityArrow + '" class="uk_nf-unitQuantityUp" ';
									nutritionLabel += 'aria-label="' + $this.settings.textAriaLabelIncreaseQuantityArrow + '" rel="nofollow" tabindex="0"></a>\n';
								nutritionLabel += globalTab6 + '<a href="' + $this.settings.textAriaLabelDecreaseQuantityArrow + '" class="uk_nf-unitQuantityDown" ';
									nutritionLabel += 'aria-label="' + $this.settings.textAriaLabelDecreaseQuantityArrow + '" rel="nofollow" tabindex="0"></a>\n';
							nutritionLabel += globalTab5 + '</div><!-- closing class="setter" -->\n\n';
						}

							nutritionLabel += globalTab5 + '<input type="text" data-role="none" value="' +
								roundLoDash($this.settings.valueServingUnitQuantity, this.settings.decimalPlacesForQuantityTextbox) + '" ';
								nutritionLabel += 'class="uk_nf-unitQuantityBox uk_nf-modifier-field" aria-label="' + this.settings.textAriaLabelChangeQuantityTextbox + '">\n';

							nutritionLabel += globalTab5 + '<input type="hidden" value="' +
								roundLoDash(this.settings.valueServingUnitQuantity, this.settings.decimalPlacesForQuantityTextbox) +
								'" id="uk_nf-nixLabelBeforeQuantity">\n\n';
					} else {
							nutritionLabel += globalTab5 + $this.settings.valueServingUnitQuantity;
					}

							nutritionLabel += globalTab5 + '<span class="uk_nf-servingUnit">' + $this.settings.valueServingSizeUnit;
								nutritionLabel += ' (' + roundLoDash($this.settings.valueServingWeightGrams) + $this.settings.unitGramOrMlForThePer100Part + ')</span>\n';
						nutritionLabel += '</th>\n';

						nutritionLabel += globalTab4 + '<th>%*(' + roundLoDash($this.settings.valueServingWeightGrams) + $this.settings.unitGramOrMlForThePer100Part + ')</th>\n';
					nutritionLabel += globalTab3 + '</tr>\n';
				nutritionLabel += globalTab2 + '</thead>\n';
			nutritionLabel += globalTab1 + '<tbody>\n';

			if ($this.settings.showCalories) {
				nutritionLabel += generateAttributeForUK(
					//$localSettings valueIndex       dailyValueIndex unitIndex        naIndex       attributeTexts itemPropValue roundFunctionName    roundFunctionRuleName showPercentageCode indentedName
					$this.settings, 'valueCalories', '',             'unitEnergy_kj', 'naCalories', 'textCalories', '',          'roundToNearestNum', 'roundToNearestNum',   false,             false
				);

				nutritionLabel += generateAttributeForUK(
					//$localSettings valueIndex       dailyValueIndex         unitIndex          naIndex      attributeTexts itemPropValue roundFunctionName    roundFunctionRuleName showPercentageCode              indentedName
					$this.settings, 'valueCalories', 'dailyValueEnergyKcal', 'unitEnergy_kcal', 'naCalories', '',            '',          'roundToNearestNum', 'roundToNearestNum',   $this.settings.showDailyEnergy, false
				);
			}

			if ($this.settings.showTotalFat) {
				nutritionLabel += generateAttributeForUK(
					//$localSettings valueIndex       dailyValueIndex       unitIndex       naIndex       attributeTexts  itemPropValue roundFunctionName                                roundFunctionRuleName                               showPercentageCode                indentedName
					$this.settings, 'valueTotalFat', 'dailyValueTotalFat', 'unitTotalFat', 'naTotalFat', 'textTotalFat', 'fatContent', 'roundForUKLabelTotalFatCarbsSugarFiberProtein', 'roundForUKLabelTotalFatCarbsSugarFiberProteinRule', $this.settings.showDailyTotalFat, false
				);
			}

			if ($this.settings.showSatFat) {
				nutritionLabel += generateAttributeForUK(
					//$localSettings valueIndex     dailyValueIndex     unitIndex     naIndex     attributeTexts itemPropValue          roundFunctionName        roundFunctionRuleName       showPercentageCode              indentedName
					$this.settings, 'valueSatFat', 'dailyValueSatFat', 'unitSatFat', 'naSatFat', 'textSatFat',  'saturatedFatContent', 'roundForUKLabelSatFat', 'roundForUKLabelSatFatRule', $this.settings.showDailySatFat, true
				);
			}

			if ($this.settings.showTotalCarb) {
				nutritionLabel += generateAttributeForUK(
					//$localSettings valueIndex        dailyValueIndex   unitIndex        naIndex        attributeTexts   itemPropValue          roundFunctionName                                roundFunctionRuleName                               showPercentageCode                 indentedName
					$this.settings, 'valueTotalCarb', 'dailyValueCarb', 'unitTotalCarb', 'naTotalCarb', 'textTotalCarb', 'carbohydrateContent', 'roundForUKLabelTotalFatCarbsSugarFiberProtein', 'roundForUKLabelTotalFatCarbsSugarFiberProteinRule', $this.settings.showDailyTotalCarb, false
				);
			}

			if ($this.settings.showSugars) {
				nutritionLabel += generateAttributeForUK(
					//$localSettings valueIndex     dailyValueIndex    unitIndex     naIndex     attributeTexts itemPropValue   roundFunctionName                                roundFunctionRuleName                               showPercentageCode             indentedName
					$this.settings, 'valueSugars', 'dailyValueSugar', 'unitSugars', 'naSugars', 'textSugars',  'sugarContent', 'roundForUKLabelTotalFatCarbsSugarFiberProtein', 'roundForUKLabelTotalFatCarbsSugarFiberProteinRule', $this.settings.showDailySugars, true
				);
			}

			if ($this.settings.showFibers) {
				nutritionLabel += generateAttributeForUK(
					//$localSettings valueIndex     dailyValueIndex unitIndex     naIndex     attributeTexts itemPropValue   roundFunctionName                                roundFunctionRuleName                               showPercentageCode indentedName
					$this.settings, 'valueFibers', '',             'unitFibers', 'naFibers', 'textFibers',  'fiberContent', 'roundForUKLabelTotalFatCarbsSugarFiberProtein', 'roundForUKLabelTotalFatCarbsSugarFiberProteinRule', false,             false
				);
			}

			if ($this.settings.showProteins) {
				nutritionLabel += generateAttributeForUK(
					//$localSettings valueIndex       dailyValueIndex      unitIndex       naIndex       attributeTexts  itemPropValue     roundFunctionName                                roundFunctionRuleName                               showPercentageCode               indentedName
					$this.settings, 'valueProteins', 'dailyValueProtein', 'unitProteins', 'naProteins', 'textProteins', 'proteinContent', 'roundForUKLabelTotalFatCarbsSugarFiberProtein', 'roundForUKLabelTotalFatCarbsSugarFiberProteinRule', $this.settings.showDailyProtein, false
				);
			}

			if ($this.settings.showSodium) {
				nutritionLabel += generateAttributeForUK(
					//$localSettings valueIndex     dailyValueIndex   unitIndex   naIndex     attributeTexts itemPropValue    roundFunctionName      roundFunctionRuleName     showPercentageCode             indentedName
					$this.settings, 'valueSodium', 'dailyValueSalt', 'unitSalt', 'naSodium', 'textSodium',  'sodiumContent', 'roundForUKLabelSalt', 'roundForUKLabelSaltRule', $this.settings.showDailySodium, false
				);
			}

					nutritionLabel += globalTab2 + '</tbody>\n';
					nutritionLabel += globalTab2 + '<tfoot>\n';
						nutritionLabel += globalTab3 + '<tr>\n';
							nutritionLabel += globalTab4 + '<td colspan="4">\n';
								nutritionLabel += globalTab5 + '<div class="uk_nf-footnote">\n';

									nutritionLabel += referenceIntakeHtmlUKVersion($this.settings);

								if ($this.settings.showIngredients) {
									nutritionLabel += ingredientsHtmlUKVersion($this.settings);
								}

								if ($this.settings.showDisclaimer) {
									nutritionLabel += disclaimerHtmlUKVersion($this.settings);
								}

								if ($this.settings.showBottomLink) {
									nutritionLabel += bottomLinkHtmlUKVersion($this.settings);
								}

								if ($this.settings.showCustomFooter) {
									nutritionLabel += globalTab6 + '<div class="uk_nf-customFooter" tabindex="0">\n' + globalTab7 + $this.settings.valueCustomFooter + '\n' + globalTab6 + '</div>\n';
								}

								nutritionLabel += globalTab5 + '</div>\n';
							nutritionLabel += globalTab4 + '</td>\n';
						nutritionLabel += globalTab3 + '</tr>\n';
					nutritionLabel += globalTab2 + '</tfoot>\n';
				nutritionLabel += globalTab1 + '</table>\n';

			//returns the html for the nutrition label
			return nutritionLabel += '<div class="naTooltip">' + $this.settings.textDataNotAvailable + '</div>\n</div><!-- closing class="uk_nf" -->\n';
		}//end of => generateUK: function()
	};//end of => NutritionLabel.prototype
})(jQuery);
