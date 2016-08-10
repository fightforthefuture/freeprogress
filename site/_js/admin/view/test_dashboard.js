var TestDashboardView = function(data) {
    var frag = document.createDocumentFragment();

    var h40 = $c('h4');
    h40.textContent = 'Page Settings';
    frag.appendChild(h40);

    var div0 = $c('div');
    div0.className = 'page_settings';
    frag.appendChild(div0);

    var ul0 = $c('ul');
    var li0 = $c('li');
    var strong0 = $c('strong');
    strong0.textContent = 'Master Twitter Shortcode:';
    li0.appendChild(strong0);
    var span0 = $c('span');
    span0.textContent = data.shortcode_tw_url;
    li0.appendChild(span0);
    var a0 = $c('a');
    a0.href = '#';
    a0.className = 'edit_shortcode_tw';
    a0.textContent = '(change)';
    li0.appendChild(a0);
    ul0.appendChild(li0);
    div0.appendChild(ul0);

    var ul1 = $c('ul');
    var li1 = $c('li');
    var strong1 = $c('strong');
    strong1.textContent = 'Master Facebook Shortcode:';
    li1.appendChild(strong1);
    var span1 = $c('span');
    span1.textContent = data.shortcode_fb_url;
    li1.appendChild(span1);
    var a1 = $c('a');
    a1.href = '#';
    a1.className = 'edit_shortcode_fb';
    a1.textContent = '(change)';
    li1.appendChild(a1);
    ul1.appendChild(li1);
    div0.appendChild(ul1);

    var hr1 = $c('hr');
    frag.appendChild(hr1);

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

    var hr2 = $c('hr');
    frag.appendChild(hr2);

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
