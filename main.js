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
    $('.selected-podcast').on('click', '.go-back', function(event) {
        $('.wikipedia').hide();
        $('.podcast-player').hide();
        $('.selected-results').hide();
        $('.podcast-description').removeClass('hidden');
        $('.full-description').addClass('hidden');
        $('.wiki-list').empty();
        $('.podcast-results').show();
        $('.js-selected').removeClass('js-selected');
        $('.go-back').hide();
    })

    showOnePodcast();
}

// function searchWikipedia() {
//     $('.wiki-results').on('click', '')
// }

//since Dandelion API will sometimes return duplicate objects in the results, this filters out all the duplicates and returns an array containing only unique objects
function removeDuplicates(myArr, prop) {
    return myArr.filter((obj, ind, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === ind;
    });
  }

function displayDandelionResults(responseJson) {
    console.log('responseJson:');
    console.log(responseJson);
    

    $('.wiki-results').show();

    let arrayOfUniqueResults = removeDuplicates(responseJson.annotations, "label");
    console.log('unique object')
    console.log(arrayOfUniqueResults);
    


    // const arrayOfTitles = [];
    // for (let i = 0; i < responseJson.annotations.length; i++) {
    //     arrayOfTitles.push(responseJson.annotations[i].title);
    // }
    // const arrayOfUniqueTitles = Array.from(new Set(arrayOfTitles));

    // for (let i = 0; i < arrayOfUniqueTitles.length; i++) {
    //     $('.wiki-list').append(`
    //         <li><p><a href="https://en.m.wikipedia.org/wiki/${arrayOfUniqueTitles[i]}" target="wiki_iframe">${arrayOfUniqueTitles[i]}</a></p><p>GAH</p></li>
    //     `);
    // }


    for (let i = 0; i < arrayOfUniqueResults.length; i++) {
        $('.wiki-list').append(`
            <li><p><a href="https://en.m.wikipedia.org/wiki/${arrayOfUniqueResults[i].title}" target="wiki_iframe">${arrayOfUniqueResults[i].title}</a></p><p class="abstract">${arrayOfUniqueResults[i].abstract}</p></li>
        `);
    }

    $('.abstract').each(function(x) {
        $(this).text(($(this).text().substring(0, 300)));
      });
    $('.abstract').append('...');

    $('.wiki-results').append(`<p><a href="https://m.wikipedia.org" target="wiki_iframe">Search Wikipedia <i class="fas fa-search"></i></a></p>`);

    $('.wiki-results').on('click', 'li', function(event) {
        $('.wikipedia').show();
    })

    $('wiki-results').on('click', 'p', function(event) {
        $('.wikipedia').show();
    })

    backButton();
    // searchWikipedia();
}

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
    console.log(url);

    fetch(url)
        .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
        })
        .then(responseJson => displayDandelionResults(responseJson))
        .catch(error => {
            $('.js-error-message').html(`<p><i class="far fa-flushed"></i></p><p>Uh-oh, something went wrong: ${error.message}</p>`);
        });
}

function showOnePodcast() {
    $('.podcast-results').one('click', '.podcast-card', function(event) {
        $(this).addClass('js-selected');
        const selectedPodcastHTML = $('.js-selected').html();
        $('.podcast-info').html(selectedPodcastHTML);
        $('.podcast-description').addClass('hidden');
        $('.full-description').removeClass('hidden');
        $('.podcast-results').hide();
        $('.selected-podcast').show();
        $('.wiki-results').hide();

        $('.go-back').show();

        //empties out list of wikipedia links
        $('.wiki-list').empty();

        //passes description to getEntities function to search for key phrases
        const selectedDescription = $('.js-selected > .full-description').text();
        getEntities(selectedDescription);

        //takes idnum from hidden p above and inserts it into embedded player
        const selectedIDNum = $('.js-selected > .idnum').text();
        const playerURL = 'https://www.listennotes.com/embedded/e/' + selectedIDNum + '/';
        $('.player').attr("src",playerURL);
        $('.podcast-player').show();
    })  
}

function displayPodcastResults(responseJson) {
    $('.podcast-results').show();

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
                    <p class="hidden"><a href="${responseJson.results[i].listennotes_url}" target="_blank">View in ListenNotes</a></p>
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
            $('.js-error-message').html(`<p><i class="far fa-flushed"></i></p><p>Uh-oh, something went wrong: ${error.message}</p>`);
        });
}

// listen for form submit, get input value
function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('.js-search-term').val();
        getPodcasts(searchTerm);
        $('body').css("background-image", "none");
        $('.subtitle').remove();
        $('.big-title').addClass('small-title')

        //if you do another search, empties results and hides everything again
        $('.js-results-container').empty();
        $('.wiki-list').empty();
        $('.wiki-results').hide();
        $('.podcast-player').hide();
        $('.wikipedia').hide();
    }); 
}

//hides results containers
function handlePage() {
    $('.wiki-results').hide();
    $('.wikipedia').hide();
    $('.podcast-player').hide();
    $('.podcast-results').hide();
    $('.selected-podcast').hide();
    watchForm();
}

$(handlePage);