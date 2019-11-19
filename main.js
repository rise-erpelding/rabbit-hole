//TODO:
//edge case: mac and cheese/mac cheese Gastropod podcast
//Japanese food = Splendid Table? Not bringing up Japan

'use strict';

const podcastURL = 'https://listen-api.listennotes.com/api/v2/search';
const textEntitiesURL = 'https://api.dandelion.eu/datatxt/nex/v1/';

const listenNotesKey = config.PODCAST_KEY;
const dandelionKey = config.TEXT_WIKI_KEY;



//when you click on back, hides wikipedia and podcast player, goes back to all short descriptions from search results
function backButton() {
    $('.results-left').on('click', '.go-back', function(event) {
        $('.results-right').hide();
        $('.podcast-player').hide();
        $('.wiki-results').hide();
        $('.podcast-description').removeClass('hidden');
        $('.full-description').addClass('hidden');
        $('.podcast-box').show().addClass('js-selected');
        $('.go-back').hide();
    })

    showOnePodcast();
}

function displayDandelionResults(responseJson) {
    $('.wiki-results').show();

    //creates array from titles of responseJson
    const arrayOfTitles = [];
    for (let i = 0; i < responseJson.annotations.length; i++) {
        arrayOfTitles.push(responseJson.annotations[i].title);
    }

    //create new array of unique titles
    const arrayOfUniqueTitles = Array.from(new Set(arrayOfTitles));

    for (let i = 0; i < arrayOfUniqueTitles.length; i++) {
        $('.wiki-list').append(`
            <li><a href="https://en.m.wikipedia.org/wiki/${arrayOfUniqueTitles[i]}" target="wiki_iframe">${arrayOfUniqueTitles[i]}</a></li>
        `);
    }

    $('.wiki-list').append(`
        <li class="search-link"><a href="https://m.wikipedia.org/" target="wiki_iframe">Search Wikipedia</a></li>
    `);

    $('.wiki-results').on('click', 'li', function(event) {
        $('.results-right').show();
    })

    backButton();
}

function getEntities(description) {
    const dandelionParams = {
        token: dandelionKey,
        lang: 'en',
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
            $('#js-error-message').text(`Something went wrong: ${error.message}`);
        });
}

function showOnePodcast() {
    $('.js-results-container').one('click', 'div', function(event) {
        //hides everything but clicked div
        $('.podcast-box').not(this).hide().removeClass('js-selected');
        //hides truncated description and shows full description
        $('.podcast-description').addClass('hidden');
        $('.full-description').removeClass('hidden');

        //displays back button
        $('.go-back').show();

        //empties out list of wikipedia links
        $('.wiki-list').empty();

        //passes description to getEntities function to search for key phrases
        const selectedDescription = $('.js-selected > .full-description').text();
        getEntities(selectedDescription);

        //takes idnum from hidden p above and inserts it into embedded player
        const selectedIDNum = $('.js-selected > .idnum').text();
        const playerURL = 'https://www.listennotes.com/embedded/e/' + selectedIDNum + '/';
        $('.podcast-player').attr("src",playerURL);
        $('.podcast-player').show();
    })  
}

function displayPodcastResults(responseJson) {
    $('.js-results-container').show();

    for (let i = 0; i < responseJson.results.length; i++) {
        if (responseJson.results[i].description_original.length > 30) {
            $('.js-results-container').append(`
                <div class="podcast-box js-selected">
                    <img src="${responseJson.results[i].image}" class="podcast-image"/>
                    <h3 class="podcast-title"><a href="${responseJson.results[i].listennotes_url}" target="_blank">${responseJson.results[i].title_original}</a></h3>
                    <h4 class="podcast-title">${responseJson.results[i].podcast_title_original}</h4>
                    <h5 class="podcast-title">${responseJson.results[i].publisher_original}</h5>
                    <p class="podcast-description">${responseJson.results[i].description_original}</p>
                    <p class="hidden full-description">${responseJson.results[i].description_original}</p>
                    <p class="hidden idnum">${responseJson.results[i].id}</p>
                </div>
            `);
        }
    }

    //truncates each description at 300 characters and adds '...' to each
    $(".podcast-description").each(function(x) {
        $(this).text(($(this).text().substring(0, 300)));
      });
    $('.podcast-description').append('...');

    showOnePodcast();
}

//formats the query parameters as a string that can be added to the url
function formatQueryParams(params) {
    const QueryParams = Object.keys(params).map(key => `${key}=${params[key]}`);
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
            $('#js-error-message').text(`Something went wrong: ${error.message}`);
        });
}

// listen for form submit, get input value
function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('.js-search-term').val();
        getPodcasts(searchTerm);

        //if you do another search, empties results and hides everything again
        $('.js-results-container').empty();
        $('.wiki-list').empty();
        $('.wiki-results').hide();
        $('.podcast-player').hide();
        $('.results-right').hide();
    }); 
}

//hides results containers
function handlePage() {
    $('.wiki-results').hide();
    $('.results-right').hide();
    $('.podcast-player').hide();
    $('.js-results-container').hide();
    $('.go-back').hide();
    watchForm();
}

$(handlePage);