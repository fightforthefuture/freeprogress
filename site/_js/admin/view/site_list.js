var SiteListView = function(data) {
    var div = document.createDocumentFragment();

    var h2 = $c('h2');
    h2.textContent = 'Sites Admin';
    div.appendChild(h2);

    var ul = $c('ul');
    div.appendChild(ul);

    return div;
};
