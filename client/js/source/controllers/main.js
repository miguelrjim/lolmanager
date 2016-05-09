/**
 * Created by migue on 5/8/2016.
 */
angular.module('LOLUserManager')
  .controller('Main', ['$scope', '$http',
    function($scope, $http) {
      $scope.regions = [
        "br",
        "eune",
        "euw",
        "jp",
        "kr",
        "lan",
        "las",
        "na",
        "oce",
        "ru",
        "tr"
      ]
      $http.get('/users')
        .then(response => {
          $scope.users = response.data
        });
      $scope.addUser = function() {
        $http.post('/users/add', $scope.userToAdd)
          .then(response => {
            $scope.users.push(response.data)
          })
      }
    }
  ])