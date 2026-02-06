import { Module } from '../Module'
import { getUserInfo } from '@/utils/api'
import { formatDateTime } from '@/utils/time'

export const quickUserInfo = new Module('quickUserInfo')

//Place info image
quickUserInfo.activate = () => {

  $('#forum-posts-list').find('.post[class!="quick-user-info"]').each(function () {

    $(this).addClass('quick-user-info')
    $(this).find('span.icons').after('<span class="ext_quick_user_info_btn"><img src="' + browser.runtime.getURL('/images/content/info.png') + '"></span>')
  })

  // Create modal, this will hold the data
  $('body').append('<div id="ext-modal" class="ext-modal"><div class="ext-modal-content"><div class="ext-modal-header"><span class="ext-modal-close">&times;</span><h2></h2></div><div class="ext-modal-body"><p></p></div></div></div>')

  quickUserInfo.addEventListener()
}

quickUserInfo.addEventListener = () => {

  const modal = $('#ext-modal')

  $(document).on('click', '.ext_quick_user_info_btn', (event) => {

    // Get user id
    const userId = $(event.currentTarget).siblings('a[href*="felhasznalo"]').attr('href')?.replace('/felhasznalo/', '') || ''

    quickUserInfo.fillData(modal, userId)

    modal[0].style.display = 'block'
  })

  // Event handler for close button
  $(document).on('click', '.ext-modal-close', () => {
    modal[0].style.display = 'none'
  })

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target === modal[0]) {
      modal[0].style.display = 'none'
    }
  }
}

interface OpenedTopic {
  _listingUrl: string
  created: string
  title: string
}

quickUserInfo.fillData = async (modal: JQuery, userID: string) => {
  try {
    const data = await getUserInfo(userID)

    // Format modal body
    const html = `<dl>
          <dt>Admin</dt><dd>${data.isMod === '1' ? 'Igen' : 'Nem'}</dd>
          <dt>Büntetőpontok</dt><dd>${data.buntetopontok}</dd>
          <dt>Üzenetek száma</dt><dd>${data.uzenetek || '0'}</dd>
          <dt>Csillagjegy</dt><dd>${data._zodiac || '-'}</dd>
          <dt>Életkor</dt><dd>${data._age || '-'}</dd>
          <dt>Neme</dt><dd>${data.nem === 'f' ? 'Férfi' : data.nem === '' ? '-' : 'Nő'}</dd>
          <dt>Honlap</dt><dd>${data.honlap || '-'}</dd>
          <dt>Hobby</dt><dd>${data.hobby || '-'}</dd>
          <dt>Iskola</dt><dd>${data.iskola || '-'}</dd>
          <dt>Foglalkozás</dt><dd>${data.foglalkozas || '-'}</dd>
          <dt>Regisztráció időpontja</dt><dd>${data.created_at}</dd>
          <dt>Utolsó üzenet időpontja</dt><dd>${formatDateTime(new Date(parseInt(data.forum_last_post) * 1000))}</dd>
          <dt>Utolsó látogatás időpontja</dt><dd>${data.updated_at}</dd>
          <dt>Megnyitott témák</dt>
              ${data.openedTopics.map((item: OpenedTopic) => `
                <dd><a href="${item._listingUrl}" target="_blank">${formatDateTime(new Date(parseInt(item.created) * 1000))} - ${item.title}</a></dd>
              `.trim()).join('') || '<dd>-</dd>'}
          </dl>`

    // Set modal texts
    modal.find('h2').text(data.nick)
    modal.find('p').html(html)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load user info:', error)
    modal.find('p').html('<p>Hiba történt a felhasználói adatok betöltésekor.</p>')
  }
}
