/**
 *
 * @source: http://bitbucket.org/openattic/openattic
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (c) 2017 SUSE LLC
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software
 * Foundation; version 2.
 *
 * This package is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * As additional permission under GNU GPL version 2 section 3, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 1, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */
"use strict";

var app = angular.module("openattic.cephRgw");
app.controller("CephRgwUsersCtrl", function ($scope, $state, $uibModal, cephRgwUserService,
    tabViewService) {
  $scope.users = {};
  $scope.error = false;
  $scope.filterConfig = {
    page: 0,
    entries: null,
    search: "",
    sortfield: null,
    sortorder: null
  };
  $scope.selection = {};
  $scope.tabData = {
    active: 0,
    tabs: {
      status: {
        show: "selection.item",
        state: "ceph-rgw-users.detail.details",
        class: "tc_statusTab",
        name: "Details"
      }
    }
  };
  $scope.tabConfig = {
    type: "ceph-rgw-users",
    linkedBy: "user_id",
    jumpTo: "more"
  };

  tabViewService.setScope($scope);
  $scope.changeTab = tabViewService.changeTab;

  $scope.$watch("filterConfig", function (newVal) {
    if (newVal.entries === null) {
      return;
    }
    cephRgwUserService.filter({
      page: $scope.filterConfig.page + 1,
      pageSize: $scope.filterConfig.entries,
      search: $scope.filterConfig.search,
      ordering: ($scope.filterConfig.sortorder === "ASC" ? "" : "-") + $scope.filterConfig.sortfield
    })
      .$promise
      .then(function (res) {
        $scope.users = res;
      })
      .catch(function (error) {
        $scope.error = error;
      });
  }, true);

  $scope.$watchCollection("selection.items", function (items) {
    $scope.multiSelection = items && items.length > 1;
    $scope.hasSelection = items && items.length === 1;

    if (!items || items.length !== 1) {
      $state.go("ceph-rgw-users");
      return;
    }

    // Load the user/bucket quota of the selected user.
    cephRgwUserService.getQuota({"uid": items[0].user_id})
      .$promise
      .then(function (res) {
        // Append the user/bucket quota.
        items[0].user_quota = res.user_quota;
        items[0].bucket_quota = res.bucket_quota;
      });

    if ($state.current.name === "ceph-rgw-users") {
      $scope.changeTab("ceph-rgw-users.detail.details");
    } else {
      $scope.changeTab($state.current.name);
    }
  });

  $scope.addAction = function () {
    $state.go("ceph-rgw-user-add");
  };

  $scope.editAction = function () {
    $state.go("ceph-rgw-user-edit", {user_id: $scope.selection.item.user_id});
  };

  $scope.deleteAction = function () {
    if (!$scope.hasSelection && !$scope.multiSelection) {
      return;
    }
    var modalInstance = $uibModal.open({
      windowTemplateUrl: "templates/messagebox.html",
      templateUrl: "components/ceph-rgw/templates/cephRgwUserDeleteModal.html",
      controller: "CephRgwUserDeleteModalCtrl",
      resolve: {
        userSelection: function () {
          return $scope.selection.items;
        }
      }
    });
    modalInstance.result.then(function () {
      // Reload the user list.
      $scope.filterConfig.refresh = new Date();
    });
  };
});