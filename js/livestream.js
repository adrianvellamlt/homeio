window.onload = function () {
    let identifier = undefined;

    let socket = undefined;
    let isConnected = false;

    let canvas = undefined;
    let context = undefined;
    let canvasAspectRatio = 0;

    let navbarHeight = 0;
    let footerHeight = 0;

    const setNavFootHeight = () => {
        const navbar = document.getElementsByClassName("navbar")[0];
        const navbarComputedStyles = window.getComputedStyle(navbar);
        navbarHeight = navbar.offsetHeight + 
            parseInt(navbarComputedStyles.getPropertyValue("margin-bottom")) + 
            parseInt(navbarComputedStyles.getPropertyValue("margin-bottom"));

        footerHeight = document.getElementsByClassName("sticky-footer")[0].offsetHeight;
    };

    const resizeCanvas = () => {
        const title = document.querySelector(".container-fluid h1");
        if (title !== null) title.parentNode.remove();
        setNavFootHeight();

        const container = document.getElementsByClassName("container-fluid")[0];
        const containerComputedStyle = window.getComputedStyle(container);

        const canvasHeight = window.innerHeight - navbarHeight - footerHeight;
        const canvasWidth = container.offsetWidth - 
            parseInt(containerComputedStyle.getPropertyValue("padding-left")) -
            parseInt(containerComputedStyle.getPropertyValue("padding-right"));

        if (canvas !== undefined)
        {
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            canvasAspectRatio = canvas.width / canvas.height;
        }
    };

    const draw = (frame) => {
        if (context !== undefined && canvas !== undefined)
        {
            const image = new Image();

            image.onload = () => {
                // draw background
                context.fillStyle = "black";
                context.fillRect(0, 0, canvas.width, canvas.height);

                const imageAspectRatio = image.width / image.height;
                let drawHeight, drawWidth, drawX, drawY;

                if (imageAspectRatio < canvasAspectRatio)
                {
                    drawHeight = canvas.height;
                    drawWidth = image.width * (drawHeight / image.height);
                    drawX = (canvas.width - drawWidth) / 2;
                    drawY = 0;
                }
                else if (imageAspectRatio > canvasAspectRatio)
                {
                    drawWidth = canvas.width;
                    drawHeight = image.height * (drawWidth / image.width);
                    drawX = 0;
                    drawY = (canvas.height - drawHeight) / 2;
                }
                else {
                    drawHeight = canvas.height;
                    drawWidth = canvas.width;
                    drawX = 0;
                    drawY = 0;
                }

                context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

                context.font = "100px Arial";
                context.fillStyle = "#e74a3b";
                context.fillText("•", 10, 60);
                context.font = "36px Arial";
                context.fillText("LIVE", 50, 38);
            };
            image.src = frame;
        }
    };

    const connect = (id) => {
        if (id !== undefined) identifier = id;

        socket = io.connect(
            `${window.location.protocol}//${window.location.hostname}:${window.location.port}/${identifier}`,
        {
            transports: ['websocket']
        });

        socket.on("connect", () => {
            isConnected = true;
            console.log("Connected!");

            canvas = document.getElementById("video-stream");
            context = canvas.getContext("2d");
            if (navbarHeight === 0 && footerHeight === 0) resizeCanvas();
        });

        setup();
    };

    const setup = () => {
        socket.removeListener("frame");
        socket.removeListener("connect_error");
        socket.removeListener("connect_timeout");
        socket.removeListener("error");
        socket.removeListener("disconnect");

        socket.on("frame", frame => {
            if (isConnected === true) draw(frame);
        });
        socket.on("connect_error", (err) => {
            refresh();
            console.log("FRAME_STREAM:Connect error");
        });
        socket.on("connect_timeout", (err) => {
            refresh();
            console.log("FRAME_STREAM:Connect timed out");
        });
        socket.on("error", (err) => {
            refresh();
            console.log("FRAME_STREAM:Unhandled error");
        });
        socket.on("disconnect", (err) => {
            refresh();
            console.log("FRAME_STREAM:Disconnected");
        });
    };

    const teardown = () => {
        isConnected = false;

        canvas = undefined;
        context = undefined;

        if (socket !== undefined) socket.disconnect(true);
    };

    const refresh = () => {
        teardown();
        setTimeout(() => connect(), 5000);
    };

    const subscribeToStream = (streamSelection) => {
        fetch("/api/stream/subscribe", {
            method: "POST",
            body: JSON.stringify({
                "cam-ips": streamSelection.streams,
                "grid-x": streamSelection.gridX,
                "grid-y": streamSelection.gridY
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.clone().text())
        .then(response => connect(response))
        .catch(error => console.log("API_ERROR: COULD NOT SUBSCRIBE TO STREAM", error.message));
    }

    const getStreamSelection = () => {
        return {
            streams: Array.from(document.querySelectorAll("#liveSettings #stream-selection option:checked")).map(elem => elem.value),
            gridX: parseInt(document.querySelector("#liveSettings #grid-shape-x").value),
            gridY: parseInt(document.querySelector("#liveSettings #grid-shape-y").value)
        };
    };

    const subscribeToDifferentStream = () => {
        const streamSelection = getStreamSelection();

        console.log("Unsubscribing ...");

        fetch("/api/stream/unsubscribe", { method: "POST" })
        .then(response => {
            if (response.status === 200)
            {
                console.log("Tearing down ...");
                teardown();
                console.log("Subscribing ...");
                subscribeToStream(getStreamSelection());
            }
            else console.log("API_ERROR: COULD NOT UNSUBSCRIBE FROM STREAM");
        });    
    }

    const setupEvents = () => {
        window.addEventListener('beforeunload', (event) => {
            event.preventDefault();
            
            navigator.sendBeacon("/api/stream/unsubscribe");

            return;
        });

        new ResizeSensor(document.getElementsByClassName("container-fluid")[0], () => resizeCanvas());
    };

    subscribeToStream(getStreamSelection());
    setupEvents();

    document.getElementsByClassName("active")[0].classList.remove("active");

    const form = document.getElementById("liveSettings");
    const pristine = new Pristine(form);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const valid = pristine.validate();
        if (valid){
            subscribeToDifferentStream();
        }
    });

    Array.from(document.getElementsByClassName("nav-link"))
        .filter(element => element.getAttribute("href") == "live")[0]
        .parentNode.classList.add("active");
}