Nutrition Label jQuery Plugin by Nutritionix
============================================

[See a Demo!](http://dev2.nutritionix.com/html/label-jquery-plugin/demo/demo-mini.html)

Summary: Create a FDA-style nutrition label with any nutrition data source (even the [Nutritionix API](http://www.nutritionix.com/api)!)

Note: This will probably work with the latest jQuery and Bootstrap version without any issue but it's not yet tested using those versions.

Installation
------------

**getting the files from github and including the required files using cdn**
```sh
git clone git@github.com:nutritionix/nutrition-label.git
```

```html
<!-- include the needed font from google api -->
<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Archivo+Black" />
<!-- include the bootstrap css file from maxcdn -->
<link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/2.3.0/css/bootstrap.min.css">
<!-- include the nutrition label plugin css file -->
<link rel="stylesheet" type="text/css" href="/bower_components/nutrition-label-jquery-plugin/dist/css/nutritionLabel-min.css">
<!-- include the jquery library from the google cdn -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
<!-- include the nutrition label plugin js file -->
<script type="text/javascript" src="/bower_components/nutrition-label-jquery-plugin/dist/js/nutritionLabel-min.js"></script>
```

***

**using bower**
```sh
bower install --save nutrition-label-jquery-plugin
```

```html
<!-- include the needed font from google api -->
<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Archivo+Black" />
<!-- include the bootstrap css file -->
<link rel="stylesheet" type="text/css" href="/bower_components/bootstrap/dist/css/bootstrap.min.css">
<!-- include the nutrition label plugin css file -->
<link rel="stylesheet" type="text/css" href="/bower_components/nutrition-label-jquery-plugin/dist/css/nutritionLabel-min.css">
<!-- include the jquery library -->
<script type="text/javascript" src="/bower_components/jquery/dist/jquery.min.js"></script>
<!-- include the nutrition label plugin js file -->
<script type="text/javascript" src="/bower_components/nutrition-label-jquery-plugin/dist/js/nutritionLabel-min.js"></script>
```


Usage
-----

Check out this [demo](http://dev2.nutritionix.com/html/label-jquery-plugin/demo/demo-mini.html). for some sample usage
You can find more on the [/demo](https://github.com/nutritionix/nutrition-label/tree/master/demo) folder
