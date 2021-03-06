'use strict';

const podcastURL = 'https://listen-api.listennotes.com/api/v2/search';
const textEntitiesURL = 'https://api.dandelion.eu/datatxt/nex/v1/';

const listenNotesKey = config.PODCAST_KEY;
const dandelionKey = config.TEXT_WIKI_KEY;

// Listens for scrolling past a certain point, displays back to top 
// button, and if button is clicked, takes user back to top
function backToTop() {
  const backToTop = $('.back-to-top');

  $(window).scroll(function() {
    if ($(window).scrollTop() > 300) {
      backToTop.removeClass('hidden');
    } else {
      backToTop.addClass('hidden');
    }
  });

  backToTop.on('click', function() {
    $('html, body').animate({scrollTop:0}, '300');
  });
}

// Listens for user to click on go-back button, if clicked, goes back 
// to podcast results display while continuing to display the podcast 
// player.
function backButton() {
  $('.flex-parent').on('click', '.go-back', event => {
    $('.selected-podcast').scrollTop(0);
    $('.selected-podcast, .full-description, .listen-notes-link, .wikipedia, .flex-parent').addClass('hidden');
    $('.podcast-results, .search-container').show();
    $('.podcast-description').removeClass('hidden');
    $('.js-selected').removeClass('js-selected');
    $('.js-error-message').empty();
    $('.wikipedia-frame').remove();
    $('.wikipedia').append(`
      <iframe class="wikipedia-frame"
        title="Wikipedia Page"
        name="wiki_iframe"
        src="preloader.html">
      </iframe>
    `);

    // Adjusts height for podcast player.
    $('.podcast-results').css('max-height', 'calc(100vh - 273px');
  });

  showOnePodcast();
}

// Listens for user clicking Wikipedia link, if so, shows Wikipedia 
// and scrolls to it on mobile screen.
function showWikipedia() {
  $('.wiki-results').on('click', 'a', event => {
    $('.wikipedia').removeClass('hidden');
    $('html, body').animate({scrollTop: $('.wikipedia-frame').offset().top}, 500);
  });
}

// If there are any duplicae objects in results, filters them out.
function removeDuplicates(myArr, prop) {
  return myArr.filter((obj, ind, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === ind;
  });
}

// Renders the results from calling the dandelion API, displays
// links to related Wikipedia articles.
function displayDandelionResults(responseJson) {
  let arrayOfUniqueResults = removeDuplicates(responseJson.annotations, 'label');

  $('.wiki-list').empty();

  for (let i = 0; i < arrayOfUniqueResults.length; i++) {
    $('.wiki-list').append(`
      <li><a href="https://en.m.wikipedia.org/wiki/${arrayOfUniqueResults[i].title}" target="wiki_iframe"><p class="wiki-title">${arrayOfUniqueResults[i].title}</p><p class="abstract">${arrayOfUniqueResults[i].abstract}</p></a></li>
    `);
  }

  $('.abstract').each(function() {
    $(this).text(($(this).text().substring(0, 300)));
  });
  $('.abstract').append('...');

  $('.wiki-list').append(`<li class="wiki-title"><a href="https://m.wikipedia.org" target="wiki_iframe">Search Wikipedia <i class="fas fa-search"></i></a></li>`);

  showWikipedia();
  backButton();
  backToTop();
}

// Takes description from selected podcast and calls dandelion API.
function getEntities(description) {
  const dandelionParams = {
    token: dandelionKey,
    lang: 'en',
    min_confidence: 0.5,
    include: 'abstract',
    text: description
  }

  const dandelionQueryString = formatQueryParams(dandelionParams);
  const url = textEntitiesURL + '?' + dandelionQueryString;

  fetch(url)
    .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
    })
    .then(responseJson => displayDandelionResults(responseJson))
    .catch(error => {
      $('.js-error-message').html(`<p><i class="far fa-flushed"></i></p><p>Uh-oh, something went wrong: ${error.message}. Try reloading the page and repeating your request.</p>`);
      $('.js-error-message').addClass('.error-style');
    });
}

// Shows a single selected podcast with more detailed information
// and podcast player ready to play that podcast.
function showOnePodcast() {
  $('.podcast-results').one('click', '.podcast-card', function(event) {
    $(this).addClass('js-selected');
    const selectedPodcastHTML = $('.js-selected').html();
    $('.podcast-info').html(selectedPodcastHTML);
    $('.podcast-description, .start-onboarding').addClass('hidden');
    $('.full-description, .listen-notes-link, .selected-podcast, .podcast-player, .flex-parent').removeClass('hidden');
    $('.podcast-results, .search-container').hide();

    let selectedDescription = $('.js-selected > .full-description').text();

    if (selectedDescription.length > 2000) {
      selectedDescription = selectedDescription.substring(0, 2000);
    }

    getEntities(selectedDescription);

    //takes idnum from hidden p above and inserts it into embedded player
    const selectedIDNum = $('.js-selected > .idnum').text();
    const playerURL = 'https://www.listennotes.com/embedded/e/' + selectedIDNum + '/';
    $('.player').attr('src',playerURL);
  })
  
  if ($('.podcast-player').hasClass('hidden') === false) {
    $('.main').addClass('shorter-screen');
  } else {
    $('.main').removeClass('shorter-screen');
    $('.podcast-results').css('max-height', 'calc(100vh - 120px');
  }
}

// Displays the results for the podcast episodes found.
function displayPodcastResults(responseJson) {
  if (responseJson.results.length === 0) {
    $('.podcast-results').append(`
    <div class="no-results">No results found. Try again with a different search.</div>
    `);
  }

  for (let i = 0; i < responseJson.results.length; i++) {
  if (responseJson.results[i].description_original.length > 30) {
      $('.podcast-results').append(`
        <div class="podcast-card">
          <img src="${responseJson.results[i].image}" class="podcast-image"/>
          <h3 class="episode-title">${responseJson.results[i].title_original}</h3>
          <h4 class="podcast-title">${responseJson.results[i].podcast_title_original}</h4>
          <h5 class="podcast-publisher">${responseJson.results[i].publisher_original}</h5>
          <p class="podcast-description">${responseJson.results[i].description_original}</p>
          <p class="hidden full-description">${responseJson.results[i].description_original}</p>
          <p class="hidden idnum">${responseJson.results[i].id}</p>
          <p class="listen-notes-link hidden"><a href="${responseJson.results[i].listennotes_url}" target="_blank">View in ListenNotes</a></p>
        </div>
      `);
    }
  }

  // Truncates each description at 300 characters and adds '...'
  // to each.
  $('.podcast-description').each(function() {
      $(this).text(($(this).text().substring(0, 300)));
    });
  $('.podcast-description').append('...');

  showOnePodcast();
}

// Formats the query parameters as a string that can be added to the
// url
function formatQueryParams(params) {
  const QueryParams = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  return QueryParams.join('&');
}

// Formats the search query and calls the listennotes api to get
// podcasts.
function getPodcasts(query) {
  //search parameters: search for query, return episodes only, English, minimum length 10 minutes
  //genre ids for educational type podcasts only(Audio Drama, Health & Fitness, Business, News, Arts, Science, Education, Society & Culture, History, Technology, Documentary)
  const podcastParams = {
    q: query,
    type: 'episode',
    language: 'English',
    len_min: '10',
    genre_ids: '67,88,93,99,100,107,111,122,125,127,244'
  }

  const podcastQueryString = formatQueryParams(podcastParams);
  
  const url = podcastURL + '?' + podcastQueryString;

  const options = {
    headers: {
      'X-ListenAPI-Key': listenNotesKey
    }
  }

  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayPodcastResults(responseJson))
    .catch(error => {
      $('.js-error-message').html(`<p><i class="far fa-flushed"></i></p><p>Uh-oh, something went wrong: ${error.message}. Try reloading the page and repeating your request.</p>`);
      $('.js-error-message').addClass('error-style');
      $('.podcast-results').hide();
      $('.flex-parent').hide();
    });
}

// Listens for form submit, gets input value, and makes minor
// changes to UI to accommodate podcast results.
function watchForm() {
  $('.podcast-search').submit(event => {
    event.preventDefault();
    const searchTerm = $('.js-search-term').val();
    getPodcasts(searchTerm);
    $('.js-search-term').val('');
    $('body').css('background-image', 'none');
    $('.search-container').css('border-bottom','1px solid #C6DAC8');
    $('.subtitle').remove();
    $('.big-title').addClass('small-title');
    $('.main').removeClass('shorter-screen');

    // If you do another search, empties results and hides everything again
    $('.podcast-results, .js-error-message').empty();
    $('.podcast-player').addClass('hidden');
  }); 
}

// Slides user onboarding screen in and out.
function startUserOnboarding() {
  $('.search-container').on('click', '.start-onboarding', event => {
    $('.user-onboarding').removeClass('hidden').addClass('animated slideInLeft').one('animationend', function() {
      $(this).removeClass('animated slideInLeft');
    });
  });
  $('.user-onboarding').on('click', '.back-to-landing', event => {
    $('.user-onboarding').addClass('animated slideOutLeft').one('animationend', function() {
      $(this).removeClass('animated slideOutLeft').addClass('hidden');
    }); 
  });
}

// Runs when page is loaded.
function handlePage() {
  watchForm();
  startUserOnboarding();
}

$(handlePage);