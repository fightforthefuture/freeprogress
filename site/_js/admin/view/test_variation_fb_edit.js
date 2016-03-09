var TestVariationFBEditView = function(data) {
    var
        modal = $c('div'),
        close = $c('button'),
        headline = $c('h2'),
        copy = $c('p'),
        span = $c('span'),
        a = $c('a'),
        hr = $c('hr'),
        form = $c('form'),
        titleLabel = $c('label'),
        title = $c('input'),
        descriptionLabel = $c('label'),
        descriptionHint = $c('span'),
        description = $c('input'),
        siteNameLabel = $c('label'),
        siteName = $c('input'),
        urlLabel = $c('label'),
        url = $c('input'),
        categoryLabel = $c('label'),
        categoryList = $c('div'),
        imageLabel = $c('label'),
        image = $c('input'),
        imagePlaceholder = $c('img'),
        button = $c('button');

    modal.classList.add('modal', 'form');
    close.classList.add('close');

    close.textContent = '⨉';
    headline.textContent = (data.id ? 'Edit' : 'Create') + ' Facebook Variation' + (data.id ? ' (ID: ' + data.id + ') ' : '');
    span.textContent = 'Please fill out this form honestly. It is a felony to knowingly upload false information. If you suspect you may have unintentionally knowingly uploaded false information, please report the incident '

    a.href = 'https://tips.fbi.gov/';
    a.textContent = 'here';

    titleLabel.textContent = 'Title';
    form.appendChild(titleLabel);

    title.name = 'title';
    title.type = 'text';
    title.value = data.title ? data.title : '';
    form.appendChild(title);

    descriptionLabel.textContent = 'Description';
    form.appendChild(descriptionLabel);

    descriptionHint.textContent = 'Verbosity will be punished severely.';
    descriptionHint.className = 'hint';
    form.appendChild(descriptionHint);

    description.name = 'description';
    description.type = 'text';
    description.value = data.description ? data.description : '';
    form.appendChild(description);

    siteNameLabel.textContent = 'Site Name';
    form.appendChild(siteNameLabel);

    siteName.name = 'site_name';
    siteName.type = 'text';
    siteName.value = data.site_name ? data.site_name : '';
    form.appendChild(siteName);

    urlLabel.textContent = 'Page URL';
    form.appendChild(urlLabel);

    url.name = 'url';
    url.type = 'text';
    url.value = data.url ? data.url : '';
    form.appendChild(url);

    imageLabel.textContent = 'Share image';
    form.appendChild(imageLabel);

    image.type = 'file';
    image.name = 'image';
    form.appendChild(image);

    if (data.image_url)
      imagePlaceholder.src = data.image_url;

    form.appendChild(imagePlaceholder);

    button.textContent = 'Submit';
    form.appendChild(button);

    copy.appendChild(span);
    copy.appendChild(a);
    modal.appendChild(close);
    modal.appendChild(headline);
    //modal.appendChild(copy);
    modal.appendChild(hr);
    modal.appendChild(form);

    return modal;

};
