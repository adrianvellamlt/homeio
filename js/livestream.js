const namespace = "stream-1921681103-2x2";

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
};

const connect = () => {
    socket = io.connect(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/${namespace}`);

    socket.on("connect", () => {
        isConnected = true;
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

    if (socket !== undefined) socket.disconnect();
};

const refresh = () => {
    teardown();
    setTimeout(() => connect(), 5000);
};

connect();

new ResizeSensor(document.getElementsByClassName("container-fluid")[0], () => resizeCanvas());