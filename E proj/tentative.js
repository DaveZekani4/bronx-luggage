const app = angular.module("myApp", []);

app.controller("myController", function($scope, $http) {
    $http.get("../Bronx.json").then(function(response) {
      // Filter the items based on the condition
      var filteredProducts = response.data.for_men.filter(function(product) {
        return product.category === "Suitcases";
      });
      
      // Assign the first ten items to the $scope.products variable
      $scope.products = filteredProducts.slice(0, 10);
    });
  });
  
  