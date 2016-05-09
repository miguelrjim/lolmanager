/**
 * Created by migue on 5/8/2016.
 */
angular.module('LOLUserManager')
  .controller('Main', ['$scope', '$http',
    function($scope, $http) {
      $scope.regions = [
        'br',
        'eune',
        'euw',
        'jp',
        'kr',
        'lan',
        'las',
        'na',
        'oce',
        'ru',
        'tr'
      ];
      $scope.userToAdd = {
        region: 'lan'
      }
      $http.get('/users')
        .then(response => {
          $scope.users = response.data
        });
      $scope.addUser = () => {
        $http.post('/users/add', $scope.userToAdd)
          .then(response => {
            $scope.users.push(response.data)
          })
      }
      $scope.currentGame = user => {
        $http.get(`/users/${user.id}/currentGame`)
          .then(response => {
            user.inGame = response.data.inGame;
            user.inGameTimestamp = response.data.inGameTimestamp;
          });
      }
    }
  ])