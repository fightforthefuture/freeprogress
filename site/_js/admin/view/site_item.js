var SiteItemView = function(data) {
    var frag = document.createDocumentFragment();

    var a = $c('a');
    a.textContent = data.host;
    a.className = 'site';
    a.href = '#';
    frag.appendChild(a);

    var div = $c('div');
    frag.appendChild(div);

    return frag;
};
