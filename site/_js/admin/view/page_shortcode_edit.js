var PageShortcodeEditView = function(data) {
    var
        modal = $c('div'),
        close = $c('button'),
        headline = $c('h2'),
        shortcodeLabel = $c('label'),
        shortcodeHint = $c('span'),
        shortcode = $c('input'),
        form = $c('form'),
        hr = $c('hr'),
        button = $c('button');

    modal.classList.add('modal', 'form');
    close.classList.add('close');

    close.textContent = '⨉';
    headline.textContent = 'Edit Master '+data.type+' Shortcode';

    shortcodeLabel.textContent = 'Shortcode';
    form.appendChild(shortcodeLabel);

    shortcodeHint.textContent = 'Remember: you can\'t use a shortcode that is already being used in another place!';
    shortcodeHint.className = 'hint';
    form.appendChild(shortcodeHint);

    shortcode.name = 'shortcode';
    shortcode.type = 'text';
    shortcode.value = data.shortcode ? data.shortcode : '';
    form.appendChild(shortcode);

    button.textContent = 'Submit';
    form.appendChild(button);


    modal.appendChild(close);
    modal.appendChild(headline);

    modal.appendChild(hr);
    modal.appendChild(form);

    return modal;

};
