# Nutrition Label Configuration Options
Default values shown as well

### Set label width
    width : 280

### Allow custom width - usually needed for mobile sites
    allowCustomWidth : false
    widthCustom : 'auto'

### Allow the label to have no border
    allowNoBorder : false

### Enable rounding of the nutritional values based on the FDA rounding rules http://goo.gl/RMD2O
    allowFDARounding : false

### 2018 only. calculate vitamin DV percentage by mass, instead of calculating mass from percent DV
    useMassForVitamins : false,

### Enable google analytics event logging
    allowGoogleAnalyticsEventLog : false
    gooleAnalyticsFunctionName : 'ga'

### Enable triggering of user function on quantity change: global function name
    userFunctionNameOnQuantityChange: null
### Enable triggering of user function on quantity change: handler instance
    userFunctionOnQuantityChange:     null

### When set to true, this will hide the values if they are not applicable
    hideNotApplicableValues : false

### When set to true, this will hide all the percent daily values
    hidePercentDailyValues : false

### The brand name of the item for this label (eg. just salad)
    brandName : 'Brand where this item belongs to'
### Scroll the ingredients if the `innerheight is > scrollHeightComparison`
    scrollLongIngredients : false
    scrollHeightComparison : 100
### The height in px of the ingredients div
    scrollHeightPixel : 95
### Set how many decimal places will be shown on the nutrition values (calories, fat, protein, vitamin a, iron, etc)
    decimalPlacesForNutrition : 1
### Set how many decimal places will be shown for the "% daily values*"
    decimalPlacesForDailyValues : 0
### Set how many decimal places will be shown for the serving unit quantity textbox
    decimalPlacesForQuantityTextbox : 1

### Scroll the item name if the jQuery.height() is > scrollLongItemNamePixel
    scrollLongItemName : true
    scrollLongItemNamePixel : 36
    scrollLongItemNamePixel2018Override : 34 // this is needed to fix some issues on the 2018 label as the layout of the label is very different than the legacy one

### Show the customizable link at the bottom
    showBottomLink : false
### Url for the customizable link at the bottom
    urlBottomLink : 'http://www.nutritionix.com'
### Link name for the customizable link at the bottom
    nameBottomLink : 'Nutritionix'

---
## Managing valueServingUnitQuantity
This value can be changed and the value of the nutritions will be affected directly. The computation is

```
"current nutrition value" * "serving unit quantity value" = "final nutrition value"
```

- This can't be less than zero, all values less than zero are converted to zero
- The textbox to change this value is visible / enabled by default
- If the initial value of the serving size unit quantity is less than or equal to zero, it is converted to 1.0
- When enabled, user can change this value by clicking the arrow or changing the value on the textbox and pressing enter. the value on the label will be updated automatically
### Different scenarios and the result if this feature is enabled
On all cases below `showServingUnitQuantityTextbox == true AND showServingUnitQuantity == true`
- "[ ]" means a textbox will be shown
- If `showServingUnitQuantity == false`, the values that should be on the 'serving size div' are empty or null
### CASE 1a: `valueServingSizeUnit != '' (AND NOT null) && valueServingUnitQuantity >= 0`
- RESULT: textServingSize [valueServingUnitQuantity] valueServingSizeUnit

On all cases below `showServingUnitQuantityTextbox == true AND showItemName == true`

If `showItemName == false`, the values that should be on the 'item name div' are empty or null

### CASE 1b: `valueServingSizeUnit != '' (AND NOT null) && valueServingUnitQuantity <= 0`
- RESULT: `[valueServingUnitQuantity default to 1.0] itemName`
### CASE 3a: `valueServingSizeUnit == '' (OR null) && valueServingUnitQuantity > 0`
- RESULT: `[valueServingUnitQuantity] itemName`
### CASE 3b: `valueServingSizeUnit == '' (OR null) && valueServingUnitQuantity <= 0`
- RESULT: `[valueServingUnitQuantity default to 1.0] itemName`

### To see the different resulting labels, check the html/demo-texbox-case*.html files

    valueServingUnitQuantity : 1.0
    valueServingSizeUnit : ''
    showServingUnitQuantityTextbox : true
---
## These 2 settings are used internally.
### This is just added here instead of a global variable to prevent a bug when there are multiple instances of the plugin like on the demo pages
    originalServingUnitQuantity : 0
### This is used to fix the computation issue on the textbox
    nutritionValueMultiplier : 1
---
### The name of the item for this label (eg. cheese burger or mayonnaise)
    itemName : 'Item / Ingredient Name'
    showServingUnitQuantity : true
### Allow hiding of the textbox arrows
    hideTextboxArrows : false

### This is used for the computation of the servings per container
    totalContainerQuantity : 1

### Default calorie intake
    calorieIntake : 2000

### These are the recommended daily intake values
    dailyValueTotalFat : 65
    dailyValueSatFat : 20
    dailyValueCholesterol : 300
    dailyValueSodium : 2400
    dailyValuePotassium : 3500
    dailyValuePotassium_2018 : 4700
    dailyValueCarb : 300
    dailyValueFiber : 25
    dailyValueCalcium : 1300
    dailyValueIron : 18
    dailyValueVitaminD : 20
    dailyValueAddedSugar : 50

    dailyValueVitaminA_2018 : 5000
    dailyValueVitaminC_2018 : 60
    dailyValueVitaminE : 30
    dailyValueVitaminK : 80
    dailyValueThiamin : 1.5
    dailyValueRiboflavin : 1.7
    dailyValueNiacin : 20
    dailyValueVitaminB6 : 2
    dailyValueFolate : 400
    dailyValueVitaminB12 : 6
    dailyValueBiotin : 300
    dailyValuePantothenicAcid : 10
    dailyValuePhosphorus : 1000
    dailyValueIodine : 150
    dailyValueMagnesium : 400
    dailyValueZinc : 15
    dailyValueSelenium : 70
    dailyValueCopper : 2
    dailyValueManganese : 2
    dailyValueChromium : 120
    dailyValueMolybdenum : 75
    dailyValueChloride : 3400

### These values can be changed to hide some nutrition values
    showCalories : true
    showFatCalories : true
    showTotalFat : true
    showSatFat : true
    showTransFat : true
    showPolyFat : false
    showMonoFat : false
    showCholesterol : true
    showSodium : true
    showPotassium: false // this is for the legacy version, this is the only value that is default to be hidden
    showPotassium_2018: true // this is for the 2018 version
    showTotalCarb : true
    showFibers : true
    showSugars : true
    showAddedSugars : true
    showSugarAlcohol : false
    showProteins : true
    showVitaminA : true
    showVitaminA_2018: false // optional in 2018
    showVitaminC : true
    showVitaminC_2018: false // optional in 2018
    showVitaminD : true
    showCalcium : true
    showIron : true


### Additional optional nutrients for 2018 version.
These can be included, but are not required by the FDA as of 2018

Disabled by default

    showVitaminE: false,
    showVitaminK: false,
    showThiamin: false,
    showRiboflavin: false,
    showNiacin: false,
    showVitaminB6: false,
    showFolate: false,
    showVitaminB12: false,
    showBiotin: false,
    showPantothenicAcid: false,
    showPhosphorus: false,
    showIodine: false,
    showMagnesium: false,
    showZinc: false,
    showSelenium: false,
    showCopper: false,
    showManganese: false,
    showChromium: false,
    showMolybdenum: false,
    showChloride: false,

### Show the 'amount per serving' text
    showAmountPerServing : true
### Show the 'servings per container' data and replace the default 'Serving Size' value (without unit and servings per container text and value)
    showServingsPerContainer : false
### Show the item name. there are special cases where the item name is replaced with 'servings per container' value
    showItemName : true
### Show the brand where this item belongs to
    showBrandName : false
### Show the ingredients value or not
    showIngredients : true
### Show the calorie diet info at the bottom of the label
    showCalorieDiet : false
### Show the customizable footer which can contain html and js codes
    showCustomFooter : false

### Show the disclaimer text or not
    showDisclaimer : false
### The height in px of the disclaimer div
    scrollDisclaimerHeightComparison : 100
    scrollDisclaimer : 95
    valueDisclaimer : 'Please note that these nutrition values are estimated based on our standard serving portions. ' +
    'As food servings may have a slight variance each time you visit, please expect these values to be with in 10% +/- of your actual meal. ' +
    'If you have any questions about our nutrition calculator, please contact Nutritionix.'
    ingredientLabel : 'INGREDIENTS:'
    valueCustomFooter : ''

### The are to set some values as 'not applicable'. this means that the nutrition label will appear but the value will be a 'gray dash'
    naCalories : false
    naFatCalories : false
    naTotalFat : false
    naSatFat : false
    naTransFat : false
    naPolyFat : false
    naMonoFat : false
    naCholesterol : false
    naSodium : false
    naPotassium : false // this is for the legacy version
    naPotassium_2018 : false // this is for the 2018 version
    naTotalCarb : false
    naFibers : false
    naSugars : false
    naAddedSugars : false
    naSugarAlcohol : false
    naProteins : false
    naVitaminA : false
    naVitaminA_2018: false
    naVitaminC : false
    naVitaminC_2018: false
    naVitaminD : false
    naCalcium : false
    naIron : false

    naVitaminE: false
    naVitaminK: false
    naThiamin: false
    naRiboflavin: false
    naNiacin: false
    naVitaminB6: false
    naFolate: false
    naVitaminB12: false
    naBiotin: false
    naPantothenicAcid: false
    naPhosphorus: false
    naIodine: false
    naMagnesium: false
    naZinc: false
    naSelenium: false
    naCopper: false
    naManganese: false
    naChromium: false
    naMolybdenum: false
    naChloride: false

### These are the default values for the nutrition info
    valueServingWeightGrams : 0
    valueServingPerContainer : 1
    valueCalories : 0
    valueFatCalories : 0
    valueTotalFat : 0
    valueSatFat : 0
    valueTransFat : 0
    valuePolyFat : 0
    valueMonoFat : 0
    valueCholesterol : 0
    valueSodium : 0
    valuePotassium : 0 // this is for the legacy version
    valuePotassium_2018 : 0 // this is for the 2018 version
    valueTotalCarb : 0
    valueFibers : 0
    valueSugars : 0
    valueAddedSugars : 0
    valueSugarAlcohol : 0
    valueProteins : 0
    
    valueVitaminA : 0 // this is for the legacy version
	valueVitaminA_2018: 0 // this is for the 2018 version, optional
    valueVitaminC : 0 // this is for the legacy version
    valueVitaminC_2018: 0 // this is for the 2018 version, optional
    valueVitaminD : 0
    valueCalcium : 0
    valueIron : 0

### Optional nutrients 2018 only
    valueVitaminE: 0
    valueVitaminK: 0
    valueThiamin: 0
    valueRiboflavin: 0
    valueNiacin: 0
    valueVitaminB6: 0
    valueFolate: 0
    valueVitaminB12: 0
    valueBiotin: 0
    valuePantothenicAcid: 0
    valuePhosphorus: 0
    valueIodine: 0
    valueMagnesium: 0
    valueZinc: 0
    valueSelenium: 0
    valueCopper: 0
    valueManganese: 0
    valueChromium: 0
    valueMolybdenum: 0
    valueChloride: 0


### Customizable units for the values
    unitCalories : ''
    unitFatCalories : ''
    unitTotalFat : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>'
    unitSatFat : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>'
    unitTransFat : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>'
    unitPolyFat : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>'
    unitMonoFat : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>'
    unitCholesterol : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>'
    unitSodium : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>'
    unitPotassium : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>' // this is for the legacy version
    unitPotassium_base : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>' // this is for the 2018 version
    unitPotassium_percent : '%' // this is for the 2018 version
    unitTotalCarb : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>'
    unitFibers : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>'
    unitSugars : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>'
    unitAddedSugars : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>'
    unitSugarAlcohol : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>'
    unitProteins : '<span aria-hidden="true">g</span><span class="sr-only"> grams</span>'
    unitVitaminA : '%'
    unitVitaminA_base: '<span aria-hidden="true"> IU</span><span class="sr-only"> international units</span>' // this is for the 2018 version
    unitVitaminA_percent: "%" // this is for the 2018 version
    unitVitaminC : '%'
    unitVitaminC_base: '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>' // this is for the 2018 version
    unitVitaminC_percent: "%" // this is for the 2018 version
    unitVitaminD_base : '<span aria-hidden="true">mcg</span><span class="sr-only"> micrograms</span>' // this is for the 2018 version
    unitVitaminD_percent : '%' // this is for the 2018 version
    unitCalcium : '%'
    unitCalcium_base : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>' // this is for the 2018 version
    unitCalcium_percent : '%' // this is for the 2018 version
    unitIron : '%'
    unitIron_base : '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>' // this is for the 2018 version
    unitIron_percent : '%' // this is for the 2018 version

### optional nutrients 2018 only
    unitVitaminE_base: '<span aria-hidden="true"> IU</span><span class="sr-only"> international units</span>'
    unitVitaminE_percent: "%"
    unitVitaminK_base: '<span aria-hidden="true"> IU</span><span class="sr-only"> international units</span>'
    unitVitaminK_percent: "%"
    unitThiamin_base: '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>'
    unitThiamin_percent: "%"
    unitRiboflavin_base: '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>'
    unitRiboflavin_percent: "%"
    unitNiacin_base: '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>'
    unitNiacin_percent: "%"
    unitVitaminB6_base: '<span aria-hidden="true">mg</span><span class="sr-only"> milligrams</span>'
    unitVitaminB6_percent: "%"
    unitFolate_base: '<span aria-hidden="true">µg</span><span class="sr-only"> micrograms</span>'
    unitFolate_percent: "%"
    unitVitaminB12_base: '<span aria-hidden="true">µg</span><span class="sr-only"> micrograms</span>'
    unitVitaminB12_percent: "%"
    unitBiotin_base: '<span aria-hidden="true">µg</span><span class="sr-only"> micrograms</span>'
    unitBiotin_percent: "%"
    unitPantothenicAcid_base: '<span aria-hidden="true">mg</span><span class="sr-only"> micrograms</span>'
    unitPantothenicAcid_percent: "%"
    unitPhosphorus_base: '<span aria-hidden="true">mg</span><span class="sr-only"> micrograms</span>'
    unitPhosphorus_percent: "%"
    unitIodine_base: '<span aria-hidden="true">µg</span><span class="sr-only"> micrograms</span>'
    unitIodine_percent: "%"
    unitMagnesium_base: '<span aria-hidden="true">mg</span><span class="sr-only"> micrograms</span>'
    unitMagnesium_percent: "%"
    unitZinc_base: '<span aria-hidden="true">mg</span><span class="sr-only"> micrograms</span>'
    unitZinc_percent: "%"
    unitSelenium_base: '<span aria-hidden="true">µg</span><span class="sr-only"> micrograms</span>'
    unitSelenium_percent: "%"
    unitCopper_base: '<span aria-hidden="true">mg</span><span class="sr-only"> micrograms</span>'
    unitCopper_percent: "%"
    unitManganese_base: '<span aria-hidden="true">mg</span><span class="sr-only"> micrograms</span>'
    unitManganese_percent: "%"
    unitChromium_base: '<span aria-hidden="true">µg</span><span class="sr-only"> micrograms</span>'
    unitChromium_percent: "%"
    unitMolybdenum_base: '<span aria-hidden="true">µg</span><span class="sr-only"> micrograms</span>'
    unitMolybdenum_percent: "%"
    unitChloride_base: '<span aria-hidden="true">mg</span><span class="sr-only"> micrograms</span>'
    unitChloride_percent: "%"
    
### These are the values for the optional calorie diet
    valueCol1CalorieDiet : 2000
    valueCol2CalorieDiet : 2500
    valueCol1DietaryTotalFat : 0
    valueCol2DietaryTotalFat : 0
    valueCol1DietarySatFat : 0
    valueCol2DietarySatFat : 0
    valueCol1DietaryCholesterol : 0
    valueCol2DietaryCholesterol : 0
    valueCol1DietarySodium : 0
    valueCol2DietarySodium : 0
    valueCol1DietaryPotassium : 0
    valueCol2DietaryPotassium : 0
    valueCol1DietaryTotalCarb : 0
    valueCol2DietaryTotalCarb : 0
    valueCol1Dietary : 0
    valueCol2Dietary : 0

### These text settings are so you can create nutrition labels in different languages or to simply change them as needed
    textNutritionFacts : 'Nutrition Facts'
    textDailyValues : 'Daily Value'
    textServingSize : 'Serving Size:'
    textServingsPerContainer : 'Servings Per Container'
    textAmountPerServing : 'Amount Per Serving'
    textCalories : 'Calories'
    textFatCalories : 'Calories from Fat'
    textTotalFat : 'Total Fat'
    textSatFat : 'Saturated Fat'
    textTransFat : '<em>Trans</em> Fat'
    textPolyFat : 'Polyunsaturated Fat'
    textMonoFat : 'Monounsaturated Fat'
    textCholesterol : 'Cholesterol'
    textSodium : 'Sodium'
    textPotassium : 'Potassium'
    textTotalCarb : 'Total Carbohydrates'
    textFibers : 'Dietary Fiber'
    textSugars : 'Sugars'
    textAddedSugars1 : 'Includes '
    textAddedSugars2 : ' Added Sugars'
    textSugarAlcohol : 'Sugar Alcohol'
    textProteins : 'Protein'
    textVitaminA : 'Vitamin A'
    textVitaminC : 'Vitamin C'
    textVitaminD : 'Vitamin D'
    textCalcium : 'Calcium'
    textIron : 'Iron'
    textVitaminE: "Vitamin E"
    textVitaminK: "Vitamin K"
    textThiamin: "Thiamin"
    textRiboflavin: "Riboflavin"
    textNiacin: "Niacin"
    textVitaminB6: "Vitamin B<sub>6</sub>"
    textFolate: "Folate"
    textVitaminB12: "Vitamin B<sub>12</sub>"
    textBiotin: "Biotin"
    textPantothenicAcid: "Pantothenic Acid"
    textPhosphorus: "Phosphorus"
    textIodine: "Iodine"
    textMagnesium: "Magnesium"
    textZinc: "Zinc"
    textSelenium: "Selenium"
    textCopper: "Copper"
    textManganese: "Manganese"
    textChromium: "Chromium"
    textMolybdenum: "Molybdenum"
    textChloride: "Chloride"
    textNotApplicable : '-'
    ingredientList : 'None'
    textPercentDailyPart1 : 'Percent Daily Values are based on a'
    textPercentDailyPart2 : 'calorie diet'
    textPercentDaily2018VersionPart1 : 'The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. '
    textPercentDaily2018VersionPart2 : ' calories a day is used for general nutrition advice.'
    textGoogleAnalyticsEventCategory : 'Nutrition Label'
    textGoogleAnalyticsEventActionUpArrow : 'Quantity Up Arrow Clicked'
    textGoogleAnalyticsEventActionDownArrow : 'Quantity Down Arrow Clicked'
    textGoogleAnalyticsEventActionTextbox : 'Quantity Textbox Changed'

    showLegacyVersion : true

### More details here https://github.com/nutritionix/nutrition-label/issues/77#issuecomment-323510972
    legacyVersion: 1