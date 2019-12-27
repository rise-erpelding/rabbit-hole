'use strict';

const podcastURL = 'https://listen-api.listennotes.com/api/v2/search';
const textEntitiesURL = 'https://api.dandelion.eu/datatxt/nex/v1/';

const listenNotesKey = config.PODCAST_KEY;
const dandelionKey = config.TEXT_WIKI_KEY;

// function windowScrollMobile() {
//     $(window).scroll(event => {
//         const scrollPosition = $(window).scrollTop();
//         if (scrollPosition === 0) {
//             $('.mobile-back-to-results, .selected-podcast, .wikipedia').addClass('hidden');
//             $('.podcast-results, .search-container').removeClass('hidden-mobile');
//             $('.flex-parent').css('top', '110px');
//             $('.flex-parent').css('margin-bottom', '0px');
//             $('.results-navigation').css('top', '80px');
//         } else if (scrollPosition > 0) {
//             // scrollToTop();
//             // $('.mobile-back-to-selected-podcast').removeClass('hidden');
//             // $('.mobile-back-to-results').addClass('hidden');
//         }
//     })
//     console.log('`windowScrollMobile` ran');
// }

// function scrollToTop() {
//     $('.mobile-scroll-up').removeClass('hidden');
//     $('.results-navigation').on('click', '.mobile-scroll-up', event => {
//         $(window).scrollTop(0);
//         $('.mobile-back-to-results, .selected-podcast, .wikipedia').addClass('hidden');
//         $('.podcast-results, .search-container').removeClass('hidden-mobile');
//         $('.flex-parent').css('top', '110px');
//         $('.flex-parent').css('margin-bottom', '0px');
//         $('.results-navigation').css('top', '80px');
//     })

// }

// function exitError() {
//     $('.results-navigation').on('click', '.exit-error', event => {
//         $('.js-error-message').empty();
//     })
//     console.log('`exitError` ran');
// }

// function mobileBackToResults() {
//     $('.results-navigation').on('click', '.mobile-back-to-results', event => {
//         $(window).scrollTop(0);
//         $('.mobile-back-to-results, .selected-podcast, .wikipedia').addClass('hidden');
//         $('.podcast-results, .search-container').removeClass('hidden-mobile');
//         $('.flex-parent').css('top', '110px');
//         $('.flex-parent').css('margin-bottom', '0px');
//         $('.results-navigation').css('top', '80px');
//     });

//     // fillSelectedPodcast();

//     console.log('`mobileBackToResults` ran');
// }

// function desktopBackToResults() {
//     $('.results-navigation').on('click', '.desktop-back-to-results', event => {
//         $('.podcast-results').removeClass('hidden');
//         $('.selected-podcast, .wikipedia, .desktop-back-to-results').addClass('hidden');
//     });

//     console.log('`desktopBackToResults` ran');
// }

// function mobileBackToSelectedPodcast() {
//     $('.results-navigation').on('click', '.mobile-back-to-selected-podcast', event => {
//         // $(window).scrollTop(0);
//         $('.mobile-back-to-selected-podcast').addClass('hidden');
//         $('.mobile-back-to-results').removeClass('hidden');
//     });
//     console.log('`mobileBackToSelectedPodcast` ran');
// }


function showWikipedia() {
    $('.wiki-results').on('click', 'a', () => {
        console.log('It should be showing wikipedia now');
        $('.wikipedia').removeClass('hidden');
        // $('.podcast-results, .mobile-back-to-results').addClass('hidden');
        const selectedPodcastHeight = $('.selected-podcast').height() + 20;
        //TODO: add px units here
        $('html, body').animate({scrollTop: selectedPodcastHeight});
        // $('.wikipedia, .mobile-back-to-selected-podcast, .desktop-back-to-results').removeClass('hidden');
        // $('.selected-podcast').hide();
    });

    // windowScrollMobile();
    // mobileBackToSelectedPodcast();
    // desktopBackToResults();
    console.log('`showWikipedia` ran');
}

//since Dandelion API will sometimes return duplicate objects in the results, this filters out all the duplicates and returns an array containing only unique objects
function removeDuplicates(myArr, prop) {
    console.log('`removeDuplicates` ran');
    return myArr.filter((obj, ind, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === ind;
    });
  }

//renders the results from calling the dandelion API, displays links to related Wikipedia articles
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

    console.log('`displayDandelionResults` ran');
}

//takes description from selected podcast and calls dandelion API
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
            $('.exit-error').removeClass('.hidden');
        });
        console.log('`getEntities` ran');
}

function showSelectedPodcast() {

    $('.selected-podcast, .mobile-back-to-results').removeClass('hidden');
    $('.podcast-player').removeClass('hidden');
    $('.search-container').addClass('hidden-mobile');
    $('.flex-parent').css('top', '0px');
    $('.flex-parent').css('margin-bottom', '110px');
    $('.results-navigation').css('top', '10px');
    const resultsHeight = $('.podcast-results').height() + 20;
    //TODO: add px units here
    $('html, body').animate({scrollTop: resultsHeight});

    // windowScrollMobile();
    // const element = $('.selected-podcast');
    // const selectedTop = $('.selected-podcast').offset().top;
    // console.log(selectedTop);
    // $('html, body').animate({scrollTop: selectedTop});
    //using 240 because it is 120 + 120 (.search-container height doubled)

    // fillSelectedPodcast();
    // mobileBackToResults();

    console.log('`showSelectedPodcast` ran');

}

//shows a single selected podcast with more detailed information and podcast player
function fillSelectedPodcast() {
    $('.podcast-results').one('click', '.podcast-card', function(event) {
        // $('.podcast-info, .wiki-list').empty();
        $(this).addClass('js-selected');
        const selectedPodcastHTML = $('.js-selected').html();
        $('.podcast-info').html(selectedPodcastHTML);
        $('.podcast-info > .podcast-description').addClass('hidden');
        $('.podcast-info > .full-description').removeClass('hidden');
        $('.podcast-info > .listen-notes-link').removeClass('hidden');



        //takes idnum from hidden p above and inserts it into embedded player
        const selectedIDNum = $('.podcast-info > .idnum').text();
        const playerURL = 'https://www.listennotes.com/embedded/e/' + selectedIDNum + '/';
        // console.log(playerURL);
        $('.player').attr('src',playerURL);
        const playerHTML = $('.podcast-player').html();
        // console.log(playerHTML);
        // $('.player').removeAttr('srcdoc');

        showSelectedPodcast();

        // $('.full-description, .listen-notes-link, .selected-podcast, .podcast-player').removeClass('hidden');
        // $('.podcast-results, .search-container').hide();
        // $('.main').addClass('shorter-screen');

        //passes description to getEntities function to search for key phrases
        let selectedDescription = $('.js-selected > .full-description').text();
        if (selectedDescription.length > 2000) {
            selectedDescription = selectedDescription.substring(0, 2000);
        }
        $('.js-selected').removeClass('js-selected');
        getEntities(selectedDescription);


    })  
    console.log('`fillSelectedPodcast` ran');
}

//displays the results for the podcast episodes found
function displayPodcastResults(responseJson) {
    $('.podcast-results').removeClass('hidden');

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

    //truncates each description at 300 characters and adds '...' to each
    $('.podcast-description').each(function() {
        $(this).text(($(this).text().substring(0, 300)));
      });
    $('.podcast-description').append('...');

    console.log('`displayPodcastResults` ran');
    fillSelectedPodcast(); 
    //test before turning in: change the name of this function to anything else to make an error message show up
}

//formats the query parameters as a string that can be added to the url
function formatQueryParams(params) {
    const QueryParams = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    console.log('`formatQueryParams` ran');
    return QueryParams.join('&');
}

//formats the search query and calls the listennotes api to get podcasts
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
            $('.exit-error').removeClass('.hidden');
        });
        console.log('`getPodcasts` ran');
}

// listen for form submit, get input value
function watchForm() {
    $('.podcast-search').submit(event => {
        event.preventDefault();
        const searchTerm = $('.js-search-term').val();
        getPodcasts(searchTerm);
        $('.js-search-term').val('');
        $('body').css('background-image', 'none');
        $('.search-container').css('top', '0');
        $('.subtitle, .logos, .start-onboarding').remove();
        $('.big-title').addClass('small-title');
        // $('.main').removeClass('shorter-screen');

        //if you do another search, empties results and hides everything again
        $('.podcast-results, .js-error-message').empty();
        $('.podcast-player').addClass('hidden');
    }); 
    console.log('`watchForm` ran');
}

// slides user onboarding screen in and out
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
    console.log('`startUserOnboarding` ran');
}

function handlePage() {
    watchForm();
    startUserOnboarding();
}

$(handlePage);