// DEFINED Prototype FUNCTION

function _ntx(id) {
 
    // About object is returned if there is no 'id' parameter
    var about = {
        Version: 0.1,
        Author: "Nutritionix",
        Created: "Dec 19th 2012",
        Updated: "initial commit"
    };
 
    if (id) {
 
        // Avoid clobbering the window scope:
        // return a new _ntx object if we're in the wrong scope
        if (window === this) {
            return new _ntx(id);
        }
 
        // We're in the correct object scope:
        // Init our element object and return the object
        this.e = document.getElementById(id);
        return this;
    } else {
    // No 'id' parameter was given, return the 'about' object
        return about;
    }
};

/*    _ntx Prototype Functions
============================*/
_ntx.prototype = {
	label:  function(n) {
		// Setting the element that was passed in
		var nutritionDiv = this.e;
		// nutritionDiv.innerHTML = "<a href='google.com'>Hello</a>"
		// document.write("SUCCESS");


		// USER DEFINES PARAMS IN FUNCTION
		// ReDefining here removes what user set
		// var n = BAD!!!!

		// Build Label
		// DONT Escape chars unless nessacary
		// use single inside of double to achieve same effect.
		var nutritionLabel="";
		nutritionLabel += "<div class='nutritionLabel'>";
		nutritionLabel += "            <div class='title'>Nutrition Facts</div>";
		nutritionLabel += "            <div class='serving'>";
		nutritionLabel += "                <div>Serving Size " + n.serving_size_qty + " " + n.serving_size_unit + "(" + n.serving_weight_grams + "g)</div>";
		nutritionLabel += "                <div>Servings Per Container " + n.servings_per_container + "</div>";
		nutritionLabel += "            </div>";
		nutritionLabel += "            <div class='bar1'></div>";
		nutritionLabel += "            <div class='line m'>";
		nutritionLabel += "                <b>Amount Per Serving</b>";
		nutritionLabel += "            </div>";
		nutritionLabel += "            <div class='line'>";
		nutritionLabel += "                <div class='fr'>Calories from Fat " + n.calories_from_fat + "</div>";
		nutritionLabel += "                <div>";
		nutritionLabel += "                    <b>Calories</b> " + n.calories + "</div>";
		nutritionLabel += "            </div>";
		nutritionLabel += "            <div class='bar2'></div>";
		nutritionLabel += "            <div class='line ar'>";
		nutritionLabel += "                <b>% Daily Value</b>";
		nutritionLabel += "            </div>";
		nutritionLabel += "            <div class='line'>";
		nutritionLabel += "                <div class='dv'>";
		nutritionLabel += "                    <b>18</b>%</div>";
		nutritionLabel += "                <b>Total Fat</b> "+n.total_fat+"</div>";
		nutritionLabel += "            <div class='line indent'>";
		nutritionLabel += "                <div class='dv'>";
		nutritionLabel += "                    <b>15</b>%</div>Saturated Fat "+n.saturated_fat+"</div>";
		nutritionLabel += "            <div class='line indent'>";
		nutritionLabel += "                <i>Trans</i>Fat 12g</div>";
		nutritionLabel += "            <div class='line'>";
		nutritionLabel += "                <div class='dv'>";
		nutritionLabel += "                    <b>10</b>%</div>";
		nutritionLabel += "                <b>Cholesterol</b> "+n.cholesterol+"</div>";
		nutritionLabel += "            <div class='line'>";
		nutritionLabel += "                <div class='dv'>";
		nutritionLabel += "                    <b>20</b>%</div>";
		nutritionLabel += "                <b>Sodium</b> "+n.sodium+"</div>";
		nutritionLabel += "            <div class='line'>";
		nutritionLabel += "                <div class='dv'>";
		nutritionLabel += "                    <b>10</b>%</div>";
		nutritionLabel += "                <b>Total Carbohydrate</b> "+n.total_carbohydrate+"</div>";
		nutritionLabel += "            <div class='line indent'>";
		nutritionLabel += "                <div class='dv'>";
		nutritionLabel += "                    <b>0</b>%</div>Dietary Fiber "+n.dietary_fiber+"</div>";
		nutritionLabel += "            <div class='line indent'>Sugars "+n.sugars+"</div>";
		nutritionLabel += "            <div class='line'>";
		nutritionLabel += "                <b>Proteins</b> "+n.protein+"</div>";
		nutritionLabel += "            <div class='bar1'></div>";
		nutritionLabel += "            <div class='line'>";
		nutritionLabel += "                <div class='dv'>4%</div>Vitamin A</div>";
		nutritionLabel += "            <div class='line'>";
		nutritionLabel += "                <div class='dv'>2%</div>Vitamin C</div>";
		nutritionLabel += "            <div class='line'>";
		nutritionLabel += "                <div class='dv'>20%</div>Calcium</div>";
		nutritionLabel += "            <div class='line last'>";
		nutritionLabel += "                <div class='dv'>4%</div>Iron</div>";
		nutritionLabel += "            <div class='dvCalorieDiet'>";
		nutritionLabel += "                <div class='calorieNote'>";
		nutritionLabel += "                    <span class='star'>*</span>Percent Daily Values are based on a 2,000 calorie diet. Your Daily";
		nutritionLabel += "                    Values may be higher or lower depending on your calorie needs:</div>";
		nutritionLabel += "            </div>";
		nutritionLabel += "        </div>";


		// WRITE TO HTML
		nutritionDiv.innerHTML = nutritionLabel;

		return this;
	}
};