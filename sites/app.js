$(function() {
    //HTML Elements
    var $messageArea = $('#messageArea');
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $userArea = $('#userArea');
    var $userForm = $('#userForm');
    var $username = $('#username');
    var $users = $('#users');
    var $firstChild
    var blackList = ['lars bischhausen', 'gibb', 'schalke', 'anal', 'anus', 'arse', 'ass', 'ass fuck', 'ass hole', 'assfucker', 'asshole', 'assshole', 'bastard', 'bitch', 'black cock', 'bloody hell', 'boong', 'cock', 'cockfucker', 'cocksuck', 'cocksucker', 'coon', 'coonnass', 'crap', 'cunt', 'cyberfuck', 'damn', 'darn', 'dick', 'dirty', 'douche', 'dummy', 'erect', 'erection', 'erotic', 'escort', 'fag', 'faggot', 'fuck', 'Fuck off', 'fuck you', 'fuckass', 'fuckhole', 'god damn', 'gook', 'hard core', 'hardcore', 'homoerotic', 'hore', 'lesbian', 'lesbians', 'mother fucker', 'motherfuck', 'motherfucker', 'negro', 'nigger', 'orgasim', 'orgasm', 'penis', 'penisfucker', 'piss', 'piss off', 'porn', 'porno', 'pornography', 'pussy', 'retard', 'sadist', 'sex', 'sexy', 'shit', 'slut', 'son of a bitch', 'suck', 'tits', 'viagra', 'whore', 'xxx']
    $messageForm.submit(function(e) {
        e.preventDefault();
        var isWordOnBlackList = false;
        for (var i = 0; i < blackList.length; i++) {
            if (blackList[i].toUpperCase() == $message.val().toUpperCase()) {
                isWordOnBlackList = true;
                break;
            }
        }
        socket.emit('send message', $message.val());
        $message.val('');
    })
    $userForm.submit(function(e) {
        e.preventDefault();
        var isWordOnBlackList = false;
        for (var i = 0; i < blackList.length; i++) {
            if (blackList[i].toUpperCase() == $username.val().toUpperCase()) {
                isWordOnBlackList = true;
                break;
            }
        }
        if (isWordOnBlackList == false) {
            socket.emit('new user', $username.val());
        }
        $username.val('');
    })
    socket.on('new message', function(data) {
        $chat.append('<div class="well"><strong>' + data.user + ': </strong>' + data.msg + '</div>');
    });
    socket.on('get users', function(data) {
        $userArea.hide();
        $messageArea.show();
        var html = '';
        for (i = 0; i < data.length; i++) {
            html += '<li class="list-group-item">' + data[i] + '</li>'
        }
        $users.html(html);
    });
});
//Connect the Socket
var socket = io.connect();
//Load the Youtube Player and make some basics Settings (disable controls, set the Video id and Stuff like that)
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//Global Variables for the Progress Bar
var player;
var counter;
var intervalId;
var time;
var vid = "";

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '480',
        width: '720',
        videoId: '',
        playerVars: {
            'controls': 0,
            'disablekb': 1,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'fs': 1,
            'modestbranding': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

//Enable Basic Functionalities when the Page is ready
function onPlayerReady(event) {
    //Listener for the Fullscreenmode
    document.addEventListener('fullscreenchange', exitHandler);
    document.addEventListener('webkitfullscreenchange', exitHandler);
    document.addEventListener('mozfullscreenchange', exitHandler);
    document.addEventListener('MSFullscreenChange', exitHandler);
    //Update Max Value Progressbar
    time = player.getDuration();
    updateMaxValueProgressbar()
    //Set event listener if Progressbar get clicked
    document.getElementById('playerControlProgress').addEventListener('click', function(e) {
        stopProgressBar();
        //Get the x of the click and divide it with the length of the whole element. Then multipli it with the timebar
        counter = ((e.x - $(this).offset().left) / $(this).width()) * time;
        socket.emit('start video socket', counter);
        runProgressBar();
        player.seekTo(counter);
        player.playVideo();
    });
    //Play the Video
    socket.emit('start video socket', 0);
    event.target.playVideo();
}

//Listen to Youtube Playerevents and handle those requests
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PAUSED) {
        $("#playButton").attr("disabled", false);
        $("#stopButton").attr("disabled", true);
        stopProgressBar();
    } else if (event.data == YT.PlayerState.PLAYING) {
        $("#playButton").attr("disabled", true);
        $("#stopButton").attr("disabled", false);
        stopProgressBar();
        if (player.getDuration() != time) {
            time = player.getDuration();
            updateMaxValueProgressbar()
        }
        runProgressBar();
    } else if (event.data == YT.PlayerState.ENDED) {
        counter = 0;
        $("#playButton").attr("disabled", false);
        $("#stopButton").attr("disabled", true);
        stopProgressBar();
        player.stopVideo();
    }
}

//Button click event which starts the video
$("#playButton").click(function() {
    socket.emit('start video socket', counter);
    player.playVideo();
});

//Button click event which stops the video
$("#stopButton").click(function() {
    socket.emit('stop video socket');
    player.pauseVideo();
});

//Fullscreen
$("#fullscreenButton").click(function() {
    player.setSize(1920, 1080);
    var e = document.getElementById("video-wrapper");
    if (e.requestFullscreen) {
        e.requestFullscreen();
    } else if (e.webkitRequestFullscreen) {
        e.webkitRequestFullscreen();
    } else if (e.mozRequestFullScreen) {
        e.mozRequestFullScreen();
    } else if (e.msRequestFullscreen) {
        e.msRequestFullscreen();
    }
});

//Function to run the Progress Bar
function runProgressBar() {
    intervalId = setInterval(function() {
        counter += 1;
        updateProgressBar();
    }, 1000);
}

//Function to update the Progressbar
function updateProgressBar() {
    calculatedCounter = calculateProzent().toString() + '%';
    $('#playerControlProgressBar').attr('aria-valuenow', calculatedCounter).css('width', calculatedCounter);
}

//Function to stop the Progress Bar
function stopProgressBar() {
    clearInterval(intervalId);
}

//Function to exit the Fullscreen View
function exitHandler() {
    if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        player.setSize(720, 480);
    }
}

//Function to update the Max Value of the Progressbar
function updateMaxValueProgressbar() {
    $('#playerControlProgressBar').attr('aria-valuemax', time);
}

/*
 *
 * Callback Functions
 *
 */

socket.on('start video', function(data) {
    counter = data;
    player.seekTo(counter);
    player.playVideo();
})

socket.on('stop video', function() {
    player.pauseVideo();
});

socket.on('change video', function(vid) {
    player.loadVideoById(vid);
});

socket.on('sync video', function(vid, counter) {
    player.loadVideoById(vid, counter);
    updateProgressBar();
    this.vid = vid;
    this.counter = counter;
});

/*
 *
 * Math Functions
 *
 */

//Calculate Prozent
function calculateProzent() {
    return (counter / time) * 100;
}

/*
 *
 * Form Functions
 *
 */

//Elements
var $searchForm = $('#searchForm');
var $searchValue = $('#searchValue');
var $syncForm = $('#syncForm')

//Search a new Video
$searchForm.submit(function(e) {
    e.preventDefault();
    if (checkYoutubeLink($searchValue.val()) != false) {
        vid = getYoutubeId($searchValue.val());
        if (vid != $searchValue.val()) {
            socket.emit('change video socket', vid);
        }
    }
});

//Synchronise the videos of al Members of the Session
$syncForm.submit(function(e) {
    e.preventDefault();
    socket.emit('sync video socket', vid, counter);
});

//Check if its an valid youtube link
function checkYoutubeLink(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return (url.match(p)) ? true : false;
}

//Get the VideoId out of an Youtube Link
function getYoutubeId(url) {
    var ID = '';
    url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    } else {
        ID = url;
    }
    return ID;
}
