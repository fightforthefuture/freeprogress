var PageItemView = function(data) {
    var frag = document.createDocumentFragment();

    var strong = $c('strong');

    strong.textContent = 'Page: ';
    frag.appendChild(strong);

    var a = $c('a');
    a.className = 'page';
    a.textContent = data.path;
    a.href = '#';
    frag.appendChild(a);

    var div = $c('div');
    frag.appendChild(div);

    return frag;
};
