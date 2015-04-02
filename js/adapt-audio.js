/*
 * adapt-audio
 * License - http://github.com/cgkineo/adapt_framework/LICENSE
 */
define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');

    var AudioView = Backbone.View.extend({

        className: "extension-audio",

        initialize: function() {
            this.render();
            this.listenTo(Adapt, 'audio', this.onAudioInvoked);
            this.listenTo(Adapt, 'audio:stop', this.onAudioStop);

            if (Modernizr.audio) {
                this.audio = new Audio();

                $(this.audio).on('ended', _.bind(this.onAudioEnded, this));
            } else if ($("#audioPlayer")[0] == undefined) {
                this.embedFlashAudioPlayer();
            }
        },

        render: function() {
            var template = Handlebars.templates["audio"]
            this.$el.html(template()).appendTo('#wrapper');
            return this;
        },

        embedFlashAudioPlayer: function() {

            window.onFlashAudioFinished = _.bind(this.onAudioEnded, this);

            var params = {
                swliveconnect: "true",
                allowscriptaccess: "always"
            };

            var attributes = {
                id: "audioPlayer",
                name: "audioPlayer"
            };

            swfobject.embedSWF("assets/audioplayer.swf", "flashPlayer", "1", "1", "8.0.22", "assets/express_install.swf", false, params, attributes);

            console.log($("#audioPlayer")[0]);
        },

        play: function() {
            try {
                if (this.audio) this.audio.play();
                else {
                    $("#audioPlayer")[0].loadAudio(this.$active.data('mp3'));
                }
            } catch (e) {
                console.error("play error");
            }
        },

        pause: function() {
            try {
                if (this.audio) this.audio.pause();
                else {
                    $("#audioPlayer")[0].controlAudio("pause");
                }
            } catch (e) {
                console.error("pause error");
            }
        },

        stop: function() {
            try {
                if (this.audio) {
                    this.audio.pause();
                    this.audio.currentTime = 0;
                } else {
                    $("#audioPlayer")[0].controlAudio("pause");
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

                if (Modernizr.audio) {
                    if (this.audio.canPlayType('audio/ogg')) this.audio.src = this.$active.data('ogg');
                    if (this.audio.canPlayType('audio/mpeg')) this.audio.src = this.$active.data('mp3');
                }

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
        }
    });


    Adapt.once("app:dataLoaded", function() {
        new AudioView();
    });

    Adapt.on('router:location', function() {
        Adapt.trigger('audio:stop');
    });

});
