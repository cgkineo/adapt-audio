adapt-audio
===========

An extension which provides basic audio playback capability to components.

Installation
============

First, be sure to install the [Adapt Command Line Interface](https://github.com/cajones/adapt-cli), then from the command line run:-

        adapt install adapt-audio

Usage
=====

Add audio capability to any part of any template by specifying the audio-controls partial:

{{> audio-controls this}}

The context (this) should have a corresponding _audio attribute in the relevant part of the components JSON with the following format:

"_audio": {
  ["autoplay":true|false|"inview",]
	"ogg":"course/en/audio/audio.ogg",
	"mp3":"course/en/audio/audio.mp3"
}

NEW: specify the autoplay attribute and set it to true for audio to play on component creation or "inview" to play audio when the component comes into view. N.B. this will no work on mobile/tablet devices.

The audio-controls partial provides the UI which consists of a single play/pause toggle button.

In components that will support audio listen to the click event on the toggle button(s). Trigger the 'audio' event on the Adapt object, passing in the current event target, e.g:

function onAudioButtonClicked:function(event) {
	if (event) event.preventDefault();
	Adapt.trigger('audio', event.currentTarget);
}

To avoid repetition the event declaration and handler can be located in ComponentView, but ensure that ComponentView descendent classes extend rather than override the event declaration(s).

Using with other extensions
===========================

It is possible to utilise this extension with other extensions. For example, to enable Tutor to deliver audio with question feedback customise the QuestionView class to add additional properties to the model when feedback is set up:

setupCorrectFeedback: function() {

    this.model.set({
        ...
        feedbackAudio: this.model.get("_feedbackAudio") ? this.model.get("_feedbackAudio").correct : {}
    });
}

setupPartlyCorrectFeedback: function() {

    if (this.model.get('_attemptsLeft') === 0 || !this.model.get('_feedback')._partlyCorrect.notFinal) {
        this.model.set({
            ...
            feedbackAudio: this.model.get("_feedbackAudio") ? this.model.get("_feedbackAudio")._partlyCorrect.final : {}
        });
    } else {
        this.model.set({
            ...
            feedbackAudio: this.model.get("_feedbackAudio") ? this.model.get("_feedbackAudio")._partlyCorrect.notFinal : {}
        });
    }
}

setupIncorrectFeedback: function() {

    if (this.model.get('_attemptsLeft') === 0 || !this.model.get('_feedback')._incorrect.notFinal) {
        this.model.set({
            ...
            feedbackAudio: this.model.get("_feedbackAudio") ? this.model.get("_feedbackAudio")._incorrect.final : {}
        });
    } else {
        this.model.set({
            ...
            feedbackAudio: this.model.get("_feedbackAudio") ? this.model.get("_feedbackAudio")._incorrect.notFinal : {}
        });
    }
}

Typically, when Tutor is invoked any audio that is playing should be stopped. To do this trigger the 'audio:stop' event on the Adapt object:

Adapt.trigger('audio:stop');

Equally, when Tutor is closed any audio associated with it should be stopped.

Modify the Tutor Handlebars template to include the audio controls, e.g:

{{> audio-controls feedbackAudio}}

As for components, listen for the click event on the toggle button and trigger the 'audio' event on the Adapt object, passing in the current event target.

Finally add the _feedbackAudio attributes to the components JSON, e.g:

"_feedbackAudio":{
  "correct":{
    "_audio": {
      "mp3": "course/en/audio/correct.mp3",
      "ogg": "course/en/audio/correct.ogg"
    }
  },
  "_incorrect": {
    "final": {
      "_audio": {
        "mp3": "course/en/audio/incorrect.mp3",
        "ogg": "course/en/audio/incorrect.ogg"
      }
    }
  },
  "_partlyCorrect": {
    "final": {
      "_audio": {
        "mp3": "course/en/audio/partlycorrect.mp3",
        "ogg": "course/en/audio/partlycorrect.ogg"
      }
    }
  }
}