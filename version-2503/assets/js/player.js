(function () {
    window.initMoviePlayer = function (source) {
        var video = document.querySelector("[data-player-video]");
        var cover = document.querySelector("[data-player-cover]");
        var button = document.querySelector("[data-player-button]");
        var hls = null;
        var prepared = false;

        if (!video || !source) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = source;
            }
        }

        function start() {
            prepare();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!prepared) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
