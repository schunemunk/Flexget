/* global angular */
(function () {
    'use strict';

    angular
        .module('plugins.movies')
        .controller('addMovieController', addMovieController);

    function addMovieController($scope, $timeout, addMovieService, mdPanelRef, moviesService, $mdPanel) {
        var vm = this;

        vm.panelRef = mdPanelRef.config.locals;
        delete vm.panelRef.mdPanelRef; //Remove circular reference to self

        vm.loading = true;

        var searchWatch = $scope.$watch(function () {
            return mdPanelRef.config.locals.searchtext;
        }, function (newValue, oldValue) {
            vm.searchtext = mdPanelRef.config.locals.searchtext;
            checkSearch(newValue);
        });
        
        addMovieService.setWatcher(searchWatch);
        
        function checkSearch(val) {
            $timeout(function () {
                if (val === vm.searchtext) {
                    vm.loading = true;
                    
                    updatePosition();
                    searchMovies(val).then(function (data) {
                        vm.foundMovies = data;
                        
                        vm.loading = false;

                        updatePosition();
                    });
                }
            }, 1000);
        }

        function updatePosition() {
            $timeout(function () {
                mdPanelRef.updatePosition($mdPanel.newPanelPosition().relativeTo('.search-menu').addPanelPosition($mdPanel.xPosition.ALIGN_END, $mdPanel.yPosition.BELOW));
            }, 0);
        }

        function searchMovies(searchText) {
            var lowercaseSearchText = angular.lowercase(searchText);
            return moviesService.searchMovies(lowercaseSearchText);
        }

        vm.currentList = vm.panelRef.lists[vm.panelRef.selectedlist].id;
        
        vm.addMovietoList = function (movie, list) {
            var movieObject = {
                movie_name: movie.name,
                movie_year: parseInt(movie.year) || undefined,
                movie_identifiers: [
                    { imdb_id: movie.imdb_id }
                ]
            }
            moviesService.addMovieToList(list, movieObject).then(function () {
                $scope.$emit('movie-added-list:' + list);
            });
        }
    }
}());