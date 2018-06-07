define([
    'core/js/adapt'
], function(Adapt) {

    var AudioView = Backbone.View.extend({

        className: "extension-audio",

        initialize: function() {
            this.render();

            this.listenTo(Adapt, {
                'audio': this.onAudioInvoked,
                'audio:stop': this.onAudioStop,
                'media:stop': this.onMediaStop
            });

            this.audio = new Audio();

            $(this.audio).on('ended', this.onAudioEnded.bind(this));
        },

        render: function() {
            var template = Handlebars.templates["audio"];
            this.$el.html(template()).appendTo('#wrapper');
            return this;
        },

        play: function() {
            try {
                if (this.audio) {
                    Adapt.trigger('media:stop', this);// stop any media component that learner might have left playing
                    this.audio.play();
                }
            } catch (e) {
                console.error("play error");
            }
        },

        pause: function() {
            try {
                if (this.audio) this.audio.pause();
            } catch (e) {
                console.error("pause error");
            }
        },

        stop: function() {
            try {
                if (this.audio) {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                }
            } catch (e) {
                console.error("stop error");
            }
        },

        onAudioInvoked: function(el) {
            var $el = $(el);

            if (this.$active && this.$active.is($el)) {
                if (this.$active.hasClass('play')) {
                    this.$active.addClass('pause').removeClass('play');
                    this.play();
                } else {
                    this.$active.addClass('play').removeClass('pause');
                    this.pause();
                }
            } else {
                if (this.$active) {
                    this.$active.addClass('play').removeClass('pause');
                    this.pause();
                }

                this.$active = $el;
                this.$active.addClass('pause').removeClass('play');

                this.audio.src = this.$active.data('mp3');

                this.play();
            }
        },

        onAudioEnded: function() {
            if (this.$active) {
                this.$active.addClass('play').removeClass('pause');
            }
            this.stop();
        },

        onAudioStop: function(el) {
            if (el == null || el == undefined) {
                // console.log('stop any audio currently playing');
                if (this.$active) {
                    this.$active.addClass('play').removeClass('pause');
                    this.stop();
                }
            } else if (this.$active && (this.$active.is(el) || this.$active.parents(el).length > 0)) {
                // console.log('stop audio for specific element/descendents if currently playing');
                if (this.$active) {
                    this.$active.addClass('play').removeClass('pause');
                    this.stop();
                }
            }
        },

        /**
         * handler for the event broadcast by the media component (and possibly others)
         * to tell any currently playing media to stop playback
         */
        onMediaStop: function (view) {
            if (view && view.cid === this.cid) return; // if we were the originator of the event, ignore it!

            this.onAudioStop();
        }
    });


    Adapt.once("app:dataLoaded", function() {
        new AudioView();
    });

    Adapt.on('router:location', function() {
        Adapt.trigger('audio:stop');
    });

});
