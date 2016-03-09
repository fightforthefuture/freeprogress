var PageListView = function(data) {
    var div = document.createDocumentFragment();

    var h3 = $c('h3');
    h3.textContent = 'Pages';
    div.appendChild(h3);

    var ul = $c('ul');
    ul.className = 'pages';
    div.appendChild(ul);

    return div;
};
