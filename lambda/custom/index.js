// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const Room = require('./json/Room.json');

const errorStrNotFound = "NOT_FOUND";
const successStrMatch = "ER_SUCCESS_MATCH";
const outputError = "すみません、わかりませんでした。";
const speakOutputNotFound = "のレシピを見つけられませんでした。";

function checkRoomName(inputRoomName) {
    for (let key in Room) {
        if (inputRoomName === Room[key]["room"]) {
            return [true, key];
        }
    }
    return [false, 0];
}

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
        const speakOutput = 'ドラゴンクエストビルダーズのビルダーのしょを開きました。どの部屋のレシピを知りたいですか？';
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
        let speakOutput = outputError;

        try {
            const roomSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'room');
            const roomValue = roomSlot['value'];
            const resolution = roomSlot['resolutions']['resolutionsPerAuthority'][0];
            const resolutionStatusCode = resolution['status']['code'];

            if (resolutionStatusCode === successStrMatch) {
                const resolutionRoomName = resolution['values'][0]['value']['name'];
                let isRoomExist = checkRoomName(resolutionRoomName);
                speakOutput = `${resolutionRoomName}`;

                if (isRoomExist[0]) {
                    const recipe = getRecipeByName(resolutionRoomName, isRoomExist[1]);
                    if (recipe !== errorStrNotFound) speakOutput = `${speakOutput}のレシピは次の通りです。\n${recipe}`;
                } else {
                    speakOutput = `${speakOutput}${speakOutputNotFound}`;
                }
            } else {
                speakOutput = `${roomValue}${speakOutputNotFound}`;
            }
        } catch (error) {
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
        const speakOutput = 'You can say hello to me! How can I help?';

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
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

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
