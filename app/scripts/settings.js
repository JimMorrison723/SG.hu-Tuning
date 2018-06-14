import { unblock } from './modules/topik/blocklist'
import { port, dataStore } from './contentscript'

// chrome.runtime.getURL(string path)
// browser.extension.getURL(string)

export const cp = {

  init: function (page) {

    // Create the settings button
    $('<div id="ext_settings_button"><img src="' + browser.extension.getURL('/images/settings/icon.png') + '" alt="SG tuning beállítások" title="SG tuning beállítások"></div>').appendTo('body')

    // Create the hiding overlay
    $('<div id="ext_settings_hide_overlay"></div>').appendTo('body')

    // Create click event for settings pane
    $('#ext_settings_button').click(function () {

      if ($('#ext_settings_wrapper').hasClass('opened')) {
        cp.hide()
      } else {
        cp.show()
      }
    })

    // Inject the html code
    let html = ''

    html += '<div id="ext_settings_wrapper">'
      html += '<ul id="ext_settings_header">'
        html += '<li>Névjegy</li>'
        html += '<li>Főoldal</li>'
        html += '<li>Topik</li>'
        html += '<li>Egyéb</li>'
        html += '<li>Profilok</li>'
        html += '<li>Tiltólista</li>'
        html += '<li class="clear"></li>'
      html += '</ul>'

      html += '<div class="settings_page">'
        html += '<h3>SG Fórum tuning</h3>'
        html += '<p>Verzió: 3.9.9</p>'
        html += '<p>Kiadás dátuma: 2018. 05. 23.</p>'
        html += '<p>Fejlesztő: JimMorrison723 <a href="https://jimmorrison723.hu" target="_blank">https://jimmorrison723.hu</a>, Gera János "dzsani" <a href="https://github.com/dzsani" target="_blank">https://github.com/dzsani</a></p>'
        html += '<p>Közreműködők: Viszt Péter "passatgt" <a href="http://visztpeter.me" target="_blank">http://visztpeter.me</a>, Krupa György "pyro"</p>'
      html += '</div>'

      html += '<div class="settings_page">'
        html += '<div>'
          html += '<h3>Chat elrejtése</h3>'
          html += '<p>Ezzel az opcióval a fórum főoldalon levő közös chatet tüntethted el maradéktalanul.</p>'
          html += '<div class="button" id="chatHide"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Csak olvasatlan üzenttel rendelkező kedvencek mutatása</h3>'
          html += '<p class="sub">'
          html += '<label><input type="checkbox" id="favShowOnlyUnreadRemember"> Utolsó állapot megjegyzése</label><br>'
          html += '</p>'
          html += '<p>A fórum főoldalán található kedvencek listában csak az olvasatlan üzenettel rendelkező topikok lesznek listázva. A bővítmény létrehoz tovább egy kapcsolót a kedvencek cím mellett mellyel könnyen visszaválthatsz a régi nézetre.</p>'
          html += '<div class="button" id="favShowOnlyUnread"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Rövid kommentjelzők</h3>'
          html += '<p>A főoldali kedvencek listában nem jelenik meg helyet foglalva új sorban az "N új üzeneted érkezett" szöveg, ehelyett helytakarékos módon csak egy piros szám jelzi az új üzeneteket a topik neve mellett.</p>'
          html += '<div class="button" id="shortCommentMarker"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Fórumkategóriák kiemelése</h3>'
          html += '<p>A fórum főoldalon átalakított, átdizájnolt listákat láthatsz, mely jobban kiemeli többek között a kedvenceknél a fórumkategóriákat is.</p>'
          html += '<div class="button" id="highlightForumCategories"></div>'
        html += '</div>'
      html += '</div>'

      html += '<div class="settings_page">'
        html += '<div>'
          html += '<h3>Ugrás az utolsó üzenethez</h3>'
          html += '<p>Az "ugrás az utolsó olvasatlan üzenethez" több oldalon keresztül is működik, egy topikba lépve automatikusan az utolsó üzenethez görget.</p>'
          html += '<div class="button" id="jumpUnreadMessages"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Következő oldal betöltése a lap aljára érve</h3>'
          html += '<p>A lap aljára görgetve a bővítmény a háttérben betölti a következő oldal tartalmát, majd megjeleníti az új kommenteket oldalfrissítés vagy lapozás nélkül.</p>'
          html += '<div class="button" id="autoloadNextPage"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Overlay kommentmező</h3>'
          html += '<p>Egy hozzászólásra válaszolva az oldal nem ugrik fel a felső textarához, ehelyett kiemeli a megválaszolandó kommentet és egy overlay szövegmező jelenik meg alatta.</p>'
          html += '<div class="button" id="overlayReplyTo"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Nekem érkező üzenetek kiemelése</h3>'
          html += '<p>Bármely topikban a neked címzett üzenetek mellé egy narancssárga nyíl kerül, ezzel jelezve hogy ezt az üzenetet neked szánták.</p>'
          html += '<div class="button" id="highlightCommentsForMe"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Kommentek szálonkénti elrendezése</h3>'
          html += '<p>Bármely topikban a megkezdett beszélgetéseket szálonként átrendezi a script. Egy megválaszolt üzenet az eredeti üzenet alá kerül, ezzel jelezve és elkülönítve az egymásnak szánt üzeneteket.</p>'
          html += '<div class="button" id="threadedComments"></div>'
        html += '</div>'
          // html += '<div>';
          // html += '<h3>WYSIWYG Editor</h3>';
          // html += '<p>Office-szerű formázógombokat kapsz a kommentíró mezőbe élő előnézettel.</p>';
          // html += '<div class="button" id="wysiwygEditor"></div>';
          // html += '</div>';
        html += '<div>'
          html += '<h3>Topikba érkező új üzenetek automatikus kinyerése</h3>'
          html += '<p>Amíg egy topikban tartózkodsz, a bővítmény automatikusan kinyeri az olvasás ideje alatt érkező új üezenteket.</p>'
          html += '<div class="button" id="fetchNewComments"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Navigációs gombok megjelenítése</h3>'
          html += '<p class="sub">'
            html += 'Gombok helye: '
            html += '<select id="navigationButtonsPosition">'
              html += '<option value="lefttop">Bal felül</option>'
              html += '<option value="leftcenter">Bal középen</option>'
              html += '<option value="leftbottom">Bal alul</option>'
              html += '<option value="righttop">Jobb felül</option>'
              html += '<option value="rightcenter">Jobb középen</option>'
              html += '<option value="rightbottom">Jobb alul</option>'
            html += '</select>'
          html += '</p>'
          html += '<p class="sub">'
            html += '<label><input type="checkbox" id="navigationButtonNightState"> Éjszakai / szemkímélő mód kapcsoló</label><br>'
          html += '</p>'
          html += '<p>Egy topikban vagy a cikkeknél gyors elérést biztosító funkciógombok</p>'
          html += '<div class="button" id="showNavigationButtons"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Pontrendszer letiltása</h3>'
          html += '<p>Ez az opció eltávolítja a pontozó gombokat és minden rejtett hozzászólást láthatóvá tesz.</p>'
          html += '<div class="button" id="disablePointSystem"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Hosszú kommentek oszloposítása</h3>'
          html += '<p>Meghatározott karakterszám felett a bővítmény oszlopokra bontja az üzeneteket a könnyebb olvashatóság miatt. </p>'
          html += '<div class="button" id="columnifyComments"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Info gomb a hozzászólás fejlécében</h3>'
          html += '<p>Létrehoz egy "info" gombot a hozzászólás fejlécében, amiben megjelennek a felhasználó adatai.</p>'
          html += '<div class="button" id="quickUserInfo"></div>'
        html += '</div>'
        html += '<div>'
          html += '<h3>Gyors beszúrás</h3>'
          html += '<p>A vágólapról bemásolt linket autómatikusan bbcode tagek közé rakja.</p>'
          html += '<div class="button" id="quickInsertion"></div>'
        html += '</div>'
      //   html += '<div>';
      //     html += '<h3>Külső média hivatkozások előnézete</h3>';
      //     html += '<p>Hozzászólásokban a hivatkozások után egy kis gombra kattintva betöltődik a hivatkozott tartalom (kép, videó, tweet).</p>';
      //     html += '<div class="button" id="inlineImageViewer"></div>';
      //   html += '</div>';
      html += '</div>'

      html += '<div class="settings_page">'
        html += '<div>'
          html += '<h3>Reklámok blokkolása</h3>'
          html += '<p>Ezzel az opcióval eltávolítható az összes reklám az sg.hu-n. (Továbbá a fórum főoldalon található FB doboz!)</p>'
          html += '<div class="button" id="removeAds"></div>'
        html += '</div>'
      html += '</div>'

      html += '<div class="settings_page">'
        html += '<ul class="profiles">'
          html += '<li class="sample">'
            html += '<input type="hidden" name="color" class="color" value="ff4242,ffc9c9">'
            html += '<span class="color" style="background-color: #ff4242"></span>'
            html += '<input type="text" name="title" class="title" value="Profil elnevezése">'
            html += '<ul>'
              html += '<li style="background-color: #ffc9c9"><span>ff4242,ffc9c9</span></li>'
              html += '<li style="background-color: #f2c9ff"><span>d13eff,f2c9ff</span></li>'
              html += '<li style="background-color: #c6c6ff"><span>4242ff,c6c6ff</span></li>'
              html += '<li style="background-color: #c6e9ff"><span>4ebbff,c6e9ff</span></li>'
              html += '<li style="background-color: #d5ffc6"><span>6afe36,d5ffc6</span></li>'
              html += '<li style="background-color: #fdffc6"><span>f8ff34,fdffc6</span></li>'
              html += '<li style="background-color: #ffe7c6"><span>ffa428,ffe7c6</span></li>'
              html += '<li style="background-color: #e1e1e1"><span>a9a9a9,e1e1e1</span></li>'
            html += '</ul>'
            html += '<textarea name="users" class="users">Felhasználók</textarea>'
            html += '<p class="options">'
              html += 'Opciók:'
              html += '<label><input type="checkbox" name="background" class="background"> Hozzászólás hátterének kiemelése</label>'
            html += '</p>'
            html += '<p class="remove">eltávolít</p>'
          html += '</li>'
        html += '</ul>'
        html += '<button class="profile_save">Változások mentése</button>'
        html += '<a href="#" class="new_profile">Új csoport hozzáadása</a>'
      html += '</div>'

      html += '<div class="settings_page">'
        html += '<ul id="ext_blocklist">'
          html += '<li id="ext_empty_blocklist">Jelenleg üres a tiltólistád</li>'
        html += '</ul>'
      html += '</div>'

    html += '</div>'

    // Append settings pane html to body

    $(html).appendTo('body')

    let ext_header = $('#ext_settings_header')
    let settings_button = $('.settings_page .button')

    // Set header list backgrounds
    ext_header.find('li').css({ 'background-image': 'url(' + browser.extension.getURL('/images/settings/icons.png') + ')' })

    // Create tabs event
    ext_header.find('li').click(function () {

      cp.tab($(this).index())
    })

    // Add buttons background image
    settings_button.css({ 'background-image': 'url(' + browser.extension.getURL('/images/settings/button.png') + ')' })

    // Get the requested page number
    let sPage = typeof page === 'undefined' ? 0 : page

    // Select the right page
    cp.tab(sPage)

    // Set-up blocklist
    blocklist_cp.init()

    // Close when clicking away
    $('#ext_settings_hide_overlay').click(function () {
      cp.hide()
    })

    // Restore settings
    settings.restore()

    // Settings change event, saving
    settings_button.click(function () {
      cp.button(this)
    })

    // Set checkboxes
    $('.settings_page input:checkbox').click(function () {
      settings.save(this)
    })

    // Set select boxes
    $('.settings_page select').change(function () {
      settings.select(this)
    })

    // Init profiles settings
    profiles_cp.init()
  },

  show: function () {

    let ext_h_overlay = $('#ext_settings_hide_overlay')
    let ext_s_wrapper = $('#ext_settings_wrapper')

    // Set the overlay
    ext_h_overlay.css({ display: 'block', opacity: 0 })
    ext_h_overlay.animate({ opacity: 0.6 }, 200)

    // Get the viewport and panel dimensions
    let viewWidth = $(window).width()
    let paneWidth = ext_s_wrapper.width()
    let paneHeight = ext_s_wrapper.height()
    let leftProp = viewWidth / 2 - paneWidth / 2

    // Apply calculated CSS settings to the panel
    ext_s_wrapper.css({ left: leftProp, top: '-' + (paneHeight + 10) + 'px' })

    // Reveal the panel
    ext_s_wrapper.delay(250).animate({ top: 10 }, 250)

    // Add 'opened' class
    ext_s_wrapper.addClass('opened')

  },

  hide: function () {

    let ext_s_wrapper = $('#ext_settings_wrapper')

    // Get the settings pane height
    let paneHeight = ext_s_wrapper.height()

    // Hide the pane
    ext_s_wrapper.animate({ top: '-' + (paneHeight + 10) + 'px' }, 200, function () {

      // Hide the settings pane
      $(this).css('top', -9000)

      // Restore the overlay
      $('#ext_settings_hide_overlay').animate({ opacity: 0 }, 100, function () {
        $(this).css('display', 'none')
      })

      // Remove 'opened' class
      $('#ext_settings_wrapper').removeClass('opened')
    })
  },

  tab: function (index) {

    let ext_s_wrapper = $('#ext_settings_wrapper')
    let settings_page = $('.settings_page')
    let ext_settings_header = $('#ext_settings_header')

    // Set the current height to prevent resize
    ext_s_wrapper.css({ height: ext_s_wrapper.height() })

    // Hide all tab pages
    settings_page.css('display', 'none')

    // Show the selected tab page
    settings_page.eq(index).fadeIn(250)

    // Get new height of settings pane
    let newPaneHeight = ext_settings_header.height() + settings_page.eq(index).outerHeight()

    // Animate the resize
    ext_s_wrapper.stop().animate({ height: newPaneHeight }, 150, function () {

      // Set auto height
      ext_s_wrapper.css({ height: 'auto' })
    })

    // Remove all selected background in the header
    ext_settings_header.find('li').removeClass('on')

    // Add selected background to the selectad tab button
    ext_settings_header.find('li').eq(index).addClass('on')
  },

  button: function (ele) {

    if ($(ele).hasClass('on')) {
      $(ele).animate({ 'background-position-x': 0 }, 300)
      $(ele).attr('class', 'button off')

      settings.save(ele)
    } else {

      // TODO: css animate
      $(ele).animate({ 'background-position-x': -40 }, 300)
      $(ele).attr('class', 'button on')

      settings.save(ele)
    }
  }
}

export const blocklist_cp = {

  init: function () {

    // Create user list
    blocklist_cp.list()

    // Create remove events
    $('#ext_blocklist').on('click', 'a', function (e) {
      e.preventDefault()
      blocklist_cp.remove(this)
    })
  },

  list: function () {
    // If theres is no entry in dataStore or If the list is empty
    if (!dataStore['blocklisted']) {
      return false
    }

    let blocklist = $('#ext_blocklist')
    // Everything is OK, remove the default message
    blocklist.html('')

    // Fetch the userlist into an array
    let users = dataStore['blocklisted'].split(',').sort()

    // Iterate over, add users to the list
    for (let c = 0; c < users.length; c++) {
      blocklist.append('<li><span>' + users[c] + '</span> <a href="#">töröl</a></li>')
    }
  },

  remove: function (el) {

    // Get username
    let user = $(el).prev().html()

    // Remove user from the list
    $(el).closest('li').remove()

    // Remove user from preferences
    port.postMessage({ name: 'removeUserFromBlocklist', message: user })

    // Add default message to the list if it is now empty
    if ($('#ext_blocklist').find('li').length === 0) {
      $('<li id="ext_empty_blocklist">Jelenleg üres a tiltólistád</li>').appendTo('#ext_blocklist')
    }

    // Restore user comments
    unblock(user)
  }
}

export const settings = {

  restore: function () {

    // Restore settings for buttons
    $('.settings_page .button').each(function () {

      if (dataStore[$(this).attr('id')] === true) {
        $(this).attr('class', 'button on')

      } else {
        $(this).attr('class', 'button off')
      }
    })

    // Restore settings for checkboxes
    $('input:checkbox').each(function () {

      if (dataStore[$(this).attr('id')] === true) {
        $(this).attr('checked', true)
      } else {
        $(this).attr('checked', false)
      }
    })

    // Restore settings for select boxes
    $('.settings_page select').each(function () {

      $(this).find('option[value="' + dataStore[$(this).attr('id')] + '"]').attr('selected', true)
    })
  },

  save: function (ele) {

    if ($(ele).hasClass('on') || $(ele).prop('checked') === true || $(ele).is(':checked')) {
      // Save new settings ...
      port.postMessage({ name: 'setSetting', key: $(ele).attr('id'), val: true })

      // Set new value to dataStore var
      dataStore[$(ele).attr('id')] = true

      // Check for interactive action
      if (typeof window[$(ele).attr('id')].activated !== 'undefined') {
        window[$(ele).attr('id')].activated()
      }

    } else {

      // Save new settings ...
      port.postMessage({ name: 'setSetting', key: $(ele).attr('id'), val: false })

      // Set new value to dataStore var
      dataStore[$(ele).attr('id')] = false

      // Check for interactive action
      if (typeof window[$(ele).attr('id')].disabled !== 'undefined') {
        window[$(ele).attr('id')].disabled()
      }
    }
  },

  select: function (ele) {

    // Get the settings value
    let val = $(ele).find('option:selected').val()

    // Update in dataStore
    dataStore[$(ele).attr('id')] = val

    // Update in localStorage
    port.postMessage({ name: 'setSetting', key: $(ele).attr('id'), val: val })
  },

  create: function (settings) {
    dataStore = settings
  },

  update: function (message) {
    for (const [key, value] of Object.entries(message)) {
      dataStore[key] = value
    }
    settings.restore()
  }
}

const profiles_cp = {

  init: function () {

    // Add new profile group
    $('.settings_page a.new_profile').on('click', function (e) {
      e.preventDefault()
      profiles_cp.addGroup()
    })

    // Color select
    $('.settings_page .profiles').on('click', 'li ul li', function () {
      profiles_cp.changeColor(this)
    })

    // Remove a group
    $('.settings_page ul.profiles').on('click', 'p.remove', function () {
      profiles_cp.removeGroup(this)
    })

    // Save the settings
    $('.settings_page .profile_save').on('click', function (e) {

      // Prevent browsers default submission
      e.preventDefault()

      // Save the settings
      profiles_cp.save()
    })

    // Rebuild profiles
    profiles_cp.rebuildProfiles()
  },

  rebuildProfiles: function () {

    if (!dataStore['profilesList']) {
      return false
    }

    // Empty the list
    $('.settings_page .profiles > li:not(.sample)').remove()

    let profiles = JSON.parse(dataStore['profilesList'])

    for (let c = 0; c < profiles.length; c++) {

      // Get the clone elementent
      let clone = $('.settings_page .profiles li.sample').clone()

      // Get the target element
      let target = $('.settings_page .profiles')

      // Append the new group
      let content = $(clone).appendTo(target).removeClass('sample')

      // Re-set settings
      content.find('.color').val(profiles[c]['color'])
      content.find('span.color').css('background-color', '#' + profiles[c]['color'][0])
      content.find('.title').val(profiles[c]['title'])
      content.find('.users').val(profiles[c]['users'])

      // Re-set checkboxes
      if (profiles[c]['background']) {
        content.find('.background').attr('checked', true)
      }
    }
  },

  addGroup: function () {

    // Get the clone elementent
    let clone = $('.settings_page .profiles li.sample').clone()

    // Get the target element
    let target = $('.settings_page .profiles')

    // Append the new group
    $(clone).appendTo(target).removeClass('sample')
  },

  removeGroup: function (ele) {

    if (confirm('Biztos törlöd ezt a csoportot?')) {

      // Remove the group from DOM
      $(ele).closest('li').remove()
    }
  },

  changeColor: function (ele) {

    // Get selected color
    let color = $(ele).find('span').html().split(',')

    // Set the color indicator
    $(ele).parent().parent().find('span:first').css('background-color', '#' + color[0])

    // Set the color input
    $(ele).parent().parent().find('input.color').val(color.join(','))
  },

  save: function () {

    // Var to store data
    let data = []

    // Iterate over the groups
    $('.settings_page .profiles > li:not(.sample)').each(function (index) {

      // Create an new empty object for the group settings
      data[index] = {}

      // Prefs
      data[index]['color'] = $(this).find('.color').val().split(',')
      data[index]['title'] = $(this).find('.title').val()
      data[index]['users'] = $(this).find('.users').val().split(',')

      // Options
      data[index]['background'] = $(this).find('.background').prop('checked')
    })

    // Save settings in localStorage
    port.postMessage({ name: 'setSetting', key: 'profilesList', val: JSON.stringify(data) })

    // Save new settings in dataStore
    dataStore['profilesList'] = JSON.stringify(data)

    // Saved indicator
    $('<p class="profile_status">&#10003;</p>').insertAfter($('.settings_page .profile_save'))

    // Remove the idicator in 2 sec
    setTimeout(function () {
      $('.settings_page .profile_status').remove()
    }, 3000)
  }
}