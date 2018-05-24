adapt-audio
===========

An extension which provides basic audio playback capability to components.

Installation
============

First, be sure to install the [Adapt Command Line Interface](https://github.com/adaptlearning/adapt-cli/), then from the command line run:-
```bash
$ adapt install adapt-audio
```
Usage
=====

Add audio capability to any part of any template by specifying the audio-controls partial:
```hbs
{{> audio-controls this}}
```
The context (this) should have a corresponding `_audio` attribute in the relevant part of the components JSON with the following format:
```json
"_audio": {
    "mp3":"course/en/audio/audio.mp3"
}
```
The audio-controls partial provides the UI which consists of a single play/pause toggle button.

In components that will support audio, listen to the click event on the toggle button(s) by adding this to the events hash:
```js
'click .audio-controls .icon':'onAudioCtrlsClick'
```

Then add a handler function for this that triggers the 'audio' event on the Adapt object, passing in the current event target, e.g:
```js
onAudioCtrlsClick: function(e) {
    if (e) e.preventDefault();
    Adapt.trigger('audio', e.currentTarget);
}
```
If including the audio extension in multiple components you can avoid repetition by including the event declaration and handler in ComponentView.js - just ensure that ComponentView descendant classes extend rather than override the event declaration(s).

Using with other extensions
===========================
It is possible to utilise this extension with other extensions. 

For example, to enable Tutor to deliver audio with question feedback, customise [questionModel.js](https://github.com/adaptlearning/adapt_framework/blob/master/src/core/js/models/questionModel.js) to add additional properties to the model when feedback is set up. 

For example, to have correct feedback audio, take the existing `setupCorrectFeedback` function:

```js
setupCorrectFeedback: function() {
    this.set({
	feedbackTitle: this.get('title'),
	feedbackMessage: this.get("_feedback") ? this.get("_feedback").correct : ""
    });
},
```
And modify it like so:
```js
setupCorrectFeedback: function() {
    this.set({
        feedbackTitle: this.get('title'),
        feedbackMessage: this.get("_feedback") ? this.get("_feedback").correct : "",
        feedbackAudio: this.get("_feedbackAudio") ? this.get("_feedbackAudio").correct : {}
    });
},
```
Similarly, for incorrect feedback audio, take the original function:
```js
setupIncorrectFeedback: function() {
    if (this.get('_attemptsLeft') === 0 || this.get('_feedback') && !this.get('_feedback')._incorrect.notFinal) {
        this.set({
            feedbackTitle: this.get('title'),
            feedbackMessage: this.get("_feedback") ? this.get('_feedback')._incorrect.final : ""
        });
    } else {
        this.set({
            feedbackTitle: this.get('title'),
            feedbackMessage: this.get("_feedback") ? this.get('_feedback')._incorrect.notFinal : ""
        });
    }
},
```
and modify it to:
```js
setupIncorrectFeedback: function() {
    if (this.get('_attemptsLeft') === 0 || this.get('_feedback') && !this.get('_feedback')._incorrect.notFinal) {
        this.set({
            feedbackTitle: this.get('title'),
            feedbackMessage: this.get("_feedback") ? this.get('_feedback')._incorrect.final : "",
            feedbackAudio: this.get("_feedbackAudio") ? this.get("_feedbackAudio")._incorrect.final : {}
        });
    } else {
        this.set({
            feedbackTitle: this.get('title'),
            feedbackMessage: this.get("_feedback") ? this.get('_feedback')._incorrect.notFinal : "",
            feedbackAudio: this.get("_feedbackAudio") ? this.get("_feedbackAudio")._incorrect.notFinal : {}
        });
    }
},
```
You should be able to figure out how to modify `setupPartlyCorrectFeedback` from the above.

Note: if you are using a version of Adapt older than 2.0.10 there will be no questionModel.js - you will instead need to modify the functions in core/js/views/questionView.js in a similar manner - just change any references to `this.set` to `this.model.set`.

Modify the [Notify Handlebars template](https://github.com/adaptlearning/adapt_framework/blob/master/src/core/templates/notify.hbs) to include the audio controls by adding the following handlebars expression to it:
```hbs
{{> audio-controls feedbackAudio}}
```
Then edit [notifyView.js](https://github.com/adaptlearning/adapt_framework/blob/master/src/core/js/views/notifyView.js) and add the following to its events hash:
```js
'click .audio-controls .icon':'onAudioCtrlsClick'
```
Then add the matching `onAudioCtrlsClick` handler function (see above).

Next, edit [adapt-contrib-tutor.js](https://github.com/adaptlearning/adapt-contrib-tutor/blob/master/js/adapt-contrib-tutor.js) to include a `feedbackAudio` property in the `alertObject`:
```js
var alertObject = {
    title: view.model.get("feedbackTitle"),
    body: view.model.get("feedbackMessage"),
    feedbackAudio: view.model.get("feedbackAudio")
};
```
Finally add the `_feedbackAudio` attributes to the components JSON, e.g:
```json
"_feedbackAudio":{
  "correct":{
    "_audio": {
      "mp3": "course/en/audio/correct.mp3"
    }
  },
  "_incorrect": {
    "final": {
      "_audio": {
        "mp3": "course/en/audio/incorrect.mp3"
      }
    }
  },
  "_partlyCorrect": {
    "final": {
      "_audio": {
        "mp3": "course/en/audio/partlycorrect.mp3"
      }
    }
  }
}
```

Typically, when Tutor is invoked any audio that is playing should be stopped. To do this trigger the `'audio:stop'` event on the `Adapt` object:
```js
Adapt.trigger('audio:stop');
```
Equally, when Tutor is closed any audio associated with it should be stopped - which can be done by adding the above event to `closeNotify` in [notifyView.js](https://github.com/adaptlearning/adapt_framework/blob/master/src/core/js/views/notifyView.js)
