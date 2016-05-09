/**
 * Created by migue on 5/8/2016.
 */
angular.module('LOLUserManager')
  .filter('moment', () => {
    return date => {
      return moment(date).fromNow();
    }
  })