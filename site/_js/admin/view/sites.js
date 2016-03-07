var SitesView = function(data) {
    var div = document.createDocumentFragment();

    var h2 = $c('h2');
    h2.textContent = 'Sites Admin';
    div.appendChild(h2);

    var container = $c('div');
    container.className = 'list_container';
    div.appendChild(container);

    return div;
};
