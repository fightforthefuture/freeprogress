var TestVariationTWView = function(data) {
    var frag = document.createDocumentFragment();


    var stats = $c('div');
    stats.className = 'stats';

    var shares = $c('div');
    shares.className = 'shares';
    var caption = $c('strong');
    caption.textContent = 'shares:';
    var span = $c('span');
    span.textContent = data.shares;
    shares.appendChild(caption);
    shares.appendChild(span);
    stats.appendChild(shares);

    var clicks = $c('div');
    clicks.className = 'clicks';
    var caption = $c('strong');
    caption.textContent = 'clicks:';
    var span = $c('span');
    span.textContent = data.clicks;
    clicks.appendChild(caption);
    clicks.appendChild(span);
    stats.appendChild(clicks);

    frag.appendChild(stats);

    var actions = $c('ul');
    actions.className = 'actions';

    var li = $c('li');
    var a = $c('a');
    a.className = 'edit';
    a.textContent = 'edit'
    a.href = '#';
    li.appendChild(a);
    actions.appendChild(li);

    var li = $c('li');
    var a = $c('a');
    a.className = 'delete';
    a.textContent = 'delete'
    a.href = '#';
    li.appendChild(a);
    actions.appendChild(li);

    var li = $c('li');
    var a = $c('a');
    a.className = 'duplicate';
    a.textContent = 'new duplicate'
    a.href = '#';
    li.appendChild(a);
    actions.appendChild(li);

    frag.appendChild(actions);

    var preview = $c('div');
    preview.className = 'preview';

    var strong = $c('strong');
    strong.textContent = data.tweet_text;
    preview.appendChild(strong);

    var hr = $c('hr');
    preview.appendChild(hr);

    var a = $c('a');
    a.href = '#';
    a.textContent = data.title;
    preview.appendChild(a);

    var span = $c('span');
    span.textContent = data.description;
    preview.appendChild(span);

    if (data.image_url) {
      var img = $c('img');
      img.src = data.image_url;
      preview.appendChild(img);
    }

    var span = $c('span');
    span.className = 'site_name';
    span.textContent = data.site_name;
    preview.appendChild(span);

    frag.appendChild(preview);

    return frag;
};
