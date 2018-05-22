import { Module } from '../module'

export const textareaAutoResize = new Module('textareaAutoResize')

textareaAutoResize.height = 72

textareaAutoResize.activate = () => {

  let textarea = $('textarea[name=message]')

  // Create the text holder element
  $('<div id="ext_textheight"></div>').prependTo('body');

  textarea.css({
    'resize': 'none',
    'overflow': 'hidden',
    'min-height': '122px',
    'max-height': '600px',
    'font-size': '16px'
  })

  // textarea[0].height(textareaAutoResize.height)
  // Create the keyup event
  textarea.on('keydown', function () {

    textareaAutoResize.setHeight(this);
  })

  textareaAutoResize.height = textarea.height();
}

textareaAutoResize.setHeight = (ele) => {

  // Get element value
  var val = $(ele).val();
  var ext_height = $('#ext_textheight');
console.log(val)
  // Escape the value
  val = val.replace(/</gi, '&lt;');
  val = val.replace(/>/gi, '&gt');
  //val = val.replace(/\ /gi, '&nbsp;');
  val = val.replace(/\n/gi, '<br>');

  // Set the textholder element width
  ext_height.css('width', $(ele).width());

  // Set the text holder element's HTML
  ext_height.html(val);

  // Get the text holder element's height
  var height = ext_height.height() + 12;

  // Check for expand
  if (height > $(ele).height()) {
    $(ele).height($(ele).height() + 50);
  }

  // Check for shrink
  if ($(ele).height() > textareaAutoResize.height && height < $(ele).height()) {

    var newHeight = height < textareaAutoResize.height ? textareaAutoResize.height : height;

    $(ele).height(newHeight);
  }
}