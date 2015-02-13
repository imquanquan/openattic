angular.module('openattic')
  .controller('VolumeStorageCtrl', function ($scope, VolumeService) {
    'use strict';
    new VolumeService($scope.selection.item).$storage().then(function (res) {
      $scope.active_volume_storage = res;
    });
  });

// kate: space-indent on; indent-width 2; replace-tabs on;