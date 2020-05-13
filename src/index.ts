import {Stage} from "./phase/stage";
import {LoadingPhase} from "./phase/loadingPhase";
import {Channel} from "./channel";
import * as PIXI from "pixi.js";

import {LoginPhase} from "./phase/loginPhase";

import 'bootstrap/dist/css/bootstrap.min.css';
import {EventEmitterWrapper} from "./util/eventEmitterWrapper";

export const windowEventEmitter = new EventEmitterWrapper((event, emitter) => {
    window.addEventListener(event, data => {
        emitter.emit(event, data);
    });
});

// PIXI
export let app: PIXI.Application;
export let channel: Channel;

// Main
export const stage = new Stage("main");

async function loadResources() {
    return new Promise(
        (resolve, reject) =>
            PIXI.Loader.shared
                .add("cards", "images/cards.json")
                .add("avatars", "images/avatars.json")
                .add("bag", "images/bag.json")
                .add("pawns", "images/pawns.json")

                .add("modalities/classical", "modalities/classical.json")

                .load(resolve)
    );
}

async function wsConnect(url: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(url);

        socket.onopen = () => {
            console.log("Connection opened");
            resolve(socket);
        };

        socket.onclose = () => {
            console.error("Connection closed");
            reject();
        };
    });
}

(async function () {
    app = new PIXI.Application({resizeTo: window});
    // The app.view (canvas) is only appended when the game-phase starts.

    app.view.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    stage.setPhase(new LoadingPhase());

    await loadResources();

    const socket = await wsConnect(process.env.WS_URL);
    channel = new Channel(socket);

    stage.setPhase(new LoginPhase());
})();
