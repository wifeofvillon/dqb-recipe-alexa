// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const Room = require('./json/Room.json');

// status code
// TODO: find in ask-sdk-core
const errorStrNotFound = "NOT_FOUND";
const successStrMatch = "ER_SUCCESS_MATCH";

// speakOutput
const speakOutputNotFound = "のレシピを見つけられませんでした。";
const speakOutputFailedListen = "すみません、わかりませんでした。";
const speakOutputError = `${speakOutputFailedListen}もう一度試してみてください。`;
const speakOutputLaunch = "ドラゴンクエストビルダーズのビルダーのしょを開きました。どの部屋のレシピを知りたいですか？";
const speakOutputHelp = "レシピを知りたい部屋の名前を教えてください。必要なアイテムの種類と数をお知らせします。";

/**
 * Room.jsonに部屋レシピが存在するか確認する
 *
 * @param {String} inputRoomName 部屋の名前
 * @return {Array}
 * @return {Boolean} return[0] - レシピの存在確認
 * @return {Number} return[1] - レシピが存在する行
 */
function checkRoomName(inputRoomName) {
    for (let key in Room) {
        if (inputRoomName === Room[key]["room"]) {
            return [true, key];
        }
    }
    return [false, 0];
}

/**
 * 部屋の名前から部屋レシピを探す
 *
 * @param {String} resolutionRoomName 解決済みの部屋の名前
 * @param {Number} key 部屋レシピが存在する行(checkRoomNameで取得できる)
 * @return {String} recipe Room[]['recipe']
 */
function getRecipeByName(resolutionRoomName, key) {
    if (resolutionRoomName === Room[key]['room']) {
        return Room[key]['recipe'];
    } else {
        for (let room of Room) {
            if (resolutionRoomName === room['room']) return room['recipe'];
        }
    }
    return errorStrNotFound;
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = speakOutputLaunch;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const RoomIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RoomIntent';
    },
    handle(handlerInput) {
        let speakOutput;

        try {
            // STTの揺れが多いのでgetSlotValueを使わずにvalueを取得する
            const roomSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'room');
            const roomValue = roomSlot['value'];
            const resolution = roomSlot['resolutions']['resolutionsPerAuthority'][0];
            const resolutionStatusCode = resolution['status']['code'];

            if (resolutionStatusCode === successStrMatch) {
                // 部屋名を解決できた場合
                const resolutionRoomName = resolution['values'][0]['value']['name'];
                let isRoomExist = checkRoomName(resolutionRoomName);
                speakOutput = `${resolutionRoomName}`;

                if (isRoomExist[0]) {
                    // 部屋レシピの存在が確認できた場合
                    const recipe = getRecipeByName(resolutionRoomName, isRoomExist[1]);
                    if (recipe !== errorStrNotFound) speakOutput = `${speakOutput}のレシピは次の通りです。\n${recipe}`;
                } else {
                    // 部屋レシピの存在が確認できなかった場合
                    speakOutput = `${speakOutput}${speakOutputNotFound}`;
                }
            } else {
                // 部屋名を解決できなかった場合
                speakOutput = `${roomValue}${speakOutputNotFound}`;
            }
        } catch (error) {
            speakOutput = speakOutputError;
            console.error(error);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
}
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = speakOutputHelp;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = speakOutputError;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        RoomIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
