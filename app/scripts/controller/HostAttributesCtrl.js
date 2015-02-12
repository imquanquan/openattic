angular.module('openattic')
  .controller('HostAttributesCtrl', function ($scope, $state, $stateParams, PeerHostService, InitiatorService) {
    $scope.data = {
      peerhosts: [],
      iscsiInis: [],
      fcInis:    []
    };

    $scope.host = $scope.selection.item;

    $scope.peerHostAdded = function(tag){
      PeerHostService.save({
        'base_url': tag.text,
        'host':     {'id': $scope.host.id}
      })
      .$promise
      .then(function(res){
        tag.id = res.id;
      }, function(error){
        var index = $scope.data.peerhosts.indexOf(tag);
        if (index > -1) {
          $scope.data.peerhosts.splice(index, 1);
        }
        $.smallBox({
          title: 'Error adding Peer Host',
          content: '<i class="fa fa-clock-o"></i> <i>' + error.data.base_url.join(', ') + '.</i>',
          color: '#C46A69',
          iconSmall: 'fa fa-times fa-2x fadeInRight animated',
          timeout: 4000
        });
      });
    };

    $scope.peerHostRemoved = function(tag){
      PeerHostService.delete({'id': tag.id});
    };

    PeerHostService.get({host: $stateParams.host})
      .$promise
      .then(function(res){
        for( var i = 0; i < res.results.length; i++ ){
          $scope.data.peerhosts.push({'text': res.results[i].base_url, 'id': res.results[i].id});
        }
      }, function(error){
        console.log('An error occurred', error);
      });

    var iniAdded = function(tag, type){
      InitiatorService.save({
        'wwn':  tag.text,
        'type': type,
        'host': {'id': $scope.host.id}
      })
      .$promise
      .then(function(res){
        tag.id = res.id;
      }, function(error){
        if( type === 'iscsi' ){
          var index = $scope.data.iscsiInis.indexOf(tag);
          if (index > -1) {
            $scope.data.iscsiInis.splice(index, 1);
          }
        }
        else{
          var index = $scope.data.fcInis.indexOf(tag);
          if (index > -1) {
            $scope.data.fcInis.splice(index, 1);
          }
        }
        $.smallBox({
          title: 'Error adding Initiator',
          content: '<i class="fa fa-clock-o"></i> <i>' + error.data.wwn.join(', ') + '.</i>',
          color: '#C46A69',
          iconSmall: 'fa fa-times fa-2x fadeInRight animated',
          timeout: 4000
        });
      });
    };

    $scope.iscsiIniAdded = function(tag){
      return iniAdded(tag, 'iscsi');
    };

    $scope.fcIniAdded = function(tag){
      return iniAdded(tag, 'qla2xxx');
    };

    $scope.iniRemoved = function(tag){
      InitiatorService.delete({'id': tag.id});
    };

    InitiatorService.get({host: $stateParams.host})
      .$promise
      .then(function(res){
        for( var i = 0; i < res.results.length; i++ ){
          if( res.results[i].type === 'iscsi' ){
            $scope.data.iscsiInis.push({'text': res.results[i].wwn, 'id': res.results[i].id});
          }
          else{
            $scope.data.fcInis.push({'text': res.results[i].wwn, 'id': res.results[i].id});
          }
        }
      }, function(error){
        console.log('An error occurred', error);
      });

    $scope.submitAction = function() {
    }

    $scope.cancelAction = function() {
        goToListView();
    }

    var goToListView = function() {
        $state.go('hosts');
    }
  });

// kate: space-indent on; indent-width 2; replace-tabs on;
