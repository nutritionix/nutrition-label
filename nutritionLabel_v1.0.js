// Define Nutrition Variables
var n = {
	"nf_serving_size_unit":"",
	"nf_serving_size_qty":"",
	"nf_serving_weight_grams":"",
	"nf_servings_per_container":"",
	"nf_calories":"",
	"nf_calories_from_fat":"",
	"nf_total_fat":"",
	"nf_saturated_fat":"",
	"nf_monounsaturated_fat":"",
	"nf_polyunsaturated_fat":"",
	"nf_trans_fatty_acid":"",
	"nf_cholesterol":"",
	"nf_sodium":"",
	"nf_total_carbohydrate":"",
	"nf_dietary_fiber":"",
	"nf_sugars":"",
	"nf_protein":"",
	"nf_vitamin_a_iu":"",
	"nf_vitamin_a_dv":"",
	"nf_vitamin_c_mg":"",
	"nf_vitamin_c_dv":"",
	"nf_calcium_mg":"",
	"nf_calcium_dv":"",
	"nf_iron_mg":"",
	"nf_iron_dv":"";
}

// example call
// n.servings_per_container
// gives you the value of that property in the hash

// ntx(nutriVariables);
// RENDERS | BELOW CONTENT

var nutritionLabel="";
nutritionLabel += "<div class=\"nutritionLabel\">";
nutritionLabel += "            <div class=\"title\">Nutrition Facts<\/div>";
nutritionLabel += "            <div class=\"serving\">";
nutritionLabel += "                <div>Serving Size " + n.nf_serving_size_qty + " " + n.nf_serving_size_unit + "(" + n.nf_serving_weight_grams + "g)</div>";
nutritionLabel += "                <div>Servings Per Container<\/div>";
nutritionLabel += "            <\/div>";
nutritionLabel += "            <div class=\"bar1\"><\/div>";
nutritionLabel += "            <div class=\"line m\">";
nutritionLabel += "                <b>Amount Per Serving<\/b>";
nutritionLabel += "            <\/div>";
nutritionLabel += "            <div class=\"line\">";
nutritionLabel += "                <div class=\"fr\">Calories from Fat 110<\/div>";
nutritionLabel += "                <div>";
nutritionLabel += "                    <b>Calories<\/b>250<\/div>";
nutritionLabel += "            <\/div>";
nutritionLabel += "            <div class=\"bar2\"><\/div>";
nutritionLabel += "            <div class=\"line ar\">";
nutritionLabel += "                <b>% Daily Value<\/b>";
nutritionLabel += "            <\/div>";
nutritionLabel += "            <div class=\"line\">";
nutritionLabel += "                <div class=\"dv\">";
nutritionLabel += "                    <b>18<\/b>%<\/div>";
nutritionLabel += "                <b>Total Fat<\/b>12g<\/div>";
nutritionLabel += "            <div class=\"line indent\">";
nutritionLabel += "                <div class=\"dv\">";
nutritionLabel += "                    <b>15<\/b>%<\/div>Saturated Fat 12g<\/div>";
nutritionLabel += "            <div class=\"line indent\">";
nutritionLabel += "                <i>Trans<\/i>Fat 12g<\/div>";
nutritionLabel += "            <div class=\"line\">";
nutritionLabel += "                <div class=\"dv\">";
nutritionLabel += "                    <b>10<\/b>%<\/div>";
nutritionLabel += "                <b>Cholesterol<\/b>30mg<\/div>";
nutritionLabel += "            <div class=\"line\">";
nutritionLabel += "                <div class=\"dv\">";
nutritionLabel += "                    <b>20<\/b>%<\/div>";
nutritionLabel += "                <b>Sodium<\/b>470g<\/div>";
nutritionLabel += "            <div class=\"line\">";
nutritionLabel += "                <div class=\"dv\">";
nutritionLabel += "                    <b>10<\/b>%<\/div>";
nutritionLabel += "                <b>Total Carbohydrate<\/b>31g<\/div>";
nutritionLabel += "            <div class=\"line indent\">";
nutritionLabel += "                <div class=\"dv\">";
nutritionLabel += "                    <b>0<\/b>%<\/div>Dietary Fiber 12g<\/div>";
nutritionLabel += "            <div class=\"line indent\">Sugars 12g<\/div>";
nutritionLabel += "            <div class=\"line\">";
nutritionLabel += "                <b>Proteins<\/b>12g<\/div>";
nutritionLabel += "            <div class=\"bar1\"><\/div>";
nutritionLabel += "            <div class=\"line\">";
nutritionLabel += "                <div class=\"dv\">4%<\/div>Vitamin A<\/div>";
nutritionLabel += "            <div class=\"line\">";
nutritionLabel += "                <div class=\"dv\">2%<\/div>Vitamin C<\/div>";
nutritionLabel += "            <div class=\"line\">";
nutritionLabel += "                <div class=\"dv\">20%<\/div>Calcium<\/div>";
nutritionLabel += "            <div class=\"line last\">";
nutritionLabel += "                <div class=\"dv\">4%<\/div>Iron<\/div>";
nutritionLabel += "            <div class=\"dvCalorieDiet\">";
nutritionLabel += "                <div class=\"calorieNote\">";
nutritionLabel += "                    <span class=\"star\">*<\/span>Percent Daily Values are based on a 2,000 calorie diet. Your Daily";
nutritionLabel += "                    Values may be higher or lower depending on your calorie needs:<\/div>";
nutritionLabel += "            <\/div>";
nutritionLabel += "        <\/div>";

document.write(nutritionLabel);
