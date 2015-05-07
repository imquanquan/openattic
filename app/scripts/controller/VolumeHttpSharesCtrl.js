angular.module('openattic')
  .controller('VolumeHttpSharesCtrl', function ($scope, $state, HttpSharesService, $modal) {
    'use strict';

    $scope.httpData = {};

    $scope.httpFilter = {
      page: 0,
      entries: 10,
      search: '',
      sortfield: null,
      sortorder: null,
      volume: null
    };

    $scope.httpSelection = {
    };

    $scope.$watch('selection.item', function(selitem){
      $scope.httpFilter.volume = selitem;
    });

    $scope.$watch('httpFilter', function(){
      if(!$scope.httpFilter.volume){
        return;
      }
      HttpSharesService.filter({
        page:      $scope.httpFilter.page + 1,
        page_size: $scope.httpFilter.entries,
        search:    $scope.httpFilter.search,
        ordering:  ($scope.httpFilter.sortorder === 'ASC' ? '' : '-') + $scope.httpFilter.sortfield,
        volume:    $scope.httpFilter.volume.id
      })
      .$promise
      .then(function (res) {
        $scope.httpData = res;
      })
      .catch(function (error) {
        console.log('An error occurred', error);
      });
    }, true);

    $scope.addHttpAction = function(){
      $state.go('volumes.detail.http-add');
    };

    $scope.deleteHttpAction = function(){
      var modalInstance = $modal.open({
        windowTemplateUrl: 'templates/messagebox.html',
        templateUrl: 'templates/volumes/delete-http-share.html',
        controller: 'HttpShareDeleteCtrl',
        resolve: {
          share: function(){
            return $scope.httpSelection.item;
          }
        }
      });
      
      modalInstance.result.then(function(){
        $scope.filterConfig.refresh = new Date();
      });
    };
  });

// kate: space-indent on; indent-width 2; replace-tabs on;