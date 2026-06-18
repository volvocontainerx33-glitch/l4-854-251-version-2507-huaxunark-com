(function () {
  function setupPlayer(player) {
    const video = player.querySelector('video');
    const cover = player.querySelector('.player-cover');
    const button = player.querySelector('.player-button');

    if (!video || !cover || !button) {
      return;
    }

    const streamUrl = video.getAttribute('data-hls');
    let streamBound = false;
    let hlsInstance = null;

    function bindStream() {
      if (streamBound || !streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      streamBound = true;
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      bindStream();
      cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');

      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    button.addEventListener('click', startPlayback);
    cover.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('.video-player').forEach(setupPlayer);
})();
