/**
 * Tool favorites - localStorage, no registration.
 * Key: toolforge_favorites = JSON array of tool file names.
 */
(function(){
  "use strict";
  var KEY = "toolforge_favorites";

  function getFavorites() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setFavorites(arr) {
    try {
      localStorage.setItem(KEY, JSON.stringify(arr));
      return true;
    } catch (e) {
      return false;
    }
  }

  function isFavorite(file) {
    return getFavorites().indexOf(file) !== -1;
  }

  function toggleFavorite(file) {
    var list = getFavorites();
    var i = list.indexOf(file);
    if (i === -1) list.push(file);
    else list.splice(i, 1);
    setFavorites(list);
    return list.indexOf(file) !== -1;
  }

  function addFavorite(file) {
    var list = getFavorites();
    if (list.indexOf(file) === -1) {
      list.push(file);
      setFavorites(list);
    }
    return true;
  }

  function removeFavorite(file) {
    var list = getFavorites();
    var i = list.indexOf(file);
    if (i !== -1) {
      list.splice(i, 1);
      setFavorites(list);
    }
    return true;
  }

  window.ToolFavorites = {
    get: getFavorites,
    set: setFavorites,
    is: isFavorite,
    toggle: toggleFavorite,
    add: addFavorite,
    remove: removeFavorite
  };
})();
