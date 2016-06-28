var TestVariationTWEditController = BaseTestVariationEditController.extend({

    elements: {
        'textarea[name="tweet_text"]': 'tweet_text',
        'input[name="title"]': 'title',
        'input[name="description"]': 'description',
        // 'input[name="site"]': 'site',
        'input[name="url"]': 'url',
        'input[name="image"]': 'imageInput',
        'img': 'imagePlaceholder',
        'form button': 'submitButton'
    },

    events: {
        'change input[type=file]': 'handleFile',
        'submit form': 'submit'
    },

    render: function() {
        var overlay = this.base_render();
        var view    = TestVariationTWEditView(this.model.toJSON());

        overlay.firstChild.appendChild(view);

        this.html(overlay);
    },

    grabFormData: function() {
      return {
        tweet_text: this.tweet_text.value,
        title: this.title.value,
        description: this.description.value,
        // site: this.site.value,
        url: this.url.value
      };
    }
});
