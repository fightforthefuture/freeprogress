var TestDashboardView = function(data) {
    var frag = document.createDocumentFragment();

    var h41 = $c('h4');
    h41.textContent = 'Twitter Variations';
    frag.appendChild(h41);

    var a1 = $c('a');
    a1.href = '#';
    a1.textContent = '(create new)';
    a1.className = 'new_variation_tw';
    h41.appendChild(a1);

    var ul1 = $c('div');
    ul1.className = 'variation_tws';
    frag.appendChild(ul1);

    var h42 = $c('h4');
    h42.textContent = 'Facebook Variations';
    frag.appendChild(h42);

    var a2 = $c('a');
    a2.href = '#';
    a2.textContent = '(create new)';
    a2.className = 'new_variation_fb';
    h42.appendChild(a2);

    var ul2 = $c('div');
    ul2.className = 'variation_fbs';
    frag.appendChild(ul2);

    return frag;
};
