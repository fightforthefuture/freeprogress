var PageListView = function(data) {
    var div = document.createDocumentFragment();

    var ul = $c('ul');
    ul.className = 'pages';
    div.appendChild(ul);

    return div;
};
